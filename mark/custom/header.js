/*!*
* 这个文件只处理 header.html 页面的操作
*
*/
// 使用父框架的 jQuery对象


if(!window.jQuery){
	window.$ = window.jQuery = top.jQuery;
}
var ready = false;
var xmlReady = false;
var filter_menu_change = false;

//=========== AS_Filter_NEW ====================
//var g_user_prefs_loaded = false;
var filter_file = "filters.xml";
var runtime_array = new Array();
var product_array = new Array();
var rb_runtime_array = new Array();
var rb_product_array = new Array();


function arrayEntry(name, defaultValue,topversion){
	this.name = name.toLowerCase();
	this.defaultValue = defaultValue.toLowerCase();
	this.topversion = topversion.toLowerCase();
}

function rb_arrayEntry(name, version, match, description){
	this.id = 'rb_'+name+'_'+version.replace(".", "_");
	this.name = name;
	this.version = version;
	this.matches = [];
	if(match){
		for(var index=0,len = match.length; index < len ; index++){
			var matchString = match[index].getAttribute("value");
			this.matches.push( matchString.toLowerCase() );
		}
	}	
	this.description = description;
}
// doc 需要指定框架关联的 Document
/**
*	通过 rb_runtime_array 或 runtime_array 设置 .Nav radio时会经常调用到..
* @param rbName {String}
* @param rbValue {String}
* @param state {Boolean}
* @param doc{Document} 指定框架的Document.
*/
function setRadioButtonState(rbName, rbValue, state	, doc){
	var radioButtonName = "#rb_" + rbName + "_" + rbValue.replace('.', '_');
	$(radioButtonName	,	doc).prop('checked',  state);
}
//===========================================================

var attrs = {
	
	/**
	*	模板 
	* @Property tp_whyEnglist	
	* @type {String}
	********/
	tp_whyEnglist : '<div id="whyEnglishContent">'+
			'<div id="light" class="white_content">'+
				'<div class="white_content_title">'+
					'<span style="float:right"><a href="javascript:void(0)" onclick="document.getElementById(\'whyEnglishContent\').className = \'\';return false">[ X ]</a></span><span style="float:left">为什么显示为英语？</span>'+
				'</div>'+
				'<div class="white_content_body">'+
					'<b>《ActionScript 3.0 参考》中的内容以英语显示</b><br><br>'+
					'《ActionScript 3.0 参考》中的部分内容未翻译成所有语言。当某个语言元素未翻译时，将显示为英语。例如，ga.controls.HelpBox 类未翻译成任何语言。因此在简体中文版的参考中，ga.controls.HelpBox 类显示为英语。'+
				'</div>'+
			'</div>'+
			'<div class="black_overlay"></div>'+
		'</div>',
		
	tp_filterTable : '<div id="filter_panel_nf">'+
'<table class="filterTable" width="100%">'+
'<tr>'+
	'<td>过滤条件:</td>'+
	'<td width="5%" id="runtimefilter"></td>'+
	'<td id="runtimes" align="left" style="white-space:normal">你好,世界</td>'+
'</tr>'+
'<tr>'+
	'<td></td>'+
	'<td id="productfilter" valign="top"></td>'+
	'<td id="products" width="85%" style="white-space:normal">Hello,World!</td>'+
'</tr>'+
'</table>'+
'</div>',
	
	/**
	*	这和二边那个属性会在解析 XML 的时候生成...
	* @Property productfilter
	* @type {String} html
	****/
	productfilter  	:	'',
	
	/**
	*
	* @Property runtimefilter
	* @type {String} html
	*****/
	runtimefilter	:	''
};

