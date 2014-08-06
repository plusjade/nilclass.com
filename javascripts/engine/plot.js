// Library for consuming a graph object to generate coordinates 
// in order to plot the graph on the page using d3.
var Plot = function() {

    // @return[Array] link objects for all connections in a graph.
    // For use with d3.svg.diagonal().
    function diagonalConnectionLinks(graph) {
        var links = [];

        for(key in graph.connections) {
            if(graph.get(key)) {
                graph.getAll(graph.connections[key]).forEach(function(item) {
                    links.push({
                        source: graph.get(key),
                        target: item
                    });
                })
            }
        }

        return links;
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

    // Public API
    return {
        diagonalConnectionLinks : diagonalConnectionLinks,
        diagonalFocusPathLinks : diagonalFocusPathLinks,
        diagonalPathLinks : diagonalPathLinks
    };
}();
