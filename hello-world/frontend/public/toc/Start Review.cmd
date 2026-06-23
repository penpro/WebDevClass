@echo off
REM ---- Theory of Computation review — OPTIONAL local server ----
REM You can just double-click index.html instead; this is only needed if your
REM browser refuses to save progress for files opened directly (file://).
cd /d "%~dp0"
set "PORT=8137"
echo.
echo   Theory of Computation - Final Review
echo   Opening http://localhost:%PORT%/  in your browser...
echo   Keep this window open while you study; close it to stop the server.
echo   (If the page errors on the very first load, wait a second and refresh.)
echo.
start "" "http://localhost:%PORT%/"
python -m http.server %PORT%
if errorlevel 1 python3 -m http.server %PORT%
echo.
echo   The server stopped, or Python could not start it.
echo   That's fine — just double-click index.html to run without a server.
pause
