

// Function to generate an array of integers between a range...	
function range(start, stop, step) {
	
	var values = [];
	
	if (step == undefined)
		step = 1;
		
	for (var i = start; i <= stop; i += step)
		values.push(i);
		
	return values;
	
}


module.exports = {

	timezone : 'Europe/Stockholm',

	
	// Defaults for the display
	matrix: {
		text: {
			// The default font used when not specified
			font  : 'Century Gothic Bold Italic',
			
			// ... and size
			size  : 24,
			
			// .. and color ('random' may also be used)
			color : 'blue',
			
			// Default delay when scrolling
			delay : 18
		},
		image: {
			// Default scroll speed
			delay : 18
		},
		emoji: {
			// Default scroll speed
			delay : 18
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
			// Display from 8-21
			hour : range(8, 21),

			// Display RSS news every 20 minutes
			minute : range(0, 59, 20)
		}
		
	},
	
	clock: {
		enabled: false,
		
		schedule: {
			hour   : range(8, 22),
			minute : range(0, 59, 1),
			second : range(0, 59, 10)
		}		
	},

	weather: {
		enabled: true,
		
		schedule: {
			hour   : range(8, 21),
			minute : range(5, 59, 5)
		}
		
	},

	email: {
		enabled  : true,
		email    : 'phasedisplay@gmail.com',
		password : 'P0tatismos',
		
		font: {
			color: 'red'
		}
	},

	ping: {
		enabled  : true,
		
		schedule : {
			hour   : range(8, 21),
			minute : range(0, 59, 15)
		},
		
		host     : 'phase-display.herokuapp.com',
		path     : '/'
	},
	
	rates: {
		enabled: true,
		
		schedule: {
			hour   : range(8, 21),
			minute : range(0, 59, 10),
		},
	
		rates : [
			{ name:'USD/SEK', symbol:'USDSEK' },
			{ name:'EUR/SEK', symbol:'EURSEK' }
		],
		
		font : {
			color: 'rgb(0,255,0)'
		}
		
	},

	quotes: {
		enabled : true,

		schedule: {
			hour   : range(9, 21),
			minute : range(0, 59),
			second : range(10, 59, 20)
		},
		
		quotes : [
			{ name:'Phase', symbol:'PHI.ST'}

		],
		
		font : {
			size: 26
		},
		
		colors:  {
			clock   : 'blue',
			price   : 'white',
			plus    : 'rgb(0, 255, 0)',
			minus   : 'rgb(255, 0, 0)',
			volume  : 'rgb(0, 0, 255)'
		}
	},
};

