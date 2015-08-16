var sprintf = require('./sprintf.js');
var config = require('../config.js');
var extend = require('extend');

var io = null;


var Matrix = module.exports = {};




Matrix.Display = function() {
	
	var self = this;
	
	
	var _messages = [];
	
	
	
	self.play = function(sound, options) {
		
		var msg = {};
		
		msg.type  = 'audio';
		msg.sound = sound;

		_messages.push(msg);
	}	
	
	self.text = function(text, options) {
	
		if (options == undefined)
			options = {};

		text = text.replace(/(\r\n|\n|\r)/gm, '\n');
		text = text.replace('\t',' ');
		
		var texts = text.split('\n');
		
		for (var i in texts) {
			var text = texts[i].trim();
			 
			if (text.length > 0) {
				var msg = {};
				extend(msg, config.matrix.text, options, {type:'text', text:text});
				
				_messages.push(msg);
			}
		}
	}
	
	self.image = function(image, options) {

		if (options == undefined)
			options = {};
			
		var msg = {};
		extend(msg, config.matrix.image, options, {type:'image', image:image});

		_messages.push(msg);	
	}

	self.emoji = function(id, options) {
		if (options == undefined)
			options = {};
			
		var msg = {};
		extend(msg, config.matrix.emoji, options, {type:'emoji', id:id});

		_messages.push(msg);	
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

Matrix.emoji = function(id, options) {

	var display = new Matrix.Display();
	display.emoji(id, options);
	display.send();
}
