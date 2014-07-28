文本替换
===========================

##### 已经压缩好了的 CHM 离线手册 [暂缺没找到网盘]

 * Adobe Flash Player 14.0 和更低版本
 * Adobe Flash Professional CS6 和更低版本
 * Adobe AIR 14.0 和更低版本
 * Adobe Flex 4.6 和更低版本

**注意**: 此CHM不包含 **lc, com, ga, coldfusion, xd**  这几个包

![asdoc](show.png)

#### 如何制做:

 *  配置
 
  - 下载Adobe 原始ZIP档案 [PlatformASR_Final_zh-cn.zi](http://help.adobe.com/zh_CN/FlashPlatform/reference/actionscript/3/PlatformASR_Final_zh-cn.zip)

  - 调整好 `config.js` 的 source 和 output 目录,将原始zip 解压到 source

		> 本文档目录看起像:
		```bash
		top
		 ├─ as_doc/  # 将原始 ZIP 档案解压在这
		 ├─ chm/	 # output文件夹 配置文件会自动创建. 	
		 └─ mark/	 # for Nodejs
		```
  - **注意:**请配置好 `config.logdir` 的磁盘位置.		

 * make
  
  - 参看 `mark/Makefile` 文件 

  - `Cygwin` 环境中在 `mark` 目录下 直接输入 `make` 将自动完成所有文件字符替换

 * 使用 [HTML Help Workshop](http://www.microsoft.com/en-us/download/details.aspx?id=21138#system-requirements)

  - 只需要把 index.html 和 link4chm.html 添加进去,然后打包就行了

  - **注意:** 打包时需要将 `.hhp` 放在 output 文件夹中.

 



#### 其它

 * 这里的文件不包含 swf 的源码

	> 文档里的 swf 只做了类似于 cookie 和 Ajax 的操作