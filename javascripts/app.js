var World = {
    height : 700
    ,duration : 500
    ,diagonal : d3.svg.diagonal()
                    .projection(function(d) { return [d.x, d.y]; })

}

World.wrap = d3.select("#world").append("svg:svg");

World.container = World.wrap
    .append("svg:g")
        .attr("transform", "translate(0,0)")

World.zoom = d3.behavior.zoom()
                .scaleExtent([0.5, 2.5])
                .on("zoom", function() {
                    World.container.attr("transform",
                        "translate(" + d3.event.translate + ")"
                        + " scale(" + d3.event.scale + ")");
                })

World.wrap.call(World.zoom);

var zoomControls = d3.select("#world").append('div').attr('id', 'zoom-controls');
zoomControls
    .append('div').html('<i class="fa fa-plus"></i>')
    .on('click', function(d) {
        d3.event.preventDefault();
        var scale = World.zoom.scale() + 0.2;
        if(scale < World.zoom.scaleExtent()[1]) {
            World.zoom.scale(scale);
            World.zoom.event(World.container);
        }
    })
zoomControls
    .append('div').html('<i class="fa fa-minus"></i></div>')
    .on('click', function(d) {
        d3.event.preventDefault();
        World.zoom.scaleExtent[1]
        var scale = World.zoom.scale() - 0.2;
        if(scale > World.zoom.scaleExtent()[0]) {
            World.zoom.scale(scale);
            World.zoom.event(World.container);
        }
    })

World.width = d3.select('svg').node().clientWidth;

World.page = new Page("#description");

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
