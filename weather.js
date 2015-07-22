var request  = require('request');
var util     = require('util');
var moment   = require('moment');
var schedule = require('node-schedule');
var events   = require('events');

var sprintf  = require('./sprintf');
var config   = require('./config');
var random   = require('./random');


module.exports = function() {
	
	var self = this;
	var url  = 'https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20weather.forecast%20where%20woeid%20in%20(select%20woeid%20from%20geo.places(1)%20where%20text%3D%22Lund%2C%20Sweden%22)&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys';

	function convertFarenheightToCelcius(farenheight) {
		return Math.round((farenheight - 32) / 1.8);
	}
	
	function getConditionFromCode(code) {
	
		var table = {
			0:'tornado',
			1:'tropisk storm',
			2:'hurricane',
			3:'severe thunderstorms',
			4:'thunderstorms',
			5:'snöblandat regn',
			6:'mixed rain and sleet',
			7:'mixed snow and sleet',
			8:'freezing drizzle',
			9:'drizzle',
			10:'freezing rain',
			11:'regnigt',
			12:'regnigt',
			13:'snow flurries',
			14:'lätt snöfall',
			15:'snöyra',
			16:'snö',
			17:'hagel',
			18:'sleet',
			19:'dust',
			20:'dimmigt',
			21:'haze',
			22:'rökigt(!)',
			23:'blustery',
			24:'blåsigt',
			25:'kallt',
			26:'molnigt',
			27:'mestadels moln',
			28:'mestadels moln',
			29:'delvis molnigt',
			30:'delvis molnigt',
			31:'klart',
			32:'soligt',
			33:'uppehåll',
			34:'uppehåll',
			35:'regn och hagel',
			36:'varmt',
			37:'isolated thunderstorms',
			38:'scattered thunderstorms',
			39:'scattered thunderstorms',
			40:'delvis regn',
			41:'mycket snöigt',
			42:'scattered snow showers',
			43:'mycket snö',
			44:'delvis molnigt',
			45:'regnigt',
			46:'snöigt',
			47:'delvis regn',
			3200:'not available'
		};
	
		code = parseInt(code);
	
		return table[code] != undefined ? table[code] : sprintf('väderkod %s', code);
	}
	
	self.fetch = function() {
		request(url, function (error, response, body) {
			try {
				if (error)
					throw error;
					
				if (response.statusCode == 200) {
					var json = JSON.parse(body);
					var results = json.query.results.channel;
					var forecast = results.item.forecast;
					
					var items = [];
	
					for (var index in forecast) {
						var item = {};
						var weekdays = ['Söndag', 'Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag']; 
	
						item.high      = convertFarenheightToCelcius(forecast[index].high);
						item.low       = convertFarenheightToCelcius(forecast[index].low);
						item.date      = new Date(moment(forecast[index].date, 'DD MMM YYYY').valueOf());
						item.day       = weekdays[item.date.getDay()];
						item.condition = getConditionFromCode(forecast[index].code);
						item.code      = forecast[index].code;
						
						items.push(item);
					} 
	
					items[0].day = 'Idag';
					items[1].day = 'I morgon';
					
					for (var index in items) {
						self.emit('forecast', items[index]);
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
	

	self.schedule = function() {
		var rule = new schedule.RecurrenceRule();		
		
		rule.minute = new schedule.Range(3, 59, 13);
		rule.hour   = new schedule.Range(7, 23);
	
		var job = schedule.scheduleJob(rule, function() {
			self.fetch();
		});
		
	}



}

util.inherits(module.exports, events.EventEmitter);



