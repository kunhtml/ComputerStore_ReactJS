@echo off
echo ===================================
echo Starting Computer Store Application
echo ===================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Node.js not found. Please install Node.js and try again.
    pause
    exit /b
)

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo npm not found. Please install npm and try again.
    pause
    exit /b
)

REM Kill any processes using port 5678
echo Ensuring port 5678 is available...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5678') do (
    taskkill /F /PID %%a >nul 2>&1
)
timeout /t 1 /nobreak >nul

REM Ensure the database directory exists
if not exist "src\data" (
    echo Creating data directory...
    mkdir "src\data"
)

REM Check if database.json exists
if not exist "src\data\database.json" (
    echo Creating initial database file...
    echo { "categories": [], "brands": [], "users": [], "products": [], "orders": [], "reviews": [] } > "src\data\database.json"
    echo Initial database file created successfully.
)

REM Install dependencies if needed
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
)

echo.
echo ===================================
echo Starting React frontend and Node.js backend...
echo Frontend will be available at: http://localhost:3000
echo Backend API will be available at: http://localhost:5678
echo ===================================
echo.
echo Press Ctrl+C in this window to stop the application
echo.

REM Start the application in development mode
start "" http://localhost:3000
npm run dev

REM If npm run dev exits, pause to show any error messages
pause
