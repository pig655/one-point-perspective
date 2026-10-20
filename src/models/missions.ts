/**
 * 教學任務定義與真實狀態檢查器 (Missions & Real-State Validators)
 * 包含：室內空間透視 8 大循序任務 與 基礎透視 5 大任務
 */

import { Mission, SceneState } from './types';
import { projectSceneObject } from '../core/geometry';
import { DEFAULT_ROOM_COLORS } from '../core/roomGeometry';

export const ROOM_MISSIONS: Mission[] = [
  {
    id: 'room-mission-1',
    number: 1,
    mode: 'room',
    title: '任務一：找出房間的透視點',
    description: '在整個室內房間中，所有向後延伸的角落線條，全部匯集在視平線上的「透視點 (VP)」。',
    conceptToLearn: '透視點代表觀察者正前方的視線中心，它固定在視平線上。',
    steps: [
      {
        id: 'r-step-1',
        title: '沿視平線拖曳透視點',
        targetDescription: '用滑鼠或手指按住黃色透視點，向左或向右移動至少 60 像素。',
        hint: '在後牆上找到發光的黃色圓點，向左或向右拉動看看！',
        expectedGoal: '透視點偏離中央 (X 離 500 差距 >= 60)',
        isCompleted: false,
        validator: (scene: SceneState) => Math.abs(scene.camera.vpX - 500) >= 60
      }
    ],
    successMessage: '太棒了！你找到了透視點！發現了嗎？後牆跟著你的視線焦點一起移動了！'
  },
  {
    id: 'room-mission-2',
    number: 2,
    mode: 'room',
    title: '任務二：移動透視點，觀察牆面與地板變化',
    description: '當你站在房間不同位置或往不同方向看時，左右兩側牆面的可見範圍會發生戲劇性變化。',
    conceptToLearn: '透視點往右移時，左牆露出的可見面積會變大；透視點往左移時，右牆可見面積變大。',
    steps: [
      {
        id: 'r-step-2',
        title: '將透視點大幅移至左側或右側',
        targetDescription: '將透視點移動到左側 (< 400) 或右側 (> 600)。',
        hint: '大幅度往左或往右拖曳透視點，觀察左右兩面牆壁寬度的消長！',
        expectedGoal: '透視點 X 座標小於 400 或大於 600',
        isCompleted: false,
        validator: (scene: SceneState) => scene.camera.vpX <= 400 || scene.camera.vpX >= 600
      }
    ],
    successMessage: '觀察得真敏銳！當視線偏向某一側，對面的牆壁就展現得更加寬廣清晰！'
  },
  {
    id: 'room-mission-3',
    number: 3,
    mode: 'room',
    title: '任務三：顯示地板透視線，尋找匯聚線條',
    description: '經典單點透視室內畫作中，地板的地磚線總是直直朝向透視點收斂。',
    conceptToLearn: '地面上相互平行的地磚線，在視覺上必然朝著同一透視點收斂。',
    steps: [
      {
        id: 'r-step-3',
        title: '開啟地板透視線開關',
        targetDescription: '在上方工具列開啟「地板線」圖層，觀察縱向地磚線與橫向等深線。',
        hint: '在上方尋找「地板線」按鈕並點擊開啟！',
        expectedGoal: '場景已啟動地板透視線顯示',
        isCompleted: false,
        validator: (scene: SceneState) => scene.viewSettings.showFloorLines === true
      }
    ],
    successMessage: '太清晰了！看著那些橘色地板線條，像箭頭一樣直奔後牆的透視點！'
  },
  {
    id: 'room-mission-4',
    number: 4,
    mode: 'room',
    title: '任務四：在後牆加入一幅掛畫',
    description: '後牆正面對著觀察者，因此後牆上的畫作邊框依然保持水平與垂直。',
    conceptToLearn: '在單點透視中，與畫面平行的正面表面（如後牆），其水平與垂直線條不發生角度傾斜。',
    steps: [
      {
        id: 'r-step-4',
        title: '在後牆添加橫向藝術掛畫',
        targetDescription: '從左側素材庫點擊「橫向風景掛畫」，將其加入並放置在後牆 (back)。',
        hint: '在素材庫點選橫向風景掛畫，並確認右側面板設定為「後牆」！',
        expectedGoal: '場景包含錨定在後牆的掛畫',
        isCompleted: false,
        validator: (scene: SceneState) => {
          return scene.objects.some(
            o => o.wallAnchor?.wall === 'back' && (o.geometryType === 'landscape-painting' || o.category === 'wall')
          );
        }
      }
    ],
    successMessage: '美麗的風景畫掛上後牆了！而且它的上下邊緣水平、左右邊緣垂直，非常工整！'
  },
  {
    id: 'room-mission-5',
    number: 5,
    mode: 'room',
    title: '任務五：在左牆加入一扇門',
    description: '側邊牆面上的門，頂部邊線會順著牆面往深處收斂。',
    conceptToLearn: '側牆上物件的上下橫線，延長後同樣會收斂至視平線上的透視點！',
    steps: [
      {
        id: 'r-step-5',
        title: '在左牆添加實木門',
        targetDescription: '從左側素材庫選取「室內實木門」，將其擺放在左側牆面 (left)。',
        hint: '點擊素材庫的「室內實木門」，確認它錨定在左牆！',
        expectedGoal: '場景包含錨定在左牆的門',
        isCompleted: false,
        validator: (scene: SceneState) => {
          return scene.objects.some(
            o => o.wallAnchor?.wall === 'left' && o.geometryType === 'room-door'
          );
        }
      }
    ],
    successMessage: '做得好！仔細看這扇門的頂部邊線，是不是順著左牆向透視點傾斜呢？這就是透視的精髓！'
  },
  {
    id: 'room-mission-6',
    number: 6,
    mode: 'room',
    title: '任務六：在右牆加入一幅直向掛畫',
    description: '在右邊牆面也裝飾一幅高雅的畫作，讓兩側牆面互相呼應。',
    conceptToLearn: '左右兩邊牆面各自朝同一個透視焦點延伸。',
    steps: [
      {
        id: 'r-step-6',
        title: '在右牆添加直向藝術掛畫',
        targetDescription: '從素材庫點選「直向藝術掛畫」，將其錨定在右側牆面 (right)。',
        hint: '在素材庫點選直向藝術掛畫，並確認右側面板設定在右牆！',
        expectedGoal: '場景包含錨定在右牆的掛畫',
        isCompleted: false,
        validator: (scene: SceneState) => {
          return scene.objects.some(
            o => o.wallAnchor?.wall === 'right' && (o.geometryType === 'portrait-painting' || o.category === 'wall')
          );
        }
      }
    ],
    successMessage: '太漂亮了！右牆的掛畫上下邊線，也精準地朝透視點收斂！'
  },
  {
    id: 'room-mission-7',
    number: 7,
    mode: 'room',
    title: '任務七：在房間中加入家具或植物',
    description: '立體家具（如書桌、椅子、床鋪或綠植）擺放在地板上，讓房間瞬間充滿生活氣息！',
    conceptToLearn: '地板上的立體家具依深度 Z 縮放，越靠近後牆看起來越小，牢牢接觸地板不懸空。',
    steps: [
      {
        id: 'r-step-7',
        title: '新增書桌、椅子、沙發或盆栽',
        targetDescription: '從素材庫的「室內家具」或「角色自然」加入至少一件立體家具或植物。',
        hint: '點擊書桌、椅子、床、沙發或綠意盆栽，把它擺在地板上！',
        expectedGoal: '場景包含至少一件地板立體物件 (furniture / nature)',
        isCompleted: false,
        validator: (scene: SceneState) => {
          return scene.objects.some(
            o => !o.wallAnchor && (o.category === 'furniture' || o.category === 'nature' || o.category === 'geometric')
          );
        }
      }
    ],
    successMessage: '房間越來越豐富了！家具在透視空間中穩穩地立在地板上！'
  },
  {
    id: 'room-mission-8',
    number: 8,
    mode: 'room',
    title: '任務八：完成房間著色與風格變身',
    description: '最後一步！為你的房間挑選溫暖或清爽的牆壁色彩，完成一張令人驚豔的透視畫作！',
    conceptToLearn: '色彩與光影讓單點透視的立體空間感更加生動立體。',
    steps: [
      {
        id: 'r-step-8',
        title: '切換至彩色作品或自訂牆面色彩',
        targetDescription: '在上方工具列切換為「彩色作品」或在右側面板為牆面/地板塗色。',
        hint: '在上方點擊「彩色作品」風格按鈕，或點擊「完成作品」標籤！',
        expectedGoal: '渲染風格為 colored 或地板/牆壁自訂著色',
        isCompleted: false,
        validator: (scene: SceneState) => {
          return (
            scene.viewSettings.renderStyle === 'colored' ||
            scene.roomSubMode === 'color' ||
            scene.roomColors.leftWall !== DEFAULT_ROOM_COLORS.leftWall ||
            scene.roomColors.rightWall !== DEFAULT_ROOM_COLORS.rightWall ||
            scene.roomColors.floor !== DEFAULT_ROOM_COLORS.floor
          );
        }
      }
    ],
    successMessage: '🎉 恭喜你完成全套室內單點透視大挑戰！你已經完全掌握了空間、視平線與透視點的魔法，快將作品匯出保存吧！'
  }
];

