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



## Forecasting ##
This package allows you to easily forecast future values by calculating the Auto-Regression (AR) coefficients for your data.

The AR coefficients can be calculated using both the **Least Square** and using the **Max Entropy** methods.

Both methods have a `degree` parameter that let you define what AR degree you wish to calculate. The default is 5.

*Both methods were ported to Javascript for this package from [Paul Bourke's C code](http://paulbourke.net/miscellaneous/ar/). Credit to Alex Sergejew, Nick Hawthorn and Rainer Hegger for the original code of the Max Entropy method. Credit to Rainer Hegger for the original code of the Least Square method.*

#### Calculating the AR coefficients ####
Let's generate a simple sin wave:
```
var t     	= new ts.main(ts.adapter.sin({cycles:4}));
```

![chart](https://chart.googleapis.com/chart?chm=&cht=lc&chs=800x200&chxt=y&chd=s:999999888877665544332100zyxwwvutsrqponmlkjihgfdcbaZYXWVUTSRQPONNMLKJJIHGGFFEEDDCCBBBBAAAAAAAAAAABBBBCCDDEEFFGGHIJJKLMNNOPQRSTUVWXYZabcdeghijklmnopqrstuvwwxyz00123344556677888899999999999888877665544332100zyxwwvutsrqponmlkjihgfdcbaZYXWVUTSRQPONNMLKJJIHGGFFEEDDCCBBBBAAAAAAAAAAABBBBCCDDEEFFGGHIJJKLMNNOPQRSTUVWXYZabcdeghijklmnopqrstuvwwxyz00123344556677888899999999999888877665544332100zyxwwvutsrqponmlkjihgfdcbaZYXWVUTSRQPONNMLKJJIHGGFFEEDDCCBBBBAAAAAAAAAAABBBBCCDDEEFFGGHIJJKLMNNOPQRSTUVWXYZabcdeghijklmnopqrstuvwwxyz00123344556677888899999999999888877665544332100zyxwwvutsrqponmlkjihgfdcbaZYXWVUTSRQPONNMLKJJIHGGFFEEDDCCBBBBAAAAAAAAAAABBBBCCDDEEFFGGHIJJKLMNNOPQRSTUVWXYZabcdeghijklmnopqrstuvwwxyz00123344556677888899999&chco=76a4fb&chds=-100,100&chxr=0,-100,100,10)

Now we get the coefficients (default: degree 5) using the Max Entropy method:
```
var coeffs = t.ARMaxEntropy();
/* returns:
[
    -4.996911311490191,
    9.990105570823655,
    -9.988844272139962,
    4.995018589153196,
    -0.9993685753936928
]
*/
```

Now let's calculate the coefficents using the Least Square method:
```
var coeffs = t.ARLeastSquare();
/* returns:
[
    -0.1330958776419982,
    1.1764459735164208,
    1.3790630711914558,
    -0.7736249950234015,
    -0.6559429479401289
]
*/
```

To specify the degree:
```
var coeffs = t.ARMaxEntropy({degree: 3});   // Max Entropy method, degree 3
var coeffs = t.ARLeastSquare({degree: 7});  // Least Square method, degree 7.
```


Now, calculating the AR coefficients of the entire dataset might not be really useful for any type of real-life use.
You can specify what data you want to use to calculate the AR coefficients, allowing to use only a subset of your dataset using the `data` parameter:
```
// We'll use only the first 10 datapoints of the current data
var coeffs = t.ARMaxEntropy({
    data:   t.data.slice(0, 10)
});
/* returns:
[
    -4.728362307674655,
    9.12909005456654,
    -9.002790480535127,
    4.536763868018368,
    -0.9347010551658372
]
*/
```


#### Calculating the forecasted value ####
Now that we know how to calculate the AR coefficients, let's see how we can forecast a future value.

For this example, we are going to forecast the value of the 11th datapoint's value, based on the first 10 datapoints' values. We'll keep using the same sin wave.

```
// The sin wave
var t     	= new ts.main(ts.adapter.sin({cycles:4}));

// We're going to forecast the 11th datapoint
var forecastDatapoint	= 11;	

// We calculate the AR coefficients of the 10 previous points
var coeffs = t.ARMaxEntropy({
	data:	t.data.slice(0,10)
});

// Output the coefficients to the console
console.log(coeffs);

// Now, we calculate the forecasted value of that 11th datapoint using the AR coefficients:
var forecast	= 0;	// Init the value at 0.
for (var i=0;i<coeffs.length;i++) {	// Loop through the coefficients
	forecast -= t.data[10-i][1]*coeffs[i];
	// Explanation for that line:
	// t.data contains the current dataset, which is in the format [ [date, value], [date,value], ... ]
	// For each coefficient, we substract from "forecast" the value of the "N - x" datapoint's value, multiplicated by the coefficient, where N is the last known datapoint value, and x is the coefficient's index.
}
console.log("forecast",forecast);
// Output: 92.7237232432106
```

Based on the value of the first 10 datapoints of the sin wave, out forecast indicates the 11th value should be around 92.72 so let's check that visually. I've re-generated the same sin wave, adding a red dot on the 11th point:
![chart](https://chart.googleapis.com/chart?chm=s,ff0000,0,11.0,5.0&cht=lc&chs=800x200&chxt=y&chd=s:999999888877665544332100zyxwwvutsrqponmlkjihgfdcbaZYXWVUTSRQPONNMLKJJIHGGFFEEDDCCBBBBAAAAAAAAAAABBBBCCDDEEFFGGHIJJKLMNNOPQRSTUVWXYZabcdeghijklmnopqrstuvwwxyz00123344556677888899999999999888877665544332100zyxwwvutsrqponmlkjihgfdcbaZYXWVUTSRQPONNMLKJJIHGGFFEEDDCCBBBBAAAAAAAAAAABBBBCCDDEEFFGGHIJJKLMNNOPQRSTUVWXYZabcdeghijklmnopqrstuvwwxyz00123344556677888899999999999888877665544332100zyxwwvutsrqponmlkjihgfdcbaZYXWVUTSRQPONNMLKJJIHGGFFEEDDCCBBBBAAAAAAAAAAABBBBCCDDEEFFGGHIJJKLMNNOPQRSTUVWXYZabcdeghijklmnopqrstuvwwxyz00123344556677888899999999999888877665544332100zyxwwvutsrqponmlkjihgfdcbaZYXWVUTSRQPONNMLKJJIHGGFFEEDDCCBBBBAAAAAAAAAAABBBBCCDDEEFFGGHIJJKLMNNOPQRSTUVWXYZabcdeghijklmnopqrstuvwwxyz00123344556677888899999&chco=76a4fb&chds=-100,100&chxr=0,-100,100,10)

As we can see on the chart, the 11th datapoint's value seems to be around 92, as was forecasted.


#### Forecast accuracy ####
In order to check the forecast accuracy on more complex data, you can access the `sliding_regression_forecast` method, which will use a sliding window to forecast all of the datapoints in your dataset, one by one. You can then chart this forecast and compare it t the original data.

First, let's generate a dataset that is a little bit more complex data than a regular sin wave. We'll increase the sin wave's frequency over time using the `inertia` parameter to control the increase:

```
var t     	= new ts.main(ts.adapter.sin({cycles:10, inertia:0.2}));
```
![chart](https://chart.googleapis.com/chart?chm=&cht=lc&chs=800x200&chxt=y&chd=s:99999887765320zwuspmjfcZVSOLIGDCAAABDFJNRWchnsx25899863ysleXQKFBABDIOWenv269983xpfVNGBACIQalv38971shVLDABHRdq0796znaNEACKWjw6996wiUHBBJWlz895uePEAFSiy794raLBBLct694pXHAESl1993nUFAIau7&chco=76a4fb&chds=-99.95065603657316,100&chxr=0,-99.95065603657316,100,10)


Now, we generate the sliding window forecast on the data, and chart the results:
```
// Our sin wave with its frequency increase
var t     	= new ts.main(ts.adapter.sin({cycles:10, inertia:0.2}));
// We are going to use the past 20 datapoints to predict the n+1 value, with an AR degree of 5 (default)
// The default method used is Max Entropy
t.sliding_regression_forecast({sample:20, degree: 5});
// Now we chart the results, comparing the the original data.
// Since we are using the past 20 datapoints to predict the next one, the forecasting only start at datapoint #21. To show that on the chart, we are displaying a red dot at the #21st datapoint:
var chart_url = t.chart({main:true,points:[{color:'ff0000',point:21,serie:0}]});
```

And here is the result:

*   The red line is the original data.
*   The blue line is the forecasted data.
*   The red dot indicate at which point the forecast starts.

![chart](https://chart.googleapis.com/chart?chm=s,ff0000,0,21.0,5.0&cht=lc&chs=800x200&chxt=y&chd=s:7777666544310zxvtqolifbYVROLIGECBBBCDGJNRWbgmrw03677651wrleXQKGCBBDIOWemu047652wneVNGCBDIQZku27850rgVLEACHRdpz574ymZNFBDJVjw4743xjUJCCJUjy782ufQEAFQgw793tdMDCJZr571rYJCGRj093wnWGCKXp4,7777666544310zxvtqolifbYVROLIGECBBBCDGJNRWbgmrw03677641wqkdWQKFCBBEIOWemt047752vneVNGCBDIQakt1675zqgVLEBCIRdoy574xmZOFBDKVjv4774uhTIBCJWkx573sdPEBGShw572qaLCCLbs472oXIBFSk0771mTFBJas5&chco=76a4fb,ac7cc7&chds=-102.46755009608293,107.54738106314204&chxr=0,-102.46755009608293,107.54738106314204,10)

Despite the frequency rising with time, the forecast is still pretty accurate. For the first 2 cycles, we can barely see the difference between the original data and the forecasted data.


Now, let's try on a more complex data.

Wee're going to generate a dataset using ![sin(x)+cos(x*3)-sin(x 2.4)*100](http://rogercortesi.com/eqn/tempimagedir/eqn3983.png), with a frequency increasing with time.

```
var t     	= new ts.main(ts.adapter.complex({cycles:10, inertia:0.1}));
```
![chart](https://chart.googleapis.com/chart?chm=&cht=lc&chs=800x200&chxt=y&chd=s:mmllkjihgfecbZYWUSRQPONOOPRUXaejnsx15799851vpiaTMGCAACGLRXdhjjhdXRKFBACFLSYfmicWROOSakv4882reRGABHQahjgZPGBBGPZmgYQNScq395tcLBBKWgjeTHBCLXmeUORdu78vbIAFTgjbNCBKYmdROXq68sUDCPejaKBESmbPPf09xXDCShhSDCPmaOSn75hHBQhgQBFWmZOWv9vRAKeiRBFYmYNb18jGDXjXDEXmXOg53XALheJBS&chco=76a4fb&chds=-205.05356081386265,286.52738649942415&chxr=0,-205.05356081386265,286.52738649942415,10)

Now we forecast the same way we did in the previous example on the sin wave:

```
var t         = new ts.main(ts.adapter.complex({cycles:10, inertia:0.1}));
// We are going to use the past 20 datapoints to predict the n+1 value, with an AR degree of 5 (default)
// The default method used is Max Entropy
t.sliding_regression_forecast({sample:20, degree: 5});
// Now we chart the results, comparing the the original data.
// Since we are using the past 20 datapoints to predict the next one, the forecasting only start at datapoint #21. To show that on the chart, we are displaying a red dot at the #21st datapoint:
var chart_url = t.chart({main:true,points:[{color:'ff0000',point:21,serie:0}]});
```
![chart](https://chart.googleapis.com/chart?chm=s,ff0000,0,21.0,5.0&cht=lc&chs=800x200&chxt=y&chd=s:onnmmlkkjhgfecaZXWUTSSRRSTVXadhlpty15799852xrkdWQLHFFHKPVafjlljgaUOJGFGKPVbhlvXaWSQSWenw22yrhWLFFLUdknkcTKFFKTcjwXTOTaktzzsgSIGNZlqmcPFHQbkyPRRakuwlYNHNYjqnbTQXjorUMThtvlWGJYlumZOReovUKYnshPDGYpqcNMXktQUdtteNJaosbOQhqnVPetoSAMkqaJNenhJToyfNNjwgLJhqfNQusMHQruYNa,onnmmlkkjhgfecaZXWUTSSRRSTVXadhlpuy25799852xrkdWQLHFFHKPVafjlljfaUOJGFGKPVbhokfZURSWdmw4983tgUKFGLUdjmjcTKGGKTcoiaURVfs396uePGGOZjlgWLFHPaohXRUgv78weMFKWileRHGObofVRar68uYHGShldOFJWoeTTi19yaIHVjjVIGTodSWp75jLGUjjTGJZocRZw9wVFOhkVGKbobRe18lKHamaIIaoaRi63aFPjhNGV&chco=76a4fb,ac7cc7&chds=-247.32087831139637,286.52738649942415&chxr=0,-247.32087831139637,286.52738649942415,10)


Now let's try the same thing, using the Least Square method rather than the default Max Entropy method:

```
var t         = new ts.main(ts.adapter.complex({cycles:10, inertia:0.1}));
// We are going to use the past 20 datapoints to predict the n+1 value, with an AR degree of 5 (default)
// The default method used is Max Entropy
t.sliding_regression_forecast({sample:20, degree: 5, method: 'ARLeastSquare'});
// Now we chart the results, comparing the the original data.
// Since we are using the past 20 datapoints to predict the next one, the forecasting only start at datapoint #21. To show that on the chart, we are displaying a red dot at the #21st datapoint:
var chart_url = t.chart({main:true,points:[{color:'ff0000',point:21,serie:0}]});
```
![chart](https://chart.googleapis.com/chart?chm=s,ff0000,0,21.0,5.0&cht=lc&chs=800x200&chxt=y&chd=s:rqqqpponmlkjihfedbaZYYXXYZacfhloswz35899852yupjcVRNLLNRVafknpqokfaVQONORWbgloulaMWXZdjqwzzvpgXRMMQYiqsphYROOSZgnxeTDXhow0zsiYRQWgotrlYNOWgoybcLdqxxpdTRWhqupcVTbiqvhWQkzphLEQhstjXRUentaUVs2ufORguugUUgqxcSWtrQACZslYOTfnmSWq1xfSaqvhRSismSauylQSmynVUjtmVasvcNSqraRf,rqqqpponmlkjihfedbaZYYXXYZacfhloswz35899863ytnhcWSPNNORVafjnppnkfaVRONORVbglrojeaYYbhpy5984vkaSNNSZhnpmgZSNNSZgrmfZXbju496wjWOOUempkcSNOVfrlcYakx78yiTNRcmpiXOOVgrjaYfu68wdPOYlphVNQbriZZl29zfPPbnnbPOZrhYbs76nSNZnmZOQergXey9yaNVloaORgrfXi38pRPfpfPQfrfYm64fNWnlUNb&chco=76a4fb,ac7cc7&chds=-334.6878609191184,286.52738649942415&chxr=0,-334.6878609191184,286.52738649942415,10)


Now, let's try the forecasting on real data, using the stock price of Facebook ($FB):
```
// We fetch the financial data from MongoDB, then use adapter.fromDB() to load that data
var t     	= new ts.main(ts.adapter.fromDB(financial_data));
// Now we remove the noise from the data and save that noiseless data so we can display it on the chart
t.smoother({period:4}).save('smoothed');
// Now that the data is without noise, we use the sliding window forecasting
t.sliding_regression_forecast({sample:20, degree: 5});
/ Now we chart the data, including the original financial data (purple), the noiseless data (pink), and the forecast (blue)
var chart_url = t.chart({main:true,points:[{color:'ff0000',point:20,serie:0}]});
```
![chart](https://chart.googleapis.com/chart?chm=s,ff0000,0,20.0,5.0&cht=lc&chs=800x200&chxt=y&chd=s:JJIGFEEDDEEFFGHIJKMOQSUVWYaaaZYXYZabbbbccccccbaZYZbdgijlmopqsuvxy01222212344555433221zyvsqommmkihhhggff,JJJCDEEDACEFFEJIHJMKQTUXYXXdddYUWWWcdecdZddcafcaWUXUkolonnsqtsyyy04164321z28649562z231yyrtjkijoohbbengf,JJIGFEEDDEEFFGHIJKMOQSTVXYZZZYYYYZabbbcccccccbaYYacehikmnoqrtuwyz01222223345555433210zxusqonmljihhhggff&chco=76a4fb,9a89d8,bd6eb6&chds=44.82,72.03&chxr=0,44.82,72.03,10)


#### Forecasting optimization ####
Exploring which degree to use, which method to use (Least Square or Max Entropy) and which sample size to use is time consumming, and you might not find the best settings by yourself.

Thats why there is a method that will incrementally search for the best settings, that will lead to the lowest MSE.

We'll use the $FB chart again, with its noise removed.

```
// We fetch the financial data from MongoDB, then use adapter.fromDB() to load that data
var t         = new ts.main(ts.adapter.fromDB(financial_data));

// Now we remove the noise from the data and save that noiseless data so we can display it on the chart
t.smoother({period:4}).save('smoothed');

// Find the best settings for the forecasting:
var bestSettings = t.regression_forecast_optimize(); // returns { MSE: 0.05086675645862624, method: 'ARMaxEntropy', degree: 4, sample: 20 }

// Apply those settings to forecast the n+1 value
t.sliding_regression_forecast({
	sample:		bestSettings.sample,
	degree: 	bestSettings.degree,
	method: 	bestSettings.method
});

// Chart the data, with a red dot where the forecasting starts
var chart_url = t.chart({main:false,points:[{color:'ff0000',point:bestSettings.sample,serie:0}]});
```
![chart](https://chart.googleapis.com/chart?chm=s,ff0000,0,20.0,5.0&cht=lc&chs=800x200&chxt=y&chd=s:GGFDCBAAABBCDEFGHJMOQSTVXZZZYXWXYZabbbbbbbccbZYXYbdgikmopqsuwxz13455554567899987665420xurpnnnlihhhhggf,GGFDCBAAABBCDEFGHJMOQSUVXYYYXXXXYZaabbbbbccbaZYYZbehjlnoqrtvxy02345555566789987765431zwurponmkihhhhgff&chco=76a4fb,ac7cc7&chds=46.4829833984375,70.43257814447117&chxr=0,46.4829833984375,70.43257814447117,10)



## License ##
timeseries-analysis is free for non-commercial use under the [Creative Commons Attribution-NonCommercial 3.0 License](http://creativecommons.org/licenses/by-nc/3.0/legalcode). You are also allowed to edit the source code that is included along with the download. If you are a non-profit, student or an educational institute, feel free to download and use it in your projects.