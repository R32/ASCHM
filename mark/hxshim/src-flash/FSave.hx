package;

import flash.net.SharedObject;

class FSave{
	
	var so:SharedObject;
	var datum:Dynamic;
	
	public function new() {		
		so = SharedObject.getLocal(NAME, "/");
		
		if(!Reflect.hasField(so.data, NAME)){
			Reflect.setField(so.data, NAME, { } );
		}
		
		datum = Reflect.field(so.data, NAME);
	}
	
	public function exists(key:String):Bool {
		return Reflect.hasField(datum, key);
	}
	
	public function get(key:String):Dynamic {
		//var dp = serial(this.datum, key);
		//return Reflect.field(dp.c, dp.k);
		return Reflect.field(datum, key);
	}
	
	public function set(key:String, value:Dynamic, fast:Bool = true):Bool {
		//var dp = serial(this.datum, key);
		//if(dp != null){
			//Reflect.setField(dp.c, dp.k, value);
			//if (!fast) so.flush();
			//return true;
		//}
		//return false;
		Reflect.setField(datum, key, value);
		if (!fast) so.flush();
		return true;
	}
	
	public function flush():String{
		return so.flush();
	}
	
	/**
	e.g: `serial(obj,"aa.bb.cc")` return {c:obj.aa.bb, k:"cc"}
	
	if force is true, will be forced to create if field does not exist
	
	return `{c: context, k: stringKey}`
	*/
	public static function serial(ref:Dynamic, dotkey:String, force:Bool = false): { c:Dynamic, k:String } {		
		var keys = dotkey.split(".");
		var last = keys.pop();
		var tmp:Dynamic;
		for(i in 0...keys.length){
			
			tmp = Reflect.field(ref, keys[i]);
						
			if(Type.typeof(tmp) == TObject){
				ref = tmp;
			}else if (force && Type.typeof(tmp) == TNull) {
				Reflect.setField(ref, keys[i], { } );
				ref = Reflect.field(ref, keys[i]);
			}else{
				return null;
			}
		}
		return {c: ref, k: last};
	}
	
	static inline var NAME = "as3chm";
}

