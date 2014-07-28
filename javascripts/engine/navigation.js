var Navigation = function(selector) {
    var d3Container = d3.select(selector),
        tableOfContentsSelector = '#table-of-contents',
        current = 0;

    this.next = next;
    this.previous = previous;
    this.update = update;

    function next () {
        navigate(current+1);
    }

    function previous() {
        navigate(current-1);
    }

    // Update table of contents with the latest steps.
    function update(steps, index) {
        current = index || 0;

        steps.forEach(function(d, i) {
            d.active = (i === index);
        })

        var nodes = d3.select(tableOfContentsSelector + '> ol').selectAll('li')
                    .data(steps, function(d){ return d.slug })
                    .classed('active', function(d) { return d.active })

        nodes.enter()
            .append('li')
                .classed('active', function(d) { return d.active })
            .append('a')
                .html(function(d) { return d.title })
                .on('click', function(d, i) {
                    d3.event.preventDefault();
                    navigate(i);
                    d3.select(tableOfContentsSelector).classed('active', false);
                })

        nodes.exit().remove();
    }

    function initialize() {
        d3Container.select('.next')
            .on('click', function() {
                d3.event.preventDefault();
                next();
            })

        d3Container.select('.prev')
            .on('click', function() {
                d3.event.preventDefault();
                previous();
            })
    }

    // Prgramatically navigate to step at index.
    function navigate(index) {
        World.diagram.getBounded(index, function(graph) {
            Display.update(graph);
            current = graph.meta('index');
            highlight(current);

            window.location.replace("#" + (current +1)); 
        })
    }

    function highlight(index) {
        d3.select(tableOfContentsSelector + '> ol').selectAll('li')
            .classed('active', false)
            .filter(':nth-child('+ (index+1) +')').classed('active', true);
    }

    initialize();
}
