const width = 960;
const height = 600;

const svg = d3.select("svg");

const projection = d3
  .geoConicConformal()
  .center([2.454071, 46.279229])
  .scale(2800);

const path = d3.geoPath().projection(projection);

const color = d3
  .scaleQuantize()
  .range(["#f7fcf5", "#d9f0d9", "#addd8e", "#78c679", "#31a354"]);

const tooltip = d3.select(".tooltip");

d3.csv("GrippeFrance2014.csv").then((data) => {
  console.log("Flu data:", data);

  color.domain([0, d3.max(data, (d) => +d.somme2014)]);

  d3.json("regions.json").then((json) => {
    console.log("GeoJSON data:", json);

    for (let i = 0; i < data.length; i++) {
      const dataRegion = data[i].region;
      const dataValue = +data[i].somme2014;

      for (let j = 0; j < json.features.length; j++) {
        const jsonRegion = json.features[j].properties.nom;

        if (dataRegion === jsonRegion) {
          json.features[j].properties.value = dataValue;
          break;
        }
      }
    }

    svg
      .selectAll("path")
      .data(json.features)
      .enter()
      .append("path")
      .attr("d", path)
      .style("fill", (d) => {
        const value = d.properties.value;
        return value ? color(value) : "#ccc";
      })
      .on("mouseover", function (event, d) {
        console.log("Mouseover:", d);
        tooltip.style("visibility", "visible");
        tooltip
          .html(
            `<strong>${d.properties.nom}</strong><br/>Flu cases: ${d.properties.value}`
          )
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 20 + "px");
      })
      .on("mouseout", function () {
        console.log("Mouseout");
        tooltip.style("visibility", "hidden");
      });
  });
});
