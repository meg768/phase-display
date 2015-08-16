

function main() {

	var util   = require('util');
	var events = require('events');

	function Module() {
		
		var _this = this;
	
		var _queue = [];
		var _working = false;
	
		function work() {
			if (_queue.length > 0) {
				
				if (!_working) {
					var item = _queue[0];
	
					_working = true;
	
					_this.emit('process', item, function() {
						// Remove current job
						_queue.shift();					
						_working = false;
						
						// And continue with the next, when finished
						work();
						
						
					});
				} 
				
			}
			else {
				_working = false;	
				_this.emit('idle');
			}
		}
		
		_this.empty = function() {
			return _queue.length == 0;
		}
		
		_this.push = function(item) {
		
			if (_queue.length > 50)
				_queue = [];
				
			_queue.push(item);
					
			work();
			
		}
	};

	
	util.inherits(Module, events.EventEmitter);

	module.exports = Module;

}


main();