# Time Histogram

With this skript you can quickly create a frequency histogram over time. Just put in an array of unix timestamps, choose your bin size (years, months, days,...) and the rest is done for you. No gaps occur, no extra config needed.

This is based on the [Google Chart API](https://developers.google.com/chart/), so you need to import that.

Example:

![alt text](https://github.com/Timmothey/timehistogram/example.png "")

## Basic usage:
```html
<!-- import Google Chart API -->
<script type="text/javascript" src="https://www.google.com/jsapi?autoload={'modules':[{'name':'visualization','version':'1','packages':['corechart']}]}"></script>

<!-- container for the chart -->
<div id="histChart"></div>
```
Than plop in your data:
```html
<script type="text/javascript">
     var hist = new TimeHistogram();
     hist.rawData = [[1421842298],[1421842350],...,[1421842451],[1421842467]];
     hist.drawChart();
</script>

```

Alternative data format also possible:
```javascript
 // one dimensional
 hist.rawData = [1,2,3,4,5,...];
 
 // or put in all you have
 hist.rawData = [[1,33,534],[2,34,123],...];
 // if you use a multidimensional array, you should define, in which column the unix timestamps are:
 hist.dataOptions.timeIndex = 0;
 
```

You can also change the bin size:
```javascript
// bin size can be year, month, week, day, hour, minute, second
hist.dataOptions.bins = "day";

// if you use an alternative id for your chart container:
hist.dataOptions.chartDOMElement = "histChart";
```
