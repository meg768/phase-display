var schedule = require('node-schedule');


module.exports = {

	timezone : 'Europe/Stockholm',
	
	matrix: {
		text: {
			name: 'Arial',
			size: 16,
			color: 'yellow'
		}
	},
	
	rss: {
		enabled: true,
		
		feeds: [
			{name: 'SvD',    url: 'http://www.svd.se/?service=rss&type=senastenytt'}, 
			{name: 'SDS',    url: 'http://www.sydsvenskan.se/rss.xml'}, 
			{name: 'Di',     url: 'http://www.di.se/rss'}, 
			{name: 'Google', url: 'http://news.google.com/news?pz=1&cf=all&ned=sv_se&hl=sv&topic=h&num=3&output=rss'}
		],
		schedule: {
			hour   : [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21],
			minute : new schedule.Range(0, 59, 20)
		}
		
	},
	
	clock: {
		enabled: true,
		
		font: {
			color: 'blue'
		},
		
		schedule: {
			hour   : [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21],
			minute : new schedule.Range(0, 59, 1)
		}		
	},

	weather: {
		enabled: true,
		
		schedule: {
			hour   : [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21],
			minute : [5, 25, 45, 55]
		}
		
	},

	email: {
		enabled  : true,
		email    : 'phasedisplay@gmail.com',
		password : 'P0tatismos'
		
	},

	ping: {
		enabled  : true,
		
		schedule : {
			hour   : [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21],
			minute : [0, 15, 30, 45]
		},
		
		host     : 'phase-display.herokuapp.com',
		path     : '/'
	},
	
	rates: {
		enabled: true,
		
		schedule: {
			hour   : [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21],
			minute : [0, 10 , 20, 30, 40, 50],
		},
	
		rates : [
			{ name:'USD/SEK', symbol:'USDSEK' },
			{ name:'EUR/SEK', symbol:'EURSEK' }
		],
		
		font : {
			name  : 'Century-Gothic-Bold-Italic',
			size  : 26,
			color : 'white'
		}
		
	},

	quotes: {
		enabled : true,

		schedule: {
			hour   : [8, 10, 11, 12, 13, 14, 15, 16, 17],
			minute : new schedule.Range(0, 59, 1),
			second : [10, 30, 50]
		},
		
		quotes : [
			{ name:'Phase', symbol:'PHI.ST', logo : 'images/phiab-logo.png' }

		],
		
		font : {
			name: 'Century-Gothic-Bold-Italic',
			size: 26
		},
		
		colors:  {
			price   : 'white',
			plus    : 'rgb(0, 255, 0)',
			minus   : 'rgb(255, 0, 0)',
			volume  : 'rgb(0, 0, 255)'
		}
	},
};

