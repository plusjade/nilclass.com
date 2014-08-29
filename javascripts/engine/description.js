NIL.Description = function(selector) {
    this.update = update;

    var node = d3.select('body')
                    .append('div').attr('id', selector.slice(1))
    ;

    function update(heading, content) {
        node.html('');

        node.append('h1')
            .html(heading)
            .style('opacity', 0)
            .attr('class', function() {
                return (content.length == 0) ? 'big' : null;
            })
            .transition()
                .duration(500)
                .style('opacity', 1);

        node.append('div')
            .html(content)
            .style('opacity', 0)
            .transition()
                .delay(800)
                .duration(500)
                .style('opacity', 1);
    }
}
