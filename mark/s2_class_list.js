/**

 - 主要清理各目录下名为 class-list.html 的文件

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


// RUN
console.time('timestamp');
run(cfg.source);
console.timeEnd('timestamp');



function run(src){
	if(src[src.length - 1] !== '/') src += "/";

	var results = fd.walk(src,/class-list\.html?$/,cfg.ignores);

	if(false){
		//results = results.slice(0,20);
	}

	make(results);
}


function make(results){

	var fstr;

	var retFile = [];

	for (var i = 0, len = results.length; i < len;  i++) {

		//
		fstr = fs.readFileSync(results[i].path + results[i].name,'utf-8');

		var left = fstr.indexOf('<body');
		if(left === -1){
			retFile.push('not find body tag --->' + results[i].path + results[i].name);
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
			retFile.push('not get file name  ===>'+results[i].path + results[i].name);
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
	fs.writeFileSync(cfg.logdir + 's2-log.txt',retFile.join('\n'),'utf8')
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