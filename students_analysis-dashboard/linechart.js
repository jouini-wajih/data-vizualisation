// Load the data from CSV
d3.csv("data/processed.csv").then(data => {
  // Define the columns to include in the stacked bar chart
  const columnsToInclude = [
    "ecoli",
    "pH",
    "electrical_conductivity",
    "turbidity",
    "color_apparent",
    "total_dissolved_salts",
    "total_alkalinity",
    "bicarbonates",
    "total_hardness",
    "CalciumHardardness",
    "magnesium_hardness",
    "fluoride",
    "chloride",
    "sulphate",
    "nitrites",
    "nitrates_n",
    "ammonium_n",
    "phosphates_p"
  ];

  const margin = { top: 20, right: 30, bottom: 30, left: 120 };
  const width = 1600 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  const svg = d3.select("#graph")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Prepare the data for the stacked bar chart
  const stackedData = d3.stack()
    .keys(columnsToInclude)(data)
    .map(d => (d.forEach(v => (v.key = d.key)), d));

  // Define the color scale for the stacked bars
  const colorScale = d3.scaleOrdinal()
    .domain(columnsToInclude)
    .range(["#FFC300", "#FF5733", "#C70039", "#900C3F", "#581845", "#003F5C", "#58508D", "#BC5090", "#FF6361", "#FFA600", "#FF8E00", "#FFB700", "#FFD700", "#FFDC47", "#2C7DA0", "#00B4D8", "#90E0EF", "#FFB5A7"]);

  // Define the x and y scales
  const xScale = d3.scaleLinear()
    .domain([0, d3.max(stackedData, d => d3.max(d, d => d[1]))])
    .range([0, width]);

  const yScale = d3.scaleBand()
    .domain(data.map(d => d.source))
    .range([0, height])
    .padding(0.1);

  // Draw the stacked bars
  svg.selectAll(".bar-group")
    .data(stackedData)
    .join("g")
    .attr("class", "bar-group")
    .attr("fill", d => colorScale(d.key))
    .selectAll("rect")
    .data(d => d)
    .join("rect")
    .attr("class", "bar")
    .attr("x", d => xScale(0))
    .attr("y", d => yScale(d.data.source))
    .attr("width", 0)
    .attr("height", yScale.bandwidth())
    .transition()
    .duration(1000)
    .delay((d, i) => i * 100)
    .attr("x", d => xScale(d[0]))
    .attr("width", d => xScale(d[1]) - xScale(d[0]));

  // Add a legend for the parameter colors
  const legend = svg.append("g")
    .attr("class", "legend")
    .attr("transform", `translate(${width - 200}, ${margin.top})`); // Adjusted transform attribute

  const legendKey = legend.selectAll(".legend-key")
    .data(columnsToInclude)
    .join("g")
    .attr("class", "legend-key")
    .attr("transform", (d, i) => `translate(0, ${i * 18})`);

  legendKey.append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", 8)
    .attr("height", 8)
    .attr("fill", d => colorScale(d));

  legendKey.append("text")
    .attr("x", 15)
    .attr("y", 4)
    .style("alignment-baseline", "middle")
    .style("font-size", "10px")
    .text(d => d);

  // Draw the x-axis
  svg.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(xScale))
    .selectAll("text")
    .style("font-size", "10px");

  // Draw the y-axis
  svg.append("g")
    .call(d3.axisLeft(yScale).tickSizeOuter(0))
    .selectAll("text")
    .style("font-size", "10px");

  // Add labels to the x-axis
  svg.append("text")
    .attr("transform", `translate(${width / 2}, ${height + margin.bottom - 5})`)
    .style("text-anchor", "middle")
    .style("font-size", "12px")
    .text("Parameter Value");

  // Add labels to the y-axis
  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -margin.left + 10)
    .attr("x", -height / 2)
    .style("text-anchor", "middle")
    .style("font-size", "12px")
    .text("Source");
}).catch(error => {
  console.log(error);
});
