/**
 * 幾何模型定義與投影網格產生器
 */

import { Point3D, GeometryModel, SceneObject, ProjectedObject, PerspectiveCamera, ProjectedFace, ProjectedEdge } from '../models/types';
import { projectVertices, isFaceVisible, adjustColorBrightness, createGuidelineRay } from './perspective';

/**
 * 建立標準長方體 / 正方體之 3D 模型
 * 基準點 (0,0,0) 為前方底面中央
 * @param width 寬度 (X)
 * @param height 高度 (Y, 往上方延伸所以為負 Y)
 * @param depth 深度 (Z, 往深處延伸為正 Z)
 */
export function createCuboidGeometry(width: number, height: number, depth: number): GeometryModel {
  const hw = width / 2;
  const h = height;
  const d = depth;

  // 頂點定義 (X, Y, Z)
  // 前面 4 點 (Z = 0)
  // 0: 前左下, 1: 前右下, 2: 前右上, 3: 前左上
  // 後面 4 點 (Z = d)
  // 4: 後左下, 5: 後右下, 6: 後右上, 7: 後左上
  const localVertices: Point3D[] = [
    { x: -hw, y: 0, z: 0 },    // 0: Front Bottom Left (FBL)
    { x: hw, y: 0, z: 0 },     // 1: Front Bottom Right (FBR)
    { x: hw, y: -h, z: 0 },    // 2: Front Top Right (FTR)
    { x: -hw, y: -h, z: 0 },   // 3: Front Top Left (FTL)

    { x: -hw, y: 0, z: d },    // 4: Back Bottom Left (BBL)
    { x: hw, y: 0, z: d },     // 5: Back Bottom Right (BBR)
    { x: hw, y: -h, z: d },    // 6: Back Top Right (BTR)
    { x: -hw, y: -h, z: d },   // 7: Back Top Left (BTL)
  ];

  // 面定義：使用右手定則，使外側觀察時為順時針旋向 (螢幕投影面積 > 0)
  const faces = [
    {
      id: 'front',
      name: '前面',
      vertexIndices: [3, 2, 1, 0], // FTL -> FTR -> FBR -> FBL
      shadeFactor: 1.0,
      cullBackface: false // 前面在正面視角下基本總能看見或覆蓋
    },
    {
      id: 'top',
      name: '頂面',
      vertexIndices: [7, 6, 2, 3], // BTL -> BTR -> FTR -> FTL
      shadeFactor: 1.25, // 頂光較亮
      cullBackface: true
    },
    {
      id: 'bottom',
      name: '底面',
      vertexIndices: [0, 1, 5, 4], // FBL -> FBR -> BBR -> BBL
      shadeFactor: 0.7, // 底面較暗
      cullBackface: true
    },
    {
      id: 'left',
      name: '左側面',
      vertexIndices: [7, 3, 0, 4], // BTL -> FTL -> FBL -> BBL
      shadeFactor: 0.88, // 側面微暗
      cullBackface: true
    },
    {
      id: 'right',
      name: '右側面',
      vertexIndices: [2, 6, 5, 1], // FTR -> BTR -> BBR -> FBR
      shadeFactor: 0.82,
      cullBackface: true
    },
    {
      id: 'back',
      name: '背面',
      vertexIndices: [6, 7, 4, 5], // BTR -> BTL -> BBL -> BBR
      shadeFactor: 0.75,
      cullBackface: true
    }
  ];

  // 12 條結構邊線
  const edges: [number, number][] = [
    // 前面 4 邊
    [0, 1], [1, 2], [2, 3], [3, 0],
    // 後面 4 邊
    [4, 5], [5, 6], [6, 7], [7, 4],
    // 連接前後的 4 條深度線 (收斂至透視點)
    [0, 4], [1, 5], [2, 6], [3, 7]
  ];

  // 透視輔助導引頂點 (通常取前方 4 個頂點)
  const guidelineVertices = [0, 1, 2, 3];

  return {
    localVertices,
    faces,
    edges,
    guidelineVertices
  };
}

/**
 * 建立簡易多稜柱體 (六稜柱)
 */
export function createPrismGeometry(radius: number, height: number, depth: number, sides = 6): GeometryModel {
  const localVertices: Point3D[] = [];
  const h = height;
  const d = depth;

  // 前面頂點 (Z = 0)
  for (let i = 0; i < sides; i++) {
    const angle = (i / sides) * Math.PI * 2 - Math.PI / 2;
    localVertices.push({
      x: Math.cos(angle) * radius,
      y: -h / 2 + Math.sin(angle) * (radius * 0.8) - h / 2,
      z: 0
    });
  }

  // 後面頂點 (Z = d)
  for (let i = 0; i < sides; i++) {
    const angle = (i / sides) * Math.PI * 2 - Math.PI / 2;
    localVertices.push({
      x: Math.cos(angle) * radius,
      y: -h / 2 + Math.sin(angle) * (radius * 0.8) - h / 2,
      z: d
    });
  }

  const faces = [];
  // 前面 (多邊形)
  faces.push({
    id: 'front',
    name: '前面',
    vertexIndices: Array.from({ length: sides }, (_, i) => i),
    shadeFactor: 1.0,
    cullBackface: false
  });

  // 側面多邊形
  for (let i = 0; i < sides; i++) {
    const next = (i + 1) % sides;
    faces.push({
      id: `side-${i}`,
      name: `側邊-${i}`,
      vertexIndices: [i, next, sides + next, sides + i],
      shadeFactor: 0.8 + 0.3 * Math.cos((i / sides) * Math.PI * 2),
      cullBackface: true
    });
  }

  const edges: [number, number][] = [];
  for (let i = 0; i < sides; i++) {
    const next = (i + 1) % sides;
    edges.push([i, next]);
    edges.push([sides + i, sides + next]);
    edges.push([i, sides + i]);
  }

  return {
    localVertices,
    faces,
    edges,
    guidelineVertices: [0, Math.floor(sides / 4), Math.floor(sides / 2), Math.floor((3 * sides) / 4)]
  };
}

/**
 * 建立書桌/課桌 3D 模型
 */
export function createDeskGeometry(width: number, height: number, depth: number): GeometryModel {
  const hw = width / 2;
  const h = height;
  const d = depth;
  const topThick = Math.max(6, h * 0.1);
  const legW = Math.max(5, hw * 0.12);

  // 包含桌面 (8點) 與 4 隻桌腳
  // 桌面頂點：
  // 0~3: 桌面下緣 (Z=0, -h+topThick), 4~7: 桌面上緣 (Z=0, -h)
  // 8~11: 桌面後下緣 (Z=d), 12~15: 桌面後上緣 (Z=d)
  const localVertices: Point3D[] = [
    // 桌面頂板 (8 個點)
    { x: -hw, y: -h + topThick, z: 0 }, // 0: 前左下
    { x: hw, y: -h + topThick, z: 0 },  // 1: 前右下
    { x: hw, y: -h, z: 0 },             // 2: 前右上
    { x: -hw, y: -h, z: 0 },            // 3: 前左上

    { x: -hw, y: -h + topThick, z: d }, // 4: 後左下
    { x: hw, y: -h + topThick, z: d },  // 5: 後右下
    { x: hw, y: -h, z: d },             // 6: 後右上
    { x: -hw, y: -h, z: d },            // 7: 後左上

    // 前左腳 (4 點: 底部與頂部連接處)
    { x: -hw, y: 0, z: 0 },             // 8: 腳底外
    { x: -hw + legW, y: 0, z: 0 },      // 9: 腳底內
    // 前右腳
    { x: hw - legW, y: 0, z: 0 },       // 10: 腳底內
    { x: hw, y: 0, z: 0 },              // 11: 腳底外
    // 後左腳
    { x: -hw, y: 0, z: d },             // 12: 後腳底外
    { x: -hw + legW, y: 0, z: d },      // 13: 後腳底內
    // 後右腳
    { x: hw - legW, y: 0, z: d },       // 14: 後腳底內
    { x: hw, y: 0, z: d },              // 15: 後腳底外
  ];

  const faces = [
    // 桌面頂面 (最重要)
    {
      id: 'table-top',
      name: '桌面頂部',
      vertexIndices: [7, 6, 2, 3],
      shadeFactor: 1.25,
      cullBackface: true
    },
    // 桌面正面
    {
      id: 'table-front',
      name: '桌面正面',
      vertexIndices: [3, 2, 1, 0],
      shadeFactor: 1.0,
      cullBackface: false
    },
    // 桌面左側
    {
      id: 'table-side-left',
      name: '桌面左側',
      vertexIndices: [7, 3, 0, 4],
      shadeFactor: 0.88,
      cullBackface: true
    },
    // 桌面右側
    {
      id: 'table-side-right',
      name: '桌面右側',
      vertexIndices: [2, 6, 5, 1],
      shadeFactor: 0.82,
      cullBackface: true
    },
    // 前左桌腳
    {
      id: 'leg-front-left',
      name: '前左桌腳',
      vertexIndices: [0, 9, 8],
      shadeFactor: 0.9,
      cullBackface: false
    },
    // 前右桌腳
    {
      id: 'leg-front-right',
      name: '前右桌腳',
      vertexIndices: [1, 11, 10],
      shadeFactor: 0.9,
      cullBackface: false
    },
    // 後左桌腳
    {
      id: 'leg-back-left',
      name: '後左桌腳',
      vertexIndices: [4, 13, 12],
      shadeFactor: 0.75,
      cullBackface: true
    },
    // 後右桌腳
    {
      id: 'leg-back-right',
      name: '後右桌腳',
      vertexIndices: [5, 15, 14],
      shadeFactor: 0.75,
      cullBackface: true
    }
  ];

  const edges: [number, number][] = [
    // 桌面輪廓
    [0, 1], [1, 2], [2, 3], [3, 0],
    [4, 5], [5, 6], [6, 7], [7, 4],
    [0, 4], [1, 5], [2, 6], [3, 7],
    // 4 隻桌腳
    [8, 0], [9, 0],
    [11, 1], [10, 1],
    [12, 4], [13, 4],
    [15, 5], [14, 5]
  ];

  return {
    localVertices,
    faces,
    edges,
    guidelineVertices: [2, 3, 8, 11]
  };
}

/**
 * 建立房屋 3D 模型 (具備人字形屋頂 Gable Roof 與收斂至 VP 之屋脊線)
 */
