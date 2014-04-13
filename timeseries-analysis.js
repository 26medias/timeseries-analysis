var 			_ = require("underscore");
var gimage 		= require('google-image-chart').charts;

var timeseries = function(data, options) {
	/*
		Data Format:
		[
			[Date Object, value],
			[Date Object, value]
		]
	*/
	this.options 	= _.extend({
		
	}, options);
	
	this.data 		= data;
	this.original	= data.slice(0);
	this.buffer 	= [];
	this.saved 		= [];
	
	return this;
}


// Output the data
timeseries.prototype.output = function() {
	return this.data;
}


// Save the data
timeseries.prototype.save = function(name, options) {
	options = _.extend({
		color:	'AUTO'
	}, options);
	
	this.saved.push({
		name:	name,
		color:	options.color,
		data:	this.data.slice(0)
	});
	return this;
}

// Chart the data
timeseries.prototype.chart = function(options) {
	
	options = _.extend({
		main:		false,
		width:		800,
		height:		200,
		bands:		[],
		lines:		[],
		points:		[]
	}, options);
	
	// Google Chart
	var chart = new gimage.line({
		width:	options.width,
		height:	options.height,
		bands:	options.bands,
		hlines:	options.lines,
		points:	options.points,
		autoscale:	true
	});
	chart.fromTimeseries(this.data);
	// Include the original data
	if (options.main) {
		chart.fromTimeseries(this.original);
	}
	
	// Include saved data
	_.each(this.saved, function(saved) {
		chart.fromTimeseries(saved.data);
	});
	
	return chart.render();
}


// Basic utilities: Array fill, data cloning...
// Returns an array filled with the specified value.
timeseries.prototype.fill = function(value, n) {
	var array = [];
	var i;
	for (i=0;i<n;i++) {
		array.push(value);
	}
	return array;
}

// Returns a clone of the data
timeseries.prototype.clone = function() {
	var buffer = _.map(this.data, function(point) {
		return [
			point[0],
			point[1]*1
		];
	});
	return buffer;
}

// Reset the data to its original dataset
timeseries.prototype.reset = function() {
	this.data = this.original;
	return this;
}

// Convert the data to a 1D array
timeseries.prototype.toArray = function() {
	return _.map(this.data, function(datapoint) {
		return  datapoint[1];
	});
}

// Stats: Min, Max, Mean, Stdev
timeseries.prototype.min = function() {
	var array = this.toArray();
	return _.min(array);
}
timeseries.prototype.max = function() {
	var array = this.toArray();
	return _.max(array);
}
timeseries.prototype.mean = function(data) {
	if (!data) {
		var data = this.data;
	}
	var sum 	= 0;
	var n 		= 0;
	_.each(data, function(datapoint) {
		sum += datapoint[1];
		n++;
	});
	return sum/n;
}
timeseries.prototype.stdev = function(data) {
	if (!data) {
		var data = this.data;
	}
	var sum 	= 0;
	var n 		= 0;
	var mean 	= this.mean();
	_.each(data, function(datapoint) {
		sum += (datapoint[1]-mean)*(datapoint[1]-mean);
		n++;
	});
	return Math.sqrt(sum/n);
}


// Offet the data
timeseries.prototype.offset = function(value, data, ret) {
	if (!data) {
		var data = this.data;
	}
	var i;
	var j;
	var l 	= data.length;
	var sum	= 0;
	
	// Reset the buffer
	this.buffer 	= data.slice(0);
	
	for (i=0;i<l;i++) {
		this.buffer[i] = [
			this.buffer[i][0],
			this.buffer[i][1]+value
		];
	}
	if (!ret) {
		this.data = this.buffer;
		return this;
	} else {
		return this.buffer;
	}
}





