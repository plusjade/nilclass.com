var Style = {
    text : function(nodes) {
        nodes.append("svg:text")
                .attr('class', 'text-bg')
                .attr("dy", 65)
                .attr("text-anchor", function(d) { return d['text-anchor'] || 'middle' })
                .text(function(d) { return d.text });

        nodes.append("svg:text")
            .attr("dy", 65)
            .attr("text-anchor", function(d) { return d['text-anchor'] || 'middle' })
            .text(function(d) { return d.text });

        return nodes;
    }

    ,
    clicker : function(nodes) {
        nodes.append('circle')
            .attr('class', 'clicker')
            .attr('r', 50);
        return nodes;
    }
    ,
    icon : function(nodes) {
        nodes.append('circle')
            .attr('class', 'icon-bg')
            .attr('r', 14)

        nodes.append('g').append('use')
            .attr('xlink:href', function(d) { return '#' + d.icon })
            .attr('class', function(d) { return "icon " + d.icon })
            .attr('height', function(d) {
                return d.depth > 0 ? 20 : 30;
            })
            .attr('width', function(d) {
                return d.depth > 0 ? 20 : 30;
            })

        nodes.call(Style.clicker);

        return nodes;
    }
    ,
    labels : function(nodes) {
        nodes.append("svg:text")
                .attr('class', 'text-bg')
                .attr("dy", 35)
                .attr("text-anchor", "middle")
                .text(function(d) { return d.name || d.id })

        nodes.append("svg:text")
                .attr("dy", 35)
                .attr("text-anchor", "middle")
                .text(function(d) { return d.name || d.id });

        return nodes;
    }

    ,
    focus : function(nodes) {
        nodes.selectAll("use")
            .transition()
            .duration(World.duration)
                .attr('x', -30)
                .attr('y', -30)
                .attr('height', 60)
                .attr('width', 60)
            .transition()
            .duration(World.duration)
                .attr('x', -25)
                .attr('y', -25)
                .attr('height', 50)
                .attr('width', 50)

        nodes.exit().selectAll("use").transition()
            .duration(World.duration)
                .attr('x', -15)
                .attr('y', -15)
                .attr('height', 30)
                .attr('width', 30)

        nodes.selectAll("circle.software")
            .transition()
                .duration(World.duration)
                .attr('r', 20)
            .transition()
                .duration(World.duration)
                .attr('r', 16)


        nodes.exit().selectAll("circle.software").transition()
            .duration(World.duration)
            .attr('r', 8)

        nodes.insert('svg:circle', 'g')
            .attr('class', 'focus')
            .attr('r', 0)
            .transition()
                .duration(World.duration)
                .attr('r', 60)
            .transition()
                .duration(World.duration)
                .attr('r', 50)


        nodes.exit().selectAll("circle.focus").transition()
            .duration(World.duration)
            .attr('r', 0)
            .remove()

        return nodes;
    }

    ,
    crossOut : function(nodes) {
        var size = 30;
        var nodesEnter = nodes.append('use')
            .attr('xlink:href', '#cross-out')
            .attr('class', 'cross-out')
            .attr('x', -(size/2))
            .attr('y', -(size/2))
            .attr('height', size)
            .attr('width', size)

        nodes.exit()
            .selectAll("use.cross-out").remove();

        return nodes;
    }

    ,
    disable : function(nodes) {
        nodes.style('opacity', 0.7)

        nodes.exit()
            .style('opacity', 1);

        return nodes;
    }

    ,
    pulsePath : function(nodes) {
        nodes
            .transition()
                .duration(World.duration)
                .style('stroke-opacity', 1)
                .style('stroke-width', 4)
            .transition()
                .duration(World.duration)
                .style('stroke-width', 2)

        return nodes;
    }
}