export function createHouseGeometry(width: number, height: number, depth: number): GeometryModel {
  const hw = width / 2;
  const wallH = height * 0.65;
  const totalH = height;
  const d = depth;

  const localVertices: Point3D[] = [
    // 牆體前面 4 點 (0~3)
    { x: -hw, y: 0, z: 0 },          // 0: 前左下
    { x: hw, y: 0, z: 0 },           // 1: 前右下
    { x: hw, y: -wallH, z: 0 },      // 2: 前右牆頂
    { x: -hw, y: -wallH, z: 0 },     // 3: 前左牆頂

    // 屋頂前屋脊 (4)
    { x: 0, y: -totalH, z: 0 },      // 4: 前屋脊尖端

    // 牆體後面 4 點 (5~8)
    { x: -hw, y: 0, z: d },          // 5: 後左下
    { x: hw, y: 0, z: d },           // 6: 後右下
    { x: hw, y: -wallH, z: d },      // 7: 後右牆頂
    { x: -hw, y: -wallH, z: d },     // 8: 後左牆頂

    // 屋頂後屋脊 (9)
    { x: 0, y: -totalH, z: d },      // 9: 後屋脊尖端
  ];

  const faces = [
    // 前面主牆 (五邊形：包含山牆)
    {
      id: 'house-front',
      name: '房屋正面',
      vertexIndices: [4, 2, 1, 0, 3],
      shadeFactor: 1.0,
      cullBackface: false
    },
    // 左側屋頂斜面
    {
      id: 'roof-left',
      name: '左側屋頂',
      vertexIndices: [9, 4, 3, 8],
      shadeFactor: 1.2,
      cullBackface: true
    },
    // 右側屋頂斜面
    {
      id: 'roof-right',
      name: '右側屋頂',
      vertexIndices: [4, 9, 7, 2],
      shadeFactor: 1.1,
      cullBackface: true
    },
    // 左側牆面
    {
      id: 'wall-left',
      name: '左側牆面',
      vertexIndices: [8, 3, 0, 5],
      shadeFactor: 0.88,
      cullBackface: true
    },
    // 右側牆面
    {
      id: 'wall-right',
      name: '右側牆面',
      vertexIndices: [2, 7, 6, 1],
      shadeFactor: 0.82,
      cullBackface: true
    }
  ];

  const edges: [number, number][] = [
    // 正面山牆與邊線
    [0, 1], [1, 2], [2, 4], [4, 3], [3, 0],
    // 背面邊線
    [5, 6], [6, 7], [7, 9], [9, 8], [8, 5],
    // 深度平行邊線 (收斂至透視點 VP)
    [0, 5], [1, 6], [2, 7], [3, 8],
    // 最關鍵的屋脊線！
    [4, 9]
  ];

  return {
    localVertices,
    faces,
    edges,
    guidelineVertices: [4, 2, 3, 0, 1]
  };
}

/**
 * 椅子 3D 幾何模型
 */
export function createChairGeometry(width: number, height: number, depth: number): GeometryModel {
  const hw = width / 2;
  const seatH = height * 0.45; // 坐墊高度
  const seatThick = Math.max(4, height * 0.08);
  const backH = height; // 椅背總高
  const legW = Math.max(4, hw * 0.15);
  const d = depth;

  const localVertices = [
    // 坐墊 (0~7)
    { x: -hw, y: -seatH + seatThick, z: 0 }, // 0: 坐墊前左下
    { x: hw, y: -seatH + seatThick, z: 0 },  // 1: 坐墊前右下
    { x: hw, y: -seatH, z: 0 },             // 2: 坐墊前右上
    { x: -hw, y: -seatH, z: 0 },            // 3: 坐墊前左上
    { x: -hw, y: -seatH + seatThick, z: d }, // 4: 坐墊後左下
    { x: hw, y: -seatH + seatThick, z: d },  // 5: 坐墊後右下
    { x: hw, y: -seatH, z: d },             // 6: 坐墊後右上
    { x: -hw, y: -seatH, z: d },            // 7: 坐墊後左上

    // 椅背 (8~11: 位於椅背後方 z=d)
    { x: -hw, y: -backH, z: d },            // 8: 椅背頂左
    { x: hw, y: -backH, z: d },             // 9: 椅背頂右

    // 前左腳 (10)
    { x: -hw + legW / 2, y: 0, z: 0 },
    // 前右腳 (11)
    { x: hw - legW / 2, y: 0, z: 0 },
    // 後左腳 (12)
    { x: -hw + legW / 2, y: 0, z: d },
    // 後右腳 (13)
    { x: hw - legW / 2, y: 0, z: d },
  ];

  const faces = [
    // 坐墊頂面
    {
      id: 'seat-top',
      name: '椅座頂面',
      vertexIndices: [7, 6, 2, 3],
      shadeFactor: 1.25,
      cullBackface: true
    },
    // 坐墊正面
    {
      id: 'seat-front',
      name: '椅座正面',
      vertexIndices: [3, 2, 1, 0],
      shadeFactor: 1.0,
      cullBackface: false
    },
    // 坐墊側面
    {
      id: 'seat-left',
      name: '椅座左側',
      vertexIndices: [7, 3, 0, 4],
      shadeFactor: 0.88,
      cullBackface: true
    },
    {
      id: 'seat-right',
      name: '椅座右側',
      vertexIndices: [2, 6, 5, 1],
      shadeFactor: 0.82,
      cullBackface: true
    },
    // 椅背板
    {
      id: 'backrest',
      name: '椅背',
      vertexIndices: [8, 9, 6, 7],
      shadeFactor: 1.1,
      cullBackface: true
    }
  ];

  const edges: [number, number][] = [
    // 坐墊框
    [0, 1], [1, 2], [2, 3], [3, 0],
    [4, 5], [5, 6], [6, 7], [7, 4],
    [0, 4], [1, 5], [2, 6], [3, 7],
    // 椅背
    [7, 8], [6, 9], [8, 9],
    // 椅腳
    [0, 10], [1, 11], [4, 12], [5, 13]
  ];

  return {
    localVertices,
    faces,
    edges,
    guidelineVertices: [2, 3, 8, 9]
  };
}

/**
 * 窗戶幾何模型 (立體外框 + 十字窗欞)
 */
export function createWindowGeometry(width: number, height: number, depth: number): GeometryModel {
  const hw = width / 2;
  const h = height;
  const d = Math.max(5, depth);

  const localVertices = [
    // 外框前 4 點
    { x: -hw, y: 0, z: 0 },
    { x: hw, y: 0, z: 0 },
    { x: hw, y: -h, z: 0 },
    { x: -hw, y: -h, z: 0 },
    // 外框後 4 點
    { x: -hw, y: 0, z: d },
    { x: hw, y: 0, z: d },
    { x: hw, y: -h, z: d },
    { x: -hw, y: -h, z: d },

    // 十字窗欞頂點 (前方)
    { x: 0, y: 0, z: 0 },      // 8: 下中
    { x: 0, y: -h, z: 0 },     // 9: 上中
    { x: -hw, y: -h / 2, z: 0 }, // 10: 左中
    { x: hw, y: -h / 2, z: 0 },  // 11: 右中
  ];

  const faces = [
    {
      id: 'glass',
      name: '玻璃面',
      vertexIndices: [3, 2, 1, 0],
      shadeFactor: 1.15,
      cullBackface: false
    },
    {
      id: 'frame-top',
      name: '窗框頂面',
      vertexIndices: [7, 6, 2, 3],
      shadeFactor: 1.25,
      cullBackface: true
    },
    {
      id: 'frame-left',
      name: '窗框左側面',
      vertexIndices: [7, 3, 0, 4],
      shadeFactor: 0.88,
      cullBackface: true
    },
    {
      id: 'frame-right',
      name: '窗框右側面',
      vertexIndices: [2, 6, 5, 1],
      shadeFactor: 0.82,
      cullBackface: true
    }
  ];

  const edges: [number, number][] = [
    [0, 1], [1, 2], [2, 3], [3, 0],
    [4, 5], [5, 6], [6, 7], [7, 4],
    [0, 4], [1, 5], [2, 6], [3, 7],
    // 十字窗格
    [8, 9], [10, 11]
  ];

  return {
    localVertices,
    faces,
    edges,
    guidelineVertices: [0, 1, 2, 3]
  };
}

/**
 * 樹木幾何模型 (樹幹 + 立體雙層樹冠)
 */
export function createTreeGeometry(width: number, height: number, depth: number): GeometryModel {
  const hw = width / 2;
  const trunkW = hw * 0.28;
  const trunkH = height * 0.35;
  const d = depth;

  const localVertices = [
    // 樹幹前底面 (0, 1)
    { x: -trunkW, y: 0, z: 0 },
    { x: trunkW, y: 0, z: 0 },
    // 樹幹前頂面 (2, 3)
    { x: trunkW, y: -trunkH, z: 0 },
    { x: -trunkW, y: -trunkH, z: 0 },
    // 樹幹後頂面與底面
    { x: -trunkW, y: 0, z: d },
    { x: trunkW, y: 0, z: d },
    { x: trunkW, y: -trunkH, z: d },
    { x: -trunkW, y: -trunkH, z: d },

    // 樹冠第一層 (下寬上窄稜錐)
    { x: -hw, y: -trunkH, z: 0 },           // 8: 下層左
    { x: hw, y: -trunkH, z: 0 },            // 9: 下層右
    { x: hw * 0.7, y: -height * 0.7, z: 0 }, // 10: 中層右
    { x: -hw * 0.7, y: -height * 0.7, z: 0 },// 11: 中層左
    // 樹冠頂層
    { x: 0, y: -height, z: 0 },             // 12: 樹頂尖
    // 樹冠後方對應頂點
    { x: -hw, y: -trunkH, z: d },
    { x: hw, y: -trunkH, z: d },
    { x: 0, y: -height, z: d }
  ];

  const faces = [
    // 樹幹正面
    {
      id: 'trunk-front',
      name: '樹幹正面',
      vertexIndices: [3, 2, 1, 0],
      shadeFactor: 0.8,
      cullBackface: false
    },
    // 樹冠下層正面
    {
      id: 'canopy-lower',
      name: '樹冠下層',
      vertexIndices: [11, 10, 9, 8],
      shadeFactor: 1.0,
      cullBackface: false
    },
    // 樹冠上層正面
    {
      id: 'canopy-upper',
      name: '樹冠上層',
      vertexIndices: [12, 10, 11],
      shadeFactor: 1.15,
      cullBackface: false
    },
    // 樹冠左斜面
    {
      id: 'canopy-left',
      name: '樹冠左側',
      vertexIndices: [15, 12, 11, 8, 13],
      shadeFactor: 0.9,
      cullBackface: true
    },
    // 樹冠右斜面
    {
      id: 'canopy-right',
      name: '樹冠右側',
      vertexIndices: [12, 15, 14, 9, 10],
      shadeFactor: 0.85,
      cullBackface: true
    }
  ];

  const edges: [number, number][] = [
    [0, 1], [1, 2], [2, 3], [3, 0],
    [8, 9], [9, 10], [10, 12], [12, 11], [11, 8],
    [0, 4], [1, 5], [8, 13], [9, 14], [12, 15]
  ];

  return {
    localVertices,
    faces,
    edges,
    guidelineVertices: [0, 1, 12]
  };
}

