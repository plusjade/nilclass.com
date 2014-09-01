NIL.Description = function(container) {
    this.update = update;

    var d3Container = container
                        .append('g')
                            .attr('class', 'description')
                            .attr("text-anchor", 'middle')
                            .attr('transform', 'translate(600,50)')
    ;

    function update(heading, content) {
        d3Container
            .html('')
            .style('opacity', 0);

        var width = d3Container
                        .append('svg:text')
                            .text(heading)
                            .attr('y', 0)
                            .node().clientWidth
        ;

        // line-break if needed
        if(width > 1050) {
            var words = heading.split(' '),
                half = Math.ceil(words.length/2),
                firstLine = words.slice(0, half).join(' '),
                secondLine = words.slice(half, words.length).join(' ')
            ;

            d3Container
                .html('')
                .append('svg:text')
                    .text(firstLine)
            ;
            d3Container
                .append('svg:text')
                    .attr('y', 40)
                    .text(secondLine)
            ;
        }
        else if(content && content.length > 0) {
            d3Container
                .append("foreignObject")
                    .attr('transform', 'translate(-400,20)')
                    .attr("width", 800)
                    .attr("height", 100)
                    .append("xhtml:body")
                        .append('xhtml:div')
                        .attr('class', 'sub-description')
                            .html(content)
            ;
        }

        d3Container
            .transition()
                .delay(1000)
                .duration(400)
                .style('opacity', 1);
    }
}
