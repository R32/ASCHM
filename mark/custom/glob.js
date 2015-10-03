/**
*
* Cookie 临时设置 ,避免过多调用Flash方法 , top.shim 由 header.js 设置
*/
 var  Allk 	=	{
	 
		ks	:	null,

		has	:	function(key){
			return key in this.ks;
		},
		
		get	:	function(key){
			return this.ks[key];
		},
		
		//
		set	:	function(key,value,expires){
			this.ks[key] = String(value);
		},
		
		del : function(key){
			delete this.ks[key];
		},
		
		init :  function(){
			try{
				if(shim) this.ks = shim.DOM.cget('asdoc');
				
				if(!this.ks){
					this.ks = {};
					this.flush();
				}
			}catch(err){
				this.ks = {};
			}
		},
		// 在浏览器发生刷新时,储储这些设
		flush	:	function(){
			if(this.ks && shim){
				shim.DOM.cset('asdoc',this.ks);
				shim.DOM.cflush();
			}
		}
	
}; 

/**
*	存储一个全局变量.
* @class glob
* @static
*/
var glob = {
	
	// ie6	:	navigator.userAgent.toLowerCase().indexOf("msie 6") > -1 ? true : false,
	
	/**
	*	放置一些变量,和 prop 一样
	* @Property prop
	* @type {Map}
	****/
	prop : {
		'HEADER'  : 1,
		'PACKAGE' : 2,
		'CLASSES' : 3,
		'CONTENT' : 4
	},
	
	/**
	*	放置一些 字面变量 
	*@Property literal
	*@type {Map}
	*/
	literal : {
		runtimesLabel:'运行时',
		productsLabel:'产品',
		noneLabel:'无',
		qsearchBoxLabel:'快速搜索',
		qsearchText:'未找到所搜索的词',
		ajaxErrorMsg:'加载页面时出错',
		ajaxErrorTryMsg:'重试',
		ajaxLoadingMsg:'仍在加载中',
		cancelMsg:'取消',
		classesText:'类',
		strJiveReply:'此问题针对以下文章提出:',
		showFilters:'显示过滤条件',
		hideFilters:'隐藏过滤条件',
		buildType:'filter'
	},

	/**
	*	一些 HTML 标记
	*@Property prop
	*@type {Map}
	*/
	templates : {
	},
	
	/**
	*	当这个值为 true 时,点击 frame_package 不会改变 frame_classes 的 url
	* @Property ready_content
	* @type {Boolean}
	* @deprecated 已经不打算使用 All-Classes.html 这个页面做 自动补齐 会太卡,也没什么作用
	*/
	allowAllClasses : false,	// 这个属生将移除
	
	/**
	*	是否已经完成初使化
	* @Property rendered
	* @type {Boolean}
	* @deprecated 已经不打算使用 All-Classes.html 这个页面做 自动补齐 会太卡,也没什么作用
	*/
	rendered	:	false,
	
	/**
	*	打算用这个来做跨 框架的..
	* @Property filter_menu
	* @type {HTML DOM}
	* @deprecated 这个属性不好控制.在IE中..特别是jQuery会在DOM 添加一些自定义的属性,
	*/
	filter_menu : 	null,
	/**
	*	返回 *内容* 区域框架
	*@method frame_content
	*@return {window}
	*/	
	frame_content	:	function(){
		return top.frames['classFrame'];
	},
	
	/**
	*	返回 *包列表* 区域框架
	*@method frame_package
	*@return {window}
	*/	
	frame_package	:	function(){
		return top.frames['packageListFrame'];
	},
	
	/**
	*	返回 *类列表* 区域框架
	*@method frame_classes
	*@return {window}
	*/	
	frame_classes	 :	function(){
		return top.frames['classListFrame'];
	},
	
	/**
	*	返回 *Header* 区域框架
	*@method frame_header
	*@return {window}
	*/	
	frame_header	 :	function(){
		return top.frames['headerFrame'];
	},
	
	/**
	*	更改 *内容框架* 的 url,但是 package-list ,及其它页面在改变content url时，并没有调用这个方法
	> 而是直接由 A 标签自已
	*@method change_content
	*@param url{String}
	*/	
	change_content	: function(url){
		var w;
		if(url){
			w = top.glob.frame_content();
			w.location.href = url;
			//top.location.hash = url;
			//top.jQuery(top).triggerHandler('contentChange',url)
		}
	},
	
	/**
	*	更改 *类列表框架* 的 url
	*@method change_content
	*@param url{String}
	*/	
	change_classes	: function(url){
		var w;
		if(url){
			w = top.glob.frame_classes();
			if(w.location.href!==url){
				w.location.href = url;
			}
			//top.jQuery(top).triggerHandler('classChange',url)
		}
	},
	
	/**
	*	从 url 中除去 文件名, 最后以 '/' 结尾. flash/display/DisplayObject.html 将返回 flash/display/ 最后字符串带 / 符号
	*   package-detail.html 则会返回 一个空字符串 ""
	* @method getPath
	* @param url{String}
	* @return {String}
	*/
	getPath	:	function(url){
		var ret = '',
			p = url.lastIndexOf('/');
		if(p > -1){
			ret = url.substring(0 , p + 1)
		}
		return ret;
	},
	
	/**
	*	从类似于 a=1&b=2 这类字符串中解析出 {a:1,b:2} 
	* @method getArgs
	* @param query{String}
	* @return {Map}
	*/
	getArgs : function(query) {
		var args = {};
		query = query.replace(/\s+/g,'');
		
		// Get query string
		if (query.length)	{
			var pairs = query.split("&");
			// Break at comma
			for(var i = 0; i < pairs.length; i++){
				var pos = pairs[i].indexOf('=');
				  // Look for "name=value"
				if (pos === -1) continue;
				  // If not found, skip
				var argname = pairs[i].substring(0,pos);
				  // Extract the name
				var value = pairs[i].substring(pos+1);
				  // Extract the value
				args[argname] = unescape(value);
			}
		}
		return args;     // Return the object
	},
	/**
	*	从 frame_content 中获得变量 baseRef 值 
	* 	baseRef 是一个相对路径,当子目录的文件想要引用到一些资源时,相对于主目录的 路径.类似于 ../../../
	* @method getBaseRef
	* @return {String}
	*/
	getBaseRef : function(isFile) {
	
		var c = this.frame_content();
		if(c['baseRef']){
			// 每个content基本上都在字符串替换时就写好了这个变量
			return c['baseRef'];
		}
		var p = 0, 
		ret = [] , 
		url = this.getBaseUrl(isFile);
		while( (p = url.indexOf('/', p + 1) ) > -1 ){
			ret.push('../');
		}
		return ret.length  ? ret.join('') : './';
	},
	
	/**
	*	将filename定位到 location.host 根目录下
	* @method locationHost
	* @param url{String}
	* @param [filename]{String} 注意 文件名必须要以 / 开头, / 代表主机根目录下.
	*/
	locationHost : function(url , filename){
		var p,ret;
		var str = location.href;
		!filename && (filename = '');
		switch(str.slice(0,4)){
			case 'http':
				ret = 'http://'+location.host + filename;  // 如果省略 filename 则返回 http://localhost
				break;
			case 'mk:@':
				p = str.lastIndexOf('::');
				p>-1 && (ret = str.slice(0 , p + 2) + filename); // '::'.length === 2
				break;
			case 'file':
				p = str.lastIndexOf('as_chm'); //这里要自已指定名字,并且把数字 6 改为 目录名长度
				p>-1 && (ret = str.slice(0 , p + 6) + filename); 
				break;			
		}
		return ret;
	} ,
	
	/**
	*	返回 host 之后第一个 / 和  第一个 # 之间的字符,
	*	注意:这个方法不可以用来操作 用 #! 来存数据的 页面,比如框架的主页,操作 #! 用 getAjaxFullFragment
	*   返回值不包含 Hash 值
	* @method getBaseUrl
	* @param [url]{String}	默认将会取得 frame_content 框架的 location.href 值
	* @return {String} 返回类似于 flash
	*/
	getBaseUrl : function (url){
		var p;
		if(!url){
			url = this.frame_content().location.href;
		}
		// 破坏 url,便于后续函数分析
		url = url.substring(8); //跳过一些字符串 http:// file:// https://
		if((p = url.indexOf('/')) > -1){
			url = url.substring( p+1 );	// 将 第一个 / 符号清除.. oaaf.com/sf
		}
		url = url.split('#')[0]; // URL 上不可以用 #! 来存数据,因为 # 之后的值都将忽略,
		return url;
	},
	
	/**
	*	取得 文件所在目录..的 getBaseRef 的区别是 
	* @method getBaseFile
	* @param [url]{String}	默认将会取得 frame_content 框架的 location.href 值
	* @return {String} 返回 URL 中的 文件名, str = '/flash/display/xxx.html#helo' 将返回 xxx.html#helo 
	*/
	getFilename : function (url){
		var p ,ret = '';
		if(!url){
			url = this.getBaseUrl(this.frame_content().location.href);
		}
		if((p = url.lastIndexOf('/')) > -1){
			ret = url.substring(p+1)
		}
		return ret;
	},
	
	/**
	*	从 #! 中获得 数据,不包括 Hash值,
	* 	
	* @method getAjaxFullFragment
	* @param [url]{String} default = 内容框架的 href 值
	* @return {String} 返回 #! 之后 # 之前的所有字符
	*/
	getAjaxFullFragment : function (str) {
		var frag,ret;
		!str && (str = this.frame_content().location.href)
		ret = str.split("#");
		frag = ret.length>1 && ret[1].charAt(0) === '!' ? ret[1].substring(1) : "";
		return frag;
	}	,
	
	
	
	/**
	*	//will return the part between "#!" & the last "/"
	*	注意这个方法是从 #! 后拿数据
	* @method getAjaxBaseFragment
	* @param str{String} 从 经过处理的url 中获得 文件名以及文件名后的hash. 
	* @return {String}  str = '/flash/display/xxx.html#helo' 将返回 /flash/display/  这样的路径
	**/
	getAjaxBaseFragment : function (str) {
		var frag = this.getAjaxFullFragment(str);
		frag = frag.substring(0,frag.lastIndexOf("/")+1);
		return frag;
	} ,
	
	
	/**
	*	这个方法其实叫 getHashValue 便合适
	* @method getScrollTarget
	* @param str{String}  要分析的URL字符串 
	* @return {String}  返回值不包含 '#' 符
	*/
	getScrollTarget : function (str) {
		var p = str.lastIndexOf('#');
		if(p>-1 && str.charAt(p)+1 !=='!'){
			str = str.substring(p + 1);
		}else{
			str = ""
		}
		return str;
	},
	
	
	/**
	*	是否为外链
	* @method isExternalLink
	* @param str{String}  
	* @return {Boolean}  
	**/
	isExternalLink	: function (str) {
		var ret = false;
		if(str && str.indexOf('http:') > -1) {
			ret = true;
		} 
		return ret;
	} ,
	
	/**
	*	设置主框架的 hash值.
	* @method setHash
	* @param url{String} 路径加文件名
	* @param hash{String} 不包含 '#'
	****/
	setHash	:	function(url , hash){
		if(hash){
			url = url+'#'+hash;
		}
		location.hash = '#!'+url;
	},
	
	/**
	*	检测是否可以执行 prettify
	* @param fc{window} frame_cotent
	* @return {Boolean}
	*/
	canBePrettify : function(fc){
		return fc && fc.ready && fc.location.href.lastIndexOf('-detail')===-1 && fc.location.href.lastIndexOf('-summary')===-1;
	}
};

