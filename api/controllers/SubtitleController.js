/**
 * SubtitleController
 *
 * @description :: Server-side logic for managing Subtitles
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    /**
    *   `SubtitleController.search()`
    *   /torrent/:id/search/:lang
    *
    *   Route used to search a subtitle for a specific torrent
    */
    search: function (req, res) {
        var id = req.params.id, lang = req.params.lang;

        Torrent.find({ id: id }).populate('subtitles', { lang: lang }).exec(function (err, records) {
            // check if we found a torrent for this id
            if ( err || records.length == 0) {
                res.json({ error: "Torrent not found" });
            } else {
                var torrent = records[0];

                // if there is no subtitles, we can already search it
                if (torrent.subtitles.length == 0) {
                    var subtitle = SubtitleService.search(torrent, lang);
                    if (subtitle == null)
                        res.json({ error: "Subtitle not found for this torrent" });
                    else 
                        res.ok(subtitle);
                } 
                // else just return our subtitle
                else
                    res.ok(torrent.subtitles[0]);
            }
        });
    }
};

