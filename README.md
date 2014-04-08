# Timeseries Analysis #
A chainable timeseries analysis tool.

Transform your data, filter it, smooth it, remove the noise, get stats, get a preview chart of the data, ...

This lib was conceived to analyze noisy financial data but is suitable to any type of timeseries.

## installation ##
`npm install timeseries-analysis`

`var timeseries = require("timeseries-analysis");`

## Note ##
This package is in early alpha, and is currently under active development.

The format or name of the methods might change in the future.

## Data format ##
### Loading from a timeseries with dates (default) ###
The data must be in the following format:
```
var data = [
    [date, value],
    [date, value],
    [date, value],
    ...
];
```
`date` can be in any format you want, but it is recommanded you use date value that is comaptible with a JS Date object.

`value` must be a number.

```
// Load the data
var t     = new timeseries.main(data);
```

### Loading from a database ###
Alternatively, you can also load the data from your database:
```
// Unfiltered data out of MongoDB:
var data = [{
        "_id": "53373f538126b69273039245",
        "adjClose": 26.52,
        "close": 26.52,
        "date": "2013-04-15T03:00:00.000Z",
        "high": 27.48,
        "low": 26.36,
        "open": 27.16,
        "symbol": "fb",
        "volume": 30275400
    },
    {
        "_id": "53373f538126b69273039246",
        "adjClose": 26.92,
        "close": 26.92,
        "date": "2013-04-16T03:00:00.000Z",
        "high": 27.11,
        "low": 26.4,
        "open": 26.81,
        "symbol": "fb",
        "volume": 27365900
    },
    {
        "_id": "53373f538126b69273039247",
        "adjClose": 26.63,
        "close": 26.63,
        "date": "2013-04-17T03:00:00.000Z",
        "high": 27.2,
        "low": 26.39,
        "open": 26.65,
        "symbol": "fb",
        "volume": 26440600
    },
    ...
];

// Load the data
var t     = new timeseries.main(timeseries.adapter.fromDB(data, {
    date:   'date',     // Name of the property containing the Date (must be compatible with new Date(date) )
    value:  'close'     // Name of the property containign the value. here we'll use the "close" price.
}));
```

