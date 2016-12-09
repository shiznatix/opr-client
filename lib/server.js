const config = require(`${__dirname}/../config/config.json`),
	Promise = require('bluebird'),
	request = require('request');

module.exports = {
	'random': (shows, playlistSize) => {
		return new Promise((accept, reject) => {
			const form = {
				'form': {
					'shows': shows,
					'amount': playlistSize,
				},
			};

			request.post(`${config.serverHost}/random`, form, (error, response) => {
				if (error) {
					return reject(error);
				}

				return accept(response.data);
			});
		});
	},

	'browse': (path) => {
		return new Promise((accept, reject) => {
			const form = {
				'form': {
					'path': path,
				},
			};

			request.post(`${config.serverHost}/browse`, form, (error, response) => {
				if (error) {
					return reject(error);
				}

				return accept(response.data);
			});
		});
	},

	'shows': () => {
		return new Promise((accept, reject) => {
			request.get(`${config.serverHost}/shows`, (error, response) => {
				if (error) {
					return reject(error);
				}

				try {
					return accept(JSON.parse(response.body).data);
				} catch (e) {
					return reject(e);
				}
			});
		});
	},
};