/**
 * 道路幾何模型 (向遠處延伸之雙線道地面，支援超長延伸與透視虛線)
 */
export function createRoadGeometry(width: number, _height: number, depth: number): GeometryModel {
  const hw = width / 2;
  const d = Math.max(20, depth);
  const stripeW = Math.max(2, hw * 0.04);

  const localVertices: Point3D[] = [
    // 前方路面 (Z=0, Y=0)
    { x: -hw, y: 0, z: 0 },  // 0: 前左路緣
    { x: hw, y: 0, z: 0 },   // 1: 前右路緣
    // 後方路面 (Z=d, Y=0)
    { x: hw, y: 0, z: d },   // 2: 後右路緣
    { x: -hw, y: 0, z: d },  // 3: 後左路緣
  ];

  const faces = [
    {
      id: 'road-surface',
      name: '柏油路面',
      vertexIndices: [3, 2, 1, 0],
      shadeFactor: 0.95,
      cullBackface: false
    }
  ];

  const edges: [number, number][] = [
    [0, 1], [1, 2], [2, 3], [3, 0]
  ];

  // 動態生成沿深度收斂的中央分道虛線標線 (隨距離自然由疏變密、由寬變窄)
  const stripeLen = 80;
  const stripeGap = 60;
  const step = stripeLen + stripeGap;
  let segIdx = 0;

  for (let zPos = 15; zPos + 25 < d; zPos += step) {
    const zStart = zPos;
    const zEnd = Math.min(d - 5, zPos + stripeLen);
    const baseV = localVertices.length;

    localVertices.push(
      { x: -stripeW, y: -0.5, z: zStart }, // baseV: 前左
      { x: stripeW, y: -0.5, z: zStart },  // baseV + 1: 前右
      { x: stripeW, y: -0.5, z: zEnd },    // baseV + 2: 後右
      { x: -stripeW, y: -0.5, z: zEnd }    // baseV + 3: 後左
    );

    faces.push({
      id: `road-stripe-${segIdx}`,
      name: `中央虛線-${segIdx}`,
      vertexIndices: [baseV + 3, baseV + 2, baseV + 1, baseV],
      shadeFactor: 1.45,
      cullBackface: false
    });

    segIdx++;
  }

  return {
    localVertices,
    faces,
    edges,
    guidelineVertices: [0, 1]
  };
}

/**
 * 簡化人物模型 (幾何造型學生)
 */
export function createPersonGeometry(width: number, height: number, depth: number): GeometryModel {
  const hw = width / 2;
  const torsoH = height * 0.45;
  const legH = height * 0.39;
  const d = Math.max(10, depth);

  const localVertices = [
    // 腳底 (0, 1)
    { x: -hw * 0.4, y: 0, z: 0 },
    { x: hw * 0.4, y: 0, z: 0 },
    // 軀幹下緣 (2, 3)
    { x: hw * 0.5, y: -legH, z: 0 },
    { x: -hw * 0.5, y: -legH, z: 0 },
    // 軀幹肩部 (4, 5)
    { x: hw * 0.6, y: -legH - torsoH, z: 0 },
    { x: -hw * 0.6, y: -legH - torsoH, z: 0 },
    // 頭部頂點 (6)
    { x: 0, y: -height, z: 0 },

    // 後方對應頂點 (7~13)
    { x: -hw * 0.4, y: 0, z: d },
    { x: hw * 0.4, y: 0, z: d },
    { x: hw * 0.5, y: -legH, z: d },
    { x: -hw * 0.5, y: -legH, z: d },
    { x: hw * 0.6, y: -legH - torsoH, z: d },
    { x: -hw * 0.6, y: -legH - torsoH, z: d },
    { x: 0, y: -height, z: d },
  ];

  const faces = [
    // 軀幹衣服
    {
      id: 'torso',
      name: '身體',
      vertexIndices: [5, 4, 2, 3],
      shadeFactor: 1.0,
      cullBackface: false
    },
    // 頭部 (菱形/多邊形頭部)
    {
      id: 'head',
      name: '頭部',
      vertexIndices: [6, 4, 5],
      shadeFactor: 1.1,
      cullBackface: false
    },
    // 側面
    {
      id: 'side-right',
      name: '右側',
      vertexIndices: [4, 11, 9, 2],
      shadeFactor: 0.85,
      cullBackface: true
    },
    {
      id: 'side-left',
      name: '左側',
      vertexIndices: [12, 5, 3, 10],
      shadeFactor: 0.85,
      cullBackface: true
    }
  ];

  const edges: [number, number][] = [
    [0, 3], [1, 2], // 雙腿
    [3, 2], [2, 4], [4, 5], [5, 3], // 軀幹
    [5, 6], [4, 6], // 頭部
    [0, 7], [1, 8], [4, 11], [5, 12], [6, 13]
  ];

  return {
    localVertices,
    faces,
    edges,
    guidelineVertices: [0, 1, 6]
  };
}

/**
 * 1. 經典轎車幾何模型 (車頭、擋風玻璃、車頂、後車廂、大燈、水箱護罩、車窗)
 */
export function createCarGeometry(width: number, height: number, depth: number): GeometryModel {
  const hw = width / 2;
  const h = height;
  const d = Math.max(20, depth);

  const bumperH = h * 0.42;    // 車身底盤/引擎蓋/車尾高度
  const roofH = h * 0.95;      // 車頂最高點
  const zHood = d * 0.32;      // 引擎蓋後緣 (前擋風玻璃下)
  const zRoofFront = d * 0.46; // 車頂前緣 (前擋風玻璃上)
  const zRoofRear = d * 0.72;  // 車頂後緣 (後擋風玻璃上)
  const zTrunk = d * 0.86;     // 行李箱前緣 (後擋風玻璃下)

  const localVertices: Point3D[] = [
    // 0~3: 車頭前臉 (Z = 0)
    { x: -hw, y: 0, z: 0 },                  // 0: 前左底
    { x: hw, y: 0, z: 0 },                   // 1: 前右底
    { x: hw, y: -bumperH, z: 0 },            // 2: 前右上
    { x: -hw, y: -bumperH, z: 0 },           // 3: 前左上

    // 4~5: 引擎蓋後緣 / 前擋風玻璃底 (Z = zHood)
    { x: -hw * 0.92, y: -bumperH, z: zHood }, // 4: 擋風左下
    { x: hw * 0.92, y: -bumperH, z: zHood },  // 5: 擋風右下

    // 6~7: 車頂前緣 (Z = zRoofFront, Y = -roofH)
    { x: -hw * 0.78, y: -roofH, z: zRoofFront }, // 6: 車頂前左
    { x: hw * 0.78, y: -roofH, z: zRoofFront },  // 7: 車頂前右

    // 8~9: 車頂後緣 (Z = zRoofRear, Y = -roofH)
    { x: -hw * 0.78, y: -roofH, z: zRoofRear },  // 8: 車頂後左
    { x: hw * 0.78, y: -roofH, z: zRoofRear },   // 9: 車頂後右

    // 10~11: 後擋風玻璃底 / 行李箱前端 (Z = zTrunk)
    { x: -hw * 0.92, y: -bumperH, z: zTrunk }, // 10: 後擋風左下
    { x: hw * 0.92, y: -bumperH, z: zTrunk },  // 11: 後擋風右下

    // 12~15: 車尾後臉 (Z = d)
    { x: -hw, y: 0, z: d },                  // 12: 車尾左底
    { x: hw, y: 0, z: d },                   // 13: 車尾右底
    { x: hw, y: -bumperH, z: d },            // 14: 車尾右上
    { x: -hw, y: -bumperH, z: d },           // 15: 車尾左上

    // 16~19: 車頭左大燈 (Z = 0)
    { x: -hw * 0.88, y: -bumperH * 0.82, z: 0 }, // 16: 左大燈左上
    { x: -hw * 0.58, y: -bumperH * 0.82, z: 0 }, // 17: 左大燈右上
    { x: -hw * 0.58, y: -bumperH * 0.38, z: 0 }, // 18: 左大燈右下
    { x: -hw * 0.88, y: -bumperH * 0.38, z: 0 }, // 19: 左大燈左下

    // 20~23: 車頭右大燈 (Z = 0)
    { x: hw * 0.58, y: -bumperH * 0.82, z: 0 },  // 20: 右大燈左上
    { x: hw * 0.88, y: -bumperH * 0.82, z: 0 },  // 21: 右大燈右上
    { x: hw * 0.88, y: -bumperH * 0.38, z: 0 },  // 22: 右大燈右下
    { x: hw * 0.58, y: -bumperH * 0.38, z: 0 },  // 23: 右大燈左下

    // 24~27: 水箱進氣柵 (Z = 0)
    { x: -hw * 0.45, y: -bumperH * 0.75, z: 0 }, // 24: 水箱格左上
    { x: hw * 0.45, y: -bumperH * 0.75, z: 0 },  // 25: 水箱格右上
    { x: hw * 0.45, y: -bumperH * 0.25, z: 0 },  // 26: 水箱格右下
    { x: -hw * 0.45, y: -bumperH * 0.25, z: 0 }, // 27: 水箱格左下
  ];

  const faces = [
    // 前保險桿主體
    { id: 'car-front', name: '車頭', vertexIndices: [3, 2, 1, 0], shadeFactor: 1.0, cullBackface: false },
    // 前大燈 (亮黃白光)
    { id: 'car-light-left', name: '左大燈', vertexIndices: [16, 17, 18, 19], shadeFactor: 1.7, cullBackface: false },
    { id: 'car-light-right', name: '右大燈', vertexIndices: [20, 21, 22, 23], shadeFactor: 1.7, cullBackface: false },
    // 水箱散熱網
    { id: 'car-grille', name: '進氣水箱罩', vertexIndices: [24, 25, 26, 27], shadeFactor: 0.45, cullBackface: false },
    // 引擎蓋 (頂面)
    { id: 'car-hood', name: '引擎蓋', vertexIndices: [3, 2, 5, 4], shadeFactor: 1.25, cullBackface: true },
    // 前擋風玻璃 (透視反光面)
    { id: 'car-windshield', name: '前擋風玻璃', vertexIndices: [4, 5, 7, 6], shadeFactor: 1.45, cullBackface: true },
    // 車頂面
    { id: 'car-roof', name: '車頂', vertexIndices: [6, 7, 9, 8], shadeFactor: 1.3, cullBackface: true },
    // 後擋風玻璃
    { id: 'car-rear-window', name: '後擋風玻璃', vertexIndices: [8, 9, 11, 10], shadeFactor: 1.15, cullBackface: true },
    // 行李箱蓋
    { id: 'car-trunk', name: '後車箱蓋', vertexIndices: [10, 11, 14, 15], shadeFactor: 1.2, cullBackface: true },
    // 車尾面
    { id: 'car-rear', name: '車尾', vertexIndices: [14, 15, 12, 13], shadeFactor: 0.75, cullBackface: true },
    // 右側面 (底盤與車窗)
    { id: 'car-side-right-body', name: '右車身', vertexIndices: [2, 14, 13, 1], shadeFactor: 0.82, cullBackface: true },
    { id: 'car-side-right-window', name: '右側車窗', vertexIndices: [5, 7, 9, 11], shadeFactor: 0.95, cullBackface: true },
    // 左側面 (底盤與車窗)
    { id: 'car-side-left-body', name: '左車身', vertexIndices: [15, 3, 0, 12], shadeFactor: 0.88, cullBackface: true },
    { id: 'car-side-left-window', name: '左側車窗', vertexIndices: [8, 6, 4, 10], shadeFactor: 0.95, cullBackface: true },
    // 底面
    { id: 'car-bottom', name: '底盤', vertexIndices: [0, 1, 13, 12], shadeFactor: 0.5, cullBackface: true },
  ];

  const edges: [number, number][] = [
    // 車頭外框與特徵
    [0, 1], [1, 2], [2, 3], [3, 0],
    [16, 17], [17, 18], [18, 19], [19, 16],
    [20, 21], [21, 22], [22, 23], [23, 20],
    [24, 25], [25, 26], [26, 27], [27, 24],
    // 引擎蓋與擋風玻璃
    [3, 4], [2, 5], [4, 5],
    [4, 6], [5, 7], [6, 7],
    // 車頂與後擋風玻璃
    [6, 8], [7, 9], [8, 9],
    [8, 10], [9, 11], [10, 11],
    // 後車廂與車尾
    [10, 15], [11, 14],
    [12, 13], [13, 14], [14, 15], [15, 12],
    // 底盤輪廓延伸
    [0, 12], [1, 13]
  ];

  return {
    localVertices,
    faces,
    edges,
    guidelineVertices: [0, 1, 2, 3, 6, 7]
  };
}

