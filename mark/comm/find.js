/**
*
*
* find
*	查找内容是否包含
	
	用来查找 是否包含某一个 html链接
*/

var fs = require('fs');

	
/**
*	存一些 正则 表达式
* @Property rep
* @type {map}
*/
var rep = {
	
	/**
	*	tag A Attributes 匹配 <  > 之间的字符串,
	* @Property innerTag
	*/
	innerTag	: /<[a-zA-Z]+([^>]*?)>/g,
	
	/**
	*	tag A innerHTML $1 = > Attrs,$2 => innerHTML
	* @Property outerTag	
	**/
	outerTag	: /<a([^>]*?)>((?:.|\s)*?)<\/a>/g,	
	/**
	*	清除 'sxmlns:xd="http://www.pnp-software.com/XSLTdoc"'
	*	要在 < > 标签内匹配 主要用来清除,
	* @Property clear_xmlns
	* @type {RegExp}
	*/
	clear_xmlns : /\sxmlns:xd="[^"]+"/		// 
}

var utils = {
	/**
	*	转义一些字符串,  还不知道该转换哪些??
	* @method grescape
	* @param str{String}
	* @return {String}
	*/
	grescape	: function(str){
		return str.replace(/\\/g,'\\\\')//replace(/(\\)/g,'\\$1')
	},
	
	/**
	*	返回一个正则表达式, 例如 : grAttrs('a','g') 将返回 /<a([^>]*?)>/g
	* @method grAttrs
	* @param tag{String}  div , a , span 之类的标签名
	* @param ex{String} 正则表达式扩展属性  i 表示 忽略大小写 , g 全示全部  ig
	* @return {RegExp} 
	*/
	grAttrs : function(tag , ex){
		return new RegExp('<'+tag+'([^>]*?)>' ,	ex);
	}	,
	
	
	/**
	*	返回一个正则表达式, 例如 : grInner('a','i') 将返回 /<a([^>]*?)>((?:.|\n)*?)<\/a>/i
	* 注意: 正则无法识别嵌套的标签, 处理嵌套一般用  indexOf lastIndexOf 来配合查找
	* @method grInner
	* @param tag{String}  div , a , span 之类的标签名
	* @param ex{String} 正则表达式扩展属性  i 表示 忽略大小写 , g 全示全部  ig
	* @return {RegExp} 
	*/
	grInner	: function(tag	, ex){
		return new RegExp('<'+ tag + '([^>]*?)>((?:.|\\s)*?)<\\/'	+ tag + 	'>'
			,ex	);
	},
	
	
	/**
	在 fstr 中查找 sub 内容, 如果存在,则向上查找其 tagName, 
	
	注意不支持嵌套的 tag 识别, 不支持大小写识别
	
	@param fstr
	@param sub{String}
	@param tagName{String} e.g: span
	@param [callb]{Function} String->String如果存在 callb,则传递给 callb 处理, 否则清除所有
	@param [fname]{String} 当 error 时, 确定是哪个文件
	@return {String}
	*/
	outerTag: function(fstr, sub, tagName, callb, fname){
		var tagL = "<" + tagName;
		var tagR = "</" + tagName + ">";
		var tagP = tagR.length;

		var seek, pl; 			// posiion
		var pr = 0; 			// postion pr init
		
		var ret = [];
		var error = false;
		
		var indexOf = String.prototype.indexOf;
		var lastIndexOf = String.prototype.lastIndexOf;
		var slice = String.prototype.slice;

		while((seek = indexOf.call(fstr, sub, pr)) !== -1){

		    pl = lastIndexOf.call(fstr, tagL, seek);                    // seek 处往左

			if(pl !== -1) ret.push( slice.call(fstr, pr, pl) );			// 获得左边数据

			pr = indexOf.call(fstr, tagR, seek);                        // seek 处往右

			if(pl ===  -1 || pr === -1){
				console.log('waring: clearSpec('+ (fname || "fstr") +', "' + sub + '", "' + tagName + '")');
				error = true;
				break;
			}

			pr += tagP;

			if(callb) ret.push( callb( slice.call(fstr, pl, pr) ) );	// 获得 call 返回值, 或者什么也不要
		}

		var empty = ret.length === 0;

		if(!empty) ret.push(slice.call(fstr, pr));

		return (error || empty) ? fstr : ret.join("");
	},
	
	/**
	*	返回 一个数组,记当 leftStr 到 rightStr 的 indexOf 
	* 当使用返回的的值处理substring 时, 
			
			index[left , right]
			slice(0 , left)	// 不包含 leftStr 
			slice(left , right) 	// 包含 leftStr ,不包含 rightStr
			slice(right)	//包含 rightStr
		
	* @method index
	* @param fstr{String}
	* @param leftStr{String}
	* @param rightStr{String}
	* @param [last=false]{Boolean} 查找右值是否从 最后开始,否则从 leftStr 处开始
	* @return {Array} if find.[0]leftIndex, [1]rightIndex.else null
	*/
	index : function(fstr	, leftStr	,	rightStr , last){
		var left ,right;
		var ret = null;
		if( (left = fstr.indexOf(leftStr)) > -1 ){
			if( (right = last ? fstr.lastIndexOf(rightStr) :  fstr.indexOf(rightStr, left + 1) ) > -1)	{
				if(right > left){// 当以 lastIndexOf 查找时,会出现 右值还小
					ret = [left	,	right];
				}
			}
		}
		return ret;
	},
	
	/**
	*	打算写一个 匹配 标签的方法,要能正确处理嵌套,完成..不过正确性未验证:
		对于能正确嵌套的标签,似乎返回的值也正确...

		fstr = 'some mes<div class="glob"><div class="first"><div class="foo"><div class="bar"></div></div></div><div class="helo"></div><div class="owld"></div></div><div class="error"></div>asd'
		foo(fstr , 'div')
		
	* @method indexTag
	* @param fstr{String}	要处理的字符串
	* @param tag{String}	tag label
	* @return {Array} [0=>left,1=>right] 返回值的定位与 index 一致 需要自行调整一下左 或右定位
	*/
	indexTag:	function(fstr,tag , ex){
		var pstart = '<'+tag;
		var pend	= '</'+tag + '>';
		
		var p;
		var p2;
		//临时添加一个类查找//' class="seeAlso"'
		var index = this.index(fstr , pstart + ex  , pend , false);
		
		if(index){
			p = index[0];
			p2 = index[1];
			while((p = fstr.indexOf(pstart , p + 1)) > -1){
				
				if(p > p2){
					// 找到一个内嵌标签,但是位置不能超过 p2,
					break;
				}
				if((p2 = fstr.indexOf(pend , p2 + 1)) > -1){
					index[1] = p2;
				}else{
					throw new Error('不匹配..')	
					break;	
				}
			}
		}
		return index;
	},



	getDir : function(url){
		var p = url.lastIndexOf('/');
		if(p > -1){
			return url.slice(0,p)	
		}
		return '';
	},


	/**
	*	建立目录,如果不存在的话.
	* @method diris
	* @param url	一个长文件名,  ./abc/adfa/adf/some.txt
	* @param isfile	如果后缀为 文件名而不是目录
	* @param prefix 前缀,
	*/
	diris : function(url,isfile,prefix){
		var i,m,path;
		if(prefix){
			url = url.replace(/\.+\//,'')// 有前缀将清除 ../ ./ 之类的字符
		}else{
			prefix = "";
		}
		m	=	url.split('/');
		
		isfile && m.pop(); // 如果 url 指向一个 文件而不是目录,将扔掉最后一个
		
		for(i=0; i< m.length ; i+=1){
			path = prefix + m.slice(0,i+1).join('/')
			if(!fs.existsSync( path )){
				fs.mkdirSync( path );	
			}	
		}
	},

	/**
	*	循环目录内所有文件,根据 pat
	* @param dir 目录名 注意: 这个参数要以 / 结尾
	* @param pat{RegExp}
	* @param exclude{Array} 需要排除的文件或目录,有前缀就行了
	* @return {Hash} path => filename ,dir => directory
	*/
 	walk	:	function(path, pat, exclude){
		var fname;
		var results = [];	
		var stat;

		//!path && (path = './' );
		//if(path[path.length - 1] !== '/') path += "/";

		var list = fs.readdirSync(path);
		var len =list.length;

		!exclude && (exclude = []);

		for(var i = 0; i<len; i+=1){

			fname = list[i];

			if(fname.charAt(0) === "." || exclude.indexOf(fname) !== -1){
				continue;
			}

			stat = fs.statSync(path + fname);

			if(stat.isDirectory()){
			
				Array.prototype.push.apply(results ,arguments.callee(path + fname + '/', pat, exclude));		
			
			}else if(pat ? pat.test(fname) : true) { // 如果存在 pat 才检测是否符合条件,
				results.push({"name":fname,"path":path});
			}
		}
		return results;
	}
}

	

exports.fd = utils;	

