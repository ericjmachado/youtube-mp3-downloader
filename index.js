const fs = require('fs');
const ytdl = require('ytdl-core');
const path = require('path');
const cliProgress = require('cli-progress');

const multibar = new cliProgress.MultiBar({
    format: ' {bar} | "{file}" | {value}/{total}',
    hideCursor: true,
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    stopOnComplete: true
});

const bars = {};
let playlist = '';
const commands = process.argv.slice(2);

if (commands[0]) {
	if(commands[0].split('--p=')[1]) {
		playlist = '/' + commands[0].split('--p=')[1];
	}
}

const path_download = __dirname + playlist

function down(url) {
	ytdl.getInfo(url, function(err, info) {
		if (!fs.existsSync(path_download)) {
			fs.mkdirSync(path_download);
		}
		var output = path.resolve(path_download ,`${info.title}.mp3`);

		var video = ytdl(url, {filter: 'audioonly'});
		video.pipe(fs.createWriteStream(output));
		video.on('response', (res) => {
			var totalSize = res.headers['content-length'];
			var dataRead = 0;
			bars[info.title] = multibar.create(totalSize, 0, {file: info.title})
			res.on('data', function(data) {
				dataRead += data.length;
				bars[info.title].update(dataRead)
			});
		})
	});
}

function initDownload() {
	fs.readFile('urls.txt', 'utf-8', (e, list) => {
		for(const url of list.trim().split('\n')) {
			down(url.split('&list')[0]);
		}
	});
};

initDownload();