/**
 * 2. 城市公車幾何模型 (超大前擋風玻璃、公車路線 LED 看板、車身兩側車窗、車頂空調)
 */
export function createBusGeometry(width: number, height: number, depth: number): GeometryModel {
  const hw = width / 2;
  const h = height;
  const d = Math.max(30, depth);

  const bumperH = h * 0.28;   // 前保險桿高度
  const windowTopH = h * 0.86;// 擋風玻璃頂部
  const ledH = h * 0.96;      // LED 路線看板頂部
  const roofH = h;            // 公車車頂

  const localVertices: Point3D[] = [
    // 0~3: 車頭前臉底座 (Z = 0)
    { x: -hw, y: 0, z: 0 },                     // 0: 前左底
    { x: hw, y: 0, z: 0 },                      // 1: 前右底
    { x: hw, y: -bumperH, z: 0 },               // 2: 保險桿右上
    { x: -hw, y: -bumperH, z: 0 },              // 3: 保險桿左上

    // 4~7: 前大擋風玻璃 (Z = 0)
    { x: -hw * 0.92, y: -bumperH * 1.05, z: 0 },// 4: 擋風左下
    { x: hw * 0.92, y: -bumperH * 1.05, z: 0 }, // 5: 擋風右下
    { x: hw * 0.92, y: -windowTopH, z: 0 },     // 6: 擋風右上
    { x: -hw * 0.92, y: -windowTopH, z: 0 },    // 7: 擋風左上

    // 8~11: LED 路線指示看板 (Z = 0)
    { x: -hw * 0.65, y: -windowTopH - h * 0.02, z: 0 }, // 8: LED 左下
    { x: hw * 0.65, y: -windowTopH - h * 0.02, z: 0 },  // 9: LED 右下
    { x: hw * 0.65, y: -ledH, z: 0 },                   // 10: LED 右上
    { x: -hw * 0.65, y: -ledH, z: 0 },                  // 11: LED 左上

    // 12~15: 車頭頂部 (Z = 0) 與 車尾頂部 (Z = d)
    { x: -hw, y: -roofH, z: 0 },                // 12: 車頭頂左
    { x: hw, y: -roofH, z: 0 },                 // 13: 車頭頂右
    { x: hw, y: -roofH, z: d },                 // 14: 車尾頂右
    { x: -hw, y: -roofH, z: d },                // 15: 車尾頂左

    // 16~19: 車尾後臉 (Z = d)
    { x: -hw, y: 0, z: d },                     // 16: 車尾左底
    { x: hw, y: 0, z: d },                      // 17: 車尾右底
    { x: hw, y: -roofH * 0.85, z: d },          // 18: 車尾後窗底
    { x: -hw, y: -roofH * 0.85, z: d },         // 19: 車尾後窗底左

    // 20~23: 車頂空調冷氣箱 (Z = d*0.35 ~ d*0.65)
    { x: -hw * 0.5, y: -roofH * 1.08, z: d * 0.35 }, // 20: 冷氣箱前左
    { x: hw * 0.5, y: -roofH * 1.08, z: d * 0.35 },  // 21: 冷氣箱前右
    { x: hw * 0.5, y: -roofH * 1.08, z: d * 0.65 },  // 22: 冷氣箱後右
    { x: -hw * 0.5, y: -roofH * 1.08, z: d * 0.65 }, // 23: 冷氣箱後左
  ];

  const faces = [
    // 車頭正面
    { id: 'bus-front-bumper', name: '公車保險桿', vertexIndices: [3, 2, 1, 0], shadeFactor: 1.0, cullBackface: false },
    { id: 'bus-windshield', name: '全景前擋風玻璃', vertexIndices: [7, 6, 5, 4], shadeFactor: 1.45, cullBackface: false },
    { id: 'bus-led-display', name: '路線看板', vertexIndices: [11, 10, 9, 8], shadeFactor: 1.85, cullBackface: false },
    { id: 'bus-front-roof-cap', name: '車頭頂額', vertexIndices: [12, 13, 2, 3], shadeFactor: 1.05, cullBackface: false },
    // 車頂面
    { id: 'bus-roof', name: '公車車頂', vertexIndices: [15, 14, 13, 12], shadeFactor: 1.3, cullBackface: true },
    // 車頂冷氣箱頂面
    { id: 'bus-ac-top', name: '空調散熱箱', vertexIndices: [23, 22, 21, 20], shadeFactor: 1.35, cullBackface: true },
    // 車尾面
    { id: 'bus-rear', name: '公車車尾', vertexIndices: [14, 15, 16, 17], shadeFactor: 0.75, cullBackface: true },
    // 右側面 (乘客門側)
    { id: 'bus-side-right', name: '右側身與觀光車窗', vertexIndices: [13, 14, 17, 1], shadeFactor: 0.82, cullBackface: true },
    // 左側面 (司機側)
    { id: 'bus-side-left', name: '左側身與觀景窗', vertexIndices: [15, 12, 0, 16], shadeFactor: 0.88, cullBackface: true },
    // 底面
    { id: 'bus-bottom', name: '底盤', vertexIndices: [0, 1, 17, 16], shadeFactor: 0.5, cullBackface: true },
  ];

  const edges: [number, number][] = [
    [0, 1], [1, 2], [2, 3], [3, 0],
    [4, 5], [5, 6], [6, 7], [7, 4],
    [8, 9], [9, 10], [10, 11], [11, 8],
    [12, 13], [13, 14], [14, 15], [15, 12],
    [16, 17], [17, 14], [16, 15],
    [0, 16], [1, 17], [12, 3], [13, 2],
    [20, 21], [21, 22], [22, 23], [23, 20]
  ];

  return {
    localVertices,
    faces,
    edges,
    guidelineVertices: [0, 1, 12, 13]
  };
}

/**
 * 3. 貨運卡車幾何模型 (車頭駕駛室、後方長方體貨櫃、輪胎底盤裝甲)
 */