/**
*	将所有函数外置防止 memory leak
* @
*/
var handlers = {
	
	onIndexUnload : function(){
		window.Allk && window.Allk.flush(); // 更新 Cookie 值
		return true;
	}
};

function titleBar_setSubNav (showConstants,showProperties,showStyles,showSkinPart,showSkinState,showEffects,showEvents,showConstructor,showMethods,showExamples,
showPackageConstants,showPackageProperties,showPackageFunctions,showInterfaces,showClasses,showpackageMethodFunctions) {
	
	var doc,fh = top.glob.frame_header()

	if(fh && fh.ready){
		
		doc = fh.document;
		
		$('#propertiesLink',doc).css('display',showProperties ? "inline" : "none");
	
		$("#propertiesBar",doc).css( 'display', (showProperties && (showPackageProperties || showConstructor || showMethods || showPackageFunctions || showEvents || showStyles || showEffects || showConstants || showPackageConstants || showInterfaces || showClasses || showpackageMethodFunctions || showExamples)) ? "inline" : "none");
		
		
		$("#packagePropertiesLink",doc).css('display',showPackageProperties ? "inline" : "none");
		
		$("#packagePropertiesBar",doc).css('display',(showPackageProperties && (showConstructor || showMethods || showPackageFunctions || showEvents || showStyles || showConstants || showEffects || showPackageConstants || showInterfaces || showClasses || showpackageMethodFunctions || showExamples)) ? "inline" : "none");
		
		$("#constructorLink",doc).css('display' ,showConstructor ? "inline" : "none");
		
		$("#constructorBar",doc).css('display', (showConstructor && (showMethods || showPackageFunctions || showEvents || showStyles || showEffects || showConstants || showPackageConstants || showInterfaces || showClasses || showpackageMethodFunctions || showExamples)) ? "inline" : "none");
	
		$("#methodsLink",doc).css('display', showMethods ? "inline" : "none");
		
		$("#methodsBar",doc).css('display',(showMethods && (showPackageFunctions || showEvents || showStyles || showEffects || showConstants || showPackageConstants || showInterfaces || showClasses || showpackageMethodFunctions || showExamples)) ? "inline" : "none");
		
		$("#packageFunctionsLink",doc).css('display', showPackageFunctions ? "inline" : "none");
		
		$("#packageFunctionsBar",doc).css('display',(showPackageFunctions && (showEvents || showStyles || showEffects || showConstants || showInterfaces || showClasses || showpackageMethodFunctions || showExamples)) ? "inline" : "none");
		
		$("#eventsLink",doc).css('display',showEvents ? "inline" : "none");
		
		$("#eventsBar",doc).css('display',(showEvents && (showStyles || showEffects || showConstants || showPackageConstants || showInterfaces || showClasses || showpackageMethodFunctions || showExamples)) ? "inline" : "none");
		
		$("#stylesLink",doc).css('display', showStyles ? "inline" : "none");
		
		$("#stylesBar",doc).css('display', (showStyles && (showEffects || showConstants || showPackageConstants || showInterfaces || showClasses || showpackageMethodFunctions || showExamples)) ? "inline" : "none");
		
		
		$("#SkinPartLink",doc).css('display',showSkinPart ? "inline" : "none");
		
		$("#SkinPartBar",doc).css('display', (showSkinPart && (showSkinState || showEffects || showConstants || showPackageConstants || showInterfaces || showClasses || showpackageMethodFunctions || showExamples)) ? "inline" : "none");
		
		$("#SkinStateLink",doc).css('display',showSkinState ? "inline" : "none");
		
		$("#SkinStateBar",doc).css('display',(showSkinState && (showEffects || showConstants || showPackageConstants || showInterfaces || showClasses || showpackageMethodFunctions || showExamples)) ? "inline" : "none");
		
		$("#effectsLink",doc).css('display', showEffects ? "inline" : "none");
		
		$("#effectsBar",doc).css('display', (showEffects && (showConstants || showPackageConstants || showInterfaces || showClasses || showpackageMethodFunctions || showExamples)) ? "inline" : "none");
		
		$("#constantsLink",doc).css('display',showConstants ? "inline" : "none");
		
		$("#constantsBar",doc).css('display',(showConstants && (showPackageConstants || showInterfaces || showClasses || showpackageMethodFunctions || showExamples)) ? "inline" : "none");

		
		$("#packageConstantsLink",doc).css('display',showPackageConstants ? "inline" : "none");
		
		$("#packageConstantsBar",doc).css('display', (showPackageConstants && (showPackageFunctions || showInterfaces || showClasses || showpackageMethodFunctions || showExamples)) ? "inline" : "none");
		
		$("#packageMethodFunctionsLink",doc).css('display', showpackageMethodFunctions ? "inline" : "none");
		
		$("#packageMethodFunctionsBar",doc).css('display',(showpackageMethodFunctions && (showClasses || showInterfaces || showExamples)) ? "inline" : "none");
		
		$("#interfacesLink",doc).css('display',showInterfaces ? "inline" : "none");
		
		$("#interfacesBar",doc).css('display',(showInterfaces && (showClasses || showExamples)) ? "inline" : "none");
		
		$("#classesLink",doc).css('display', showClasses ? "inline" : "none");
		
		$("#classesBar",doc).css('display', (showClasses && showExamples) ? "inline" : "none");
		
		$("#examplesLink",doc).css('display',showExamples ? "inline" : "none");
	}else{
		// 加入队列,等初使化完成再调用这里一次,只能传递字符串方法, 这是一个全状态 队列,就是等 所有 ready 就绪才会调用，也只会掉用一次
		top.readyQueue.push({'frame' : top, 'method': 'titleBar_setSubNav' , args : $.makeArray(arguments)});
	}
}

