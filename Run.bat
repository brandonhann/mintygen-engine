@echo off

cd /d "%~dp0"

echo Welcome to MintyGen NFT Engine
echo.

:check_node_modules
if not exist node_modules (
echo Install dependencies
echo.
pause
npm i
goto check_node_modules
) else (
goto check_config
)

:check_config
if not exist config.json (
echo Error: config.json not found. Please create a config.json file.
echo.
pause
exit /b 1
) else (
goto menu
)

:menu
echo Select an option:
echo 1. Run Generate
echo 2. Run Shuffle
echo 3. Run Update
echo 4. Exit
echo.

set /p choice="Enter your choice (1-4): "

if %choice%==1 goto run_generate
if %choice%==2 goto run_shuffle
if %choice%==3 goto run_update
if %choice%==4 goto exit_script

echo Invalid choice. Please try again.
echo.
pause
goto menu

:run_generate
node Generate.js
echo.
pause
goto menu

:run_shuffle
node Shuffle.js
echo Shuffle complete.
echo.
pause
goto menu

:run_update
node Update.js
echo Update complete.
echo.
pause
goto menu

:exit_script
pause
exit /b 0