export function createTruckGeometry(width: number, height: number, depth: number): GeometryModel {
  const hw = width / 2;
  const h = height;
  const d = Math.max(30, depth);

  const cabW = hw * 0.9;       // 駕駛車頭寬度 (略小於貨櫃)
  const cabH = h * 0.75;       // 駕駛車頭高度 (低於貨櫃)
  const cabZ = d * 0.35;       // 駕駛車頭長度
  const cargoZStart = d * 0.38;// 貨櫃起始點 (與車頭有些微間隔)

  const localVertices: Point3D[] = [
    // 0~3: 駕駛室前臉 (Z = 0)
    { x: -cabW, y: 0, z: 0 },                 // 0: 車頭左底
    { x: cabW, y: 0, z: 0 },                  // 1: 車頭右底
    { x: cabW, y: -cabH, z: 0 },              // 2: 車頭右上
    { x: -cabW, y: -cabH, z: 0 },             // 3: 車頭左上

    // 4~7: 駕駛室前擋風玻璃 (Z = 0)
    { x: -cabW * 0.85, y: -cabH * 0.45, z: 0 }, // 4: 擋風左下
    { x: cabW * 0.85, y: -cabH * 0.45, z: 0 },  // 5: 擋風右下
    { x: cabW * 0.85, y: -cabH * 0.9, z: 0 },   // 6: 擋風右上
    { x: -cabW * 0.85, y: -cabH * 0.9, z: 0 },  // 7: 擋風左上

    // 8~11: 駕駛室後背 (Z = cabZ)
    { x: -cabW, y: 0, z: cabZ },              // 8: 車頭後左底
    { x: cabW, y: 0, z: cabZ },               // 9: 車頭後右底
    { x: cabW, y: -cabH, z: cabZ },           // 10: 車頭後右上
    { x: -cabW, y: -cabH, z: cabZ },          // 11: 車頭後左上

    // 12~15: 後方貨櫃前端 (Z = cargoZStart, Y = -h)
    { x: -hw, y: 0, z: cargoZStart },         // 12: 貨櫃前左底
    { x: hw, y: 0, z: cargoZStart },          // 13: 貨櫃前右底
    { x: hw, y: -h, z: cargoZStart },         // 14: 貨櫃前右上
    { x: -hw, y: -h, z: cargoZStart },        // 15: 貨櫃前左上

    // 16~19: 後方貨櫃尾端 (Z = d, Y = -h)
    { x: -hw, y: 0, z: d },                   // 16: 貨櫃後左底
    { x: hw, y: 0, z: d },                    // 17: 貨櫃後右底
    { x: hw, y: -h, z: d },                   // 18: 貨櫃後右上
    { x: -hw, y: -h, z: d },                  // 19: 貨櫃後左上
  ];

  const faces = [
    // 車頭正面
    { id: 'truck-cab-front', name: '車頭保險桿', vertexIndices: [3, 2, 1, 0], shadeFactor: 1.0, cullBackface: false },
    { id: 'truck-windshield', name: '駕駛前擋玻璃', vertexIndices: [7, 6, 5, 4], shadeFactor: 1.4, cullBackface: false },
    // 車頭頂面
    { id: 'truck-cab-top', name: '車頭頂面', vertexIndices: [11, 10, 2, 3], shadeFactor: 1.25, cullBackface: true },
    // 車頭兩側
    { id: 'truck-cab-right', name: '車頭右側', vertexIndices: [2, 10, 9, 1], shadeFactor: 0.82, cullBackface: true },
    { id: 'truck-cab-left', name: '車頭左側', vertexIndices: [11, 3, 0, 8], shadeFactor: 0.88, cullBackface: true },
    // 貨櫃前端 (高出車頭的部分)
    { id: 'truck-cargo-front', name: '貨櫃前板', vertexIndices: [15, 14, 13, 12], shadeFactor: 0.95, cullBackface: true },
    // 貨櫃頂面
    { id: 'truck-cargo-top', name: '貨櫃頂面', vertexIndices: [19, 18, 14, 15], shadeFactor: 1.3, cullBackface: true },
    // 貨櫃右側板
    { id: 'truck-cargo-right', name: '貨櫃右側板', vertexIndices: [14, 18, 17, 13], shadeFactor: 0.82, cullBackface: true },
    // 貨櫃左側板
    { id: 'truck-cargo-left', name: '貨櫃左側板', vertexIndices: [19, 15, 12, 16], shadeFactor: 0.88, cullBackface: true },
    // 貨櫃後門
    { id: 'truck-cargo-rear', name: '貨櫃對開後門', vertexIndices: [18, 19, 16, 17], shadeFactor: 0.75, cullBackface: true },
  ];

  const edges: [number, number][] = [
    [0, 1], [1, 2], [2, 3], [3, 0],
    [4, 5], [5, 6], [6, 7], [7, 4],
    [2, 10], [3, 11], [10, 11], [1, 9], [0, 8], [9, 10], [8, 11],
    [12, 13], [13, 14], [14, 15], [15, 12],
    [16, 17], [17, 18], [18, 19], [19, 16],
    [12, 16], [13, 17], [14, 18], [15, 19]
  ];

  return {
    localVertices,
    faces,
    edges,
    guidelineVertices: [0, 1, 2, 3, 14, 15]
  };
}

/**
 * 4. 城市路燈幾何模型 (基座、立柱、延伸懸臂、照明燈罩、發光面)
 */
export function createStreetlightGeometry(width: number, height: number, depth: number): GeometryModel {
  const hw = width / 2;
  const h = height;
  const d = Math.max(15, depth);

  const baseW = hw * 0.45;    // 基座半寬
  const baseH = h * 0.08;     // 基座高度
  const poleW = hw * 0.12;    // 燈桿半寬
  const poleTopH = h * 0.88;  // 燈桿頂端
  const lampH = h * 0.98;     // 燈具高度

  const localVertices: Point3D[] = [
    // 0~3: 基座前臉 (Z = 0)
    { x: -baseW, y: 0, z: 0 },         // 0
    { x: baseW, y: 0, z: 0 },          // 1
    { x: baseW, y: -baseH, z: 0 },     // 2
    { x: -baseW, y: -baseH, z: 0 },    // 3
    // 4~7: 基座後臉 (Z = d * 0.4)
    { x: -baseW, y: 0, z: d * 0.4 },      // 4
    { x: baseW, y: 0, z: d * 0.4 },       // 5
    { x: baseW, y: -baseH, z: d * 0.4 },  // 6
    { x: -baseW, y: -baseH, z: d * 0.4 }, // 7

    // 8~11: 燈柱前臉 (Z = d * 0.15)
    { x: -poleW, y: -baseH, z: d * 0.15 },    // 8: 柱底左
    { x: poleW, y: -baseH, z: d * 0.15 },     // 9: 柱底右
    { x: poleW, y: -poleTopH, z: d * 0.15 },  // 10: 柱頂右
    { x: -poleW, y: -poleTopH, z: d * 0.15 }, // 11: 柱頂左

    // 12~15: 燈柱後臉 (Z = d * 0.25)
    { x: -poleW, y: -baseH, z: d * 0.25 },
    { x: poleW, y: -baseH, z: d * 0.25 },
    { x: poleW, y: -poleTopH, z: d * 0.25 },
    { x: -poleW, y: -poleTopH, z: d * 0.25 },

    // 16~19: 延伸彎臂與燈頭 (向右方懸挑)
    { x: hw * 0.8, y: -lampH, z: d * 0.15 },         // 16: 燈罩右端
    { x: hw * 0.45, y: -lampH * 0.95, z: d * 0.15 }, // 17: 燈罩左端
    { x: hw * 0.8, y: -lampH, z: d * 0.35 },         // 18: 燈罩後右
    { x: hw * 0.45, y: -lampH * 0.95, z: d * 0.35 }, // 19: 燈罩後左
  ];

  const faces = [
    // 基座
    { id: 'lamp-base-front', name: '基座正面', vertexIndices: [3, 2, 1, 0], shadeFactor: 0.9, cullBackface: false },
    { id: 'lamp-base-top', name: '基座頂部', vertexIndices: [7, 6, 2, 3], shadeFactor: 1.2, cullBackface: true },
    { id: 'lamp-base-right', name: '基座右側', vertexIndices: [2, 6, 5, 1], shadeFactor: 0.82, cullBackface: true },
    { id: 'lamp-base-left', name: '基座左側', vertexIndices: [7, 3, 0, 4], shadeFactor: 0.88, cullBackface: true },
    // 燈柱
    { id: 'lamp-pole-front', name: '路燈金屬立桿', vertexIndices: [11, 10, 9, 8], shadeFactor: 1.0, cullBackface: false },
    { id: 'lamp-pole-right', name: '立桿右側', vertexIndices: [10, 14, 13, 9], shadeFactor: 0.82, cullBackface: true },
    { id: 'lamp-pole-left', name: '立桿左側', vertexIndices: [15, 11, 8, 12], shadeFactor: 0.88, cullBackface: true },
    // 燈罩頂面與發光面
    { id: 'lamp-head-top', name: '懸臂燈罩頂面', vertexIndices: [18, 16, 17, 19], shadeFactor: 1.25, cullBackface: true },
    { id: 'lamp-light-surface', name: '夜間照明發光燈面', vertexIndices: [17, 16, 18, 19], shadeFactor: 1.85, cullBackface: false },
  ];

  const edges: [number, number][] = [
    [0, 1], [1, 2], [2, 3], [3, 0],
    [4, 5], [5, 6], [6, 7], [7, 4],
    [0, 4], [1, 5], [2, 6], [3, 7],
    [8, 9], [9, 10], [10, 11], [11, 8],
    [10, 14], [11, 15], [14, 15],
    [10, 17], [14, 19], [17, 16], [19, 18], [16, 18], [17, 19]
  ];

  return {
    localVertices,
    faces,
    edges,
    guidelineVertices: [0, 1, 10, 16]
  };
}

/**
 * 5. 摩天商辦大樓幾何模型 (三段式階梯收束塔樓、高空避雷尖塔、外牆網格玻璃窗)
 */