/**
*	一些监听函数集合而已
* @Property hs
* @type {Map}
*/
var hs = {
	onWhyEnglish	:	function(e){
		var fc,node;
		e.cancelBubble = true;
		e.returnValue = false;
		e.preventDefault();
		fc = top.glob.frame_content();
		if(fc && fc.ready){
			if(!$('#whyEnglishContent',fc.document).length){
				$('body',fc.document).append(attrs.tp_whyEnglist);
			}
			node = $('#whyEnglishContent',fc.document);
			if(node.hasClass('show')){
				//node.css({display:'none',top:'40%'}).next('.black_overlay').css({'display':'none','height':'100%'});
				node.removeClass('show');
			}else{
				$(fc.document).scrollTop(0);
				node.addClass('show')
				//node.css({'display':'block','top':(($(fc).height() - node.height())/2)+$(fc).scrollTop()}).next('.black_overlay').css({'display':'block','height': $(fc.document).height()});
			}
		}
		return false;
	},
	
	/**
	*
	* 代码高亮事件
	*/
	onPrettifyCode	:	function(e){
		var fc,doc,mxml,listTest;
		e.cancelBubble = true;
		e.returnValue = false;
		e.preventDefault();
		fc = top.glob.frame_content();
		
		doc = fc.document;
		
		mxml = doc.getElementById('mxmlSyntax');
		
		listTest = $('div.listing:first',doc);
		
		if(this.className.indexOf('highlight')>-1){
			$(this).removeClass('highlight').text('打开代码高亮');
			
			top.Allk.set('code_hightlight','none');
			
			if(top.glob.canBePrettify(fc)){
				listTest.length && $('div.listing',doc).removeClass('hight').find('pre:first').removeClass('prettyprint');
			
				mxml && $(mxml).removeClass('hight').find('pre:first').removeClass('prettyprint');
			}
		}else{
		
		
			$(this).addClass('highlight').text('关闭代码高亮');
			
			top.Allk.set('code_hightlight','true');
			
			if(top.glob.canBePrettify(fc)){
				if(mxml && mxml.className.indexOf('hight')  === -1){
					$(mxml).addClass('hight').find('pre:first').addClass('prettyprint lang-java');
				}
				if(listTest.length && listTest[0].className.indexOf('hight') === -1){
					$('div.listing',doc).addClass('hight').find('pre:first').addClass('prettyprint lang-java');
				}
				
				if(!fc.prettyRendred && (listTest.length || mxml)){
					try{
						top.prettyPrint();
						fc.prettyRendred = true;
					}catch(err){top.hightlightError()}
				}
			
			}
		}
	
	},
	
	/**
	*	当点右边 导航时
	* @method onRightNav
	* @param e{Event} jQuery合成的点击事件
	*/
	onRightNav	:	function(e){
		e.preventDefault();
		e.cancelBubble = true;
		e.returnValue = false;
		var hash = top.glob.getScrollTarget(this.href),
		frame = top.glob.frame_content();
		if(frame && frame.ready){
			frame.location.hash = hash;
		}
		return false;
	},
	
	/**
	*	这是一个空函数
	* @method onSearch
	* @param e {event}
	* @sync
	**/
	onSearch	: function(e){
		!e && (e = window.event);
		e.cancelBubble = true;
		var value = $('#search-livedocs',document).prop('value');
		if(value){
			window.open('http://cn.bing.com/search?q='+value ,'_blank');
		}
	},
	
	/**
	新的 Shim 将嵌入 filter.xml 文件

	@method onSwfReady
	@param obj{Object} {data:String, type:String, id:String} for swfReady;
	*/
	onSwfReady		: function(obj){
		//console.log('SWF Loaded')
		var fc = top.glob.frame_content();

		var doc = document;

		var resp = $.parseXML(obj.data);

		top.shim = Shim.inst;		//快速引用

		$("div#swfShimDom",doc).remove("div");

		try{top.Allk.init()}catch(err){alert("脚本没能正常工作!请刷新文档");return}; // 使用缓存..
		
		$('#whyEnglish a:first',doc).click(hs.onWhyEnglish);
	
		$('#prettifyCode a:first',doc).click(hs.onPrettifyCode);
		// 右 边第二行 ,的  方法,属性,示例.
		$('#subNav',doc).delegate('a','click',hs.onRightNav);
	
		// header 中间 大按钮
		$('#filterImg',doc).click(hs.onFilterImg);
	
		$('#packageName',doc).click(hs.onPackageNameClick);

		
		if(top.Allk.ks['code_hightlight'] === 'true'){
			// 参看 header.html 页面为默认设置
			$('#prettifyCode a:first',doc).addClass('highlight').text('关闭代码高亮');
		}
		
		
		
		parseXML(resp.getElementsByTagName("filters")[0].getElementsByTagName("runtimes")[0], "runtime", "Runtimes", rb_runtime_array, runtime_array);
		parseXML(resp.getElementsByTagName("filters")[0].getElementsByTagName("products")[0], "product", "Products", rb_product_array, product_array);
		
		
		filter_menu_change = true;
		if(fc && fc.ready){
			fc.initFilter();//如果这个函数也调用 doFilterStateChange1 会重复调用？？
		}
		
		xmlReady	=	true;

		top.doFilterStateChange1();//
	}	,
	/**
	*	当点击 header 显示过滤小窗口..
	* 
	* @sync
	*/
	onFilterImg : function(e){
	
		/*
			当 Filter_menu 不存在时 AND scrollTop
		
		*/
		e.cancelBubble = true;
		e.preventDefault();
		var fc = top.glob.frame_content();
		if(fc.location.href.lastIndexOf('about-me.html')>-1){
			return;
		}
		if(!fc.ready_filter_menu){
			createFilter_menu(fc);
		}
		if(this.className !=='filterImg_hide'){
			showHideFiltersCookie(true)
		}else{
			showHideFiltersCookie(false);
			// 更新
			if(filter_menu_change){
				top.doFilterStateChange1();
				top.updateState('runtime');
				top.updateState('product');
			}
		}
		
		return false;
	},
	
	onPackageNameClick : function(e){
		if(this.tagName.toLowerCase()==='a'){
			top.glob.change_classes(top.glob.getPath(this.href) + 'class-list.html');
		}
	},
	
	mainmenu_1:function(e){
		e.stopPropagation();
		if (e.target !== this){
			return;
		}else{
			e.preventDefault();
		}
		$(this).find('input:first').click();
	},
	// for input change check.只更新 Cookie值
	// e e.target
	// 根据 DOM 来筛选
	mainmenu_2:function(e){
		var o = $(e.target);
		var checked = o.prop('checked'); //
		var id = o.prop('id');
		var root,firstChild;
		
		filter_menu_change = true;// 未前 对
		
		if(e.target.type === 'radio'){
			// 设置
			var mat = id.split('_');
			if(mat[1] && mat[2]){
				top.Allk.set('filter_'+mat[1], mat.slice(2).join('.'));
			}
			root = o.parents('ul.nav:first').find('input:first');
			firstChild = $('#'+mat.slice(0,2).join('_'),o[0].ownerDocument);
			!firstChild.prop('checked') && firstChild.prop('checked',true);
			!root.prop('checked') && root.prop('checked',true);
		}else{
			switch(id){
				case 'rb_runtime':
				case 'rb_product':
					if(checked){
						//恢复,从Cookie中..onRuntimeChange会自动设置 Cookie的值
						!onRuntimeChange(id) && o.prop('checked',false);
						// 这里没有对 id 值的其他值进行检测.....也许 id 是其它非法值
						top.Allk.set(id.replace('rb','filter'),	'1');
					}else{
						//取消所有子项,只在界面上,而不更改子项的Cookie值
						o.parents('li:first').find('ul:first input').prop('checked',false);
						top.Allk.set(id.replace('rb','filter'),	'none');
					}
					break;
				default:
					root = o.parents('ul.nav:first').find('input:first');
					if(checked){
						// 子项第一个作为其默认值..
						firstChild = o.parents('li:first').find('ul:first input.prevChecked');
						if(firstChild.length){
							firstChild.removeClass('prevChecked');
						}else{
							firstChild = o.parents('li:first').find('ul:first input:first');
						}
						
						top.Allk.set(id.replace('rb','filter'),
							firstChild.prop('id').replace('rb_','').replace(/\w*?_/,'').replace(/_/g,'.')
						);
						
						firstChild.prop('checked',true);
						
						if(!root.prop('checked')){
							root.prop('checked',true);
							top.Allk.set(root.prop('id').replace('rb','filter'), 1);
						}
					}else{
						o.parents('li:first').find('ul:first input:checked:first').prop('checked',false).addClass('prevChecked');
						
						top.Allk.set(id.replace('rb','filter'),	'none');
						
						//只要 checkbox 没有一项选中..则根节点可以取消掉,但是不用设置Cookie
						if(root.parents('li:first').find('ul:first input:checkbox:checked').length === 0){
							root.prop('checked',false);
						}
				}
				break;
			}
		}
	
	},

	mainmenu_5 : 	function(){
		//Mouse In
		if($(this).find('ul:first').find('li').size()!==2)// 2  隐藏只有一个子项的
			$(this).find('ul:first').css({visibility: "visible",display: "none"}).show(400);
	},
	mainmenu_5_2 :	function(){
		//Mouse Out
		$(this).find('ul:first').css({visibility: "hidden"});
	}
};


