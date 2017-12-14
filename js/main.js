var xCanvas = 700;
var yCanvas = 400;
var padding = 100;

var dataset = d3.csv("data/cancellation_count_per_year.csv", function(d) {
  return {
    year: new Date(+d.Year, 0, 1),
    cancellations: d.Cancelled_Count
  };
}, function(error, rows) {
  console.log(rows);
});

var xScale = d3.time.scale()
                    .domain(d3.extent(dataset, function(d) {return d.year;}))
                    .range([padding, xCanvas - padding * 2]);

var yScale = d3.scale.linear()
                     .domain(d3.extent(dataset, function(d) {return d.cancellations;}))
                     .range([yCanvas - padding, padding]);

var svg = d3.select("body")
            .append("svg")
            .attr("width", xCanvas)
            .attr("height", yCanvas);

svg.selectAll("rect")
   .data(dataset)
   .enter().append("rect")
   .attr("x", function(d) {return xScale(d.year);})
   .attr("y", function(d) {return yScale(d.cancellations);});