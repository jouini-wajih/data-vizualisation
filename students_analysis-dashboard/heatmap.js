// Select the target div for the chart
const chartContainerRadial = d3.select("#radial-chart");

// Set the dimensions and margins of the graph
const margin = { top: 50, right: 50, bottom: 50, left: 50 };
const width = 600 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;
const radius = Math.min(width, height) / 2;

// Create an SVG element
const svg = chartContainerRadial
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${width / 2 + margin.left}, ${height / 2 + margin.top})`);

// Load the data from CSV
d3.csv("data/processed.csv")
  .then(data => {
    // Define the columns to include in the radial chart
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

    // Filter the data to include only selected columns
    const filteredData = data.map(d => {
      const filteredObj = {};
      columnsToInclude.forEach(column => {
        filteredObj[column] = +d[column];
      });
      return filteredObj;
    });

    // Create a color scale for the columns
    const colorScale = d3.scaleOrdinal()
      .domain(columnsToInclude)
      .range(["#E27D60", "#85DCB0", "#E8A87C", "#C38D9E", "#41B3A3", "#F3A712", "#C0D461", "#2F2FA2", "#FF5879", "#FFD65B", "#FFB20F", "#00C2A8", "#63D297", "#FF9933", "#0F3057", "#A8D8EA", "#FAE03C", "#9E2B25"]);

    // Create a stack generator
    const stack = d3.stack().keys(columnsToInclude);

    // Generate the stacked data
    const stackedData = stack(filteredData);

    // Define the angle scale
    const angleScale = d3.scaleLinear()
      .domain([0, filteredData.length])
      .range([0, 2 * Math.PI]);

    // Define the radius scale
    const radiusScale = d3.scaleLinear()
      .domain([0, d3.max(stackedData, d => d3.max(d, d => d[1]))])
      .range([0, radius]);

    // Create a group for each column
    const columnGroups = svg.selectAll(".column-group")
      .data(stackedData)
      .enter()
      .append("g")
      .attr("class", "column-group");

    // Create the stacked bars within each group
    const bars = columnGroups.selectAll(".bar")
      .data(d => d)
      .enter()
      .append("path")
      .attr("class", "bar")
      .attr("d", d3.arc()
        .innerRadius((d, i) => radiusScale(d[0]))
        .outerRadius((d, i) => radiusScale(d[1]))
        .startAngle((d, i) => angleScale(i))
        .endAngle((d, i) => angleScale(i + 1))
        .padAngle(0.02)
        .padRadius(radius))
      .attr("fill", (d, i) => colorScale(columnsToInclude[i]));

    // Add labels to each column group
    const labels = columnGroups.append("text")
      .attr("class", "column-label")
      .attr("x", radius + 10)
      .attr("y", (d, i) => -radiusScale(d[0][0]) - 5)
      .text((d, i) => columnsToInclude[i])
      .attr("text-anchor", "start")
      .style("font-size", "12px");

    // Add a central circle
    const centralCircle = svg.append("circle")
      .attr("class", "central-circle")
      .attr("r", radius / 4)
      .attr("fill", "white")
      .attr("stroke", "black")
      .attr("stroke-width", 1);

    // Add tooltip functionality
    const tooltip = chartContainerRadial.append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

    bars.on("mouseover", (event, d) => {
        // Show tooltip with the stacked bar value
        const tooltipText = d3.sum(d.data, e => e[1] - e[0]);
        tooltip.style("opacity", 1)
          .html(`<strong>Value:</strong> ${tooltipText}`)
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY}px`);
      })
      .on("mouseout", () => {
        // Hide tooltip
        tooltip.style("opacity", 0);
      });

  })
  .catch(error => {
    console.log("Error:", error);
  });
