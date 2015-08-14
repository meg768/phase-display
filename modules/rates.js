var schedule = require('node-schedule');
var util     = require('util');
var request  = require('request');
var events   = require('events');


module.exports = function(config) {

	var self = this;

	function pluck(items) {
		var text = '';
		
		for (var index in items) {
			if (text != '')
				text += ', ';
				
			text += '"' + items[index] + '"';
		}		
		
		return text;
	}

	function fetch() {
		
		var rates = config.rates;
		var symbols = [];
		var names = {};
		
		for (var index in rates) {
			symbols.push(rates[index].symbol);
			names[rates[index].symbol] = rates[index].name;
		}		

		var url = '';
		
		url += 'https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.xchange%20where%20pair%20in%20(';
		url += encodeURIComponent(pluck(symbols));
		url += ')&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=';

		
		request(url, function (error, response, body) {
			try {
				if (error)
					throw error;

				if (response.statusCode == 200) {
					var json = JSON.parse(body);
					var items = json.query.results.rate;
					
					if (!util.isArray(items))
						items = [items];

					var data = [];
					
					items.forEach(function(item) {
						data.push({name:names[item.id], symbol:item.id, value:parseFloat(item.Rate)});
					});
					
					self.emit('rates', data);
				}
				else
					throw new Error('Invalid status code');
			}
			catch(error) {
				console.log(error);
					
			}
			
		});
	}
	
	function init() {
		var rule  = new schedule.RecurrenceRule();
	
		if (config.schedule.hour != undefined)
			rule.hour = config.schedule.hour;
		
		if (config.schedule.minute != undefined)
			rule.minute = config.schedule.minute;
		
		if (config.schedule.second != undefined)
			rule.second = config.schedule.second;
	
		schedule.scheduleJob(rule, function() {
			fetch();	
		});
		
	}
	
	init();
	
}


util.inherits(module.exports, events.EventEmitter);

