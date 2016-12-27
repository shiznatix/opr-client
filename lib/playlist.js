const Promise = require('bluebird');

module.exports = {
	get: function() {
		return new Promise((accept, reject) => {
			setTimeout(function() {
				return accept([
					{
						'fileName': 'Show 1',
						'path': '/the/full/path/Show 1.avi',
						'position': 1,
					},
					{
						'fileName': 'Show22',
						'path': '/the/full/path/Show22.avi',
						'position': 2,
					},
				]);
			}, 1000);
		});
	},

	set: function(files) {
		return new Promise((accept, reject) => {
			return accept({
			});
		});
	},

	playAt: function(position) {
		return new Promise((accept, reject) => {
			return accept({
			});
		});
	},

	previous: function() {
		return new Promise((accept, reject) => {
			return accept({
			});
		});
	},

	next: function() {
		return new Promise((accept, reject) => {
			return accept({
			});
		});
	},
};