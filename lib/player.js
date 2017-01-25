const logger = require('./logger.js'),
	Promise = require('bluebird'),
	spawn = require('child_process').spawn;

class Player {
	constructor() {
		this.omxplayerProcessRunning = false;
		this.omxplayerProcess = null;
		this.playTimer = null;

		this.failMessages = [
			'COMXAudio::Decode timeout',
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
		this.omxplayerProcess = spawn('omxplayer', ['-b', filePath]);

		this.omxplayerProcess.stdout.on('data', (data) => {
			const received = data.toString('utf8');

			logger.debug(received);

			if (this.failMessages.indexOf(received) > -1) {
				this.runCommand(this.quitCommand);
			}
		});

		this.omxplayerProcess.stderr.on('data', (data) => {
			logger.error(data.toString('utf8'));
		});

		this.omxplayerProcess.on('exit', (code) => {
			logger.info(`omxplayer exit code: ${code}`);
			this.omxplayerProcessRunning = false;
			this.omxplayerProcess = null;
		});
	}

	runCommand(command) {
		if (this.isPlaying()) {
			logger.info(`Sending command: ${command}`);
			this.omxplayerProcess.stdin.write(command);
		}
	}

	isPlaying() {
		return this.omxplayerProcessRunning;
	}
}

module.exports = new Player();