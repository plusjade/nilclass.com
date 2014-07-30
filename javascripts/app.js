var World = {
    duration : 500
    ,diagonal : d3.svg.diagonal()
                    .projection(function(d) { return [d.x, d.y]; })
}

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
