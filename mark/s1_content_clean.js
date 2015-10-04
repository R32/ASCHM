/**

 - 替换掉 *.html:: '<div class="mainright"' 之前的内容

 - 替换掉 *.html:: '<center class="copyright"' 之后的内容

 - 处理 seeAlso 外链, 不再像以前将这些清除,只是标记就行了.

 - 清理关联链接,根据 cfg.ignores 里的 目录名.

 * 完成..

 *.html 不包含 不包含 class-list.html，以及 package-list.html
*/
var template_header = '<!DOCTYPE html><html>\n\
<head>\
<meta charset="UTF-8">\
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">\
<title>{{title}}</title>\
<link rel="stylesheet" href="{{path}}style2.css" type="text/css" media="screen">\
<script src="{{path}}content2.js" type="text/javascript"></script>\
<script type="text/javascript">\n\
var baseRef = "{{path}}";\n\
</script>\n\
</head>\n\
<body>\n\
<div class="maincontainer" id="maincontainer">';

var template_footer = '<center class="copyright"> &copy; 2015 Adobe Systems Incorporated. All rights reserved. <br/>Tue Jun 23 2015, 04:14 AM -07:00 - <a class="legal" style="color:#555; " target="external" href="http://help.adobe.com/zh_CN/legalnotices/index.html">法律声明</a></center></div>\n</div>\n</div>\n<div class="footer"></div></body></html>'


// 配置
var fd = require("./comm/find.js").fd;

var cfg = require("./comm/config.js").cfg;

var fs = require("fs");

// 文件流, Log
var current_file = null;
var logs = fs.createWriteStream(cfg.logdir + "s1_log.txt");
var retFile = fs.createWriteStream(cfg.logdir + "s1_ret.txt");

function run(src){
	if(src[src.length - 1] !== '/') src += "/";
		
	var exclude = /class-list|all-index/

	var results = fd.walk(src,/html?$/,cfg.ignores);
	var filters = [];
	for(var i=0,len = results.length; i<len; i+=1){
		if(exclude.test(results[i].name)){
			logs.write("被忽略了的文件: " + results[i].path + '\t' + results[i].name + "\r\n");
			continue;
		}
		filters.push(results[i]);
	}
	results = filters;

	make(results);
}

/**
*
* 主函数
@param results{Array<Object>} {path:source_path, name:filename_without_path}
*/
function make(results){

	var fstr;

	var title_pat =/<title>([^<]*?)<\/title>/

	var path2name;

	for (var i = 0, len = results.length; i < len;  i++) {
		//
		path2name = results[i].path + results[i].name;

		current_file = path2name;	// for logs.write

		fstr = fs.readFileSync(path2name,'utf-8');

		var index = fd.index(fstr,'<div class="mainright"','<center class="copyright"',true);
		
		if(!index){
			retFile.write('由于没有匹配到模板左值和右值,这个文件将被忽略，"' + path2name + '"\r\n');
			continue;	
		}

		// 取得 title 
		var title, mat;
		mat = fstr.match(title_pat);
		if (mat && mat.length >1) {
			title = mat[1].split(" -")[0];
		}else{
			title = "";
			retFile.write('没有找到 <title>,将被设为空字符串 "' + path2name + '"\r\n');
		};
		//console.log(title);
		// 获得 path
		var path = results[i].path.replace(cfg.source,'');
		var vpath;
		mat = path.match(/\//g);
		if(mat && mat.length){
			vpath = ([''].concat(mat)).join('..');
		}else{
			vpath = '';
		}

		//console.log(path);
		var tag_header = template_header.replace('{{title}}', title ).replace(/{{path}}/g ,	vpath);

		fd.diris(path,true,cfg.output);

		fs.writeFileSync(cfg.output + path + results[i].name , tag_header + clean_relation( 
			regexp_clean(fstr.substring(index[0], index[1])),
			results[i].name,
			vpath
		) + template_footer,'utf-8');		
	};
}


/**
*	清除一些关联 cfg.ignores 的链接.
*	
*@ method clean_relation
*@ param fstr
*@ param name 文件名,不带目录
*@ param vpath 类似于 ../../../ 这样的字符串
*/
function clean_relation(fstr,name,vpath){
	var indexOf = String.prototype.indexOf;

	var ret= [];
	var whiteArray =  ['class-summary.html','package-list.html','package-summary.html','link4chm.html','index.html','index-frame.html','header.html'];
	var ignores = cfg.ignores;

	if(vpath === './') {vpath = ''; console.log("vpath is ./ ")};
	

	for(var i=0, len= whiteArray.length; i<len ; i += 1){
		if(whiteArray.indexOf(name) > -1){
			logs.write("clean_relation 白名单, 跳过:" + name + '\t' + vpath + "\r\n");
			return fstr; // 不做任何操作.
		}
	}


	var filters = null;
	for(i=0, len= ignores.length; i<len ; i += 1){
		if(indexOf.call(fstr,'="'+ vpath + ignores[i] + '/') > -1){ // 快速检测
			filters = clean_relation_sub_1(ignores,vpath);
			break;
		}
	}

	//console.log(filters);
	if(filters){
		logs.write("clean_relation 正常调用 clean_relation_primary:" + name + '\t' + vpath + "\r\n");
		fstr = clean_relation_primary(fstr, filters);
	}else{
		logs.write("clean_relation::filters 的值为 null, 跳过 :" + name + '\t' + vpath + "\r\n");
	}
	return fstr;
}

function test_clean_relation(fstr,name,vpath){
	fs.writeFileSync(cfg.logdir + 'a.html', clean_relation(fstr,name,vpath) ,'utf8');
}

/**
*
* 预处理
*/
function clean_relation_sub_1(arr,prefix){
	var ret= [];
	for(var i=0; i<arr.length; i+=1){
		ret.push(prefix + arr[i] + '/');// ../../../../com/
	}
	return ret;
}

function clean_relation_primary(fstr,filters){
	var tagA = cfg.clean.tagA;	// /<a([^>]*?)>((?:.|\s)*?)<\/a>/g
	
	var list_e = [];	// list RegExp
	
	for(var i=0, len = filters.length; i < len; i += 1){
		list_e.push( new RegExp('href="' + filters[i].replace(/(\.|\/)/g,'\\$1')) );
	}
	//console.log(list_e);
	return fstr.replace(tagA,function($_,$1,$2){
		var find = false;
		for(var i=0; i < len; i+=1){	// 外部的 len 
			if(list_e[i].test($1)){
				find = true;
				break;	
			}
		}
		//return find ? "" : $_;
		return find ? '<i class="depr">'+ $2 +'</i>' : $_; 
	})//.replace(/(,\s*)+/g,'$1') // 合并多个逗号
}



var clean = {
	//a1: escape_url_to_reg('<a href="http://help.adobe.com/en_US/Flex/4.6/UsingSDK/WS2db454920e96a9e51e63e3d11c0bf69084-7ee9.html" target="_blank">单击此处了解有关事件的更多信息</a>','g'),
	//a2: escape_url_to_reg('<span class="usage"><a href="http://www.adobe.com/go/learn_as3_usingexamples_cn"> 如何使用本示例 </a></span>','g'),
	usage: /<span class="usage">.*?<\/span>/g,

//	usage_sub: /示例 &nbsp;\(\s+\)/g,
	
	onclick: /\sonclick=\"[^"]+\"/gi
};

