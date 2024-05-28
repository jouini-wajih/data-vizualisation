// Load the data and render the initial chart
d3.csv("data/processed_file.csv")
  .then((data) => {
    // Save the data to a global variable
    window.data = data;

    // Set up event listener for dropdown change
    document
      .getElementById("xSelect")
      .addEventListener("change", updateBubblePlot);

    // Initial rendering of the bubble plot
    updateBubblePlot();
  })
  .catch((error) => {
    console.error("Error loading data:", error);
  });

// Function to update the bubble plot based on the selected column from dropdown
function updateBubblePlot() {
  // Remove the previous bubble plot, if exists
  d3.select("#bubblePlot").selectAll("*").remove();

  // Get the selected column for the x-axis from dropdown
  const selectedColumn = document.getElementById("xSelect").value;

  // Group data by unique values of the selected column
  const groupedData = d3.group(window.data, (d) => d[selectedColumn]);

  // Calculate average final result and count of instances for each unique value
  const bubbleData = Array.from(groupedData, ([key, value]) => ({
    value: key,
    averageFinalResult: d3.mean(value, (d) => +d.final_result),
    count: value.length,
  }));

  // Sort unique values
  bubbleData.sort((a, b) => d3.ascending(a.value, b.value));

  // Define dimensions and margins
  const width = 500;
  const height = 400;
  const margin = { top: 50, right: 50, bottom: 70, left: 70 };

  // Create SVG container for the bubble plot
  const svg = d3
    .select("#bubblePlot")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Define scale for circle size based on count of instances
  const radiusScale = d3
    .scaleSqrt()
    .domain([0, d3.max(bubbleData, (d) => d.count)])
    .range([0, 100]); // Adjust the range as needed for bubble sizes

  // Define scale for x-axis and y-axis
  const xScale = d3
    .scaleBand()
    .domain(bubbleData.map((d) => d.value))
    .range([0, width])
    .padding(0.1);

  const yScale = d3
    .scaleLinear()
    .domain([0, 20]) // Fixed domain for y-axis
    .range([height, 0])
    .nice();

  // Add x-axis
  svg
    .append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(xScale))
    .selectAll("text")
    .attr("y", 0)
    .attr("x", 9)
    .attr("dy", ".35em")
    .attr("transform", "rotate(90)")
    .style("text-anchor", "start");

  // Add y-axis
  svg.append("g").call(d3.axisLeft(yScale).ticks(5));

  // Add lines connecting circles to x and y axes
  bubbleData.forEach((d) => {
    // Add line to x-axis
    svg
      .append("line")
      .attr("x1", xScale(d.value) + xScale.bandwidth() / 2)
      .attr("y1", yScale(d.averageFinalResult))
      .attr("x2", xScale(d.value) + xScale.bandwidth() / 2)
      .attr("y2", height)
      .attr("stroke", "black")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "5,5"); // Dotted line

    // Add line to y-axis
    svg
      .append("line")
      .attr("x1", xScale(d.value) + xScale.bandwidth() / 2)
      .attr("y1", yScale(d.averageFinalResult))
      .attr("x2", 0)
      .attr("y2", yScale(d.averageFinalResult))
      .attr("stroke", "black")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "5,5"); // Dotted line
  });

  // Add bubbles with different colors
  svg
    .selectAll("circle")
    .data(bubbleData)
    .enter()
    .append("circle")
    .attr("cx", (d) => xScale(d.value) + xScale.bandwidth() / 2)
    .attr("cy", (d) => yScale(d.averageFinalResult))
    .attr("r", (d) => radiusScale(d.count))
    .style("fill", (d, i) => d3.schemeCategory10[i % 10]) // Assign different colors based on index
    .style("opacity", 0.7)
    .on("mouseover", handleMouseOver)
    .on("mouseout", handleMouseOut);

  // Function to handle mouseover event
  function handleMouseOver(event, d) {
    // Show tooltip
    const tooltip = svg
      .append("text")
      .attr("x", xScale(d.value) + xScale.bandwidth() / 2)
      .attr("y", yScale(d.averageFinalResult) - radiusScale(d.count) - 5) // Position above the bubble
      .attr("text-anchor", "middle")
      .attr("fill", "black")
      .attr("font-size", "12px")
      .text(
        `Value: ${d.value}\nAvg Final Result: ${d.averageFinalResult}\nCount: ${d.count}`
      );
  }

  // Function to handle mouseout event
  function handleMouseOut(event, d) {
    // Hide tooltip
    svg.select("text").remove();
  }

  // Add x-axis label
  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", height + margin.bottom / 2)
    .attr("text-anchor", "middle")
    .text(selectedColumn);

  // Add y-axis label
  svg
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -margin.left / 2)
    .attr("text-anchor", "middle")
    .text("Average Final Result");

  // Add x-axis value text
}
