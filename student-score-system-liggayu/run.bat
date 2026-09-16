@echo off
setlocal
cd /d "%~dp0"
where java >nul 2>&1
if errorlevel 1 goto missingjava
where javac >nul 2>&1
if errorlevel 1 goto missingjava
if not exist build mkdir build
javac --release 17 --add-modules jdk.httpserver -encoding UTF-8 -d build src\StudentStore.java src\StudentServer.java
if errorlevel 1 goto compilefailed
java --add-modules jdk.httpserver -cp build StudentServer %*
if errorlevel 1 goto serverfailed
exit /b 0
:missingjava
echo Install a full Java Development Kit, JDK 17 or newer.
echo Both java and javac must be available in PATH. Reopen this window after installation.
pause
exit /b 1
:compilefailed
echo Compilation failed. Check that javac is from JDK 17 or newer.
pause
exit /b 1
:serverfailed
echo The server could not start. Read the error above.
echo If port 8080 is in use, run: run.bat 8081
pause
exit /b 1
