package;


import flash.Lib;

class Shim {
	
	var save:FSave;
	
	var ff:FGet;
	
	var ex:Ex4js;
	
	
	public function new(){
		
		save = new FSave();
		
		ex = new Ex4js(Lib.current.loaderInfo.parameters);
		
		ff = new FGet(ex.send);
		
		haxe.Timer.delay(ex.attach.bind({
			// http get
			fget: ff.get,
			// shareObject
			cexists: save.exists,
			cget: save.get,
			cset: save.set,
			cflush: save.flush
		}, { data: "done"}), 10);
	}
	
	@:keep static var inst:Shim;
	
	static function main() {		
		inst = new Shim();
		
		#if test
		var runner = new haxe.unit.TestRunner();
		runner.add(new Test());
		runner.run();
		#end
	}
}

