function initializeBarChart(initialColumn,svgId,xLabel,yLabel) {
    d3.csv('data/processed_file.csv')
        .then(data => {
            // Save the data to a global variable
            window.data = data;

            // Render the initial chart
            CreateBarChart(initialColumn, svgId, xLabel, yLabel);
        })
        .catch(error => {
            console.error('Error loading data:', error);
        });
}




// Function to update the bar chart based on the selected column
function CreateBarChart(column, svgId, xLabel, yLabel) {
    // Remove the previous bar chart, if exists
    d3.select(svgId).selectAll('*').remove();

    // Extract the required data for the bar chart
    const counts = processData(column);

    // Render the bar chart
    renderChart(column, counts, svgId, xLabel, yLabel);
}




// Function to process data for a specific column
function processData(column) {
    const countsSucceed = {};
    const countsFail = {};

    window.data.forEach(row => {
        const value = row[column];
        const success = row.success === 'succeed' ? 1 : 0;
        if (success) {
        countsSucceed[value] = (countsSucceed[value] || 0) + 1;
        } else {
        countsFail[value] = (countsFail[value] || 0) + 1;
        }
    });

    return { countsSucceed, countsFail };
}




// Function to render the bar chart
function renderChart(column, counts, svgId, xLabel, yLabel) {
    const { countsSucceed, countsFail } = counts;

    // Define the dimensions and margins for the bar chart
    const width = 600;
    const height = 400;
    const margin = { top: 50, right: 50, bottom: 70, left: 70 };

    // Create the bar chart SVG container
    const svg = d3.select(svgId)
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create x-scale and y-scale for the bar chart
    const Fedus = Object.keys(countsSucceed);
    const xScale = d3.scaleBand()
        .domain(Fedus)
        .range([0, width])
        .padding(0.2);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max([...Object.values(countsSucceed), ...Object.values(countsFail)])])
        .range([height, 0]);

    // Create x-axis and y-axis for the bar chart
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    // Add x-axis to the bar chart
    svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(xAxis)
        .selectAll('text')
        .style('text-anchor', 'end')
        .attr('transform', 'rotate(-45)')
        .attr('dx', '-0.8em')
        .attr('dy', '0.15em')
        .attr('fill', 'black');

    // Add y-axis to the bar chart
    svg.append('g')
        .call(yAxis);

    // Define colors for bars
    const colorSucceed = '#1f77b4';
    const colorFail = '#ff7f0e';

    // Create bars for the 'success = 1' data
    const barsSucceed = svg.selectAll('.bar-succeed')
        .data(Fedus)
        .enter()
        .append('rect')
        .attr('class', 'bar-succeed')
        .attr('x', d => xScale(d))
        .attr('y', d => yScale(countsSucceed[d]))
        .attr('width', xScale.bandwidth() / 2)
        .attr('height', d => height - yScale(countsSucceed[d]))
        .attr('fill', colorSucceed);

    // Create bars for the 'success = 0' data
    const barsFail = svg.selectAll('.bar-fail')
        .data(Fedus)
        .enter()
        .append('rect')
        .attr('class', 'bar-fail')
        .attr('x', d => xScale(d) + xScale.bandwidth() / 2)
        .attr('y', d => yScale(countsFail[d]))
        .attr('width', xScale.bandwidth() / 2)
        .attr('height', d => height - yScale(countsFail[d]))
        .attr('fill', colorFail);

    // Add legend
    const legend = svg.append('g')
        .attr('class', 'legend')
        .attr('transform', `translate(${width - 100}, 30)`);

    legend.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', 20)
        .attr('height', 20)
        .attr('fill', colorSucceed);

    legend.append('text')
        .attr('x', 30)
        .attr('y', 12)
        .text('Success = 1')
        .style('font-size', '12px');

    legend.append('rect')
        .attr('x', 0)
        .attr('y', 30)
        .attr('width', 20)
        .attr('height', 20)
        .attr('fill', colorFail);

    legend.append('text')
        .attr('x', 30)
        .attr('y', 42)
        .text('Success = 0')
        .style('font-size', '12px');

    // Add x-axis label
    svg.append('text')
        .attr('x', width / 2)
        .attr('y', height + margin.bottom / 2 + 20)
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .text(xLabel);

    // Add y-axis label
    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -height / 2)
        .attr('y', -margin.left / 2 - 20)
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .text(yLabel);
}

// initializeBarChart('Fedu', '#interactiveBar_F', 'Fedu Level', 'Number of students');
// initializeBarChart('Medu', '#interactiveBar_M', 'Medu Level', 'Number of students');

initializeBarChart('famsize', '#famsizeBar', 'Family Size', 'Number of students');
initializeBarChart('Pstatus', '#PstatusBar', 'Parent s Cohabitation Status', 'Number of students');

initializeBarChart('Mjob', '#MjobBar', 'Mother s Job', 'Number of students');
initializeBarChart('Fjob', '#FjobBar', 'Father s job', 'Number of students');

initializeBarChart('famrel', '#famrelBar', 'Quality of Family Relationships', 'Number of students');
initializeBarChart('famsup', '#famsupBar', 'Family Educational Support', 'Number of students');