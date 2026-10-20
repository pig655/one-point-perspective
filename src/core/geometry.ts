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
 * 道路幾何模型 (向遠處延伸之雙線道地面)
 */
export function createRoadGeometry(width: number, _height: number, depth: number): GeometryModel {
  const hw = width / 2;
  const d = Math.max(300, depth);

  const localVertices = [
    // 前方路面 (Z=0, Y=0)
    { x: -hw, y: 0, z: 0 },  // 0: 前左路緣
    { x: hw, y: 0, z: 0 },   // 1: 前右路緣
    // 後方路面 (Z=d, Y=0)
    { x: hw, y: 0, z: d },   // 2: 後右路緣
    { x: -hw, y: 0, z: d },  // 3: 後左路緣

    // 中央分隔虛線 4 個頂點 (前、後)
    { x: -hw * 0.04, y: -0.5, z: 0 },
    { x: hw * 0.04, y: -0.5, z: 0 },
    { x: hw * 0.04, y: -0.5, z: d },
    { x: -hw * 0.04, y: -0.5, z: d },
  ];

  const faces = [
    {
      id: 'road-surface',
      name: '柏油路面',
      vertexIndices: [3, 2, 1, 0],
      shadeFactor: 0.95,
      cullBackface: false
    },
    {
      id: 'road-stripe',
      name: '中央分道線',
      vertexIndices: [7, 6, 5, 4],
      shadeFactor: 1.3,
      cullBackface: false
    }
  ];

  const edges: [number, number][] = [
    [0, 1], [1, 2], [2, 3], [3, 0],
    [4, 7], [5, 6]
  ];

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
