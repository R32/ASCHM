//top.location.hash = encodeURIComponent(location.href);// CHROME 下怎么改变 hash 也会引起 重载???
if(!window.jQuery){
	window.$ = window.jQuery = top.jQuery;	
}
/**
*	过滤菜单是否就绪,因为在IE 中卡,所以打算是点击时加载,除了在 index 页面..  
*@Property ready_filter_menu
*@type {Boolean}
*/
var ready_filter_menu = false;
var prettyRendred = false;
var ready	=	false;

var ECLIPSE_FRAME_NAME = null;

function isEclipse(){return false}
var alternate = isEclipse;	//空函数..
var titleBar_setSubTitle = isEclipse;

var hs = {
	/**
	*	隐藏和显示 继承属性,以前的方法,
	* @method onShowHideLink
	*/
	onShowHideLink : function(e){
		var pf,id,tb;
		e.cancelBubble = true;
		e.preventDefault();
		e.returnValue = false;
		
		id = this.parentNode.id;
		if(id){
			pf = id.substring(0,4)
			tb = '#summaryTable' + id.substring(13); //	'showInherited'.length === 13 
			
			$('#'+id,document).hide();
			
			if(pf === 'show'){
				// 显示 继承 属性
				$('#hide'+id.substring(4),document).show(); 
				
				$(tb,document).find('tr.hide'+id.substring(4)).show();
				
				$(tb,document).hasClass('hide'+id.substring(4)) && $(tb,document).show();
				
	
				hs.setRowColors(true , id.substring(13));
				
			}else{//隐藏
				$('#show'+id.substring(4),document).show(); //按钮
				
				$(tb,document).find('tr.'+id).hide();	// tr
				
				$(tb,document).hasClass(id) && $(tb,document).hide();
				
				hs.setRowColors(false, id.substring(13));
				
			}
		}
		return false;
	},
	
	/**
	*
	* 显示和隐藏 mxml 示例
	* @
	*****/
	onMxmlShowHide	: function(e){
		!e && (e = event);
		if(this.tagName.toLowerCase()!=='a'){
			return;
		}
		e.preventDefault && e.preventDefault();
		e.cancelBubble = true;
		e.returnValue = false;
		var node,showLk,hideLk,doc = this.ownerDocument;
		if(this.parentNode.id.indexOf('show')>-1){// 点击 showMxmlLink innerText = 显示 
			node = 'block';
			showLk = 'none';
			hideLk = 'inline';
		}else{
			node = 'none';
			showLk = 'inline';
			hideLk = 'none';
		}
		doc.getElementById("mxmlSyntax").style.display = node;
		doc.getElementById("showMxmlLink").style.display = showLk;
		doc.getElementById("hideMxmlLink").style.display = hideLk;
		return false;
	},
	/**
	*
	* 隔行换色 , 忽略 display === 'none' 的属性
	*/
	setRowColors : function (show, selectorText) {
		var rowColor = "#F2F2F2";
		var table = document.getElementById("summaryTable" + selectorText);
		var i, len,count;
		if (table !== null) {
			for (i = 1 , count = 1,len = table.rows.length ; i < len; i += 1) {
				if (show || table.rows[i].className.indexOf("hideInherited") === -1) {
					if(table.rows[i].style.display !== 'none') {
						count+=1;
						table.rows[i].bgColor = (count & 1) ? rowColor : '#FFFFFF';
					}
				}
			}
		}
	} ,
	
	// 移除本页的一些事件
	onUnLoad	: function(e){
		var fh = top.glob.frame_header();
			if(fh && fh.desctoryMainmenu){
				fh.desctoryMainmenu(document);
			}
		$('img.showHideLinkImage',document).parent().unbind();//好像用不着处理这种事件
	}
}

/**
*	content 页面加载后会自动调用这个方法. TODO: 由于要等到 header 加载完成之后这个方法才可以被使用,后续 加入ready 
*/
function titleBar_setSubNav(){
	top.titleBar_setSubNav.apply(null,$.makeArray(arguments))
}