/**
 1. 给 http 以起始的的A标签添加 outlink , 并且 target 设为 external

  - 虽然 localhost 也是以 http 开头的,但在源码中并非这样
 
 2. 移除A标签的所有 onclick 属性

@param tag{String}	`<a>` 整个 A 标签
@param attrs{String} `<a(attrs)>` 对应 config.tagAAttr
@param pos{Int} 
@return {String}
*/
function handlerTagA(tag,attrs,pos) {
	var ret = tag;
	if (attrs.indexOf('href="http') !== -1) {
		var index = fd.index(attrs, "http", '"');
		var href = index ? (' href="' + attrs.slice(index[0], index[1]) + '"') : " ";
		//ret = '<a' + (href || attrs) + ' class="outlink" target="external">';
		ret = '<a' + (href || attrs) + ' target="external">';
	}
	ret = ret.replace(clean.onclick, "");
	if (tag != ret) logs.write('handlerTagA: "' + current_file + '" pos:' + pos + ",org:" + tag + ", new: " + ret + "\r\n");		// 注释掉这条是因为导到内存不够,也许需要用流的形式写 Log
	return ret;
}


/**

@param fstr{String}
@param fname{String} 仅用于输出 Log
@return {String}
*/
function regexp_clean(fstr) {
	var handler = fd.outerTag;
	var ret = handler(fstr, "0bf69084-7ee9.html", "a", null, current_file);			// <a href="http://help.adobe.com/en_US/Flex/4.6/UsingSDK/WS2db454920e96a9e51e63e3d11c0bf69084-7ee9.html" target="_blank">单击此处了解有关事件的更多信息</a>

	ret = handler(ret, "www.adobe.com/go/learn_as3_usingexamples", "span", null, current_file);		// .replace(clean.usage, "");
				
	return handler(ret, "示例 &nbsp;", "span", function () { return '<span class="label">示例 &nbsp;</span>' }, current_file)
			.replace(cfg.clean.html_comment, "")				// html 注释
			.replace(cfg.clean.pnp_ns, "")
			.replace(cfg.clean.tagAAttr, handlerTagA);
}


function escape_url_to_reg(str,ex){
	if(!ex) ex = "";
	return new RegExp(str.replace(/(\.|\/|\?|\+)/g,'\\$1'),ex);
}



// main
console.time('timestamp');
//test_clean_relation(fs.readFileSync('../chm/mx/core/Application.html','utf-8'),'Application.html','../../');
switch(cfg.args[0]){
	case "test":
		var resdir = cfg.output;
		cfg.output = cfg.logdir;
		make([
			{path:cfg.source ,name:'Boolean.html'}, 
			{path:cfg.source ,name:'XML.html'},
			{path:cfg.source + "/flash/utils/" ,name:'Timer.html'},
			{path:cfg.source ,name:'package-detail.html'}
		]);
		cfg.output = resdir;
		break;
	case "index": // regenerate index.html
		make([{path:cfg.source ,name:'index.html'}])
		break;
	default: run(cfg.source);
		break;	
}
logs.end();
retFile.end();
console.timeEnd('timestamp');
