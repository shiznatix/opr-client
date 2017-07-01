const config = require(`${__dirname}/../config/config.json`),
	logger = require(`${__dirname}/logger.js`),
	_ = require('lodash'),
	Promise = require('bluebird'),
	fs = require('fs'),
	path = require('path'),
	readDir = Promise.promisify(fs.readdir),
	stat = Promise.promisify(fs.stat);

module.exports = {
	getExtension: function(file) {
		let extension = path.extname(file);

		while ('.' === extension.charAt(0)) {
			extension = extension.substr(1);
		}

		return extension;
	},

	getFiles: function(dirPath) {
		return readDir(dirPath).then((files) => {
			let fileObjects = [];

			_.forEach(files, (file) => {
				if ('.' === file.charAt(0)) {
					return;
				}

				const fullPath = ('/' === dirPath ? `/${file}` : `${dirPath}/${file}`),
					extension = this.getExtension(file);

				fileObjects.push({
					name: file,
					fullPath: fullPath,
					isDir: fs.lstatSync(fullPath).isDirectory(),
					isPlayable: (config.playableExtensions.indexOf(extension) > -1),
				});
			});

			return fileObjects;
		})/*.then((files) => {
			let modifiedTimePromises = [];

			_.forEach(files, (file) => {
				modifiedTimePromises.push(stat(file.fullPath).then((stats) => {
					file.modifiedDate = stats.mtime;
				}));
			});

			return Promise.all(modifiedTimePromises).then(() => {
				return files;
			});
		})*/.then((files) => {
			files.sort(function(a, b) {
				const aName = a.name.toLowerCase(),
					bName = b.name.toLowerCase();

				if (aName < bName) {
					return -1;
				}
				if (aName > bName) {
					return 1;
				}

				return 0;
			});

			return files;
		}).then((files) => {
			files.sort(function(a,b) {
				return new Date(b.modifiedDate) - new Date(a.modifiedDate);
			});

			return files;
		});
	},
};
