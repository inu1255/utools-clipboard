const fs = require("fs-extra");
const path = require("path");
const {clipboard} = require("electron");
const crypto = require("crypto");
const clipboardListener = require("clipboard-event");
const home = utools.getPath("home");
window.require = require;
window.__WorkDir = __dirname;
let historys = [];
let snippets = [];
utools.onPluginReady(refreshHistory);
utools.onDbPull(refreshHistory);
// To start listening
clipboardListener.startListening();

function refreshHistory() {
	let items = utools.db.allDocs();
	items.sort((a, b) => {
		return b.time - a.time;
	});
	historys.length = 0;
	for (let item of items) {
		historys.push(itemMap(item));
	}
	window.exports.clipboard.args.placeholder = "搜索(" + historys.length + ")条";
}

function pbpaste() {
	let file;
	if (utools.isWindows()) {
		const rawFilePath = clipboard.readBuffer("FileNameW").toString("ucs2");
		file = rawFilePath.replace(new RegExp(String.fromCharCode(0), "g"), "");
	} else if (remote.process.platform == "darwin") {
		file = clipboard.read("public.file-url").replace("file://", "");
	}
	if (file) return {type: "file", data: file};
	let image = clipboard.readImage();
	if (!image.isEmpty()) return {type: "image", data: image.toDataURL()};
	let text = clipboard.readText();
	if (text.trim()) return {type: "text", data: text};
}

clipboardListener.on("change", () => {
	let item = pbpaste();
	if (!item) return;
	item._id = crypto.createHash("md5").update(item.data).digest("hex");
	item.time = Date.now();
	for (let i = 0; i < historys.length; i++) {
		let x = historys[i];
		if (
			x._id == item._id ||
			(i > 1000 && ((item.type == "text" && item.data.length > 1024) || item.type == "image"))
		) {
			historys.splice(i--, 1);
		}
	}
	historys.unshift(itemMap(item));
	window.exports.clipboard.args.placeholder = "搜索(" + historys.length + ")条";
	utools.db.put(item);
	if (historys.length > 5000) {
		let x = historys.pop();
		utools.db.remove(x._id);
	}
});

function timestamp(t) {
	if (!t) t = new Date();
	let year = t.getFullYear().toString();
	var month = (t.getMonth() + 1).toString();
	if (month.length < 2) month = "0" + month;
	var date = t.getDate().toString();
	if (date.length < 2) date = "0" + date;
	var hours = t.getHours().toString();
	if (hours.length < 2) hours = "0" + hours;
	var mintues = t.getMinutes().toString();
	if (mintues.length < 2) mintues = "0" + mintues;
	var seconds = t.getSeconds().toString();
	if (seconds.length < 2) seconds = "0" + seconds;
	return `${year}-${month}-${date} ${hours}:${mintues}:${seconds}`;
}

function itemMap(x) {
	if (x.type == "image")
		return {
			_id: x._id,
			title: "[" + (/image\/\w+/.exec(x.data) || ["image"])[0] + "]",
			description: timestamp(new Date(x.time)),
			icon: x.data,
			click() {
				utools.copyImage(x.data);
			},
		};
	if (x.type == "text")
		return {
			_id: x._id,
			title: x.data,
			description: timestamp(new Date(x.time)),
			icon: "res/text.svg",
			click() {
				utools.copyText(x.data);
			},
		};
	if (x.type == "file")
		return {
			_id: x._id,
			title: x.data,
			description: timestamp(new Date(x.time)),
			icon: "res/file.svg",
			click() {
				utools.copyFile(x.data);
			},
		};
}

window.exports = {
	clipboard: {
		mode: "list",
		args: {
			enter: (action, callbackSetList) => {
				fs.readJSON(path.join(home, ".snippets.json"))
					.then(
						(items) => {
							snippets.length = 0;
							for (let item of items) {
								item.icon = "res/snippet.svg";
								item.click = function () {
									utools.copyText(item.data || item.description);
								};
								snippets.push(item);
							}
						},
						function () {}
					)
					.then(function () {
						callbackSetList(historys);
					});
			},
			search: (action, searchWord, callbackSetList) => {
				let results = historys;
				if (searchWord) {
					searchWord = searchWord.toLowerCase();
					results = results.filter((x) => {
						return x.title && ~x.title.toLowerCase().indexOf(searchWord);
					});
					if (searchWord.startsWith("s ")) {
						let key = searchWord.slice(2);
						results = snippets
							.filter((x) => {
								return x.title && ~x.title.toLowerCase().indexOf(key);
							})
							.concat(results);
					}
				}
				callbackSetList(results);
			},
			select: (action, itemData, callbackSetList) => {
				window.utools.hideMainWindow();
				utools.setSubInputValue("");
				window.utools.outPlugin();
				itemData.click();
				utools.simulateKeyboardTap("v", utools.isMacOs() ? "command" : "ctrl");
			},
			placeholder: "搜索",
		},
	},
};

// To stop listening
// clipboardListener.stopListening();
