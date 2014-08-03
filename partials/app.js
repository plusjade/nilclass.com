var diagram = new Diagram(course.url);
var step = parseInt(window.location.hash.substring(1));
step = (step > 0) ? (step - 1) : 0;

// Textual description
var description = new Description("#description");

// SVG visualization
var world = d3.select("#world").html('')
                .append("svg:svg")
                    .attr('viewBox','0 0 1200 500')
;
var display = new Display(world.append("svg:g"));

// Navigation components
var navigation = new Navigation({
    diagram : diagram,
    selector : '#prev-next',
    tocSelector : '#table-of-contents',
    stepToggleSelector : '#steps-count'
})

diagram.on('change', function(graph) {
    description.update(graph.meta('title'), graph.meta('content'));
    display.update(graph);
    navigation.update(graph.meta('index'), graph.meta('total'));
})

diagram.get(step);
