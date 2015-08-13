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

	
	self.fetch = function() {
		
		var quotes = config.quotes;
		var symbols = [];
		var names = {};
		
		for (var index in quotes) {
			symbols.push(quotes[index].symbol);
			names[quotes[index].symbol] = quotes[index].name;
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
					var quotes = json.query.results.quote;
					
					if (!util.isArray(quotes))
						quotes = [quotes];
	
					for (var index in quotes) {
						var quote = quotes[index];
						self.emit('quote', {
							name   : names[quote.symbol], 
							symbol : quote.symbol, 
							price  : parseFloat(quote.LastTradePriceOnly), 
							change : parseFloat(quote.PercentChange), 
							volume : parseInt(quote.Volume)
						});
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


