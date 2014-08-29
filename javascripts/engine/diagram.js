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
// The diagram is lazily evaluated so you must listen for the 'change' event:
//
//    var diagram = new NIL.Diagram({ diagramUrl : '/diagram.json', contentUrl : '/content.json' });
//    diagram.on('change', function(graph) {
        // Render the graph here.
//    })
//
//    // Pragmatically get a step:
//    diagram.get(0);
NIL.Diagram = function(config) {
    if(!config) throw("Diagram endpoints are required");
    this.config = config;

    var dispatch = d3.dispatch('change');

    // Add event listeners.
    this.on = function(type, listener) {
        dispatch.on(type, listener);
    }

    // Get graph at <index>.
    this.get = function(index) {
        resolve(function() {
            getGraph(index);
        })
    }

    // Get graph at <index> where <index> is coerced to remain within step bounds.
    this.getBounded = function(index) {
        resolve(function() {
            index = boundedIndex(index);
            getGraph(index);
        })
    }

    // Get graph by step slug.
    this.getByStepName = function(slug) {
        resolve(function() {
            var index = Pages[slug] || 0;

            getGraph(index);
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
            d3.json(contentUrl(), function(pathData) {
                if(pathData.course) {
                    d3.json(diagramUrl(), function(data) {
                        if(data) {

                            parsePath(pathData.course);
                            parseSteps(data);

                            Paths.forEach(function(path) {
                                path.diagramStepIndex = Urls[path.diagramStep];
                            })

                            callback();
                        }
                        else {
                            throw("Could not retrieve data from: " + diagramUrl() );
                        }
                    })

                }
                else {
                    throw("Could not retrieve data from: " + contentUrl() );
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
    // The graph is not directly returned, rather it is emitted on the 'change' event.
    // ex: diagram.on('change', function(graph) {});
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
            graph = new NIL.Graph(items),
            metadata = {};

        // Note this process mutates the graph object in place.
        steps.reduce(function(accumulator, step) {
            return merge(accumulator, step);
        }, graph);

        graph.position(positions);
        graph.connections(connections);

        graph.setMeta(Paths[index]);
        graph.setMeta({ "total" : Paths.length });

        dispatch.change(graph);
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

    function contentUrl() {
        return config.contentUrl + '?' + Math.random();
    }

    function diagramUrl() {
        return config.diagramUrl + '?' + Math.random();
    }
}
