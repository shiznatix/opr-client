const logger = require('./logger.js');
const fs = require('fs');
const path = require('path');
const playlistLocation = `../playlist.txt`;

class Playlist {
	constructor(player) {
		this.player = player;
		this.playlist = [];
		this.currentIndex = 0;
		this.playlistPlaying = false;

		setInterval(() => {
			if (this.playlistPlaying && !this.player.isPlaying()) {
				const nextIndex = (this.currentIndex + 1);

				if (this.playlist[nextIndex]) {
					this.next();
				}
			}
		}, 2000);
	}

	getPlaylistFilePaths() {
		return new Promise((accept, reject) => {
			if (!fs.existsSync(playlistLocation)) {
				return accept([]);
			}

			fs.readFile(playlistLocation, 'utf8', (error, data) => {
				if (error) {
					return reject(error);
				}

				const playlistPaths = data.split('\n');
				const playlist = [];

				playlistPaths.forEach((filePath, key) => {
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
		return this.getPlaylistFilePaths().then((playlistPaths) => {
			this.playlist = [];

			playlistPaths.forEach((filePath, key) => {
				if ('' === filePath.trim()) {
					return;
				}

				const filePathParts = filePath.split('/');

				this.playlist.push({
					// folder path must be */$SHOW_NAME/$SEASON/$FILE_NAME
					showName: (filePathParts.length > 2 ? filePathParts[filePathParts.length - 3] : null),
					fileName: path.basename(filePath),
					filePath: filePath,
				});
			});
		});
	}

	get() {
		return this.playlist;
	}

	set(filePaths) {
		return new Promise((accept, reject) => {
			fs.writeFile(playlistLocation, filePaths.join('\n'), (error) => {
				if (error) {
					return reject(error);
				}

				return accept(this.setPlaylistFromFile());
			});
		});
	}

	enqueue(filePaths) {
		return this.getPlaylistFilePaths().then((playlistFilePaths) => {
			filePaths.forEach((filePath) => {
				playlistFilePaths.push(filePath);
			});

			return this.set(playlistFilePaths);
		});
	}

	setAt(filePaths, atIndex) {
		if (typeof this.playlist[atIndex] === 'undefined') {
			return this.enqueue(filePaths);
		}

		return this.getPlaylistFilePaths().then((playlist) => {
			const newPlaylist = [];

			playlist.forEach((playlistFilePath, index) => {
				if (index === atIndex) {
					filePaths.forEach((filePath) => {
						newPlaylist.push(filePath);
					});
				}

				newPlaylist.push(playlistFilePath);
			});

			return this.set(newPlaylist);
		});
	}

	playAt(index) {
		const entryAtIndex = this.playlist[index];

		if (!entryAtIndex) {
			throw new Error('Index was out of bounds of playlist');
		}

		this.currentIndex = index;

		this.playlistPlaying = true;
		this.player.play(entryAtIndex.filePath);

		return entryAtIndex;
	}

	previous() {
		try {
			this.playAt((this.currentIndex - 1));
		} catch (e) {
			logger.error(e);
		}
	}

	next() {
		try {
			this.playAt((this.currentIndex + 1));
		} catch (e) {
			logger.error(e);
		}
	}

	stop() {
		this.playlistPlaying = false;
	}
}

module.exports = Playlist;