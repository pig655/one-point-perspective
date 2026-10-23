import React from 'react';
import { SceneObject, ProjectedObject, PerspectiveCamera, Point2D } from '../../models/types';

interface RoomFurnitureRendererProps {
  original: SceneObject;
  proj: ProjectedObject;
  camera: PerspectiveCamera;
  getSurfaceFill: (color: string, fallback: string) => string;
}

export const RoomFurnitureRenderer: React.FC<RoomFurnitureRendererProps> = ({
  original,
  proj,
  getSurfaceFill
}) => {
  const vertices = proj.projectedVertices;
  if (!vertices || vertices.length < 8) return null;

  const fbl = vertices[0];
  const fbr = vertices[1];
  const ftr = vertices[2];
  const ftl = vertices[3];
  const bbl = vertices[4];
  const bbr = vertices[5];
  const btr = vertices[6];
  const btl = vertices[7];

  // 3D 雙線性透視內插公式：(u: 0~1 左到右, v: 0~1 底到頂, w: 0~1 前到後)
  const interp3D = (u: number, v: number, w: number): Point2D => {
    const fX = (1 - u) * ((1 - v) * fbl.x + v * ftl.x) + u * ((1 - v) * fbr.x + v * ftr.x);
    const fY = (1 - u) * ((1 - v) * fbl.y + v * ftl.y) + u * ((1 - v) * fbr.y + v * ftr.y);
    const bX = (1 - u) * ((1 - v) * bbl.x + v * btl.x) + u * ((1 - v) * bbr.x + v * btr.x);
    const bY = (1 - u) * ((1 - v) * bbl.y + v * btl.y) + u * ((1 - v) * bbr.y + v * btr.y);
    return {
      x: (1 - w) * fX + w * bX,
      y: (1 - w) * fY + w * bY
    };
  };

  const polyPts = (pts: Point2D[]) => pts.map(p => `${p.x},${p.y}`).join(' ');

  const quad = (p1: Point2D, p2: Point2D, p3: Point2D, p4: Point2D, fill: string, stroke = '#1e293b', strokeW = 1.2) => (
    <polygon points={polyPts([p1, p2, p3, p4])} fill={fill} stroke={stroke} strokeWidth={strokeW} strokeLinejoin="round" />
  );

  const type = original.geometryType;

  // 1. 書桌 / 課桌 (Desk)
  if (type === 'room-desk' || type === 'desk') {
    const mainColor = original.color || '#D97706';
    const darkWood = '#78350F';
    const topWood = '#F59E0B';

    return (
      <g className="furniture-desk">
        {/* 四隻獨立立體桌腳 (中間看透地板) */}
        {/* 後左腳 */}
        {quad(interp3D(0.04, 0.85, 0.9), interp3D(0.12, 0.85, 0.9), interp3D(0.12, 0, 0.9), interp3D(0.04, 0, 0.9), darkWood, '#451a03')}
        {/* 後右腳 */}
        {quad(interp3D(0.88, 0.85, 0.9), interp3D(0.96, 0.85, 0.9), interp3D(0.96, 0, 0.9), interp3D(0.88, 0, 0.9), darkWood, '#451a03')}
        
        {/* 桌下抽屜櫃 (右側) */}
        {quad(interp3D(0.65, 0.85, 0.7), interp3D(0.65, 0.85, 0), interp3D(0.65, 0.2, 0), interp3D(0.65, 0.2, 0.7), '#92400e', darkWood)}
        {quad(interp3D(0.65, 0.85, 0), interp3D(0.95, 0.85, 0), interp3D(0.95, 0.2, 0), interp3D(0.65, 0.2, 0), '#fde68a', darkWood)}
        {/* 抽屜把手 */}
        <circle cx={interp3D(0.8, 0.55, 0).x} cy={interp3D(0.8, 0.55, 0).y} r="2.5" fill="#f59e0b" stroke="#78350f" strokeWidth="0.8" />
        <circle cx={interp3D(0.8, 0.35, 0).x} cy={interp3D(0.8, 0.35, 0).y} r="2.5" fill="#f59e0b" stroke="#78350f" strokeWidth="0.8" />

        {/* 前左腳 */}
        {quad(interp3D(0.02, 0.85, 0), interp3D(0.1, 0.85, 0), interp3D(0.1, 0, 0), interp3D(0.02, 0, 0), darkWood, '#451a03')}
        {/* 前右腳 */}
        {quad(interp3D(0.9, 0.85, 0), interp3D(0.98, 0.85, 0), interp3D(0.98, 0, 0), interp3D(0.9, 0, 0), darkWood, '#451a03')}

        {/* 桌面側緣 */}
        {quad(interp3D(1, 1, 1), interp3D(1, 1, 0), interp3D(1, 0.85, 0), interp3D(1, 0.85, 1), darkWood, '#451a03')}
        {quad(interp3D(0, 1, 1), interp3D(0, 1, 0), interp3D(0, 0.85, 0), interp3D(0, 0.85, 1), darkWood, '#451a03')}
        {/* 桌面正前緣 */}
        {quad(interp3D(0, 1, 0), interp3D(1, 1, 0), interp3D(1, 0.85, 0), interp3D(0, 0.85, 0), mainColor, darkWood)}
        {/* 桌面頂板 (大木面) */}
        {quad(interp3D(0, 1, 1), interp3D(1, 1, 1), interp3D(1, 1, 0), interp3D(0, 1, 0), topWood, darkWood, 1.5)}

        {/* 桌上課本與筆 */}
        {quad(interp3D(0.15, 1.01, 0.65), interp3D(0.42, 1.01, 0.65), interp3D(0.42, 1.01, 0.25), interp3D(0.15, 1.01, 0.25), '#38bdf8', '#0284c7')}
        <line x1={interp3D(0.28, 1.01, 0.65).x} y1={interp3D(0.28, 1.01, 0.65).y} x2={interp3D(0.28, 1.01, 0.25).x} y2={interp3D(0.28, 1.01, 0.25).y} stroke="#ffffff" strokeWidth="1" />
        <line x1={interp3D(0.48, 1.01, 0.55).x} y1={interp3D(0.48, 1.01, 0.55).y} x2={interp3D(0.48, 1.01, 0.25).x} y2={interp3D(0.48, 1.01, 0.25).y} stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
      </g>
    );
  }

  // 2. 靠背椅 (Chair)
  if (type === 'room-chair' || type === 'chair') {
    const chairColor = original.color || '#92400E';
    const cushionColor = '#F59E0B';
    const darkWood = '#451a03';

    return (
      <g className="furniture-chair">
        {/* 4 隻椅腳 */}
        {quad(interp3D(0.1, 0.42, 0.85), interp3D(0.18, 0.42, 0.85), interp3D(0.18, 0, 0.85), interp3D(0.1, 0, 0.85), darkWood, '#1c1917')}
        {quad(interp3D(0.82, 0.42, 0.85), interp3D(0.9, 0.42, 0.85), interp3D(0.9, 0, 0.85), interp3D(0.82, 0, 0.85), darkWood, '#1c1917')}
        {quad(interp3D(0.08, 0.42, 0.1), interp3D(0.16, 0.42, 0.1), interp3D(0.16, 0, 0.1), interp3D(0.08, 0, 0.1), chairColor, darkWood)}
        {quad(interp3D(0.84, 0.42, 0.1), interp3D(0.92, 0.42, 0.1), interp3D(0.92, 0, 0.1), interp3D(0.84, 0, 0.1), chairColor, darkWood)}

        {/* 坐墊厚度 */}
        {quad(interp3D(0.05, 0.48, 0.1), interp3D(0.95, 0.48, 0.1), interp3D(0.95, 0.4, 0.1), interp3D(0.05, 0.4, 0.1), chairColor, darkWood)}
        {/* 坐墊頂面 */}
        {quad(interp3D(0.05, 0.48, 0.88), interp3D(0.95, 0.48, 0.88), interp3D(0.95, 0.48, 0.1), interp3D(0.05, 0.48, 0.1), cushionColor, darkWood)}

        {/* 靠背後立板 */}
        {quad(interp3D(0.1, 1, 0.88), interp3D(0.9, 1, 0.88), interp3D(0.9, 0.48, 0.88), interp3D(0.1, 0.48, 0.88), chairColor, darkWood)}
        {/* 靠背舒適軟墊 */}
        {quad(interp3D(0.18, 0.95, 0.85), interp3D(0.82, 0.95, 0.85), interp3D(0.82, 0.6, 0.85), interp3D(0.18, 0.6, 0.85), cushionColor, darkWood)}
      </g>
    );
  }

  // 3. 溫馨單人床 (Bed)
  if (type === 'room-bed' || type === 'bed') {
    const bedFrameColor = '#4338CA';
    const quiltColor = original.color || '#4F46E5';
    const darkFrame = '#312E81';

    return (
      <g className="furniture-bed">
        {/* 床頭大立板 (高聳於床頭) */}
        {quad(interp3D(0, 1, 1), interp3D(1, 1, 1), interp3D(1, 0, 1), interp3D(0, 0, 1), bedFrameColor, darkFrame, 2)}
        {quad(interp3D(0.08, 0.92, 0.98), interp3D(0.92, 0.92, 0.98), interp3D(0.92, 0.45, 0.98), interp3D(0.08, 0.45, 0.98), '#6366f1', darkFrame)}

        {/* 床架正面與側面 */}
        {quad(interp3D(0, 0.28, 0), interp3D(1, 0.28, 0), interp3D(1, 0, 0), interp3D(0, 0, 0), darkFrame, '#1e1b4b')}
        {quad(interp3D(1, 0.45, 1), interp3D(1, 0.45, 0), interp3D(1, 0, 0), interp3D(1, 0, 1), darkFrame, '#1e1b4b')}
        {quad(interp3D(0, 0.45, 1), interp3D(0, 0.45, 0), interp3D(0, 0, 0), interp3D(0, 0, 1), darkFrame, '#1e1b4b')}

        {/* 柔軟被褥 (正面與頂部) */}
        {quad(interp3D(0, 0.45, 0), interp3D(1, 0.45, 0), interp3D(1, 0.25, 0), interp3D(0, 0.25, 0), quiltColor, darkFrame)}
        {/* 被面大面積向後延伸至枕頭前 */}
        {quad(interp3D(0, 0.45, 0.75), interp3D(1, 0.45, 0.75), interp3D(1, 0.45, 0), interp3D(0, 0.45, 0), quiltColor, darkFrame)}
        {/* 被單白色摺邊 */}
        {quad(interp3D(0, 0.46, 0.78), interp3D(1, 0.46, 0.78), interp3D(1, 0.46, 0.74), interp3D(0, 0.46, 0.74), '#ffffff', '#c7d2fe')}

        {/* 蓬鬆白色枕頭 (放於床頭) */}
        {quad(interp3D(0.18, 0.52, 0.96), interp3D(0.82, 0.52, 0.96), interp3D(0.82, 0.46, 0.78), interp3D(0.18, 0.46, 0.78), '#f8fafc', '#94a3b8', 1.5)}
      </g>
    );
  }

  // 4. 舒適客廳沙發 (Sofa)
  if (type === 'room-sofa' || type === 'sofa') {
    const sofaColor = original.color || '#059669';
    const cushionColor = '#10B981';
    const darkSofa = '#064E3B';

    return (
      <g className="furniture-sofa">
        {/* 沙發靠背 (後方) */}
        {quad(interp3D(0, 1, 1), interp3D(1, 1, 1), interp3D(1, 0.35, 1), interp3D(0, 0.35, 1), sofaColor, darkSofa)}
        {quad(interp3D(0, 1, 1), interp3D(1, 1, 1), interp3D(1, 1, 0.8), interp3D(0, 1, 0.8), cushionColor, darkSofa)}

        {/* 沙發底座與小木腳 */}
        {quad(interp3D(0, 0.15, 0), interp3D(1, 0.15, 0), interp3D(1, 0, 0), interp3D(0, 0, 0), darkSofa, '#022c22')}
        
        {/* 左側扶手 */}
        {quad(interp3D(0, 0.65, 0.8), interp3D(0.18, 0.65, 0.8), interp3D(0.18, 0.65, 0), interp3D(0, 0.65, 0), cushionColor, darkSofa)}
        {quad(interp3D(0, 0.65, 0), interp3D(0.18, 0.65, 0), interp3D(0.18, 0.15, 0), interp3D(0, 0.15, 0), sofaColor, darkSofa)}
        {quad(interp3D(0, 0.65, 0.8), interp3D(0, 0.65, 0), interp3D(0, 0.15, 0), interp3D(0, 0.15, 0.8), darkSofa, '#022c22')}

        {/* 右側扶手 */}
        {quad(interp3D(0.82, 0.65, 0.8), interp3D(1, 0.65, 0.8), interp3D(1, 0.65, 0), interp3D(0.82, 0.65, 0), cushionColor, darkSofa)}
        {quad(interp3D(0.82, 0.65, 0), interp3D(1, 0.65, 0), interp3D(1, 0.15, 0), interp3D(0.82, 0.15, 0), sofaColor, darkSofa)}
        {quad(interp3D(1, 0.65, 0.8), interp3D(1, 0.65, 0), interp3D(1, 0.15, 0), interp3D(1, 0.15, 0.8), darkSofa, '#022c22')}

        {/* 雙人柔軟坐墊 (左坐墊 & 右坐墊) */}
        {quad(interp3D(0.18, 0.4, 0), interp3D(0.5, 0.4, 0), interp3D(0.5, 0.15, 0), interp3D(0.18, 0.15, 0), cushionColor, darkSofa)}
        {quad(interp3D(0.5, 0.4, 0), interp3D(0.82, 0.4, 0), interp3D(0.82, 0.15, 0), interp3D(0.5, 0.15, 0), cushionColor, darkSofa)}
        {quad(interp3D(0.18, 0.4, 0.8), interp3D(0.5, 0.4, 0.8), interp3D(0.5, 0.4, 0), interp3D(0.18, 0.4, 0), cushionColor, darkSofa)}
        {quad(interp3D(0.5, 0.4, 0.8), interp3D(0.82, 0.4, 0.8), interp3D(0.82, 0.4, 0), interp3D(0.5, 0.4, 0), cushionColor, darkSofa)}

        {/* 沙發拉扣細節 */}
        <circle cx={interp3D(0.35, 0.75, 0.9).x} cy={interp3D(0.35, 0.75, 0.9).y} r="2.5" fill={darkSofa} />
        <circle cx={interp3D(0.65, 0.75, 0.9).x} cy={interp3D(0.65, 0.75, 0.9).y} r="2.5" fill={darkSofa} />
      </g>
    );
  }

  // 5. 三層實木書架 (Bookshelf)
  if (type === 'room-bookshelf' || type === 'cabinet') {
    const shelfWood = original.color || '#0369A1';
    const darkWood = '#075985';

    return (
      <g className="furniture-bookshelf">
        {/* 外框 (頂面、側壁、背板) */}
        {quad(interp3D(0, 1, 1), interp3D(1, 1, 1), interp3D(1, 0, 1), interp3D(0, 0, 1), '#0c4a6e', '#082f49')}
        {quad(interp3D(1, 1, 1), interp3D(1, 1, 0), interp3D(1, 0, 0), interp3D(1, 0, 1), darkWood, '#082f49')}
        {quad(interp3D(0, 1, 1), interp3D(0, 1, 0), interp3D(0, 0, 0), interp3D(0, 0, 1), darkWood, '#082f49')}
        {quad(interp3D(0, 1, 1), interp3D(1, 1, 1), interp3D(1, 1, 0), interp3D(0, 1, 0), shelfWood, darkWood)}

        {/* 三層隔板 */}
        {/* 第一層 (中下) */}
        {quad(interp3D(0, 0.35, 1), interp3D(1, 0.35, 1), interp3D(1, 0.35, 0), interp3D(0, 0.35, 0), '#38bdf8', darkWood)}
        {/* 第二層 (中上) */}
        {quad(interp3D(0, 0.68, 1), interp3D(1, 0.68, 1), interp3D(1, 0.68, 0), interp3D(0, 0.68, 0), '#38bdf8', darkWood)}

        {/* 第一層彩色書籍 */}
        {quad(interp3D(0.08, 0.35, 0.2), interp3D(0.18, 0.35, 0.2), interp3D(0.18, 0.05, 0.2), interp3D(0.08, 0.05, 0.2), '#ef4444', '#991b1b')}
        {quad(interp3D(0.19, 0.35, 0.2), interp3D(0.28, 0.35, 0.2), interp3D(0.28, 0.05, 0.2), interp3D(0.19, 0.05, 0.2), '#f59e0b', '#b45309')}
        {quad(interp3D(0.29, 0.35, 0.2), interp3D(0.42, 0.35, 0.2), interp3D(0.42, 0.05, 0.2), interp3D(0.29, 0.05, 0.2), '#10b981', '#047857')}

        {/* 第二層彩色書籍 */}
        {quad(interp3D(0.12, 0.68, 0.2), interp3D(0.25, 0.68, 0.2), interp3D(0.25, 0.4, 0.2), interp3D(0.12, 0.4, 0.2), '#8b5cf6', '#6d28d9')}
        {quad(interp3D(0.26, 0.68, 0.2), interp3D(0.38, 0.68, 0.2), interp3D(0.38, 0.4, 0.2), interp3D(0.26, 0.4, 0.2), '#ec4899', '#be185d')}
        {quad(interp3D(0.55, 0.68, 0.2), interp3D(0.72, 0.68, 0.2), interp3D(0.72, 0.4, 0.2), interp3D(0.55, 0.4, 0.2), '#06b6d4', '#0e7490')}

        {/* 第三層裝飾物 (可愛星星金盃) */}
        <circle cx={interp3D(0.5, 0.82, 0.3).x} cy={interp3D(0.5, 0.82, 0.3).y} r="5" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
      </g>
    );
  }

  // 6. 綠意盆栽 (Potted Plant)
  if (type === 'room-potted-plant') {
    const potColor = '#ea580c';
    const leafColor = original.color || '#16a34a';

    const pPotBL = interp3D(0.25, 0, 0.3);
    const pPotBR = interp3D(0.75, 0, 0.3);
    const pPotTR = interp3D(0.85, 0.45, 0.3);
    const pPotTL = interp3D(0.15, 0.45, 0.3);
    const midPlant = interp3D(0.5, 0.45, 0.3);

    return (
      <g className="furniture-plant">
        {/* 陶瓷花盆 */}
        {quad(pPotTL, pPotTR, pPotBR, pPotBL, potColor, '#9a3412', 1.8)}
        {/* 盆口厚唇 */}
        {quad(interp3D(0.12, 0.48, 0.25), interp3D(0.88, 0.48, 0.25), interp3D(0.85, 0.42, 0.35), interp3D(0.15, 0.42, 0.35), '#c2410c', '#7c2d12')}
        
        {/* 綠色大葉片 (龜背竹大葉) */}
        <path
          d={`M ${midPlant.x} ${midPlant.y} Q ${interp3D(0.05, 0.75, 0.2).x} ${interp3D(0.05, 0.75, 0.2).y} ${interp3D(0.1, 0.95, 0.2).x} ${interp3D(0.1, 0.95, 0.2).y} Q ${interp3D(0.3, 0.7, 0.2).x} ${interp3D(0.3, 0.7, 0.2).y} ${midPlant.x} ${midPlant.y}`}
          fill={leafColor}
          stroke="#14532d"
          strokeWidth="1.2"
        />
        <path
          d={`M ${midPlant.x} ${midPlant.y} Q ${interp3D(0.95, 0.75, 0.2).x} ${interp3D(0.95, 0.75, 0.2).y} ${interp3D(0.9, 0.95, 0.2).x} ${interp3D(0.9, 0.95, 0.2).y} Q ${interp3D(0.7, 0.7, 0.2).x} ${interp3D(0.7, 0.7, 0.2).y} ${midPlant.x} ${midPlant.y}`}
          fill={leafColor}
          stroke="#14532d"
          strokeWidth="1.2"
        />
        <path
          d={`M ${midPlant.x} ${midPlant.y} Q ${interp3D(0.5, 0.8, 0.1).x} ${interp3D(0.5, 0.8, 0.1).y} ${interp3D(0.5, 1.0, 0.1).x} ${interp3D(0.5, 1.0, 0.1).y} Q ${interp3D(0.58, 0.75, 0.1).x} ${interp3D(0.58, 0.75, 0.1).y} ${midPlant.x} ${midPlant.y}`}
          fill="#22c55e"
          stroke="#14532d"
          strokeWidth="1.2"
        />
        {/* 中心嬌豔小紅花 */}
        <circle cx={midPlant.x} cy={midPlant.y - 12} r="5" fill="#f43f5e" stroke="#9f1239" strokeWidth="1" />
        <circle cx={midPlant.x} cy={midPlant.y - 12} r="2" fill="#fde047" />
      </g>
    );
  }

  // 7. 五年級小學生角色 (Student)
  if (type === 'room-student' || type === 'person') {
    const pCenterFootL = interp3D(0.32, 0, 0);
    const pCenterFootR = interp3D(0.68, 0, 0);
    const pPelvis = interp3D(0.5, 0.38, 0);
    const pHead = interp3D(0.5, 0.86, 0);
    const headR = Math.max(7, Math.abs(interp3D(0.75, 0.86, 0).x - interp3D(0.25, 0.86, 0).x) * 0.42);

    return (
      <g className="furniture-student">
        {/* 白色運動鞋 */}
        <ellipse cx={pCenterFootL.x} cy={pCenterFootL.y} rx={headR * 0.45} ry={headR * 0.25} fill="#ffffff" stroke="#334155" strokeWidth="1" />
        <ellipse cx={pCenterFootR.x} cy={pCenterFootR.y} rx={headR * 0.45} ry={headR * 0.25} fill="#ffffff" stroke="#334155" strokeWidth="1" />

        {/* 雙腿 */}
        <line x1={pCenterFootL.x} y1={pCenterFootL.y} x2={interp3D(0.38, 0.38, 0).x} y2={pPelvis.y} stroke="#fbcfe8" strokeWidth={headR * 0.38} strokeLinecap="round" />
        <line x1={pCenterFootR.x} y1={pCenterFootR.y} x2={interp3D(0.62, 0.38, 0).x} y2={pPelvis.y} stroke="#fbcfe8" strokeWidth={headR * 0.38} strokeLinecap="round" />

        {/* 藍色短褲 */}
        {quad(interp3D(0.22, 0.52, 0), interp3D(0.78, 0.52, 0), interp3D(0.72, 0.36, 0), interp3D(0.28, 0.36, 0), '#2563eb', '#1e40af')}

        {/* 條紋活潑上衣 */}
        {quad(interp3D(0.22, 0.74, 0), interp3D(0.78, 0.74, 0), interp3D(0.78, 0.52, 0), interp3D(0.22, 0.52, 0), '#f59e0b', '#b45309')}
        <line x1={interp3D(0.22, 0.63, 0).x} y1={interp3D(0.22, 0.63, 0).y} x2={interp3D(0.78, 0.63, 0).x} y2={interp3D(0.78, 0.63, 0).y} stroke="#ffffff" strokeWidth="2.5" />

        {/* 雙手手臂 (揮手打招呼) */}
        <line x1={interp3D(0.22, 0.72, 0).x} y1={interp3D(0.22, 0.72, 0).y} x2={interp3D(0.08, 0.5, 0).x} y2={interp3D(0.08, 0.5, 0).y} stroke="#fbcfe8" strokeWidth="3" strokeLinecap="round" />
        <line x1={interp3D(0.78, 0.72, 0).x} y1={interp3D(0.78, 0.72, 0).y} x2={interp3D(0.95, 0.85, 0).x} y2={interp3D(0.95, 0.85, 0).y} stroke="#fbcfe8" strokeWidth="3" strokeLinecap="round" />
        <circle cx={interp3D(0.95, 0.85, 0).x} cy={interp3D(0.95, 0.85, 0).y} r="3" fill="#fbcfe8" />

        {/* 頭部與可愛臉蛋 */}
        <circle cx={pHead.x} cy={pHead.y} r={headR} fill="#fde68a" stroke="#d97706" strokeWidth="1.2" />
        {/* 俐落頭髮 */}
        <path
          d={`M ${pHead.x - headR} ${pHead.y} Q ${pHead.x} ${pHead.y - headR * 1.3} ${pHead.x + headR} ${pHead.y} Q ${pHead.x} ${pHead.y - headR * 0.7} ${pHead.x - headR} ${pHead.y}`}
          fill="#451a03"
        />
        {/* 明亮大眼睛 */}
        <circle cx={pHead.x - headR * 0.35} cy={pHead.y} r={headR * 0.16} fill="#1e293b" />
        <circle cx={pHead.x + headR * 0.35} cy={pHead.y} r={headR * 0.16} fill="#1e293b" />
        <circle cx={pHead.x - headR * 0.35 + 0.8} cy={pHead.y - 0.8} r={headR * 0.07} fill="#ffffff" />
        <circle cx={pHead.x + headR * 0.35 + 0.8} cy={pHead.y - 0.8} r={headR * 0.07} fill="#ffffff" />
        {/* 甜甜微笑 */}
        <path
          d={`M ${pHead.x - headR * 0.25} ${pHead.y + headR * 0.32} Q ${pHead.x} ${pHead.y + headR * 0.55} ${pHead.x + headR * 0.25} ${pHead.y + headR * 0.32}`}
          fill="none"
          stroke="#991b1b"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        {/* 粉紅腮紅 */}
        <circle cx={pHead.x - headR * 0.55} cy={pHead.y + headR * 0.25} r={headR * 0.18} fill="#f43f5e" fillOpacity="0.4" />
        <circle cx={pHead.x + headR * 0.55} cy={pHead.y + headR * 0.25} r={headR * 0.18} fill="#f43f5e" fillOpacity="0.4" />

        {/* 黃色小學生遮陽帽 */}
        <ellipse cx={pHead.x} cy={pHead.y - headR * 0.7} rx={headR * 1.15} ry={headR * 0.4} fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
        <path d={`M ${pHead.x - headR * 0.8} ${pHead.y - headR * 0.7} Q ${pHead.x} ${pHead.y - headR * 1.4} ${pHead.x + headR * 0.8} ${pHead.y - headR * 0.7}`} fill="#eab308" />
      </g>
    );
  }

  // 8. 幾何編織羊毛地毯 (Woven Carpet / Rug)
  if (type === 'room-rug' || type === 'rug' || type === 'bear-rug') {
    const mainColor = original.color || '#fef3c7';
    const borderColor = original.secondaryColor || '#b45309';

    const pFBL = interp3D(0, 0, 0);
    const pFBR = interp3D(1, 0, 0);
    const pBBR = interp3D(1, 0, 1);
    const pBBL = interp3D(0, 0, 1);

    const innerFBL = interp3D(0.1, 0, 0.1);
    const innerFBR = interp3D(0.9, 0, 0.1);
    const innerBBR = interp3D(0.9, 0, 0.9);
    const innerBBL = interp3D(0.1, 0, 0.9);

    const centerFBL = interp3D(0.25, 0, 0.25);
    const centerFBR = interp3D(0.75, 0, 0.25);
    const centerBBR = interp3D(0.75, 0, 0.75);
    const centerBBL = interp3D(0.25, 0, 0.75);

    return (
      <g className="furniture-rug">
        {/* 地毯外框本體 */}
        {quad(pFBL, pFBR, pBBR, pBBL, borderColor, '#78350f', 1.5)}
        {/* 內嵌柔和織紋面 */}
        {quad(innerFBL, innerFBR, innerBBR, innerBBL, mainColor, borderColor, 1.2)}
        {/* 中心幾何菱形飾紋 */}
        {quad(centerFBL, centerFBR, centerBBR, centerBBL, borderColor, '#92400e', 1)}
        <polygon
          points={polyPts([
            interp3D(0.5, 0, 0.25),
            interp3D(0.75, 0, 0.5),
            interp3D(0.5, 0, 0.75),
            interp3D(0.25, 0, 0.5)
          ])}
          fill={mainColor}
          stroke={borderColor}
          strokeWidth="1.2"
        />
        {/* 前端流蘇穗子 (Tassels) */}
        {[0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9].map((pos, idx) => {
          const pt = interp3D(pos, 0, 0);
          return (
            <line
              key={`tassel-f-${idx}`}
              x1={pt.x}
              y1={pt.y}
              x2={pt.x}
              y2={pt.y + 4}
              stroke="#d97706"
              strokeWidth="1.5"
            />
          );
        })}
      </g>
    );
  }

  // 9. 預設多邊形渲染 (Cube 等)
  return (
    <g className="furniture-generic-block">
      {proj.faces
        .filter(f => f.isVisible)
        .map(face => (
          <polygon
            key={face.id}
            points={face.points.map(p => `${p.x},${p.y}`).join(' ')}
            fill={getSurfaceFill(face.color, '#ffffff')}
            stroke={face.strokeColor}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        ))}
    </g>
  );
};
