var ready = false;
if(!window.jQuery){
	window.$ = window.jQuery = top.jQuery;
}



window.onunload = function(){
	$(document).undelegate();
};


ready = true;

top.done(3);//top.glob.prop.CLASSES === 3

$(document).delegate('a','click',function(e){
	if(!this.target){
		this.target = 'classFrame';
	}
	e.cancelBubble = true;
	e.stopPropagation();
	if(! (this.href.lastIndexOf('#')>-1 || this.href.lastIndexOf('.htm') > -1)){	// 可能会出现出由于替换错误,导致一些链接为空
		e.preventDefault();
		return false;
	}
	return true;
});