// Moving Average
timeseries.prototype.ma = function(options) {
	options = _.extend({
		period:		12
	}, options);
	var i;
	var j;
	var l 	= this.data.length;
	var sum	= 0;
	
	// Reset the buffer
	this.buffer 	= [];
	
	// Leave the datapoints [0;period[ intact
	this.buffer = this.data.slice(0, options.period);
	
	for (i=options.period;i<l;i++) {
		sum	= 0;
		for (j=options.period;j>0;j--) {
			sum += this.data[i-j][1];
		}
		this.buffer[i] = [this.data[i][0], sum/options.period];
	}
	this.data = this.buffer;
	return this;
}
timeseries.prototype.ema = function(options) {
	options = _.extend({
		period:		12
	}, options);
	var i;
	var j;
	var l 	= this.data.length;
	var sum	= 0;
	
	// Reset the buffer
	this.buffer 	= [];
	
	// Leave the datapoints [0;period[ intact
	this.buffer = this.data.slice(0, options.period);
	
	var m	= 2/(options.period+1);	// Multiplier
	
	for (i=options.period;i<l;i++) {
		this.buffer[i] = [
			this.data[i][0],
			(this.data[i][1]-this.data[i-1][1])*m+this.data[i-1][1]
		];
	}
	this.data = this.buffer;
	return this;
}
timeseries.prototype.lwma = function(options) {
	options = _.extend({
		period:		12
	}, options);
	var i;
	var j;
	var l 	= this.data.length;
	var sum	= 0;
	var n	= 0;
	
	// Reset the buffer
	this.buffer 	= [];
	
	// Leave the datapoints [0;period[ intact
	this.buffer = this.data.slice(0, options.period);
	
	for (i=options.period;i<l;i++) {
		sum	= 0;
		n	= 0;
		for (j=options.period;j>0;j--) {
			sum += this.data[i-j][1]*j;
			n += j;
		}
		this.buffer[i] = [this.data[i][0], sum/n];
	}
	this.data = this.buffer;
	return this;
}



// DSL, iTrend
timeseries.prototype.dsp_itrend = function(options) {
	// By Ehler
	// http://www.davenewberg.com/Trading/TS_Code/Ehlers_Indicators/iTrend_Ind.html
	options = _.extend({
		alpha:		0.7,
		use:		'main'
	}, options);
	var i;
	var j;
	var l 	= this.data.length;
	
	var trigger 	= [];
	
	// Reset the buffer
	this.buffer 	= [];
	
	// Leave the datapoints [0;period[ intact
	this.buffer 	= this.data.slice(0, 3);
	this.trigger 	= this.data.slice(0, 3);
	
	for (i=3;i<l;i++) {
		this.buffer[i] = [
			this.data[i][0],
			(options.alpha-(options.alpha*options.alpha)/4)*this.data[i][1] + (0.5*(options.alpha*options.alpha)*this.data[i-1][1]) - (options.alpha - 0.75*(options.alpha*options.alpha)) * this.data[i-2][1] + 2*(1-options.alpha)*this.buffer[i-1][1] - (1-options.alpha)*(1-options.alpha)*this.buffer[i-2][1]
		];
		this.trigger[i] = [
			this.data[i][0],
			2*this.buffer[i][1]-this.buffer[i-2][1]
		]
	}
	if (options.use == 'trigger') {
		this.data = this.trigger;
	} else{
		this.data = this.buffer;
	}
	
	return this;
}


// Pixelize - Domain reduction
timeseries.prototype.pixelize = function(options) {
	options = _.extend({
		grid:		20
	}, options);
	
	// Calculate the grid values
	var min 	= this.min();
	var max 	= this.max();
	var tile	= (max-min)/options.grid;
	
	this.buffer	= _.map(this.data, function(datapoint) {
		datapoint[1] = Math.round(datapoint[1]/tile)*tile;
		return datapoint;
	});
	this.data = this.buffer;
	return this;
}


// Iterative Noise Removal
timeseries.prototype.smoother = function(options) {
	options = _.extend({
		period:		1
	}, options);
	var i;
	var j;
	var l 	= this.data.length;
	var sum	= 0;
	
	// Reset the buffer
	this.buffer 	= this.data.slice(0);
	
	for (j=0;j<options.period;j++) {
		for (i=3;i<l;i++) {
			this.buffer[i-1] = [
				this.buffer[i-1][0],
				(this.buffer[i-2][1]+this.buffer[i][1])/2
			];
		}
	}
	this.data = this.buffer;
	return this;
}


// Extract the noise out of the data
timeseries.prototype.noiseData = function() {
	var i;
	var j;
	var l 	= this.data.length;
	var sum	= 0;
	
	// Reset the buffer
	this.buffer 	= [];
	
	for (i=0;i<l;i++) {
		this.buffer[i] = [
			this.data[i][0],
			this.original[i][1]-this.data[i][1]
		];
	}
	this.data = this.buffer;
	return this;
}


