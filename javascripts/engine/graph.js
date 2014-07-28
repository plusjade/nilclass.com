// The Graph object models our data format as a graph of nodes/items and connections.
var Graph = function(items) {
    // Generate a dictionary graph from an ordered Array represenation.
    // Maps relations using "mapTo" attribute.
    function dictify(items) {
        var dict = {};
        items.forEach(function(item, i) {
            if(items[i+1]) {
                item.mapTo = [items[i+1].id];
            }

            dict[item.id] = item;
        })

        return dict;
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

    this.dict = dictify(items);
    // TODO: Verify the root exists.
    this._root = items[0].id;
    this._meta = {};

    this.meta = function(key) {
        return this._meta[key];
    }

    this.setMeta = function(attributes) {
        for (key in attributes) {
            this._meta[key] = attributes[key];
        }
    }

    // Get items mappped from a meta attribute holding item ids.
    this.metaItems = function(key) {
        return this.findAll(this.meta(key));
    }

    // Get an item.
    this.get = function(key) {
        return this.dict[key];
    };

    // Set an item.
    this.set = function(key, value) {
        this.dict[key] = value;
    };

    // Get an item or throw error if not found.
    this.find = function(key) {
        if(this.get(key)) {
            return this.get(key);
        }
        else {
            throw "Could not find item using id: " + key;
        }
    }

    this.getAll = function(keys) {
        var self = this;
        var items = [];
        coerceArray(keys).forEach(function(name) {
            if(self.get(name)) {
                items.push(self.get(name));
            }
        })

        return items;
    };

    this.findAll = function(keys) {
        var self = this;

        return coerceArray(keys).map(function(name) {
            return self.find(name);
        })
    };

    // Delete an item.
    this.delete = function(key) {
        delete this.dict[key];
    }

    // Add an item to the graph in relation (mapped) to another item.
    this.add = function(items) {
        this.addToDict(items);
    }

    // Update item attributes.
    this.update = function(items) {
        var self = this;
        coerceArray(items).forEach(function(item) {
            for(key in item) {
                self.dict[item.id][key] = item[key];
            }
        })
    }

    // Drop one or more items from the graph.
    this.drop = function(names) {
        var self = this;
        if(!Array.isArray(names)) {
            names = [names];
        }
        names.forEach(function(name) {
            self.delete(name);
        })
    }

    // Internal. Add more items to the graph's dictionary.
    this.addToDict = function(items) {
        var dict = dictify(items);
        for (key in dict) {
            this.set(key, dict[key]);
        };
    }
};
