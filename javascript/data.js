
let path;
let points;
let dot;
let svg;
let progress;
let dataFetched;


let baseURL="https://script.googleusercontent.com/macros/echo?user_content_key=WIhZ4Gx75aI_-Kjx0Yp6u9hI2Pgw4pJJlwhJ9GfFxk_llafgGGoXOGttDAEMwsx3AYz445U8jc2C4vNYSvG22XLcS-U7y9_Sm5_BxDlH2jW0nuo2oDemN9CCS2h10ox_1xSncGQajx_ryfhECjZEnP8adMQxNixxEOh7eekiwmkhxnKmXbB2vJUvDFFx0-lP2TWAjzfGbjUjIxukSZ1LnBqGfKiy7R1fj_Zmm6qIudBZP7DA4HCugA&lib=M49r6yKs4LO_EbIQqCbREBawVLJsp4bmx"



async function _chart(d3) {
  const data = await d3.json(baseURL);
  progress = data.data;
  dataFetched=true;
  const width = 800;
  const height = 600;
  const marginTop = 20;
  const marginRight = 20;
  const marginBottom = 30;
  const marginLeft = 30;
  // Create the positional scales.
  const x = d3.scaleLinear()
    .domain([0, d3.max(progress, d => d.day)]).nice()
    .range([marginLeft, width - marginRight]);

  const y = d3.scaleLinear()
    .domain([0, d3.max(progress, d => d.completed)]).nice()
    .range([height - marginBottom, marginTop]);

  // Create the SVG container.
  svg = d3.create("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height])
    .attr("style", "max-width: 100%; height: auto; overflow: visible; font: 10px sans-serif;");

  // Add the horizontal axis.
  svg.append("g")
    .attr("transform", `translate(0,${height - marginBottom})`)
    .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0));

  // Add the vertical axis.
  svg.append("g")
    .attr("transform", `translate(${marginLeft},0)`)
    .call(d3.axisLeft(y))
    .call(g => g.select(".domain").remove())
    .call(g => g.append("text")
      .attr("x", -marginLeft)
      .attr("y", 10)
      .attr("fill", "currentColor")
      .attr("text-anchor", "start")
      .text("↑ Completed"));


  // Compute the points in pixel space as [x, y, z], where z is the name of the series.
  points = progress.map((d) => [x(d.day), y(d.completed), d.name]);

  // Group the points by series.
  const groups = d3.rollup(points, v => Object.assign(v, { z: v[0][2] }), d => d[2]);

  // Draw the lines.
  const line = d3.line();
  path = svg.append("g")
    .attr("fill", "none")
    .attr("stroke", "#EA4335")
    .attr("stroke-width", 1.5)
    .attr("stroke-linejoin", "round")
    .attr("stroke-linecap", "round")
    .selectAll("path")
    .data(groups.values())
    .join("path")
    .style("mix-blend-mode", "null")
    .attr("d", line);

  // Add an invisible layer for the interactive tip.
  dot = svg.append("g")
    .attr("display", "none");

  dot.append("circle")
    .attr("r", 2.5);

  dot.append("text")
    .attr("text-anchor", "middle")
    .attr("y", -8);

  svg
    .on("pointerenter", pointerentered)
    .on("pointermove", pointermoved)
    .on("pointerleave", pointerleft)
    .on("touchstart", event => event.preventDefault());

  
  d3.selectAll("#listItem").on("mouseover", function () {
    focusChange(this.children[1].innerText, progress);
  }).on("mouseout", function () {
    path.style("mix-blend-mode", "null").style("stroke", null);
  });


  return svg.node();

  // When the pointer moves, find the closest point, update the interactive tip, and highlight
  // the corresponding line. Note: we don't actually use Voronoi here, since an exhaustive search
  // is fast enough.
  function pointermoved(event) {
    const [xm, ym] = d3.pointer(event);
    const i = d3.leastIndex(points, ([x, y]) => Math.hypot(x - xm, y - ym));
    const [x, y, k] = points[i];
    path.style("stroke", ({ z }) => z === k ? null : "#ddd").filter(({ z }) => z === k).raise();
    dot.attr("transform", `translate(${x},${y})`);
    dot.select("text").text(k);
    svg.property("value", progress[i]).dispatch("input", { bubbles: true });
  }


  function pointerentered() {
    path.style("mix-blend-mode", null).style("stroke", "#ddd");
    dot.attr("display", null);
  }

  function pointerleft() {
    path.style("mix-blend-mode", null).style("stroke", null);
    dot.attr("display", "none");
    svg.node().value = null;
    svg.dispatch("input", { bubbles: true });
  }

}

function focusChange(name) {
  console.log(name);
  const i = points.findLastIndex(([x, y, z]) => { return z === name });
  console.log(i);
  const [x, y, k] = points[i];
  path.style("stroke", ({ z }) => z === k ? null : "#ddd").filter(({ z }) => z === k).raise();
  dot.attr("transform", `translate(${x},${y})`);
  dot.select("text").text(k);
  svg.property("value", progress[i]).dispatch("input", { bubbles: true });
}
function define(runtime, observer) {
  const main = runtime.module();
  function toString() { return this.url; }
  main.variable(observer("chart")).define("chart", ["d3"], _chart);
  return main;
}

export {define,dataFetched}