// Oscillator function
timeseries.prototype.osc = function() {
	var i;
	var j;
	var l 	= this.data.length;
	var sum	= 0;
	
	// Reset the buffer
	this.buffer 	= [];
	
	for (i=0;i<l;i++) {
		if (i<=1) {
			this.buffer[i] = [
				this.data[i][0],
				0
			];
		} else {
			this.buffer[i] = [
				this.data[i][0],
				this.data[i][1]-this.data[i-1][1]
			];
		}
	}
	this.data = this.buffer;
	return this;
}



// Find the supports and resistances. Wrong algorithm.
timeseries.prototype.supports = function(options) {
	options = _.extend({
		grid:		40,
		threshold:	10
	}, options);
	
	// Calculate the grid values
	var min 	= this.min();
	var max 	= this.max();
	var tile	= (max-min)/options.grid;
	
	var prices = {
		
	};
	
	_.each(this.data, function(datapoint) {
		var val = Math.round(datapoint[1]/tile)*tile;
		if (!prices[val]) {
			prices[val] = 0;
		}
		prices[val]++;
	});
	
	var ordered = [];
	var i;
	for (i in prices) {
		ordered.push({
			price:	i,
			count:	prices[i]
		});
	}
	ordered = ordered.sort(function(a,b) {
		return b.count-a.count;
	});
	ordered	= _.filter(ordered, function(support) {
		return support.count >= options.threshold;
	});
	if (options.stats) {
		return 	ordered;
	}
	
	return _.map(ordered, function(support) {
		return support.price;
	});
}


// Standardize the data
timeseries.prototype.standardize = function(options) {
	options = _.extend({}, options);
	
	var stdev	= this.stdev();
	var mean	= this.mean();
	
	this.data = _.map(this.data, function(datapoint) {
		datapoint[1] = (datapoint[1]-mean)/stdev;
		return datapoint;
	});
	
	return this;
}


// Slice the data
timeseries.prototype.slice = function(from, to) {
	if (!from) {
		from = 0;
	}
	if (!to) {
		to = this.data.length-1;
	}
	
	this.data = this.data.splice(from, to)
	
	return this;
}


// Find the cycle in the data
timeseries.prototype.cycle = function(options) {
	options = _.extend({
		period:		10,
		forecast:	false,
		forecast_length:	20
	}, options);
	
	// Smooth the data
	this.smoother(options);
	
	
	
	// Copy the data
	var buffer 				= [];
	var buffer_forecast 	= [];
	
	var i;
	var j;
	var l = this.data.length;
	for (i=0;i<2;i++) {
		buffer[i] = ([
			this.data[i][0],
			this.data[i][1]
		]);
		buffer_forecast[i] = ([
			this.data[i][0],
			this.data[i][1]
		]);
	}
	for (i=2;i<l;i++) {
		// We find the ratio
		var d1 		= this.data[i][1]-this.data[i-1][1];
		var d2 		= this.data[i][1]-this.data[i-2][1];
		var ratio	= d1/d2;
		console.log("ratio",ratio, d1, d2);
		buffer[i] = ([
			this.data[i][0],
			this.data[i][1]
		]);
		
		buffer_forecast[i] = ([
			this.data[i][0],
			this.data[i][1],
			ratio,
			d1>0,
			d2>0
		]);
		
	}
	
	if (options.forecast) {
		for (i=2;i<l;i++) {
			if (options.forecast == i) {
				
				// Generate a two cycles sin wave
				var sin = [];
				for (j=0;j<720;j++) {
					sin.push(Math.sin(j*Math.PI/180));
				}
				console.log("sin",sin);
				
				// Find the closest sin wave
				var MSE = [];
				var minMSE	= 10000000;
				var pos;
				for (j=2;j<720;j++) {
					var d1 		= sin[j]-sin[j-1];
					var d2 		= sin[j]-sin[j-2];
					var ratio	= d1/d2;
					var mse		= (ratio-buffer_forecast[i][2])*(ratio-buffer_forecast[i][2]);
					if (mse <= minMSE && ((d1>0)==buffer_forecast[i][3]) && ((d2>0)==buffer_forecast[i][3])) {
						minMSE 	= mse;
						pos		= j;
					}
				}
				console.log("minMSE",minMSE, pos);
				
				for (j=0;j<=options.forecast_length;j++) {
					buffer_forecast[i+j][1] = Math.sin((pos+j)*Math.PI/180);
					
					//buffer_forecast[i+j][1] = sin[pos+j];
					
					console.log("buffer_forecast["+(i+j)+"]", pos+j, buffer_forecast[i+j][1]);
				}
				
				break;
			}
		}
		this.data = buffer_forecast;
	} else {
		this.data = buffer;
	}
	
	return this;
}


