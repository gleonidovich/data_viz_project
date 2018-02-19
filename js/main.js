'use strict;'

var margin = 50,
    width = 960 - margin,
    height = 550 - margin;

var monthList = [
  "Jan ", "Feb ", "Mar ", "Apr ", "May ", "Jun ",
  "Jul ", "Aug ", "Sep ", "Oct ", "Nov ", "Dec "
]

// date parser and bisector
var parseTime = d3.timeParse("%Y %m %d");
var bisectDate = d3.bisector(function(d) { return d.key; }).right;

// state object
var currentState = {
  dateConstraint: "Month",
  chosenYear: -1,
  chosenAirport: "Airport"
};

// filter flights by year
function filterYear(dataset, year) {
  if (year === -1) {
    return dataset;
  }
  var newSet = []; 
  dataset.forEach(function(row) {
    if (row.year === year) {
      newSet.push(row);
    } 
  });
  return newSet;
}

// filter flights by airport iata
function filterIata(dataset, iata) {
  if (iata === "all") {
    return dataset;
  }
  var newSet = [];
  dataset.forEach(function(row) {
    if (row.iata === iata) {
      newSet.push(row);
    }
  });
  return newSet;
}

// convert date string into a Date object
function convertKeyToDate(d) {
  for (var i = 0; i < d.length; i++) {
    d[i].key = new Date(d[i].key);
  }
}

// create a nested dataset
// the unit param should be "month" or "year"
function reduceData(dataset, unit) {
  var nested = d3.nest()
    .key(function(d) {
      if (unit === "Month") {
        return parseTime(d.year + " " + d.month + " 01");
      } else if (unit === "Year") {
        return parseTime(d.year + " 01 01");
      }        
    })
    .rollup(function(v) {
      var sumCancelled = d3.sum(v, function(d) {
          return d.cancelled;
        }),
          sumAllFlights = d3.sum(v, function(d) {
          return d.allFlights;
        }),
          percentage = sumCancelled / sumAllFlights;

      return {
        sumCancelled: sumCancelled,
        sumAllFlights: sumAllFlights,
        percentage: percentage
      }
    })
    .entries(dataset);
  convertKeyToDate(nested);
  return nested;
}

function createXScale(data) {
  return d3.scaleTime()
           .domain(d3.extent(data, function(d) {
             return new Date(d.key);
           }))
           .range([margin, width]);
}

function createYScale(data) {
  return d3.scaleLinear()
           .domain([0, d3.max(data, function(d) {
             return d.value.sumCancelled;
           })])
           .range([height, margin]);
}

