// Load the CSV data
d3.csv('data/processed.csv')
  .then(data => {
    // Create a Leaflet map with a height of 400 pixels
    const map = L.map('map', { height: 700 }).setView([1.3733, 32.2903], 7);

    // Add an OpenStreetMap tile layer to the map
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
      maxZoom: 18
    }).addTo(map);

    // Define the color scales for the different water quality parameters
    const colorScales = {
      ecoli: chroma.scale(['#f4a261', '#e9c46a', '#2a9d8f']).domain([0, 100, 500]),
      ph: chroma.scale(['#264653', '#2a9d8f', '#e9c46a']).domain([0, 7, 14]),
      electrical_conductivity: chroma.scale(['#e76f51', '#f4a261', '#e9c46a']).domain([0, 500, 2000]),
      turbidity: chroma.scale(['#ffffff', '#c9ada7', '#000000']).domain([0, 50, 100]),
      color_apparent: chroma.scale(['#e76f51', '#2a9d8f', '#264653']).domain([0, 10, 20]),
      total_dissolved_salts: chroma.scale(['#e76f51', '#f4a261', '#2a9d8f']).domain([0, 1000, 5000]),
      total_alkalinity: chroma.scale(['#f4a261', '#e9c46a', '#e76f51']).domain([0, 50, 100]),
      bicarbonates: chroma.scale(['#2a9d8f', '#e9c46a', '#f4a261']).domain([0, 50, 100]),
      total_hardness: chroma.scale(['#2a9d8f', '#f4a261', '#e9c46a']).domain([0, 100, 200]),
      CalciumHardardness: chroma.scale(['#e76f51', '#f4a261', '#2a9d8f']).domain([0, 50, 100]),
      magnesium_hardness: chroma.scale(['#2a9d8f', '#f4a261', '#e9c46a']).domain([0, 50, 100]),
      fluoride: chroma.scale(['#2a9d8f', '#e9c46a', '#f4a261']).domain([0, 1, 2]),
      chloride: chroma.scale(['#2a9d8f', '#f4a261', '#e9c46a']).domain([0, 50, 100]),
      sulphate: chroma.scale(['#e76f51', '#e9c46a', '#2a9d8f']).domain([0, 100, 200]),
      ammonium_n: chroma.scale(['#2a9d8f', '#e9c46a', '#f4a261']).domain([0, 0.5, 1]),
      phosphates_p: chroma.scale(['#e76f51', '#e9c46a', '#2a9d8f']).domain([0, 5, 10])
    };

    // Create a color legend
    const legend = L.control({ position: 'bottomright' });
    legend.onAdd = function () {
      const div = L.DomUtil.create('div', 'legend');
      const parameters = Object.keys(colorScales);

      div.innerHTML += '<div><strong>Legend</strong></div>';

      // Loop through the water quality parameters and create the legend items
      parameters.forEach(parameter => {
        const colors = colorScales[parameter].colors(3);
        const labels = ['Low', 'Medium', 'High'];

        div.innerHTML += `
          <div>
            <span class="legend-color" style="background-color:${colors[0]}"></span>
            <span class="legend-label">${parameter}</span>
          </div>
        `;

        // Loop through the labels and colors to create the legend items for each parameter
        for (let i = 0; i < labels.length; i++) {
          div.innerHTML += `
            <div>
              <span class="legend-color" style="background-color:${colors[i]}"></span>
              <span class="legend-label">${labels[i]}</span>
            </div>
          `;
        }
      });

      return div;
    };
    legend.addTo(map);

    // Create a bubble layer for the data points
    const bubbleLayer = L.layerGroup();

    // Function to update the bubble colors based on the selected water quality parameter
    function updateBubbleColors(selectedParameter) {
      // Loop through the data points and update the bubble colors
      data.forEach(point => {
        const lat = parseFloat(point.latitude);
        const lng = parseFloat(point.longitude);

        // Ignore data points with NaN coordinates
        if (isNaN(lat) || isNaN(lng)) {
          console.warn('Invalid coordinates for data point:', point);
          return;
        }

        // Get the value of the selected water quality parameter for the current data point
        const waterQualityValue = parseFloat(point[selectedParameter]);

        // Determine the color based on the water quality value
        let color;
        if (isNaN(waterQualityValue)) {
          color = 'gray'; // Set gray color for invalid or missing data
        } else if (waterQualityValue <= 70) {
          color = 'green'; // Set green color for good quality
        } else {
          color = 'red'; // Set red color for bad quality
        }

        // Update the fill color of the bubble marker
        const bubbleMarker = point.marker;
        bubbleMarker.setStyle({ fillColor: color });
      });
    }

    // Create a bubble marker for each data point
    data.forEach(point => {
      const lat = parseFloat(point.latitude);
      const lng = parseFloat(point.longitude);

      // Ignore data points with NaN coordinates
      if (isNaN(lat) || isNaN(lng)) {
        console.warn('Invalid coordinates for data point:', point);
        return;
      }

      // Create a bubble marker with a popup containing information about the data point
      const bubbleMarker = L.circleMarker([lat, lng], {
        color: 'black',
        weight: 1,
        fillColor: 'green', // Initial fill color
        fillOpacity: 0.8,
        radius: 8
      });

      // Bind a popup to the bubble marker
      bubbleMarker.bindPopup(`
        <strong>Village:</strong> ${point.village}<br>
        <strong>District:</strong> ${point.district}<br>
        <strong>Source:</strong> ${point.source}<br>
      
      `);

      // Add the bubble marker to the bubble layer
      bubbleMarker.addTo(bubbleLayer);

      // Add the marker reference to the data point for easy access later
      point.marker = bubbleMarker;
    });

    // Add the bubble layer to the map
    bubbleLayer.addTo(map);

    // Event listener for parameter select change
    const parameterSelect = document.getElementById('parameter-select');
    parameterSelect.value = 'total_dissolved_salts'; // Set default selection to 'total_dissolved_salts'
    parameterSelect.addEventListener('change', function () {
      const selectedParameter = this.value;
      updateBubbleColors(selectedParameter);
    });
  })
  .catch(error => {
    console.error('Error loading data:', error);
  });
