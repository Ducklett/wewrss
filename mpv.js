const http = require('http')
const cp = require('child_process');

http.createServer(function (req, res) {
    if (req.url == '/favicon.ico') {
        res.write('No u');
        res.end();
    } else {
        cp.spawn('mpv', ['--no-config', '--ontop', '--ytdl-format=bestvideo[height<=?720][fps<=?30][vcodec!=?vp9]+bestaudio/best', req.url.substr(1)])
        console.log(req.url)
        res.write('Ok');
        res.end();
    }
}).listen(6969);
