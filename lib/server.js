const config = require(`${__dirname}/../config/config.json`),
	logger = require('./logger.js'),
	Promise = require('bluebird'),
	request = require('request');

function getBody(accept, reject, error, body) {
	if (error) {
		return reject(error);
	}

	try {
		const data = JSON.parse(body).data;

		logger.debug('Received:');

		if (Array.isArray(data)) {
			for (let i = 0; i < data.length; i++) {
				logger.debug(data[i].path);
			}
		}

		return accept(data);
	} catch (e) {
		return reject(e);
	}
}

module.exports = {
	random: function(showNames, amount) {
		return new Promise((accept, reject) => {
			const form = {
				form: {
					showNames: showNames,
					amount: amount,
				},
			};

			logger.debug('Random:');
			logger.debug(JSON.stringify(form));

			request.post(`${config.serverHost}/random`, form, (error, response, body) => {
				return getBody(accept, reject, error, body);
			});
		});
	},

	shows: function() {
		return new Promise((accept, reject) => {
			request.get(`${config.serverHost}/shows`, (error, response, body) => {
				return getBody(accept, reject, error, body);
			});
		});
	},
};