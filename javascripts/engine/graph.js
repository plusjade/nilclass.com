// The Graph object models our data format as a graph of nodes/items and connections.
NIL.Graph = function(items) {
    this.get = get;
    this.getAll = getAll;
    this.find = find;
    this.findAll = findAll;
    this.set = set;
    this.add = add;
    this.update = update;
    this.drop = drop;

    this.meta = meta;
    this.setMeta = setMeta;
    this.metaItems = metaItems;

    this.nodes = nodes;
    this.position = position;
    this.connections = connections;

    var __dict__ = dictify(items),
        __meta__ = {},
        __connectionLinks__ = []
    ;

    function meta(key) {
        return __meta__[key];
    }

    function setMeta(attributes) {
        for (key in attributes) {
            __meta__[key] = attributes[key];
        }
    }

    // Get items mappped from a meta attribute holding item ids.
    function metaItems(key) {
        return findAll(meta(key));
    }

    // Get an item.
    function get(key) {
        return __dict__[key];
    };

    // Set an item.
    function set(key, value) {
        __dict__[key] = value;
    };

    // Get an item or throw error if not found.
    function find(key) {
        if(get(key)) {
            return get(key);
        }
        else {
            throw "Could not find item using id: " + key;
        }
    }

    function getAll(keys) {
        var items = [];
        coerceArray(keys).forEach(function(name) {
            if(get(name)) {
                items.push(get(name));
            }
        })

        return items;
    };

    function findAll(keys) {
        return coerceArray(keys).map(function(name) {
            return find(name);
        })
    };

    // Delete an item.
    function _delete(key) {
        delete __dict__[key];
    }

    // Add an item to the graph in relation (mapped) to another item.
    function add(items) {
        addToDict(items);
    }

    // Update item attributes.
    function update(items) {
        coerceArray(items).forEach(function(item) {
            for(key in item) {
                __dict__[item.id][key] = item[key];
            }
        })
    }

    // Drop one or more items from the graph.
    function drop(names) {
        if(!Array.isArray(names)) {
            names = [names];
        }
        names.forEach(function(name) {
            _delete(name);
        })
    }

    // Set x and y coordinates for each item.
    // Note this is mutable service, it mutates the graph.
    function position(data) {
        for(id in __dict__) {
            __dict__[id]._id = __dict__[id].id || __dict__[id].name;
            var coord = {
                x : data[id][0],
                y : data[id][1] + 130
            }

            __dict__[id].x0 = 600;
            __dict__[id].y0 = 500;
            __dict__[id].x = coord.x;
            __dict__[id].y = coord.y;
        }

        for(id in __dict__) {
            if(__dict__[id].from && get(__dict__[id].from)) {
                var from = get(__dict__[id].from);
                __dict__[id].x0 = from.x;
                __dict__[id].y0 = from.y;
            }
        }
    }

    function nodes() {
        return d3.values(__dict__);
    }

    // @return[Array] link objects for all connections in a graph.
    // For use with d3.svg.diagonal().
    function connections(data) {
        if(data) {
            __connectionLinks__ = [];

            for(key in data) {
                if(get(key)) {
                    getAll(data[key]).forEach(function(item) {
                        __connectionLinks__.push({
                            source: get(key),
                            target: item
                        });
                    })
                }
            }
        }

        return __connectionLinks__;
    }

    // Private

    // Generate a dictionary graph from an ordered Array represenation.
    function dictify(items) {
        var dict = {};
        items.forEach(function(item, i) {
            dict[item.id] = item;
        })

        return dict;
    }

    function addToDict(items) {
        var dict = dictify(items);
        for (key in dict) {
            set(key, dict[key]);
        };
    }

    function coerceArray(input) {
        var result = [];
        if(Array.isArray(input)) {
            result = input;
        }
        else if(input) {
            result.push(input);
        }
        return result;
    }
};
