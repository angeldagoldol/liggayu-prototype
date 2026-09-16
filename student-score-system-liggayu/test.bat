@echo off
setlocal
cd /d "%~dp0"
where java >nul 2>&1
if errorlevel 1 goto missingjava
where javac >nul 2>&1
if errorlevel 1 goto missingjava
if not exist build mkdir build
javac --release 17 --add-modules jdk.httpserver -encoding UTF-8 -Xlint:all -d build src\StudentStore.java src\StudentServer.java tests\StudentStoreTest.java
if errorlevel 1 exit /b 1
java -cp build StudentStoreTest
exit /b %errorlevel%
:missingjava
echo Install a full JDK 17 or newer, with both java and javac in PATH.
exit /b 1
