// A <Diagram> is the highest level model representation of a data visualization.
// A Diagram has many <States>s where a state represents a specific, navigatigable state of a Diagram.
// A State models instructions for building the Diagram at a particular state.
// States produce <Graph>s.
// A Graph models the actual graphical elements and coordinates used by d3 to create the visualization.
// 
// Usage:
// 
// A Diagram consumes 'state instructions' which are loaded from a remote data-source.
// We can ask the diagram to return a graph based on a given courseStep index.
// Each courseStep references a diagram state.
// The diagram is lazily evaluated so you must listen for the 'change' event:
//
//    var diagram = new NIL.Diagram({ diagramUrl : '/diagram.json', contentUrl : '/content.json' });
//    diagram.on('change', function(graph) {
        // Render the graph here.
//    })
//
//    // Pragmatically get a courseStep:
//    diagram.get(0);
NIL.Diagram = function(config) {
    if(!config) throw("Diagram endpoints are required");
    if(!config.iconsUrl) throw("'iconsUrl' endpoint is required");
    this.config = config;

    var dispatch = d3.dispatch('loaded', 'change');

    // Add event listeners.
    this.on = function(type, listener) {
        dispatch.on(type, listener);
    }

    // Get graph at courseStep <index>.
    this.get = function(index) {
        resolve(function() {
            getGraph(index);
        })
    }

    // Get graph at courseStep <index> where <index> is coerced to remain within courseStep bounds.
    this.getBounded = function(index) {
        resolve(function() {
            index = boundedIndex(index);
            getGraph(index);
        })
    }

    // Get all courseSteps.
    // The callback receives:
    //  [Array] - courseSteps. An ordered list of courseSteps.
    this.courseSteps = function(callback) {
        resolve(function() {
            callback(CourseSteps)
        })
    }

    // PRIVATE
    // Private functions assume the data has loaded.

    var AllowedMethods = ['add', 'update', 'remove'],
        States,
        CourseSteps,
        StateIds = {}
    ;

    // Resolve the state (data) of the diagram.
    // Data comes from a remote source so every public function should
    // execute its logic as a callback to resolve();
    function resolve(callback) {
        if(CourseSteps) {
            callback();
        }
        else {
            d3.json(contentUrl(), function(courseData) {
                if(courseData) {
                    d3.json(diagramUrl(), function(diagramData) {
                        if(diagramData) {
                            States = diagramData.states;
                            processStateIds(diagramData.states);
                            CourseSteps = courseData.steps;
                            CourseSteps.forEach(function(step, i) {
                                step.index = i;
                                step.diagramStateIndex = StateIds[step.diagramState];
                            })

                            dispatch.loaded();
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

    function processStateIds(states) {
        states.forEach(function(state, i) {
            if(state.diagramState) {
                StateIds[state.diagramState] = i;
            }
        })
    }

    // This is asking me for a courseStep index.
    // diagrams are index dependent based on building the graph.
    // Example: CourseSteps[0] -> States[2]
    // The graph is not directly returned, rather it is emitted on the 'change' event.
    // ex: diagram.on('change', function(graph) {});
    function getGraph(index) {
        var stateIndex = CourseSteps[index].diagramStateIndex,
            states = States.slice(0, stateIndex+1);
        var positions = states.reduce(function(accumulator, state) {
                            if(state.positions) {
                                for(key in state.positions) {
                                    accumulator[key] = state.positions[key];
                                }
                            }
                            return accumulator;
                          }, {});
        var connections = states.reduce(function(accumulator, state) {
                            if(state.connections) {
                                for(key in state.connections) {
                                    accumulator[key] = state.connections[key];
                                }
                            }
                            return accumulator;
                          }, {});

        var items = JSON.parse(JSON.stringify(states.shift().actions[0].items)),
            graph = new NIL.Graph(processItems(items)),
            metadata = {};

        // Note this process mutates the graph object in place.
        states.reduce(function(accumulator, state) {
            return merge(accumulator, state);
        }, graph);

        graph.position(positions);
        graph.connections(connections);

        graph.setMeta(CourseSteps[index]);
        graph.setMeta({ "total" : CourseSteps.length });

        dispatch.change(graph);
    }

    // stay in bounds
    function boundedIndex(index) {
        if (index < 0) {
            index = CourseSteps.length-1;
        }
        else if (index > CourseSteps.length-1) {
            index = 0;
        }

        return index;
    }

    function merge(graph, state) {
        var actions = state.actions || [];
        if(actions.length === 0) {
            throw "The diagramState '"+ state.diagramState + "' has 0 action statements."
        }

        actions.forEach(function(action) {
            verifyMethod(action.method);

            switch (action.method) {
                case "add":
                    graph.add(processItems(action.items));
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

    function processItems(items) {
        items.forEach(function(d) {
            d.iconsUrl = config.iconsUrl;
        })
        return items;
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
