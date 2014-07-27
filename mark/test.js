

// 配置
var fd = require("./comm/find.js").fd;

var cfg = require("./comm/config.js").cfg;

var fs = require("fs");


// RUN
console.time('timestamp');
run(cfg.source, cfg.output, true);
console.timeEnd('timestamp');

function run(source,output){
	
	console.log(cfg.args)
}
