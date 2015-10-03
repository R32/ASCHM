@echo off
if "%1"=="" goto help
goto %1

:copy
set SRC=..\custom
set DST=.
xcopy %SRC% %DST% /Y /D
goto end

:chm
set HHC="D:\Program Files\HTML Help Workshop\hhc.exe"
%HHC% debug.hhp
goto end

:help
echo %0 ^<chm^|copy^>

:end
pause