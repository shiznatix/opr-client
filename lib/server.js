const config = require(`${__dirname}/../config/config.json`),
	Promise = require('bluebird'),
	request = require('request');

function getBody(accept, reject, error, body) {
	if (error) {
		return reject(error);
	}

	try {
		const data = JSON.parse(body).data;

		return accept(data);
	} catch (e) {
		return reject(e);
	}
}

module.exports = {
	random: function(shows, amount) {
		return new Promise((accept, reject) => {
			const form = {
				form: {
					shows: shows,
					amount: amount,
				},
			};

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