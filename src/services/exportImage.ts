/**
 * SVG 畫布匯出為 PNG 圖片服務
 */

export async function exportSvgAsPng(
  svgElement: SVGSVGElement,
  filename = '我的單點透視作品.png',
  scale = 2
): Promise<boolean> {
  try {
    const width = svgElement.viewBox.baseVal.width || 1000;
    const height = svgElement.viewBox.baseVal.height || 650;

    // 複製 SVG 並確保樣式齊備
    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(svgElement);

    // 加入 XML 命名空間
    if (!source.match(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)) {
      source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }

    const svgBlob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    const canvas = document.createElement('canvas');
    canvas.width = width * scale;
    canvas.height = height * scale;

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('無法取得 2D Canvas 繪圖環境');

    return new Promise((resolve, reject) => {
      img.onload = () => {
        // 先繪製白色背景
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 高畫質縮放繪製 SVG
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);

        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Canvas 轉檔 Blob 失敗'));
            return;
          }
          const downloadUrl = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = downloadUrl;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(downloadUrl);
          resolve(true);
        }, 'image/png');
      };

      img.onerror = (e) => {
        URL.revokeObjectURL(url);
        reject(e);
      };

      img.src = url;
    });
  } catch (err) {
    console.error('Export PNG failed:', err);
    return false;
  }
}