// 未使用
function setInheritedVisible(doc, show, selectorText) {
	var pf2 = 'Inherited' + selectorText;
	var tb_s	= '#summaryTable' + selectorText;
	
	if(show){
		// 显示 继承 属性
		$('#hide'+pf2,doc).show();
		$('#show'+pf2,doc).hide();
				
		$(tb_s,doc).find('tr.hide'+pf2).show();
				
		$(tb_s,doc).hasClass('hide'+pf2) && $(tb_s,doc).show();
				
		hs.setRowColors(true , selectorText);
		
		//Cookie set
	}else{//隐藏
		$('#hide'+pf2,doc).hide();
		$('#show'+pf2,doc).show(); //按钮
				
		$(tb_s,doc).find('tr.hide'+pf2).hide();	// tr
		$(tb_s,doc).hasClass('hide'+pf2) && $(tb_s,doc).hide();
		hs.setRowColors(false, selectorText);
		//Cookie set
	}
}
// 未使用
function showHideInherited() {
 	var cs = top.Allk.ks;
	var doc = document;
	setInheritedVisible(doc,cs["showInheritedConstant"] === "true", "Constant");
	setInheritedVisible(doc,cs["showInheritedProtectedConstant"] === "true", "ProtectedConstant");
	setInheritedVisible(doc,cs["showInheritedProperty"] === "true", "Property");
	setInheritedVisible(doc,cs["showInheritedProtectedProperty"] === "true", "ProtectedProperty");
	setInheritedVisible(doc,cs["showInheritedMethod"] === "true", "Method");
	setInheritedVisible(doc,cs["showInheritedProtectedMethod"] === "true", "ProtectedMethod");
	setInheritedVisible(doc,cs["showInheritedEvent"] === "true", "Event");
	setInheritedVisible(doc,cs["showInheritedcommonStyle"] === "true", "commonStyle");
	setInheritedVisible(doc,cs["showInheritedsparkStyle"] === "true", "sparkStyle");
	setInheritedVisible(doc,cs["showInheritedhaloStyle"] === "true", "haloStyle");
	setInheritedVisible(doc,cs["showInheritedmobileStyle"] === "true", "mobileStyle");
	setInheritedVisible(doc,cs["showInheritedSkinPart"] === "true", "SkinPart");
	setInheritedVisible(doc,cs["showInheritedSkinState"] === "true", "SkinState");
	setInheritedVisible(doc,cs["showInheritedEffect"] === "true", "Effect");
}


function setMXMLOnly() {
	var node,showLink,hideLink;
	if (top.Allk.ks && top.Allk.get("showMXML") === "false") {
		top.toggleMXMLOnly(document);//实际上这个函数根本不会被调用，因为没有根本没设置过相关 Cookie
	}
	// 这里绑定事件
	node = document.getElementById('mxmlSyntax');
	showLink = document.getElementById('showMxmlLink');
	hideLink = document.getElementById('hideMxmlLink');
	if(node && showLink && hideLink){
		try{
		showLink.getElementsByTagName('a')[0].onclick = hs.onMxmlShowHide;
		hideLink.getElementsByTagName('a')[0].onclick = hs.onMxmlShowHide;
		}catch(err){};
	}
}



function scrollFcStep(now,fx){
	$(document).scrollTop(now);
}
/**
*
* 
*
**/
function initFilter(){
	var mxml,listest,fh = top.glob.frame_header();
	fh.showHideFiltersCookie(top.Allk.get("asdocs_filter_view") !== "hidefilters" ?  true : false);
	if(location.href.lastIndexOf("package-summary.html") > -1 || location.href.lastIndexOf("class-summary.html") > -1){
		// !fh.filter_menu_change 是为了避免重复调用.header.js 在调用时会将这个参数置 1
		!fh.filter_menu_change && top.doFilterFrameContent(document,	top.filterCookie('runtime'),	top.filterCookie('product'), fh.rb_runtime_array,	fh.rb_product_array);
	}
	
	if(top.Allk.ks['code_hightlight'] ==='true' && top.glob.canBePrettify(window)){
		mxml = document.getElementById('mxmlSyntax');
		
		listest = $('div.listing:first',document);
		
		listest.length && $('div.listing',document).addClass('hight').find('pre:first').addClass('prettyprint lang-java');
		mxml && $(mxml).addClass('hight').find('pre:first').addClass('prettyprint lang-java');
		
		if(!prettyRendred && (listest.length || mxml)){
			try{
				top.prettyPrint();
				prettyRendred = true;
			}catch(err){top.hightlightError();}
		}
	}
}





window.onload = function(){
	
	window.onload = null;

	ready = true;
	
	var url = top.glob.getBaseUrl(location.href);// 不包含 hash 值
	
	top.done(4);
	
	//将URL 值以 #!形式传到 主框架上去
	
	//top.glob.setHash(url, top.glob.getScrollTarget(location.href) );	// 为什么在  chrome 下改动 hash值会自动刷新?? CHROME Bug 

	//  显示 和隐藏 Inherited
	$('img.showHideLinkImage',document).parent().click(hs.onShowHideLink);

	
	if(location.href.indexOf('package-detail') === -1){// package-detail 已经自已做好了隔行换色的
		// 隔行换色
		$('table.summaryTable',document).each(function(i,dom){
			// 'summaryTable'.length === 12
			// true 还是 false ,从Cookie 中取值??? 
			hs.setRowColors(false	,	dom.id.substring(12));
		});
	}
	
	top.titleBar_setSubTitle(top.glob.getPath(url) , true);
	
	var fh = top.glob.frame_header();
	if(fh && fh.xmlReady){
		// 直接加载 XML 数据
		initFilter();
	}
	window.onunload = hs.onUnLoad;
}

