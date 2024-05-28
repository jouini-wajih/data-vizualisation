

// Function to load data from all sheets in an Excel file
function loadExcelData(file) {
    // Use d3-fetch library to load the Excel file
    d3.xlsx(file).then(function(data) {
      // Get the sheet names
      var sheetNames = data.sheetNames;
  
      // Loop through each sheet
      sheetNames.forEach(function(sheetName) {
        // Get the data for the current sheet
        var sheetData = data[sheetName];
  
        // Process the data for the current sheet
        processData(sheetName, sheetData);
      });
    });
  }
  
  // Function to process the data for each sheet
  function processData(sheetName, data) {
    // Do whatever you want with the data for each sheet
    console.log("Sheet: " + sheetName);
    console.log(data);
  }
  
  // Call the loadExcelData function with the file path
  var filePath = 'data/Water_Quality_Dataset.xlsx';
  loadExcelData(filePath);
  