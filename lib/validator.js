const Promise = require('bluebird'),
	_ = require('lodash'),
	fs = require('fs');

module.exports = {
	random: function(body) {
		return new Promise((accept, reject) => {
			const showNames = (Array.isArray(body.showNames) ? body.showNames : []),
				amount = Number(body.amount),
				method = body.method;
			let errors = [];

			if (isNaN(amount)) {
				errors.push('Amount is not a number');
			}

			if ('enqueue' !== method && 'play' !== method) {
				errors.push('Invalid method');
			}

			if (0 !== errors.length) {
				return reject(errors);
			}

			return accept({
				showNames: showNames,
				amount: amount,
			});
		});
	},

	browse: function(body) {
		return new Promise((accept, reject) => {
			const dir = body.dir;
			let errors = [];

			if (!fs.lstatSync(dir).isDirectory()) {
				errors.push('Supplied dir is not a directory');
			}

			if (0 !== errors.length) {
				return reject(errors);
			}

			return accept({
				dir: dir,
			});
		});
	},

	setPlaylist: function(body) {
		return new Promise((accept, reject) => {
			const filePaths = body.filePaths;
			let errors = [];

			if (!Array.isArray(filePaths) || 0 === filePaths.length) {
				errors.push('Empty filePaths');
			} else {
				_.forEach(filePaths, (filePath) => {
					if (!fs.existsSync(filePath)) {
						errors.push('Invalid file path supplied');
					}
				});
			}

			if (0 !== errors.length) {
				return reject(errors);
			}

			return accept({
				filePaths: filePaths,
			});
		});
	},

	setAtPlaylist: function(body) {
		return new Promise((accept, reject) => {
			const filePaths = body.filePaths,
				atIndex = Number(body.atIndex);
			let errors = [];

			if (isNaN(atIndex)) {
				errors.push('At index is not a number');
			} else if (atIndex < 0) {
				errors.push('At index must be non-negative');
			}

			if (!Array.isArray(filePaths) || 0 === filePaths.length) {
				errors.push('Empty filePaths');
			} else {
				_.forEach(filePaths, (filePath) => {
					if (!fs.existsSync(filePath)) {
						errors.push('Invalid file path supplied');
					}
				});
			}

			if (0 !== errors.length) {
				return reject(errors);
			}

			return accept({
				filePaths: filePaths,
				atIndex: atIndex,
			});
		});
	},

	playAt: function(body) {
		return new Promise((accept, reject) => {
			const index = Number(body.index);
			let errors = [];

			if (isNaN(index)) {
				errors.push('Index is not a number');
			} else if (index < 0) {
				errors.push('Index must be positive');
			}

			if (0 !== errors.length) {
				return reject(errors);
			}

			return accept({
				index: index,
			});
		});
	},
};