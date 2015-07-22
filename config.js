

module.exports = {

	'timezone' : 'Europe/Stockholm',
	
	'server'   : 'akuru.herokuapp.com',
	
	'stocks'   : [
		/*
		{ 'name':'AT&T', 'symbol':'T' },
		{ 'name':'Ares Capital', 'symbol':'ARCC' },
		{ 'name':'Castellum', 'symbol':'CAST.ST' },
		{ 'name':'H&M', 'symbol':'HM-B.ST' },
		{ 'name':'NCC', 'symbol':'NCC-B.ST' },
		{ 'name':'Industrivärlden', 'symbol':'INDU-C.ST' },
		{ 'name':'Pfizer', 'symbol':'PFE' },
		{ 'name':'SHB', 'symbol':'SHB-B.ST' },
		*/
		{ 'name':'PHI',  'symbol':'PHI.ST' }
	],
	
	'rates' : [
		{ 'name':'USD/SEK', 'symbol':'USDSEK' },
		{ 'name':'EUR/SEK', 'symbol':'EURSEK' }
	],

	

	
	'rss': [
		{'name': 'SvD', 'url': 'http://www.svd.se/?service=rss&type=senastenytt'},
		{'name': 'SDS', 'url': 'http://www.sydsvenskan.se/rss.xml'},
		{'name': 'Di', 'url': 'http://www.di.se/rss'},
		{'name': 'Google', 'url': 'http://news.google.com/news?pz=1&cf=all&ned=sv_se&hl=sv&topic=h&num=3&output=rss'}
		
	]
};

