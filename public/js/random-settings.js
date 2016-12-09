const SAVED_SHOWS_KEY = 'randomShows';

function getHeadingHtml(id, name) {
	return `
		<div class="panel-heading" role="tab" id="heading${id}">
			<h4 class="panel-title">
				<a role="button" data-toggle="collapse" data-parent="#accordion" href="#collapse${id}" aria-expanded="true" aria-controls="collapse${id}">
					${name}
				</a>
			</h4>
		</div>
	`;
}
function getShowsContainerHtml(id, shows) {
	return `
		<div id="collapse${id}" class="panel-collapse collapse in" role="tabpanel" aria-labelledby="heading${id}">
			<div class="panel-body">
				${getShowsHtml(shows)}
			</div>
		</div>
	`;
}
function getShowsHtml(shows) {
	const randomShows = getSavedShows();
	let html = '';

	for (let i = 0; i < shows.length; i++) {
		const checked = (randomShows.indexOf(shows[i].id) > -1 ? 'checked="checked"' : '');

		html = `
			${html}
			<div class="checkbox">
				<label><input type="checkbox" class="randomShows" value="${shows[i].id}" ${checked}>${shows[i].name}</label>
			</div>
		`;
	}

	return html;
}
function getSavedShows() {
	let randomShows = localStorage.getItem(SAVED_SHOWS_KEY);

	try {
		randomShows = JSON.parse(randomShows);
		return (Array.isArray(randomShows) ? randomShows : []);
	} catch (e) {
		return [];
	}
}

$(document).ready(function() {
	sendCommand(COMMANDS.shows, function(error, data) {
		if (!requestWasSuccessfull(error, data, true)) {
			return;
		}

		$('#accordion').html('');

		for (let i = 0; i < data.length; i++) {
			$('#accordion').append(`
				<div class="panel panel-default">
					${getHeadingHtml(i, data[i].name)}
					${getShowsContainerHtml(i, data[i].shows)}
				</div>
			`);
		}

		$('.collapse').collapse();
	});
});

$(document).on('change', '.randomShows', function() {
	const checkbox = $(this);
	let randomShows = getSavedShows();

	if (checkbox.is(':checked')) {
		randomShows.push(checkbox.val());
	} else {
		const index = randomShows.indexOf(checkbox.val());

		randomShows.splice(index, 1);
	}

	// array unique it
	randomShows = randomShows.filter(function(item, i, shows) {
		return shows.indexOf(item) === i;
	});

	localStorage.setItem(SAVED_SHOWS_KEY, JSON.stringify(randomShows));
});