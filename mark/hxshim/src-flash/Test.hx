package;
import haxe.unit.TestCase;

// 这些测试不知道要如何写???
class Test extends TestCase{
	
	function testFSave() {		
		var obj:Dynamic = { };
		
		assertTrue(FSave.serial(obj, "x.y.z") == null);
		
		var dc = FSave.serial(obj, "x.y.z", true);	// force create
		
		trace(obj);
		
		assertTrue(obj.x.y == dc.c && Type.typeof(dc.c) == TObject && dc.k == "z");
	}	
	
	// 测试 map 是否能存一些特殊字符为 key
	function testFGet(){
		var map = new haxe.ds.UnsafeStringMap<Int> ();
		map.set("https://test.com/search?l=JavaScript&q=swfobject&type=Repositories&utf8=%E2%9C%93#abc", 10101);
		trace(map.keys().next());
		trace(map.get(map.keys().next()));
		assertTrue(true);
	}
}