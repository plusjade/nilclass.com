// Render a course.
NIL.course = function(course) {
    var diagram = new NIL.Diagram(course);

    // Textual description
    var description = new NIL.Description("#description");

    // SVG visualization
    var world = d3.select('body').append('div').attr('id', 'world')
                    .append("svg:svg")
                        .attr('viewBox','0 0 1200 500')
                        .append("svg:g")
    ;

    // Navigation components
    var navigation = new NIL.Navigation({
        diagram : diagram,
        selector : '#prev-next',
        tocSelector : '#table-of-contents',
        stepToggleSelector : '#steps-count'
    })

    diagram.on('change', function(graph) {
        description.update(graph.meta('title'), graph.meta('content'));

        NIL.Display.nodes(world, graph.nodes());
        NIL.Display.nodeOverlays(world, graph);
        NIL.Display.connectionLinks(world, graph.connections(), 'connect');
        NIL.Display.livePaths(world, graph, 'focusPath');

        navigation.update(graph.meta('index'), graph.meta('total'));
    })

    // Discern and load the step from the URL.
    var step = parseInt(window.location.hash.substring(1));
    step = (step > 0) ? (step - 1) : 0;
    diagram.get(step);
}
