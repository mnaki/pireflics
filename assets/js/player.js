var torrentID = null;

// Show modal

$('#waitModal').modal({
    backdrop: 'static',
    keyboard: true
})
var waitModalText = $("#waitModalText");

// Pseudo loading
setInterval(function() {
	var tmp = $("#waitModalText").children()[0].innerHTML;
	if (tmp.indexOf('...') > 0) 
		$("#waitModalText").children()[0].innerHTML = _.replace(tmp, '...', '');
	 else 
		$("#waitModalText").children()[0].innerHTML += '.';
}, 500);

// Start searching torrent

waitModalText.append("<p>> Searching for a torrent </p>");

$.get("/torrent/search/" + $("#title").text()).done(function (data) {

	waitModalText.append("<p>> Found a torrent available, starting download </p>");
	torrentID = data.id;
	// start the download
	$.get("/torrent/" + data.id + "/download").done(function (torrent) {
		console.log(torrent)
		waitModalText.append("<p>> Ready ! </p>");
		if (torrent.path.split(".").pop() == "mkv") {
			waitModalText.append("<p>! Need to convert the torrent, that gonna take some time </p>");
		} else {
			$('#waitModal').modal('hide');
			$("#player").append('<source src="/torrent/' + data.id + '/stream" type="' + torrent.mime  + '">')
			
			var player = videojs("player");
			player.pause();
			player.src([
				{ type: torrent.mime, src: "/torrent/" + data.id + "/stream" }
			]);
			player.addRemoteTextTrack({
				kind: "captions",
				lang: "en",
				label: "english",
				src: "/videos/" + data.id + "/en.vtt"
			})
     		$("#div_video").removeClass("vjs-playing").addClass("vjs-paused");
			player.load();
		}
	}).fail(function (err) {
		console.log(err)
		waitModalText.append("<p>! Cant start the torrent download for unknown reason </p>");
	});
}).fail(function (err) {
	waitModalText.append("<p>! No torrent available or our provider are down, sorry </p>");
});
