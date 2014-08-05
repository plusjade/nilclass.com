var Navigation = function(config) {
    this.next = next;
    this.previous = previous;
    this.navigate = navigate;
    this.update = update;

    var current = 0,
        tableOfContents = new TableOfContents(config.tocSelector, config.stepToggleSelector)
    ;

    config.diagram.steps(function(steps) {
        draw();

        tableOfContents.updateList(steps)
            .on('click', function(d, i) {
                d3.event.preventDefault();
                navigate(i);
                tableOfContents.hide();
            })

        d3.select("body")
            .on("keydown", function(){
                if(d3.event.keyCode === 39) // right arrow
                    next();
                else if(d3.event.keyCode === 37) // left arrow
                    previous();
            })
    })

    function update(index, total) {
        current = index;
        tableOfContents.updateStep(index, total);
        tableOfContents.highlight(current);
        window.location.replace("#" + (current +1));
    }

    function next () {
        navigate(current+1);
    }

    function previous() {
        navigate(current-1);
    }

    // Prgramatically navigate to step at index.
    function navigate(index) {
        config.diagram.getBounded(index);
    }

    // draw the DOM nodes into the DOM.
    function draw() {
        var container = document.createElement("div");
        container.id = config.selector.slice(1);

        var d3C = d3.select(container);
        d3C.append('svg')
            .attr('class', 'previous')
            .on('click', previous)
            .attr('x', 0)
            .attr('y', 0)
            .attr('viewBox', '0 0 20 20')
            .attr('enable-background', 'new 0 0 20 20')
            .append('path')
                .attr('transform', 'translate(20,0), scale(-1,1)')
                .attr('d', 'M2.679,18.436c0,0.86,0.609,1.212,1.354,0.782l14.612-8.437c0.745-0.43,0.745-1.134,0-1.563L4.033,0.782   c-0.745-0.43-1.354-0.078-1.354,0.782V18.436z');

        d3C.append('svg')
            .attr('class', 'next')
            .on('click', next)
            .attr('x', 0)
            .attr('y', 0)
            .attr('viewBox', '0 0 20 20')
            .attr('enable-background', 'new 0 0 20 20')
            .append('path')
                .attr('d', 'M2.679,18.436c0,0.86,0.609,1.212,1.354,0.782l14.612-8.437c0.745-0.43,0.745-1.134,0-1.563L4.033,0.782   c-0.745-0.43-1.354-0.078-1.354,0.782V18.436z');

        var wrap = document.createElement("div");
        wrap.id = 'prev-next-wrap';
        wrap.appendChild(container);

        document.body.appendChild(wrap);
    }
}