/**
*
* 只处理 左边栏的过滤..
*/
function doFilterFrameSider(doc , ks_rt, ks_pd , rb_rt , rb_pd){
	
	var fh = glob.frame_header();
	
	var node, i , len ,
	
	elements = doc.getElementsByTagName('tr');

	//var rb = fh.runtime_array;
	for(i = 0 , len = elements.length; i < len ; i++){
		node = elements[i];
		if(isFilterVisible(node,	ks_rt, ks_pd , rb_rt , rb_pd)){
			node.style.display = ''
		}else{
			node.style.display = 'none'
		}
    }
}



/**
*	从 Cookie集合中筛选需要保留的值,
* @method filterCookie
* @param [reserve]*{String} [runtime|product]为空,二个都会保留下来
* @return {Map} a map list
*/
function filterCookie(reserve){
	var ret = {};
	var k,ks = Allk.ks;
	var i,array;
	



	ret =  glob.frame_header().defalutXMLFilter();
	
	for(k in ks){//增加 默认 Cookie 如果 Cookie为空的话。
		if(k.indexOf('filter_') === 0){
			ret[k.substring(7)] = ks[k];
		}
	}

	if(reserve === 'product'){
		array = glob.frame_header().runtime_array;
		delete ret['runtime']
		for(i = 0; i < array.length ; i+=1){
			delete ret[array[i].name]
		}
	}else if(reserve === 'runtime'){
		array = glob.frame_header().product_array;
		delete ret['product']
		for(i = 0; i < array.length ; i+=1){
			delete ret[array[i].name]
		}
	}
	return ret;
}
// // 从Cookie 中取值,来 决定是否显示哪些过滤.
/**
*
* @param node{HTML DOM} 要进行过滤的 DOM
  @param ks_rt{Map} 一个经过过滤的 Cookie 组.runtime
  @param ks_pd{Map} 一个经过过滤的 Cookie 组.product
  @param rb_runtime{Array}
  @param rb_product{Array}
  @return {Boolean}
*
*********/
function isFilterVisible(node , ks_rt  ,ks_pd ,rb_rt , rb_pd){//ks
//便历 runtime_array 及 product_array 和 Cookie 的值 混和 ,这个函数会和 getUserPerfs 很象

// 拿混合的值 和 rb_product rb_runtime 比较就行了.
// 拿 rb ,brb rt brt ,cookie 的值混合成一个对象,,,mix
	var i,j,len,jlen
	var attributeValue
	var done_product = true,done_runtime = true;
	

	// 修改这个地方,如果 ks_pd 为空 或 没有 ks_pd['product'] 或
	if((attributeValue = node.getAttribute('product'))){//rb_product_array -> rb
		if(ks_pd['product']!=='none'){
			delete ks_pd['product'];
			if(!$.isEmptyObject(ks_pd)){
				done_product = false;
				attributeValue = attributeValue.toLowerCase();
			pd_for:	
				for(i=0,len = rb_pd.length; i < len ; i += 1){
					if(ks_pd[ rb_pd[i].name ] === rb_pd[i].version){// 
						for(j = 0, jlen = rb_pd[i].matches.length ; j < jlen ; j += 1){
							if(attributeValue.indexOf(rb_pd[i].matches[j])>-1){
								done_product = true;
								break pd_for;
							}
						}
					}
				}
			}
		}//else false
	}

	// 如果只选中其中一个怎么做？？

	if((attributeValue = node.getAttribute('runtime'))){
		if(ks_rt['runtime']!=='none'){
			delete ks_rt ['runtime'];
			if(!$.isEmptyObject(ks_rt)){
				done_runtime = false;
				attributeValue = attributeValue.toLowerCase();
			rt_for:	
				for(i=0,len = rb_rt.length; i < len ; i += 1){
					if(ks_rt[ rb_rt[i].name ] === rb_rt[i].version  ){//
						for(j = 0, jlen = rb_rt[i].matches.length ; j < jlen ; j += 1){
							if(attributeValue.indexOf(rb_rt[i].matches[j])>-1){
								done_runtime = true;
								break rt_for;
							}
						}
					}
				}
			}
		}	
	}
	
	return  done_product && done_runtime;
}

