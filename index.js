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

function errorResponse(response, error, data = null) {
	if (error instanceof Error) {
		error = error.message;
	}

	response.status(400).json({
		success: false,
		data: data,
		error: error,
	});
}
function successResponse(response, data = null) {
	response.status(200).json({
		success: true,
		data: data,
	});
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

// API playlist routes
app.get('/current-playlist', (request, response) => {
	successResponse(response, playlist.get());
});
app.post('/set-playlist', (request, response) => {
	validator.setPlaylist(request.body).then((params) => {
		return playlist.set(params.filePaths);
	}).then(() => {
		playlist.playAt(0);
		successResponse(response, playlist.get());
	}).catch((error) => {
		logger.error(error);
		errorResponse(response, error);
	});
});
app.post('/enqueue-playlist', (request, response) => {
	validator.setPlaylist(request.body).then((params) => {
		return playlist.enqueue(params.filePaths);
	}).then(() => {
		successResponse(response, playlist.get());
	}).catch((error) => {
		logger.error(error);
		errorResponse(response, error);
	});
});
app.post('/set-at-playlist', (request, response) => {
	validator.setAtPlaylist(request.body).then((params) => {
		return playlist.setAt(params.filePaths, params.atIndex);
	}).then(() => {
		successResponse(response, playlist.get());
	}).catch((error) => {
		logger.error(error);
		errorResponse(response, error);
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
			filePaths.push(show.path);
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
	response.status(404).json({
		'success': false,
		'data': null,
	});
});

// Start web server
playlist.setPlaylistFromFile().finally(() => {
	app.listen(config.port, () => {
		console.log('Started server (plain text) on port ' + config.port);
	});
});