export function createSkyscraperGeometry(width: number, height: number, depth: number): GeometryModel {
  const hw = width / 2;
  const h = height;
  const d = Math.max(30, depth);

  const t1H = h * 0.58;       // 第一段主塔高
  const t2H = h * 0.88;       // 第二段收束塔高
  const t3H = h * 0.96;       // 第三段頂冠高
  const spireH = h;           // 避雷尖塔頂

  const w2 = hw * 0.82;       // 第二段半寬
  const w3 = hw * 0.65;       // 第三段半寬

  const localVertices: Point3D[] = [
    // 0~3: 第一段主塔前臉 (Z = 0)
    { x: -hw, y: 0, z: 0 },          // 0: 前左底
    { x: hw, y: 0, z: 0 },           // 1: 前右底
    { x: hw, y: -t1H, z: 0 },        // 2: 前右上
    { x: -hw, y: -t1H, z: 0 },       // 3: 前左上
    // 4~7: 第一段主塔後臉 (Z = d)
    { x: -hw, y: 0, z: d },          // 4
    { x: hw, y: 0, z: d },           // 5
    { x: hw, y: -t1H, z: d },        // 6
    { x: -hw, y: -t1H, z: d },       // 7

    // 8~11: 第二段塔樓前臉 (Z = d * 0.1)
    { x: -w2, y: -t1H, z: d * 0.1 }, // 8
    { x: w2, y: -t1H, z: d * 0.1 },  // 9
    { x: w2, y: -t2H, z: d * 0.1 },  // 10
    { x: -w2, y: -t2H, z: d * 0.1 }, // 11
    // 12~15: 第二段塔樓後臉 (Z = d * 0.9)
    { x: -w2, y: -t1H, z: d * 0.9 },
    { x: w2, y: -t1H, z: d * 0.9 },
    { x: w2, y: -t2H, z: d * 0.9 },
    { x: -w2, y: -t2H, z: d * 0.9 },

    // 16~19: 第三段頂冠前臉 (Z = d * 0.2)
    { x: -w3, y: -t2H, z: d * 0.2 }, // 16
    { x: w3, y: -t2H, z: d * 0.2 },  // 17
    { x: w3, y: -t3H, z: d * 0.2 },  // 18
    { x: -w3, y: -t3H, z: d * 0.2 }, // 19

    // 20: 避雷尖塔頂點 (Z = d * 0.5)
    { x: 0, y: -spireH, z: d * 0.5 },
  ];

  const faces = [
    // 一段主塔正面 (大片落地玻璃帷幕)
    { id: 'sky-t1-front', name: '主塔玻璃帷幕正面', vertexIndices: [3, 2, 1, 0], shadeFactor: 1.05, cullBackface: false },
    { id: 'sky-t1-top', name: '主塔退縮平台', vertexIndices: [7, 6, 2, 3], shadeFactor: 1.25, cullBackface: true },
    { id: 'sky-t1-right', name: '主塔右側帷幕', vertexIndices: [2, 6, 5, 1], shadeFactor: 0.82, cullBackface: true },
    { id: 'sky-t1-left', name: '主塔左側帷幕', vertexIndices: [7, 3, 0, 4], shadeFactor: 0.88, cullBackface: true },
    // 二段塔樓
    { id: 'sky-t2-front', name: '中段塔樓正面', vertexIndices: [11, 10, 9, 8], shadeFactor: 1.1, cullBackface: false },
    { id: 'sky-t2-top', name: '中段頂層平台', vertexIndices: [15, 14, 10, 11], shadeFactor: 1.28, cullBackface: true },
    { id: 'sky-t2-right', name: '中段右側', vertexIndices: [10, 14, 13, 9], shadeFactor: 0.82, cullBackface: true },
    { id: 'sky-t2-left', name: '中段左側', vertexIndices: [15, 11, 8, 12], shadeFactor: 0.88, cullBackface: true },
    // 三段頂冠
    { id: 'sky-t3-front', name: '大樓頂冠正面', vertexIndices: [19, 18, 17, 16], shadeFactor: 1.15, cullBackface: false },
    { id: 'sky-spire-front', name: '高空避雷尖塔', vertexIndices: [20, 18, 19], shadeFactor: 1.4, cullBackface: false },
  ];

  const edges: [number, number][] = [
    [0, 1], [1, 2], [2, 3], [3, 0],
    [4, 5], [5, 6], [6, 7], [7, 4],
    [0, 4], [1, 5], [2, 6], [3, 7],
    [8, 9], [9, 10], [10, 11], [11, 8],
    [10, 14], [11, 15], [14, 15], [9, 13], [8, 12],
    [16, 17], [17, 18], [18, 19], [19, 16],
    [18, 20], [19, 20]
  ];

  return {
    localVertices,
    faces,
    edges,
    guidelineVertices: [0, 1, 2, 3, 20]
  };
}

/**
 * 6. 街角商店幾何模型 (斜面條紋遮陽棚、全景展示櫥窗、商店玻璃門、招牌看板)
 */
export function createStoreGeometry(width: number, height: number, depth: number): GeometryModel {
  const hw = width / 2;
  const h = height;
  const d = Math.max(25, depth);

  const awningTopH = h * 0.62;   // 遮陽棚上方接牆處
  const awningLowH = h * 0.46;   // 遮陽棚前緣下方
  const signTopH = h * 0.92;     // 商店大看板頂端
  const windowTopH = h * 0.44;   // 櫥窗高度

  const localVertices: Point3D[] = [
    // 0~3: 建築物主體前臉 (Z = 0)
    { x: -hw, y: 0, z: 0 },          // 0: 前左底
    { x: hw, y: 0, z: 0 },           // 1: 前右底
    { x: hw, y: -h, z: 0 },          // 2: 前右上
    { x: -hw, y: -h, z: 0 },         // 3: 前左上
    // 4~7: 建築物後臉 (Z = d)
    { x: -hw, y: 0, z: d },          // 4
    { x: hw, y: 0, z: d },           // 5
    { x: hw, y: -h, z: d },          // 6
    { x: -hw, y: -h, z: d },         // 7

    // 8~11: 條紋遮陽棚向街面伸出 (Z = -d * 0.28, Y = -awningLowH)
    { x: -hw * 1.04, y: -awningTopH, z: 0 },            // 8: 遮陽棚左後 (靠牆)
    { x: hw * 1.04, y: -awningTopH, z: 0 },             // 9: 遮陽棚右後 (靠牆)
    { x: hw * 1.04, y: -awningLowH, z: -d * 0.28 },     // 10: 遮陽棚右前 (向外懸挑)
    { x: -hw * 1.04, y: -awningLowH, z: -d * 0.28 },    // 11: 遮陽棚左前 (向外懸挑)

    // 12~15: 商店招牌大看板 (Z = -0.5, 浮在正面上方)
    { x: -hw * 0.9, y: -awningTopH - h * 0.04, z: 0 },  // 12: 看板左下
    { x: hw * 0.9, y: -awningTopH - h * 0.04, z: 0 },   // 13: 看板右下
    { x: hw * 0.9, y: -signTopH, z: 0 },                // 14: 看板右上
    { x: -hw * 0.9, y: -signTopH, z: 0 },               // 15: 看板左上

    // 16~19: 左側玻璃大展示櫥窗 (Z = 0)
    { x: -hw * 0.92, y: -h * 0.06, z: 0 },              // 16: 櫥窗左底
    { x: -hw * 0.1, y: -h * 0.06, z: 0 },               // 17: 櫥窗右底
    { x: -hw * 0.1, y: -windowTopH, z: 0 },             // 18: 櫥窗右上
    { x: -hw * 0.92, y: -windowTopH, z: 0 },            // 19: 櫥窗左上

    // 20~23: 右側商店玻璃門 (Z = 0)
    { x: hw * 0.05, y: 0, z: 0 },                       // 20: 門左底
    { x: hw * 0.88, y: 0, z: 0 },                       // 21: 門右底
    { x: hw * 0.88, y: -windowTopH, z: 0 },             // 22: 門右上
    { x: hw * 0.05, y: -windowTopH, z: 0 },             // 23: 門左上
  ];

  const faces = [
    // 建築物牆面正面
    { id: 'store-wall-front', name: '商店牆面正面', vertexIndices: [3, 2, 1, 0], shadeFactor: 1.0, cullBackface: false },
    // 商店玻璃展示櫥窗
    { id: 'store-showcase', name: '採光展示櫥窗', vertexIndices: [19, 18, 17, 16], shadeFactor: 1.4, cullBackface: false },
    // 商店玻璃門
    { id: 'store-door', name: '商店迎賓大門', vertexIndices: [23, 22, 21, 20], shadeFactor: 1.15, cullBackface: false },
    // 商店大看板
    { id: 'store-signboard', name: '商店特色招牌', vertexIndices: [15, 14, 13, 12], shadeFactor: 1.35, cullBackface: false },
    // 遮陽棚斜面 (向街面伸出)
    { id: 'store-awning-slope', name: '條紋遮陽雨棚', vertexIndices: [8, 9, 10, 11], shadeFactor: 1.3, cullBackface: false },
    // 建築頂面與側面
    { id: 'store-roof', name: '建築平頂', vertexIndices: [7, 6, 2, 3], shadeFactor: 1.25, cullBackface: true },
    { id: 'store-side-right', name: '建築右側牆', vertexIndices: [2, 6, 5, 1], shadeFactor: 0.82, cullBackface: true },
    { id: 'store-side-left', name: '建築左側牆', vertexIndices: [7, 3, 0, 4], shadeFactor: 0.88, cullBackface: true },
  ];

  const edges: [number, number][] = [
    [0, 1], [1, 2], [2, 3], [3, 0],
    [4, 5], [5, 6], [6, 7], [7, 4],
    [0, 4], [1, 5], [2, 6], [3, 7],
    // 遮陽棚
    [8, 9], [9, 10], [10, 11], [11, 8],
    // 招牌
    [12, 13], [13, 14], [14, 15], [15, 12],
    // 櫥窗
    [16, 17], [17, 18], [18, 19], [19, 16],
    // 門
    [20, 21], [21, 22], [22, 23], [23, 20]
  ];

  return {
    localVertices,
    faces,
    edges,
    guidelineVertices: [0, 1, 2, 3, 10, 11]
  };
}

/**
 * 7. 公園木質長椅幾何模型 (雙側鍛鐵椅腳、人體工學木條椅面、後傾木條靠背、兩側扶手)
 */
