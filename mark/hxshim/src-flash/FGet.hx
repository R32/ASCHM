package;


import flash.net.URLRequest;
import flash.net.URLLoader;
import flash.events.Event;
import flash.events.IOErrorEvent;
import flash.events.SecurityErrorEvent;

import flash.Lib;
import haxe.ds.UnsafeStringMap;


class Ff extends URLLoader{
	
	public var url(default, null):String;

	public function new(url:String) {
		super(null);
		this.url = url;
	}
}

typedef Resp = {
	data:String,
	url:String,
	type:String
}

class FGet{

	var cache:UnsafeStringMap<Ff>;
	
	
	var ondata:Resp->Void;
	
	
	public function new(callb:Resp->Void) {
		cache = new UnsafeStringMap<Ff>();
		ondata = callb;
	}
	
	
	public function get(url:String):Void {	
		var f:Ff;
		if(cache.exists(url)){
			
			f = cache.get(url);
			
			this.ondata({
				data: f.data,
				url:f.url,
				type: "cached"
			});
			
		}else{
			f = new Ff(url);
			f.addEventListener(Event.COMPLETE, _onLoaded);
			f.addEventListener(SecurityErrorEvent.SECURITY_ERROR, _onSecError);
			f.addEventListener(IOErrorEvent.IO_ERROR, _onIOError);
			f.load(new URLRequest(url));
		}
	}
	
	function _onLoaded(event:Event):Void {
		var f:Ff = Lib.as(event.currentTarget, Ff);
		if (f != null) {
			cache.set(f.url, f);		//  set cache
			_removeListener(f);
			
			this.ondata({
				data: f.data,
				url:f.url,
				type: event.type
			});
		}
	}
	
	function _onSecError(event:SecurityErrorEvent):Void{
		var f:Ff = Lib.as(event.currentTarget, Ff);
		if (f != null) {
			_removeListener(f);	
			
			this.ondata({
				data: event.text,
				url:f.url,
				type: event.type
			});
		}
	}
	
	function _onIOError(event:IOErrorEvent):Void {
		var f:Ff = Lib.as(event.currentTarget, Ff);
		if (f != null) {
			_removeListener(f);
			
			this.ondata({
				data: event.text,
				url:f.url,
				type: event.type
			});
		}
	}
	
	function _removeListener(f:URLLoader):Void {
		f.removeEventListener(Event.COMPLETE, _onLoaded);
		
		f.removeEventListener(SecurityErrorEvent.SECURITY_ERROR, _onSecError);
		
		f.removeEventListener(IOErrorEvent.IO_ERROR, _onIOError);	
	}
	
}