/**
* 全局过滤..
*/
function doFilterStateChange1(){
	
	var fh = glob.frame_header();
	if(fh.filter_menu_change){
		var kspd = filterCookie('product');//保留product
		
		var ksrt = filterCookie('runtime');//只保留runtime
		
		
		doFilterFrameSider(glob.frame_package().document	,	ksrt ,  kspd	,fh.rb_runtime_array , 	fh.rb_product_array);

		// classes 需要过滤吗?? 
		//doFilterFrameSider(glob.frame_classes().document	,	ksrt ,  kspd	,fh.rb_runtime_array , 	fh.rb_product_array);
			
		doFilterFrameContent_1(glob.frame_content(),	ksrt ,  kspd	,fh.rb_runtime_array , 	fh.rb_product_array);
		
		fh.filter_menu_change = false;
	}
	
}
function doFilterFrameContent_1(fc,	ks_rt,	ks_pd,	rb_rt,	rb_pd){
	if(fc.ready_filter_menu){
		if(fc.location.href.lastIndexOf("package-summary.html") > -1 || fc.location.href.lastIndexOf("class-summary.html") > -1){
			doFilterFrameContent(fc.document,	ks_rt,	ks_pd,	rb_rt,	rb_pd);
		}
	}
}
/**
*	过滤页面.. 
* @method doFilterStateChange1
* 
*/
function doFilterFrameContent(doc,	ks_rt,	ks_pd,	rb_rt,	rb_pd){
	var node, i , len ,
	elements = doc.getElementsByTagName('tr');
	//console && console.log("doFilterFrameContent");
	for(i = 0 , len = elements.length; i < len ; i++){
		node = elements[i];
		if(isFilterVisible(node,	ks_rt, ks_pd , rb_rt , rb_pd)){
			node.style.display = ''
		}else{
			node.style.display = 'none'
		}
    }
	
    // package-list.html 之中没有这项. 
    elements = document.getElementsByTagName('span');
    for(i = 0 , len = elements.length; i < len ; i++){
        node = elements[i];
		if(node.attributes['id'] && node.attributes['id'].value ==='pageFilter'){
			 if(isFilterVisible(node,	ks_rt, ks_pd , rb_rt , rb_pd))
				node.style.display = ''
			 else
				node.style.display = 'none'
		}
    }
	
	var href = glob.frame_content().location.href;
	
    if(href.indexOf("package-detail.html") > 0 ){
        setRowColorForPackage("Property",doc);
        setRowColorForPackage("Function",doc);
        setRowColorForPackage("Constant",doc);
        setRowColorForPackage("Class",doc);
        setRowColorForPackage("Interface",doc);
    }else if(href.indexOf("package-summary.html") > 0){
    
        setRowColorForPackage("",doc);
        
    }else if(href.indexOf("class-summary.html") > 0){
    
		setRowColorClassTableSummary(doc);
        
    }else if(href.indexOf("all-index") > 0){
        setRowColorIndexTable(doc);
    }else{
		setRowColorClassTables("Constant",doc);
        setRowColorClassTables("ProtectedConstant",doc);
        setRowColorClassTables("Property",doc);
        setRowColorClassTables("ProtectedProperty",doc);
        setRowColorClassTables("Method",doc);
        setRowColorClassTables("ProtectedMethod",doc);
        setRowColorClassTables("Event",doc);
        setRowColorClassTables("commonStyle",doc);
        setRowColorClassTables("sparkStyle",doc);
        setRowColorClassTables("haloStyle",doc);
        setRowColorClassTables("mobileStyle",doc);
        setRowColorClassTables("SkinPart",doc);
        setRowColorClassTables("SkinState",doc);
        setRowColorClassTables("Effect",doc);
    }  
    
   
}

