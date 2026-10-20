@echo off
title Push to GitHub
echo ========================================================
echo  Pushing project to GitHub: pig655/one-point-perspective
echo ========================================================
echo.

git branch -M main
git remote remove origin 2>nul
git remote add origin https://github.com/pig655/one-point-perspective.git

echo Uploading files to GitHub...
echo (If a browser window pops up, please click Authorize to sign in)
echo.

git push -u origin main

echo.
echo ========================================================
echo  All operations finished!
echo ========================================================
pause
