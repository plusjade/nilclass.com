var World = {};
var diagram = new Diagram(course.url);
var step = parseInt(window.location.hash.substring(1));
step = (step > 0) ? (step - 1) : 0;
diagram.get(step, function(graph) {
    var world = d3.select("#world").html('')
                    .append("svg:svg")
                        .attr('viewBox','0 0 1200 500')
    ;
    World.container = world.append("svg:g");

    World.duration = 500;
    World.description = new Description("#description");
    World.description.show(graph.meta('title'), graph.meta('content'));
    Display.update(graph);

    new Navigation({
        diagram : diagram,
        selector : '#prev-next',
        tocSelector : '#table-of-contents',
        stepToggleSelector : '#steps-count'
    })
    .updateStep(graph.meta('index'), graph.meta('total'));
})
