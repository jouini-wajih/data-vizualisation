// Load the data from CSV
d3.csv('data/processed.csv').then(data => {
  // Filter the data based on the selected district
  const districtSelect = document.getElementById('district');
  let selectedDistrict = districtSelect.value;
  districtSelect.addEventListener('change', () => {
    selectedDistrict = districtSelect.value;
    updateChart();
  });

  // Define color scale based on source names
  const colorScale = d3.scaleOrdinal()
    .domain(data.map(d => d.source))
    .range(['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf']);

  // Set up the SVG and other variables
  const margin = { top: 20, right: 20, bottom: 40, left: 60 };
  const width = 800 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  const svg = d3.select('#candlestick-chart')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  // Extract the necessary data for the Candlestick Chart
  const candlestickData = data.map(d => ({
    source: d.source,
    village: d.village,
    district: d.district,
    ecoli: +d.ecoli,
    ph: +d.ph,
    electrical_conductivity: +d.electrical_conductivity,
    turbidity: +d.turbidity,
    color_apparent: +d.color_apparent,
    total_dissolved_salts: +d.total_dissolved_salts,
    total_alkalinity: +d.total_alkalinity,
    bicarbonates: +d.bicarbonates,
    total_hardness: +d.total_hardness,
    CalciumHardardness: +d.CalciumHardardness,
    magnesium_hardness: +d.magnesium_hardness,
    fluoride: +d.fluoride,
    chloride: +d.chloride,
    sulphate: +d.sulphate,
    nitrites_n: +d.nitrites_n,
    nitrates_n: +d.nitrates_n,
    ammonium_n: +d.ammonium_n,
    phosphates_p: +d.phosphates_p
  }));

  // Define the updateChart function
  function updateChart() {
    // Filter the data based on the selected district
    const filteredData = candlestickData.filter(d => d.district === selectedDistrict);

    // Set up the x and y scales
    const xScale = d3.scaleBand()
      .domain(filteredData.map(d => d.village)) // Use village names for x-axis
      .range([0, width])
      .padding(0.2);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(filteredData, d => d.ph)])
      .range([height, 0]);

    // Remove existing candlestick elements
    svg.selectAll('.candlestick').remove();

    // Draw the candlestick elements
    const candlesticks = svg.selectAll('.candlestick')
      .data(filteredData)
      .enter()
      .append('g')
      .attr('class', 'candlestick')
      .attr('transform', d => `translate(${xScale(d.village)},0)`)
      .on('mouseover', handleMouseOver)
      .on('mouseout', handleMouseOut);

    candlesticks.append('line')
      .attr('class', 'candlestick-line')
      .attr('x1', xScale.bandwidth() / 2)
      .attr('x2', xScale.bandwidth() / 2)
      .attr('y1', d => yScale(d.ph))
      .attr('y2', d => yScale(d.turbidity))
      .attr('stroke', d => colorScale(d.source))
      .attr('stroke-width', 2);

    candlesticks.append('rect')
      .attr('class', 'candlestick-rect')
      .attr('x', xScale.bandwidth() * 0.25)
      .attr('y', d => yScale(Math.max(d.ph, d.turbidity)))
      .attr('width', xScale.bandwidth() * 0.5)
      .attr('height', d => Math.abs(yScale(d.ph) - yScale(d.turbidity)))
      .attr('fill', d => colorScale(d.source))
      .attr('stroke', d => colorScale(d.source))
      .attr('stroke-width', 2);

    // Update the x-axis
    svg.select('.x-axis')
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end')
      .attr('dx', '-0.8em')
      .attr('dy', '0.15em');

    // Update the y-axis
    svg.select('.y-axis')
      .call(d3.axisLeft(yScale));

    // Update the y-axis label
    svg.select('.y-axis-label')
      .text('pH'); // Add desired label for the y-axis
  }

  // Add the x-axis
  svg.append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0, ${height})`);

  // Add the y-axis
  svg.append('g')
    .attr('class', 'y-axis');

  // Add the y-axis label
  svg.append('text')
    .attr('class', 'y-axis-label')
    .attr('transform', 'rotate(-90)')
    .attr('y', -margin.left)
    .attr('x', -height / 2)
    .attr('dy', '1em')
    .style('text-anchor', 'middle')
    .text('Water Quality Parameters'); // Add desired label for the y-axis

  // Add tooltip div
  const tooltip = d3.select('body')
    .append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0);

  // Handle mouseover event
  function handleMouseOver(d) {
    const parameterValues = Object.entries(d).filter(([key, value]) => typeof value === 'number');

    tooltip.transition()
      .duration(200)
      .style('opacity', 0.9);

    tooltip.html(
      parameterValues
        .map(([key, value]) => `<strong>${key}:</strong> ${value}`)
        .join('<br>')
    )
      .style('left', `${d3.event.pageX}px`)
      .style('top', `${d3.event.pageY}px`);
  }

  // Handle mouseout event
  function handleMouseOut() {
    tooltip.transition()
      .duration(500)
      .style('opacity', 0);
  }

  // Initial chart rendering
  updateChart();
});
