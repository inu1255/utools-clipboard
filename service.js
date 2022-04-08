const clipboardListener = require("clipboard-event");

// To start listening
clipboardListener.startListening();
clipboardListener.on("change", () => {
	let item = pbpaste();
	if (!item) return;
	item._id = crypto.createHash("md5").update(item.data).digest("hex");
	item.time = Date.now();
	for (let i = 0; i < historys.length; i++) {
		let x = historys[i];
		if (x._id == item._id) {
			historys.splice(i--, 1);
		}
		if (i > 100 && x.large) {
			historys.splice(i--, 1);
			utools.db.remove(x._id);
			console.log("内容太大删除", i, x);
		}
	}
	historys.unshift(itemMap(item));
	window.exports.clipboard.args.placeholder = "搜索(" + historys.length + ")条";
	utools.db.put(item);
	if (historys.length > 5000) {
		let x = historys.pop();
		utools.db.remove(x._id);
		console.log("超过5000条删除", historys.length, x);
	}
});

function pbpaste() {
	let file;
	// if (utools.isWindows()) {
	// 	const rawFilePath = clipboard.readBuffer("FileNameW").toString("ucs2");
	// 	file = rawFilePath.replace(new RegExp(String.fromCharCode(0), "g"), "");
	// } else if (remote.process.platform == "darwin") {
	// 	file = clipboard.read("public.file-url").replace("file://", "");
	// }
	if (file) return {type: "file", data: file};
	let image = clipboard.readImage();
	if (!image.isEmpty()) return {type: "image", data: image.toDataURL()};
	let text = clipboard.readText();
	if (text.trim()) return {type: "text", data: text};
}
