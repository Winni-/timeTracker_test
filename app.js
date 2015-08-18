'use strict';

if (!Array.prototype.findIndex) {
  Array.prototype.findIndex = function(predicate) {
    if (this == null) {
      throw new TypeError('Array.prototype.findIndex called on null or undefined');
    }
    if (typeof predicate !== 'function') {
      throw new TypeError('predicate must be a function');
    }
    var list = Object(this);
    var length = list.length >>> 0;
    var thisArg = arguments[1];
    var value;

    for (var i = 0; i < length; i++) {
      value = list[i];
      if (predicate.call(thisArg, value, i, list)) {
        return i;
      }
    }
    return -1;
  };
};

angular.module('myApp', [])
.controller("trackerCtrl",["$scope", "$timeout",function($scope, $timeout) {
	this.tasks = [];	
	testT = this.tasks;
	var that = this;

	var Task = function(name, rate) {
		this.id = Math.random();
		this.name = name;
		this.rate = rate;
		this.startTime = new Date();
		this.time = 0;
		this.price = 0;
		this.running = false;
		this.lastStart = undefined;

		var that = this;

		this.startCount = function() {
			that.time++;
			that.price = that.rate/(60*60) * that.time;
			that.timeout = $timeout(that.startCount,1000);
			that.running = true;
			that.lastStart = new Date();
		};
		this.stopCount = function() {
			$timeout.cancel(that.timeout);
			that.running = false;
			this.lastStart = undefined;
		};
		

	};
	var fromJSON = function(json) {
		var data = json;
		var t = new Task(data.name, data.rate);
		t.id = data.id;
		t.startTime = data.startTime;
		t.time = data.time;
		t.price = data.price;
		t.running = data.running;
		t.lastStart = data.lastStart;

		return t;
	};

	this.addTask = function(name, rate) {
		var task = new Task(name, rate);
		this.tasks.push(task);

		$scope.name = $scope.rate = "";
	};
	$scope.startStop = function(task) {
		task.running ? task.stopCount() : task.startCount();
	};

	$scope.deleteTask = function(task) {
		var id = task.id;

		task.running? task.stopCount : "";

		var index = that.tasks.findIndex(function(element, index, array) {
			if (element.id == id) {
				return true
			};
			return false;
		});

		that.tasks.splice(index,1);
	};

	//Restore tasks
	if (localStorage["tasks"]) {
		var array = JSON.parse(localStorage["tasks"]);	
		array.map(function(json) {
			that.tasks.push(fromJSON(json));
			var last = that.tasks[that.tasks.length-1];
			if (last.running && last.lastStart) {
				var now = Math.floor( new Date().getTime() / 1000 );
				last.time += Math.floor( now - new Date(last.lastStart).getTime() /1000 );
				last.startCount();
			};
		});
	};

	//manual safe
	$scope.save = function() {//unused
		localStorage["tasks"] = JSON.stringify(that.tasks);
	};

	//save on exit
	window.onbeforeunload = function (e) {
		localStorage["tasks"] = JSON.stringify(that.tasks);		
	};

}])
.filter('secondsToDateTime', function() {
    return function(seconds) {
        var d = new Date(0,0,0,0,0,0,0);
        d.setSeconds(seconds);
        return d;
    };
});

$.material.init();