// Get the outliers from the dataset
timeseries.prototype.outliers = function(options) {
	// Original code by Professor Hossein Arsham - http://home.ubalt.edu/ntsbarsh/Business-stat/otherapplets/Outlier.htm
	// Re-written for timeseries-analysis.
	
	options = _.extend({
		threshold:	2.5
	}, options);
	
	
	// Create a copy of the data;
	this.buffer 	= this.data.slice(0);
	
	// standardize the data
	this.standardize();
	
	var outliers = [];
	
	_.each(this.data, function(datapoint) {
		if (Math.abs(datapoint[1]) > options.threshold) {
			outliers.push(datapoint);
		}
	});
	
	// restore the data
	this.data = this.buffer.slice(0);
	delete this.buffer;
	
	return outliers;
}


/* EXPERIMENTAL - AutoRegression Analysis */

timeseries.prototype.regression_forecast = function(options) {
	options = _.extend({
		method:		'ARMaxEntropy',	// ARMaxEntropy | ARLeastSquare
		sample:		50,		// points int he sample
		start:		100,	// Where to start
		n:			5,		// How many points to forecast
		degree:		5
	},options);
	
	var i;
	var j;
	var l = this.data.length;
	
	var mean	= this.mean();
	this.offset(-mean);
	var backup 	= this.clone();
	var buffer 	= this.clone();
	
	var sample 		= buffer.slice(options.start-1-options.sample, options.start);
	
	// The current data to process is only a sample of the real data.
	this.data		= sample;
	// Get the AR coeffs
	var coeffs 		= this[options.method]({degree: options.degree});
	console.log("coeffs",coeffs);
	
	for (i=options.start;i<options.start+options.n;i++) {
		buffer[i][1]	= 0;
		for (j=0;j<coeffs.length;j++) {
			if (options.method == 'ARMaxEntropy') {
				buffer[i][1] -= buffer[i-1-j][1]*coeffs[j];
			} else {
				buffer[i][1] += buffer[i-1-j][1]*coeffs[j];
			}
		}
		console.log("buffer["+i+"][1]",buffer[i][1]);
	}
	this.data = buffer;
	this.offset(mean);
	
	return this;
}

