var schedule = require('node-schedule');
var util     = require('util');
var request  = require('request');
var events   = require('events');
var extend   = require('extend');

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

	
	self.fetch = function() {
		
		var quotes = config.quotes;
		var symbols = [];
		var info = {};
		
		for (var index in quotes) {
			var quote = quotes[index];
			
			symbols.push(quote.symbol);
			info[quote.symbol] = quote;
		}		
	
		var url = '';
	
		url += 'https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.quotes%20where%20symbol%20IN%20(';
		url += encodeURIComponent(pluck(symbols));
		url += ')&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=';
		
		request(url, function (error, response, body) {
			try {
				if (error)
					throw error;
					
				if (response.statusCode == 200) {
					var json = JSON.parse(body);
					var results = json.query.results.quote;
					
					if (!util.isArray(results))
						results = [results];
	
					for (var index in results) {
						var result = results[index];
						
						var data  = {
							//name   : names[result.symbol], 
							//symbol : result.symbol, 
							price  : parseFloat(result.LastTradePriceOnly), 
							change : parseFloat(result.PercentChange), 
							volume : parseInt(result.Volume)
							
						};
						
						console.log('extending...', data);
						data = extend(data, info[result.symbol]);
						console.log('extending result:', data);
						

						self.emit('quote', data);
					}
				}
				else
					throw new Error('Invalid status code');
			}
			catch(error) {
				console.log(error);
					
			}
			
		});
	}
	

	
}


	
util.inherits(module.exports, events.EventEmitter);


