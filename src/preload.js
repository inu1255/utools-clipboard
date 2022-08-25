const fs = require("fs-extra");
const path = require("path");
const {clipboard} = require("electron");
const crypto = require("crypto");
const yaml = require("yaml");
const home = utools.getPath("home");
const time = require("./time");
const bs = ["b", "kb", "mb", "gb", "tb", "pb", "eb", "zb"];
const config = {
	limit: 5000, // 限制历史条数
	large_limit: 100, // 图片和大文字限制
	large_text: 512, // 图片超过多少字节算作大文件
	snippet_path: path.join(home, ".snippets.yaml"),
};
const config_path = path.join(home, ".utools-clipboard.yaml");
try {
	Object.assign(config, yaml.parse(fs.readFileSync(config_path, "utf8")));
} catch (error) {}
fs.writeFile(config_path, yaml.stringify(config));
window.require = require;
window.__WorkDir = __dirname;
let historys;
let snippets;
let currentClipboardText = "";
const clipboardModule = {
	mode: "list",
	args: {
		enter: (action, callbackSetList) => {
			if (!historys) refreshHistory();
			callbackSetList(historys);
		},
		search: (action, searchWord, callbackSetList) => {
			let pms = Promise.resolve(historys);
			if (searchWord) {
				const lowerWord = searchWord.toLowerCase();
				let results = historys.filter((x) => {
					return x.title && ~x.title.toLowerCase().indexOf(lowerWord);
				});
				pms = Promise.resolve(results);
				if (lowerWord.startsWith("s ")) {
					pms = loadSnippet(true).then((data) => {
						let list = [];
						// 添加snippet
						if (snippets && /^s add \w+/.test(lowerWord)) {
							let keys = searchWord.slice(6).trim().split(" ");
							for (let i = 0; i < keys.length; i++) {
								let title = keys.slice(0, i + 1).join(" ");
								let description = keys.slice(i + 1).join(" ");
								if (!description) {
									if (!currentClipboardText) pbpaste();
									description = currentClipboardText;
								}
								if (description) {
									list.push({
										title,
										description,
										icon: "res/add.svg",
										click() {
											snippets[title] = description;
											saveSnippet();
										},
									});
								}
							}
						}
						// 删除snippet
						if (snippets && /^s del \w+/.test(lowerWord)) {
							let key = lowerWord.slice(6).trim();
							for (let title in snippets) {
								if (title.toLowerCase().indexOf(key) >= 0) {
									let description = snippets[title];
									list.push({
										title,
										description,
										icon: "res/delete.svg",
										click() {
											delete snippets[title];
											saveSnippet();
										},
									});
								}
							}
						}
						// 搜索snippet
						let key = lowerWord.slice(2);
						for (let title in data) {
							if (title.toLowerCase().indexOf(key) >= 0) {
								let description = data[title];
								list.push({
									title,
									description,
									icon: "res/snippet.svg",
									click() {
										utools.copyText(description);
										return true;
									},
								});
							}
						}
						return list.concat(results);
					});
				}
			}
			pms.then(callbackSetList, () => callbackSetList(historys));
		},
		select: (action, itemData, callbackSetList) => {
			window.utools.hideMainWindow();
			utools.setSubInputValue("");
			window.utools.outPlugin();
			if (itemData.click()) {
				utools.simulateKeyboardTap("v", utools.isMacOs() ? "command" : "ctrl");
			}
		},
		placeholder: "搜索",
	},
};
utools.onPluginReady(refreshHistory);
utools.onDbPull(refreshHistory);

class Db {
	allDocs() {
		return utools.db.allDocs();
	}

	remove(id) {
		return utools.db.remove(id);
	}

	put(item) {
		return utools.db.put(item);
	}
}

const db = new Db();

function refreshHistory() {
	let items = db.allDocs();
	items.sort((a, b) => {
		return b.time - a.time;
	});
	historys = [];
	for (let item of items) {
		historys.push(itemMap(item));
	}
	console.log("初始化条数", items.length);
	clipboardModule.args.placeholder = "搜索(" + historys.length + ")条";
}

