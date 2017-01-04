const Promise = require('bluebird'),
	fs = require('fs'),
	_ = require('lodash'),
	path = require('path'),
	playlistLocation = `${__dirname}/../playlist.txt`;

class Playlist {
	constructor(player) {
		this.player = player;
		this.playlist = [];
		this.currentIndex = 0;
	}

	getPlaylistFilePaths() {
		return new Promise((accept, reject) => {
			if (!fs.existsSync(playlistLocation)) {
				return accept([]);
			}

			fs.readFile(playlistLocation, 'utf8', function (error, data) {
				if (error) {
					return reject(error);
				}

				const playlistPaths = data.split('\n');
				let playlist = [];

				_.forEach(playlistPaths, function(filePath, key) {
					if ('' === filePath.trim()) {
						return;
					}

					playlist.push(filePath);
				});

				return accept(playlist);
			});
		});
	}

	setPlaylistFromFile() {
		const self = this;

		return this.getPlaylistFilePaths().then((playlistPaths) => {
			self.playlist = [];

			_.forEach(playlistPaths, function(filePath, key) {
				if ('' === filePath.trim()) {
					return;
				}

				self.playlist.push({
					fileName: path.basename(filePath),
					filePath: filePath,
				});
			});
		});
	}

	get() {
		const self = this;

		return new Promise((accept) => {
			return accept(self.playlist);
		});
	}

	set(filePaths) {
		const self = this;

		return new Promise((accept, reject) => {
			fs.writeFile(playlistLocation, filePaths.join('\n'), function(error) {
				if (error) {
					return reject(error);
				}

				return accept(self.setPlaylistFromFile());
			});
		});
	}

	enqueue(filePaths) {
		const self = this;

		return self.getPlaylistFilePaths().then((playlistFilePaths) => {
			_.forEach(filePaths, function(filePath) {
				playlistFilePaths.push(filePath);
			});

			return self.set(playlistFilePaths);
		});
	}

	setAt(filePaths, atIndex) {
		const self = this,
			indexExists = (typeof self.playlist[atIndex] !== 'undefined');

		if (!indexExists) {
			return self.enqueue(filePaths);
		}

		return self.getPlaylistFilePaths().then((playlist) => {
			let newPlaylist = [];

			_.forEach(playlist, (playlistFilePath, index) => {
				if (index === atIndex) {
					_.forEach(filePaths, (filePath) => {
						newPlaylist.push(filePath);
					});
				}

				newPlaylist.push(playlistFilePath);
			});

			return self.set(newPlaylist);
		});
	}

	playAt(index) {
		const self = this;

		return new Promise((accept, reject) => {
			const entryAtIndex = self.playlist[index];

			if (!entryAtIndex) {
				return reject('Index was out of bounds of playlist');
			}

			self.currentIndex = index;

			this.player.play(entryAtIndex.filePath).then(() => {
				return accept(entryAtIndex);
			});
		});
	}

	previous() {
		return this.playAt((this.currentIndex - 1)).catch(() => {
			// do nothing, just catch it here
		});
	}

	next() {
		return this.playAt((this.currentIndex + 1)).catch(() => {
			// do nothing, just catch it here
		});
	}
}

module.exports = Playlist;