function setFiltersWithURL(e){
	var p,strArg;
	if(e){
		var node = e.srcElement || e.target;
		if(node.tagName.toLowerCase() !== 'a'){
			node = node.parentNode;
		}
		e.preventDefault && e.preventDefault();
		e.returnValue = false;
		e.cancelBubble = true;
		if((p = String.prototype.lastIndexOf.call(node.href,'?')) > -1 ){
			glob.frame_header().setFiltersWithURLArgs(node.href.substring(p+1),glob.frame_content());
		}
	}
	return false;
}


/*
In Package-details.html  page there are some class, property & Functions tables. 
Whenever filters are applied then sometimes alternate coloring of rows get distorted.
This function apply alternating coloring on only those rows which are visible
2. Table in Package-summary.html is also fixed thru this code.
*/
function setRowColorForPackage(selectorText,doc){//document
    
    var table = doc.getElementById("summaryTableId" + selectorText);

    if(table){ 
            var rowNum = 0;
             for(var j=1, len = table.rows.length; j<len; j++){
                if(table.rows[j].style.display.indexOf('none') == -1){
                    rowNum++;
                    table.rows[j].className = (rowNum & 1) ? "prow0" : "prow1";
                }
            }
    }
   
}

/*
Function for setting alternate row colors in the table for class-summary.html page.
*/
function setRowColorClassTableSummary(doc)
{
	var elements = getElementsByClassName(doc, "summaryTable");
	var table = elements[0];
    if (table){
        var rowNum = 0;
        for (var i = 1,len = table.rows.length; i < len; i++)
        {
            if(table.rows[i].style.display.indexOf('none') == -1)
            {
                rowNum++;
                table.rows[i].className = (rowNum & 1) ? "prow0" : "prow1";
            }
        }
    }
}

