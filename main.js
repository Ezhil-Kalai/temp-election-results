import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// Function to create and update the infoBox div
function createInfoBox(totalCandidates) {
  const infoBox = document.getElementById("infoBox");
  if (infoBox) {
    infoBox.textContent = `Total number of candidates (Excluding NOTA): ${totalCandidates}`;
    infoBox.style.display = "flex"; // Show the infoBox
  }
}
// Function to draw the bar chart
async function drawBars(constituencyName) {
  try {
    const data = await d3.csv("/resultsPC24.csv");
    const filteredData = data.filter(
      (d) => d.pc.trim().toLowerCase() === constituencyName.trim().toLowerCase()
    );

    if (filteredData.length === 0) {
      console.error(`No data found for constituency: ${constituencyName}`);
      return;
    }

    const topCandidates = filteredData
      .sort((a, b) => b.Votes_Total - a.Votes_Total)
      .slice(0, 4);

    await displayCandidateImages(constituencyName);

    const xAccessor = (d) => d.name;
    const yAccessor = (d) => +d.Votes_Total;

    // const width = 600;

    const screenWidth = window.innerWidth;
    const width = Math.min(700, screenWidth - 20); // Adjust width as needed
    let dimensions = {
      width,
      height: width * 0.71,
      margin: {
        top: 30,
        right: 10,
        bottom: 150,
        left: 85,
      },
    };

    dimensions.boundedWidth =
      dimensions.width - dimensions.margin.left - dimensions.margin.right;
    dimensions.boundedHeight =
      dimensions.height - dimensions.margin.top - dimensions.margin.bottom;

    d3.select("#barChartWrapper").selectAll("*").remove();

    const wrapper = d3
      .select("#barChartWrapper")
      .append("svg")
      .attr("id", "barChartSvg")
      .attr("width", dimensions.width)
      .attr("height", dimensions.height);

    const bounds = wrapper
      .append("g")
      .style(
        "transform",
        `translate(${dimensions.margin.left}px, ${dimensions.margin.top}px)`
      );

    const xScale = d3
      .scaleBand()
      .domain(topCandidates.map((d) => d.name))
      .range([0, dimensions.boundedWidth])
      .padding(0.1);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(topCandidates, yAccessor)])
      .nice()
      .range([dimensions.boundedHeight, 0]);

    const barsGroup = bounds.append("g");

    const barRects = barsGroup
      .selectAll("rect")
      .data(topCandidates)
      .enter()
      .append("rect")
      .attr("x", (d) => xScale(xAccessor(d)))
      .attr("y", (d) => yScale(yAccessor(d)))
      .attr("width", xScale.bandwidth())
      .attr("height", (d) => dimensions.boundedHeight - yScale(yAccessor(d)))
      .attr("fill", "#1db6d5");

    const indianLocale = d3.formatLocale({
      decimal: ".",
      thousands: ",",
      grouping: [3, 2],
    });

    const indianFormat = indianLocale.format(",");

    barsGroup
      .selectAll("text")
      .data(topCandidates)
      .enter()
      .append("text")
      .attr("x", (d) => xScale(xAccessor(d)) + xScale.bandwidth() / 2)
      .attr("y", (d) => yScale(yAccessor(d)) - 5)
      .style("text-anchor", "middle")
      .attr("font-size", "14px")
      .attr("font-weight", "bold")
      .attr("fill", "white")
      .text((d) => indianFormat(yAccessor(d)));

    const xAxisGenerator = d3.axisBottom().scale(xScale);
    const xAxis = bounds
      .append("g")
      .call(xAxisGenerator)
      .style("transform", `translateY(${dimensions.boundedHeight}px)`);

    xAxis
      .selectAll("text")
      .attr("transform", "rotate(-30)")
      .style("text-anchor", "end")
      .each(function (d) {
        const self = d3.select(this);
        const candidate = topCandidates.find((c) => c.name === d);
        self.text("");
        self
          .append("tspan")
          .attr("x", 0)
          .attr("dy", "1em")
          .attr("font-size", "13px")
          .attr("font-weight", "bold")
          .text(candidate.name);
        self
          .append("tspan")
          .attr("x", 0)
          .attr("dy", "1em")
          .attr("font-size", "10px")
          .attr("fill", "white")
          .attr("font-weight", "bold")
          .text(candidate.party);
      });

    const yAxisGenerator = d3.axisLeft().scale(yScale);
    const yAxis = bounds.append("g").call(yAxisGenerator);

    // Add the Y-axis title to the wrapper svg
    wrapper
      .append("text")
      .attr("class", "y-axis-title")
      .attr(
        "transform",
        `translate(1, ${dimensions.boundedHeight / 2}) rotate(-90)`
      )
      .attr("id", "y-axis-title")
      .attr("text-anchor", "middle")
      .attr("font-size", "13px")
      .attr("font-weight", "bold")
      .text("Total Votes");
  } catch (error) {
    console.error("Error loading or processing data:", error);
  }
}

