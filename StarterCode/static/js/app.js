// Declare data variable outside the callback function
let data;

// Define the extractDataForId function
function extractDataForId(selectedId) {
  const selectedData = data.samples.find(item => item.id === selectedId);
  if (selectedData) {
    return {
      id: selectedData.id,
      sample_values: selectedData.sample_values,
      otu_ids: selectedData.otu_ids,
      otu_labels: selectedData.otu_labels,
    };
  }
  return null; // Handle the case when the selected ID is not found
}

// Define a function to display metadata
function displayMetadata(selectedId) {
  const metadata = data.metadata.find(item => item.id == selectedId);

  // Clear any existing metadata
  d3.select("#sample-metadata").html("");

  // Display each key-value pair from the metadata
  if (metadata) {
    Object.entries(metadata).forEach(([key, value]) => {
      d3.select("#sample-metadata")
        .append("p")
        .text(`${key}: ${value}`);
    });
  } else {
    d3.select("#sample-metadata")
      .append("p")
      .text("Metadata not found for this ID.");
  }
}

// Create a function to update both the bar chart and bubble chart
function updateCharts(selectedId) {
  const selectedData = extractDataForId(selectedId);
  if (selectedData) {
    // Extract data for the selected ID
    const id = selectedData.id;
    const sample_values = selectedData.sample_values;
    const otu_ids = selectedData.otu_ids;
    const otu_labels = selectedData.otu_labels;

    // Update the bar chart
    const filteredData = sample_values;
    const topValues = filteredData.slice(0, 10).reverse();
    const topIds = otu_ids.slice(0, 10).reverse();
    const topLabels = otu_labels.slice(0, 10).reverse();

    const barTrace = {
      x: topValues,
      y: topIds.map(id => `OTU ${id}`),
      text: topLabels,
      type: "bar",
      orientation: "h",
    };

    const barLayout = {
      title: `Top 10 OTUs for Test Subject ${selectedId}`,
      xaxis: { title: "Sample Values" },
    };

    Plotly.newPlot("bar", [barTrace], barLayout);

    // Update the bubble chart
    const bubbleTrace = {
      x: otu_ids,
      y: sample_values,
      text: otu_labels,
      mode: 'markers',
      marker: {
        size: sample_values,
        color: otu_ids,
        colorscale: 'Viridis'
      }
    };

    const bubbleLayout = {
      title: `Bubble Chart for Test Subject ${selectedId}`,
      xaxis: { title: "OTU ID" },
      yaxis: { title: "Sample Values" }
    };

    Plotly.newPlot("bubble", [bubbleTrace], bubbleLayout);

  } else {
    console.log(`Data not found for ID: ${selectedId}`);
  }
}

// Step 1: Read the JSON data from the URL
let url = "samples.json";
d3.json(url).then(jsonData => {
  data = jsonData; // Store the data globally

  // Step 4: Populate the dropdown with test subject IDs
  const selectDropdown = d3.select("#selDataset");

  // Populate the dropdown with options
  data.names.forEach(id => {
    selectDropdown.append("option").text(id).property("value", id);
  });

  // Step 5: Define an event handler for the dropdown
  function optionChanged() {
    // Get the selected ID from the dropdown
    const selectedId = selectDropdown.property("value");
    // Call the function to update both the bar chart and bubble chart
    updateCharts(selectedId);
    // Display metadata
    displayMetadata(selectedId);
  }

  // Attach the event handler to the dropdown
  selectDropdown.on("change", optionChanged);

  // Step 6: Initialize the bar and bubble charts with default data (e.g., the first ID)
  updateCharts(data.names[0]);
}).catch(error => {
  console.error("Error loading data:", error);
});

