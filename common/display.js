var sprintf = require('./sprintf');
var io = null;


var Display = module.exports = {};



/*
Display.Batch = function() {

	var self = this;
	var messages = [];
	
	self.send = function() {
		
		if (messages.length > 0) {
			console.log('Sending!!', messages);
			io.sockets.emit('spawn', messages);
			
		}
		
		messages = [];
		
	}

	self.image = function(image, options) {
		
		var msg = {};
		
		msg.command   = 'python';
		msg.args      = ['run-image.py', '-i', image];
		msg.options   = {cwd: 'python'};
	
		if (typeof options == 'object') {
			if (typeof options.priority == 'string')
				msg.priority = options.priority;
			
		}
		
		messages.push(msg);	
	}
	

	self.text = function(text, options) {
	
		text = text.replace(/(\r\n|\n|\r)/gm, '\n');
		text = text.replace('\t',' ');
		
		var texts = text.split('\n');
		
		for (var i in texts) {
			var text = texts[i].trim();
			 
			if (text.length > 0) {
				var msg = {};
				
				msg.command   = 'python';
				msg.args      = ['run-text.py', '-t', text];
				msg.options   = {cwd: 'python'};
	
				if (typeof options == 'object') {
					if (typeof options.color == 'string') {
						msg.args.push('-c');
						msg.args.push(options.color);
					}
					
					if (typeof options.font == 'string') {
						msg.args.push('-f');
						msg.args.push(options.font);
					}
	
					if (typeof options.size == 'number' || typeof options.size == 'string') {
						msg.args.push('-s');
						msg.args.push(sprintf('%s', parseInt(options.size)));
					}
	
					if (typeof options.priority == 'string')
						msg.priority = options.priority;
				}
			
				messages.push(msg);
			}
		}
		
	}
		
	self.play = function(sound, options) {
		
		var msg = {};
		
		msg.command   = 'omxplayer';
		msg.args      = ['--no-keys', '--no-osd', 'audio/' + sound];
		msg.options   = {cwd: 'python'};

		if (typeof options == 'object') {
			if (typeof options.priority == 'string')
				msg.priority = options.priority;
		}
		messages.push(msg);
	}
	
	
}

*/

Display.Batch = function() {
	
	var self = this;
	
	var _default = {
		text: {
			font: 'Century-Gothic-Bold-Italic',
			size: 22,
			color: 'rgb(255,0,0)'
		},
		image: {
			
		}
		
	};
	
	var _messages = [];
	
	
	self.play = function(sound, options) {
		
		var msg = {};
		
		msg.command   = 'omxplayer';
		msg.args      = ['--no-keys', '--no-osd', 'audio/' + sound];
		msg.options   = {cwd: 'python'};


		_messages.push(msg);
	}	
	
	self.text = function(text, options) {
	
		if (options == undefined)
			options = {};
			
		if (options.size == undefined)
			options.size = _default.text.size;
			
		if (options.font == undefined)
			options.font = _default.text.font;

		if (options.color == undefined)
			options.color = _default.text.color;
			
		text = text.replace(/(\r\n|\n|\r)/gm, '\n');
		text = text.replace('\t',' ');
		
		var texts = text.split('\n');
		
		for (var i in texts) {
			var text = texts[i].trim();
			 
			if (text.length > 0) {
				var msg = {};
				
				msg.command   = 'python';
				msg.args      = ['run-text.py', '-t', text];
				msg.options   = {cwd: 'python'};

				msg.args.push('-c');
				msg.args.push(options.color);

				msg.args.push('-f');
				msg.args.push(options.font);

				msg.args.push('-s');
				msg.args.push(sprintf('%s', parseInt(options.size)));
	
				_messages.push(msg);
			}
		}
	}
	
	self.image = function(image, options) {
		
		var msg = {};
		
		msg.command   = 'python';
		msg.args      = ['run-image.py', '-i', image];
		msg.options   = {cwd: 'python'};
		
		_messages.push(msg);	
	}
	

	self.send = function(options) {

		if (options == undefined)
			options = {};
			
		if (_messages.length > 0) {
		
			if (typeof options.priority == 'string') {
				_messages.forEatch(function(msg) {
					msg.priority = options.priority;
				});
			}
			
			console.log('Sending', _messages);
			io.sockets.emit('spawn', _messages);
			
			_messages = [];
		}
		
				
	}
	
}



Display.init = function(server) {

	io = require('socket.io')(server);
	
	io.on('connection', function (socket) {
	
		var now = new Date();
		var display = new Display.Batch();
		
		display.image('images/phiab-logo.png');
		display.text(sprintf("%02d:%02d", now.getHours(), now.getMinutes()));
		display.send();
	});
	
}


Display.play = function(sound, options) {

	var batch = new Display.Batch();
	batch.play(sound, options);
	batch.send();
}

Display.text = function(text, options) {

	var batch = new Display.Batch();
	batch.text(text, options);
	batch.send();
}


Display.image = function(image, options) {

	var batch = new Display.Batch();
	batch.image(image, options);
	batch.send();
}
