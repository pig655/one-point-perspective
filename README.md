# 🎨 單點透視互動學習教室 (One-Point Perspective Classroom)

> 專為臺灣國小五年級學生設計的互動式「單點透視」視覺藝術與空間幾何探索網頁。  
> 讓學生透過操作透視點、擺放物件、調整深度與尺寸，直觀理解「近大遠小」與「平行線向透視點收斂」的視覺規律！

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live%20Demo-brightgreen?logo=github)](https://pig655.github.io/one-point-perspective/)
[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-purple?logo=vite)](https://vitejs.dev/)
[![Tests](https://img.shields.io/badge/Vitest-24%20Passed-success?logo=vitest)](https://vitest.dev/)

---

## 🌐 線上體驗

👉 **學生與教師線上入口**：[https://pig655.github.io/one-point-perspective/](https://pig655.github.io/one-point-perspective/)

學生可直接使用 **iPad 或 Android 平板相機掃描 QR Code**，無須安裝任何 App 或帳號登入，即可一人一機進行探索遊玩！

---

## 🌟 核心特色

### 1. 📐 基礎透視練習區
- **動態透視點與視平線**：自由沿視平線拖曳透視點（VP），觀察畫面所有物體如何隨之扭轉收斂。
- **純向量 SVG 幾何計算**：非偽造縮放或靜態圖片，根據真實單點透視數學公式計算頂點、邊線、可見面與陰影明暗。
- **長距離透視延伸**：物件長度/深度支援擴充至 **3000**！透視馬路動態生成由寬漸窄、由疏漸密的車道中央虛線，展現直通地平線的強烈張力。
- **豐富物件素材庫**：
  - **幾何立體**：正方體、長方體、三稜柱等。
  - **生活家具**：課桌、靠背木椅、置物櫃、房屋、透視馬路。
  - **自然角色**：小學生人物、校園綠樹。
- **直觀控制點與輔助線**：提供頂點吸附射線、獨立射線開關、地面參考網格。

### 2. 🏠 室內空間透視魔法屋
- **九宮格教學循序引導**：
  1. **空房間**：認識天花板、地板、左牆、右牆與後牆的交界透視線。
  2. **房間佈置**：將掛畫、景觀窗戶自動貼合側牆與後牆（維持精確梯形透視與縱深縮放）。
  3. **地面家具擺設**：單人床、課桌、沙發、小熊地毯、書架，自由調整寬度 (W)、高度 (H) 及**長度/深度 (D)**。
  4. **風格著色與匯出**：提供「陽光暖黃」、「清爽天藍」、「溫馨森林」快速主題套色，支援黑白線稿與彩色風格切換。
- **生動童趣插畫**：內建由 Nano Banana 繪製之繪本風格藝術資產（太空喵喵冒險、派對小恐龍、彩虹草原景觀窗、萌萌小熊地毯）。

### 3. 🏆 循序漸進關卡與挑戰
- 內建 10 大引導式教學任務（例如：「找到透視點的魔法」、「近大遠小的秘密」、「為房間添置窗戶與地毯」等）。
- 自動偵測學生操作條件，完成時觸發彩色紙花慶祝特效 🎉，引發自主學習動機。

### 4. 📱 課堂專屬平板連線 (QR Code)
- 頂部工具列提供 **「📱 平板連線」** 按鈕，彈出高對比、超清晰 QR Code。
- 專為教室電子白板與大螢幕投影設計，附「國小生掃描三步驟」教學指引。
- 支援一鍵切換「GitHub 線上版」或「教室 Wi-Fi 區網（離線亦可連線）」，並支援列印紙本學習單。

### 5. 💾 作品保存與下載
- **一鍵下載圖片**：將學生的精彩作品匯出為超高解析度 PNG 圖片。
- **暫存與匯入/匯出**：支援 LocalStorage 本地儲存與 `.json` 專案檔讀寫，方便分堂課接續教學。

---

## 🛠️ 技術架構

- **前端核心**：React 18 + TypeScript + Vite
- **圖形算繪**：向量 SVG（可獨立選取物件、編輯頂點、響應式縮放）
- **樣式與介面**：Tailwind-like 響應式佈局 + Lucide Icons + 童趣圓角設計
- **單元測試**：Vitest（涵蓋 24 項幾何投影、牆面約束、儲存服務與教學任務驗證）
- **持續整合/部署 (CI/CD)**：GitHub Actions 自動打包並發布至 GitHub Pages

---

## 🚀 本機開發與執行指南

如欲在自己的電腦上運行或修改本專案，請遵循以下步驟：

### 1. 取得專案並安裝套件
```bash
# 複製儲存庫
git clone https://github.com/pig655/one-point-perspective.git
cd one-point-perspective

# 安裝相依套件
npm install
```

### 2. 啟動本機開發伺服器
```bash
npm run dev
```
啟動後於瀏覽器開啟：`http://localhost:5173/`。  
若欲讓同教室 Wi-Fi 的平板連線，直接開啟 Vite 印出的 Network 網址（例如：`http://192.168.x.x:5173/`）。

### 3. 執行單元測試
```bash
npm test
```

### 4. 建置生產環境版本
```bash
npm run build
```
編譯產物將輸出於 `dist/` 資料夾中，採用可攜式相對路徑，可直接拖曳至任何靜態託管平台。

---

## ⚙️ GitHub Pages 自動發布設定

專案內已包含 [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) 工作流程。只要依照以下步驟啟用，每次更新程式碼都會自動部署上線：

1. 登入 GitHub 並前往本倉庫的 **Settings**（設定）分頁。
2. 在左側選單點選 **Pages**。
3. 在 **Build and deployment** 下方的 **Source** 下拉選單中：
   - 選擇 **「GitHub Actions」**。
4. 設定完成後，GitHub 即會自動觸發編譯與發布，約 1 分鐘後即可在 [https://pig655.github.io/one-point-perspective/](https://pig655.github.io/one-point-perspective/) 訪問！

---

## 📄 授權條款

MIT License. 歡迎各級學校視覺藝術教師、教育工作者自由用於教學與研究推廣！
