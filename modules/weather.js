var request  = require('request');
var util     = require('util');
var moment   = require('moment');
var schedule = require('node-schedule');
var events   = require('events');
var sprintf  = require('../common/sprintf');


module.exports = function(config) {
	
	var self = this;
	var url  = 'https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20weather.forecast%20where%20woeid%20in%20(select%20woeid%20from%20geo.places(1)%20where%20text%3D%22Lund%2C%20Sweden%22)&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys';

	function convertFarenheightToCelcius(farenheight) {
		return Math.round((farenheight - 32) / 1.8);
	}
	
	function getConditionFromCode(code) {
	
		var table = {
			0:'Tornado',
			1:'Tropisk storm',
			2:'Orkan',
			3:'Kraftigt åskväder',
			4:'Åska',
			5:'Snöblandat regn',
			6:'Blandat regn och snöblandat regn',
			7:'Blandad snö och slask',
			8:'Fryst duggregs',
			9:'Duggregn',
			10:'Kallt regn',
			11:'Regnigt',
			12:'Regnigt',
			13:'Snöbyar',
			14:'Lätt snöfall',
			15:'Snöyra',
			16:'Snö',
			17:'Hagel',
			18:'Slask',
			19:'Dammigt (?)',
			20:'Dimmigt',
			21:'Disigt',
			22:'Rökigt(!)',
			23:'Stormigt',
			24:'Blåsigt',
			25:'Kallt',
			26:'Molnigt',
			27:'Mestadels moln',
			28:'Mestadels moln',
			29:'Delvis molnigt',
			30:'Delvis molnigt',
			31:'Klart',
			32:'Soligt',
			33:'Uppehåll',
			34:'Uppehåll',
			35:'Regn och hagel',
			36:'Varmt',
			37:'Enstaka åskväder',
			38:'Åska',
			39:'Åska',
			40:'Delvis regn',
			41:'Mycket snöigt',
			42:'Spridda snöbyar',
			43:'Mycket snö',
			44:'Delvis molnigt',
			45:'Regnigt',
			46:'Snöigt',
			47:'Delvis regn',
			3200:'Not available'
		};
	
		code = parseInt(code);
	
		return table[code] != undefined ? table[code] : sprintf('Väderkod %s', code);
	}
	
	self.fetch = function() {
	
		console.log('Fetching weather...');
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
	

	function init() {
		if (typeof config.schedule == 'object') {
			var rule = new schedule.RecurrenceRule();		
			
			if (config.schedule.minute != undefined)
				rule.minute = config.schedule.minute;
	
			if (config.schedule.hour != undefined)
				rule.hour = config.schedule.hour;
		
			var job = schedule.scheduleJob(rule, function() {
				self.fetch();
			});
			
		}
		
	}

	init();	
}


util.inherits(module.exports, events.EventEmitter);



