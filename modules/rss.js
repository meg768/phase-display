var feedsub  = require('feedsub');
var schedule = require('node-schedule');
var util     = require('util');
var events   = require('events');


var RSS = module.exports = function(config) {

	var self = this;
	
	var _news = {};
	var _readers = {};
	var _maxNews = 3;
	
	function subscribe(name, url) {
		
		var reader = new feedsub(url, {interval: 0, lastDate: new Date()});
		var lastDate = null;
		
		_readers[name] = reader;
		_news[name] = [];

		reader.on('item', function(item) {
			
			if (item.title && item.category && item.pubdate) {
				var thisDate = new Date(item.pubdate);
				
				if (lastDate == null || thisDate.valueOf() > lastDate.valueOf()) {
					console.log("RSS:", name, item.title, thisDate, lastDate);
					lastDate = thisDate;
					
					var news = _news[name];
					
					news.push({
						name: name,
						category: item.category, 
						text: item.title,
						date: thisDate
					});
					
					news.sort(function(a, b) {
						return a.date.valueOf() - b.date.valueOf();
					});
				
					news.splice(0, news.length - _maxNews);		
				}

			}
		
		});
		
	}
	


	function read() {
		for (var name in _readers) {
			_readers[name].read();
		}
	}

	function schedulePolling() {
		var rule = new schedule.RecurrenceRule();		
		rule.minute = new schedule.Range(0, 59, 10);
	
		read();
		
		schedule.scheduleJob(rule, function() {
			read();
		});
		
	}
	
	function scheduleEmitting() {
		var rule = new schedule.RecurrenceRule();		
		
		if (config.schedule.hour != undefined)
			rule.hour = config.schedule.hour;

		if (config.schedule.minute != undefined)
			rule.minute = config.schedule.minute;
		
		schedule.scheduleJob(rule, function() {
		
			var news = [];
			var now = new Date();
			
			// Don't display too old articles
			var limit = new Date(now.getTime() - 8 * 60 * 60 * 1000);

			for (var name in _news)
				news.push.apply(news, _news[name])
			
			if (news.length > 0) {
				console.log("Bringing on the news...");
				
				for (var i = 0; i < news.length; i++) {
					if (news[i].date >= limit)
						self.emit('feed', news[i]);
				}
			}
		});
	}
	
	function init() {
		for (var i in config.feeds) {
			var feed = config.feeds[i];
			
			subscribe(feed.name, feed.url);
		}
		
		schedulePolling();
		scheduleEmitting();
	}
	
	init();
	
	
}


	
util.inherits(module.exports, events.EventEmitter);