//>>>>>>>>>>>>>>>>>>>>>>>>>>	FILTER.XML	>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
/**
* -----	
* @return {String} 返回一些html字符片段
****/
function parseXML(xmlNode, nodeName, uiName, rb_array, element_array){

	if(navigator.userAgent.toLowerCase().indexOf("msie 6") > -1 ){
		var isMSIE6 = true;
	}else if (navigator.userAgent.toLowerCase().indexOf("msie") > -1 ){
		var isMSIE = true;
	}

	var blockStart = '<li><a href="#" id="%%filter_submenu" class="%%submenu"><input type="checkbox" id="rb_%%name" checked=""/>%%heading</a><ul>';
	var blockEnd = ' </ul></li>';
	var divStart;
	if(uiName=="Runtimes"){
		divStart = '<ul class="nav"><li id="'+uiName+'Menu"><a href="#" id="'+uiName+'MenuA"><input type="checkbox"id="rb_'+nodeName+'" checked=""/>'+top.glob.literal.runtimesLabel+'</a><ul>';
	} else {
		divStart = '<ul class="nav"><li id="'+uiName+'Menu"><a href="#" id="'+uiName+'MenuA"><input type="checkbox"id="rb_'+nodeName+'" checked=""/>'+top.glob.literal.productsLabel+'</a><ul>';
	}
	
	var divEnd = '</ul></li></ul>'

	var radioString;
	if( isMSIE  || isMSIE6 ){	
		radioString = '<li %%styleNone><a href="#"><input type="radio" name="%%name" class="ieFilterRadio"  id="rb_%%name_%%version">%%description</a></li>';
	}else{
		radioString = '<li %%styleNone><a href="#"><input type="radio" name="%%name" class="filterRadio" id="rb_%%name_%%version" value="%%name %%version" checked="">%%description</a></li>';
    }
	
	var podBlockString = '';
	
	podBlockString += divStart;
	
	
	
	var items = xmlNode.getElementsByTagName(nodeName);
	
	
	
	for(var i=0 , len =items.length ; i< len;i++){
		var currentItems = items[i];
		var name=currentItems.getAttribute('name').toLowerCase();
		var heading=currentItems.getAttribute('heading');
		var versions = currentItems.getElementsByTagName("versions")[0].getElementsByTagName("version");
		if(versions.length==2){
			podBlockString += (((blockStart.replace(/%%name/g,name)).replace(/%%heading/g,heading)).replace(/%%submenu/g,"heading_noexists")).replace(/%%filter_submenu/g,"filter_nosubmenu");
		}
		else{
			podBlockString += (((blockStart.replace(/%%name/g,name)).replace(/%%heading/g,heading)).replace(/%%submenu/g,"heading_exists_exp")).replace(/%%filter_submenu/g,"filter_submenu");;
		}
		
		element_array.push(new arrayEntry(currentItems.getAttribute('name'),currentItems.getAttribute('default'),
		
		currentItems.getAttribute('topversion')));
		
		for(j=0, jlen = versions.length; j<jlen;j++){
			var versionNode = versions[j];
			var version=versionNode.getAttribute('name').toLowerCase();
			var description=versionNode.getElementsByTagName('description')[0].childNodes[0].nodeValue;
			var match=versionNode.getElementsByTagName('match');
			rb_array.push(  new rb_arrayEntry(name, version, match, description));
			
			var currentRadioString = radioString;
			currentRadioString = currentRadioString.replace(/%%name/g,name);
			currentRadioString = currentRadioString.replace(/%%version/g,version.replace(".", "_"));
			currentRadioString = currentRadioString.replace(/%%description/g,description);
			if(version=="none")
				currentRadioString = currentRadioString.replace(/%%styleNone/g,'style="display: none;"');
			else
				currentRadioString = currentRadioString.replace(/%%styleNone/g,"");
			podBlockString += currentRadioString;
		}
		podBlockString += blockEnd;
  	}
	podBlockString += divEnd;
	attrs[nodeName+'filter'] = podBlockString;
}


