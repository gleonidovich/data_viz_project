var parseTime = d3.timeParse("%Y %m %d");

function draw(data) {
  var margin = 50;
  var width = 950 - margin;
  var height = 500 - margin;

  function convertKeyToDate(d) {
    for (var i = 0; i < d.length; i++) {
      d[i].key = new Date(d[i].key);
    }
  };

  function reduceData(unit) {
    var nested = d3.nest()
      .key(function(d) {
        if (unit === "month") {
          return parseTime(d.key.getUTCFullYear() + " " + d.key.getMonth() + " 1");
        } else if (unit === "year") {
          return parseTime(d.key.getUTCFullYear() + " 1 1");
        }        
      })
      .rollup(function(v) {
        return d3.sum(v, function(d) {
          return d.value;
        });
      })
      .entries(data);
    convertKeyToDate(nested);
    return nested;
  };

  function createXScale(data) {
    return d3.scaleTime()
             .domain(d3.extent(data, function(d) {
               return new Date(d.key);
             }))
             .range([margin, width]);
  };

  function createYScale(data) {
    return d3.scaleLinear()
             .domain([0, d3.max(data, function(d) {
               return d.value;
             })])
             .range([height, margin]);
  };

  function init(data) {
    var xScale = createXScale(data);
    var yScale = createYScale(data);

    var svg = d3.select("body")
            .append("svg")
            .attr("width", width + margin)
            .attr("height", height + margin);

    svg.selectAll("circle")
       .data(data)
       .enter()
       .append("circle")
       .attr("cx", function(d) {
          return xScale(d.key);
        })
       .attr("cy", function(d) {
          return yScale(d.value);
       })
       .attr("r", 2);

    svg.append("g")
       .attr("class", "xAxis")
       .attr("transform", "translate(0," + height + ")")
       .call(d3.axisBottom(xScale));

    svg.append("g")
       .attr("class", "yAxis")
       .attr("transform", "translate(" + margin + ",0)")
       .call(d3.axisLeft(yScale));

    svg.append("text")
       .attr("class", "title")
       .attr("x", (width / 2))
       .attr("y", 0 + (margin / 2))
       .attr("text-anchor", "middle")
       .text("Flight Cancellations");
  };

  function update(data) {
    var svg = d3.select("svg");

    var xScale = createXScale(data);
    var yScale = createYScale(data);

    var circles = svg.selectAll("circle")
      .data(data, function(d) {
        return d.key;
      });

    var xAxis = svg.selectAll(".xAxis");
    var yAxis = svg.selectAll(".yAxis");

    circles.enter()
           .append("circle")
           .attr("class", "enter")
           .attr("cx", function(d) {
              return xScale(d.key);
           })
           .attr("cy", function(d) {
              return yScale(d.value);
           })
           .attr("r", 2);

    circles.attr("class", "update")
           .transition()
           .duration(1000)
           .attr("cy", function(d) {
              return yScale(d.value);
            });

    circles.exit()
           .attr("class", "exit")
           .transition()
           .duration(1000)
           .style("opacity", "0")
           .remove();

    xAxis.transition()
         .duration(1000)
         .call(d3.axisBottom(xScale));

    yAxis.transition()
         .duration(1000)
         .call(d3.axisLeft(yScale));
  };

  init(data);
  window.setTimeout(function() {update(reduceData("month"));}, 3000);
  window.setTimeout(function() {update(reduceData("year"));}, 6000);
  window.setTimeout(function() {update(reduceData("month"));}, 9000);
  window.setTimeout(function() {update(data);}, 12000)
};

d3.csv("data/flight_data.csv", function(data) {
  data.forEach(function(d) {
    d.key = parseTime(d.Year + " " + d.Month + " " + d.DayofMonth);
    d.value = +d.Cancelled;
    });
  draw(data);
});