function convertToTitleCase(inputString) {
  // Convert the input string to lowercase
  let lowercaseString = inputString.toLowerCase();

  // Split the string into an array of words
  let words = lowercaseString.split(" ");

  // Iterate over each word and capitalize the first letter
  for (let i = 0; i < words.length; i++) {
    let word = words[i];
    words[i] = word.charAt(0).toUpperCase() + word.slice(1);
  }

  // Join the words back into a single string
  let titleCaseString = words.join(" ");

  return titleCaseString;
}

// Function to display candidate images with flipping effect
async function displayCandidateImages(constituencyName) {
  try {
    const data = await d3.csv("/resultsPC24.csv");
    const filteredData = data.filter(
      (d) => d.pc.trim().toLowerCase() === constituencyName.trim().toLowerCase()
    );

    await createInfoBox(filteredData.length - 1);

    const topCandidates = filteredData
      .sort((a, b) => b.Votes_Total - a.Votes_Total)
      .slice(0, 4);

    const candidateImagesDiv = document.getElementById("candidateImages");
    console.log(candidateImagesDiv);

    let candiFolder = constituencyName.replace(/\s+/g, "");

    let titleCaseCandiFolder = convertToTitleCase(candiFolder);
    // console.log(titleCaseCandiFolder);

    // Log candidate details to console
    topCandidates.forEach((candidate, index) => {
      console.log(
        `Name: ${candidate.name}, Party: ${candidate.party}, Index: ${index}, Constituency:${candidate.pc}`
      );
    });

    candidateImagesDiv.innerHTML = `
      <div class="photo-grid">
        ${topCandidates
          .map(
            (candidate, index) => `
          <div class="photo-container" id="${
            index === 0 ? "Winner" : "Loser " + index
          }">
            <div class="photo">
              <div class="photo-front">
                <img
                  src="/candi-pics/${titleCaseCandiFolder}/${
              index === 0 ? "Winner" : "Loser " + index
            }.jpg"
                  class="photo-img"
                  alt="${candidate.name}"
                />
              </div>
              <div class="photo-back">
              
                <p class="candidate-name">${candidate.name}</p>
                <p class="candidate-party">${candidate.party}</p>
               
              </div>
            </div>
          </div>
        `
          )
          .join("")}
      </div>
    `;
  } catch (error) {
    console.error("Error loading or processing data:", error);
  }
}

// Event listener for constituency links
document.querySelectorAll(".constituencyLink").forEach((link) => {
  link.addEventListener("click", async (event) => {
    event.preventDefault();
    const constituencyName = link.textContent.trim();
    console.log(constituencyName);

    // Display the constituency name
    const constituencyTitle = document.getElementById("columnHead");

    constituencyTitle.textContent = `${constituencyName}`;
    document.getElementById("candidateImages").style.display = "flex";
    await drawBars(constituencyName);
    // Call displayCandidateImages here

    document.getElementById("homePage").style.display = "none";
    document.getElementById("backHome").style.display = "block";
  });
});

document.getElementById("backHome").addEventListener("click", (event) => {
  event.preventDefault();
  document.getElementById("homePage").style.display = "block";

  document.getElementById("columnHead").textContent = "Constituencies";

  document.getElementById("backHome").style.display = "none";
  document.getElementById("barChartSvg").style.display = "none";
  document.getElementById("candidateImages").style.display = "none";

  document.getElementById("infoBox").style.display = "none";
});
