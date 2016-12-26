const Promise = require('bluebird');

module.exports = {
	'get': () => {
		return new Promise((accept, reject) => {
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
		});
	},

	'set': (files) => {
		return new Promise((accept, reject) => {
			return accept({
			});
		});
	},

	'playAt': (position) => {
		return new Promise((accept, reject) => {
			return accept({
			});
		});
	},

	'previous': () => {
		return new Promise((accept, reject) => {
			return accept({
			});
		});
	},

	'next': () => {
		return new Promise((accept, reject) => {
			return accept({
			});
		});
	},
};