const config = require('../config/config.json');
const logger = require('./logger.js');
const fs = require('fs');
const path = require('path');
const util = require('util');
const readDir = util.promisify(fs.readdir);
const stat = util.promisify(fs.stat);

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
			const fileObjects = [];

			files.forEach((file) => {
				if ('.' === file.charAt(0)) {
					return;
				}

				const fullPath = ('/' === dirPath ? `/${file}` : `${dirPath}/${file}`);
				const extension = this.getExtension(file);

				fileObjects.push({
					name: file,
					fullPath: fullPath,
					isDir: fs.lstatSync(fullPath).isDirectory(),
					isPlayable: (config.playableExtensions.indexOf(extension) > -1),
				});
			});

			return fileObjects;
		}).then((files) => {
			const modifiedTimePromises = [];

			files.forEach((file) => {
				modifiedTimePromises.push(stat(file.fullPath).then((stats) => {
					file.modifiedDate = stats.mtime;
				}));
			});

			return Promise.all(modifiedTimePromises).then(() => {
				return files;
			});
		});
	},
};
