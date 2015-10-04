var config = new function(){

	// 重要: 请注意需要以 / 结尾
	this.source = '../origin/';

	// 重要: 请注意需要以 / 结尾
	this.output = '../output/';

	this.logdir = 'r:/aslog/';

	// 将要被忽略的目录
	// Note: com.adobe.viewsource 是属于 Flex 的到时要手动添加进去
	this.ignores = ["lc",	"com",	"ga",	"coldfusion" ,"xd"];


	this.debug_mod = true;


	this.modifed = '<!--modify-->';	


	this.clean = {

		// html 注释
		//html_comment: /<!--(?:.|\s)*?-->/g,
		html_comment: /<!--.*?-->/g, // 包含量有换行符的 注释会把 脚本一些脚本注释掉
		// pnp-software 的命名空间
		pnp_ns: /\sxmlns:xd=\"http:\/\/www\.pnp-software\.com\/XSLTdoc\"/g,

		// tag A left
		tagAL: /<a[^>]*?>/g,

		// tag A Attr
		tagAAttr : /<a([^>]*?)>/g,

		// 整个 A  $1 = > Attrs,$2 => innerHTML
		tagA : /<a([^>]*?)>((?:.|\s)*?)<\/a>/ig,

		// 由于 /class\s*=\s*("|')([^\1]*?)\1/
		attr_class : /class="([^"]*?)"/
	}



	if(this.source.charAt(this.source.length -1) !=='/'){
		this.source += '/';
	}

	if(this.output.charAt(this.output.length -1) !=='/'){
		this.output += '/';
	}

	if(this.logdir.charAt(this.logdir.length -1) !=='/'){
		this.logdir += '/';
	}

	this.args = process.argv.slice(2);

};
exports.cfg = config;
// 快速备份文件
//fs.createReadStream(results[i]).pipe(fs.createWriteStream(results[i]+'.bak'));	//备份副本

var fs = require("fs");
if(!fs.existsSync(config.output)){
	fs.mkdirSync(config.output);
}

if(!fs.existsSync(config.logdir)){
	fs.mkdirSync(config.logdir);
}