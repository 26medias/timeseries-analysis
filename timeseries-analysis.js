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
timeseries.prototype.output = function() {
	return this.data;
}
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
timeseries.prototype.chart = function(options) {
	
	options = _.extend({
		main:		false,
		width:		800,
		height:		200,
		bands:		[],
		lines:		[]
	}, options);
	
	// Google Chart
	var chart = new gimage.line({
		width:	options.width,
		height:	options.height,
		bands:	options.bands,
		hlines:	options.lines,
		autoscale:	true
	});
	chart.fromTimeseries(this.data);
	// Include the original data
	if (options.main) {
		chart.fromTimeseries(this.original);
	}
	
	// Include saved data
	_.each(this.saved, function(saved) {
		console.log("saved.data",saved.data);
		chart.fromTimeseries(saved.data);
	});
	
	return chart.render();
}
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
timeseries.prototype.offset = function(value) {
	var i;
	var j;
	var l 	= this.data.length;
	var sum	= 0;
	
	// Reset the buffer
	this.buffer 	= this.data.slice(0);
	
	for (i=0;i<l;i++) {
		this.buffer[i] = [
			this.buffer[i][0],
			this.buffer[i][1]+value
		];
	}
	this.data = this.buffer;
	return this;
}
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
timeseries.prototype.reset = function() {
	this.data = this.original;
	return this;
}



timeseries.prototype.toArray = function() {
	return _.map(this.data, function(datapoint) {
		return  datapoint[1];
	});
	
}
timeseries.prototype.min = function() {
	var array = this.toArray();
	return _.min(array);
}
timeseries.prototype.max = function() {
	var array = this.toArray();
	return _.max(array);
}
timeseries.prototype.mean = function() {
	var sum 	= 0;
	var n 		= 0;
	_.each(this.data, function(datapoint) {
		sum += datapoint[1];
		n++;
	});
	
	
	return sum/n;
}
timeseries.prototype.stdev = function() {
	var sum 	= 0;
	var n 		= 0;
	var mean 	= this.mean();
	_.each(this.data, function(datapoint) {
		sum += (datapoint[1]-mean)*(datapoint[1]-mean);
		n++;
	});
	return Math.sqrt(sum/n);
}
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


exports.main		= timeseries;
exports.adapter		= adapter;
exports.version		= "1.2.0";