// main visualization logic
function draw(error, airports, flights) {
  flights.forEach(function(d) {
    d.year = +d.year;
    d.month = +d.month;
    d.date = new Date(parseTime(d.year + " " + d.month + " 01"));
    d.iata = d.iata;
    d.cancelled = +d.cancelled;
    d.allFlights = +d.allFlights;
  });

  // create the svg window
  var svg = d3.select("svg")

  // add buttons for all flights
  d3.select("#monthBtn")
    .on("click", function(d) {
      currentState.dateConstraint = "Month";
      update(reduceData(flights, currentState.dateConstraint));
      svg.select(".title")
        .text("Flight Cancellations Per Month");
    });

  d3.select("#yearBtn")
    .on("click", function(d) {
      currentState.dateConstraint = "Year";
      update(reduceData(flights, currentState.dateConstraint));
      svg.select(".title")
        .text("Flight Cancellations Per Year");
    });

  // create dropdown for year
  var yearSelect = d3.select("#yearSelect");

  yearSelect.append("option")
    .attr("value", "Year")
    .text("Year")

  for (var i = 1987; i < 2009; i ++) {
    yearSelect.append("option")
      .attr("value", i)
      .text(i);
  }

  yearSelect.on("change", function(d) {
    currentState.dateConstraint = "Month";
    currentState.chosenYear = +d3.select(this).property("value");
    update(reduceData(filterYear(flights, currentState.chosenYear), "Month"));
    svg.select(".title")
      .text("Flight Cancellations Per Month in " + currentState.chosenYear);
  });

  var airportSelect = d3.select("#airportSelect");

  airportSelect.append("option")
    .attr("value", "Airport")
    .text("Airport")

  for (var i = 0; i < 30; i ++) {
    airportSelect.append("option")
      .attr("value", airports[i].iata)
      .text(airports[i].airport);
  }

  airportSelect.on("change", function(d) {
    currentState.chosenAirport = d3.select(this).property("value");
    if(currentState.chosenAirport === "Airport") {
      update(reduceData(flights, currentState.dateConstraint))
      svg.select(".title")
         .text("Flight Cancellations Per " + currentState.dateConstraint);
    }
    else {update(reduceData(filterIata(flights, currentState.chosenAirport), currentState.dateConstraint, currentState.asPercent));
    svg.select(".title")
       .text("Flight Cancellations Per " + currentState.dateConstraint + " for " + currentState.chosenAirport);
    }
  });

  // create the initial scatterplot with the full dataset
  function init(data) {
    var xScale = createXScale(data),
        yScale = createYScale(data);

    svg.selectAll("circle")
       .data(data)
       .enter()
       .append("circle")
       .attr("class", "display")
       .attr("cx", function(d) {
          return xScale(d.key);
        })
       .attr("cy", function(d) {
          return yScale(d.value.sumCancelled);
       })
       .attr("r", 2);

    var line = d3.line()
                 .x(function(d) {
                    return xScale(d.key);
                  })
                 .y(function(d) {
                    return yScale(d.value.sumCancelled);
                 })
                 .curve(d3.curveMonotoneX);

    var path = svg.append("path")
       .attr("d", line(data))
       .attr("fill", "none");

    var pathLength = path.node().getTotalLength();

    path.attr("stroke-dasharray", pathLength + " " + pathLength)
        .attr("stroke-dashoffset", pathLength)
        .transition()
        .duration(1000)
        .attr("stroke-dashoffset", 0);

    svg.append("g")
       .attr("class", "xAxis")
       .attr("transform", "translate(0," + height + ")")
       .call(d3.axisBottom(xScale));

    svg.append("g")
       .attr("class", "yAxis")
       .attr("transform", "translate(" + margin + ",0)")
       .call(d3.axisLeft(yScale))
       .append("text")
       .attr("transform", "rotate(-90)")
       .attr("y", 10)
       .attr("x", 0 - margin)
       .attr("fill", "#000")
       .text("Cancellations");

    svg.append("text")
       .attr("class", "title")
       .attr("x", (width / 2))
       .attr("y", 0 + (margin / 2))
       .attr("text-anchor", "middle")
       .text("Flight Cancellations per Month");

    var focus = d3.select("#focus")

    var outline = svg.append("g")
        .attr("class", "outline")
        .style("display", "none");

    outline.append("circle")
        .attr("r", 4.5);

    // tooltip function
    // created by Mike Bostock
    svg.append("rect")
        .attr("class", "overlay")
        .attr("width", width)
        .attr("height", height)
        .on("mouseover", function() {
          outline.style("display", null);
          focus.classed("hidden", false);
        })
        .on("mouseout", function() {
          outline.style("display", "none")
          focus.classed("hidden", true);
        })
        .on("mousemove", mousemove);

    function mousemove() {
      var x0 = xScale.invert(d3.mouse(this)[0]),
          i = bisectDate(data, x0, 1),
          d0 = data[i - 1],
          d1 = data[i],
          d = x0 - d0.key > d1.key - x0 ? d1 : d0;
      outline.attr("transform", "translate(" + xScale(d.key) + "," + yScale(d.value.sumCancelled) + ")");
      focus.select("#yearVal")
        .text(d.key.getFullYear());
      if (currentState.dateConstraint == "Month") {
        focus.select("#monthVal")
          .text(monthList[d.key.getMonth()]);
      } else {
        focus.select("#monthVal")
          .style("display", "hidden");
      }
      focus.select("#cancelVal")
        .text(d.value.sumCancelled);
      focus.select("#flightsVal")
        .text(d.value.sumAllFlights);
      focus.select("#rateVal")
        .text((d.value.percentage * 100).toFixed(2));
    }
  };

  // update the scatterplot
  function update(data) {
    var xScale = createXScale(data),
        yScale = createYScale(data);

    var circles = svg.selectAll(".display")
      .data(data, function(d) {
        return d.key;
      });

    var xAxis = svg.selectAll(".xAxis"),
        yAxis = svg.selectAll(".yAxis");

    circles.enter()
           .append("circle")
           .attr("class", "display enter")
           .attr("cx", function(d) {
              return xScale(d.key);
           })
           .attr("cy", function(d) {
              return yScale(d.value.sumCancelled);
           })
           .attr("r", 2);

    circles.attr("class", "display update")
           .transition()
           .duration(800)
           .attr("cx", function(d) {
              return xScale(d.key);
           })
           .attr("cy", function(d) {
              return yScale(d.value.sumCancelled);
           });

    circles.exit()
           .attr("class", "display exit")
           .transition()
           .duration(800)
           .style("opacity", "0")
           .remove();

    var line = d3.line()
                 .x(function(d) {
                    return xScale(d.key);
                  })
                 .y(function(d) {
                    return yScale(d.value.sumCancelled);
                 });

    var path = svg.select("path")
                  .attr("d", line(data))
                  .attr("fill", "none");

    var pathLength = path.node().getTotalLength();

    path.attr("stroke-dasharray", pathLength + " " + pathLength)
        .attr("stroke-dashoffset", pathLength)
        .transition()
        .delay(800)
        .duration(800)
        .attr("stroke-dashoffset", 0);

    xAxis.transition()
         .duration(800)
         .call(d3.axisBottom(xScale));

    yAxis.transition()
         .duration(800)
         .call(d3.axisLeft(yScale));

    var focus = d3.select("#focus")

    var outline = svg.append("g")
        .attr("class", "outline")
        .style("display", "none");

    outline.append("circle")
        .attr("r", 4.5);

    svg.append("rect")
        .attr("class", "overlay")
        .attr("width", width)
        .attr("height", height)
        .on("mouseover", function() {
          outline.style("display", null);
          focus.classed("hidden", false);
        })
        .on("mouseout", function() {
          outline.style("display", "none")
          focus.classed("hidden", true);
        })
        .on("mousemove", mousemove);

    function mousemove() {
      var x0 = xScale.invert(d3.mouse(this)[0]),
          i = bisectDate(data, x0, 1),
          d0 = data[i - 1],
          d1 = data[i],
          d = x0 - d0.key > d1.key - x0 ? d1 : d0;
      outline.attr("transform", "translate(" + xScale(d.key) + "," + yScale(d.value.sumCancelled) + ")");
      focus.select("#yearVal")
        .text(d.key.getFullYear());
      if (currentState.dateConstraint == "Month") {
        focus.select("#monthVal")
          .style("display", "")
          .text(monthList[d.key.getMonth()]);
      } else {
        focus.select("#monthVal")
          .style("display", "none");
      }
      focus.select("#cancelVal")
        .text(d.value.sumCancelled);
      focus.select("#flightsVal")
        .text(d.value.sumAllFlights);
      focus.select("#rateVal")
        .text((d.value.percentage * 100).toFixed(2));
    }
  };

  init(reduceData(flights, currentState.dateConstraint));
};

d3.queue()
  .defer(d3.csv, "data/airports.csv")
  .defer(d3.csv, "data/flights.csv")
  .await(draw);