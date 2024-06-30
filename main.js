import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// Function to create and update the infoBox div
function createInfoBox(totalCandidates) {
  const infoBox = document.getElementById("info");

  if (infoBox) {
    const paragraph = document.createElement("p");
    paragraph.textContent = `Total number of candidates (Excluding NOTA): ${totalCandidates}`;
    infoBox.appendChild(paragraph);
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

    const xAccessor = (d) => d.name;
    const yAccessor = (d) => +d.Votes_Total;

    // const width = 600;

    const screenWidth = window.innerWidth;
    const width = Math.min(700, screenWidth - 20); // Adjust width as needed
    let dimensions = {
      width,
      height: width * 0.8,
      margin: {
        top: 15,
        right: 10,
        bottom: 110,
        left: 30,
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
      .attr("font-size", "12px")
      .attr("font-weight", "bold")
      .attr("fill", "white")
      .text((d) => indianFormat(yAccessor(d)))
      .style("font-family", "Roboto, sans-serif");

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
          .attr("font-size", "11px")

          .text(candidate.name);
        self
          .append("tspan")
          .attr("x", 0)
          .attr("dy", "1em")
          .attr("font-size", "9px")
          .attr("fill", "white")

          .text(candidate.party);
      });

    const yAxisGenerator = d3
      .axisLeft()
      .scale(yScale)
      .tickFormat((d) => indianFormat(d))
      .attr("class", "yLine");
    const yAxis = bounds.append("g").call(yAxisGenerator);
    yAxis
      .selectAll("text")
      .style("font-family", "Roboto, sans-serif")
      .attr("font-size", "11px")
      .attr("class", "ytext");

    // Add the Y-axis title to the wrapper svg
    wrapper
      .append("text")
      .attr("class", "y-axis-title")
      .attr(
        "transform",
        `translate(16, ${dimensions.boundedHeight / 2}) rotate(-90)`
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

    createInfoBox(filteredData.length - 1);

    const topCandidates = filteredData
      .sort((a, b) => b.Votes_Total - a.Votes_Total)
      .slice(0, 4);

    const candidateImagesDiv = document.getElementById("candidateImages");

    let candiFolder = constituencyName.replace(/\s+/g, "");

    let titleCaseCandiFolder = convertToTitleCase(candiFolder);

    const candidateImageGrid = `
<div class="photo-grid">
         ${topCandidates
           .map(
             (candidate, index) => `

                <img
                  src="/candi-pics/${titleCaseCandiFolder}/${
               index === 0 ? "Winner" : "Loser " + index
             }.jpg"

                  alt="${candidate.name}"
                />

        `
           )
           .join("")}
      </div>
    `;

    candidateImagesDiv.innerHTML = candidateImageGrid;
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
    document.getElementById("homePage").style.display = "none";

    const constituencyTitle = document.getElementById("columnHead");

    constituencyTitle.textContent = `${constituencyName}`;

    await displayCandidateImages(constituencyName);

    await drawBars(constituencyName);

    document.getElementById("backHome").style.display = "block";
  });
});

const bToHome = document.getElementById("backHome");

bToHome.addEventListener("click", () => {
  window.location.href = "/"; // Replace "/" with your actual homepage URL
});
