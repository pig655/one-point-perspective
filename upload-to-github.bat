@echo off
chcp 65001 >nul
echo ========================================================
echo    🎨 單點透視互動學習教室 - 一鍵上傳至 GitHub 工具
echo ========================================================
echo.

set /p REPO_URL="請貼上您的 GitHub 倉庫網址 (例如 https://github.com/您的帳號/one-point.git): "

if "%REPO_URL%"=="" (
    echo [錯誤] 網址不能為空，請重新執行本工具！
    pause
    exit /b
)

echo.
echo [1/4] 切換主分支名稱為 main...
git branch -M main

echo [2/4] 設定遠端 GitHub 儲存庫...
git remote remove origin >nul 2>&1
git remote add origin %REPO_URL%

echo [3/4] 正在推送專案至 GitHub...
echo (若第一次使用，Windows 會自動跳出瀏覽器登入 GitHub 視窗，請點選 Authorize 授權)
git push -u origin main

if %errorlevel% neq 0 (
    echo.
    echo ❌ 推送失敗，請確認網址正確且具有存取權限！
) else (
    echo.
    echo ========================================================
    echo ✅ 恭喜！專案已成功上傳至 GitHub！
    echo ========================================================
    echo.
    echo 下一步：開啟 GitHub Pages 免費網頁發布
    echo 1. 前往您的 GitHub 儲存庫頁面
    echo 2. 點選上方「Settings」分頁
    echo 3. 左側點選「Pages」
    echo 4. 在「Build and deployment」下的 Source 選擇「GitHub Actions」
    echo 5. 稍等約 1 分鐘，即可獲得公開網址供學生平板掃描遊玩！
    echo ========================================================
)

pause
