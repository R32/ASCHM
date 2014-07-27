# 注意 各 js 脚本有 写 Log 文件到 R: 盘下. 可以在 config.js 中更改 logdir 的值 
# 所以放在 custom 目录下的 文件都会被复制到 目标目录下,不包括目录
.PHONY: clean


BUILD_DIR	:= ../chm
SOURCE_DIR	:= ../as_doc

CC	:=	node 

all: step1 step2 step3 step4 step5
	@echo end.....
	
clean:
	@echo clean...
	@rm -rf $(BUILD_DIR)

step1:
	$(CC) s1_content_clean.js

step2:
	$(CC) s2_class_list.js

step3:
	$(CC) s3_some.js

step4:
	$(CC) s4_link.js

step5:
	@rm -rf $(BUILD_DIR)/index-frame.html
	$(CC) s5_move.js


