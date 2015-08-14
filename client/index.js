var schedule = require('node-schedule');
var util = require('util');
var sprintf = require('./sprintf.js');
var random = require('./random.js');


// { "command": "python", "options": {"cwd":"python"}, "args": ["run-text.py", "-t", "HEJ", "-c", "blue"]}

function main() {

	// Set the time zone according to config settings
	process.env.TZ = 'Europe/Stockholm';
	
	function spawnCommand(command, args, options, callback) {

		try {
			if (callback == undefined) {
				callback = function() {
				};
			}

			function NO(error) {
				console.log("Failed to spawn...", error == undefined ? '' : error);
				callback();				
			}

			function YES() {
				callback();				
			}

			console.log('Spawning: %s', command, args, options);					

			var spawn = require('child_process').spawn;
			var process = spawn(command, args, options);

			process.stderr.on('data', function (data) {
				console.log('stderr: ' + data);
			});

			process.stdout.on('data', function (data) {
				console.log('stdout: ' + data);
			});
			
			if (process == null) {
				NO();
			}
			else {
				process.on('error', function() {
					NO();
				});
	
				process.on('close', function() {
					YES();
				});		
			}
		}
		catch (error) {
			NO(error);
		}
		
	}
	


	function enableQueue() {
		var Queue = require('./runqueue.js');
	
		// Create the 'global' queue
		queue = new Queue();
	
		queue.on('idle', function() {
			console.log('Idle...');
		});
		
		queue.on('process', function(item, callback) {
			spawnCommand(item.command, item.args, item.options, callback);
		});
	
	}	
	
	function enableSocketIO() {
	
		var serverURL  = 'http://phi-display.herokuapp.com';
		var serverName = 'Heroku';
		
		var socket = require('socket.io-client')(serverURL);

		socket.on('connect', function() {
			console.log("SocketIO connected...");
		});

		socket.on('disconnect', function() {
			console.log("SocketIO disconnected...");
		});		

		function spawn(cmd) {
			console.log("Got 'spawn' command from Heroku...", cmd);

			var idle = queue.empty();
			
			function addToQueue(cmd) {
				if (typeof cmd.priority == 'string' && cmd.priority == 'low') {
					if (idle)	
						queue.push(cmd);
				}
				else 
					queue.push(cmd);				
			}
			
			if (util.isArray(cmd)) {
				for (var i = 0; i < cmd.length; i++)
					addToQueue(cmd[i]);
			}
			else
				addToQueue(cmd);
		}

		socket.on('connect', function() {
			console.log("SocketIO connected...");
		});

		socket.on('disconnect', function() {
			console.log("SocketIO disconnected...");
		});		

		socket.on("spawn", function(cmd) {
			spawn(cmd);
		});

		socket.on("message", function(messages) {

			if (!util.isArray(messages))
				messages = [messages];
			
			console.log('Got message', messages);
			var queue = [];
			
			messages.forEach(function(msg) {

				if (msg.type == 'text') {
					var command = 'python';
					var args    = ['run-text.py'];
					var options = {cwd: 'python'};
			
	
					if (typeof msg.text == 'string') {
						args.push('-t');
						args.push(msg.text);
					}
	
					if (typeof msg.color == 'string') {
	
						if (msg.color == 'random') {
							msg.color = sprintf('hsl(%d,%d%%,%d%%)', random.rand(0, 360), 100, 50);
						}		
	
						args.push('-c');
						args.push(msg.color);			
					}
	
					if (typeof msg.font == 'string') {
						args.push('-f');
						args.push(msg.font);			
					}
	
					if (msg.size != undefined) {
						args.push('-s');
						args.push(msg.size);			
					}
					
					queue.push({command:command, args:args, options:options, priority:msg.priority});
									
				}

				if (msg.type == 'image') {
					var command = 'python';
					var args    = ['run-image.py'];
					var options = {cwd: 'python'};
			
	
					if (msg.image != undefined) {
						args.push('-f');
						args.push(msg.image);
					}
					
					if (msg.hold != undefined) {
						args.push('-h');
						args.push(msg.hold);
					}
					
					queue.push({command:command, args:args, options:options, priority:msg.priority});
									
				}

				if (msg.type == 'emoji') {
					var command = 'python';
					var args    = ['run-image.py'];
					var options = {cwd: 'python'};
			
	
					if (msg.id != undefined) {
						args.push('-f');
						args.push('emoji/' + parseInt(msg.id) + '.png');
					}
					
					if (msg.hold != undefined) {
						args.push('-h');
						args.push(msg.hold);
					}
					
					queue.push({command:command, args:args, options:options, priority:msg.priority});
									
				}


				if (msg.type == 'audio') {
					var command   = 'omxplayer';
					var args      = [];
					var options   = {cwd: 'python'};
			
					if (typeof msg.sound == 'string') {
						args.push('--no-keys');
						args.push('--no-osd');
						args.push('audio/' + msg.sound);
					}
					
					if (args.length > 0)
						queue.push({command:command, args:args, options:options, priority:msg.priority});
				}

				
			});
			
			if (queue.length > 0)
				spawn(queue);
				

		});
		
	}
	
	  
	enableQueue();
	enableSocketIO();
	 	
}

main();
