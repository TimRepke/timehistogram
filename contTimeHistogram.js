/**
 * Written by Tim Repke Jan 2015
 *
 * free to use if it complies with GNU GPL 3.0
 *
 * requires to import Google Chart API, i.e.
 *    <script type="text/javascript" src="https://www.google.com/jsapi?autoload={'modules':[{'name':'visualization','version':'1','packages':['corechart']}]}"></script>
 *
 *
 * example use:
 *   <div id="histChart"></div>
 *   
 *   <script type="text/javascript">
 *      var hist = new TimeHistogram();
 *
 *      hist.rawData = [[1421842298],[1421842350],...,[1421842451],[1421842467]];
 *
 *      hist.dataOptions.bins = "day";
 *      hist.dataOptions.chartDOMElement = "histChart";
 *
 *      hist.drawChart();
 *   </script>
 */


function TimeHistogram() {

    /**************************************************************
     * In the following few lines you see the editable
     * parameters you can change. These influence the
     * behaviour of this script.
     * Look at the comments for further info.
     */

    // plug in your (multidimensional) array here
    this.rawData = {};

    // define the behaviour of this library here
    this.dataOptions = {
        // choose the bin size (year, month, week, day, hour, minute, second)
        bins: "day",

        // the DOM object you reserved for the chart (i.e. <div id="histChart"></div>)
        chartDOMElement: "histChart",

        // the header for the chart
        // important to define the types, you can change label and id
        header: [
            {label:'Timeframe', id: 'timeframe', type:'string'},
            {label:'Frequency', id:'frequency', type:'number'}
        ],

        // define in which column you placed the unix timestamps
        // (if you only have a one-dimensional array, keep this at 0)
        timeIndex: 0
    };

    // these are passed on to the Google Chart API without touching.
    // settings here recommended
    this.chartOptions = {
            width: 1200,
            height: 300,
            legend: {position: 'none'},
            hAxis: {
                slantedText: true,
                slantedTextAngle: 50
            }
        };


    /** ================================================================================================================
     *  Don't need to look at the rest - it's not nice...
     *  Just call drawChart and you are good to go ;)
     *
     */


    // main function
    this.drawChart = function(){

        // if not array of arrays -> convert!
        if(!(this.rawData[0].length>=1)){
            var tmp = [];
            this.dataOptions.timeIndex = 0;
            for(var run = 0; run < this.rawData.length; run++)
                tmp[run] = [this.rawData[run]];
            this.rawData = tmp;
        }

        // roll back to standard bin if the user messed up
        if(! (this.dataOptions.bins in this.bin))
            this.dataOptions.bins = "day";

        // prepare the data for the plot
        var plotData = this.rawToData();

        // now we get serious, let google play with the data
        var data = google.visualization.arrayToDataTable(plotData);

        // let gooogle play a bit more
        var chart = new google.visualization.ColumnChart(
            document.getElementById(this.dataOptions.chartDOMElement));

        // goooogled too much, now you see what happened
        chart.draw(data, this.chartOptions);
    };

    // depending on what bin size is chosen, each object
    // defines factors and some other stuff
    this.bin = {
        year: {
            factor: 60 * 60 * 24 * 365, // yup, no leap years
            unixToString: function (ut) {
                var d = new Date(ut * 1000);
                return d.getFullYear();
            },
            getStart: function(ut){
                var start = new Date(ut*1000);
                start.setHours(0);
                start.setMinutes(0);
                start.setDate(1);
                start.setMonth(0);
                return start.getTime()/1000;
            }
        },
        month: {
            factor: 60 * 60 * 24 * 31, // yup, february and all the other months never happened!
            unixToString: function (ut) {
                var d = new Date(ut * 1000);
                return (d.getMonth() + 1) + "/" + d.getFullYear();
            },
            getStart: function(ut){
                var start = new Date(ut*1000);
                start.setHours(0);
                start.setMinutes(0);
                start.setDate(1);
                return start.getTime()/1000;
            }
        },
        week: {
            factor: 60 * 60 * 24 * 7,
            unixToString: function (ut) {
                var d = new Date(ut * 1000);
                var first = new Date(d.getFullYear(), 0, 1);
                var week = Math.ceil((((d - first) / 86400000) + first.getDay() + 1) / 7);
                return week + " - " + d.getFullYear();
            },
            getStart: function(ut){
                var start = new Date(ut*1000);
                start.setHours(0);
                start.setMinutes(0);
                return start.getTime()/1000;
            }
        },
        day: {
            factor: 60 * 60 * 24,
            unixToString: function (ut) {
                var d = new Date(ut * 1000);
                return d.getDate() + "." + (d.getMonth() + 1) + "." + (d.getFullYear() + "").substr(2);
            },
            getStart: function(ut){
                var start = new Date(ut*1000);
                start.setHours(0);
                start.setMinutes(0);
                return start.getTime()/1000;
            }
        },
        hour: {
            factor: 60 * 60,
            unixToString: function (ut) {
                var d = new Date(ut * 1000);
                return d.getHours() + ":00 " + d.getDate + "." + (d.getMonth() + 1) + ".";
            },
            getStart: function(ut){
                var start = new Date(ut*1000);
                start.setMinutes(0);
                return start.getTime()/1000;
            }
        },
        minute: {
            factor: 60,
            unixToString: function (ut) {
                var d = new Date(ut * 1000);
                return d.getHours() + ":" + d.getMinutes();
            },
            getStart: function(ut){
                var start = new Date(ut*1000);
                start.setSeconds(0);
                return start.getTime()/1000;
            }
        },
        second: {
            factor: 1,
            unixToString: function (ut) {
                var d = new Date(ut * 1000);
                return d.getHours() + ":" + d.getMinutes()+"."+ d.getSeconds();
            },
            getStart: function(ut){
                return ut-1;
            }
        }
    };

    // this function prepares the data array for the plotting
    // the bins are prepared and all set to zero
    this.generateEmptyArray = function(start, end){
        var tmp = [];
        var bin = this.bin[this.dataOptions.bins];

        var steps = Math.ceil((end-start)/bin.factor);
        tmp[0] = this.dataOptions.header;

        for(var run = 0; run <= steps; run++){
            tmp[run+1] = [bin.unixToString(start+run*bin.factor),0];
        }

        return tmp;
    };

    // handles the data conversion
    this.rawToData = function(){
        // reset old stuff
        this.plotData = [];

        // some defs to simplify code below
        var raw = this.rawData;
        var t = this.dataOptions.timeIndex;
        var bin = this.bin[this.dataOptions.bins];

        // get a start time, that snapped to the beginning of the bin
        // i.e. so that the day doesn't start at 4pm
        var start = bin.getStart(raw[0][t]);

        // get the empty bins
        var tmp = this.generateEmptyArray(start, raw[raw.length-1][t]);

        // count frequencies
        //   if you have a multidimensional array and want to
        //   use the other stuff, you might do that here.
        for(var run = 0; run < raw.length; run++){
            tmp[Math.ceil((raw[run][t]-start)/bin.factor)][1]++;
        }

        return tmp;
    };

}