timeseries.prototype.regression_forecast_optimize = function(options) {
	options = _.extend({
		data:		this.data,
		maxPct:		0.2,
		maxSampleSize:	false
	},options);
	
	var l 				= options.data.length;
	
	var maxSampleSize	= Math.round(l*options.maxPct);
	if (options.maxSampleSize) {
		maxSampleSize = Math.min(maxSampleSize, options.maxSampleSize);
	}
	
	var maxDegree		= Math.round(maxSampleSize);
	var methods			= ['ARMaxEntropy', 'ARLeastSquare'];
	var ss;		// sample size
	var deg;	// degree
	var MSEData = [];
	var i;
	for (i=0;i<methods.length;i++) {
		for (ss=3;ss<=maxSampleSize;ss++) {
			for (deg=1;deg<=maxDegree;deg++) {
				if (deg<=ss) {
					var mse = this.regression_forecast_mse({
						method:	methods[i],
						sample:	ss,
						degree:	deg,
						data:	options.data
					});
					console.log("Trying method("+methods[i]+") degree("+deg+") sample("+ss+")\t"+mse);
					if (!isNaN(mse)) {
						MSEData.push({
							MSE:	mse,
							method:	methods[i],
							degree:	deg,
							sample:	ss
						});
					}
				} else {
					break;
				}
			}
		}
	}
	
	// Now we sort by MSE
	MSEData = MSEData.sort(function(a,b) {
		return a.MSE>b.MSE;
	});
	
	console.log("Best Settings: ",MSEData[0]);
	
	// Return the best settings
	return MSEData[0];
	
}
// Calculate the MSE for a forecast, for a set of parameters
timeseries.prototype.regression_forecast_mse = function(options) {
	options = _.extend({
		method:		'ARMaxEntropy',	// ARMaxEntropy | ARLeastSquare
		sample:		50,
		degree:		5,
		data:		this.data
	},options);
	
	
	var i;
	var j;
	var l 			= options.data.length;
	
	var mean		= this.mean(options.data);
	options.data 	= this.offset(-mean, options.data, true);
	
	var backup 		= _.map(options.data, function(item) {
		return [
			item[0],
			item[1]*1
		];
	});
	var buffer 		= _.map(options.data, function(item) {
		return [
			item[0],
			item[1]*1
		];
	});
	
	var MSE	= 0;
	var n = 0;
	for (i=options.sample;i<l-1;i++) {
		var sample 		= buffer.slice(i-options.sample, i);
		// Get the AR coeffs
		var coeffs 		= this[options.method]({degree:options.degree, data:sample});
		var knownValue 	= buffer[i+1][1]*1;
		buffer[i+1][1]	= 0;
		for (j=0;j<coeffs.length;j++) {
			if (options.method == 'ARMaxEntropy') {
				buffer[i+1][1] -= backup[i-j][1]*coeffs[j];
			} else {
				buffer[i+1][1] += backup[i-j][1]*coeffs[j];
			}
		}
		
		MSE += (knownValue-buffer[i+1][1])*(knownValue-buffer[i+1][1]);
		n++;
	}
	
	MSE /= n;
	
	
	//this.data = buffer;
	
	// Put back the mean
	//this.offset(mean);
	
	return MSE;
}
timeseries.prototype.sliding_regression_forecast = function(options) {
	options = _.extend({
		method:		'ARMaxEntropy',	// ARMaxEntropy | ARLeastSquare
		sample:		50,
		degree:		5
	},options);
	
	var i;
	var j;
	var l = this.data.length;
	
	var mean	= this.mean();
	this.offset(-mean);
	var backup 	= this.clone();
	var buffer 	= this.clone();
	
	for (i=options.sample;i<l-1;i++) {
		var sample 		= buffer.slice(i-options.sample, i);
		// The current data to process is only a sample of the real data.
		this.data		= sample;
		// Get the AR coeffs
		var coeffs 		= this[options.method]({degree:options.degree});
		buffer[i+1][1]	= 0; //backup[i][1]*1;
		for (j=0;j<coeffs.length;j++) {
			if (options.method == 'ARMaxEntropy') {
				buffer[i+1][1] -= backup[i-j][1]*coeffs[j];
			} else {
				buffer[i+1][1] += backup[i-j][1]*coeffs[j];
			}
		}
		//buffer[i+1][1] -
	}
	
	this.data = buffer;
	
	// Put back the mean
	this.offset(mean);
	
	return this;
}



// Autoregression method: MaxEntropy
timeseries.prototype.ARMaxEntropy = function(options) {
	// Credits to Alex Sergejew, Nick Hawthorn, Rainer Hegger (1998)
	// Zero-Indexed arrays modification by Paul Sanders (the arrays were One-indexed, FORTRAN style)
	// Ported to Javascript by Julien Loutre for timeseries-analysis, from Paul Bourke's C code.
	
	options = _.extend({
		degree:			5,
		data:			this.data,
		intermediates:	false	// Generates and returns the intermediates, a 2D array, instead of the coefficients.
	}, options);
	
	var scope	= this;
	var i;
	var length 	= options.data.length;
	var pef 	= this.fill(0, length);
	var per 	= this.fill(0, length);
	var ar 		= this.fill([], options.degree+1);
	ar			= _.map(ar, function(d1) {
		return scope.fill(0, options.degree+1);
	});
	var h 		= this.fill(0, length);
	var g		= this.fill(0, options.degree+2);
	
	var t1, t2;
	var n;
	
	var coef	= [];
	
	for (n=1; n <= options.degree; n++)
	{
		var sn = 0.0;
		var sd = 0.0;
		var j;
		var jj = length - n;
	
		for (j = 0; j < jj; j++)
		{
			t1 = options.data[j + n][1] + pef[j];
			t2 = options.data[j][1] + per[j];
			sn -= 2.0 * t1 * t2;
			sd += (t1 * t1) + (t2 * t2);
		}
	
		t1 = g[n] = sn / sd;
		if (n != 1)
		{
			for (j = 1; j < n; j++) {
				h[j] = g[j] + t1 * g[n - j];
			}
			for (j = 1; j < n; j++) {
				g[j] = h[j];
			}
			jj--;
		}
	
		for (j = 0; j < jj; j++)
		{
			per [j] += t1 * pef[j] + t1 * options.data[j + n][1];
			pef [j] = pef[j + 1] + t1 * per[j + 1] + t1 * options.data[j + 1][1];
		}
	
		if (options.intermediates) {
			for (j = 0; j < n; j++) {
				ar[n][j] = g[j + 1];
			}
		}
		
	}
	if (!options.intermediates) {
		for (n = 0; n < options.degree; n++) {
			coef[n] = g[n + 1];
		}
		return coef;
	} else {
		return ar;
	}
	
}


