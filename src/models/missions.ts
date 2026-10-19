/**
 * 教學任務定義與真實狀態檢查器 (Missions & Real-State Validators)
 */

import { Mission, SceneState } from './types';
import { projectSceneObject } from '../core/geometry';

export const TEACHING_MISSIONS: Mission[] = [
  {
    id: 'mission-1',
    number: 1,
    title: '任務一：認識透視點與視平線',
    description: '在單點透視中，「視平線」代表觀察者的眼睛高度，「透視點」則是我們凝視遠方的視線焦點。',
    conceptToLearn: '透視點只能沿著視平線左右移動，移動透視點會改變所有朝深處延伸的邊線角度。',
    steps: [
      {
        id: 'step-1-1',
        title: '移動視平線上的透視點',
        targetDescription: '用滑鼠或手指按住視平線中央的黃色「透視點 (VP)」，向左或向右拖曳至少 70 像素。',
        hint: '找到畫面中間橫向紅線上的發光圓點，左右拖曳它！',
        expectedGoal: '透視點偏離正中央 (X 座標離 500 差距大於 70)',
        isCompleted: false,
        validator: (scene: SceneState) => {
          return Math.abs(scene.camera.vpX - 500) >= 70;
        }
      }
    ],
    successMessage: '太棒了！你發現了嗎？當你移動透視點時，所有物件兩側向後延伸的邊線，都同步自動轉向新的透視點！'
  },
  {
    id: 'mission-2',
    number: 2,
    title: '任務二：揭開透視輔助線的秘密',
    description: '畫家是如何畫出逼真的立體感的呢？他們會從物體的各個角落下筆，畫出連向透視點的「透視輔助線」。',
    conceptToLearn: '所有物體向深處延伸的邊線，延長後都會匯集在同一個透視點上。',
    steps: [
      {
        id: 'step-2-1',
        title: '開啟畫面或物件的透視輔助線',
        targetDescription: '在上方工具列點擊「透視輔助線」開關，或者選取一個方塊並在右側面板開啟「顯示透視線」。',
        hint: '在上方找找看「透視輔助線」按鈕並開啟它！',
        expectedGoal: '場景已啟動透視線輔助顯示，且場景中至少有一個幾何方塊',
        isCompleted: false,
        validator: (scene: SceneState) => {
          const hasLines = scene.viewSettings.showPerspectiveLines || scene.objects.some(o => o.showGuidelines);
          const hasCube = scene.objects.some(o => o.category === 'geometric' || o.geometryType === 'cube');
          return hasLines && hasCube;
        }
      }
    ],
    successMessage: '看見那些虛線射線了嗎！這就是單點透視最核心的原理：所有向後延伸的射線，全部直直射向同一個透視點！'
  },
  {
    id: 'mission-3',
    number: 3,
    title: '任務三：比較「近大遠小」的視覺規律',
    description: '在真實世界中，兩個一樣大的物體，距離我們較遠的看起來會比較小。我們來動手驗證這件事！',
    conceptToLearn: '「改變物體實際尺寸」與「將物體推向遠處」是完全不同的操作。物體深度越大，在畫面上的投影尺寸越小。',
    steps: [
      {
        id: 'step-3-1',
        title: '將兩個相同尺寸的方塊置於不同深度',
        targetDescription: '保留或新增兩個尺寸相同（長寬深相同）的方塊，將其中一個的「深度 Z」拉大（深度差距至少 180）。',
        hint: '選取其中一個方塊，拖曳右側控制面板的「深度 (Z)」滑桿，把它推到更遠的深處！',
        expectedGoal: '兩個方塊實際尺寸相同 (寬度誤差 < 5)，但深度差距 >= 180，且遠處投影寬度確實小於近處',
        isCompleted: false,
        validator: (scene: SceneState) => {
          const cubes = scene.objects.filter(o => o.category === 'geometric' || o.geometryType === 'cube' || o.geometryType === 'cuboid');
          if (cubes.length < 2) return false;

          for (let i = 0; i < cubes.length; i++) {
            for (let j = i + 1; j < cubes.length; j++) {
              const c1 = cubes[i];
              const c2 = cubes[j];

              // 實際物理尺寸相同 (允許微小誤差 5px)
              const sameW = Math.abs(c1.dimensions.width - c2.dimensions.width) <= 8;
              const sameH = Math.abs(c1.dimensions.height - c2.dimensions.height) <= 8;
              const sameD = Math.abs(c1.dimensions.depth - c2.dimensions.depth) <= 8;

              // 深度差異顯著 (>= 180)
              const depthDiff = Math.abs(c1.z - c2.z);

              if (sameW && sameH && sameD && depthDiff >= 180) {
                // 檢查投影後畫面上的實際寬度
                const proj1 = projectSceneObject(c1, scene.camera, false);
                const proj2 = projectSceneObject(c2, scene.camera, false);

                // 深度較大者，投影寬度必須更小
                const [nearProj, farProj] = c1.z < c2.z ? [proj1, proj2] : [proj2, proj1];
                if (farProj.boundingBox.width < nearProj.boundingBox.width * 0.85) {
                  return true;
                }
              }
            }
          }
          return false;
        }
      }
    ],
    successMessage: '太精彩了！你看，這兩個方塊的「實際尺寸」完全一模一樣，但因為擺放的深淺不同，畫面上的視覺大小自然呈現近大遠小！'
  },
  {
    id: 'mission-4',
    number: 4,
    title: '任務四：排出一列縱深隊列',
    description: '排隊走廊或是馬路兩旁的行道樹，總是給人很強的立體縱深感。我們來用方塊排成一列由近到遠的隊伍！',
    conceptToLearn: '深度有規律漸進的物體排列，能夠引導觀眾的視線順著透視線望向深處，營造強大的空間感。',
    steps: [
      {
        id: 'step-4-1',
        title: '排列至少 3 個方塊由近至遠 (深度漸增)',
        targetDescription: '在畫面中放置至少 3 個方塊，分別調整它們的深度 Z，使其呈現近、中、遠依序排列（相鄰深度差至少 100）。',
        hint: '可以點擊方塊後按「複製」，然後將新方塊的深度 Z 調得更遠，依序擺放 3 個方塊！',
        expectedGoal: '至少 3 個幾何方塊，按深度排序後，相鄰深度差距均 >= 100',
        isCompleted: false,
        validator: (scene: SceneState) => {
          const cubes = scene.objects.filter(o => o.category === 'geometric');
          if (cubes.length < 3) return false;

          // 依深度 Z 由小到大排序
          const sorted = [...cubes].sort((a, b) => a.z - b.z);
          let qualifiedChain = 1;

          for (let i = 0; i < sorted.length - 1; i++) {
            if (sorted[i + 1].z - sorted[i].z >= 90) {
              qualifiedChain++;
              if (qualifiedChain >= 3) return true;
            } else {
              qualifiedChain = 1;
            }
          }
          return qualifiedChain >= 3;
        }
      }
    ],
    successMessage: '太壯觀了！這排整齊向後延伸的方塊，完美展現了空間的深度與立體縱深！'
  },
  {
    id: 'mission-5',
    number: 5,
    title: '任務五：佈置透視夢想教室',
    description: '現在你已經是一位透視小大師了！讓我們把學到的透視知識化為實踐，佈置一間溫馨有趣的立體教室吧！',
    conceptToLearn: '將課桌、椅子、置物櫃與窗戶放在不同的深度與空間位置，共同匯集於同一個透視焦點。',
    steps: [
      {
        id: 'step-5-1',
        title: '放置課桌、椅子與置物櫃/窗戶',
        targetDescription: '從左側素材庫中新增至少一張「課桌」、一張「椅子」，以及至少一件生活物件（置物櫃、窗戶或房屋）。',
        hint: '在左邊素材庫點擊「生活物件」分類，點選課桌、椅子和置物櫃加入畫布！',
        expectedGoal: '場景中同時包含課桌 (desk)、椅子 (chair) 與置物櫃/窗戶/房屋 (至少 3 件生活家具)',
        isCompleted: false,
        validator: (scene: SceneState) => {
          const hasDesk = scene.objects.some(o => o.geometryType === 'desk');
          const hasChair = scene.objects.some(o => o.geometryType === 'chair');
          const hasOther = scene.objects.some(o => ['cabinet', 'window', 'house', 'road'].includes(o.geometryType));
          const furnitureCount = scene.objects.filter(o => o.category === 'furniture').length;

          return hasDesk && hasChair && hasOther && furnitureCount >= 3;
        }
      }
    ],
    successMessage: '恭喜你完成全套單點透視挑戰！你已經完全學會了單點透視的視覺魔法，快把你的教室作品匯出成圖片分享給同學吧！'
  }
];