This is the data I will use in the doc:
![Chart](https://chart.googleapis.com/chart?cht=lc&chs=800x200&chxt=y&chd=s:ebgfqpqtzv40yxvrw740914wswyupqdgPRNOXYLAB&chco=76a4fb&chm=&chds=56.75,72.03&chxr=0,56.75,72.03,10)

### Loading from an array ###
Finaly, you can load the data from an array:
```
// Data out of MongoDB:
var data = [12,16,14,13,11,10,9,11,23,...];

// Load the data
var t     = new timeseries.main(timeseries.adapter.fromArray(data));
```

### Chaining ###
You can chain the methods. For example, you can calculate the moving average, then apply a Linear Weighted Moving Average on top of the first Moving Average:

`t.ma().lwma();`

### Getting the data ###
When you are done processing the data, you can get the processed timeseries using `output()`:

`var processed = t.ma().output();`

### Charting ###
#### Charting the current buffer ####
You can plot your data using Google Static Image Chart, as simply as calling the `chart()` method:

```
var chart_url = t.ma({period: 14}).chart();
// returns https://chart.googleapis.com/chart?cht=lc&chs=800x200&chxt=y&chd=s:JDOLhghn0s92xuilnptvxz1110zzzyyvrlgZUPMHA&chco=76a4fb&chm=&chds=63.13,70.78&chxr=0,63.13,70.78,10
```
![chart](https://chart.googleapis.com/chart?cht=lc&chs=800x200&chxt=y&chd=s:JDOLhghn0s92xuilnptvxz1110zzzyyvrlgZUPMHA&chco=76a4fb&chm=&chds=63.13,70.78&chxr=0,63.13,70.78,10)

#### Charting the original data ####
You can include the original data in your chart:
```
var chart_url = t.ma({period: 14}).chart({main:true});
// returns https://chart.googleapis.com/chart?cht=lc&chs=800x200&chxt=y&chd=s:ebgfqpqtzv40yxrstuwxyz000zzzzyyxvsqmjhfdZ,ebgfqpqtzv40yxvrw740914wswyupqdgPRNOXYLAB&chco=76a4fb,ac7cc7&chm=&chds=56.75,72.03&chxr=0,56.75,72.03,10
```
![chart](https://chart.googleapis.com/chart?cht=lc&chs=800x200&chxt=y&chd=s:ebgfqpqtzv40yxrstuwxyz000zzzzyyxvsqmjhfdZ,ebgfqpqtzv40yxvrw740914wswyupqdgPRNOXYLAB&chco=76a4fb,ac7cc7&chm=&chds=56.75,72.03&chxr=0,56.75,72.03,10)

#### Charting more data ####
You can chart more than one dataset, using the `save()` method. You can use the `reset()` method to reset the buffer.

`save()` will save a copy the current buffer and add it to the list of datasets to chart.

`reset()` will reset the buffer back to its original data.

```
// Chart the Moving Average and a Linear Weighted Moving Average on on the same chart, in addition to the original data:
var chart_url = t.ma({period: 8}).save('moving average').reset().lwma({period:8}).save('LWMA').chart({main:true});
// returns https://chart.googleapis.com/chart?cht=lc&chs=800x200&chxt=y&chd=s:ebgfqpqthjnptuwyzyzyxyy024211yxusrojfbWUQ,ebgfqpqtzv40yxvrw740914wswyupqdgPRNOXYLAB,ebgfqpqtknqtvwxyxxyyy0022200zwvrpmidZXVTP,ebgfqpqthjnptuwyzyzyxyy024211yxusrojfbWUQ&chco=76a4fb,9190e1,ac7cc7,c667ad&chm=&chds=56.75,72.03&chxr=0,56.75,72.03,10
```
![chart](https://chart.googleapis.com/chart?cht=lc&chs=800x200&chxt=y&chd=s:ebgfqpqthjnptuwyzyzyxyy024211yxusrojfbWUQ,ebgfqpqtzv40yxvrw740914wswyupqdgPRNOXYLAB,ebgfqpqtknqtvwxyxxyyy0022200zwvrpmidZXVTP,ebgfqpqthjnptuwyzyzyxyy024211yxusrojfbWUQ&chco=76a4fb,9190e1,ac7cc7,c667ad&chm=&chds=56.75,72.03&chxr=0,56.75,72.03,10)

## Stats ##
You can obtain stats about your data. The stats will be calculated based on the current buffer.

#### Min ####
`var min = t.min(); // 56.75`

#### Max ####
`var max = t.max(); // 72.03`

#### Mean (Avegare) ####
`var mean = t.mean();   // 66.34024390243898`

#### Standard Deviation ####
`var stdev = t.stdev(); // 3.994277911972647`


## Smoothing ##
There are a few smoothing options implemented:

#### Moving Average ####
```
t.ma({
    period:    6
});
```
![chart](https://chart.googleapis.com/chart?cht=lc&chs=800x200&chxt=y&chd=s:ebgfqpiknqtvxyzyxwxyz134300yxutroidZUTSRO,ebgfqpqtzv40yxvrw740914wswyupqdgPRNOXYLAB&chco=76a4fb,ac7cc7&chm=&chds=56.75,72.03&chxr=0,56.75,72.03,10)

#### Linear Weighted Moving Average ####
```
t.lwma({
    period:    6
});
```
![chart](https://chart.googleapis.com/chart?cht=lc&chs=800x200&chxt=y&chd=s:ebgfqpghlnstvyzzzxwwxz25322zyvutrnidXUQRQ,ebgfqpqtzv40yxvrw740914wswyupqdgPRNOXYLAB&chco=76a4fb,ac7cc7&chm=&chds=56.75,72.03&chxr=0,56.75,72.03,10)

#### John Ehlers iTrend ####
Created by John Ehlers to smooth noisy data without lag. `alpha` must be between 0 and 1.
```
t.dsp_itrend({
   alpha:   0.7
});
```
![chart](https://chart.googleapis.com/chart?cht=lc&chs=800x200&chxt=y&chd=s:gdijntstyz140xwst3835630ttxwrpjeXPPOVbUGA,gdigrqru0w41yxvrx741925xtwyvqrfiRTPQZaNDE&chco=76a4fb,ac7cc7&chm=&chds=56.02406150533825,72.03&chxr=0,56.02406150533825,72.03,10)

## Noise Removal ##
Most smoothing algorithms induce lag in the data. Algorithms like Ehler's iTrend algorithm has no lag, but won't be able to perform really well on a really noisy dataset as you can see in the example above.

For that reason, this package has a set of lagless noise-removal and noise-separation algorithms.

#### Noise removal ####
```
t.smoother({
    period:     10
});
```
![chart](https://chart.googleapis.com/chart?cht=lc&chs=800x200&chxt=y&chd=s:ebehknprsuvwxxyzz000zzyxvtqolifcaXUROLHEB,ebgfqpqtzv40yxvrw740914wswyupqdgPRNOXYLAB&chco=76a4fb,ac7cc7&chm=&chds=56.75,72.03&chxr=0,56.75,72.03,10)

#### Noise separation ####
You can extract the noise from the signal.
```
t.smoother({period:10}).noiseData();
// Here, we add a line on y=0, and we don't display the orignal data.
var chart_url = t.chart({main:false, lines:[0]})
```
![chart](https://chart.googleapis.com/chart?cht=lc&chs=800x200&chxt=y&chd=s:cchVrifiugzogaTHTvnd0itbUjurmwYmANKU09lSc,cc&chco=76a4fb,ABABAB&chm=&chds=-2.772930015555005,3.273743787160555&chxr=0,-2.772930015555005,3.273743787160555,10)

You can also smooth the noise, to attempt to find patterns:
```
t.smoother({period:10}).noiseData().smoother({period:5});
```
![chart](https://chart.googleapis.com/chart?cht=lc&chs=800x200&chxt=y&chd=s:VVcgnsz697zlWQTXhqy2yutx2898xhPBANemolhbV,VV&chco=76a4fb,ABABAB&chm=&chds=-0.5213070211063218,1.0039088636758096&chxr=0,-0.5213070211063218,1.0039088636758096,10)



## License ##
FormJS is free for non-commercial use under the [Creative Commons Attribution-NonCommercial 3.0 License](http://creativecommons.org/licenses/by-nc/3.0/legalcode). You are also allowed to edit the source code that is included along with the download. If you are a non-profit, student or an educational institute, feel free to download and use it in your projects.