export function createBenchGeometry(width: number, height: number, depth: number): GeometryModel {
  const hw = width / 2;
  const h = height;
  const d = Math.max(15, depth);

  const seatH = h * 0.45;     // 椅面高度
  const seatD = d * 0.75;     // 椅面深度
  const backTopH = h * 0.95;  // 靠背頂部高度

  const localVertices: Point3D[] = [
    // 0~3: 椅面 (木質長板)
    { x: -hw, y: -seatH, z: 0 },          // 0: 前左
    { x: hw, y: -seatH, z: 0 },           // 1: 前右
    { x: hw, y: -seatH, z: seatD },       // 2: 後右
    { x: -hw, y: -seatH, z: seatD },      // 3: 後左

    // 4~7: 傾斜靠背板 (從 seatD 往後微傾至 d)
    { x: -hw, y: -seatH * 1.05, z: seatD }, // 4: 靠背底左
    { x: hw, y: -seatH * 1.05, z: seatD },  // 5: 靠背底右
    { x: hw, y: -backTopH, z: d },          // 6: 靠背頂右
    { x: -hw, y: -backTopH, z: d },         // 7: 靠背頂左

    // 8~10: 左側鐵製椅腳 (落地 Z = 0 到 seatD)
    { x: -hw * 0.88, y: 0, z: 0 },        // 8: 左前腳底
    { x: -hw * 0.88, y: 0, z: seatD },    // 9: 左後腳底
    { x: -hw * 0.88, y: -seatH * 1.35, z: seatD * 0.4 }, // 10: 左扶手高點

    // 11~13: 右側鐵製椅腳
    { x: hw * 0.88, y: 0, z: 0 },         // 11: 右前腳底
    { x: hw * 0.88, y: 0, z: seatD },     // 12: 右後腳底
    { x: hw * 0.88, y: -seatH * 1.35, z: seatD * 0.4 },  // 13: 右扶手高點
  ];

  const faces = [
    // 椅面頂部
    { id: 'bench-seat-top', name: '實木椅面', vertexIndices: [3, 2, 1, 0], shadeFactor: 1.25, cullBackface: true },
    // 靠背板正面
    { id: 'bench-backrest', name: '人體工學椅背', vertexIndices: [7, 6, 5, 4], shadeFactor: 1.1, cullBackface: false },
    // 靠背板背面
    { id: 'bench-backrest-rear', name: '椅背後側', vertexIndices: [6, 7, 4, 5], shadeFactor: 0.8, cullBackface: true },
  ];

  const edges: [number, number][] = [
    // 椅面外框
    [0, 1], [1, 2], [2, 3], [3, 0],
    // 靠背外框
    [4, 5], [5, 6], [6, 7], [7, 4],
    // 左腳架與左扶手
    [8, 0], [9, 3], [8, 9], [0, 10], [10, 3],
    // 右腳架與右扶手
    [11, 1], [12, 2], [11, 12], [1, 13], [13, 2]
  ];

  return {
    localVertices,
    faces,
    edges,
    guidelineVertices: [8, 11, 0, 1, 6, 7]
  };
}

/**
 * 8. 街頭消防栓幾何模型 (圓形凸緣底座、多邊形主柱體、左右兩側出水口、正面加壓口、頂端六角帽)
 */
export function createHydrantGeometry(width: number, height: number, depth: number): GeometryModel {
  const hw = width / 2;
  const h = height;
  const d = Math.max(15, depth);

  const baseH = h * 0.12;     // 底座法蘭高度
  const nozzleH = h * 0.52;   // 兩側出水口高度
  const bodyTopH = h * 0.82;  // 主柱頂端
  const capH = h * 0.98;      // 頂帽高度

  const bw = hw * 0.72;       // 柱身半寬

  const localVertices: Point3D[] = [
    // 0~3: 底座法蘭前臉 (Z = 0)
    { x: -hw, y: 0, z: 0 },          // 0
    { x: hw, y: 0, z: 0 },           // 1
    { x: hw, y: -baseH, z: 0 },      // 2
    { x: -hw, y: -baseH, z: 0 },     // 3
    // 4~7: 底座法蘭後臉 (Z = d)
    { x: -hw, y: 0, z: d },          // 4
    { x: hw, y: 0, z: d },           // 5
    { x: hw, y: -baseH, z: d },      // 6
    { x: -hw, y: -baseH, z: d },     // 7

    // 8~11: 主身前臉 (Z = d * 0.15)
    { x: -bw, y: -baseH, z: d * 0.15 },    // 8
    { x: bw, y: -baseH, z: d * 0.15 },     // 9
    { x: bw, y: -bodyTopH, z: d * 0.15 },  // 10
    { x: -bw, y: -bodyTopH, z: d * 0.15 }, // 11
    // 12~15: 主身後臉 (Z = d * 0.85)
    { x: -bw, y: -baseH, z: d * 0.85 },
    { x: bw, y: -baseH, z: d * 0.85 },
    { x: bw, y: -bodyTopH, z: d * 0.85 },
    { x: -bw, y: -bodyTopH, z: d * 0.85 },

    // 16: 左側出水閥接頭
    { x: -hw * 1.15, y: -nozzleH, z: d * 0.5 }, // 16: 左閥蓋
    // 17: 右側出水閥接頭
    { x: hw * 1.15, y: -nozzleH, z: d * 0.5 },  // 17: 右閥蓋

    // 18: 正面大口徑加壓接頭 (突出前方)
    { x: 0, y: -nozzleH, z: -d * 0.2 },

    // 19: 圓拱頂端六角開關帽
    { x: 0, y: -capH, z: d * 0.5 }
  ];

  const faces = [
    // 底座
    { id: 'hyd-base-front', name: '底座法蘭正面', vertexIndices: [3, 2, 1, 0], shadeFactor: 0.9, cullBackface: false },
    { id: 'hyd-base-top', name: '底座法蘭頂面', vertexIndices: [7, 6, 2, 3], shadeFactor: 1.2, cullBackface: true },
    // 主體
    { id: 'hyd-body-front', name: '消防栓紅色筒身', vertexIndices: [11, 10, 9, 8], shadeFactor: 1.05, cullBackface: false },
    { id: 'hyd-body-top', name: '頂蓋拱面', vertexIndices: [15, 14, 10, 11], shadeFactor: 1.25, cullBackface: true },
    { id: 'hyd-body-right', name: '筒身右側', vertexIndices: [10, 14, 13, 9], shadeFactor: 0.82, cullBackface: true },
    { id: 'hyd-body-left', name: '筒身左側', vertexIndices: [15, 11, 8, 12], shadeFactor: 0.88, cullBackface: true },
    // 頂端六角螺母面
    { id: 'hyd-cap-front', name: '開關閥頂帽', vertexIndices: [19, 10, 11], shadeFactor: 1.35, cullBackface: false },
  ];

  const edges: [number, number][] = [
    [0, 1], [1, 2], [2, 3], [3, 0],
    [4, 5], [5, 6], [6, 7], [7, 4],
    [0, 4], [1, 5], [2, 6], [3, 7],
    [8, 9], [9, 10], [10, 11], [11, 8],
    [10, 14], [11, 15], [14, 15],
    // 出水口突出線
    [11, 16], [8, 16],
    [10, 17], [9, 17],
    // 頂帽
    [11, 19], [10, 19], [14, 19], [15, 19]
  ];

  return {
    localVertices,
    faces,
    edges,
    guidelineVertices: [0, 1, 19]
  };
}

/**
 * 9. 散步小狗幾何模型 (四肢站立腿、健康圓潤身軀、自信昂首犬頭、立體雙耳、上翹尾巴)
 */
export function createDogGeometry(width: number, height: number, depth: number): GeometryModel {
  const hw = width / 2;
  const h = height;
  const d = Math.max(20, depth);

  const legH = h * 0.38;      // 四肢長度
  const bodyH = h * 0.72;     // 身體背部高度
  const headH = h * 0.95;     // 頭部高度
  const earH = h;             // 耳尖最高

  const localVertices: Point3D[] = [
    // 0~3: 四隻腳落地點 (Z = d*0.2 ~ d*0.8)
    { x: -hw * 0.65, y: 0, z: d * 0.2 },  // 0: 前左腳底
    { x: hw * 0.65, y: 0, z: d * 0.2 },   // 1: 前右腳底
    { x: hw * 0.65, y: 0, z: d * 0.8 },   // 2: 後右腳底
    { x: -hw * 0.65, y: 0, z: d * 0.8 },  // 3: 後左腳底

    // 4~7: 軀幹胸腹底面 (Y = -legH)
    { x: -hw * 0.75, y: -legH, z: d * 0.15 }, // 4: 胸口底左
    { x: hw * 0.75, y: -legH, z: d * 0.15 },  // 5: 胸口底右
    { x: hw * 0.7, y: -legH, z: d * 0.85 },   // 6: 臀部底右
    { x: -hw * 0.7, y: -legH, z: d * 0.85 },  // 7: 臀部底左

    // 8~11: 軀幹背部面 (Y = -bodyH)
    { x: -hw * 0.7, y: -bodyH, z: d * 0.25 }, // 8: 肩背左
    { x: hw * 0.7, y: -bodyH, z: d * 0.25 },  // 9: 肩背右
    { x: hw * 0.65, y: -bodyH * 0.95, z: d * 0.82 }, // 10: 臀背右
    { x: -hw * 0.65, y: -bodyH * 0.95, z: d * 0.82 },// 11: 臀背左

    // 12~15: 昂首頭部 (前方 Z = 0 ~ d*0.25)
    { x: -hw * 0.45, y: -headH * 0.75, z: 0 },       // 12: 口鼻尖左
    { x: hw * 0.45, y: -headH * 0.75, z: 0 },        // 13: 口鼻尖右
    { x: hw * 0.55, y: -headH, z: d * 0.15 },        // 14: 額頭右
    { x: -hw * 0.55, y: -headH, z: d * 0.15 },       // 15: 額頭左

    // 16~17: 可愛立耳尖端
    { x: -hw * 0.65, y: -earH, z: d * 0.2 },         // 16: 左耳尖
    { x: hw * 0.65, y: -earH, z: d * 0.2 },          // 17: 右耳尖

    // 18: 上翹開心搖動的尾巴 (後方)
    { x: 0, y: -bodyH * 1.35, z: d * 0.98 }          // 18: 尾巴翹尖
  ];

  const faces = [
    // 胸口正面
    { id: 'dog-chest', name: '小狗胸膛', vertexIndices: [8, 9, 5, 4], shadeFactor: 1.05, cullBackface: false },
    // 口鼻正面
    { id: 'dog-snout', name: '可愛口鼻', vertexIndices: [15, 14, 13, 12], shadeFactor: 1.15, cullBackface: false },
    // 背部頂面
    { id: 'dog-back', name: '背部', vertexIndices: [11, 10, 9, 8], shadeFactor: 1.25, cullBackface: true },
    // 右側身體
    { id: 'dog-side-right', name: '右側身軀', vertexIndices: [9, 10, 6, 5], shadeFactor: 0.82, cullBackface: true },
    // 左側身體
    { id: 'dog-side-left', name: '左側身軀', vertexIndices: [11, 8, 4, 7], shadeFactor: 0.88, cullBackface: true },
    // 耳朵
    { id: 'dog-ear-left', name: '左耳', vertexIndices: [16, 15, 8], shadeFactor: 1.2, cullBackface: false },
    { id: 'dog-ear-right', name: '右耳', vertexIndices: [17, 9, 14], shadeFactor: 1.15, cullBackface: false },
  ];

  const edges: [number, number][] = [
    // 四腿
    [0, 4], [1, 5], [2, 6], [3, 7],
    // 身體輪廓
    [4, 5], [5, 6], [6, 7], [7, 4],
    [8, 9], [9, 10], [10, 11], [11, 8],
    [4, 8], [5, 9], [6, 10], [7, 11],
    // 頭部與口鼻
    [12, 13], [13, 14], [14, 15], [15, 12],
    [15, 8], [14, 9],
    // 雙耳
    [15, 16], [8, 16],
    [14, 17], [9, 17],
    // 上揚尾巴
    [10, 18], [11, 18]
  ];

  return {
    localVertices,
    faces,
    edges,
    guidelineVertices: [0, 1, 12, 13, 18]
  };
}

