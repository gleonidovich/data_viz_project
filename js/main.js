var margin = 50;
var width = 950 - margin;
var height = 500 - margin;

var parseTime = d3.timeParse("%Y %m %d");

var svg = d3.select("body")
            .append("svg")
            .attr("width", width + margin)
            .attr("height", height + margin);

var draw_points = function(data) {
  var nestedDataMonth = d3.nest()
    .key(function(d) {
      return parseTime(d.date.getUTCFullYear() + " " + d.date.getMonth() + " 1");
    })
    .rollup(function(v) {
      return d3.sum(v, function(d) {
        return d.cancel;
      });
    })
    .entries(data);

  for (var i = 0; i < nestedDataMonth.length; i++) {
    nestedDataMonth[i].key = new Date(nestedDataMonth[i].key);
  }

  var nestedDataYear = d3.nest()
    .key(function(d) {
      return parseTime(d.key.getUTCFullYear() + " " + "1 1");
    })
    .rollup(function(v) {
      return d3.sum(v, function(d) {
        return d.value;
      });
    })
    .entries(nestedDataMonth);

  for (var i = 0; i < nestedDataYear.length; i++) {
    nestedDataYear[i].key = new Date(nestedDataYear[i].key);
  }

  var xScale = d3.scaleTime()
                 .domain(d3.extent(nestedDataYear, function(d) {
                    return new Date(d.key);
                  }))
                 .range([margin, width]);

  var yScale = d3.scaleLinear()
                 .domain([0, d3.max(nestedDataYear, function(d) {
                    return d.value;
                  })])
                 .range([height, margin]);

  svg.selectAll("circle")
     .data(nestedDataYear)
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

d3.csv("data/flight_data.csv", function(d) {
  return {
    date: parseTime(d.Year + " " + d.Month + " " + d.DayofMonth),
    cancel: +d.Cancelled
  };
}, draw_points);