var TableOfContents = function(containerSelector, stepToggleSelector) {
    this.show = show;
    this.hide = hide;
    this.highlight = highlight;
    this.updateStep = updateStep;
    this.updateList = updateList;

    var d3StepToggle = d3.select('body').append('div')
                            .attr('id', stepToggleSelector.slice(1))
                            .on('click', toggle);

    var container = document.createElement('div');
    container.id = containerSelector.slice(1);

    var d3Toc = d3.select(container);
    d3Toc.append('h4').text('Table of Contents');
    d3Toc.append('ol');

    document.body.appendChild(d3Toc.node());

    function updateStep(index, total) {
        var current = index + 1;
        var menu = '<svg viewBox="0 0 90 90" enable-background="new 0 0 90 90" xml:space="preserve">'
                    + '<path d="M29,34h32c1.1,0,2-0.9,2-2c0-1.1-0.9-2-2-2H29c-1.1,0-2,0.9-2,2C27,33.1,27.9,34,29,34z"/>'
                    + '<path d="M61,43H29c-1.1,0-2,0.9-2,2c0,1.1,0.9,2,2,2h32c1.1,0,2-0.9,2-2C63,43.9,62.1,43,61,43z"/>'
                    + '<path d="M61,56H29c-1.1,0-2,0.9-2,2c0,1.1,0.9,2,2,2h32c1.1,0,2-0.9,2-2C63,56.9,62.1,56,61,56z"/>'
                    + '</svg>'
                    ;

        var count = '<em>'+ current + '</em> of ' + total + menu;
        d3StepToggle.html(count);

        d3.select('#signup-form').classed('active', current === total);
    }

    // update the table of contents list.
    function updateList(steps, index) {
        var self = this;
        current = index || 0;

        steps.forEach(function(d, i) {
            d.active = (i === index);
        })

        var nodes = d3Toc.select('ol').selectAll('li')
                    .data(steps, function(d){ return d.slug })
                    .classed('active', function(d) { return d.active })

        nodes.exit().remove();

        return nodes.enter()
            .append('li')
                .classed('active', function(d) { return d.active })
            .append('a')
                .html(function(d) { return d.title })
    }

    function toggle() {
        d3Toc.classed('active', !d3Toc.classed('active'));
    }

    function show() {
        d3Toc.classed('active', true);
    }

    function hide() {
        d3Toc.classed('active', false);
    }

    function highlight(index) {
        d3Toc.select('ol').selectAll('li')
            .classed('active', false)
            .filter(':nth-child('+ (index+1) +')').classed('active', true);
    }
}
