@echo off
echo ========================================
echo   نشر المشروع على GitHub Pages
echo ========================================
echo.

echo [1/3] بناء المشروع...
call npm run build
if errorlevel 1 (
    echo خطأ في البناء!
    pause
    exit /b 1
)

echo.
echo [2/3] نشر على GitHub Pages...
call npm run deploy
if errorlevel 1 (
    echo خطأ في النشر!
    pause
    exit /b 1
)

echo.
echo ========================================
echo   تم النشر بنجاح! 🎉
echo ========================================
echo.
echo الموقع متاح على:
echo https://YOUR_USERNAME.github.io/hive-tasks/
echo.
echo (استبدلي YOUR_USERNAME باسم المستخدم على GitHub)
echo.
pause
