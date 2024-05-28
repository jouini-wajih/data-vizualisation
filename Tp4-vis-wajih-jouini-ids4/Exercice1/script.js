var width = 960;
var height = 600;

var svg = d3.select("body")
            .append("svg")
            .attr("width", width)
            .attr("height", height);

var projection = d3.geoAlbersUsa()
                   .translate([width / 2, height / 2])
                   .scale([1000]);

var path = d3.geoPath().projection(projection);

d3.json("us-states.json").then(function(json) {
    svg.selectAll("path")
        .data(json.features)
        .enter()
        .append("path")
        .attr("d", path)
        .style("fill", "steelblue");
});

d3.csv("us-ag-productivity.csv").then(function(data) {
    var color = d3.scaleSequential(d3.interpolateBlues)
                  .domain([0, d3.max(data, function(d) { return +d.value; })]);

    svg.selectAll("path")
       .style("fill", function(d) {
           var state = d.properties.name;
           var productivity = data.find(function(item) {
               return item.state === state;
           });
           return productivity ? color(+productivity.value) : "#ccc";
       });
});
