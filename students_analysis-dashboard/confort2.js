// Load the data and render the initial chart
d3.csv("data/processed_file.csv")
  .then((data) => {
    // Save the data to a global variable
    window.data = data;

    // Filter the data based on the selected column
    const colSelect = document.getElementById("confort2");
    let selectedColumn = colSelect.value;
    updateChart22(selectedColumn);

    colSelect.addEventListener("change", () => {
      selectedColumn = colSelect.value;
      updateChart22(selectedColumn);
    });
  })
  .catch((error) => {
    console.error("Error loading data:", error);
  });

// Function to update the line chart based on the selected column
function updateChart22(column) {
  // Remove the previous line chart, if exists
  d3.select("#confort2_chart").selectAll("*").remove();

  // Extract unique values of the selected column
  const uniqueValues = [
    ...new Set(window.data.map((row) => row[column])),
  ].sort();

  // Compute the average final result for each unique value
  const averages = uniqueValues.map((value) => {
    const filteredData = window.data.filter((row) => row[column] === value);
    const sum = filteredData.reduce(
      (acc, curr) => acc + parseFloat(curr.final_result),
      0
    );
    return sum / filteredData.length;
  });

  // Find the minimum value of the average final result
  const minYValue = Math.min(...averages);

  // Combine unique values with corresponding averages
  const dataPoints = uniqueValues.map((value, index) => ({
    x: value,
    y: averages[index],
  }));

  // Define dimensions and margins
  const width = 520;
  const height = 400;
  const margin = { top: 50, right: 50, bottom: 70, left: 70 };

  // Create the SVG container for the line chart
  const svg = d3
    .select("#confort2_chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Define scales
  const xScale = d3
    .scaleBand()
    .domain(uniqueValues)
    .range([0, width])
    .padding(0.1);

  const yScale = d3
    .scaleLinear()
    .domain([minYValue, d3.max(dataPoints, (d) => d.y)])
    .range([height, 0]);

  // Create line function
  const line = d3
    .line()
    .x((d) => xScale(d.x) + xScale.bandwidth() / 2)
    .y((d) => yScale(d.y));

  // Add the line to the chart
  svg
    .append("path")
    .datum(dataPoints)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 2)
    .attr("d", line);

  // Add data points
  svg
    .selectAll(".datapoint")
    .data(dataPoints)
    .enter()
    .append("circle")
    .attr("class", "datapoint")
    .attr("cx", (d) => xScale(d.x) + xScale.bandwidth() / 2)
    .attr("cy", (d) => yScale(d.y))
    .attr("r", 4)
    .attr("fill", "orange");

  // Add x-axis
  svg
    .append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(xScale));

  // Add y-axis
  svg.append("g").call(d3.axisLeft(yScale));

  // Add x-axis label
  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", height + margin.bottom / 2 + 20)
    .attr("text-anchor", "middle")
    .style("font-size", "12px")
    .text(column);

  // Add y-axis label
  svg
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -margin.left / 2 - 20)
    .attr("text-anchor", "middle")
    .style("font-size", "12px")
    .text("Average Final Result");
}
