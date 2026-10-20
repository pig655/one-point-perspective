# ========================================================
#    🎨 單點透視互動學習教室 - 一鍵上傳至 GitHub 工具 (PowerShell)
# ========================================================

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "   🎨 單點透視互動學習教室 - 一鍵上傳至 GitHub 工具" -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

$repoUrl = Read-Host "請貼上您的 GitHub 倉庫網址 (例如 https://github.com/您的帳號/one-point.git)"

if ([string]::IsNullOrWhiteSpace($repoUrl)) {
    Write-Host "[錯誤] 網址不能為空，請重新執行！" -ForegroundColor Red
    exit 1
}

Write-Host "`n[1/4] 切換主分支名稱為 main..." -ForegroundColor Green
git branch -M main

Write-Host "[2/4] 設定遠端 GitHub 儲存庫..." -ForegroundColor Green
git remote remove origin 2>$null
git remote add origin $repoUrl.Trim()

Write-Host "[3/4] 正在推送專案至 GitHub..." -ForegroundColor Green
Write-Host "(若第一次使用，Windows 會自動跳出瀏覽器登入 GitHub 視窗，請點選 Authorize 授權)`n" -ForegroundColor Yellow
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n========================================================" -ForegroundColor Green
    Write-Host "✅ 恭喜！專案已成功上傳至 GitHub！" -ForegroundColor Green
    Write-Host "========================================================" -ForegroundColor Green
    Write-Host "`n下一步：開啟 GitHub Pages 免費網頁發布" -ForegroundColor Yellow
    Write-Host "1. 前往您的 GitHub 儲存庫頁面"
    Write-Host "2. 點選上方「Settings」分頁"
    Write-Host "3. 左側點選「Pages」"
    Write-Host "4. 在「Build and deployment」下的 Source 選擇「GitHub Actions」"
    Write-Host "5. 稍等約 1 分鐘，即可獲得公開網址供學生平板掃描遊玩！`n"
} else {
    Write-Host "`n❌ 推送失敗，請確認倉庫網址正確，且您已在瀏覽器完成 GitHub 授權！" -ForegroundColor Red
}

Read-Host "按 Enter 鍵關閉視窗..."
