/**

将一些文件移动到 目标文件夹.

由于使用了一些异步方法,不要在 makefile 文件中调用这个文件,因为不同步.

**/
var fd = require("./comm/find.js").fd;

var cfg = require("./comm/config.js").cfg;

var fs = require("fs");


// RUN
console.time('timestamp');
run();
console.timeEnd('timestamp');

function run(){
	
	// 将 index.html 改名为 index-frame.html
	// 这里小心 不要将 框架的 index.html 改名为 index-frame.html
	// 如果丢失 index.html 可以先执行 s1_content_clean.js 的 第 45 行.
	// 也许需要写一个 makefile 来关联文件,,算了..
	if(!fs.existsSync(cfg.output + 'index-frame.html')){

		if(fs.existsSync(cfg.output + 'index.html')){
			fs.renameSync(cfg.output + 'index.html',cfg.output + 'index-frame.html');
		}

		var fstr = fs.readFileSync(cfg.output + 'index-frame.html','utf-8');
		fs.writeFileSync(cfg.output + 'index-frame.html',fstr.replace(/target="_top"/g,'target="_self" onclick="return top.setFiltersWithURL(event);"')
			.replace(/href="index\.html\?/g,'href="index-frame.html?')

		,'utf-8');
		console.log("modify index-frame.html");
	}
	
	// filters.xml 文件
	if(!fs.existsSync(cfg.output + 'filters.xml')){
		fs.createReadStream(cfg.source + 'filters.xml').pipe(fs.createWriteStream(cfg.output + 'filters.xml'));	
	}

	var yuic = require('yuicompressor');
	// 排除不需要 压缩的 脚本.
	var exclude = {
		'prettify.js' : 1,
		'jquery-min.js': 1
	}

	var mov_src = './custom/';
	var list = fs.readdirSync(mov_src);
	var stat;
	var ext;
	for(var i=0, len = list.length; i<len; i++){

		stat = fs.statSync(mov_src + list[i]);

		if(stat.isDirectory()){
			continue;
		}

		ext = list[i].split('.').pop();		// 文件扩展名.
		if(list[i] in exclude){
			ext = "";
		}

		if(ext === 'js' || ext === 'css'){
			yuic.compress(mov_src + list[i],{
				charset:'utf8',
				type: ext
			},  warp(mov_src,list[i]) );	
		}else{
			fs.createReadStream(mov_src + list[i]).pipe(fs.createWriteStream(cfg.output + list[i]));
			console.log(mov_src + list[i] + ' ---> ' + cfg.output + list[i]);
		}

		
		
	}

}

/**
*
*/
function warp(path,name){
	return function(err,data,extra){
		if(!err){
			fs.writeFileSync(cfg.output + name,data);
			console.log(path + name + ' compressor ---> ' + cfg.output + name);
		}else{
			console.log(err);
		}
	}
}