/**
 * 10. 街道小貓幾何模型 (靈動流線貓身、俏皮三角立耳、敏捷四肢、優雅 S 型長尾巴)
 */
export function createCatGeometry(width: number, height: number, depth: number): GeometryModel {
  const hw = width / 2;
  const h = height;
  const d = Math.max(18, depth);

  const legH = h * 0.32;      // 貓掌腿部高度
  const archBackH = h * 0.72; // 拱背高度
  const headH = h * 0.88;     // 圓圓貓頭
  const earH = h;             // 尖尖貓耳

  const localVertices: Point3D[] = [
    // 0~3: 四爪落地點
    { x: -hw * 0.6, y: 0, z: d * 0.18 },  // 0: 前左爪
    { x: hw * 0.6, y: 0, z: d * 0.18 },   // 1: 前右爪
    { x: hw * 0.6, y: 0, z: d * 0.8 },    // 2: 後右爪
    { x: -hw * 0.6, y: 0, z: d * 0.8 },   // 3: 後左爪

    // 4~7: 腹部底面
    { x: -hw * 0.7, y: -legH, z: d * 0.15 }, // 4: 胸前底
    { x: hw * 0.7, y: -legH, z: d * 0.15 },  // 5: 胸前底右
    { x: hw * 0.65, y: -legH, z: d * 0.82 }, // 6: 腹底後右
    { x: -hw * 0.65, y: -legH, z: d * 0.82 },// 7: 腹底後左

    // 8~11: 流線拱背 (最高點在中央)
    { x: -hw * 0.65, y: -archBackH * 0.88, z: d * 0.22 }, // 8: 頸背左
    { x: hw * 0.65, y: -archBackH * 0.88, z: d * 0.22 },  // 9: 頸背右
    { x: hw * 0.6, y: -archBackH, z: d * 0.8 },          // 10: 拱背後右
    { x: -hw * 0.6, y: -archBackH, z: d * 0.8 },         // 11: 拱背後左

    // 12~14: 貓臉面 (前方 Z = 0 ~ d*0.18)
    { x: 0, y: -headH * 0.55, z: 0 },                    // 12: 貓鼻嘴尖
    { x: hw * 0.55, y: -headH * 0.85, z: d * 0.1 },      // 13: 貓右臉額
    { x: -hw * 0.55, y: -headH * 0.85, z: d * 0.1 },     // 14: 貓左臉額

    // 15~16: 靈巧三角尖耳
    { x: -hw * 0.68, y: -earH, z: d * 0.15 },            // 15: 左耳尖
    { x: hw * 0.68, y: -earH, z: d * 0.15 },             // 16: 右耳尖

    // 17~18: 優雅長尾巴 (S 型向上翹起)
    { x: 0, y: -archBackH * 1.25, z: d * 0.95 },         // 17: 尾巴中段高點
    { x: hw * 0.25, y: -archBackH * 1.45, z: d * 0.88 }, // 18: 尾尖捲曲
  ];

  const faces = [
    // 貓臉正面 (三角形立體萌臉)
    { id: 'cat-face', name: '小貓臉龐', vertexIndices: [14, 13, 12], shadeFactor: 1.15, cullBackface: false },
    // 胸前
    { id: 'cat-chest', name: '毛茸茸胸膛', vertexIndices: [8, 9, 5, 4], shadeFactor: 1.05, cullBackface: false },
    // 拱背頂部
    { id: 'cat-back', name: '流線貓背', vertexIndices: [11, 10, 9, 8], shadeFactor: 1.25, cullBackface: true },
    // 右側身體
    { id: 'cat-side-right', name: '右側身軀', vertexIndices: [9, 10, 6, 5], shadeFactor: 0.82, cullBackface: true },
    // 左側身體
    { id: 'cat-side-left', name: '左側身軀', vertexIndices: [11, 8, 4, 7], shadeFactor: 0.88, cullBackface: true },
    // 三角立耳
    { id: 'cat-ear-left', name: '左貓耳', vertexIndices: [15, 14, 8], shadeFactor: 1.25, cullBackface: false },
    { id: 'cat-ear-right', name: '右貓耳', vertexIndices: [16, 9, 13], shadeFactor: 1.2, cullBackface: false },
  ];

  const edges: [number, number][] = [
    // 四腿
    [0, 4], [1, 5], [2, 6], [3, 7],
    // 軀幹
    [4, 5], [5, 6], [6, 7], [7, 4],
    [8, 9], [9, 10], [10, 11], [11, 8],
    [4, 8], [5, 9], [6, 10], [7, 11],
    // 臉與頭
    [12, 13], [13, 14], [14, 12],
    [14, 8], [13, 9],
    // 雙耳
    [14, 15], [8, 15],
    [13, 16], [9, 16],
    // 尾巴
    [10, 17], [11, 17], [17, 18]
  ];

  return {
    localVertices,
    faces,
    edges,
    guidelineVertices: [0, 1, 12, 18]
  };
}

/**
 * 依據幾何類別取得或建立幾何模型
 * 核心規則：永遠依據物件當前的物理尺寸 (width, height, depth) 即時動態生成 3D 頂點
 */
export function getGeometryModel(object: SceneObject): GeometryModel {
  const { width, height, depth } = object.dimensions;

  switch (object.geometryType) {
    case 'cube':
    case 'cuboid':
      return createCuboidGeometry(width, height, depth);
    case 'prism':
    case 'cylinder':
      return createPrismGeometry(width / 2, height, depth);
    case 'desk':
      return createDeskGeometry(width, height, depth);
    case 'chair':
      return createChairGeometry(width, height, depth);
    case 'cabinet':
      return createCuboidGeometry(width, height, depth);
    case 'window':
      return createWindowGeometry(width, height, depth);
    case 'house':
      return createHouseGeometry(width, height, depth);
    case 'road':
      return createRoadGeometry(width, height, depth);
    case 'tree':
      return createTreeGeometry(width, height, depth);
    case 'person':
      return createPersonGeometry(width, height, depth);
    case 'car':
      return createCarGeometry(width, height, depth);
    case 'bus':
      return createBusGeometry(width, height, depth);
    case 'truck':
      return createTruckGeometry(width, height, depth);
    case 'streetlight':
      return createStreetlightGeometry(width, height, depth);
    case 'skyscraper':
      return createSkyscraperGeometry(width, height, depth);
    case 'store':
      return createStoreGeometry(width, height, depth);
    case 'bench':
      return createBenchGeometry(width, height, depth);
    case 'hydrant':
      return createHydrantGeometry(width, height, depth);
    case 'dog':
      return createDogGeometry(width, height, depth);
    case 'cat':
      return createCatGeometry(width, height, depth);
    default:
      return createCuboidGeometry(width, height, depth);
  }
}

/**
 * 依據 SceneObject 與 PerspectiveCamera 計算投影後的物件
 */
export function projectSceneObject(
  object: SceneObject,
  camera: PerspectiveCamera,
  isSelected: boolean
): ProjectedObject {
  const model = getGeometryModel(object);

  // 將區域 3D 座標轉為世界 3D 座標
  // 考慮物體的 (x, y) 基準位置與深度 z
  const worldVertices: Point3D[] = model.localVertices.map(local => ({
    x: object.x + local.x,
    y: object.y + local.y,
    z: object.z + local.z
  }));

  // 投影所有頂點至畫面
  const projectedVertices = projectVertices(worldVertices, camera);

  // 計算投影面的可見性與色彩
  const faces: ProjectedFace[] = model.faces.map(face => {
    const visible = isFaceVisible(face, projectedVertices, camera);
    const facePoints = face.vertexIndices.map(idx => ({
      x: projectedVertices[idx].x,
      y: projectedVertices[idx].y
    }));

    // 計算面中心深度 (用於面排序或陰影)
    let totalDepth = 0;
    face.vertexIndices.forEach(idx => {
      totalDepth += projectedVertices[idx].depth;
    });
    const centerDepth = totalDepth / (face.vertexIndices.length || 1);

    const shadedColor = adjustColorBrightness(object.color, face.shadeFactor);
    const strokeColor = object.strokeColor || adjustColorBrightness(object.color, 0.6);

    return {
      id: `${object.id}-${face.id}`,
      name: face.name,
      points: facePoints,
      color: shadedColor,
      strokeColor,
      centerDepth,
      isVisible: visible
    };
  });

  // 計算投影邊線
  const edges: ProjectedEdge[] = model.edges.map(([v1, v2]) => {
    const p1 = projectedVertices[v1];
    const p2 = projectedVertices[v2];
    const isDepth = Math.abs(worldVertices[v1].z - worldVertices[v2].z) > 1e-4;

    return {
      start: { x: p1.x, y: p1.y },
      end: { x: p2.x, y: p2.y },
      isDepthEdge: isDepth
    };
  });

  // 產生透視輔助射線
  const guidelineRays = (model.guidelineVertices || [0, 1, 2, 3]).map(idx => {
    const pt = projectedVertices[idx];
    return createGuidelineRay(pt, camera, true);
  });

  // 計算邊界盒子 (Bounding Box) 用於滑鼠選取判定
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  projectedVertices.forEach(p => {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  });

  // 平均深度
  const centerDepth = object.z + object.dimensions.depth / 2;

  return {
    id: object.id,
    name: object.name,
    projectedVertices,
    faces,
    edges,
    guidelineRays,
    centerDepth,
    boundingBox: {
      minX,
      minY,
      maxX,
      maxY,
      width: Math.max(1, maxX - minX),
      height: Math.max(1, maxY - minY)
    },
    isSelected
  };
}