/**
*	-----
*	加载 过滤器到Nav面板.如果 fc.ready_filter_menu is false 将什么也不会改变
* @param args{String}
******/
function loadFilters(args)
{	

	// get  user's preferences from the cookies if we haven't yet
	var fc = top.glob.frame_content();
	
	// FC 中如果没有这些 DOM,	因为在IE中太卡,不能每次都创建这些东西.
	if(!fc.ready_filter_menu){
		return;
	}
	
	var filterStart = 0;
	
	if((filterStart = args.indexOf("filter_")) !== -1){
		var filterArgs = args.substring(filterStart);
		
		var anchorStart = filterArgs.indexOf("#");
		if(anchorStart !== -1){
			filterArgs = filterArgs.substring(0, anchorStart);
		}
		
		setFiltersWithURLArgs(filterArgs, fc);// 将会置所有的 filter_ 为 none,包括cookie中的的值
	}else{//g_user_prefs_loaded
		getUserPrefs(fc.document);
	}
}




// 这个函数只操作Cookie
function turnAllFiltersOff(doc){
 	var i,	len,	rb = rb_product_array;
	
	for(i=0,len = rb.length ; i < len; i += 1){
    	top.setFilterCookie("filter_"+rb[i].name, "none");
    	//setRadioButtonState(rb[i].name,rb[i].version, false ,doc);
    }
	
	rb	= rb_runtime_array;
	
	for(i=0,len = rb.length ; i < len; i += 1){
		top.setFilterCookie("filter_"+rb[i].name, "none" );	
		//setRadioButtonState(rb[i].name,rb[i].version, false ,doc);
	}
	$('#RuntimesMenu input:checked,#ProductsMenu input:checked',doc).prop('checked',false);
}


