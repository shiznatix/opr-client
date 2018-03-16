const logger = require('./logger.js');
const fs = require('fs');
const exec = require('child_process').exec;

class ThemeWatcher {
	constructor() {
		this.building = false;
	}

	start() {
		logger.info('Watching for changes to config file to rebuild theme...');

		fs.watch(`${__dirname}/../config/config.json`, (eventType, fileName) => {
			if ('change' === eventType && !this.building) {
				this.building = true;

				logger.info('*Rebuilding theme*');
				exec(`sudo -u pi ${__dirname}/../build-theme.sh`, (error, stdout) => {
					logger.info('*Theme building finished with:*');

					this.building = false;

					if (error) {
						logger.error(error);
						return;
					}

					logger.info(stdout);
				});
			}
		});
	}
}

module.exports = new ThemeWatcher;