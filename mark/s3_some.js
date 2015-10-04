/**
 - 这里单独处理几个特殊文件. 标记为 [deprecated] 为旧文档,这里不用做这些.
 
  - package-list.html   

  - [deprecated]class-summary.html -- header.html 不再添加这个链接

  - [deprecated]package-summary.html -- header.html 不再添加这个链接

  - [deprecated]all-classes.html -- 已经使用 hhk索引文件替换这个

  - ??? whatsnew.html 这二个文件 s1 已经一起处理了

  - deprecated.html s1_content_clean.js 已经处理了大部分了,但还有二个链接

  - [deprecated] mxml-tag-detail.html 不用做

  - ?????[deprecated] com.adobe.viewsource 这个类,不清楚以前为什么要添加的原因??? 

  - 构建 hhc 文件和创建 chm link 由 s4_link.js  来完成.
**/

// 配置
var fd = require("./comm/find.js").fd;

var cfg = require("./comm/config.js").cfg;

var fs = require("fs");


function run(source,output){
	c_pkg();	// package-list.html 	
	c_pkg.c_append();	//appendixes.html
	c_deprecated()	//deprecated.html, s1_conent_clean.js 已经处理了一部分,但有二个怪异的链接.	
}



/**
*	处理 package-list.html(框架左上角文件)
*	除了这个文件之外还需要处理 和 package-list.html 关联的附录. 
    
    >由于第一步(s1_xxx.js)已经做好一些处理了.替换 外链就行了.appendixes.html
* 
*/
function c_pkg(){
	var fname = 'package-list.html';
	var fstr = fs.readFileSync(cfg.source + fname,'utf-8');
	fstr = c_pkg.cf(fstr);	//
	fs.writeFileSync(cfg.output + fname,c_pkg.cc(fstr),'utf-8');
}

// 移除 ignores 的链接关系
c_pkg.cc = function(fstr){
	// 替换 header 部
	var left = fstr.indexOf('顶级');
	if(left === -1){
		throw "不正确的文件"
	}

	var pats = [];
	for(var i=0,len= cfg.ignores.length; i<len; i+=1){
		// 这里的类全都是顶级目录
		pats.push( new RegExp('href="'+(cfg.ignores[i] + '/').replace(/(\.|\/)/g,'\\$1'))	);
	}
	//console.log(pats);
	// 清除 链接关系
	fstr = c_pkg.html_header + fstr.substring(left).replace(/<tr[^>]+>((?:.|\s)*?)<\/tr>/g,function($_ , $1){
		var find = false;
		for(i=0; i < len; i++){
			if(pats[i].test($1)){
				find = true;
				break
			}
		}
		return find ? '' : $_;
	});
	return fstr.replace('</body>',c_pkg.html_footer + '</body></html>');
}


// 移除 onclick contextmenu, 在 href 上写上正确的值
// 过滤 <a> 标签的值,只返回需要的值
c_pkg.cf = function(fstr){
	var http_pat = 'http:'
	return fstr.replace(cfg.clean.tagAL,function($_){
		var mat;
		mat = $_.match(/\'([^']+)\'/);	// 直接匹配 '' 内的字符就行了.
		if(mat && /\w+$/.test(mat[1])){
			if(mat[1].indexOf('http:') === 0){
				$_ = '<a class="noqsearch outlink" target="_blank" href="'+ mat[1]  +'">'
			}else{
				$_ = '<a href="'+ mat[1]  +'">'
			}
		}else{
			console.log($_);
			$_ = c_pkg.cf_end($_);
		}
		return $_;
	});
}
c_pkg.html_header = fs.readFileSync('./custom/_include/package-list-header','utf-8');
c_pkg.html_footer = fs.readFileSync('./custom/_include/package-list-footer','utf-8');

// 处理与 package-list.html 相关联的 appendixes.html ,将外链用另一种颜色标记并且设置 target="_blank"
// s1_content_clean.js 第 45 可以单独生成一些文件
c_pkg.c_append = function(){
	var name ='appendixes.html'
	var fstr = fs.readFileSync(cfg.output + name,'utf-8');
	
	if(fstr.indexOf(cfg.modifed,fstr.length - cfg.modifed.length) === -1){
		fstr = fstr.replace(cfg.clean.tagAL,function($_){
			var mat;
			mat = $_.match(/href="([^"]*?)"/);
			if(mat && mat[1].indexOf('http') > -1){
				$_ = '<a style="color:#ff4800" target="_blank" href="'+ mat[1]  +'">'
			}
			return $_;
		})
		fs.writeFileSync(cfg.output + name ,fstr + cfg.modifed,'utf8');
		console.log('Saved: '+ cfg.output + name);	
	}else{
		console.log(name + " 已经修改过了..不用重复");
	}
}
c_pkg.cf_end = function(str){
	return str.replace(' target="_self"','')	//target="classFrame"
		.replace(/\soncontextmenu=\"[^"]+\"/,'')
			.replace(/\sonclick=\"[^"]+\"/,'')
}




function clean_relation(srcpath,outpath,name){
	// 从已经处理过一次的 cfg.output 取文件
	var fstr = fs.readFileSync(srcpath + name,'utf-8');
	if(fstr.indexOf(cfg.modifed,fstr.length - cfg.modifed.length) === -1){
		var pats = [];
		for(var i=0,len= cfg.ignores.length; i<len; i+=1){
			pats.push( new RegExp('href="'+(cfg.ignores[i] + '/').replace(/(\.|\/)/g,'\\$1'))	);
		}

		fstr = fstr.replace(cfg.clean.tagA,function($_, $1, $2){
			var find = false;
			for(i=0; i < len; i+=1){

				if(pats[i].test($1)){
					find = true;
					break;
				}
			}
			return find ? '<i class="depr">'+ $2 +'</i>' : $_ ;
		});
		fs.writeFileSync(outpath + name ,fstr + cfg.modifed,'utf8');
		console.log("write: " + cfg.output + name);
		//fs.writeFileSync(cfg.logdir + 's3_some_cc.log' ,ll.join("\n"),'utf8');
	}else{
		console.log(name + " 已经修改过了..不用重复");
	}
}


/**
*	处理 whatsnew.html
* 
*/
function c_whatnew(){
	var name = 'whatsnew.html';
	// 从已经处理过一次的 cfg.output 取文件
	clean_relation(cfg.output,cfg.output,name)
}

/**
*	处理 deprecated.html
*  `deprecated.html` 页面 addHandlers addSuccessHandler/addFaultHandler 这二个怪异的链接..会出错官方也链接出错.
*/
function c_deprecated(){
	var name = 'deprecated.html';
	// 从已经处理过一次的 cfg.output 取文件
	//clean_relation(cfg.output,cfg.output,name)
	var fstr = fs.readFileSync(cfg.output + name,'utf-8');
	fstr = fstr.replace('<A href="../../../../#addHandlers">addHandlers</A>','<i class="depr">addHandlers</i>')
		.replace('<A href="../../../../#or addSuccessHandler/addFaultHandler">or addSuccessHandler/addFaultHandler</A>','<i class="depr">or addSuccessHandler/addFaultHandler</i>')
	fs.writeFileSync(cfg.output + name ,fstr,'utf8');
}







// RUN
console.time('timestamp');
run(cfg.source, cfg.output, true);
console.timeEnd('timestamp');