/**
*
*
****/
 function setFiltersWithURLArgs(filterSettings , fc){
		
	var i	,	args
	
	update = fc.ready_filter_menu,
	
	doc = fc.document;
	
	turnAllFiltersOff(doc);
	
	args = top.glob.getArgs(filterSettings);
	
	for(k in args){
		if( k.indexOf('filter_') === 0){
			top.setFilterCookie(k	,	args[k] );
		}
	}
	
	filter_menu_change = true;
	
	top.doFilterStateChange1();
	
	update && getUserPrefs(doc);
	
}


function defalutXMLFilter(){
	var ret = {};
	var i,len,array;
	array = runtime_array.concat(product_array);
	for(i=0,len = array.length; i < len;i++){
		ret[ array[i].name	] = array[i].defaultValue;
	}
	return ret;
} 
/**
*
*	根据 Cookie 的值 设置 过滤菜单,只是调整菜单,并没有进行文件过滤.
* @method getUserPrefs
*****/
function getUserPrefs(doc){
	var i,len,cks,k,kvalue;
	
	var topstate = false;
	
	cks = top.Allk.ks; // TODO: fckAll 只获得 CK_VALUE 下的值,没有检测 expires 

	
	if(cks['filter_runtime']!=='none'){
	// if !cks.hasOwnProperty('filter_runtime') && cks['filter_runtime']!=='none'
		for(i=0,len = runtime_array.length; i < len;i++){
			
			k = "filter_"+runtime_array[i].name;

			kvalue = cks.hasOwnProperty( k ) ? cks[k] : runtime_array[i].defaultValue;		
			
			
			k = '#rb_' + runtime_array[i].name;
			
			
			$(k,doc).prop("checked",kvalue !== 'none');
			
			
			if(!topstate && kvalue !== 'none'){
				topstate = true;
			}
			setRadioButtonState(runtime_array[i].name , kvalue , "checked"	, doc)
		}
		
		$('#rb_runtime',doc).prop('checked', topstate) ;
		top.updateState('runtime');
		topstate = false;
    }
	
	if(cks['filter_product']!=='none'){//跳过
		for(i=0,len = product_array.length; i < len;i++){
			k = "filter_"+product_array[i].name;

			kvalue = cks.hasOwnProperty( k ) ? cks[k] : product_array[i].defaultValue;		

			k = '#rb_' + product_array[i].name;
					
			$(k,doc).prop("checked",kvalue !== 'none');//CheckBox

			setRadioButtonState(product_array[i].name , kvalue , "checked"	,	doc);//Radio
			
			if(!topstate && kvalue !== 'none'){
				topstate = true;
			}
		}
		
		$('#rb_product',doc).prop('checked', topstate);
		top.updateState('product');
	}
	
	
}

