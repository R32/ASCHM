package;


#if macro
import haxe.macro.Context;
import haxe.macro.Compiler;
import haxe.macro.Expr;
import haxe.io.BytesInput;
import haxe.io.Path;
import sys.FileSystem;
import sys.io.File;
import sys.io.FileInput;
import sys.io.FileOutput;
import sys.io.FileSeek;
import sys.FileStat;

@:noCompletion
@:noDoc
class Embed{
	// 由于 swfobject.js 不能运行在,严格模式
	public static function prep2out(path:String):Void {
		
		Context.onAfterGenerate(function(){
			//trace(FileSystem.exists(path));
			//trace(FileSystem.exists(Compiler.getOutput()));
			var copy = new BytesInput(File.getBytes(Compiler.getOutput()));
			var embed = File.read(path);
			var out = File.write(Compiler.getOutput());
			out.writeInput(embed);
			embed.close();
			out.writeByte("\n".code);
			out.writeInput(copy);
			copy.close();
			out.close();
		});
	}
}
#end

@:native("swfobject") extern class SWFObject {
		
	static function hasFlashPlayerVersion(ver:String):Bool;
	
	static function embedSWF(swfUrlStr:String, replaceElemIdStr:String, widthStr:String, heightStr:String, swfVersionStr:String, xiSwfUrlStr:String, ?flashvarsObj:Dynamic, ?parObj:Dynamic, ?attObj:Dynamic, ?callbackFn:Dynamic->Void):Void;
}



