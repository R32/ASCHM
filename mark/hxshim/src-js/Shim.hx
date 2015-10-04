package;


import haxe.ds.StringMap;
import js.Browser;
import js.Lib;
import SWFObject;

typedef Resp = {
	type:String,
	data:String,
	url:String
}

typedef Callb = {
	func:Resp->Void,
	context:Dynamic
}

/**
这里仅仅重写原 Cookies.js 文件.

 - 从外部引入 swfobject 而不是标准库里的那个.
 
 - 以 -resource file@name 的形式嵌入 filter.xml 文件
*/
@:expose class Shim{
		
	// HTML DOM
	public var DOM(default, null):SwfDom;
	
	function new() {
		DOM = SwfDom.make(ID);
	}
	
	/**
	e.g: shim.fget("index.html",{func:function(resp){console.log(resp)}, context: shim})
	*/
	public function fget(url:String, callb:Callb):Bool {
		if (!loding) {	
			Reflect.setField(callbacks, url, callb);
			DOM.fget(url);
			loding = true;
			return true;
		}
		return false;
	}
		
	/**
	 old::header.js Line:782
	*/
	static inline var ID = "swfShimDom";
	static inline var SWFREADY = "swfReady";
	
	public static var inst(default, null):Shim;
	public static function render(callb:Callb):Void {
		if (inst != null) return;
		
		Reflect.setField(callbacks, SWFREADY, callb);
		
		#if test
		SWFObject.embedSWF("shim.swf", ID, "550", "400", "10.3.0", "", {	
		#else
		SWFObject.embedSWF("shim.swf", ID, "16", "16", "10.3.0", "", {
		#end
				// flashvals
			id: ID
		}, {	// params
			quality: "low",
			menu: "false",
			//wmode: "transparent",
			allowScriptAccess: "always",
			allowFullscreen: "false",
			bgcolor: "#FE0201"
		}, {	// attrs
			name: ID
		}, null);
		
		
	}
	
	static var loding(default, null):Bool = false;
	
	static var callbacks(default, null):Dynamic<Callb> = { };
	
	/**
	当 在不支持 flash 的情况下, 使用这个文件依然有效. 
	*/
	static function filter_xml():String{
		return haxe.Resource.getString("filter.xml");
	}
	
	/**
	src-flash/Ex4js.hx -- Line: 26; 
	*/
	@:expose("onShimData") static function ondata(rep: Resp ):Void {
		var callb:Callb;
		loding = false;
		switch(rep.type){
			case "complete", "cached":
				callb = Reflect.field(callbacks, rep.url);
				try{
					if(callb.func != null) untyped callb.func.call(callb.context, rep);
				}catch (err:Dynamic) {
					Notice.createLoadingMsg(err);
				}
				Reflect.deleteField(callbacks, rep.url);
			case "ioerror", "securityerror":
				
			case SWFREADY:	// init
				if(inst == null){
					inst = new Shim();
					callb = Reflect.field(callbacks, SWFREADY);
					Reflect.setField(rep, "data", filter_xml());
					try{
						if(callb.func != null) untyped callb.func.call(callb.context, rep);
					}catch (err:Dynamic) {
						Notice.createLoadingMsg(err);
					}
					Reflect.deleteField(callbacks, SWFREADY);
				}
			default:
		}
	}
	
	static public function main() {
		#if tset	
		render( { context:inst, func: function(rep:Resp) { trace(rep.type); }} );
		#end
	}
}



/**
参考以前旧的 js 文件, 不想再改动旧 JS 文件

@:remove interface IShim {	
	//header.js 将调用这个文件来初使化. 
	function render(swfurl:String, swfid:String, callback:Resp->Void):Void;
	
	//Cookies.js  
	function fjax(url:String, callback:Resp->Void, type:String):Void;
}
*/
/**
参考 glob.js 的 Allk 对象, 使用原 glob.js 的 Allk 对象
@:remove interface IAllk{
	var ks(default,null):Dynamic;
	function has(key:String):Bool;
	function get(key:String):Dynamic;
	function set(key:String, value:Dynamic):Void;
	function flush():Void;
}
*/


extern class SwfDom{
	//inline function new(id:String) {}
	function fget(url:String):Void;	
	function cexists(key:String):Bool;
	function cget(key:String):Dynamic;
	function cset(key:String, value:Dynamic, fast:Bool = true):Bool;
	function cflush():String;
	public static inline function make(id:String):SwfDom {	
		return untyped Browser.document.getElementById(id);
	}
}

@:native("top") 
extern class Notice {
	static function createLoadingMsg(msg:String):Void;
}