/*
In all classes there are Tables of Events, methods, properties etc with alternating row color.
Whenever filters are applied, for some tables alternative row coloring get distorted.
This function apply alternating coloring only on visible rows.
*/
function setRowColorClassTables(selectorText,doc)
{
    var rowColor = "#FFFFFF";//document
    var table = doc.getElementById("summaryTable" + selectorText);
    if (table){
        var show = Allk.ks["showInherited" + selectorText] === 'true';
        var rowNum = 0;
        for (var i = 1,len = table.rows.length; i < len; i++){
            if(show){
                if(table.rows[i].style.display.indexOf('none') === -1){
                    rowNum++;
                    table.rows[i].bgColor = (rowNum & 1 ) ? rowColor : "#F2F2F2";
                }        
            }else{
                if(table.rows[i].className.indexOf('hideInherited') === -1){
                    if(table.rows[i].style.display.indexOf('none') === -1){
                        rowNum++;
                        table.rows[i].bgColor = (rowNum & 1) ? rowColor : "#F2F2F2";
                    }
                }
                
            }
            
        }
    }
    
}
/*
    This function apply Altenating row colors to only visible rows after filters are applied.
    This function apply on Index page.
*/
function setRowColorIndexTable(doc){

	var table = doc.getElementById("tbl1");
    var rowNum = 1;
    if(table){
        for(var i=1,len = table.rows.length; i < len; i++){
            if(table.rows[i].style.display.indexOf('none') == -1){
                rowNum++;
                table.rows[i].className = (rowNum & 1) ? "odd" : "even";
            }
        }
    }
}

/*
function for getting elements by classname because IE8 does not support getelementsbyclassname.
*/
function getElementsByClassName(node,classname) {
  if (node.getElementsByClassName) { // use native implementation if available
    return node.getElementsByClassName(classname);
  } else {
    return jQuery('.'+classname, node).toArray();
  }
}

// update arrays and cookies after a click on a filter
// use that info when exiting filter to update description 
// 现在已经实时更新Cookie,这个函数可能用不到了
function updateStateOnClick(stateType){
	var doc = glob.frame_content().document;
	var rb_array;
	 
		if(stateType.indexOf("runtime") !== -1){
			rb_array = glob.frame_header().rb_runtime_array;
		} else {
			rb_array = glob.frame_header().rb_product_array;
		}
		for(var i=0,len = rb_array.length; i < len;i++){
			if ( doc.getElementById(rb_array[i].id).checked ){
				setFilterCookie("filter_"+rb_array[i].name, rb_array[i].version);
			}
		}
}
function setFilterCookie(name, value){
    var expire = new Date();
    expire.setDate(expire.getDate()+90); // Cookie expires after 90 days
	Allk.set(name.toLowerCase() , value.toLowerCase() , expire.getTime());	
}

/**
*
* title_menu 更新文字
*/
function updateState(stateType){
	var doc = glob.frame_content().document;
	//try{
		//var startDescriptionString = "";
		var desc = [];
		
		var descriptionString = "";
		//var descriptionSet = false;
		var elementString;
  
		var rb_array;
	 
		if(stateType.indexOf("runtime")!==-1){
			rb_array = glob.frame_header().rb_runtime_array;
			elementString = "runtimes";
		} else {
			rb_array = glob.frame_header().rb_product_array;
			elementString = "products";
		}
		for(var i=0; i<rb_array.length;i++){
			if ( doc.getElementById(rb_array[i].id).checked ){
				if(rb_array[i].version.indexOf("none") === -1){
					desc.push(rb_array[i].description);
				}
			}
		}

		descriptionString = desc.length ? desc.join(", ") : (glob.literal.noneLabel);

		
		if(descriptionString.length > 145){
			var shortstr= descriptionString.substring(0,145);
			var lastind = shortstr.lastIndexOf(",");
			doc.getElementById(elementString).innerHTML = descriptionString.substring(0,lastind)+"...";
			doc.getElementById(elementString).title = descriptionString;
		}else{
			doc.getElementById(elementString).innerHTML = descriptionString;
			doc.getElementById(elementString).title = descriptionString;
		}
	//}catch(e){console.log(e)}
}

