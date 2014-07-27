/**
* - 创建 CHM 需要的 link4chm.html 文件
* - 复制所有图片 到目标文件夹下.
* - 扫描 创建 links-relation.html
* - 扫描 创建 索引
* - 状态: 能正常工作
* - 这个 文件放在任意一个步骤都行,并不是 第 4 步..
*/

var tp_html = '<html xmlns="http://www.w3.org/1999/xhtml"><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8" /><title>all classes</title><style type="text/css">html,body{height:100%; font-size:13px; background-color:#FFF}</style><script type="text/javascript">var ready=true;</script></head>\n<body><object id=hhctrl_ac type="application/x-oleobject" classid="clsid:adb880a6-d8ff-11cf-9377-00aa003b7a11" codebase="hhctrl.ocx#Version=5,2,3790,4110" width=100% height=100%>\n<param name="Command" value="Index" />\n<param name="Item1" value="all-classes-h.hhk" /></object>\n</body></html>';
var tp_hhc = '<!DOCTYPE HTML PUBLIC "-//IETF//DTD HTML//EN"><html><head><!-- Sitemap 1.0 --></head><body><object type="text/site properties"><param name="FrameName" value="classFrame"></object><ul>\n{{context}}</ul>\n</body></html>';
var tp_hhc_li = '<li><object type="text/sitemap">\n<param name="Name" value="{{label}}" />\n<param name="Local" value="{{link}}" /></object></li>';	

// 配置
var fd = require("./comm/find.js").fd;

var cfg = require("./comm/config.js").cfg;

var fs = require("fs");


// RUN
console.time('timestamp');
run();
console.timeEnd('timestamp');


function run(){
	copy_dir(cfg.source, cfg.output, 'images');
	build_link();
	build_index();
}

// 简单目录文件复制,不包含子目录..
function copy_dir(src,dst,name){
	var pf = dst + name + '/';
	var spf = src + name + '/';

	if(!fs.existsSync(spf)){
		console.log(spf +"\t源目录不存在!");
		return; 
	}

	if(!fs.existsSync(dst + name)){
		
		fs.mkdirSync(pf);

		var list = fs.readdirSync(spf);

		for(var i=0, len = list.length; i<len; i+=1){
			fs.createReadStream(spf + list[i]).pipe(fs.createWriteStream(pf + list[i]));
		}

		console.log(pf +"\t copy "+ len +" file Completed!");
	}else{
		console.log(pf +"\t目录已经存在!");
	}
}

// 为 CHM 创建一些链接...将 class-list.html 和 图片扫描进去就行了
function build_link(){
	var ret = [];

	var tp = '<a href="{{url}}">0</a>';

	var results = fd.walk(cfg.source,/(class-list\.html?$)|(png|jpg|swf|gif)$/,cfg.ignores);

	var path
	for (var i = 0,len = results.length; i < len; i++) {
		path = results[i].path.replace(cfg.source, '');
		ret.push(tp.replace("{{url}}", path + results[i].name));
	};
	
	ret.push(tp.replace("{{url}}", path + 'shim.swf'));	// 

	fs.writeFileSync(cfg.output + 'link4chm.html','<html><head></head><body><a href="all-classes-h.hhk">0</a><a href="filters.xml">0</a><a href="log.z">0</a><a href="mxml-tags.html">0</a><a href="mxml/package-detail.html">0</a>\n' + ret.join('\n') + '\n</body></html>','utf-8')
}

// 创建 CHM 用的文件索引..
function build_index(){
	var push = Array.prototype.push;
	var split = String.prototype.split;
	var lastIndexOf = String.prototype.lastIndexOf;


	// 单独一个一 all-classes 文件. 从这个文件里扫描 class 
	var ret = hhk_classes();

	// 接下来只扫描 class-list.html 内的 函数 就行了
	var results = fd.walk(cfg.source,/class-list\.html?$/,cfg.ignores);
	var fstr;
	var path;
	var rmat = [];
	var label;
	for (var i = 0,len = results.length; i < len ; i+=1 ) {
		
		fstr = fs.readFileSync(results[i].path + results[i].name,'utf-8');

		path = results[i].path.replace(cfg.source, '');

		rmat.length = 0;
		rmat = hhk_func(fstr);
		if(rmat && rmat.length){
			for(var j=0,lenj=rmat.length; j < lenj; j+=1){
				label = split.call(rmat[j],'#')[1];
				if(label && lastIndexOf.call(label,'Summary')===-1){
					ret.push(	tp_hhc_li.replace('{{label}}',label).replace('{{link}}',path + rmat[j])	);	
				}
			}

		}
	}
	fs.writeFileSync(cfg.output + 'all-classes-h.hhk', tp_hhc.replace('{{context}}',ret.join('\n')),'utf8');//注意这个文件名与 tp_html 中 param 的匹配
	fs.writeFileSync(cfg.output + 'all-classes-m.html', tp_html,'utf8');//直接写字符串	

}

/**
*  查找 前缀为 package.html 的链接.找出函数
* @method hhk
* @param fstr{String}
* @return {String}
*/
function hhk_func(fstr){
		var lastIndexOf = String.prototype.lastIndexOf;
		var ret = [];
		var pat_href = 	/\shref=\"([^"]+)\"/; // 空标签
		var hmat,mat = fstr.match( cfg.clean.tagAAttr );
		if(mat && mat.length){
			for(var i=0,len =mat.length; i<len; i+=1 ){
				hmat = mat[i].match(pat_href);
				if(hmat){
					if(lastIndexOf.call(hmat[1],'package.html') > -1){
						ret.push( hmat[1] );
					}	
				}
			}
		}
		return ret;
}

/**
*
* @method hhk_classes 从原始的 all-classes.html 解析报有的 类,因为这个文件是排好序了的.
* @return {Array}
**/
function hhk_classes(){
	var indexOf = String.prototype.indexOf;
	var split = String.prototype.split;
	var ret = [];
	var fstr = fs.readFileSync(cfg.source + 'all-classes.html','utf-8');

	var attr_title = /title="([^"]*?)"/;	// 

	var exclude = cfg.ignores;
	var exclude_files = [];

	var hmat,mat = fstr.match( cfg.clean.tagAAttr );


	if(mat && mat.length){
		var lenj = exclude.length;
		outer:for(var i=0,len =mat.length; i<len; i+=1 ){
			hmat = mat[i].match(attr_title);
			if (hmat && hmat.length) {
				for(var j=0; j < lenj; j+=1){
					if (indexOf.call(hmat[1],exclude[j] + '.') === 0) {
						exclude_files.push("exclude: "+ hmat[1]);	
						continue outer;	
					};	
				}
				hmat = split.call(hmat[1],'.');
				ret.push(tp_hhc_li.replace('{{label}}',hmat[hmat.length - 1]).replace('{{link}}', hmat.join('/')+'.html'));
			};	

		}
	}
	fs.writeFileSync(cfg.logdir + "s4_hhk.log", exclude_files.join("\n"),'utf8');//直接写字符串	
	return ret;
}