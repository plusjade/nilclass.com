var World = {};
World.duration = 500;
var diagram = new Diagram(course.url);
var step = parseInt(window.location.hash.substring(1));
step = (step > 0) ? (step - 1) : 0;
diagram.get(step, function(graph) {
    World.description = new Description("#description");
    World.description.show(graph.meta('title'), graph.meta('content'));

    var world = d3.select("#world").html('')
                    .append("svg:svg")
                        .attr('viewBox','0 0 1200 500')
    ;
    World.display = new Display(world.append("svg:g"));
    World.display.update(graph);

    new Navigation({
        diagram : diagram,
        selector : '#prev-next',
        tocSelector : '#table-of-contents',
        stepToggleSelector : '#steps-count'
    })
    .updateStep(graph.meta('index'), graph.meta('total'));
})
