const config = require(`${__dirname}/config/config.json`),
	playerConfig = require(`${__dirname}/config/player-config.json`),
	express = require('express'),
	bodyParser = require('body-parser'),
	player = require(`${__dirname}/lib/player.js`),
	Playlist = require(`${__dirname}/lib/playlist.js`),
	playlist = new Playlist(player),
	server = require(`${__dirname}/lib/server.js`),
	browse = require(`${__dirname}/lib/browse.js`),
	validator = require(`${__dirname}/lib/validator.js`),
	logger = require(`${__dirname}/lib/logger.js`),
	_ = require('lodash'),
	app = express();
let appServer = null;

process.on('uncaughtException', function (error) {
	logger.error('Uncaught exception!');
	logger.error(error);
});

process.on('SIGTERM', () => {
	logger.info('SIGTERM received');

	// if we haven't exited within 2 seconds, just die
	let killTimeout = setTimeout(() => {
		logger.info('SIGTERM - app server not cleanly closed, exiting');

		process.exit(1);
	}, 2000);

	playlist.stop();
	player.runCommand('q');

	appServer.close(() => {
		clearTimeout(killTimeout);
		logger.info('SIGTERM - app server closed, exiting');

		process.exit(0);
	});
});

function errorResponse(response, error, data = null) {
	if (error instanceof Error) {
		error = error.message;
	}

	const jsonResponse = {
			success: false,
			data: data,
			error: error,
		},
		logResponse = JSON.stringify(jsonResponse);

	logger.error(`400 error response ${logResponse}`);

	response.status(400).json(jsonResponse);
}
function successResponse(response, data = null) {
	const jsonResponse = {
			success: true,
			data: data,
		},
		logResponse = JSON.stringify(jsonResponse);

	logger.debug(`200 success response ${logResponse}`);

	response.status(200).json(jsonResponse);
}
function respond(response, error, data = null) {
	if (error) {
		return errorResponse(response, error, data);
	}

	return successResponse(response, data);
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true,
}));

// Public files
app.use(express.static(`${__dirname}/public`));
app.get('/random-settings', (request, response) => {
	response.sendFile(`${__dirname}/public/index.html`);
});
app.get('/browse', (request, response) => {
	response.sendFile(`${__dirname}/public/index.html`);
});

// API player routes
_.forEach(playerConfig, (data) => {
	app.get(`/${data.route}`, (request, response) => {
		player.runCommand(data.command);
		successResponse(response);
	});
});
app.get('/stop', (request, response) => {
	playlist.stop();
	player.runCommand('q');
	successResponse(response);
});

// API playlist routes
app.get('/current-playlist', (request, response) => {
	successResponse(response, playlist.get());
});
app.post('/set-playlist', (request, response) => {
	let addedFilePaths = [];

	validator.setPlaylist(request.body).then((params) => {
		addedFilePaths = params.filePaths;

		return playlist.set(addedFilePaths);
	}).then(() => {
		playlist.playAt(0);
		successResponse(response, playlist.get());
	}).catch((error) => {
		logger.error(error);
		errorResponse(response, error);
	}).then(() => {
		return server.setLastPlayedTime(addedFilePaths);
	}).catch((error) => {
		logger.error(error);
	});
});
app.post('/enqueue-playlist', (request, response) => {
	let addedFilePaths = [];

	validator.setPlaylist(request.body).then((params) => {
		addedFilePaths = params.filePaths;

		return playlist.enqueue(addedFilePaths);
	}).then(() => {
		successResponse(response, playlist.get());
	}).catch((error) => {
		logger.error(error);
		errorResponse(response, error);
	}).then(() => {
		return server.setLastPlayedTime(addedFilePaths);
	}).catch((error) => {
		logger.error(error);
	});
});
app.post('/set-at-playlist', (request, response) => {
	let addedFilePaths = [];

	validator.setAtPlaylist(request.body).then((params) => {
		addedFilePaths = params.filePaths;

		return playlist.setAt(addedFilePaths, params.atIndex);
	}).then(() => {
		successResponse(response, playlist.get());
	}).catch((error) => {
		logger.error(error);
		errorResponse(response, error);
	}).then(() => {
		return server.setLastPlayedTime(addedFilePaths);
	}).catch((error) => {
		logger.error(error);
	});
});
app.get('/previous', (request, response) => {
	successResponse(response, playlist.previous());
});
app.get('/next', (request, response) => {
	successResponse(response, playlist.next());
});
app.post('/play-at', (request, response) => {
	validator.playAt(request.body).then((params) => {
		successResponse(response, playlist.playAt(params.index));
	}).catch((error) => {
		logger.error(error);
		errorResponse(response, error);
	});
});

// API play routes
app.post('/random', (request, response) => {
	let params = {};

	validator.random(request.body).then((data) => {
		params = data;

		return server.random(params.showNames, params.amount);
	}).then((data) => {
		let filePaths = [];

		_.forEach(data, (show) => {
			filePaths.push(show.filePath);
		});

		if ('enqueue' === params.method) {
			return playlist.enqueue(filePaths);
		} else {
			return playlist.set(filePaths).then(() => {
				return playlist.playAt(0);
			});
		}
	}).then(() => {
		successResponse(response, playlist.get());
	}).catch((error) => {
		logger.error(error);
		errorResponse(response, error);
	});
});
app.post('/browse-server', (request, response) => {
	validator.browse(request.body).then((params) => {
		return browse.getFiles(params.dir);
	}).then((data) => {
		successResponse(response, data);
	}).catch((error) => {
		logger.error(error);
		errorResponse(response, error);
	});
});
app.get('/shows', (request, response) => {
	server.shows().then((data) => {
		successResponse(response, data);
	}).catch((error) => {
		logger.error(error);
		errorResponse(response, error);
	});
});

// Not found handler
app.get('*', (request, response) => {
	logger.error('404 request');

	response.status(404).json({
		'success': false,
		'data': null,
	});
});

// Start web server
playlist.setPlaylistFromFile().finally(() => {
	appServer = app.listen(config.port, () => {
		console.log('Started server (plain text) on port ' + config.port);
	});
});