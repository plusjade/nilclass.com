var Page = function(selector) {
    var node = d3.select(selector);

    this.show = function(content) {
        var html = node.select('div').html(content);

        html.select('h1')
            .style('opacity', 0)
            .transition()
                .duration(500)
                .style('opacity', 1);

        html.selectAll('p')
            .style('opacity', 0)
            .transition()
                .delay(800)
                .duration(500)
                .style('opacity', 1);
    }
}