function toggleMXMLOnly(doc) {
	var mxmlDiv = doc.getElementById("mxmlSyntax");
	var mxmlShowLink = doc.getElementById("showMxmlLink");
	var mxmlHideLink = doc.getElementById("hideMxmlLink");
	if (mxmlDiv && mxmlShowLink && mxmlHideLink) {
		if (mxmlDiv.style.display === "none") {
			mxmlDiv.style.display = "block";
			mxmlShowLink.style.display = "none";
			mxmlHideLink.style.display = "inline";
			Allk.set("showMXML","true");
		} else {
			mxmlDiv.style.display = "none";
			mxmlShowLink.style.display = "inline";
			mxmlHideLink.style.display = "none";
			Allk.set("showMXML","false");
		}
	}
}


/**
* 如果跳转得太快，在 prettify 还在进行中就跳转，就会产生错误
*/
function hightlightError(){
	top.Allk.set('code_hightlight','none');
	$("#prettifyCode a:first",top.glob.frame_header().document).removeClass('highlight').text('打开代码高亮');
	if(!top.glob.noticeEr){
		createLoadingMsg("<font color='#DB4938'> <b>!</b> 跳转太快 <b>prettify</b> 还未转换完成.<br />代码高亮暂时被关闭,以获得更快的速度.</font>","点击关闭");
		top.glob.noticeEr = true;//只提示一次
	}	
}

function createLoadingMsg(ajaxLoadingMsg,cancelMsg) {
	var fh = top.glob.frame_header();//
	var node;
	if(ajaxLoadingMsg){
		!cancelMsg && (cancelMsg = 'X');
		if(fh && fh.ready){
			node = fh.document.getElementById('loadingMsgDiv');
			if(!node){
				node = fh.document.createElement('div');
				node.id = 'loadingMsgDiv';
				fh.document.body.appendChild(node);
			}
			node.innerHTML = "<div class='innerLoadingMsgDiv'><span class='innerLoadingMsgSpan1'>"+ajaxLoadingMsg+"... </span><span class='innerLoadingMsgSpan2' onclick='this.parentNode.parentNode.className=\"hidden\"'>"+cancelMsg+"</span></div>"
			node.className = '';
		}
	}
}

