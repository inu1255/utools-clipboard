const asar = require("asar");
const fs = require("fs");
const zlib = require("zlib");

asar.createPackage(process.argv[2], "_tmp").then((x) => {
	fs.createReadStream("_tmp")
		.pipe(zlib.createGzip())
		.pipe(fs.createWriteStream("out.upx"))
		.once("close", function () {
			fs.unlink("_tmp", function () {
				console.log("ok");
			});
		});
}, console.error);
