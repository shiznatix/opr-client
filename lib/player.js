const config = require('../config/config.json');
const logger = require('./logger.js');
const server = require('./server.js');
const spawn = require('child_process').spawn;

class Player {
	constructor() {
		this.omxplayerProcessRunning = false;
		this.omxplayerProcess = null;
		this.playTimer = null;
		this.volume = config.defaultVolume;

		// messages that if we get them, we should force omxplayer to quit or it will hang
		this.forceQuitMessages = [
			'COMXAudio::Decode timeout',
		];
		// messages that show we should mark the file as un-playable
		this.failMessages = [
			'COMXAudio::Decode timeout',
			'Vcodec id unknown: 11',
			'Vcodec id unknown: ae',
		];

		this.quitCommand = 'q';
	}

	play(filePath) {
		// if we set a timeout to try playing after .kill()
		// we want to make sure that our most recent play()
		// call will be the one that will trigger omxplayer
		// so we don't have a race condition with multiple
		// setTimeout() calls running
		if (this.playTimer) {
			clearTimeout(this.playTimer);
		}

		if (this.isPlaying()) {
			// what if we send this twice?
			this.runCommand(this.quitCommand);

			this.playTimer = setTimeout(() => {
				this.play(filePath, false);
			}, 500);

			return;
		}

		this.omxplayerProcessRunning = true;

		const command = 'omxplayer';
		const parameters = [
			'-b', filePath,
			'--vol', this.volume,
		];

		logger.info({
			command: command,
			parameters: parameters,
		});

		this.omxplayerProcess = spawn(command, parameters);

		// error handling
		this.omxplayerProcess.stderr.on('data', (data) => {
			logger.error(data.toString('utf8'));
		});

		this.omxplayerProcess.stdout.on('data', (data) => {
			const received = data.toString('utf8').split('\n');

			logger.debug(received);

			received.forEach((line) => {
				if (this.failMessages.indexOf(line) > -1) {
					logger.info(`File was not playable: ${filePath}`);

					// inform our server that this file is in a bad form
					server.setFileNotPlayable(filePath).catch((error) => {
						logger.error(error);
					});

					// only quit if needed
					if (this.forceQuitMessages.indexOf(line) > -1) {
						this.runCommand(this.quitCommand);
					}

					return false;
				}
			});
		});

		this.omxplayerProcess.on('exit', (code) => {
			logger.info(`omxplayer exit code: ${code}`);

			this.omxplayerProcessRunning = false;
			this.omxplayerProcess = null;
		});
	}

	runCommand(command) {
		// set our volume even if we are not playing
		if ('-' === command) {
			this.setVolume(this.volume - 300);
		} else if ('+' === command) {
			this.setVolume(this.volume + 300);
		}

		if (this.isPlaying()) {
			logger.info(`Sending command: ${command}`);

			this.omxplayerProcess.stdin.write(command);
		}
	}

	setVolume(level) {
		logger.info(`Setting volume to ${level}`);

		this.volume = level;
	}

	isPlaying() {
		return this.omxplayerProcessRunning;
	}
}

module.exports = new Player();