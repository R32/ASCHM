/**

 - 主要清理各目录下名为 class-list.html 的文件,即 框架左下的页面

 - 清除 所有 A 标签的 onclick contextmenu 事件

 - 清除一些注释,和命名空间.

 - 替换 head 标签.

*/
var template_header = '<!DOCTYPE html><html>\n\
<head>\
<meta charset="UTF-8">\
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">\
<link rel="stylesheet" href="{{path}}classes2.css" type="text/css" media="screen" />\
</head>\n';



// 配置
var fd = require("./comm/find.js").fd;

var cfg = require("./comm/config.js").cfg;

var fs = require("fs");

var logs = fs.createWriteStream(cfg.logdir + "s2_log.txt");

// RUN


function run(src){
	if(src[src.length - 1] !== '/') src += "/";

	var results = fd.walk(src,/class-list\.html?$/,cfg.ignores);

	make(results);
}


function make(results){

	var fstr;

	var path2name;

	for (var i = 0, len = results.length; i < len;  i++) {

		path2name = results[i].path + results[i].name;

		fstr = fs.readFileSync(path2name,'utf-8');

		var left = fstr.indexOf('<body');
		if(left === -1){
			logs.write('没有找到 <body 标签, 将忽略: ' + path2name + '\r\n');
			continue;	
		}
		
		var path = results[i].path.replace(cfg.source,'');
		var vpath;
		var mat = path.match(/\//g);
		if(mat && mat.length){
			vpath = ([''].concat(mat)).join('..');
		}else{
			vpath = '';
		}

		if(!results[i].name){
			logs.write('没有文件名(是个目录?): ' + path2name + + '\r\n');
			continue;
		}

		//console.log(path);
		var tag_header = template_header.replace(/{{path}}/g ,	vpath);

		fd.diris(path,true,cfg.output);

		// 原始的 class-list.html 没有 html 和 head 标签,但是这里全加上了.所以</body> 替换成 </body></html>
		fstr = clear_a_evt( fstr.substring(left) ).replace('</body>',
		'<script src="{{path}}classes2.js" type="text/javascript"></script></body></html>'.replace('{{path}}',vpath)
		);

		fs.writeFileSync(cfg.output + path + results[i].name , tag_header + fstr, 'utf-8');
	};
}


function clear_a_evt(fstr){
	return 	some(fstr).replace(/<a\s[^>]+>/g,_onReplace_1);
}

function _onReplace_1($_){
	return $_.replace(' target="_self"','')
		.replace(/\soncontextmenu=\"[^"]+\"/,'')
			.replace(/\sonclick=\"[^"]+\"/,'')
}

function some(fstr){
	return fstr.replace(cfg.clean.html_comment,'')
		.replace(cfg.clean.pnp_ns,'')
}

// main
console.time('timestamp');
switch (cfg.args[0]) {
	case "test":
		var resdir = cfg.output;
		cfg.output = cfg.logdir;
		make([
			{ path: cfg.source, name: 'class-list.html' },
			{ path: cfg.source + "/flash/events/", name: 'class-list.html' },
			{ path: cfg.source + "/flash/utils/", name: 'class-list.html' },
			{ path: cfg.source + "/flash/display/", name: 'class-list.html' }
		]);
		cfg.output = resdir;
		break;
	default: run(cfg.source);
		break;
}
logs.end();
console.timeEnd('timestamp');