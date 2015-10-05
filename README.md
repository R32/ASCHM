AS3CHM参考手册
------

 * 仅限 windows 系统

 * 此CHM不包含 **lc, com, ga, coldfusion, xd**  这几个包, 如果需要修改 `config.js` 然后重新编译
 
 * 如打开空白, 尝试 **文件属性** -> **解除锁定** 

### API18

[百度网盘 AS3CHM API 18](http://pan.baidu.com/s/1sjxISdn)  **MD5:** `4bcc91321126831919c1090248800ceb`

### API14

[旧的CHM离线手册API 14](http://pan.baidu.com/s/1ntHSwOh)

 * Adobe Flash Player 14.0 和更低版本
 * Adobe Flash Professional CS6 和更低版本
 * Adobe AIR 14.0 和更低版本
 * Adobe Flex 4.6 和更低版本

推荐使用 **索引** 搜索 类(`class`) 及 函数(`Function`) (注:不包括类方法及类属性) 如下图: 

![asdoc](show.png)

### build

 * [haxe 3.2+](http://haxe.org/download/), 用于构建 shim.js 和 shim.swf

 * nodejs
 
 * [微软 HTML Help Workshop](http://www.microsoft.com/en-us/download/details.aspx?id=21138#system-requirements) 

  - 之后调整  make.bat 中的 set HHC 对应的路径

		```bat
		set HHC="D:\Program Files\HTML Help Workshop\hhc.exe"
		```
 
 * 下载 [Adobe 链接原始ZIP包](http://help.adobe.com/zh_CN/FlashPlatform/reference/actionscript/3/PlatformASR_Final_zh-cn.zip)
	  
	调整好 `config.js` 文件中 logdir 属性, 将下载的原始zip解压到 origin
	
	```bash
	root
	 ├─ origin/		# 将原始 ZIP 档案解压在这个目录下
	 ├─ mark/
	 └─ make.bat
	```

 * 以命令行形式进入到根目录

	```bat
	make all
	```
