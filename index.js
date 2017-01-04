const currentDir = __dirname,
	config = require(`${currentDir}/config/config.json`),
	express = require('express'),
	bodyParser = require('body-parser'),
	player = require(`${currentDir}/lib/player.js`),
	Playlist = require(`${currentDir}/lib/playlist.js`),
	playlist = new Playlist(player),
	server = require(`${currentDir}/lib/server.js`),
	browse = require(`${currentDir}/lib/browse.js`),
	validator = require(`${currentDir}/lib/validator.js`),
	logger = require(`${currentDir}/lib/logger.js`),
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
app.get('/close-player', (request, response) => {
	player.close((error) => {
		respond(response, error);
	});
});
app.get('/volume-down', (request, response) => {
	player.volumeDown((error) => {
		respond(response, error);
	});
});
app.get('/volume-up', (request, response) => {
	player.volumeUp((error) => {
		respond(response, error);
	});
});
app.get('/play-pause', (request, response) => {
	player.playPause((error) => {
		respond(response, error);
	});
});
app.get('/forward', (request, response) => {
	player.forward((error) => {
		respond(response, error);
	});
});
app.get('/back', (request, response) => {
	player.back((error) => {
		respond(response, error);
	});
});

// API playlist routes
app.get('/current-playlist', (request, response) => {
	playlist.get().then((data) => {
		successResponse(response, data);
	}).catch((error) => {
		logger.error(error);
		errorResponse(response, error);
	});
});
app.post('/set-playlist', (request, response) => {
	validator.setPlaylist(request.body).then((params) => {
		return playlist.set(params.filePaths).then(() => {
			return playlist.playAt(0);
		}).then(() => {
			return playlist.get();
		});
	}).then((data) => {
		successResponse(response, data);
	}).catch((error) => {
		logger.error(error);
		errorResponse(response, error);
	});
});
app.post('/enqueue-playlist', (request, response) => {
	validator.setPlaylist(request.body).then((params) => {
		return playlist.enqueue(params.filePaths).then(() => {
			return playlist.get();
		});
	}).then((data) => {
		successResponse(response, data);
	}).catch((error) => {
		logger.error(error);
		errorResponse(response, error);
	});
});
app.post('/set-at-playlist', (request, response) => {
	validator.setAtPlaylist(request.body).then((params) => {
		return playlist.setAt(params.filePaths, params.atIndex).then(() => {
			return playlist.get();
		});
	}).then((data) => {
		successResponse(response, data);
	}).catch((error) => {
		logger.error(error);
		errorResponse(response, error);
	});
});
app.get('/previous', (request, response) => {
	playlist.previous().then((data) => {
		successResponse(response, data);
	}).catch((error) => {
		logger.error(error);
		errorResponse(response, error);
	});
});
app.get('/next', (request, response) => {
	playlist.next().then((data) => {
		successResponse(response, data);
	}).catch((error) => {
		logger.error(error);
		errorResponse(response, error);
	});
});
app.post('/play-at', (request, response) => {
	validator.playAt(request.body).then((params) => {
		return playlist.playAt(params.index);
	}).then((data) => {
		successResponse(response, data);
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
		return playlist.get();
	}).then((data) => {
		successResponse(response, data);
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