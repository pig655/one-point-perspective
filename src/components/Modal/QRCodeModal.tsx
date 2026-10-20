import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  QrCode,
  Copy,
  Check,
  ExternalLink,
  Printer,
  X,
  Wifi,
  Globe,
  Sparkles,
  Smartphone
} from 'lucide-react';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({ isOpen, onClose }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [selectedMode, setSelectedMode] = useState<'current' | 'lan' | 'custom'>('current');
  const [customUrl, setCustomUrl] = useState<string>('');
  
  // 教室 Wi-Fi 預設 IP (根據本機網路卡偵測)
  const lanUrl = 'http://192.168.1.8:5173/';
  
  // 計算當前欲產生的目標網址
  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'http://localhost:5173/';
  const activeUrl = selectedMode === 'current' ? currentUrl : selectedMode === 'lan' ? lanUrl : (customUrl.trim() || currentUrl);

  useEffect(() => {
    if (!isOpen) return;

    QRCode.toDataURL(activeUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: '#0F172A',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'H'
    })
      .then(url => setQrDataUrl(url))
      .catch(err => console.error('Failed to generate QR code:', err));
  }, [isOpen, activeUrl]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(activeUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>單點透視魔法教室 - 平板連線 QR Code</title>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 90vh;
              margin: 0;
              padding: 20px;
              color: #1e293b;
            }
            .card {
              border: 3px dashed #f59e0b;
              border-radius: 24px;
              padding: 36px;
              text-align: center;
              max-width: 500px;
              background: #fffbeb;
            }
            h1 { font-size: 28px; margin: 0 0 8px; color: #b45309; }
            p { font-size: 16px; margin: 4px 0 20px; color: #78350f; font-weight: bold; }
            img { width: 300px; height: 300px; border-radius: 16px; border: 4px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
            .url { margin-top: 16px; font-size: 14px; color: #2563eb; word-break: break-all; font-family: monospace; }
            .steps { margin-top: 20px; text-align: left; font-size: 14px; background: white; padding: 14px; border-radius: 12px; }
            .steps li { margin-bottom: 6px; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>🎨 單點透視魔法教室</h1>
            <p>📱 請學生拿平板掃描下方 QR Code 進入教室</p>
            <img src="${qrDataUrl}" alt="QR Code" />
            <div class="url">${activeUrl}</div>
            <ol class="steps">
              <li>打開 iPad / 平板電腦的「相機」</li>
              <li>對準上方的 QR Code 掃描</li>
              <li>點擊彈出的黃色網址標籤，立即開始透視探險！</li>
            </ol>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border-4 border-amber-300 max-w-lg w-full overflow-hidden flex flex-col select-none animate-scale-up">
        {/* 頂部標題 */}
        <div className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 px-6 py-4 flex items-center justify-between text-white shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl shadow-inner">
              📱
            </div>
            <div>
              <h2 className="text-lg font-black tracking-wide flex items-center gap-1.5">
                <span>學生平板連線 QR Code</span>
                <Sparkles className="w-4 h-4 text-yellow-200" />
              </h2>
              <p className="text-xs text-amber-100 font-bold">打開平板相機掃描，全班一人一機同步操作！</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 內容區 */}
        <div className="p-6 flex flex-col items-center bg-gradient-to-b from-amber-50/40 via-white to-amber-50/20 space-y-4">
          
          {/* 連線模式選擇 (當前網址 / 教室同Wi-Fi / 自訂網址) */}
          <div className="w-full flex p-1 bg-slate-100 rounded-2xl border border-slate-200 text-xs font-black">
            <button
              onClick={() => setSelectedMode('current')}
              className={`flex-1 py-1.5 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                selectedMode === 'current'
                  ? 'bg-white text-amber-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-amber-500" />
              <span>當前網址</span>
            </button>
            <button
              onClick={() => setSelectedMode('lan')}
              className={`flex-1 py-1.5 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                selectedMode === 'lan'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Wifi className="w-3.5 h-3.5 text-indigo-500" />
              <span>教室 Wi-Fi 區網</span>
            </button>
            <button
              onClick={() => setSelectedMode('custom')}
              className={`flex-1 py-1.5 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                selectedMode === 'custom'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <QrCode className="w-3.5 h-3.5 text-emerald-500" />
              <span>自訂線上網址</span>
            </button>
          </div>

          {/* 若為自訂網址，顯示輸入框 */}
          {selectedMode === 'custom' && (
            <div className="w-full">
              <input
                type="url"
                value={customUrl}
                onChange={e => setCustomUrl(e.target.value)}
                placeholder="請輸入線上部署網址，例如：https://my-perspective.vercel.app"
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-amber-400 bg-white"
              />
            </div>
          )}

          {/* QR Code 核心大卡片 */}
          <div className="relative p-4 bg-white rounded-3xl border-2 border-amber-200 shadow-md flex flex-col items-center group">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="連線 QR Code"
                className="w-64 h-64 object-contain rounded-xl select-none"
              />
            ) : (
              <div className="w-64 h-64 flex items-center justify-center text-slate-400 text-xs">
                QR Code 產生中...
              </div>
            )}
            
            <div className="mt-2 text-[11px] font-mono text-slate-500 max-w-xs truncate bg-slate-50 px-3 py-1 rounded-full border border-slate-200">
              {activeUrl}
            </div>
          </div>

          {/* 國小生操作三步驟教學卡 */}
          <div className="w-full bg-amber-100/60 rounded-2xl p-3.5 border border-amber-200 text-xs text-amber-900">
            <div className="font-black text-amber-800 flex items-center gap-1.5 mb-1.5">
              <Smartphone className="w-4 h-4 text-amber-600" />
              <span>國小生掃描教學指引：</span>
            </div>
            <ul className="space-y-1 text-[11px] font-semibold text-amber-800/90 pl-1 list-disc list-inside">
              <li>步驟 1：請學生拿起平板電腦，開啟內建「相機」功能。</li>
              <li>步驟 2：將鏡頭對準大螢幕或本畫面中央的 QR Code。</li>
              <li>步驟 3：輕觸相機中浮現的黃色網址框，即可進入單點透視教室！</li>
            </ul>
          </div>

          {/* 底部操作按鈕 */}
          <div className="w-full flex items-center gap-2 pt-1">
            <button
              onClick={handleCopy}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl text-xs font-black transition-all border ${
                copied
                  ? 'bg-emerald-500 text-white border-emerald-500 shadow-xs'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300 shadow-xs'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? '已成功複製網址！' : '複製網址'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl text-xs font-black bg-amber-500 hover:bg-amber-600 text-white shadow-xs transition-colors border border-amber-500"
            >
              <Printer className="w-4 h-4" />
              <span>列印 / 投影全螢幕</span>
            </button>

            <button
              onClick={() => window.open(activeUrl, '_blank')}
              className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
              title="在新分頁開啟"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