export const BASIC_MISSIONS: Mission[] = [
  {
    id: 'basic-mission-1',
    number: 1,
    mode: 'basic',
    title: '任務一：認識透視點與視平線',
    description: '在單點透視中，「視平線」代表觀察者的眼睛高度，「透視點」則是我們凝視遠方的視線焦點。',
    conceptToLearn: '透視點只能沿著視平線左右移動，移動透視點會改變所有朝深處延伸的邊線角度。',
    steps: [
      {
        id: 'b-step-1',
        title: '移動視平線上的透視點',
        targetDescription: '用滑鼠或手指按住視平線中央的黃色「透視點 (VP)」，向左或向右拖曳至少 70 像素。',
        hint: '找到畫面中間橫向紅線上的發光圓點，左右拖曳它！',
        expectedGoal: '透視點偏離正中央 (X 離 500 差距 >= 70)',
        isCompleted: false,
        validator: (scene: SceneState) => Math.abs(scene.camera.vpX - 500) >= 70
      }
    ],
    successMessage: '太棒了！當你移動透視點時，所有物件兩側向後延伸的邊線，都同步自動轉向新的透視點！'
  },
  {
    id: 'basic-mission-2',
    number: 2,
    mode: 'basic',
    title: '任務二：揭開透視輔助線的秘密',
    description: '畫家是如何畫出逼真的立體感的呢？他們會從物體的各個角落下筆，畫出連向透視點的「透視輔助線」。',
    conceptToLearn: '所有物體向深處延伸的邊線，延長後都會匯集在同一個透視點上。',
    steps: [
      {
        id: 'b-step-2',
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
    id: 'basic-mission-3',
    number: 3,
    mode: 'basic',
    title: '任務三：比較「近大遠小」的視覺規律',
    description: '在真實世界中，兩個一樣大的物體，距離我們較遠的看起來會比較小。我們來動手驗證這件事！',
    conceptToLearn: '「改變物體實際尺寸」與「將物體推向遠處」是完全不同的操作。物體深度越大，在畫面上的投影尺寸越小。',
    steps: [
      {
        id: 'b-step-3',
        title: '將兩個相同尺寸的方塊置於不同深度',
        targetDescription: '保留或新增兩個尺寸相同（長寬深相同）的方塊，將其中一個的「深度 Z」拉大（深度差距至少 180）。',
        hint: '選取其中一個方塊，拖曳右側控制面板的「深度 (Z)」滑桿，把它推到更遠的深處！',
        expectedGoal: '兩個方塊實際尺寸相同 (誤差 < 8)，但深度差距 >= 180，且遠處投影寬度確實小於近處',
        isCompleted: false,
        validator: (scene: SceneState) => {
          const cubes = scene.objects.filter(o => o.category === 'geometric');
          if (cubes.length < 2) return false;

          for (let i = 0; i < cubes.length; i++) {
            for (let j = i + 1; j < cubes.length; j++) {
              const c1 = cubes[i];
              const c2 = cubes[j];

              const sameW = Math.abs(c1.dimensions.width - c2.dimensions.width) <= 8;
              const sameH = Math.abs(c1.dimensions.height - c2.dimensions.height) <= 8;
              const sameD = Math.abs(c1.dimensions.depth - c2.dimensions.depth) <= 8;
              const depthDiff = Math.abs(c1.z - c2.z);

              if (sameW && sameH && sameD && depthDiff >= 180) {
                const proj1 = projectSceneObject(c1, scene.camera, false);
                const proj2 = projectSceneObject(c2, scene.camera, false);
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
    id: 'basic-mission-4',
    number: 4,
    mode: 'basic',
    title: '任務四：排出一列縱深隊列',
    description: '排隊走廊或是馬路兩旁的行道樹，總是給人很強的立體縱深感。我們來用方塊排成一列由近到遠的隊伍！',
    conceptToLearn: '深度有規律漸進的物體排列，能夠引導觀眾的視線順著透視線望向深處，營造強大的空間感。',
    steps: [
      {
        id: 'b-step-4',
        title: '排列至少 3 個方塊由近至遠 (深度漸增)',
        targetDescription: '在畫面中放置至少 3 個方塊，分別調整它們的深度 Z，使其呈現近、中、遠依序排列（相鄰深度差至少 90）。',
        hint: '可以點擊方塊後按「複製」，然後將新方塊的深度 Z 調得更遠，依序擺放 3 個方塊！',
        expectedGoal: '至少 3 個幾何方塊，按深度排序後，相鄰深度差距均 >= 90',
        isCompleted: false,
        validator: (scene: SceneState) => {
          const cubes = scene.objects.filter(o => o.category === 'geometric');
          if (cubes.length < 3) return false;
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
    id: 'basic-mission-5',
    number: 5,
    mode: 'basic',
    title: '任務五：佈置透視夢想教室',
    description: '現在你已經是一位透視小大師了！讓我們把學到的透視知識化為實踐，佈置一間溫馨有趣的立體教室吧！',
    conceptToLearn: '將課桌、椅子、置物櫃與窗戶放在不同的深度與空間位置，共同匯集於同一個透視焦點。',
    steps: [
      {
        id: 'b-step-5',
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

export const TEACHING_MISSIONS = [...ROOM_MISSIONS, ...BASIC_MISSIONS];
