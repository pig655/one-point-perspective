@echo off
chcp 65001 >nul
echo ========================================================
echo    🎨 單點透視互動學習教室 - 一鍵上傳至 GitHub 工具
echo ========================================================
echo.
echo 目標倉庫: https://github.com/pig655/one-point-perspective.git
echo.

echo [1/3] 確認遠端分支設定...
git branch -M main
git remote remove origin >nul 2>&1
git remote add origin https://github.com/pig655/one-point-perspective.git

echo [2/3] 正在推送至 GitHub...
echo (若系統跳出 GitHub 授權視窗，請點選綠色「Authorize」按鈕完成登入)
echo.
git push -u origin main

if %errorlevel% neq 0 (
    echo.
    echo ❌ 推送未完成。如果您看到瀏覽器授權視窗，請完成登入授權後再次執行！
) else (
    echo.
    echo ========================================================
    echo ✅ 恭喜！專案已成功上傳至 GitHub！
    echo ========================================================
    echo.
    echo 🚀 最後一步：開啟 GitHub Pages 免費網頁（讓學生掃描 QR Code）
    echo 1. 前往網頁: https://github.com/pig655/one-point-perspective/settings/pages
    echo 2. 在「Build and deployment」下的「Source」下拉選單中：
    echo    👉 選擇「GitHub Actions」
    echo 3. 稍候約 1 分鐘，GitHub 就會自動發布！
    echo 4. 學生平板網址將為:
    echo    👉 https://pig655.github.io/one-point-perspective/
    echo ========================================================
)

echo.
pause
