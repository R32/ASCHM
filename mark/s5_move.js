/**
将一些文件移动到 目标文件夹.

 1. 将 output/index.html 更名为 index-frame.html
 
 2. 移动 custom 的文件到 output 中去,不包括子目录
 
  - 检测时间值来确定是否需要更新

*/
var fd = require("./comm/find.js").fd;

var cfg = require("./comm/config.js").cfg;

var fs = require("fs");

var count = 0;
// RUN
console.time('timestamp');
run();
check();

function run(){
	var yuic = null;
	try{
		yuic = require('yuicompressor');
	}catch(err){}

	// 如果丢失 index.html 可以先执行 s1_content_clean.js 的 第 246 行 make([{path:cfg.source ,name:'index.html'}])
	if(!fs.existsSync(cfg.output + 'index-frame.html')){

		if(fs.existsSync(cfg.output + 'index.html')){
			var fstr = fs.readFileSync(cfg.output + 'index.html','utf-8');
			if(fstr.lastIndexOf(cfg.modifed) === -1){
				fs.writeFileSync(cfg.output + 'index-frame.html',fstr.replace(/target="_top"/g,'target="_self" onclick="return top.setFiltersWithURL(event);"')
			.replace(/href="index\.html\?/g,'href="index-frame.html?') ,'utf-8');
				console.log("save as index-frame.html");
			}else{
				throw "index-frame.html is missing";
			}
		}
	}

	// filters.xml 文件, 已经内嵌到 shim.js
	//if(!fs.existsSync(cfg.output + 'filters.xml')){
	//	fs.createReadStream(cfg.source + 'filters.xml').pipe(fs.createWriteStream(cfg.output + 'filters.xml'));	
	//}

	// 排除不需要 压缩的 脚本.
	var exclude = {
		'prettify.js' : 1,
		'jquery-min.js': 1
	}

	var sdir = "./custom/";
	var list = fs.readdirSync(sdir);
	var stat, dtat;
	var src, dst;
	var ext;
	for(var i=0, len = list.length; i<len; i++){

		src = sdir + list[i];

		dst = cfg.output + list[i];

		stat = fs.statSync(src);

		if(stat.isDirectory()) continue;

		ext = list[i].split('.').pop();		// 文件扩展名.
		if(list[i] in exclude){
			ext = "";
		}

		dtat = fs.existsSync(dst) ? fs.statSync(dst) : null;
		
		if(dtat && dtat.mtime.getTime() > stat.mtime.getTime()){
			console.log(dst + " is already up to time");
			continue;
		}

		if(yuic && (ext === 'js' || ext === 'css')){
			yuic.compress(src,{
				charset:'utf8',
				type: ext
			},  warp(sdir,list[i]) );
		}else{
			fs.createReadStream(src).pipe(fs.createWriteStream(dst));
			console.log(src + ' ---> ' + dst);
		}
	}
}


function check(){
	if(count == 0){
	console.timeEnd('timestamp');
		count = -1;
	}
}

function warp(path,name){
	count++;
	return function(err,data,extra){
		if(!err){
			fs.writeFileSync(cfg.output + name,data);
			console.log(path + name + ' compressor ---> ' + cfg.output + name);
		}else{
			console.log(err);
		}
		count--;
		check();
	}
}
