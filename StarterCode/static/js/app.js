// declare data variable outside the callback function
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
  
// Step 1: Read the JSON data from the URL
let url = "samples.json";
d3.json(url).then(data => {
  // Step 2: Extract the required data for the selected ID
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

  // Step 3: Create a function to update the bar chart
  function updateBarChart(selectedId) {
    const selectedData = extractDataForId(selectedId);
    if (selectedData) {
      // Extract data for the selected ID
      const id = selectedData.id;
      const sample_values = selectedData.sample_values;
      const otu_ids = selectedData.otu_ids;
      const otu_labels = selectedData.otu_labels;

      // Filter data for the selected ID
      // Assuming "selectedId" contains the selected ID
      const filteredData = sample_values;

      // Sort the filtered data in descending order and select the top 10
      const topValues = filteredData.slice(0, 10).reverse();

      // Select the top 10 OTU IDs and labels
      const topIds = otu_ids.slice(0, 10).reverse();
      const topLabels = otu_labels.slice(0, 10).reverse();

      // Create a horizontal bar chart
      const trace = {
        x: topValues,
        y: topIds.map(id => `OTU ${id}`), // Add "OTU" to labels
        text: topLabels,
        type: "bar",
        orientation: "h",
      };

      const layout = {
        title: `Top 10 OTUs for Test Subject ${id}`,
        xaxis: { title: "Sample Values" },
      };

      Plotly.newPlot("bar", [trace], layout);
    } else {
      console.log(`Data not found for ID: ${selectedId}`);
    }
  }

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
    // Call the function to update the bar chart
    updateBarChart(selectedId);
  }

  // Attach the event handler to the dropdown
  selectDropdown.on("change", optionChanged);

  // Step 6: Initialize the bar chart with default data (e.g., the first ID)
  updateBarChart(data.names[0]);
}).catch(error => {
  console.error("Error loading data:", error);
});

// Step 7: Create a bubble chart
function updateBubbleChart(selectedId) {
  // Get data for the selected ID
  const selectedData = extractDataForId(selectedId);

  if (selectedData) {
    // Extract data for the selected ID
    const sampleValues = selectedData.sample_values;
    const otuIds = selectedData.otu_ids;
    const otuLabels = selectedData.otu_labels;

    // Set up the SVG container for the bubble chart
    const svg = d3.select("#bubble");
    const width = +svg.attr("width");
    const height = +svg.attr("height");

    // Create scales for the bubble chart
    const xScale = d3.scaleLinear()
      .domain([0, d3.max(sampleValues)]) // Modify the domain as needed
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(sampleValues)]) // Modify the domain as needed
      .range([height, 0]);

    const rScale = d3.scaleLinear()
      .domain([0, d3.max(sampleValues)]) // Modify the domain as needed
      .range([5, 50]); // Adjust the range based on your needs

    // Create a color scale for markers
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    //remove previous circles
    svg.selectAll("circle").remove();
    svg.selectAll("text").remove();

    // Create circles for each data point
    svg.selectAll("circle")
      .data(sampleValues)
      .enter()
      .append("circle")
      .attr("cx", d => xScale(d))
      .attr("cy", (d, i) => yScale(sampleValues[i]))
      .attr("r", d => rScale(d))
      .attr("fill", (d, i) => colorScale(otuIds[i]))
      .attr("opacity", 0.6); // You can adjust opacity as needed

    // Add labels for each circle
    svg.selectAll("text")
      .data(sampleValues)
      .enter()
      .append("text")
      .attr("x", d => xScale(d))
      .attr("y", (d, i) => yScale(sampleValues[i]))
      .text((d, i) => otuLabels[i])
      .style("font-size", "10px") // Customize the font size
      .style("fill", "black"); // Customize text color
  } else {
    console.log(`Data not found for ID: ${selectedId}`);
  }
}

// Step 8: Define an event handler for the dropdown
function optionChanged(selectedId) {
  // Display the metadata
  displayMetadata(selectedId);

  // Call the function to update the bar chart
  updateBarChart(selectedId);
}

// Function to display metadata
function displayMetadata(selectedId) {
  // Get metadata for the selected ID
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


displayMetadata(data.names[0]);

