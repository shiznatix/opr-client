const Promise = require('bluebird');

module.exports = {
	random: function(body) {
		return new Promise((accept, reject) => {
			const showNames = (Array.isArray(body.showNames) ? body.showNames : []),
				amount = Number(body.amount),
				method = body.method;
			let errors = [];

			if (isNaN(amount)) {
				errors.push('Amount is not a number');
			}

			if ('enqueue' !== method && 'play' !== method) {
				errors.push('Invalid method');
			}

			if (0 !== errors.length) {
				return reject(errors);
			}

			return accept({
				showNames: showNames,
				amount: amount,
			});
		});
	},
};