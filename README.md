AS3CHM参考手册
------

 * 仅限 windows 系统

 * 此CHM不包含 **lc, com, ga, coldfusion, xd**  这几个包, 如果需要修改 `config.js` 然后重新编译
 
 * 如打开空白, 尝试 **文件属性** -> **解除锁定** 

### API18

已完成，但暂时未上传，需要自行编译

### API14

**旧的** [百度网盘 旧的CHM离线手册API 14](http://pan.baidu.com/s/1ntHSwOh)

 * Adobe Flash Player 14.0 和更低版本
 * Adobe Flash Professional CS6 和更低版本
 * Adobe AIR 14.0 和更低版本
 * Adobe Flex 4.6 和更低版本


推荐使用 **索引** 搜索 类(`class`) 及 函数(`Function`) (注:不包括类方法及类属性) 如下图: 

![asdoc](show.png)

### build

构建需求

 * [haxe 3.2+](http://haxe.org/download/), 用于构建 shim.js 和 shim.swf
 
 * nodejs
 
	> 用习惯了 haxe 之后来改这些写源生 JS 真累,又特别容易出错...
 
 * [微软 HTML Help Workshop](http://www.microsoft.com/en-us/download/details.aspx?id=21138#system-requirements) 
	  
配置
 
 * 下载Adobe 原始ZIP档案 [http://help.adobe.com/zh_CN/FlashPlatform/reference/actionscript/3/PlatformASR_Final_zh-cn.zip](http://help.adobe.com/zh_CN/FlashPlatform/reference/actionscript/3/PlatformASR_Final_zh-cn.zip)
	  
	调整好 `config.js` 文件对应的 source,output 和 logdir 的磁盘目录位置, 将下载的原始zip解压到 source
	
	```bash
	# 看起像这样:
	
	root
	 ├─ origin/		# 将原始 ZIP 档案解压在这
	 ├─ output/		# output文件夹 这个文件夹会自动创建. 	
	 ├─ mark/	 	# for Nodejs
	 └─ make.bat	# 
	```
  
 * 调整 make.bat 中的 set 变量值
 
	```bat
	set DST=%cd%\output
	set HHC="D:\Program Files\HTML Help Workshop\hhc.exe"
	```
	
以命令行形式进入到根目录

```bat
make all
```