/**
*
* 如何 destory 绑定 ,好像是一条  remove 语句就行了.. $("#nav",doc).find('*').andSelf().unbind();???
*/

function desctoryMainmenu(doc){

	$("#filter_panel_nf ul.nav input",doc).unbind();
	
	$("#filter_panel_nf ul.nav a",doc).unbind();
	
	$("#filter_panel_nf ul.nav li",doc).unbind();
}

function mainmenu(doc){	

$("#filter_panel_nf ul.nav ul",doc).css({display: "none"}); // Opera Fix
	
// onChangeAfter
$("#filter_panel_nf ul.nav input",doc).unbind().change(hs.mainmenu_2); // OnChange


$("#filter_panel_nf ul.nav a",doc).unbind().click(hs.mainmenu_1);//Click -Trigger li click


$("#filter_panel_nf ul.nav li",doc).unbind().hover(hs.mainmenu_5	,	hs.mainmenu_5_2);
}

/**
* 和 getuserprefs 方法基本一模一样.但是不操作DOM
*/
function onRuntimeChange(id){//onNavClick
	var i,len,cks,k,kvalue,rt,topstate = false;
	var fc = top.glob.frame_content();
	if(top.Allk.ks && fc.ready_filter_menu){
			
		cks = top.Allk.ks;
			
		rt = id === 'rb_runtime' ? runtime_array : product_array;
			
		for(i=0,len = rt.length; i < len;i++){//runtime_array
			k = "filter_"+rt[i].name;

			kvalue = cks.hasOwnProperty( k ) ? cks[k] : rt[i].defaultValue;//update rt[i] replace 'none'	

			k = '#rb_' + rt[i].name;
				
			$(k,fc.document).prop("checked",kvalue !== 'none');
			
			// ie 6 下 这个表达式好像有些问题
			if(!topstate && kvalue !== 'none'){
				topstate = true;
				
			}
			
			setRadioButtonState(rt[i].name, kvalue , true , fc.document);
		}
	}
	return topstate;
}