// Autoregression method: Least Square
timeseries.prototype.ARLeastSquare = function(options) {
	// Credits to Rainer Hegger (1998)
	// Ported to Javascript by Julien Loutre for timeseries-analysis, from Paul Bourke's C code.
	var scope = this;
	
	options = _.extend({
		degree:			5,
		data:			this.data
	}, options);
	
	var i,j,k,hj,hi;
	var coefficients = [];
	
	var length 	= options.data.length;
	var mat 	= this.fill([], options.degree);
	mat			= _.map(mat, function(d1) {
		return scope.fill(0, options.degree);
	});
	
	for (i=0;i < options.degree;i++) {
		coefficients[i] = 0.0;
		for (j=0;j< options.degree;j++) {
			mat[i][j] = 0.0;
		}
	}
	for (i=options.degree-1;i < length-1;i++) {
		hi = i + 1;
		for (j=0;j < options.degree;j++) {
			hj = i - j;
			coefficients[j] += (options.data[hi][1] * options.data[hj][1]);
			for (k=j;k < options.degree;k++) {
				mat[j][k] += (options.data[hj][1] * options.data[i-k][1]);
			}
		}
	}
	for (i=0;i < options.degree;i++) {
		coefficients[i] /= (length - options.degree);
		for (j=i;j < options.degree;j++) {
			mat[i][j] /= (length - options.degree);
			mat[j][i] = mat[i][j];
		}
	}
	
	var solved = this.SolveLE(mat,coefficients,options.degree);
	
	return coefficients;
	
}

timeseries.prototype.SolveLE = function(mat, vec, n) {
	// Gaussian elimination solver.
	// Use the coefficients from the Least Square method and make it into the real AR coefficients.
	// Original code by Rainer Hegger (1998). Modified by Paul Bourke.
	// Ported to Javascript by Julien Loutre for timeseries-analysis, from Paul Bourke's C code.
	
	var i,j,k,maxi;
	var vswap 		= [];
	var mswap 		= [];
	var hvec 		= [];
	var max,h,pivot,q;
	
	for (i=0;i<n-1;i++) {
		max = Math.abs(mat[i][i]);
		maxi = i;
		for (j=i+1;j<n;j++) {
			if ((h = Math.abs(mat[j][i])) > max) {
				max = h;
				maxi = j;
			}
		}
		if (maxi != i) {
			mswap     = mat[i];
			mat[i]    = mat[maxi];
			mat[maxi] = mswap;
			vswap     = vec[i];
			vec[i]    = vec[maxi];
			vec[maxi] = vswap;
		}
	
		hvec = mat[i];
		pivot = hvec[i];
		if (Math.abs(pivot) == 0.0) {
			console.log("Singular matrix - fatal!");
			return false;
		}
		for (j=i+1;j<n;j++) {
			q = - mat[j][i] / pivot;
			mat[j][i] = 0.0;
			for (k=i+1;k<n;k++) {
				mat[j][k] += q * hvec[k];
			}
			vec[j] += (q * vec[i]);
		}
	}
	vec[n-1] /= mat[n-1][n-1];
	for (i=n-2;i>=0;i--) {
		hvec = mat[i];
		for (j=n-1;j>i;j--) {
			vec[i] -= (hvec[j] * vec[j]);
		}
		vec[i] /= hvec[i];
	}
	
	return vec;
}

