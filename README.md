字符替换 AS3 API
===========================

##### 下载Adobe 原始ZIP档案

 [PlatformASR_Final_zh-cn.zi](http://help.adobe.com/zh_CN/FlashPlatform/reference/actionscript/3/PlatformASR_Final_zh-cn.zip)

 > 调整好 `config.js` 的 source 和 output 目录,将原始zip 解压到 source

##### make


 * step 1

	> 清理主内容,不包括 /class-list|all-index/ 相关文件名


 * step 2

	> 清理 class-list 的内容

 * step 3 
 	
	```
 	package-list.html
 	appendixes.html
	...
 	```

 * step 4
	
	> 扫描建立索引文件.和 chm 的文件链接,以前复制所有图片

 * step 5

	> 移动 定制的文件到根目录下.并且压缩 JS 和 CSS 文件


#### 其它

 * 需要将 as api.hhp 移动到 chm 目录下再进行文件添加,否则出来的目录不正确.