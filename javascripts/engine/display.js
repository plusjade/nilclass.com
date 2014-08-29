// Display a <Graph> using d3.
NIL.Display = (function() {
    var config = { duration : 500 };

    function nodes(svgContainer, _nodes) {
        // Update the nodes
        var node = svgContainer.selectAll("g.node")
            .data(_nodes, function(d) { return d._id });

        var nodeEnter = node.enter().append("svg:g")
            .attr('class', function(d){ return 'node ' + d.icon })
            .attr("transform", function(d) {
                return "translate(" + (d.x0 || 0) + "," + (d.y0 || 0) + ")";
            })

        nodeEnter.call(NIL.Style.icon);

        nodeEnter
            .filter(function(d) { return !!d.text })
            .call(NIL.Style.text)

        nodeEnter.call(NIL.Style.labels);

        // Transition nodes to their new position.
        var nodeUpdate = node.transition()
            .duration(config.duration)
            .attr("transform", function(d) {
                return "translate(" + d.x + "," + d.y + ")";
            });

        nodeUpdate.select("text")
            .style("fill-opacity", 1);


        node.exit().remove();

        return node;
    }

    function nodeOverlays(svgContainer, graph) {
        var types = ['focus', 'crossOut', "disable"];
        var nodes = svgContainer.selectAll("g.node");

        types.forEach(function(type) {
            nodes
                .data(graph.metaItems(type), function(d) { return d._id })
                .call(NIL.Style[type]);
        })
    }

    // Update link connections between items.
    // @param[Array] linkData - formated linkData for d3.
    // @param[String] namespace - used to preserve grouping and uniqueness.
    function connectionLinks(svgContainer, linkData, namespace) {
        var diagonal = d3.svg.diagonal().projection(function(d) { return [d.x, d.y]; });
        var classname = 'link-' + namespace;
        // Update the links.
        var link = svgContainer.selectAll("path." + classname)
            .data(linkData, function(d) { return d.source._id + '.' + d.target._id; });

        // Enter any new links at the parent's previous position.
        var linkEnter = link.enter().insert("svg:path", "g")
            .style('stroke-opacity', 0)
            .attr("class", function(d) {
                return (d.source.public && d.target.public)
                            ? classname + ' public'
                            : classname;
            })
            .attr("d", diagonal);

        link.transition()
            .duration(config.duration)
                .style('stroke-opacity', 1)
                .attr("d", diagonal);


        link.exit().remove();

        return link;
    }

    // Similar to connectionLinks but adds animated directional flow icons.
    // @param[Array] linkData - formated linkData for d3.
    // @param[String] namespace - used to preserve grouping and uniqueness.
    // @param[Boolean] reverse - set true to reverse animation direction.
    function livePaths(svgContainer, graph, namespace, reverse) {
        var linkData = diagonalFocusPathLinks(graph);
        var pathData = connectionLinks(svgContainer, linkData, namespace)
            .call(NIL.Style.pulsePath)

        updateFlowIcons(svgContainer, linkData, pathData[0], namespace, reverse);

        return pathData;
    }

    // @param[Array] linkData - formated linkData for d3.
    // @param[Array] paths - actual SVG path DOM nodes required.
    // @param[String] namespace - used to preserve grouping and uniqueness.
    function updateFlowIcons(svgContainer, linkData, paths, namespace, reverse) {
        var markerData = [];
        paths.map(function(d, i) {
            if(d) {
                var slope = (linkData[i].target.y - linkData[i].source.y)/
                                (linkData[i].target.x - linkData[i].source.x);
                // this coincides with the transform(rotate()) format (clockwise degrees)
                var degree = Math.atan(slope) * (180/Math.PI);
                markerData.push({
                    path: d,
                    degree : degree,
                    reverse : reverse,
                    iconsUrl : linkData[i].source.iconsUrl,
                    _id : (linkData[i].source._id + linkData[i].target._id + namespace)
                });
            }
        });

        var markers = svgContainer.selectAll("g." + namespace)
                        .data(markerData, function(d) { return d._id });

        var markersEnter = markers.enter().append("svg:g")
            .attr('class', namespace + ' flow-icon')
            .call(NIL.Style.flowIcon)
        ;

        markers.transition()
            .delay(400)
            .duration(1500)
            .attrTween("transform", function(d) {
                var l = d.path.getTotalLength()/2; // mid-point
                  return function(t) {
                    var offset = t * l;
                    if (d.reverse) {
                        offset = d.path.getTotalLength() - offset;
                    }
                    var p = d.path.getPointAtLength(offset);
                    return "translate(" + p.x + "," + p.y + ")";
                  };
            })

        markers.exit().transition()
            .duration(config.duration)
            .style("fill-opacity", 0)
            .remove();

        return markers;
    }


    // @return[Array] link data for building lines with d3.svg.diagonal().
    function diagonalFocusPathLinks(graph) {
        var links = [],
            paths = [];

        if (graph.metaItems('focusPath').length > 0) {
            var paths = [graph.metaItems('focusPath')];
        } else if (graph.meta('focusPaths')) {
            var paths = graph.meta('focusPaths').map(function(path) {
                return graph.findAll(path);
            })
        }

        paths.forEach(function(path) {
            links = links.concat(diagonalPathLinks(path));
        })

        return links;
    }

    // @param[Array] path - ordered item objects denoting desired path.
    // @return[Array] link objects for the path for use with d3.svg.diagonal().
    function diagonalPathLinks(path) {
        var links = [];
        path.forEach(function(d, i) {
            if(path[i+1]) {
                links.push({
                    source: d,
                    target: path[i+1]
                });
            }
        })

        return links;
    }

    return ({
        nodes : nodes,
        nodeOverlays : nodeOverlays,
        connectionLinks : connectionLinks,
        livePaths : livePaths
    })
})();
