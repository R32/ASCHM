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

			top.DummyCookie.set('code_hightlight','none');

			if(top.glob.canBePrettify(fc)){
				listTest.length && $('div.listing',doc).removeClass('hight').find('pre:first').removeClass('prettyprint');

				mxml && $(mxml).removeClass('hight').find('pre:first').removeClass('prettyprint');
			}
		}else{


			$(this).addClass('highlight').text('关闭代码高亮');

			top.DummyCookie.set('code_hightlight','true');

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
	@method onReady
	*/
	onReady		: function(){
		// haxelib run html-inline filter.xml > filter.inline.xml
		var filterXML = '<?xml version="1.0" encoding="UTF-8"?><filters><runtimes><name>Runtimes</name><runtime topversion="18.0" name="air" heading="AIR" default="18.0"><versions><version name="18.0"><match value="air::"/><match value="flash::"/><description>AIR 18.0 和更早版本</description></version><version name="17.0"><match value="air::17.0"/><match value="air::16.0"/><match value="air::15.0"/><match value="air::14.0"/><match value="air::13.0"/><match value="air::4.0"/><match value="air::3.9"/><match value="air::3.8"/><match value="air::3.7"/><match value="air::3.6"/><match value="air::3.5"/><match value="air::3.4"/><match value="air::3.3"/><match value="air::3.2"/><match value="air::3.1"/><match value="air::3#"/><match value="air::2"/><match value="air::1"/><match value="flash::11.2"/><match value="flash::11.1"/><match value="flash::11#"/><match value="flash::10"/><match value="flash::9"/><description>AIR 17.0 和更早版本</description></version><version name="16.0"><match value="air::16.0"/><match value="air::15.0"/><match value="air::14.0"/><match value="air::13.0"/><match value="air::4.0"/><match value="air::3.9"/><match value="air::3.8"/><match value="air::3.7"/><match value="air::3.6"/><match value="air::3.5"/><match value="air::3.4"/><match value="air::3.3"/><match value="air::3.2"/><match value="air::3.1"/><match value="air::3#"/><match value="air::2"/><match value="air::1"/><match value="flash::11.2"/><match value="flash::11.1"/><match value="flash::11#"/><match value="flash::10"/><match value="flash::9"/><description>AIR 16.0 和更早版本</description></version><version name="15.0"><match value="air::15.0"/><match value="air::14.0"/><match value="air::13.0"/><match value="air::4.0"/><match value="air::3.9"/><match value="air::3.8"/><match value="air::3.7"/><match value="air::3.6"/><match value="air::3.5"/><match value="air::3.4"/><match value="air::3.3"/><match value="air::3.2"/><match value="air::3.1"/><match value="air::3#"/><match value="air::2"/><match value="air::1"/><match value="flash::11.2"/><match value="flash::11.1"/><match value="flash::11#"/><match value="flash::10"/><match value="flash::9"/><description>AIR 15.0 和更早版本</description></version><version name="14.0"><match value="air::14.0"/><match value="air::13.0"/><match value="air::4.0"/><match value="air::3.9"/><match value="air::3.8"/><match value="air::3.7"/><match value="air::3.6"/><match value="air::3.5"/><match value="air::3.4"/><match value="air::3.3"/><match value="air::3.2"/><match value="air::3.1"/><match value="air::3#"/><match value="air::2"/><match value="air::1"/><match value="flash::11.2"/><match value="flash::11.1"/><match value="flash::11#"/><match value="flash::10"/><match value="flash::9"/><description>AIR 14.0 和更早版本</description></version><version name="13.0"><match value="air::13.0"/><match value="air::4.0"/><match value="air::3.9"/><match value="air::3.8"/><match value="air::3.7"/><match value="air::3.6"/><match value="air::3.5"/><match value="air::3.4"/><match value="air::3.3"/><match value="air::3.2"/><match value="air::3.1"/><match value="air::3#"/><match value="air::2"/><match value="air::1"/><match value="flash::11.2"/><match value="flash::11.1"/><match value="flash::11#"/><match value="flash::10"/><match value="flash::9"/><description>AIR 13.0 和更早版本</description></version><version name="4.0"><match value="air::4.0"/><match value="air::3.9"/><match value="air::3.8"/><match value="air::3.7"/><match value="air::3.6"/><match value="air::3.5"/><match value="air::3.4"/><match value="air::3.3"/><match value="air::3.2"/><match value="air::3.1"/><match value="air::3#"/><match value="air::2"/><match value="air::1"/><match value="flash::11.2"/><match value="flash::11.1"/><match value="flash::11#"/><match value="flash::10"/><match value="flash::9"/><description>AIR 4.0 和更早版本</description></version><version name="3.9"><match value="air::3.9"/><match value="air::3.8"/><match value="air::3.7"/><match value="air::3.6"/><match value="air::3.5"/><match value="air::3.4"/><match value="air::3.3"/><match value="air::3.2"/><match value="air::3.1"/><match value="air::3#"/><match value="air::2"/><match value="air::1"/><match value="flash::11.2"/><match value="flash::11.1"/><match value="flash::11#"/><match value="flash::10"/><match value="flash::9"/><description>AIR 3.9 和更早版本</description></version><version name="3.8"><match value="air::3.8"/><match value="air::3.7"/><match value="air::3.6"/><match value="air::3.5"/><match value="air::3.4"/><match value="air::3.3"/><match value="air::3.2"/><match value="air::3.1"/><match value="air::3#"/><match value="air::2"/><match value="air::1"/><match value="flash::11.2"/><match value="flash::11.1"/><match value="flash::11#"/><match value="flash::10"/><match value="flash::9"/><description>AIR 3.8 和更早版本</description></version><version name="3.7"><match value="air::3.7"/><match value="air::3.6"/><match value="air::3.5"/><match value="air::3.4"/><match value="air::3.3"/><match value="air::3.2"/><match value="air::3.1"/><match value="air::3#"/><match value="air::2"/><match value="air::1"/><match value="flash::11.2"/><match value="flash::11.1"/><match value="flash::11#"/><match value="flash::10"/><match value="flash::9"/><description>AIR 3.7 和更早版本</description></version><version name="3.6"><match value="air::3.6"/><match value="air::3.5"/><match value="air::3.4"/><match value="air::3.3"/><match value="air::3.2"/><match value="air::3.1"/><match value="air::3#"/><match value="air::2"/><match value="air::1"/><match value="flash::11.2"/><match value="flash::11.1"/><match value="flash::11#"/><match value="flash::10"/><match value="flash::9"/><description>AIR 3.6 和更早版本</description></version><version name="3.5"><match value="air::3.5"/><match value="air::3.4"/><match value="air::3.3"/><match value="air::3.2"/><match value="air::3.1"/><match value="air::3#"/><match value="air::2"/><match value="air::1"/><match value="flash::11.2"/><match value="flash::11.1"/><match value="flash::11#"/><match value="flash::10"/><match value="flash::9"/><description>AIR 3.5 和更早版本</description></version><version name="3.4"><match value="air::3.4"/><match value="air::3.3"/><match value="air::3.2"/><match value="air::3.1"/><match value="air::3#"/><match value="air::2"/><match value="air::1"/><match value="flash::11.2"/><match value="flash::11.1"/><match value="flash::11#"/><match value="flash::10"/><match value="flash::9"/><description>AIR 3.4 和更早版本</description></version><version name="3.3"><match value="air::3.3"/><match value="air::3.2"/><match value="air::3.1"/><match value="air::3#"/><match value="air::2"/><match value="air::1"/><match value="flash::11.2"/><match value="flash::11.1"/><match value="flash::11#"/><match value="flash::10"/><match value="flash::9"/><description>AIR 3.3 和更早版本</description></version><version name="3.2"><match value="air::3.2"/><match value="air::3.1"/><match value="air::3#"/><match value="air::2"/><match value="air::1"/><match value="flash::11.2"/><match value="flash::11.1"/><match value="flash::11#"/><match value="flash::10"/><match value="flash::9"/><description>AIR 3.2 和更早版本</description></version><version name="3.1"><match value="air::3.1"/><match value="air::3#"/><match value="air::2"/><match value="air::1"/><match value="flash::11.1"/><match value="flash::11#"/><match value="flash::10"/><match value="flash::9"/><description>AIR 3.1 和更早版本</description></version><version name="3"><match value="air::3#"/><match value="air::2"/><match value="air::1"/><match value="flash::11#"/><match value="flash::10"/><match value="flash::9"/><description>AIR 3 和更早版本</description></version><version name="2.7"><match value="air::2.7"/><match value="air::2.6"/><match value="air::2.5"/><match value="air::2.0.2"/><match value="air::2.0#"/><match value="air::2#"/><match value="air::1"/><match value="flash::10.3#"/><match value="flash::10.2#"/><match value="flash::10.1#"/><match value="flash::10#"/><match value="flash::9"/><description>AIR 2.7 和更早版本</description></version><version name="2.6"><match value="air::2.6"/><match value="air::2.5"/><match value="air::2.0.2"/><match value="air::2.0#"/><match value="air::2#"/><match value="air::1"/><match value="flash::10.2#"/><match value="flash::10.1#"/><match value="flash::10#"/><match value="flash::9"/><description>AIR 2.6 和更早版本</description></version><version name="2.5"><match value="air::2.5"/><match value="air::2.0.2"/><match value="air::2.0#"/><match value="air::2#"/><match value="air::1"/><match value="flash::10.1#"/><match value="flash::10#"/><match value="flash::9"/><description>AIR 2.5 和更早版本</description></version><version name="2"><match value="air::2.0.2"/><match value="air::2.0#"/><match value="air::2#"/><match value="air::1"/><match value="flash::10#"/><match value="flash::9"/><description>AIR 2 和更早版本</description></version><version name="1.5"><match value="air::1.5"/><match value="air::1.1"/><match value="air::1.0"/><match value="flash::10#"/><match value="flash::9"/><description>AIR 1.5 和更早版本</description></version><version name="1.1"><match value="air::1.1"/><match value="air::1.0"/><match value="flash::9"/><description>AIR 1.1 和更早版本</description></version><version name="none"><description>不包含 AIR </description></version></versions></runtime><runtime topversion="18.0" name="flashplayer" heading="Flash Player" default="18.0"><versions><version name="18.0"><match value="flash::"/><description>Flash Player 18.0 和更早版本</description></version><version name="17.0"><match value="flash::17.0"/><match value="flash::16.0"/><match value="flash::15.0"/><match value="flash::14.0"/><match value="flash::13.0"/><match value="flash::12.0"/><match value="flash::11.9"/><match value="flash::11.8"/><match value="flash::11.7"/><match value="flash::11.6"/><match value="flash::11.5"/><match value="flash::11.4"/><match value="flash::11.3"/><match value="flash::11.2"/><match value="flash::11.1"/><match value="flash::11#"/><match value="flash::10"/><match value="flash::9"/><description>Flash Player 17.0 和更早版本</description></version><version name="16.0"><match value="flash::16.0"/><match value="flash::15.0"/><match value="flash::14.0"/><match value="flash::13.0"/><match value="flash::12.0"/><match value="flash::11.9"/><match value="flash::11.8"/><match value="flash::11.7"/><match value="flash::11.6"/><match value="flash::11.5"/><match value="flash::11.4"/><match value="flash::11.3"/><match value="flash::11.2"/><match value="flash::11.1"/><match value="flash::11#"/><match value="flash::10"/><match value="flash::9"/><description>Flash Player 16.0 和更早版本</description></version><version name="15.0"><match value="flash::15.0"/><match value="flash::14.0"/><match value="flash::13.0"/><match value="flash::12.0"/><match value="flash::11.9"/><match value="flash::11.8"/><match value="flash::11.7"/><match value="flash::11.6"/><match value="flash::11.5"/><match value="flash::11.4"/><match value="flash::11.3"/><match value="flash::11.2"/><match value="flash::11.1"/><match value="flash::11#"/><match value="flash::10"/><match value="flash::9"/><description>Flash Player 15.0 和更早版本</description></version><version name="14.0"><match value="flash::14.0"/><match value="flash::13.0"/><match value="flash::12.0"/><match value="flash::11.9"/><match value="flash::11.8"/><match value="flash::11.7"/><match value="flash::11.6"/><match value="flash::11.5"/><match value="flash::11.4"/><match value="flash::11.3"/><match value="flash::11.2"/><match value="flash::11.1"/><match value="flash::11#"/><match value="flash::10"/><match value="flash::9"/><description>Flash Player 14.0 和更早版本</description></version><version name="13.0"><match value="flash::13.0"/><match value="flash::12.0"/><match value="flash::11.9"/><match value="flash::11.8"/><match value="flash::11.7"/><match value="flash::11.6"/><match value="flash::11.5"/><match value="flash::11.4"/><match value="flash::11.3"/><match value="flash::11.2"/><match value="flash::11.1"/><match value="flash::11#"/><match value="flash::10"/><match value="flash::9"/><description>Flash Player 13.0 和更早版本</description></version><version name="12.0"><match value="flash::12.0"/><match value="flash::11.9"/><match value="flash::11.8"/><match value="flash::11.7"/><match value="flash::11.6"/><match value="flash::11.5"/><match value="flash::11.4"/><match value="flash::11.3"/><match value="flash::11.2"/><match value="flash::11.1"/><match value="flash::11#"/><match value="flash::10"/><match value="flash::9"/><description>Flash Player 12.0 和更早版本</description></version><version name="11.9"><match value="flash::11.9"/><match value="flash::11.8"/><match value="flash::11.7"/><match value="flash::11.6"/><match value="flash::11.5"/><match value="flash::11.4"/><match value="flash::11.3"/><match value="flash::11.2"/><match value="flash::11.1"/><match value="flash::11#"/><match value="flash::10"/><match value="flash::9"/><description>Flash Player 11.9 和更早版本</description></version><version name="11.8"><match value="flash::11.8"/><match value="flash::11.7"/><match value="flash::11.6"/><match value="flash::11.5"/><match value="flash::11.4"/><match value="flash::11.3"/><match value="flash::11.2"/><match value="flash::11.1"/><match value="flash::11#"/><match value="flash::10"/><match value="flash::9"/><description>Flash Player 11.8 和更早版本</description></version><version name="11.7"><match value="flash::11.7"/><match value="flash::11.6"/><match value="flash::11.5"/><match value="flash::11.4"/><match value="flash::11.3"/><match value="flash::11.2"/><match value="flash::11.1"/><match value="flash::11#"/><match value="flash::10"/><match value="flash::9"/><description>Flash Player 11.7 和更早版本</description></version><version name="11.6"><match value="flash::11.6"/><match value="flash::11.5"/><match value="flash::11.4"/><match value="flash::11.3"/><match value="flash::11.2"/><match value="flash::11.1"/><match value="flash::11#"/><match value="flash::10"/><match value="flash::9"/><description>Flash Player 11.6 和更早版本</description></version><version name="11.5"><match value="flash::11.5"/><match value="flash::11.4"/><match value="flash::11.3"/><match value="flash::11.2"/><match value="flash::11.1"/><match value="flash::11#"/><match value="flash::10"/><match value="flash::9"/><description>Flash Player 11.5 和更早版本</description></version><version name="11.4"><match value="flash::11.4"/><match value="flash::11.3"/><match value="flash::11.2"/><match value="flash::11.1"/><match value="flash::11#"/><match value="flash::10"/><match value="flash::9"/><description>Flash Player 11.4 和更早版本</description></version><version name="11.3"><match value="flash::11.3"/><match value="flash::11.2"/><match value="flash::11.1"/><match value="flash::11#"/><match value="flash::10"/><match value="flash::9"/><description>Flash Player 11.3 和更早版本</description></version><version name="11.2"><match value="flash::11.2"/><match value="flash::11.1"/><match value="flash::11#"/><match value="flash::10"/><match value="flash::9"/><description>Flash Player 11.2 和更早版本</description></version><version name="11.1"><match value="flash::11.1"/><match value="flash::11#"/><match value="flash::10"/><match value="flash::9"/><description>Flash Player 11.1 和更早版本</description></version><version name="11"><match value="flash::11#"/><match value="flash::10"/><match value="flash::9"/><description>Flash Player 11 和更早版本</description></version><version name="10.3"><match value="flash::10.3"/><match value="flash::10.2"/><match value="flash::10.1"/><match value="flash::10#"/><match value="flash::9"/><description>Flash Player 10.3 和更早版本</description></version><version name="10.2"><match value="flash::10.2"/><match value="flash::10.1"/><match value="flash::10#"/><match value="flash::9"/><description>Flash Player 10.2 和更早版本</description></version><version name="10.1"><match value="flash::10.1"/><match value="flash::10#"/><match value="flash::9"/><description>Flash Player 10.1 和更早版本</description></version><version name="10"><match value="flash::10#"/><match value="flash::9"/><description>Flash Player 10 和更早版本</description></version><version name="9"><match value="flash::9"/><description>Flash Player 9 和更早版本</description></version><version name="none"><description>不包含 Flash Player </description></version></versions></runtime><runtime topversion="4" name="flashlite" heading="Flash Lite" default="4"><versions><version name="4"><match value="Lite::4"/><description>Flash Lite 4</description></version><version name="none"><description>不包含 Flash Lite </description></version></versions></runtime></runtimes><products><name>Products</name><product topversion="4.6" name="flex" heading="Flex" default="4.6"><versions><version name="4.6"><match value="flex::"/><description>Flex 4.6 和更早版本</description></version><version name="4.5.1"><match value="flex::4.5"/><match value="flex::4.1"/><match value="flex::4#"/><match value="flex::3"/><description>Flex 4.5.1 和更早版本</description></version><version name="4.1"><match value="flex::4.1"/><match value="flex::4#"/><match value="flex::3"/><description>Flex 4.1 和更早版本</description></version><version name="4"><match value="flex::4#"/><match value="flex::3"/><description>Flex 4 和更早版本</description></version><version name="3"><match value="flex::3"/><description>Flex 3</description></version><version name="none"><description>不包含 Flex </description></version></versions></product><product topversion="cs6" name="flash" heading="Flash Professional" default="cs6"><versions><version name="cs6"><match value="flash::"/><description>Flash Pro CS6 和更早版本</description></version><version name="cs5.5"><match value="flash::cs5"/><match value="flash::cs4"/><match value="flash::cs3"/><description>Flash Pro CS5.5 和更早版本</description></version><version name="cs5"><match value="flash::cs5#"/><match value="flash::cs4"/><match value="flash::cs3"/><description>Flash Pro CS5 和更早版本</description></version><version name="cs4"><match value="flash::cs4"/><match value="flash::cs3"/><description>Flash Pro CS4 和更早版本</description></version><version name="cs3"><match value="flash::cs3"/><description>Flash Pro CS3 和更早版本</description></version><version name="none"><description>不包含 Flash Professional </description></version></versions></product><product topversion="4.6" name="livecycle" heading="LiveCycle Data Services" default="none"><versions><version name="4.6"><match value="lcds::4.6"/><match value="lcds::4.5"/><match value="lcds::4"/><match value="lcds::3.1"/><match value="lcds::3#"/><description>ADEP Data Services for Java EE 4.6 和更早版本</description></version><version name="3.1"><match value="lcds::3.1"/><match value="lcds::3#"/><description>LiveCycle Data Services 3.1 和更早版本</description></version><version name="3"><match value="lcds::3#"/><description>LiveCycle Data Services 3</description></version><version name="none"><description>不包含 LiveCycle Data Services </description></version></versions></product><product topversion="10.0.1" name="livecyclees" heading="Adobe Digital Enterprise Platform or LiveCycle" default="none"><versions><version name="10.0.1"><match value="aesmobile::10.0.1"/><match value="lcmosaic::10"/><match value="lcrca::10"/><match value="lcap::10"/><match value="lcdct::10"/><match value="lcacm::10"/><match value="lcamg::10"/><match value="lcexm::10"/><match value="aesexm::10"/><match value="aesworkspace::10"/><match value="aesguides::10"/><match value="aesrca::10"/><match value="aesprm::10"/><match value="aespm::10"/><match value="aesaxm::10"/><match value="aescon::10"/><match value="aessec::10"/><match value="aesgravity::10"/><match value="lcmosaic::9.5"/><match value="aesworkspace::9"/><match value="aesguides::9"/><match value="lcrca::9.5"/><match value="lcap::9.5"/><match value="lcexm::9.5"/><match value="lcamg::9.5"/><match value="lcacm::9.5"/><match value="lcdct::9.5"/><match value="lces::ES2"/><match value="lcds::4"/><match value="lcds::4.6"/><match value="lcds::4.5"/><match value="lcds::3"/><match value="flex::4.6"/><match value="flex::4.5"/><match value="flex::4"/><match value="flex::3"/><description>ADEP version 10.0.1 和更早版本</description></version><version name="10.0"><match value="lcmosaic::10"/><match value="lcrca::10"/><match value="lcap::10"/><match value="lcdct::10"/><match value="lcacm::10"/><match value="lcamg::10"/><match value="lcexm::10"/><match value="aesexm::10"/><match value="aesworkspace::10"/><match value="aesguides::10"/><match value="aesrca::10"/><match value="aesprm::10"/><match value="aespm::10"/><match value="aesaxm::10"/><match value="aescon::10"/><match value="aessec::10"/><match value="aesgravity::10"/><match value="lcmosaic::9.5"/><match value="aesworkspace::9"/><match value="aesguides::9"/><match value="lcrca::9.5"/><match value="lcap::9.5"/><match value="lcexm::9.5"/><match value="lcamg::9.5"/><match value="lcacm::9.5"/><match value="lcdct::9.5"/><match value="lces::ES2"/><match value="lcds::4"/><match value="lcds::4.5"/><match value="lcds::3"/><match value="flex::4"/><match value="flex::3"/><description>ADEP version 10.0 和更早版本</description></version><version name="ES2.5"><match value="lces::ES2"/><match value="lcmosaic::9.5"/><match value="lcrca::9.5"/><match value="lcap::9.5"/><match value="lcexm::9.5"/><match value="lcamg::9.5"/><match value="lcacm::9.5"/><match value="lcdct::9.5"/><match value="aesworkspace::9"/><match value="aesguides::9"/><description>LiveCycle ES2.5 (version 9.5) 和更早版本</description></version><version name="ES2"><match value="aesworkspace::9"/><match value="aesguides::9"/><match value="lces::ES2"/><description>LiveCycle ES2 (version 9)</description></version><version name="none"><description>不包含 Adobe Digital Enterprise Platform 或 LiveCycle </description></version></versions></product><product topversion="4" name="blazeds" heading="Blaze DS" default="none"><versions><version name="4"><match value="blazeds::4"/><description>BlazeDS 4</description></version><version name="none"><description>不包含 BlazeDS </description></version></versions></product><product topversion="10" name="coldfusion" heading="ColdFusion" default="none"><versions><version name="10"><match value="cf::"/><description>ColdFusion 10 和更早版本</description></version><version name="9"><match value="cf::9"/><description>ColdFusion 9.0.1 和更早版本</description></version><version name="none"><description>不包含 ColdFusion </description></version></versions></product><product topversion="2.0" name="osmf" heading="Open Source Media Framework" default="none"><versions><version name="2.0"><match value="osmf::"/><description>OSMF 2.0 和更早版本</description></version><version name="1.6"><match value="osmf::1"/><description>OSMF 1.6 和更早版本</description></version><version name="1"><match value="osmf::1.5"/><match value="osmf::1.0"/><description>OSMF 1.5 和更早版本</description></version><version name="none"><description>不包含 Open Source Media Framework </description></version></versions></product><product topversion="4" name="flexosmf" heading="Open Source Media Framework for Flex" default="none"><versions><version name="4"><match value="flexosmf::4.0"/><description>OSMF for Flex 4.0</description></version><version name="none"><description>不包含 Open Source Media Framework for Flex 4.0 </description></version></versions></product></products></filters>';

		var fc = top.glob.frame_content();

		var doc = document;

		var resp = $.parseXML(filterXML);

		$('#whyEnglish a:first',doc).click(hs.onWhyEnglish);

		$('#prettifyCode a:first',doc).click(hs.onPrettifyCode);
		// 右 边第二行 ,的  方法,属性,示例.
		$('#subNav',doc).delegate('a','click',hs.onRightNav);

		// header 中间 大按钮
		$('#filterImg',doc).click(hs.onFilterImg);

		$('#packageName',doc).click(hs.onPackageNameClick);

		if(top.DummyCookie.get('code_hightlight') === 'true'){
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
				top.DummyCookie.set('filter_'+mat[1], mat.slice(2).join('.'));
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
						top.DummyCookie.set(id.replace('rb','filter'),	'1');
					}else{
						//取消所有子项,只在界面上,而不更改子项的Cookie值
						o.parents('li:first').find('ul:first input').prop('checked',false);
						top.DummyCookie.set(id.replace('rb','filter'),	'none');
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

						top.DummyCookie.set(id.replace('rb','filter'),
							firstChild.prop('id').replace('rb_','').replace(/\w*?_/,'').replace(/_/g,'.')
						);

						firstChild.prop('checked',true);

						if(!root.prop('checked')){
							root.prop('checked',true);
							top.DummyCookie.set(root.prop('id').replace('rb','filter'), 1);
						}
					}else{
						o.parents('li:first').find('ul:first input:checked:first').prop('checked',false).addClass('prevChecked');

						top.DummyCookie.set(id.replace('rb','filter'),	'none');

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
* 根据 Cookie 的值 设置 过滤菜单,只是调整菜单,并没有进行文件过滤.
* @method getUserPrefs
*/
function getUserPrefs(doc){
	var i, len, cks, k, kvalue;

	var topstate = false;

	cks = top.DummyCookie._data;

	if(cks['filter_runtime'] !== 'none') {
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

	if(cks['filter_product'] !== 'none' ) {//跳过
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
	if(fc.ready_filter_menu) {

		cks = top.DummyCookie._data;

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
	top.DummyCookie.set('asdocs_filter_view',view,expire.getTime());
}
//<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
// 必须要等到文档加载完成..因为这里会初使化 一些 html 标签
window.onload = function() {
	ready = true; // DOM READY
	top.done(1);  //top.glob.prop.HEADER 直接调用
	if(location.href.indexOf("mk:@") === 0 || location.href.indexOf("file:")===0){
		$('#chm_index',document).removeClass('hidden');
	}
	hs.onReady();
};