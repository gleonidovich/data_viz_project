
Project submission for the Udacity Data Visualization course.

## Summary
This data visualization shows the number of flight cancellations between 1988 and 2008 for all domestic U.S. flights. The full data set can be found [here](http://stat-computing.org/dataexpo/2009/the-data.html).

## Design and Feedback
The design started with a simple scatterplot of the number of cancellations per year. With the basic scaling and functionality finished, the dataset was expanded to be able to show the per month and per day numbers. Buttons were added to allow the reader to choose the view of the data that they wanted. The last addition was functionality to view the data segments by the year.

### Feedback: gist Revision 5
The reader noticed that there were spikes in the visualization that occurred at the beginning of every year. The reader guessed that these spikes of cancellations had to do with winter weather. With that in mind, the reader suggested adding an option for showing the cancellations based on the departure airport and destination airport.

There dataset had to be modified to try to look at the departure and destination airports. The resulting dataset that contained both origin and destination was too large and caused too big of a slow down. I chose to use Origin. I also reduced the set of observed airports to the 30 busiest hubs in the United States (link in resources section). I added a dropdown menu to be able to constrain the set to each airport. I also added the option to display the data points as the rate of cancellations out of all of flights for that month/year. Interestingly, this has little effect on the position of the points.

A tooltip was added that shows the date, number of cancellations, number of flights for the time period, and the percentage of cancellations. 

## Resources
Data: [ASA Data Expo 2009](http://stat-computing.org/dataexpo/2009/the-data.html)
Data: [Top 30 Hubs](https://en.wikipedia.org/wiki/List_of_the_busiest_airports_in_the_United_States)
Help: [Speeding Up d3.js: A Checklist](https://www.safaribooksonline.com/blog/2014/02/20/speeding-d3-js-checklist/)
Help: [Simple Line Chart](https://bl.ocks.org/mbostock/3883245)
Help: [Animate path in D3](http://bl.ocks.org/duopixel/4063326)
Help: [Mouseover Tooltip](https://bl.ocks.org/mbostock/3902569)