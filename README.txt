我的旅行手帳 V2 — GitHub Pages / iPhone PWA

部署：
1. GitHub 建立新的 Public repository（例如 my-travel-journal）。
2. 將 index.html、app.js、sw.js、manifest.webmanifest、icon.svg 上傳至 repository 根目錄（不要只上傳 ZIP）。
3. Settings → Pages → Build and deployment → Deploy from a branch → main / (root) → Save。
4. 等 GitHub Pages 顯示正式 HTTPS 網址，在 iPhone Safari 開啟。
5. Safari 分享 → 加入主畫面。之後由桌面圖示開啟。

重要：
- 資料存於該 iPhone 的 IndexedDB，不會上傳 GitHub。
- 建議每次旅行規劃完成或有重要修改後，進入「備份」匯出 JSON，透過 iPhone 檔案分享／儲存到 Google Drive。
- CSV 是 Excel 查看格式；完整還原請使用 JSON。
- 不要在無備份時刪除 App、清除 Safari 網站資料或更換網址。
- 本版不包含圖片、PDF 附件，因使用者已決定不保存私人文件及照片。
- GitHub Pages Public repository 的程式碼為公開，但使用者輸入的本機行程不會被上傳。
