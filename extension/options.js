window.addEventListener('load', function () {
	$('#tabs').tabs();
	init();
	$('#save').click(save_options).keypress(save_options);
});

var db = chrome.extension.getBackgroundPage().db,
	serverCount = 0;
function save_options() {
	var servers = [], i, el, l = $('input');
	for (i = 0; el = l[i]; i++) {
		if (el.className === "server") {
			servers.push(el.value);
			continue;
		}
		if (!el.id) continue;
		if (el.type === 'checkbox' || el.type === 'radio')
			localStorage[el.id] = el.checked;
		else
			localStorage[el.id] = el.value;
	}
	while ((el = servers.pop())) {
		var host = el.replace(/\s*/, "").replace(/https?:\/\//, "");
		if (host.length === 0) continue;
		db.setInstallServer(host, host);
	}

	// Update status to let user know options were saved.
	var status = $("#status");
	//status.text("Options Saved.").fadeIn().delay(2000).fadeOut();
	status.text("Options Saved.")
		.animate({"opacity": 1}, {"duration": "slow", "easing": "linear"})
		.delay(4000)
		.animate({"opacity": 0}, {"duration": "slow", "easing": "linear"});
}

function restore_options() {
	var i, el, l = $('input');
	for (i = 0; el = l[i]; i++) {
		if (!el.id || !localStorage[el.id]) continue;
		if (el.type === 'checkbox' || el.type === 'radio')
			el.checked = localStorage[el.id] === "true";
		else
			el.value = localStorage[el.id];
	}
}

function init() {
	restore_options();
	db.getInstallServers(function (servers) {
		var id, el, serversDIV = $("#installations"), content;
		while ((el = servers.shift())) {
			id = "server_" + (++serverCount);
			content = [
				'<div class="prop">',
				'<label for="' + id + '">Server: </label>',
				'https://<input class="server ' + id + '" value="' + el + '" size="30" type="text">',
				'<button id="' + id + '" class="remove-btn">Remove</button>',
				'</div>'
			];
			serversDIV.append(content.join("\n"));
		}
		setupAddServer();
		addServer();
		removeServer();
	});
}
function setupAddServer() {
	var id = "server_" + (++serverCount),
		serversDIV = $("#installations"),
		content = [
			'<div class="prop">',
			'<label for="' + id + '">Server: </label>',
			'https://<input class="server ' + id + '" value="" size="30" type="text">',
			'<button for="' + id + '" class="add-btn">Add</button>',
			'<button id="' + id + '" class="remove-btn" style="display:none">Remove</button>',
			'</div>'
		];
	serversDIV.append(content.join("\n"));
}

function addServer() {
	$('.add-btn').on('click', function () {
		var id = $(this).attr('for');
		var url = $('.prop .server.' + id + '').val();
		var host = url.replace(/\s*/, "").replace(/https?:\/\//, "");
		this.style.display='none';
		this.nextElementSibling.style.display='inline';
		db.setInstallServer(host, host);
		var status = $("#status");
		//status.text("Options Saved.").fadeIn().delay(2000).fadeOut();
		status.text("Added Server.")
			.animate({"opacity": 1}, {"duration": "slow", "easing": "linear"})
			.delay(4000)
			.animate({"opacity": 0}, {"duration": "slow", "easing": "linear"});
		$('.prop').remove();
		init();
	});
}

function removeServer() {
	$('.remove-btn').on('click', function () {
		var id = $(this).attr('id');
		var input = $("." + id);
		db.removeInstallServer(input.val());
		input.parent().remove();
		if ($("input.server").length === 0) {
			setupAddServer();
		}
		var status = $("#status");
		//status.text("Options Saved.").fadeIn().delay(2000).fadeOut();
		status.text("Removed URL.")
			.animate({"opacity": 1}, {"duration": "slow", "easing": "linear"})
			.delay(4000)
			.animate({"opacity": 0}, {"duration": "slow", "easing": "linear"});
	});
}
