## Static site for nilclass.com

![colorful domo](media/colorful-domo.jpg)


## Dependencies

nilclass.com is a static website. In production it requires only HTML, CSS, and Javascript.

However, the development website utilizes [Ruhoh](http://ruhoh.com/), a static website generator written in ruby. [HAML](http://haml.info/) and [SASS](http://sass-lang.com/) are also used. The Gemfile contains all the development dependencies. Note `aws-sdk` is used only for publishing purposes and may be omitted.

The diagram engine is HTML5 based and client-side. However, I am not following javascript best practices because I am not that hip yet -- My background is in ruby but I'll get there eventually.

The diagram engine supports modern browsers only and is based on [d3.js](http://d3js.org/), SVG, and HTML5.


## Version

0.0.1 - Please consider the API alpha and unstable.


# Local Installation and Development

Installation assumes you have ruby and bundler installed. If you are not familiar with ruby please ping me and I'll walk you through getting set up. Note you don't actually have to _code_ in ruby to contribute to or use nilclass.

**Intall**

    $ git clone git@github.com:plusjade/nilclass.com.git
    $ cd nilclas.com
    $ bundle


**Start the local server**

    $ bundle exec ruhoh s

The development server runs on <http://localhost:9292/>

The server should automatically update to the latest changes as you update files. Sometimes it does not, in which case you just need to restart the server.


**Compile nilclass to its published state**

    $ bundle exec ruhoh compile

The website outputs to `./compiled`


**WARNING**

nilclass uses a special branch of ruhoh 3.0. ruhoh 3.0 is not publically released so the current [ruhoh documentation](http://ruhoh.com/docs/2/) may lead you astray in some instances. However, you should require minimal interaction with ruhoh itself. 

In general, ruhoh provides four core services:

1. [Asset pipeline](http://ruhoh.com/docs/2/asset-pipeline/) which makes using haml, sass, and asset-fingerprinting easy and automatic.
1. Parse special markdown formatted files (files with the .nilclass extension) into a JSON payload for consumption by the diagram engine.
1. Compile all templates and files into 100% static web pages.
1. Publish static web site to Amazon s3.


## Contributing

> nilclass should be considered unstable alpha software. I very much appreciate and encourage collaboration but should provide a word of caution as to the stability of the API.
Things are sure to change, perhaps drastically, so please feel free to start a dialogue in the issues as to your ideas for contribution. Thanks!

Add changes by following the GitHub conventions of forking the repo, committing your changes, and issuing a pull request when you are ready.

Please work in a topical branch and rebase with master often so your pull requests always apply cleanly. If you don't know what the hell I just said, that's cool, just pull request and I'll help you =).


## A Conceptual Overview of How Diagrams Work

A course is composed of two files: a diagram file and a content file.

### Diagram files

The diagram file is made of JSON. It contains the instructions that build the actual diagram visualizations.

[Example diagram file](https://github.com/plusjade/nilclass.com/tree/master/courses-data/how-websites-work/diagram.json).

The diagram is a visualization; it transitions from one state to another.
Therefore the diagram instructions actually define an Array of _states_.
Each state implicitly builds onto the other. That is, state 3 implicitly starts from the result of the combination of state 1 and state 2.
This is a convenience, since it is common that each state procedurally adds a bit more elements to the last state.

**Diagram State API**

```javascript
{
    "diagramState" : "start",
    "actions" : [
        {
            "method" : "add",
            "items" : [
                {
                    "icon" : "user-2",
                    "id" : "You"
                }
            ]
        }
    ]
    ,
    "positions" : {
        "You" : [100, 200]
    }
}
```

- **diagramState** - The name of the state. This is used as an id for reference within the content file.
- **actions** - Actions to carry out in order to build the actual diagram. (add/delete items).
- **positions** - The `x,y` coordinate positions for each item. Positions need only be specified for _changes_ in position.

Note that all items require a unique ID within a course context. The id can be anything, which as of now I am just using the names.

**Diagram Canvas and Positioning**

The diagram is an SVG node with a viewBox of `[1200, 500]` (x,y). These are arbitrary units, not pixels. Arbitrary units allow the diagram to scale perfectly in proportion. Note that conventual `width` is specified as 100%, so the units will convert to whatever pixel ratio is correct for the given width of the browser window.

For example, to place a node in the center of the diagram, you would give it a position of `[600, 250]`. The actual pixel width of the viewport does not matter.

Understanding the viewBox [1](http://www.justinmccandless.com/blog/Making+Sense+of+SVG+viewBox's+Madness), [2](http://www.w3.org/TR/SVG/coords.html) is crucial to becoming productive in SVG and nilclass.

Lastly, in defining positions within the "states" object as seen above, only _new_ or _changing_ item positions need to be speficied. The positions, just like the states, all cascade down into one another.


### Content files


[Example content file](https://github.com/plusjade/nilclass.com/tree/master/courses-data/how-websites-work/content.json).

The content file holds the textual content provided with each step of the course as well as instructions for _overlays_. Overlays typically consist of various ways to highlight existing diagram paths and nodes.
Overlays are considered content in this respect and not part of the actual diagram structure, so that's why they are specified in the content file.

Note that content does not necessarily map 1 to 1 with diagram states. This is because not all _content steps_ need to change _diagram states_. Sometimes content steps will simply highlight or focus on different items or paths of the same diagram state. Therefore, each content step specifies which diagram state it is referring to via `diagramState`.

Please study existing content files to get a feel for the API. Edit an existing course to see how things change, then try creating your own course!


### License

<a rel="license" href="http://creativecommons.org/licenses/by-sa/4.0/"><img alt="Creative Commons License" style="border-width:0" src="https://i.creativecommons.org/l/by-sa/4.0/88x31.png" /></a><br /><span xmlns:dct="http://purl.org/dc/terms/" href="http://purl.org/dc/dcmitype/InteractiveResource" property="dct:title" rel="dct:type">Nilclass</span> by <a xmlns:cc="http://creativecommons.org/ns#" href="http://plusjade.com/" property="cc:attributionName" rel="cc:attributionURL">Jade Dominguez</a> is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by-sa/4.0/">Creative Commons Attribution-ShareAlike 4.0 International License</a>.<br />Based on a work at <a xmlns:dct="http://purl.org/dc/terms/" href="https://github.com/plusjade/nilclass.com/" rel="dct:source">https://github.com/plusjade/nilclass.com/</a>.

Usually I use MIT license but since nilclass is an education-based work I think it is more valuable to require a source citation so consumers of the educational content have a better idea of where lessons, content, and concepts are derived in order to make more informed choices regarding their educational journey. Additionally, I envision a community where lessons are iteratively improved.


### Thanks!