function createFilter_menu(fc){
	if(!fc.ready_filter_menu){
		$('body',fc.document).prepend(attrs.tp_filterTable);
		
		$('#runtimefilter',fc.document).html(attrs.runtimefilter);
		
		$('#productfilter',fc.document).html(attrs.productfilter);

		mainmenu(fc.document);
		
		fc.ready_filter_menu = true;
		
		$('#RuntimesMenu input:checked,#ProductsMenu input:checked',fc.document).prop('checked',false);
		
		getUserPrefs(fc.document);
	}
}



function filterclick(stateType){
	top.updateStateOnClick(stateType);// 更新值到 Cookie
	top.updateState(stateType);	// 更新 描述内容
	top.doFilterStateChange1();
}
function showHideFilters(){
	if(top.glob.frame_content().document.getElementById("filter_panel_nf").style.display !=="none"){
		showHideFiltersCookie(false);
	} else {                       
		showHideFiltersCookie(true);
	}
}

function showHideFiltersCookie(show){
	var st;
	var fc = top.glob.frame_content();//doc
	if(show && fc.ready_filter_menu){
		st =$(fc).scrollTop();
		if(st > 10){
			$({'foo':st}).animate({'foo' : 0},{step : fc.scrollFcStep,duration : st < 500 ? 400 : 800});
		}else{
			var filterImg = document.getElementById("filterImg");// on frame_header document
			filterImg.className="filterImg_hide";
			filterImg.title = top.glob.literal.hideFilters;
			filterImgText.innerHTML = top.glob.literal.hideFilters;
			$("#filter_panel_nf",fc.document).slideDown(500);
			setShowHideFilters("showfilters");
		}
	} else {                       
		var filterImg = document.getElementById("filterImg");
		filterImg.className="filterImg_show";
		filterImg.title = top.glob.literal.showFilters;
		filterImgText.innerHTML = top.glob.literal.showFilters;
		$("#filter_panel_nf",fc.document).slideUp(500);
		setShowHideFilters("hidefilters");
	}

}
function setShowHideFilters(view) {
	var expire = new Date();
	expire.setDate(expire.getDate()+90); // Cookie expires after 90 days
	top.Allk.set('asdocs_filter_view',view,expire.getTime());
}
//<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
// 必须要等到文档加载完成..因为这里会初使化 一些 html 标签
//window.onload = function(){  将这个脚本引用移到页尾.

	ready = true;	// DOM READY
	
	top.done(1);	//top.glob.prop.HEADER 直接调用
	
	$('div.logoION',document).append('<div id="swfShimDom"></div>');
	
	if(location.href.indexOf("mk:@") === 0 || location.href.indexOf("file:")===0){
		$('#chm_index',document).removeClass('hidden');	
	}
	
	if(!/^file/.test(location.href)){///^mk:@MSITStore/i.test(window.location.href)
			
			// 现在这个页面被固定了
			if(swfobject.hasFlashPlayerVersion('10.3.0')){

				Shim.render({
					context: hs,
					func: hs.onSwfReady
				});

			}else{
				top.onunload = null;
				top.glob.frame_content().onunload = null;			
				top.document.write("<html><head><title>Error</title></head><body style='margin:0;padding:0; background-color:#1D1D1D'><div style='position:absolute; top:40%; left:33%;background-color:#EE3F3F;padding:1em 2em;font-size:15px; color:#FEFEFE; border:1px solid #DDD'>本文档需要安装 <b>Flash Player 10</b> 及以上版本<br /><font style='font-size:12px'>因为有一个很小的功能需要 Flash 才能让文档正常显示!</font></div></body></html>");
			}
	}
//};