function pbpaste() {
	let list = [];
	let file;
	// if (utools.isWindows()) {
	// 	const rawFilePath = clipboard.readBuffer("FileNameW").toString("ucs2");
	// 	file = rawFilePath.replace(new RegExp(String.fromCharCode(0), "g"), "");
	// } else if (remote.process.platform == "darwin") {
	// 	file = clipboard.read("public.file-url").replace("file://", "");
	// }
	if (file) list.push({type: "file", data: file});
	let image = clipboard.readImage();
	let size = image.getSize();
	if (!image.isEmpty())
		list.push({type: "image", size: `${size.width}x${size.height}`, data: image.toDataURL()});
	let text = clipboard.readText();
	currentClipboardText = text;
	if (text.trim()) list.push({type: "text", data: text});
	return list;
}

function watchClipboard(fn) {
	let prev = {};
	function loop() {
		time.sleep(500).then(loop);
		let list = pbpaste();
		if (list[0] && prev.data != list[0].data) {
			prev = list[0];
			list.forEach(fn);
		}
	}
	loop();
}

watchClipboard((item) => {
	if (!item) return;
	if (!historys) refreshHistory();
	item._id = crypto.createHash("md5").update(item.data).digest("hex");
	item.time = Date.now();
	for (let i = 0; i < historys.length; i++) {
		let x = historys[i];
		if (x._id == item._id) {
			historys.splice(i--, 1);
		}
		if (i > config.large_limit && x.large) {
			historys.splice(i--, 1);
			db.remove(x._id);
			console.log("内容太大删除", i, x);
		}
	}
	historys.unshift(itemMap(item));
	clipboardModule.args.placeholder = "搜索(" + historys.length + ")条";
	db.put(item);
	if (historys.length > config.limit) {
		let x = historys.pop();
		db.remove(x._id);
		console.log("超过上限删除", historys.length, x);
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

/**
 * 字节数转换
 * @param {number} size
 * @param {number} [n=0] 保留几位小数
 * @param {number} [i=0] 从什么开始 b/kb/mb/gb
 * @returns
 */
function traffic(size, n = 2, i = 0) {
	if (size == null) return "";
	size = parseInt(size);
	for (; i < bs.length; i++) {
		if (size < 1024) {
			return size + bs[i];
		}
		size = (size / 1024).toFixed(n);
	}
	return size + "YB";
}

function itemMap(x) {
	if (x.type == "image")
		return {
			_id: x._id,
			title: x.size || "[" + (/image\/\w+/.exec(x.data) || ["image"])[0] + "]",
			description: timestamp(new Date(x.time)) + " " + traffic(Math.floor(x.data.length * 0.75)),
			icon: x.data,
			large: true,
			click() {
				utools.copyImage(x.data);
				return true;
			},
		};
	if (x.type == "text")
		return {
			_id: x._id,
			title: x.data.slice(0, 128),
			description: timestamp(new Date(x.time)) + " " + traffic(x.data.length),
			icon: "res/text.svg",
			large: x.data.length > config.large_text,
			click() {
				utools.copyText(x.data);
				return true;
			},
		};
	if (x.type == "file")
		return {
			_id: x._id,
			title: x.data,
			description: timestamp(new Date(x.time)),
			icon: "res/file.svg",
			large: false,
			click() {
				utools.copyFile(x.data);
				return true;
			},
		};
}

function saveSnippet() {
	fs.writeFile(config.snippet_path, yaml.stringify(snippets));
}

function loadSnippet(reload) {
	if (snippets && !reload) return Promise.resolve(snippets);
	return fs.readFile(config.snippet_path, "utf8").then(
		function (text) {
			snippets = yaml.parse(text);
			return snippets;
		},
		() => {
			snippets = {};
			return snippets;
		}
	);
}

window.exports = {
	clipboard: clipboardModule,
};
