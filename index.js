const currentDir = __dirname,
	config = require(currentDir + '/config/config.json'),
	express = require('express'),
	player = require(currentDir + '/lib/player.js'),
	playlist = require(currentDir + '/lib/playlist.js'),
	server = require(currentDir + '/lib/server.js'),
	app = express();

function errorResponse(response, error, data = null) {
	response.status(400).json({
		'success': false,
		'data': data,
		'error': error,
	});
}
function successResponse(response, data = null) {
	response.status(200).json({
		'success': true,
		'data': data,
	});
}
function respond(response, error, data = null) {
	if (error) {
		return errorResponse(response, error, data);
	}

	return successResponse(response, data);
}

// Public files
app.use(express.static(__dirname + '/public'));

// API player routes
app.get('/close-player', function(request, response) {
	player.close(function(error) {
		respond(response, error);
	});
});
app.get('/volume-down', function(request, response) {
	player.volumeDown(function(error) {
		respond(response, error);
	});
});
app.get('/volume-up', function(request, response) {
	player.volumeUp(function(error) {
		respond(response, error);
	});
});
app.get('/play-pause', function(request, response) {
	player.playPause(function(error) {
		respond(response, error);
	});
});
app.get('/forward', function(request, response) {
	player.forward(function(error) {
		respond(response, error);
	});
});
app.get('/back', function(request, response) {
	player.back(function(error) {
		respond(response, error);
	});
});

// API playlist routes
app.get('/current-playlist', function(request, response) {
	playlist.get()
		.then(function(data) {
			successResponse(response, data);
		})
		.catch(function(error) {
			errorResponse(response, data);
		});
});
app.get('/previous', function(request, response) {
	playlist.previous()
		.then(function(data) {
			successResponse(response, data);
		})
		.catch(function(error) {
			errorResponse(response, data);
		});
});
app.get('/next', function(request, response) {
	playlist.next()
		.then(function(data) {
			successResponse(response, data);
		})
		.catch(function(error) {
			errorResponse(response, data);
		});
});

// API play routes
app.post('/random', function(request, response) {
	const params = {
		'shows': request.body.shows,
		'playlistSize': request.body.playlistSize,
		'enqueue': !!request.body.enqueue,
	};

	server.random(request.body.shows, request.body.playlistSize)
		.then(function(data) {
			playlist.set(data);
			successResponse(response, data);
		})
		.catch(function(error) {
			errorResponse(response, error);
		});
});
app.post('/browse', function(request, response) {
	server.browse(request.body.path)
		.then(function(data) {
			successResponse(response, data);
		})
		.catch(function(error) {
			errorResponse(response, error);
		});
});
app.get('/shows', function(request, response) {
	server.shows()
		.then(function(data) {
			successResponse(response, data);
		})
		.catch(function(error) {
			errorResponse(response, error);
		});
});

// Not found handler
app.get('*', function(request, response) {
	response.status(404).json({
		'success': true,
		'data': null,
	});
});

// Start web server
app.listen(config.port, function() {
	console.log('Started server (plain text) on port ' + config.port);
});