// Regression analysis. Will most likely be re-written in the future.
timeseries.prototype.regression_analysis = function(options) {
	// Original code by Professor Hossein Arsham - http://home.ubalt.edu/ntsbarsh/Business-stat/otherapplets/Trend.htm
	// Re-written for timeseries-analysis.
	
	options = _.extend({
		threshold:	2.5
	}, options);
	
	var output 	= {};
	
	var i;
	var j;
	var E 		= this.data.length;  //total number of input spaces
	var N 		= 0;
	var N1 		= 0;
	var N2 		= 0;
	var SUM 	= 0.0;
	var R 		= 1;
	var Median	= 0;
	var theList = new Array();
	var cval 	= new Array();
	// Run through all the input, add those that have valid values
	var a		= 0;
	for(i=0;i < E;i++) 	{
		SUM 		+= this.data[i][1];
		theList[a] 	= this.data[i][1];
		cval[a] 	= this.data[i][1];
		N++;
		a++;
	}
	//check for insufficient data
	if(N <= 10) {
		console.log("Insufficient data (min 10)");
		return false;
	}
	//sort the list
	for(i=0; i<theList.length-1; i++) {
		for(j=i+1;j<theList.length; j++) {
			if (theList[j] < theList[i])  {
				temp 		= theList[i];
				theList[i] 	= theList[j];
				theList[j] 	= temp;
			}
		}
	}
	//calculate Median
	var aux = 0;
	if(N%2 == 1) {
		aux 	= Math.floor(N/2);
		Median 	= theList[aux];
	} else {
		Median 	= (theList[N/2]+theList[((N/2)-1)])/2;
	}
	
	// Do the math
	var x = Median;
	var y = Math.round(100000*x);
	var z = y/100000;
	// run through each value and compare it with mean
	for(i = 0; i < E; i++)     {
		//check if a value is present and discard the ties
		if(this.data[i][1] != x)  {
			//check if it is greater than mean then adds one
			if (this.data[i][1] > x)		 {
				N1++;
				a = i;
				while (a > 0)  {
					a--;
					if(this.data[a][1] != x) {
						break;
					}
				}
				if (this.data[a][1] < x) {
					R++;
				}
			}
			//if it is less than mean
			else if (this.data[i][1] < x)   {
				N2++;
				a = i;
				while (a > 0) {
					a--;
					if(this.data[a][1] != x)   {
						break;
					}
				}
				if (this.data[a][1] > x)  {
					R++;
				}
			}
		}
	}
	//form.NR.value = R;     //value of x or "Scores"
	// What is the runs' statistic? I don't know...
	// Is it http://en.wikipedia.org/wiki/Wald%E2%80%93Wolfowitz_runs_test ?
	output.runs	= R;
	

	//compute the expected mean and variance of R
	var EM 	= 1 + (2*N1*N2)/(N1+N2);           //Mean "Mu"
	var SD1 = [2*N1*N2*(2*N1*N2-N1-N2)];
	var SD2 = Math.pow( (N1 + N2), 2);
	var SD3 = N1 + N2 - 1;
	var SD4 = SD1 / (SD2 * SD3);           //Standard deviation "Sigma"
	var SD 	= Math.sqrt(SD4);
	//calculating P value MStyle
	var z1 	= (R - EM)/SD;
	var z2 	= Math.abs(z1);
	var z 	= z2;
	
	/* Thanks to Jan de Leeuw for the following function */
	var t 	= (z > 0) ? z : (-z);
	var P1 	= Math.pow((1+t*(0.049867347 + t*(0.0211410061 + t*(0.0032776263 + t*(0.0000380036 + t*(0.0000488906 + t*(0.000005383))))))), -16);
	var p 	= 1 - P1 / 2;
	var t 	= 1-((z > 0) ? p : 1-p);         //this is P-value
	
	//rounding the value
	var t1 	= Math.round(100000*t);
	var t2 	= t1/100000;                  //this is P-value too
	//form.PV.value = t2;

	//determine the conclusion
	// Encoding the trend value from 0 (no trend) to 3 (strong strend evidence)
	if (t2 < 0.01)   {
		//form.CON.value = "Strong evidence for trend";
		output.trend	= 3;
	} else if (t2 < 0.05 && t2 >= 0.01)  {
		//form.CON.value = "Moderate evidence for trend";
		output.trend	= 2;
	} else if (t2 < 0.10 && t2 >= 0.05)  {
		//form.CON.value = "Suggestive evidence for trend";
		output.trend	= 1;
	} else if (t2 >= 0.10)   {
		//form.CON.value = "Little or no real evidences for trend";
		output.trend	= 0;
	} else {
		//form.CON.value = "Strong evidence for trend";
		output.trend	= 3;
	}

	//AUTO CORRELATION
	var DWNN = 0;
	var DWND = (cval[0]*cval[0]);
	for (i=1; i<cval.length; i++)  {
		DWNN = DWNN +(cval[i]- cval[i-1])*(cval[i]-cval[i-1]) ;
		DWND = DWND +(cval[i]*cval[i]);
	}
	var DW = DWNN/DWND;
	DW = Math.round(DW*100000)/100000;
	//form.DW.value = DW;
	output.durbinWatson	= DW;
	
	var Q01 	= 2-4.6527/(Math.sqrt(N+2));
	var Q05 	= 2-3.2897/(Math.sqrt(N+2));
	
	//determine the conclusion
	// Encode the correlation between 1 and 3
	if((DW>=Q01) || (DW<=(4 - Q01)))  {
		//form.COND.value = "Moderate evidence againt autocorrelation";
		output.autocorrelation	= 2;
	} else if((DW >= Q05)&&(DW<=(4 - Q05))) {
		//form.COND.value = "Strong evidences against autocorrelation";
		output.autocorrelation	= 3;
	} else {
		//form.COND.value = "Suggestive evidences for autocorrelation";
		output.autocorrelation	= 1;
	}
	
	return output;
}

