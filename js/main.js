var margin = 50;
var width = 950 - margin;
var height = 500 - margin;

var parseTime = d3.timeParse("%Y %m %d");

var svg = d3.select("body")
            .append("svg")
            .attr("width", width + margin)
            .attr("height", height + margin);

var draw = function(data) {
  var dataMonth = d3.nest()
    .key(function(d) {
      return parseTime(d.key.getUTCFullYear() + " " + d.key.getMonth() + " 1");
    })
    .rollup(function(v) {
      return d3.sum(v, function(d) {
        return d.value;
      });
    })
    .entries(data);

  convertKeytoDate(dataMonth);

  var dataYear = d3.nest()
    .key(function(d) {
      return parseTime(d.key.getUTCFullYear() + " " + "1 1");
    })
    .rollup(function(v) {
      return d3.sum(v, function(d) {
        return d.value;
      });
    })
    .entries(dataMonth);

  convertKeytoDate(dataYear)

  function convertKeytoDate(d) {
    for (var i = 0; i < d.length; i++) {
      d[i].key = new Date(d[i].key);
    }
  };

  function drawPoints(data) {
    var xScale = d3.scaleTime()
                   .domain(d3.extent(data, function(d) {
                      return new Date(d.key);
                    }))
                   .range([margin, width]);

    var yScale = d3.scaleLinear()
                   .domain([0, d3.max(data, function(d) {
                      return d.value;
                    })])
                   .range([height, margin]);

    svg.selectAll("circle")
       .data(data)
       .enter()
       .append("circle")
       .attr("cx", function(d) {
          return xScale(d.key);
        })
       .attr("cy", function(d) {return yScale(d.value);})
       .attr("r", 2);

    svg.append("g")
       .attr("transform", "translate(0," + height + ")")
       .call(d3.axisBottom(xScale));

    svg.append("g")
       .attr("transform", "translate(" + margin + ",0)")
       .call(d3.axisLeft(yScale));
  };

  drawPoints(dataYear);
};

d3.csv("data/flight_data.csv", function(d) {
  return {
    key: parseTime(d.Year + " " + d.Month + " " + d.DayofMonth),
    value: +d.Cancelled
  };
}, draw);