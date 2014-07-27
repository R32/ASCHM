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

var tag_footer = '<center class="copyright"> &copy; 2013 Adobe Systems Incorporated. All rights reserved. <br/>Mon Jul 7 2014, 08:39 AM -07:00 - <a class="legal" style="color:#555; " target="external" href="http://help.adobe.com/zh_CN/legalnotices/index.html">法律声明</a></center></div>\n</div>\n</div>\n<div class="footer"></div></body></html>'


// 配置
var fd = require("./comm/find.js").fd;

var cfg = require("./comm/config.js").cfg;

var fs = require("fs");

var logs = [];



function run(src){
	if(src[src.length - 1] !== '/') src += "/";
		
	var exclude = /class-list|all-index/

	var results = fd.walk(src,/html?$/,cfg.ignores);
	var filters = [];
	for(var i=0,len = results.length; i<len; i+=1){
		if(exclude.test(results[i].name)){
			logs.push("忽略掉了的文件: " + results[i].path + '\t' + results[i].name);
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
*/
function make(results){

	var fstr;

	var title_pat =/<title>([^<]*?)<\/title>/

	var retFile = [];

	for (var i = 0, len = results.length; i < len;  i++) {
		//
		fstr = fs.readFileSync(results[i].path + results[i].name,'utf-8');

		var index = fd.index(fstr,'<div class="mainright"','<center class="copyright"',true);
		
		if(!index){
			retFile.push('跳过 no match left and right --' + results[i].path + results[i].name);
			continue;	
		}

		// 取得 title 
		var title, mat;
		mat = fstr.match(title_pat);
		if (mat && mat.length >1) {
			title = mat[1].split(" -")[0];
		}else{
			title = "";
			retFile.push('no match title  ->'+results[i].path + results[i].name);
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
			regexp_clean( fstr.substring(index[0],index[1]) ),
			results[i].name,
			vpath
		) + tag_footer,'utf-8');		
	};
	fs.writeFileSync(cfg.logdir + 's1_make_log.txt',retFile.join('\n'),'utf8');
	fs.writeFileSync(cfg.logdir + 's1_glob_log.txt',logs.join('\n'),'utf8');
}

/**
*
* 使用 cfg.clean.tagA 作为匹配
*/
function clean_event_handler($_){
	return /onclick/i.test($_) ? $_.replace(/\sonclick=\"[^"]+\"/i,'') : $_;
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
			logs.push("clean_relation 未做任何操作:" + name + '\t' + vpath);
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
		logs.push("clean_relation 正常调用 clean_relation_primary:" + name + '\t' + vpath);
		fstr = clean_relation_primary(fstr, filters);
	}else{
		logs.push("clean_relation filters 为 null :" + name + '\t' + vpath);
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



/**
*	使用 正则表达式过滤  
* @param fstr{String}
* @return {String} 
*/
var cl_1 = escape_url_to_reg('<a href="http://help.adobe.com/en_US/Flex/4.6/UsingSDK/WS2db454920e96a9e51e63e3d11c0bf69084-7ee9.html" target="_blank">单击此处了解有关事件的更多信息</a>','g');
var cl_2 = escape_url_to_reg('<span class="usage"><a href="http://www.adobe.com/go/learn_as3_usingexamples_cn"> 如何使用本示例 </a></span>','g');
//var cl_3 = escape_url_to_reg();
function regexp_clean(fstr){
	// RegExp

	// 
	return fstr.replace(cl_1,'').replace(cl_2,'').replace(/示例 &nbsp;\(\s+\)/g,'示例 &nbsp;')
		.replace(cfg.clean.html_comment,'')				// html 注释
			.replace(cfg.clean.seeAlso,'<span class="classHeaderTableLabel">更多示例(Adobe 链接):</span>')	// seeAlso 不再清除外链,只是标记就行了
				.replace(cfg.clean.seeAlso_2,'<span class="classHeaderTableLabel">了解详细信息(Adobe 链接):</span>')
					.replace(cfg.clean.pnp_ns,'')				
						.replace(cfg.clean.tagAL,clean_event_handler)
}

function escape_url_to_reg(str,ex){
	if(!ex) ex = "";
	return new RegExp(str.replace(/(\.|\/|\?|\+)/g,'\\$1'),ex);
}





// RUN
console.time('timestamp');
//test_clean_relation(fs.readFileSync('../chm/mx/core/Application.html','utf-8'),'Application.html','../../');
run(cfg.source);
//make([{path:cfg.source ,name:'index.html'}])
//make([{path:cfg.source ,name:'Boolean.html'},{path:cfg.source ,name:'package-detail.html'}])
console.timeEnd('timestamp');