var schedule = require('node-schedule');
var util     = require('util');
var request  = require('request');
var events   = require('events');
var random   = require('../common/random');


var config = {

	'rates' : [
		{ 'name':'USD/SEK', 'symbol':'USDSEK' },
		{ 'name':'EUR/SEK', 'symbol':'EURSEK' }
	],
	
	
	'quotes'   : [
/*		{ 'name':'AT&T', 'symbol':'T' },
		{ 'name':'Ares Capital', 'symbol':'ARCC' },
		{ 'name':'Castellum', 'symbol':'CAST.ST' },
		{ 'name':'H&M', 'symbol':'HM-B.ST' },
		{ 'name':'NCC', 'symbol':'NCC-B.ST' },
		{ 'name':'Industrivärlden', 'symbol':'INDU-C.ST' },
		{ 'name':'Pfizer', 'symbol':'PFE' },
		{ 'name':'SHB', 'symbol':'SHB-B.ST' },
		*/
		{ 'name':'PHI',  'symbol':'PHI.ST' }
	]
};


module.exports = function() {

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

	function fetchRates() {
		
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
	
					for (var index in items) {
						var item = items[index];

						self.emit('rate', names[item.id], item.id, parseFloat(item.Rate));
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
	
	
	function fetchQuotes() {
		
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
						self.emit('quote', names[quote.symbol], quote.symbol, parseFloat(quote.LastTradePriceOnly), parseFloat(quote.PercentChange), parseInt(quote.Volume));
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
	

	function scheduleQuotes() {
		var rule = new schedule.RecurrenceRule();		
		
		rule.minute = new schedule.Range(0, 59, 2);
		//rule.hour   = new schedule.Range(7, 23);
	
		var job = schedule.scheduleJob(rule, function() {
			fetchQuotes();
		});
		
	}
	
	function scheduleRates() {
		var rule = new schedule.RecurrenceRule();		
		
		rule.minute = new schedule.Range(0, 59, 13);
		//rule.hour   = new schedule.Range(7, 23);
	
		var job = schedule.scheduleJob(rule, function() {
			fetchRates();
		});
		
	}
	
	scheduleQuotes();
	scheduleRates();

	
}


	
util.inherits(module.exports, events.EventEmitter);