/**
*	-----
* @param title{String} 类似于 flash/display 这样以 / 分隔的路径 字符串,参看 content2.js 如何转换这个变量
* @param show{Boolean} if false.将设置 innerText 为 "",这样在界面上将看不见这个元素
*/
function titleBar_setSubTitle(title,show){
	var lk,fh = top.glob.frame_header();
	if(fh && fh.ready){
		lk = $('#subTitle a:first',fh.document);
		if(show){
			lk.prop('href', (title ? title : "")+ 'package-detail.html').text(title ? title.replace(/\//g,'.').replace(/\.$/,'') : '顶级');
		}else{
			lk.text('');
		}
	}else{
		top.readyQueue.push({'frame' : top, 'method': 'titleBar_setSubTitle' , args : $.makeArray(arguments)});
	}
}

/*	FOR Frame_Classes 	*/

//************Start cls class search*************//
top.clsSearch = {
	/**
	*	ownerDocument 
	* @Property doc
	* @type {document}
	*/
	doc	:	null,
	
	/**
	*	顶部节点,
	* @type {String}
	*/
	nodeId :	null,
	
	/**
	*	html 模板字符串
	* @type {String}
	*/
	templates : '<span id="cls_name">类</span><span id="cls_searchspan"><input type="text" id="cls_searchbox" value="class search" onfocus="top.clsSearch.onFocus();" onblur="top.clsSearch.onBlur()" onkeyup="top.clsSearch.onKeyUp();"><span id="cls_clear_search" class="search_inactive" onclick="top.clsSearch.clearSearchButton()">x</span></span>',
	
	qsearchText : "未找到所搜索的词",
	
	typingInterval : 600,
	
	typingTimer : 0,
	
	/**
	*
	* 这个方法 frame_classes 必须每次刷新时都要更新 document
	*/
	init	:	function(doc,id){
		this.doc = doc;
		this.nodeId = id;
	},
	
	setTr	:	function(link,show){
		var o = link.parentNode.parentNode;
		if(o.tagName === 'TR'){
			o.className = show ? '' : 'hidden';//TR 直接修改 style.display 会和 doFilterStateChange1 函数冲突
		}else{
			link.style.display = show ? '' : 'none';
		}
	},
	
	execFilter : function () {
		var term = this.doc.getElementById("cls_searchbox").value;
		var cls = this.doc.getElementById(this.nodeId);
		var x = cls.getElementsByTagName("a");
		//term = term.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
		term = term.replace('.','\.').replace(/\s/g,'');	//
		var patt1 = new RegExp(term,"i");
		var foundclsCount=0;
		var pstr;
		for(var i=0,len = x.length ;i< len ;i++) {
			if(x[i].innerText) {
				pstr = x[i].innerText.match(patt1);
			} else {
				pstr = x[i].textContent.match(patt1);
			}

			if(x[i].className === "noqsearch") {
			
				//x[i].style.display = "none";
				this.setTr(x[i]	,	false)
			} else if(x[i].id === "cls_name") {
				//dont filter package name
			} else if(pstr !== null && pstr.length>0 && x[i].parentNode.parentNode.style.display !== "none") {
				foundclsCount++;
				var iterm = x[i].innerHTML;
				x[i].innerHTML = iterm.replace(pstr[0],"<span class='highlightText'>"+pstr[0]+"</span>");
			} else {
				if(x[i].id === "cls_name" || x[i].id === "clear_search") {
					////////////////x[i].style.display = ""; // 这个是以前就注释掉了的
				} else {
					//x[i].style.display = "none";
					this.setTr(x[i]	,	false)
				}
			}
		}
		if(foundclsCount === 0) {
			var txtdoc = this.doc.getElementById("cls_txtMsg");
			if(txtdoc === null) {
				var acls = this.doc.createElement("div");
				acls.id = "cls_txtMsg";
				acls.innerHTML = this.qsearchText;
				bcls = this.doc.getElementById(this.nodeId);
				bcls.appendChild(acls);
			}
		}

	},
	
	onFocus : function () {
		var o = $('#cls_searchbox',this.doc);
		if(o.prop('value') === "class search"){
			o.prop('value','');
			o.css('color','#000000')
		}	
	},
	
	onKeyUp	: function () {
		var inputDiv = this.doc.getElementById("cls_searchbox");
		if(inputDiv.value=='') {
			this.doc.getElementById('cls_clear_search').className = 'search_inactive';
		} else {
			this.doc.getElementById('cls_clear_search').className = 'search_active';
		}
		var len = this.doc.getElementById("cls_searchbox").value.length;
		if(len>=2) {
			clearTimeout(this.typingTimer);
			this.typingTimer = setTimeout( function() {
				clsSearch.clearHighlight();
				clsSearch.execFilter();
			},this.typingInterval);
		} else {
			this.clearHighlight();
		}
	},
	
	onBlur : function () {
		var o = $('#cls_searchbox',this.doc);
		if(o.prop('value') === ""){
			o.prop('value','class search');
			o.css('color','#AAAAAA');
			$('#cls_clear_search',this.doc).attr('class','search_inactive')
		}
	},
	
	clearSearchButton : function () {
		var o = $('#cls_searchbox',this.doc);
		o.prop('value','');
		o.focus();
		this.clearHighlight();
		$('#cls_clear_search',this.doc).attr('class','search_inactive')
	},
	
	clearHighlight	: function () {
		var i,j,len;
		var cls = this.doc.getElementById(this.nodeId);
		x = [];
		var tNode = this.doc.getElementById("cls_txtMsg");
		if( this.doc.getElementById("cls_txtMsg")) {
			pNode = this.doc.getElementById(this.nodeId);
			pNode.removeChild(tNode);
		}
		var xtemp;
		if(navigator.userAgent.search("MSIE") >= 0) {
			xtemp = cls.getElementsByTagName("span");
			j=0;
			for(i=0 , len = xtemp.length ; i< len ;i++) {
				if(xtemp[i].className === "highlightText") {
					x[j] = xtemp[i];
					j++;
				}
			}
			for(i=0 , len = x.length ;i < len;i++) {
				y = x[i].parentNode;
				z = x[i].innerHTML;
				txtNode = this.doc.createTextNode(z);
				x[i].appendChild(txtNode);
				y.replaceChild(txtNode,x[i]);
			}
		} else {
			x = cls.getElementsByClassName("highlightText");
			while(x.length>0) {
				y = x[0].parentNode;
				z = x[0].innerHTML;
				txtNode = this.doc.createTextNode(z);
				x[0].appendChild(txtNode);
				y.replaceChild(txtNode,x[0]);
			}
		}
		//making all the anchor tags visible
		var alinks = cls.getElementsByTagName("a");
		for(i=0 , len = alinks.length ; i < len;i++) {
			//alinks[i].style.display="";
			this.setTr(alinks[i] , true);
		}
		//doFilterStateChangePackageList();
	}
};
	


/**
*	在 所有页面加载完成后, done 会检测这个数组里的值,并执行里边的方法
* @Property readyQueue
* @type {Array}
	
	* `frame` 	{window}
	
	* `method`	{String}   方法只能是window 下 直接变量或函数,	暂时不支持 foo.bar 这种方法
	
	* `args`	{Array}	   参数请用一个数组 包起来 $.makeArray(arguments)
*/
var readyQueue = [];

/**
*
*
* @param from{int}	glob.prop:: 
*/
function done(from){
	// 框架页面,不太好控制每个页的加载进度,只能用这种麻烦的方法,对各页进行检测
	var queue ;
	if(!glob.rendered){
		if(glob.frame_header() && glob.frame_header()['ready'] && 
					glob.frame_content() && glob.frame_content()['ready']){
			
			//console.log('all ready!' + from)
			
			glob.rendered = true;
			
			while(readyQueue.length > 0){
				queue = readyQueue.pop();
				
				if(queue.frame[queue.method] instanceof queue.frame.Function){
					queue.frame[queue.method].apply(queue.frame,queue.args);
				}
				//console.log(queue.frame[queue.method] instanceof queue.frame.Function)
			}
			
		}
	}
}
window.onunload = handlers.onIndexUnload;

/**
README
------

Javascript 加载顺序:

 * 由 header.html 中的 header.js 最先初使化插入 SWF文件, 然后等待 swfReady 事件

 * `"swfReady" => hs.onSwfReady`, 
 
  - 设置 top.shim = Shim.inst, 初使化 `top::glob.js::Allk`

  - 解析 filter.xml 文件

*/
