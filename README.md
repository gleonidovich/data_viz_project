
Project submission for the Udacity Data Visualization course.

## Summary
This data visualization shows the number of flight cancellations between 1988 and 2008 for all domestic U.S. flights. The full data set can be found [here](http://stat-computing.org/dataexpo/2009/the-data.html).

## Design and Feedback
The design started with a simple scatter plot of the number of cancellations per year. With the basic scaling and functionality finished, the dataset was expanded to be able to show the per month and per day numbers. Buttons were added to allow the reader to choose the view of the data that they wanted. The last addition was functionality to view the data segments by the year.

### Feedback: gist Revision 5
The reader noticed that there were spikes in the visualization that occurred at the beginning of every year. The reader guessed that these spikes of cancellations had to do with winter weather. With that in mind, the reader suggested adding an option for showing the cancellations based on the departure airport and destination airport.

The dataset had to be modified to try to look at the departure and destination airports. The resulting dataset that contained both origin and destination was too large and caused too big of a slow down. I chose to use Origin. I also reduced the set of observed airports to the 30 busiest hubs in the United States (link in resources section). I added a drop-down menu to be able to constrain the set to each airport. I also added the option to display the data points as the rate of cancellations out of all of flights for that month/year (later removed for simplicity). Interestingly, this has little effect on the position of the points.

A tool-tip was added that shows the date, number of cancellations, number of flights for the time period, and the percentage of cancellations.

### Feedback: gist Revision 13
>What do you notice in the visualization?
>>fluctuations in the seasons based upon the airport/region (IE chicago and snow) as well as big events like 9-11
>
>What questions do you have about the data?
>>source? I assume this is from the FAA 
>
>What relationships do you notice?
>>A sort of business cycle effect in the # of cancellations spiking in the peak summer and winter
>
>What do you think is the main takeaway from this visualization?
>>This could be a great tool for someone planning travel

While the reader's suggested functionality would be useful, I do not think that this fits the scope of the current visualization.

### Feedback: gist Revision 13
>What do you notice in the visualization?
>>Overall, there is fairly static data across the time span defined in the graphic. The presentation gives insight as to what time of year it might be more preferable to travel by airline.
>
>What questions do you have about the data?
>>At this time, no questions exist regarding the data. The simulation provides the answers to questions I would normally have.
>
>What relationships do you notice?
>>I notice that relationships exist during particular times of the year. For instance, the winter season of any given year sees an uptick in the number of flight cancellations. Presumably, this would be from weather-related occurrences.
>
>What do you think is the main takeaway from this visualization?
>>Although flight cancellations do occur on a regular basis, the mythos of the amount of cancellations may be over-blown by the effected population.

## Resources
Data: [ASA Data Expo 2009 (Originally RITA)](http://stat-computing.org/dataexpo/2009/the-data.html)

Data: [Top 30 Hubs](https://en.wikipedia.org/wiki/List_of_the_busiest_airports_in_the_United_States)

Help: [Speeding Up d3.js: A Checklist](https://www.safaribooksonline.com/blog/2014/02/20/speeding-d3-js-checklist/)

Help: [Simple Line Chart](https://bl.ocks.org/mbostock/3883245)

Help: [Animate path in D3](http://bl.ocks.org/duopixel/4063326)

Help: [Mouseover Tooltip](https://bl.ocks.org/mbostock/3902569)