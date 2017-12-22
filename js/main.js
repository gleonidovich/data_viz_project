// main function
function start() {
  // create a parser for Date objects
  var parseTime = d3.timeParse("%Y %m %d");
  var asPercent = false;

  // main visualization logic
  function draw(data) {
    var margin = 50;
    var width = 950 - margin;
    var height = 500 - margin;

    // create the svg window
    var svg = d3.select("body")
                .append("svg")
                .attr("width", width + margin)
                .attr("height", height + margin);

    // create buttons window
    var div = d3.select("body")
                .append("div")
                .attr("class", "options");

    div.append("h3")
       .attr("class", "optionsTitle")
       .text("Options");

    var chkbx = div.append("div")
                   .attr("class", "checkboxes")

    chkbx.append("p")
         .text("Display as a rate:")

    chkbx.append("input")
         .attr("type", "checkbox")
         .attr("id", "asPercent")
         .on("change", function(d) {
           if (d3.select("#asPercent").property("checked")) {
             asPercent = true;
           } else {
             asPercent = false;
           }
           update(reduceData(data, "day", asPercent));
           svg.select(".title")
                 .text("Flight Cancellations Per Day")
         });

    // add buttons for all data
    var btns = div.append("div")
                  .attr("class", "buttons")

    btns.append("input")
           .attr("type", "button")
           .attr("name", "day")
           .attr("value", "Per Day")
           .on("click", function(d) {
              update(reduceData(data, "day", asPercent));
              svg.select(".title")
                 .text("Flight Cancellations Per Day");
           });

    btns.append("input")
           .attr("type", "button")
           .attr("name", "month")
           .attr("value", "Per Month")
           .on("click", function(d) {
              update(reduceData(data, "month", asPercent));
              svg.select(".title")
                 .text("Flight Cancellations Per Month");
           });

    btns.append("input")
           .attr("type", "button")
           .attr("name", "year")
           .attr("value", "Per Year")
           .on("click", function(d) {
              update(reduceData(data, "year", asPercent));
              svg.select(".title")
                 .text("Flight Cancellations Per Year");
           });

    // filter data by year
    function filterYear(dataset, year) {
      var newSet = []; 
      dataset.forEach(function(row) {
        if (row.year === year) {
          newSet.push(row);
        } 
      });
      return newSet;
    };

    // create dropdown for year
    var dropdown = div.append("div")
                      .attr("class", "dropdown");

    var selections = dropdown.append("select")
                             .attr("class", "selections");

    selections.append("option")
              .attr("value", "Year")
              .text("Year")

    for (var i = 1987; i < 2009; i ++) {
      selections.append("option")
                .attr("value", i)
                .text(i);
    }

    selections.on("change", function(d) {
      var year = +d3.select(this).property("value");
      update(reduceData(filterYear(data, year), "day", asPercent));
      svg.select(".title")
         .text("Flight Cancellations Per Day in " + year);
    });

    function filterDest(dataset, dest) {
      var newSet = [];
      dataset.forEach(function(row) {
        if (row.dest === dest) {
          newSet.push(row);
        }
      });
      return newSet;
    };

    var selections = dropdown.append("select")
                             .attr("class", "selections");

    selections.append("option")
              .attr("value", "Destination")
              .text("Destination")

    var destinations = ["ATL","ORD","LAX","DFW","DEN",
                        "JFK","LAS","IAH","PHX","CLT",
                        "SFO","EWR","MCO","DTW","MIA",
                        "MSP","SEA","PHL","BOS","LGA",
                        "IAD","FLL","BWI","SLC","HNL",
                        "SAN","TPA","DCA","MDW","PDX"];

    for (var i = 0; i < 30; i ++) {
      selections.append("option")
                .attr("value", destinations[i])
                .text(destinations[i]);
    }

    selections.on("change", function(d) {
      var dest = d3.select(this).property("value");
      update(reduceData(filterDest(data, dest), "day", asPercent));
      svg.select(".title")
         .text("Flight Cancellations Per Day for " + dest);
    });

    // convert date string into a Date object
    function convertKeyToDate(d) {
      for (var i = 0; i < d.length; i++) {
        d[i].key = new Date(d[i].key);
      }
    };

    // create a nested dataset
    // the unit param should be "month" or "year"
    function reduceData(dataset, unit, percent = false) {
      var nested = d3.nest()
        .key(function(d) {
          if (unit === "day") {
            return parseTime(d.year + " " + d.month + " " + d.day);
          } else if (unit === "month") {
            return parseTime(d.year + " " + d.month + " 01");
          } else if (unit === "year") {
            return parseTime(d.year + " 01 01");
          }        
        })
        .rollup(function(v) {
          if (percent) {
            var sumCancelled = d3.sum(v, function(d) {
              return d.cancelled;
            });
            var sumAllFlights = d3.sum(v, function(d) {
              return d.allFlights;
            });
            return sumCancelled/sumAllFlights;
          } else {
            return d3.sum(v, function(d) {
              return d.cancelled;
            });
          }
        })
        .entries(dataset);
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

    // create the initial scatterplot with the full dataset
    function init(data) {
      var xScale = createXScale(data);
      var yScale = createYScale(data);

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
         .text("Flight Cancellations per Day");
    };

    // update the scatterplot
    function update(data) {
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
             .attr("cx", function(d) {
                return xScale(d.key);
             })
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

    init(reduceData(data, "day"));
  };

  d3.csv("data/top30airports.csv", function(data) {
    data.forEach(function(d) {
      d.year = +d.year;
      d.month = +d.month;
      d.day = +d.day;
      d.dest = d.dest;
      d.cancelled = +d.cancelled;
      d.allFlights = +d.allFlights;
    });
    draw(data);
  });
};

start();