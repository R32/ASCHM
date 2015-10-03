package;


import flash.external.ExternalInterface;

class Ex4js{

	var _pra:Dynamic<String>;
	
	var _yui:Bool;
	
	var _jsc:String;
	
	public var available(default, null):Bool;
	
	public function new(pra:Dynamic<String>){
		
		if(ExternalInterface.available){
			_pra = pra;
			
			if(Reflect.hasField(pra,"YUIBridgeCallback") && Reflect.hasField(pra,"YUISwfId") && Reflect.hasField(pra,"yId")){			
				_yui = true;
			}else if(Reflect.hasField(pra,"callback")){
				_jsc = Reflect.field(pra, "callback");
			}else {
				_jsc = "onShimData";
			}
			ExternalInterface.marshallExceptions = true;
			
			available = true;
		}
	}
	
	
	public function attach(hs:Dynamic, ?data:Dynamic):Void {
		if (!available) return;
		
		for(k in Reflect.fields(hs)){
			ExternalInterface.addCallback(k, Reflect.field(hs, k));
		}
		
		if (data == null) data = {data: ""};
		var _id:Null<String> = ExternalInterface.objectID;
		if (_id == null) _id = Reflect.field(_pra, "id");
		if (_id == null) throw "have not swf_id";
		Reflect.setField(data, "id", _id);
		Reflect.setField(data, "type", "swfReady");
		this.send(data);
	}
	
	public function send(resp: FGet.Resp):Void {
		if (!this.available) return;
		if(_yui){
			untyped ExternalInterface.call('YUI.applyTo', _pra['yId'], _pra['YUIBridgeCallback'], [_pra['YUISwfId'], { 'type':resp.type, 'response':resp } ]);
		}else {
			ExternalInterface.call(_jsc, resp);
		}
	}
	
	public static function log(msg:Dynamic):Void {	
		if(ExternalInterface.available){
			ExternalInterface.call("console.log", msg);
		}
	}
}