// Get the Durbin-Watson statistic
// http://en.wikipedia.org/wiki/Durbin%E2%80%93Watson_statistic
timeseries.prototype.durbinWatson = function() {
	return this.regression_analysis().durbinWatson;
}

// Get the Durbin-Watson statistic
// http://en.wikipedia.org/wiki/Durbin%E2%80%93Watson_statistic
timeseries.prototype.regression_analysis = function() {
	return this.regression_analysis().durbinWatson;
}




// Data adapters
var adapter = {
	
};
adapter.fromDB = function(data, options) {
	options = _.extend({
		value:		'close',
		date:		'date'
	}, options);
	
	return _.map(data, function(datapoint) {
		return [new Date(datapoint[options.date]).getTime(), datapoint[options.value]];
	});
};
adapter.fromArray = function(data) {
	return _.map(data, function(datapoint) {
		return [new Date(), datapoint];
	});
};
adapter.geometric = function(options) {
	options = _.extend({
	}, options);
	
	
	var i;
	var j;
	var output = [];
	for (i=0;i<128;i++) {
		output.push([
			new Date(),
			Math.cos(i*0.01)+0.75*Math.cos(i*0.03)+0.5*Math.cos(i*0.05)+0.25*Math.cos(i*0.11)
		]);
	}
	return output;
};
adapter.complex = function(options) {
	options = _.extend({
		cycles:		10,
		quality:	1,
		inertia:	0
	}, options);
	
	
	var i;
	var j;
	var output = [];
	for (i=0;i<options.cycles;i++) {
		for (j=0;j<360;j+=options.quality) {
			output.push([
				new Date(),
				(Math.sin(j*Math.PI/180)+Math.cos(j*3*Math.PI/180)-Math.sin(j*2.4*Math.PI/180))*100
			]);
			options.quality += options.inertia;
		}
	}
	return output;
};
adapter.sin = function(options) {
	options = _.extend({
		cycles:		4,
		quality:	2,
		inertia:	0	
	}, options);
	
	var i;
	var j;
	var output 	= [];
	for (i=0;i<options.cycles;i++) {
		for (j=0;j<360;j+=options.quality) {
			output.push([
				new Date(),
				Math.cos(j*Math.PI/180)*100
			]);
			options.quality += options.inertia;
		}
		console.log("options.quality",options.quality);
	}
	return output;
};
adapter.tan = function(options) {
	options = _.extend({
		cycles:		1
	}, options);
	var i;
	var j;
	var output = [];
	for (i=0;i<options.cycles;i++) {
		for (j=0;j<360;j++) {
			output.push([
				new Date(),
				Math.tan(j*Math.PI/180)
			]);
		}
	}
	return output;
};


exports.main		= timeseries;
exports.adapter		= adapter;
exports.version		= "1.0.11";