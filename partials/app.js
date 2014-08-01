var World = {};
World.duration = 500;
World.page = new Page("#description");
//World.wrap.node().clientWidth;
World.diagram = new Diagram(course.url);

var step = parseInt(window.location.hash.substring(1));
step = (step > 0) ? (step - 1) : 0;

World.diagram.get(step, function(graph) {
    World.wrap = d3.select("#world")
                    .html('')
                    .append("svg:svg")
                        .attr('viewBox','0 0 1200 500');

    World.container = World.wrap.append("svg:g");

    Display.update(graph);
    World.navigation = new Navigation('#prev-next');
    World.diagram.steps(function(steps) {
        World.navigation.update(steps, graph.meta('index'));
    })
})

d3.select("body")
    .on("keydown", function(){
        if(d3.event.keyCode === 39) // right arrow
            World.navigation.next();
        else if(d3.event.keyCode === 37) // left arrow
            World.navigation.previous();
    })

d3.select('#steps-count').on('click', function() {
    d3.event.preventDefault();
    var node = d3.select('#table-of-contents');

    node.classed('active', !node.classed('active'));
})
