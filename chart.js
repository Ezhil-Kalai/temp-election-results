import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// Function to draw the bar chart
async function drawBars(constituencyName) {
  try {
    const data = await d3.csv("/TN2019.csv");
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

    const width = 600;
    let dimensions = {
      width,
      height: width * 0.8,
      margin: {
        top: 30,
        right: 10,
        bottom: 100,
        left: 100,
      },
    };

    dimensions.boundedWidth =
      dimensions.width - dimensions.margin.left - dimensions.margin.right;
    dimensions.boundedHeight =
      dimensions.height - dimensions.margin.top - dimensions.margin.bottom;

    d3.select("#wrapper").selectAll("*").remove();

    const wrapper = d3
      .select("#wrapper")
      .append("svg")
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
      .padding(0.08);

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
      .attr("fill", "#deb887");

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
          .text(candidate.name);
        self
          .append("tspan")
          .attr("x", 0)
          .attr("dy", "1em")
          .attr("font-size", "10px")
          .attr("fill", "white")
          .text(candidate.party);
      });

    const yAxisGenerator = d3.axisLeft().scale(yScale);
    const yAxis = bounds.append("g").call(yAxisGenerator);
  } catch (error) {
    console.error("Error loading or processing data:", error);
  }
}

// Function to display candidate images with flipping effect
async function displayCandidateImages(constituencyName) {
  try {
    const data = await d3.csv("/TN2019.csv");
    const filteredData = data.filter(
      (d) => d.pc.trim().toLowerCase() === constituencyName.trim().toLowerCase()
    );

    const candidateImagesDiv = document.getElementById("candidateImages");

    const candiFolder = constituencyName.replace(/\s+/g, "");

    candidateImagesDiv.innerHTML = `
      <div class="photo-grid">
        <div class="photo-container" id="winner">
          <div class="photo">
            <div class="photo-front">
              <img
                src="/pics/${candiFolder}/winner.jpeg"
                class="photo-img"
                alt="winner"
              />
            </div>
            <div class="photo-back">
              <p id="winnerText"></p>
            </div>
          </div>
        </div>
        <div class="photo-container" id="loser1">
          <div class="photo">
            <div class="photo-front">
              <img
                src="/pics/${candiFolder}/loser1.jpeg"
                class="photo-img"
                alt="loser1"
              />
            </div>
            <div class="photo-back">
              <p id="Loser1Text"></p>
            </div>
          </div>
        </div>
        <div class="photo-container" id="loser2">
          <div class="photo">
            <div class="photo-front">
              <img
                src="/pics/${candiFolder}/loser2.jpeg"
                class="photo-img"
                alt="loser2"
              />
            </div>
            <div class="photo-back">
              <p Loser2Text></p>
            </div>
          </div>
        </div>
        <div class="photo-container" id="loser3">
          <div class="photo">
            <div class="photo-front">
              <img
                src="/pics/${candiFolder}/loser3.jpeg"
                class="photo-img"
                alt="loser3"
              />
            </div>
            <div class="photo-back">
              <p Loser3Text></p>
            </div>
          </div>
        </div>
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

    // Display the constituency name
    const constituencyTitle = document.getElementById("constituencyTitle");
    constituencyTitle.textContent = `${constituencyName} Election Results`;
    constituencyTitle.style.display = "block"; // Make the h2 element visible
    await drawBars(constituencyName);
    await displayCandidateImages(constituencyName); // Call displayCandidateImages here

    document.getElementById("homePage").style.display = "none";
    document.getElementById("backHome").style.display = "block";
  });
});

document.getElementById("backHome").addEventListener("click", (event) => {
  event.preventDefault();
  document.getElementById("homePage").style.display = "block";
  document.getElementById("backHome").style.display = "none";
  document.getElementById("wrapper").innerHTML = "";
  document.getElementById("candidateImages").innerHTML = ""; // Clear candidate images

  // Hide the constituency title
  const constituencyTitle = document.getElementById("constituencyTitle");
  constituencyTitle.style.display = "none";
});
