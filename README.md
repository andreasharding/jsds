JavaScript in Data Science
==========================

A set of demos and training presentations on using JavaScript from a data science perspective.
It started as a rewrite of an R-Shiny project that had no analytical code: it was pure web development, but done without any of the resources or tooling normally available to web developers. That made it painful.
It is intended to help data scientists, who often use only R and/or Python, to do things like create data visualisations directly in JavaScript. If the data science project is intended to be presented to the end user in a web browser, doing it in JavaScript is often better and easier than having to rely on indirect tools like Shiny (some simple use-cases excepted...).
It may require a bit of extra work, but this should be repaid in many ways, such as more choice of tools and better performance.

It is a work in progress: proper documentation and more/better demos will be added, as per the sessions indicated in the presentation overview:

<h3>0. Servers</h3>
<h4 class="highlighted">What do they do?</h4>
Naturally, the server runs in JavaScript - either using the Express framework, or as a basic no-dependency simple server.
There is also a Python Flask server, in case you don't have node.js installed.

Demos: 
    - getting data from the server using AJAX
    - sending data using POST
    - two-way communications between browser and server using websockets
    - demonstrating how the server can set cookies in the browser
    - how the server can run Python or R scripts
Note: the demos are intended to run with the full, Express, server (index.js) - not all examples have code supporting them in the basic servers.


<h3>1. Get data</h3>
<h4 class="highlighted">Introduction to async programming</h4>

<h3>2. Wrangle data</h3>
<h4 class="highlighted">The joys of JSON</h4>

<h3>3. More data wrangling</h3>
<h4 class="highlighted">tidy data in JavaScript</h4>

<h3>4. Data visualisation</h3>
<h4 class="highlighted">graphing/charting</h4>

<h3>5. Data visualisation</h3>
<h4 class="highlighted">network graphing</h4>

<h3>6. Maps</h3>
<h4 class="highlighted">How to display geographic data</h4>

<h3>7. Building web pages</h3>
<h4 class="highlighted">HTML, CSS frameworks, etc.</h4>

<h3>8. Odds and ends</h3>
<h4 class="highlighted">This is the fun stuff involving ML/AI</h4>

<h3>Some reading material to get you started</h3>
<ul>
<li>A good general tutorial <a href="https://javascript.info/">https://javascript.info/</a></li>
<li>MDN: Learn web development <a href="https://developer.mozilla.org/en-US/docs/Learn">https://developer.mozilla.org/en-US/docs/Learn</a></li>
<li>Using JavaScript in data science <a href="http://js4ds.org/">http://js4ds.org/</a></li>
<li>D3 book <a href="http://using-d3js.com/index.html">http://using-d3js.com/index.html</a></li>
</ul>



Installation
------------
This repo doesn't have any dependencies included, so you will have to install these before running:

`cd /path/to/jsds/`<br />
`npm install`


and/or - for Python:

`pip install Flask`

It may be a good idea to also have R installed on your computer for any R-based examples.


Running
-------

This is set up to run from a node.js + express server: <br />
`node index.js` (do this in a terminal window!)

However, for those who cannot use npm (i.e. because their machine is behind a firewall), there is a minimal server: <br />
`node simple_server.js`

or, if you prefer, a Python equivalent using Flask: <br />
`python simple_server.py`

For completeness, if you were to run this from a traditional LAMP setup, the ajax calls for the ICED demo can use the php script `get_data.php`

The actual tutorial files are in `./static/presentation/` - these will run without the need for any server - just open them in your browser (double-click on them...)

There are a few other demos within this that are designed to run with a server. 
Once you launch the server and go to the page it is running under e.g. [http://localhost:3000](http://localhost:3000) for the express version, you will see links to these.

These demos mostly have only a minimal UI as they are designed to output to the developer tools console, or the server console for some examples.

