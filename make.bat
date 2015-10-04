@echo off
:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
:: DST 需要对应 mark/comm/config.js 文件中的 output 属性
set DST= %cd%\output

:: 配置 hhc.exe 的正确路径
set HHC="D:\Program Files\HTML Help Workshop\hhc.exe"
::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

if "%1"=="" goto help
set DIRTOP=%cd%
cd mark
goto %1
:all

:gen
haxe s0_shim.hxml
IF ERRORLEVEL 1 goto error
node s1_content_clean.js
node s2_class_list.js
node s3_some.js
node s4_link.js
node s5_move.js
IF ERRORLEVEL 1 goto error


IF NOT "%1"=="all" goto restore
:chm
::IF NOT EXIST %DST% md %DST% 
cd %DST%
%HHC% as3api.hhp
move *.chm ..
IF NOT ERRORLEVEL 1 echo done.
goto restore

:help
echo %0 ^<chm^|gen^>
goto end

:error
pause

:restore
cd %DIRTOP%

:end
