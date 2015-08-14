var sprintf = require('./sprintf');
var io = null;


var Matrix = module.exports = {};




Matrix.Display = function() {
	
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

		msg = {};
		msg.type  = 'audio';
		msg.sound = sound;

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
	
				msg = {};
				msg.type  = 'text';
				msg.text  = text;
				msg.color = options.color;
				msg.font  = options.font;
				msg.size  = options.size;
				
				_messages.push(msg);
			}
		}
	}
	
	self.image = function(image, options) {

		if (options == undefined)
			options = {};
			
		var msg = {};
		
		msg.command   = 'python';
		msg.args      = ['run-image.py', '-f', image];
		msg.options   = {cwd: 'python'};

		if (options.hold != undefined) {
			msg.args.push('-h');
			msg.args.push(options.hold);		
		}
		
		msg = {};
		msg.type  = 'image';
		msg.image = image;
		msg.hold  = options.hold;
		
		_messages.push(msg);	
	}

	self.emoji = function(number, options) {
		self.image(sprintf('emoji/%d.png', number), options);
	}
	

	self.send = function(options) {

		if (options == undefined)
			options = {};
			
		if (_messages.length > 0) {
		
			if (typeof options.priority == 'string') {
				_messages.forEach(function(msg) {
					msg.priority = options.priority;
				});
			}
			
			Matrix.emit('message', _messages);
						
			_messages = [];
		}
		
				
	}
	
}



Matrix.init = function(server) {

	io = require('socket.io')(server);
	
	io.on('connection', function (socket) {
	
		var now = new Date();
		var display = new Matrix.Display();
		
		display.emoji(729, {hold:4});
		display.image('images/phiab-logo.png');
		display.text(sprintf("%02d:%02d", now.getHours(), now.getMinutes()));
		display.send();
	});
	
}


Matrix.emit = function(name, data) {
	console.log('Emitting', name, data);
	io.sockets.emit(name, data);
}

Matrix.play = function(sound, options) {

	var display = new Matrix.Display();
	display.play(sound, options);
	display.send();
}

Matrix.text = function(text, options) {

	var display = new Matrix.Display();
	display.text(text, options);
	display.send();
}


Matrix.image = function(image, options) {

	var display = new Matrix.Display();
	display.image(image, options);
	display.send();
}

Matrix.emoji = function() {

	var display = new Matrix.Display();
	display.image(arguments);
	display.send();
}
