var width = 960;
var height = 600;

var svg = d3.select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

var projection = d3.geoConicConformal()
    .center([2.454071, 46.279229])
    .scale(2800);

var path = d3.geoPath().projection(projection);

var color = d3.scaleLinear()
    .range(["white", "green"])
    .interpolate(d3.interpolateLab);

d3.json("departements-version-simplifiee.json")
    .then(function(france) {
        d3.csv("covid2.csv")
            .then(function(data) {
                processData(france, data);
            })
            .catch(function(error) {
                console.error("Error loading covid2.csv:", error);
            });
    })
    .catch(function(error) {
        console.error("Error loading departements-version-simplifiee.json:", error);
    });

function processData(france, data) {
    var covidMap = {};

    data.forEach(function(d) {
        covidMap[d.departement] = +d.hosp;
    });

    var maxHosp = d3.max(data, function(d) {
        return +d.hosp;
    });

    color.domain([0, maxHosp]);

    svg.append("g")
        .attr("class", "departments")
        .selectAll("path")
        .data(france.features)
        .enter().append("path")
        .attr("d", path)
        .style("fill", function(d) {
            var value = covidMap[d.properties.nom];
            return value ? color(value) : "gray";
        })
        .on("mouseover", function(d) {
            console.log("Mouseover: ", d);
        });
}
