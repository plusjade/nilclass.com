// A <Diagram> is the highest level model representation of a data visualization.
// A Diagram has many <Steps>s where a step represents a specific, navigatigable state of a Diagram.
// A Step models instructions for building the Diagram at a particular state.
// Steps produce <Graph>s.
// A Graph models the actual graphical elements and coordinates used by d3 to create the visualization.
// 
// Usage:
// 
// A Diagram consumes 'step instructions' which are loaded from a remote data-source.
// We can ask the diagram to return a graph based on a given step index.
// The diagram is lazily evaluated so a callback is always used:
//
//    var diagram = new Diagram('name-of-file');
//    diagram.get(0, function(graph, index, page) {
        // Render the graph here.
//    })
var Diagram = function(endpoint) {
    if(!endpoint) throw("Diagram endpoint is required");
    this.endpoint = endpoint;

    // Get graph at <index>.
    // The callback receives: 
    //  [Graph] - graph.
    this.get = function(index, callback) {
        resolve(function() {
            callback.apply(this, getGraph(index));
        })
    }

    // Get graph at <index> where <index> is coerced to remain within step bounds.
    // The callback receives:
    //  [Graph] - graph.
    this.getBounded = function(index, callback) {
        resolve(function() {
            index = boundedIndex(index);

            callback.apply(this, getGraph(index));
        })
    }

    // Get graph by step slug.
    // The callback receives: 
    //  [Graph] - graph.
    this.getByStepName = function(slug, callback) {
        resolve(function() {
            var index = Pages[slug] || 0;

            callback.apply(this, getGraph(index));
        })
    }

    // Get all path steps.
    // The callback receives:
    //  [Array] - steps. An ordered list of path steps.
    this.steps = function(callback) {
        resolve(function() {
            callback( Paths.map(function(d) {
                return { slug: d.slug, title: d.title };
            }) )
        })
    }

    // PRIVATE
    // Private functions assume the data has loaded.

    var AllowedMethods = ['add', 'insert', 'update', 'remove'],
        Steps,
        Paths,
        Urls = {},
        Pages = {};

    // Resolve the state (data) of the diagram.
    // Data comes from a remote source so every public function should
    // execute its logic as a callback to resolve();
    function resolve(callback) {
        if(Paths) {
            callback();
        }
        else {
            d3.json(pathEndpoint(), function(pathData) {
                if(pathData.course) {
                    d3.json(dataEndpoint(pathData.course.diagram), function(data) {
                        if(data) {

                            parsePath(pathData.course);
                            parseSteps(data);

                            Paths.forEach(function(path) {
                                path.diagramStepIndex = Urls[path.diagramStep];
                            })

                            callback();
                        }
                        else {
                            throw("Could not retrieve data from: " + dataEndpoint() );
                        }
                    })


                }
                else {
                    throw("Could not retrieve data from: " + pathEndpoint() );
                }
            })

        }
    }

    function parsePath(data) {
        Paths = data.steps;
        Paths.forEach(function(step, i) {
            if(step.slug) {
                Pages[step.slug] = i;
            }
        })
    }

    function parseSteps(data) {
        Steps = data.steps;
        Steps.forEach(function(step, i) {
            if(step.diagramStep) {
                Urls[step.diagramStep] = i;
            }
        })
    }

    // This is asking me for a path index.
    // diagrams are index dependent based on building the graph.
    // Example: Path[0] -> Step[2]
    function getGraph(index) {
        var stepIndex = Paths[index].diagramStepIndex,
            steps = Steps.slice(0, stepIndex+1);
        var positions = steps.reduce(function(accumulator, step) {
                            if(step.positions) {
                                for(key in step.positions) {
                                    accumulator[key] = step.positions[key];
                                }
                            }
                            return accumulator;
                          }, {});
        var connections = steps.reduce(function(accumulator, step) {
                            if(step.connections) {
                                for(key in step.connections) {
                                    accumulator[key] = step.connections[key];
                                }
                            }
                            return accumulator;
                          }, {});

        var items = JSON.parse(JSON.stringify(steps.shift().actions[0].items)),
            graph = new Graph(items),
            metadata = {};

        graph.positions = positions;
        graph.connections = connections;

        // Note this process mutates the graph object in place.
        steps.reduce(function(accumulator, step) {
            return merge(accumulator, step);
        }, graph);

        graph.setMeta(Paths[index]);
        graph.setMeta({ "total" : Paths.length });

        return [graph];
    }

    // stay in bounds
    function boundedIndex(index) {
        if (index < 0) {
            index = Paths.length-1;
        }
        else if (index > Paths.length-1) {
            index = 0;
        }

        return index;
    }

    function merge(graph, step) {
        var actions = step.actions || [];
        if(actions.length === 0) {
            throw "The step '"+ step.diagramStep + "' has 0 action statements."
        }

        actions.forEach(function(action) {
            verifyMethod(action.method);

            switch (action.method) {
                case "add":
                    graph.add(action.items);
                    break;
                case "update":
                    graph.update(action.items);
                    break;
                case "remove":
                    var names = action.items.map(function(item){ return item.id });
                    graph.drop(names);
                    break;
            }
        })

        return graph;
    }

    function verifyMethod(method) {
        if(AllowedMethods.indexOf(method) === -1) {
            throw("The method: '" + method + "' is not recognized."
                    + "\n Supported methods are: " + AllowedMethods.toString());
        }
    }

    function pathEndpoint(diagram) {
        return '/courses-data/' + endpoint + '/content.json?' + Math.random();
    }

    function dataEndpoint(diagram) {
        return '/courses-data/' + endpoint + '/diagram.json?' + Math.random();
    }
}
