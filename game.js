const GAME_VERSION="1.4.0";
const $=id=>document.getElementById(id),R=n=>Math.random()*n,RI=(a,b)=>Math.floor(a+R(b-a+1));
/* ---------- SES ---------- */
const A={c:null,t(f,ty,d,v=.15,dl=0){try{if(!this.c)this.c=new(window.AudioContext||window.webkitAudioContext)();setTimeout(()=>{const o=this.c.createOscillator(),g=this.c.createGain();o.type=ty;o.frequency.value=f;g.gain.setValueAtTime(v,this.c.currentTime);g.gain.exponentialRampToValueAtTime(1e-4,this.c.currentTime+d);o.connect(g);g.connect(this.c.destination);o.start();o.stop(this.c.currentTime+d)},dl)}catch(e){}},
hit(){this.t(130,"sawtooth",.12,.2)},crit(){this.t(420,"triangle",.1,.25);this.t(660,"square",.25,.25,60)},
int(){this.t(880,"sine",.08,.3);this.t(1100,"square",.2,.25,80)},pot(){this.t(330,"sine",.15,.2);this.t(520,"sine",.25,.2,90)},
lvl(){[261,329,392,523,659].forEach((f,i)=>this.t(f,"triangle",.25,.25,i*80))},elite(){[392,523,659,1046].forEach((f,i)=>this.t(f,"square",.35,.25,i*110))}};

/* ---------- VERİ ---------- */
const SL=["weapon","offhand","helm","chest","pants","boots","necklace","ring"],SN={weapon:"Silah",offhand:"Sol El",helm:"Kask",chest:"Zırh",pants:"Pantolon",boots:"Çizme",necklace:"Kolye",ring:"Yüzük"};
const CL={
tank:{n:"Tank",e:"🛡️",h:210,d:"Ağır zırh ustası, darbe soğuran ve sersemleten öncü.",b:{hp:420,mp:90,str:16,agi:8,vit:20,int:5},
 sk:[{n:"Kalkan Darbesi",mp:20,m:1.4,i:1,d:"Ağır darbe hazırlığını bozar, düşmanı sersemletir"},{n:"Kalkan Duvarı",mp:30,m:.6,sh:1,d:"3 tur hasar emen kalkan"},{n:"Meydan Okuma",mp:25,m:1.8,dot:1,d:"Yıkıcı vuruş ve 3 tur iç kanama"},{n:"Yıkılmaz İrade",mp:45,m:2.8,d:"Nihai savunma darbesi"}],
 it:["Ağır Çelik Kılıç","Kule Kalkanı","Demir Miğfer","Ağır Plaka Zırh","Çelik Dizlik","Ağır Demir Çizme","Dayanıklılık Gerdanlığı","Kaya Yüzüğü"]},
mage:{n:"Büyücü",e:"🔮",h:270,d:"Alev ve buzla yıkan arkana ustası.",b:{hp:250,mp:210,str:6,agi:9,vit:9,int:22},
 sk:[{n:"Alev Patlaması",mp:30,m:2.2,dot:1,d:"3 tur yakar"},{n:"Buzul Halka",mp:40,m:1.6,i:1,d:"Dondurur, ağır darbe hazırlığını bozar"},{n:"Arkana Kalkanı",mp:35,m:.5,sh:1,d:"Mana bariyeri"},{n:"Kıyamet Meteoru",mp:75,m:4.2,d:"Devasa büyü darbesi"}],
 it:["Kristal Asa","Odak Küresi","Arkana Tacı","Büyü Dokuma Cübbe","Efsunlu Pantolon","Astral Sandalet","Saf Mana Kolyesi","Yıldız Tozu Yüzüğü"]},
archer:{n:"Okçu",e:"🏹",h:140,d:"Yüksek kritik ve zehirli oklar.",b:{hp:310,mp:120,str:10,agi:22,vit:12,int:7},
 sk:[{n:"Zehirli Ok",mp:22,m:1.5,dot:1,d:"3 tur zehirler"},{n:"Kiriş Darbesi",mp:25,m:1.3,i:1,d:"Hızlı atış, ağır darbe hazırlığını bozar"},{n:"Zayıf Nokta",mp:35,m:2.4,crit:1,d:"Garanti kritik"},{n:"Ok Yağmuru",mp:60,m:3.6,d:"Ölümcül ok yağmuru"}],
 it:["Kompozit Avcı Yayı","Sadak & Bıçak","Deri Kapüşon","Sertleştirilmiş Yelek","Kamuflaj Pantolon","Sessiz İzci Çizmesi","Şahin Gözü Kolyesi","Rüzgâr Nişancı Yüzüğü"]},
assassin:{n:"Suikastçı",e:"🗡️",h:340,d:"Kritik uzmanı, kanatan ve kaçan gölge.",b:{hp:280,mp:110,str:12,agi:24,vit:10,int:6},
 sk:[{n:"Gölge Kesiği",mp:24,m:1.9,dot:1,d:"3 tur kanatır"},{n:"Kör Edici Toz",mp:28,m:1.1,i:1,d:"Ağır darbe hazırlığını iptal eder"},{n:"Gölgelere Karış",mp:30,m:.8,sh:1,d:"Darbeleri sıyırır"},{n:"Gölge İnfazı",mp:65,m:4.4,d:"Ölüm vuruşu"}],
 it:["Gölge Hançeri","Bilek Bıçağı","Yüz Maskesi","Gece Hayaleti Zırhı","Esnek Pantolon","Gölge Adımı Çizmesi","Engerek Gerdanlığı","Ölümcül Vuruş Yüzüğü"]},
healer:{n:"Şifacı",e:"✨",h:45,d:"Kutsal ışık, şifa ve koruyucu kubbe.",b:{hp:340,mp:180,str:9,agi:8,vit:15,int:14},
 sk:[{n:"Kutsal Işık",mp:25,m:1.6,dot:1,d:"Işık hasarı ve 3 tur kutsal yanık"},{n:"İlahi Baston",mp:22,m:1.2,i:1,d:"Ağır darbe hazırlığını bozar"},{n:"Kutsal Lütuf",mp:35,m:0,heal:1,d:"Canın %45’ini yeniler"},{n:"İlahi Kubbe",mp:70,m:1,sh:1,d:"Büyük ışık kubbesi"}],
 it:["Kutsal Topuz","Dua Kitabı","Işık Tacı","Ruhban Cübbesi","Arınma Pantolonu","Kutsal Sandalet","Hayat Madalyonu","Lütuf Yüzüğü"]}};

const G={1:{t:"GR-I",n:"Sıradan",m:1,c:"#64748b"},2:{t:"GR-II",n:"İşlenmiş",m:1.15,c:"#22c55e"},3:{t:"GR-III",n:"Usta İşi",m:1.3,c:"#38bdf8"},4:{t:"GR-IV",n:"Kusursuz",m:1.5,c:"#a855f7"},5:{t:"👑 ELİT",n:"Kadim Elit",m:1.75,c:"#e6b450"}};
const RG=[
{n:"Çırak Ormanı",req:1,ore:"Çırak",pw:25,h:130,m:[["Yaban Domuzu",2,340,42,10,1,3,18],["Goblin Çırağı",5,750,85,25,2,5,40],["Orman Kurdu",8,1450,155,45,4,8,75],["Haydut Reisi",10,3200,260,75,15,25,220]]},
{n:"Zehirli Madenler",req:11,ore:"Çelik",pw:70,h:38,m:[["Mağara Akrebi",12,3600,320,110,8,14,280],["Maden Golemi",15,6200,460,190,12,20,420],["Goblin Kazıcı Başı",18,9500,640,240,18,30,620],["Zehirli Kraliçe",20,18000,920,340,40,70,1200]]},
{n:"Batık Çöl Harabeleri",req:21,ore:"Obsidyen",pw:150,h:28,m:[["Kum Yılanı",22,12000,850,380,22,38,1100],["Lanetli Mumya",25,18500,1150,520,30,50,1600],["Antik Muhafız",28,26000,1520,700,42,70,2400],["Firavun Ruhu",30,48000,2200,980,90,160,4800]]},
{n:"Donmuş Ruhlar Zirvesi",req:31,ore:"Kristal",pw:280,h:200,m:[["Buzul Kurdu",32,34000,1950,1100,55,90,5200],["Donmuş Ruh",35,52000,2600,1450,75,120,7800],["Buzul Yetisi",38,76000,3500,1900,110,180,11500],["Buz Devi",40,135000,4900,2600,220,380,22000]]},
{n:"Ejderha Yarığı",req:41,ore:"Ejderha",pw:550,h:4,m:[["Lav Golemi",42,95000,4200,2400,140,240,22000],["Kıyamet İblisi",45,145000,5800,3200,200,350,34000],["Ejderha Muhafızı",48,220000,7800,4400,300,520,52000],["Kadim Kara Ejderha",50,450000,11500,6500,800,1500,120000]]}];
RG.forEach((r,ri)=>{r.id=ri;r.mobs=r.m.map((a,mi)=>({id:ri+"_"+mi,ri,mi,name:a[0],lv:a[1],hp:a[2],mx:a[2],atk:a[3],def:a[4],g:[a[5],a[6]],xp:a[7],el:mi==3}))});
const QS=[];RG.forEach((r,ri)=>[[0,8,40],[2,6,70],[3,1,180]].forEach(([mi,n,g],k)=>QS.push({id:"q"+ri+mi,ri,mi,n,g:Math.floor(g*Math.pow(ri+1,1.6)),sc:k==2?1:0,t:r.m[mi][0]})));
QS.push({id:"qa",ri:-1,mi:-1,n:60,g:400,sc:1,t:"herhangi bir canavar"});

/* ---------- UNVANLAR (TITLES) ---------- */
const TITLES=[
  {id:"t0",n:"Çaylak Maceracı",desc:"Yolculuğun başlangıcı",bonus:"Yok",b:{},chk:p=>true},
  {id:"t1",n:"Canavar Avcısı",desc:"50 canavar öldür",bonus:"+%5 Saldırı",b:{atk:5},chk:p=>p.st.k>=50},
  {id:"t2",n:"Elit Celladı",desc:"10 elit canavar öldür",bonus:"+%8 Kritik Şansı",b:{cr:8},chk:p=>p.st.e>=10},
  {id:"t3",n:"Kule Fatihi",desc:"Sonsuz Kule 15. kata çık",bonus:"+%10 Maksimum Can",b:{hp:10},chk:p=>p.tw>=15},
  {id:"t4",n:"Demir Ustası",desc:"20 başarılı yükseltme yap",bonus:"+%10 Fiziksel Zırh",b:{arm:10},chk:p=>(p.st.fok||0)>=20},
  {id:"t5",n:"Efsanevi Kahraman",desc:"40. seviyeye ulaş",bonus:"+%12 Saldırı & Zırh",b:{atk:12,arm:12},chk:p=>p.lv>=40},
  {id:"t6",n:"Karanlığın Efendisi",desc:"Kadim Kara Ejderha'yı yen",bonus:"+%15 Tüm Güç & +%5 Kritik",b:{atk:15,arm:15,hp:15,cr:5},chk:p=>!!p.boss[4]}
];

/* ---------- DURUM & ÇOKLU KARAKTER YUVASI ---------- */
const POT_DEF={
  hp:{
    S:{id:"S",sz:"Küçük",e:"🧪",n:"Küçük Can İksiri",pct:.25,cost:10,sell:3,g:1,dropW:65},
    M:{id:"M",sz:"Orta",e:"🧪",n:"Orta Can İksiri",pct:.50,cost:25,sell:8,g:2,dropW:27},
    L:{id:"L",sz:"Büyük",e:"🧪",n:"Büyük Can İksiri",pct:.85,cost:60,sell:20,g:4,dropW:8}
  },
  mp:{
    S:{id:"S",sz:"Küçük",e:"💧",n:"Küçük Mana İksiri",pct:.30,cost:8,sell:2,g:1,dropW:65},
    M:{id:"M",sz:"Orta",e:"💧",n:"Orta Mana İksiri",pct:.60,cost:20,sell:6,g:3,dropW:27},
    L:{id:"L",sz:"Büyük",e:"💧",n:"Büyük Mana İksiri",pct:.95,cost:50,sell:16,g:4,dropW:8}
  }
};
const NEW=()=>({name:"Kahraman",cls:"tank",lv:1,xp:0,gold:300,hp:1,mp:1,maxHp:1,maxMp:1,pot:{hp:{S:3,M:0,L:0},mp:{S:3,M:0,L:0}},selPot:{hp:"S",mp:"S"},autoCfg:{hp:"S",mp:"S",hpThr:40,mpThr:25,skills:[1,1,1,1]},sc:0,eq:{},inv:[],sr:{},sp:1,q:{},boss:{},st:{k:0,e:0,l:0,d:0,dm:0,fok:0},dl:{d:"",s:0,c:0,q:[]},stk:0,tw:0,ts:0,ch:0,shop:{d:"",it:[]},ap:3,at:{str:0,dex:0,int:0,vit:0},mat:{},title:"t0",art:""});
function normPot(p){
  if(!p.pot)p.pot={hp:{S:0,M:0,L:0},mp:{S:0,M:0,L:0}};
  if(typeof p.pot.hp==="number")p.pot.hp={S:p.pot.hp,M:0,L:0};
  if(typeof p.pot.mp==="number")p.pot.mp={S:p.pot.mp,M:0,L:0};
  ["hp","mp"].forEach(t=>{p.pot[t]=Object.assign({S:0,M:0,L:0},p.pot[t]||{})});
  if(!p.selPot)p.selPot={hp:"S",mp:"S"};
  if(!p.autoCfg)p.autoCfg={hp:"S",mp:"S",hpThr:40,mpThr:25,skills:[1,1,1,1]};
  if(!Array.isArray(p.autoCfg.skills)||p.autoCfg.skills.length<4)p.autoCfg.skills=[1,1,1,1];
}
const totPot=(t)=>((P.pot[t]?.S||0)+(P.pot[t]?.M||0)+(P.pot[t]?.L||0));
function pickBestAvailPot(t,pref){
  if(pref&&pref!=="off"&&(P.pot[t][pref]||0)>0)return pref;
  return null;
}
let SLOTS=[null,null,null,null,null],activeSlot=0,CLASS_ARTS={};
let P=NEW(),tab="character",SF=null,fsrc="eq",sel="tank",armed="",targetCreateSlot=0;

const SLOTS_KEY="kz_rpg_slots_v3",ARTS_KEY="kz_rpg_arts_v3";

function saveAll(quiet){
  /* quiet=true: sadece cihaza yaz (can yenilenmesi, arka plana geçme). Zaman damgasını ve bulut kuyruğunu etkilemez. */
  if(SLOTS[activeSlot]){
    if(!quiet)P.ts=Date.now();
    SLOTS[activeSlot]=P;
  }
  try{
    localStorage.setItem(SLOTS_KEY,JSON.stringify({active:activeSlot,slots:SLOTS}));
    localStorage.setItem(ARTS_KEY,JSON.stringify(CLASS_ARTS));
  }catch(e){
    toast("⚠️ Depolama alanı sınırına yaklaşıldı!");
  }
  if(!quiet&&typeof cloudQueue==="function")cloudQueue();
}
const save=()=>saveAll();

function loadAll(){
  try{
    const aRaw=localStorage.getItem(ARTS_KEY);
    if(aRaw)CLASS_ARTS=JSON.parse(aRaw)||{};
  }catch(e){}

  try{
    const sRaw=localStorage.getItem(SLOTS_KEY);
    if(sRaw){
      const parsed=JSON.parse(sRaw);
      const rawSlots=parsed.slots||[];
      SLOTS=Array.from({length:5},(_,i)=>{if(!rawSlots[i])return null;const x=Object.assign(NEW(),rawSlots[i]);normPot(x);return x;});
      activeSlot=parsed.active||0;
      if(SLOTS[activeSlot])P=SLOTS[activeSlot];
      return SLOTS.some(Boolean);
    }
  }catch(e){}
  SLOTS=[null,null,null,null,null];
  /* Eski tek yuvalı kaydı (kz_rpg_v2) 1. yuvaya taşı */
  try{
    const oldSave=localStorage.getItem("kz_rpg_v2");
    if(oldSave){
      const o=JSON.parse(oldSave);
      if(o&&typeof o.lv==="number"&&CL[o.cls]){
        const x=Object.assign(NEW(),o);normPot(x);
        SLOTS[0]=x;activeSlot=0;P=x;saveAll();
        return true;
      }
    }
  }catch(e){}
  return false;
}

/* =========================================================================
   SINIF TAM EKRAN ARKA PLAN GÖRSELLERİ (9:16 DİKEY)
   Kendi hazırladığın görselleri aşağıdaki dosya adlarıyla index.html yanına
   koyabilir veya doğrudan Base64 ("data:image/png;base64,...") yapıştırabilirsin.
   ========================================================================= */
const CLASS_BG_IMAGES = {
  tank: "img/tank.webp",
  mage: "img/mage.webp",
  archer: "img/archer.webp",
  assassin: "img/assassin.webp",
  healer: "img/healer.webp"
};

/* Görsel dosyası henüz eklenmemişse devreye giren tam ekran 9:16 gotik suluboya illüstrasyonlar */
function defaultClassFullArt(clsId){
  const scenes={
    tank:`<svg viewBox="0 0 360 640" preserveAspectRatio="xMidYMid slice"><defs><radialGradient id="bg_tank" cx="50%" cy="32%" r="65%"><stop offset="0%" stop-color="#3b4d6b"/><stop offset="55%" stop-color="#182030"/><stop offset="100%" stop-color="#090b10"/></radialGradient><linearGradient id="gld_t" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#f6d365"/><stop offset="100%" stop-color="#9c6b19"/></linearGradient></defs><rect width="360" height="640" fill="url(#bg_tank)"/><circle cx="180" cy="185" r="115" fill="#60a5fa" opacity=".12"/><circle cx="180" cy="185" r="78" fill="none" stroke="url(#gld_t)" stroke-width="1.5" stroke-dasharray="4 6" opacity=".5"/><path d="M180 95 L125 125 L125 215 C125 275 180 315 180 315 C180 315 235 275 235 215 L235 125 Z" fill="#111827" stroke="url(#gld_t)" stroke-width="4"/><path d="M180 112 L140 135 L140 210 C140 258 180 292 180 292 C180 292 220 258 220 210 L220 135 Z" fill="#1e293b"/><path d="M180 120 V285 M145 190 H215" stroke="url(#gld_t)" stroke-width="5"/><path d="M95 360 L130 270 L230 270 L265 360 L240 460 L120 460 Z" fill="#0f172a" stroke="#334155" stroke-width="2"/></svg>`,
    mage:`<svg viewBox="0 0 360 640" preserveAspectRatio="xMidYMid slice"><defs><radialGradient id="bg_mage" cx="50%" cy="30%" r="65%"><stop offset="0%" stop-color="#581c87"/><stop offset="55%" stop-color="#221038"/><stop offset="100%" stop-color="#09070f"/></radialGradient></defs><rect width="360" height="640" fill="url(#bg_mage)"/><circle cx="180" cy="190" r="120" fill="#c084fc" opacity=".16"/><circle cx="180" cy="190" r="85" fill="none" stroke="#e879f9" stroke-width="1.5" stroke-dasharray="6 4" opacity=".6"/><polygon points="180,82 128,175 232,175" fill="#1e1035" stroke="#c084fc" stroke-width="3"/><circle cx="180" cy="235" r="34" fill="#38bdf8" opacity=".25"/><circle cx="180" cy="235" r="22" fill="#e0f2fe" stroke="#38bdf8" stroke-width="3"/><path d="M115 390 Q180 270 245 390 L265 480 L95 480 Z" fill="#170d29" stroke="#7e22ce" stroke-width="2"/></svg>`,
    archer:`<svg viewBox="0 0 360 640" preserveAspectRatio="xMidYMid slice"><defs><radialGradient id="bg_arch" cx="50%" cy="32%" r="65%"><stop offset="0%" stop-color="#1e4636"/><stop offset="55%" stop-color="#0f241d"/><stop offset="100%" stop-color="#070d0b"/></radialGradient></defs><rect width="360" height="640" fill="url(#bg_arch)"/><circle cx="180" cy="185" r="115" fill="#34d399" opacity=".13"/><path d="M135 90 Q245 205 135 320" fill="none" stroke="#e6b450" stroke-width="6" stroke-linecap="round"/><line x1="135" y1="90" x2="135" y2="320" stroke="#e2e8f0" stroke-width="1.8"/><line x1="95" y1="205" x2="265" y2="205" stroke="#f8fafc" stroke-width="3"/><polygon points="272,205 252,196 252,214" fill="#e6b450"/><path d="M110 380 L145 275 L215 275 L250 380 L230 470 L130 470 Z" fill="#0c1f18" stroke="#10b981" stroke-width="2"/></svg>`,
    assassin:`<svg viewBox="0 0 360 640" preserveAspectRatio="xMidYMid slice"><defs><radialGradient id="bg_assn" cx="50%" cy="30%" r="65%"><stop offset="0%" stop-color="#6b1426"/><stop offset="55%" stop-color="#260b14"/><stop offset="100%" stop-color="#0a0608"/></radialGradient></defs><rect width="360" height="640" fill="url(#bg_assn)"/><circle cx="180" cy="185" r="115" fill="#f43f5e" opacity=".15"/><path d="M110 295 L245 110" stroke="#e2e8f0" stroke-width="6" stroke-linecap="round"/><path d="M250 295 L115 110" stroke="#e2e8f0" stroke-width="6" stroke-linecap="round"/><circle cx="180" cy="185" r="44" fill="#0f0a12" stroke="#f43f5e" stroke-width="2.5"/><path d="M156 178 L174 185 M204 178 L186 185" stroke="#facc15" stroke-width="3.5" stroke-linecap="round"/><path d="M110 380 L145 265 L215 265 L250 380 L235 470 L125 470 Z" fill="#12090e" stroke="#be123c" stroke-width="2"/></svg>`,
    healer:`<svg viewBox="0 0 360 640" preserveAspectRatio="xMidYMid slice"><defs><radialGradient id="bg_heal" cx="50%" cy="30%" r="65%"><stop offset="0%" stop-color="#6e5318"/><stop offset="55%" stop-color="#291f0b"/><stop offset="100%" stop-color="#0c0a07"/></radialGradient></defs><rect width="360" height="640" fill="url(#bg_heal)"/><circle cx="180" cy="185" r="125" fill="#fde047" opacity=".16"/><circle cx="180" cy="145" r="36" fill="none" stroke="#fde047" stroke-width="3"/><path d="M180 185 V315 M130 235 H230" stroke="#fef08a" stroke-width="7" stroke-linecap="round"/><circle cx="180" cy="235" r="68" fill="none" stroke="#e6b450" stroke-width="1.5" stroke-dasharray="4 5"/><path d="M110 390 L145 280 L215 280 L250 390 L235 475 L125 475 Z" fill="#1f180a" stroke="#eab308" stroke-width="2"/></svg>`
  };
  return scenes[clsId]||scenes.tank;
}

function getFullClassArtHTML(clsId){
  const srcUrl=CLASS_BG_IMAGES[clsId];
  const fallback=defaultClassFullArt(clsId);
  if(!srcUrl)return fallback;
  return`<img class="cs-bg-blur" src="${srcUrl}" alt="" aria-hidden="true"><img class="cs-bg-main" src="${srcUrl}" alt="${clsId}" onerror="this.style.display='none';this.previousElementSibling.style.display='none';this.nextElementSibling.style.display='block'"><div style="display:none;width:100%;height:100%">${fallback}</div>`;
}

function getCharPortraitHTML(charObj, clsOverride){
  const clsId=clsOverride||(charObj?charObj.cls:"tank");
  return getFullClassArtHTML(clsId);
}

let csShowcaseCls="tank";

function getShowcaseBgOnlyHTML(clsId){
  const activeCls=clsId||csShowcaseCls||"tank";
  const cl=CL[activeCls]||CL.tank;
  const srcUrl=CLASS_BG_IMAGES[activeCls];
  const fallback=defaultClassFullArt(activeCls);
  const media=srcUrl
    ?`<img class="cs-bg-blur" src="${srcUrl}" alt="" aria-hidden="true"><img class="cs-showcase-art" src="${srcUrl}" alt="${cl.n}" onerror="this.style.display='none';this.previousElementSibling.style.display='none';this.nextElementSibling.style.display='block'"><div style="display:none;width:100%;height:100%">${fallback}</div>`
    :fallback;
  return`<div class="cs-showcase-bg">${media}</div>`;
}

function getShowcaseOverlayControlsHTML(clsId){
  const order=["tank","mage","archer","assassin","healer"];
  const activeCls=clsId||csShowcaseCls||"tank";
  const cl=CL[activeCls]||CL.tank;
  const lore=CLASS_LORE[activeCls]||CLASS_LORE.tank;

  const buttons=order.map(k=>{
    const c=CL[k];
    const isHl=activeCls===k;
    return`<div class="cs-class-btn ${isHl?"hl":""}" onclick="onShowcaseClassTap('${k}')">
      <span>${c.e}</span>
      <b>${c.n}</b>
    </div>`;
  }).join("");

  const skillsInline=cl.sk.map(s=>`<span style="background:rgba(15,13,24,.45);border:1px solid rgba(255,255,255,.15);border-radius:6px;padding:2px 6px;font-size:9px;color:#f1f5f9">${s.n}</span>`).join("");

  return`
    <div class="cs-inline-info">
      <div class="r" style="margin-bottom:3px">
        <div>
          <b style="font-family:var(--hd);color:var(--gold);font-size:14px">${cl.e} ${cl.n.toUpperCase()}</b>
          <span style="font-size:10px;color:#e2e8f0;margin-left:5px">· ${lore.sub}</span>
        </div>
        <span style="font-size:9.5px;font-weight:800;color:#cbd5e1;white-space:nowrap">❤️${cl.b.hp} 💧${cl.b.mp}</span>
      </div>
      <p style="font-size:10.5px;color:#f8fafc;line-height:1.35;margin-bottom:5px">${lore.story}</p>
      <div style="display:flex;flex-wrap:wrap;gap:4px">${skillsInline}</div>
    </div>
    <div class="cs-bottom-bar">
      ${buttons}
    </div>
  `;
}

const CLASS_LORE={
  tank:{
    sub:"Demir Siperin Son Muhafızı",
    story:"Yıkılan Kuzey Surları'nın enkazından sağ çıkan tek muhafız. Devasa kalkanıyla karanlık zindanların en ölümcül darbelerini göğüsleyerek yoldaşlarına yol açar.",
    pros:["En yüksek başlangıç Canı (420 HP) ve Zırh","Kalkan Duvarı ile hasar emilimi","Kalkan Darbesi ile ağır darbe kesintisi"],
    cons:["Düşük büyü direnci ve sınırlı Mana","Tek hedef saldırı hızı yavaş"]
  },
  mage:{
    sub:"Kül ve Yıldız Arkana Ustası",
    story:"Yasak kadim parşömenleri okuyarak alev ve buzulun yıkıcı gücünü bedenine mühürledi. Zayıf bedenini saf arkana kalkanlarıyla korur.",
    pros:["Oyundaki en yüksek anlık ve alan büyü hasarı","210 MP ile uzun yetenek zinciri","Alev Patlaması ile sürekli yanma hasarı"],
    cons:["En düşük başlangıç Canı (250 HP) ve Zırh","Mana tükendiğinde savunmasız kalır"]
  },
  archer:{
    sub:"Gölge Ormanın Keskin Nişancısı",
    story:"Lanetli sislerin içindeki hedefleri bile tek nefeste avlayan usta izci. Zehirli okları ve kusursuz nişancılığıyla düşmanlarını yanına yaklaştırmaz.",
    pros:["Çok yüksek Kritik vuruş şansı ve çarpanı","Zayıf Nokta ile garanti kritik darbe","Zehirli Ok ile tur başı eritme hasarı"],
    cons:["Orta-düşük fiziksel zırh","Uzun süreli yakın dövüş baskısına kırılgan"]
  },
  assassin:{
    sub:"Karanlık Loncanın Gölge Bıçağı",
    story:"İsimsiz bir suikast tarikatının son varisi. Gölgelerin arasından süzülerek düşmanın en zayıf anını kollar ve tek darbede infaz eder.",
    pros:["En yüksek tek hedef infaz hasarı (4.4×)","Yüksek çeviklik ve kritik patlaması","Gölgelere Karış ile saldırılardan sıyrılma"],
    cons:["Düşük Can ve Zırh havuzu","Yanlış zamanlamada ağır boss darbelerine açık"]
  },
  healer:{
    sub:"Şafak Tapınağı'nın Işık Elçisi",
    story:"Karanlığın yuttuğu topraklara kutsal ışığı geri getirmeye ant içmiş ruhban. Hem yaraları sarar hem de ilahi gazabıyla karanlık yaratıkları yakar.",
    pros:["Kutsal Lütuf ile yüksek anlık Can yenileme","İlahi Kubbe ile güçlü koruyucu bariyer","Yüksek Mana ve istikrarlı hayatta kalma"],
    cons:["Başlangıç saldırı çarpanı diğer sınıflardan düşük","Düşmanları devirmesi daha uzun sürer"]
  }
};

function onShowcaseClassTap(clsId){
  csShowcaseCls=clsId;
  A.pot();
  renderCharSelect();
}

function openClassLoreModal(clsId, originEl){
  const cl=CL[clsId];
  const lore=CLASS_LORE[clsId];
  if(!cl||!lore)return;
  A.pot();
  const srcRect=originEl?originEl.getBoundingClientRect():null;
  const srcUrl=CLASS_BG_IMAGES[clsId];
  const fallback=defaultClassFullArt(clsId);
  const bgHtml=srcUrl
    ?`<img src="${srcUrl}" alt="${cl.n}" onerror="this.style.display='none';this.nextElementSibling.style.display='block'"><div style="display:none;width:100%;height:100%">${fallback}</div>`
    :fallback;
  const skillsHtml=cl.sk.map(s=>`
    <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(255,255,255,.08);padding:3px 0">
      <div><b style="color:var(--gold)">${s.n}</b> <span style="color:#cbd5e1;font-size:10px">— ${s.d}</span></div>
      <span style="color:#60a5fa;font-weight:800;font-size:10px;white-space:nowrap;margin-left:6px">${s.mp} MP</span>
    </div>
  `).join("");
  const prosHtml=lore.pros.map(x=>`<div>• ${x}</div>`).join("");
  const consHtml=lore.cons.map(x=>`<div>• ${x}</div>`).join("");

  const modal=$("class-lore-modal");
  modal.innerHTML=`
    <div class="clm-card pre-anim" id="clm-card-box" onclick="event.stopPropagation()">
      <div class="clm-bg">${bgHtml}</div>
      <div class="clm-scrim"></div>
      <div class="clm-top">
        <div>
          <span class="title-pill" style="margin-bottom:4px">SINIF REHBERİ · REFERANS</span>
          <h3 style="font-family:var(--hd);color:var(--gold);font-size:20px;text-shadow:0 2px 8px #000">${cl.e} ${cl.n.toUpperCase()}</h3>
          <div style="font-size:11px;color:#cbd5e1;font-weight:600">${lore.sub}</div>
        </div>
        <button class="btn s" style="width:auto;padding:6px 11px;font-size:12px;border:1px solid rgba(255,255,255,.25)" onclick="closeClassLore()">✕ Kapat</button>
      </div>
      <div class="clm-body">
        <div class="clm-box">
          <div style="color:var(--gold);font-weight:800;font-size:10px;margin-bottom:2px">📜 KISA HİKÂYE</div>
          <div style="color:#ece7f5">${lore.story}</div>
        </div>
        <div class="clm-box">
          <div style="color:var(--gold);font-weight:800;font-size:10px">📊 BAŞLANGIÇ STATLARI</div>
          <div class="clm-stats">
            <div class="clm-stat"><span class="mu">Can (HP)</span><b style="color:#f87171">${cl.b.hp}</b></div>
            <div class="clm-stat"><span class="mu">Mana (MP)</span><b style="color:#60a5fa">${cl.b.mp}</b></div>
            <div class="clm-stat"><span class="mu">STR (Güç)</span><b>${cl.b.str}</b></div>
            <div class="clm-stat"><span class="mu">DEX (Çevik)</span><b>${cl.b.agi}</b></div>
            <div class="clm-stat"><span class="mu">INT (Zekâ)</span><b>${cl.b.int}</b></div>
            <div class="clm-stat"><span class="mu">VIT (Canlılık)</span><b>${cl.b.vit}</b></div>
          </div>
        </div>
        <div class="clm-box">
          <div style="color:var(--gold);font-weight:800;font-size:10px;margin-bottom:2px">⚔️ BAŞLANGIÇ BECERİLERİ</div>
          ${skillsHtml}
        </div>
        <div class="clm-sw">
          <div class="clm-s">
            <b style="color:#34d399;display:block;margin-bottom:3px">▲ Güçlü Yanları</b>
            ${prosHtml}
          </div>
          <div class="clm-w">
            <b style="color:#f87171;display:block;margin-bottom:3px">▼ Güçsüz Yanları</b>
            ${consHtml}
          </div>
        </div>
      </div>
    </div>
  `;
  modal.classList.remove("open");
  modal.style.display="flex";
  const card=$("clm-card-box");
  if(card){
    const dstRect=card.getBoundingClientRect();
    if(srcRect&&dstRect.width>0&&dstRect.height>0){
      const dx=(srcRect.left+srcRect.width/2)-(dstRect.left+dstRect.width/2);
      const dy=(srcRect.top+srcRect.height/2)-(dstRect.top+dstRect.height/2);
      const sx=Math.max(.15,srcRect.width/dstRect.width);
      const sy=Math.max(.15,srcRect.height/dstRect.height);
      card.style.transition="none";
      card.style.transform=`translate(${dx}px,${dy}px) scale(${sx},${sy})`;
      card.style.opacity=".35";
    }else{
      card.style.transition="none";
      card.style.transform="scale(.78)";
      card.style.opacity="0";
    }
    requestAnimationFrame(()=>{
      requestAnimationFrame(()=>{
        modal.classList.add("open");
        card.style.transition="transform .36s cubic-bezier(.22,1,.36,1),opacity .26s ease";
        card.style.transform="translate(0,0) scale(1,1)";
        card.style.opacity="1";
        card.classList.remove("pre-anim");
      });
    });
  }else{
    modal.classList.add("open");
  }
}

function closeClassLore(){
  const modal=$("class-lore-modal");
  const card=$("clm-card-box");
  modal.classList.remove("open");
  if(card){
    card.style.transition="transform .22s ease,opacity .2s ease";
    card.style.transform="scale(.86)";
    card.style.opacity="0";
    setTimeout(()=>{modal.style.display="none";},210);
  }else{
    modal.style.display="none";
  }
}

/* ---------- TAM EKRAN KARAKTER SEÇİM & OLUŞTURMA EKRANI ---------- */
let csMode="select"; // "select" veya "create"
let csPreviewSlot=0;

function openCharSelect(){
  stopAuto();
  CB.on=false;
  csMode="select";
  const firstIdx=SLOTS.findIndex(Boolean);
  csPreviewSlot=SLOTS[activeSlot]?activeSlot:(firstIdx>-1?firstIdx:0);
  const initChar=SLOTS[csPreviewSlot]||SLOTS.find(Boolean);
  csShowcaseCls=initChar?initChar.cls:"tank";
  $("cs-screen").style.display="flex";
  renderCharSelect();
}

function toggleCsMode(){
  csMode="select";
  const firstIdx=SLOTS.findIndex(Boolean);
  csPreviewSlot=SLOTS[activeSlot]?activeSlot:(firstIdx>-1?firstIdx:0);
  const initChar=SLOTS[csPreviewSlot]||SLOTS.find(Boolean);
  csShowcaseCls=initChar?initChar.cls:csShowcaseCls;
  renderCharSelect();
}

function renderCharSelect(){
  const bgLayer=$("cs-bg-layer");
  const bottom=$("cs-bottom-area");
  const modeBtn=$("cs-mode-btn");
  const hTitle=$("cs-header-title");
  const hSub=$("cs-header-sub");

  if(csMode==="select"){
    const hasAny=SLOTS.some(Boolean);
    const previewChar=hasAny?(SLOTS[csPreviewSlot]||SLOTS.find(Boolean)):null;
    bgLayer.innerHTML=getShowcaseBgOnlyHTML(csShowcaseCls);

    hTitle.innerText="KARAKTER SEÇİMİ";
    hSub.innerText="Sınıflara dokunarak incele · Boş yuvadan yeni kahraman oluştur";

    // Yukarıdaki + Yeni Karakter butonu kaldırıldı; sadece boş yuvalardan oluşturulur
    modeBtn.style.display="none";

    const slotsHtml=SLOTS.map((s,idx)=>{
      if(!s){
        return`<div class="cs-slot" style="border-style:dashed;justify-content:space-between" onclick="openCreateForSlot(${idx})">
          <div>
            <b style="font-size:11.5px;color:#cbd5e1">BOŞ YUVA #${idx+1}</b>
            <div style="font-size:9.5px;color:#94a3b8">Yeni kahraman oluşturmak için dokun</div>
          </div>
          <span class="g" style="font-size:11px;font-weight:800">+ OLUŞTUR</span>
        </div>`;
      }
      const c=CL[s.cls]||CL.tank;
      const tObj=TITLES.find(t=>t.id==s.title)||TITLES[0];
      const isSel=idx===csPreviewSlot;
      return`<div class="cs-slot ${isSel?"active-slot":""}" onclick="previewSlot(${idx})">
        <div class="char-art" style="width:46px;height:60px">${getCharPortraitHTML(s)}</div>
        <div style="flex:1;min-width:0">
          <div class="r">
            <div class="nm" style="font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${s.name}</div>
            <span class="lvb">LV.${s.lv}</span>
          </div>
          <div class="title-pill">🏅 ${tObj.n}</div>
          <div style="font-size:9.5px;color:#e2e8f0;margin-top:3px">${c.e} ${c.n} · 🪙 ${s.gold.toLocaleString()} · 🗼 Kat ${s.tw||0}</div>
        </div>
        <button class="btn d" style="width:auto;padding:6px 8px;font-size:10.5px" onclick="event.stopPropagation();deleteSlot(${idx})">${armed=="del"+idx?"Sil?":"🗑️"}</button>
      </div>`;
    }).join("");

    const playBtnHtml=previewChar?`<button class="btn" style="padding:11px;font-size:13.5px;box-shadow:0 4px 20px rgba(230,180,80,.35)" onclick="selectAndPlaySlot(${csPreviewSlot})">⚔️ ${previewChar.name.toUpperCase()} İLE OYNA</button>`:``;

    bottom.innerHTML=`
      ${getShowcaseOverlayControlsHTML(csShowcaseCls)}
      ${slotsHtml}
      ${playBtnHtml}
    `;
  }else{
    // Yeni Karakter Oluşturma Modu (Boş yuvaya tıklanınca açılır)
    bgLayer.innerHTML=getFullClassArtHTML(sel);
    const c=CL[sel];
    const lore=CLASS_LORE[sel]||CLASS_LORE.tank;

    hTitle.innerText="YENİ KAHRAMAN · YUVA #"+(targetCreateSlot+1);
    hSub.innerText="Sınıfını seç, adını yaz ve maceraya atıl";
    modeBtn.style.display="inline-block";
    modeBtn.innerText="← Yuvalar";

    const tabsHtml=Object.entries(CL).map(([k,cl])=>`
      <div class="cls-tab ${k===sel?"act":""}" style="background:rgba(24,21,35,.45);backdrop-filter:blur(5px)" onclick="pick('${k}')">
        <span>${cl.e}</span>
        <b>${cl.n}</b>
      </div>
    `).join("");

    bottom.innerHTML=`
      <div class="cs-inline-info">
        <div class="r" style="margin-bottom:3px">
          <div>
            <b style="font-family:var(--hd);color:var(--gold);font-size:15px">${c.e} ${c.n.toUpperCase()}</b>
            <span style="font-size:10px;color:#e2e8f0;margin-left:5px">· ${lore.sub}</span>
          </div>
          <span style="font-size:10px;color:#cbd5e1;font-weight:800">❤️${c.b.hp} 💧${c.b.mp}</span>
        </div>
        <p style="font-size:10.5px;color:#f8fafc;line-height:1.35">${lore.story}</p>
      </div>
      <div class="cls-tabs">${tabsHtml}</div>
      <div class="r" style="gap:8px">
        <input id="cn" value="${$('cn')?$('cn').value:''}" maxlength="14" oninput="syncCreateBtn()" placeholder="Kahraman adını yaz (Zorunlu)..." style="flex:1;padding:11px;background:rgba(15,13,24,.58);backdrop-filter:blur(5px);border:1px solid var(--gold);border-radius:8px;color:#fff;font-weight:700;font-size:13px">
        <button id="cn-btn" class="btn" style="width:auto;padding:11px 18px;font-size:13px" onclick="newGame()">⚔️ Başla</button>
      </div>
    `;
    syncCreateBtn();
  }
}

function previewSlot(idx){
  if(!SLOTS[idx])return;
  csPreviewSlot=idx;
  csShowcaseCls=SLOTS[idx].cls;
  armed="";
  renderCharSelect();
}

function selectAndPlaySlot(idx){
  if(!SLOTS[idx])return;
  activeSlot=idx;
  P=SLOTS[idx];
  armed="";
  $("cs-screen").style.display="none";
  sync();
  daily();
  offline();
  saveAll();
  nav();
  view();
  toast("Hoş geldin, "+P.name+"!");
}

function deleteSlot(idx){
  if(armed!="del"+idx){armed="del"+idx;renderCharSelect();return}
  armed="";
  SLOTS[idx]=null;
  saveAll();
  const firstIdx=SLOTS.findIndex(Boolean);
  csPreviewSlot=firstIdx>-1?firstIdx:0;
  renderCharSelect();
  toast("Karakter silindi.");
}

function openCreateForSlot(idx){
  targetCreateSlot=idx;
  sel=csShowcaseCls||"tank";
  csMode="create";
  renderCharSelect();
}

/* ---------- FORMÜLLER & SET BONUSLARI ---------- */
const reqXp=l=>l>=50?1e12:Math.floor(140*Math.pow(l,2.38)*(l>25?Math.pow(1.085,l-25):1)*(l>40?Math.pow(1.18,l-40):1));
function killXp(x,ml,pl){const d=pl-ml;if(d>=7)return 0;if(d>=4)return Math.floor(x*.25);if(d>=2)return Math.floor(x*.65);if(ml-pl>=6)return Math.floor(x*.35);return x}
const effLv=i=>i.g==5?Math.min(50,i.rl+i.p*2):i.rl;
const pw=i=>Math.floor(i.bp*G[i.g].m*(1+i.p*.12));

function getActiveSets(){
  const counts={};
  SL.forEach(k=>{
    const it=P.eq[k];
    if(!it||effLv(it)>P.lv)return;
    const setOre=it.setOre||it.name.split(" ")[0];
    counts[setOre]=(counts[setOre]||0)+1;
  });
  const active=[];
  Object.entries(counts).forEach(([ore,cnt])=>{
    if(cnt>=2){
      active.push({
        ore,cnt,
        atkPct:cnt>=6?25:(cnt>=2?8:0),
        armPct:cnt>=6?25:(cnt>=2?8:0),
        hpPct:cnt>=4?15:0,
        mpPct:cnt>=4?15:0,
        critAdd:cnt>=4?5:0,
        regenPct:cnt>=6?3:0
      });
    }
  });
  return active;
}

function getTitleBonus(){
  const t=TITLES.find(x=>x.id==P.title);
  return(t&&t.chk(P))?t.b:{};
}

function D(){const c=CL[P.cls].b,s=1+P.lv*.06;
const lvGain=Math.max(0,P.lv-1),lvHpBonus=lvGain*(35+Math.floor(c.hp*.035)),lvMpBonus=lvGain*(18+Math.floor(c.mp*.03));
let atk=20+P.lv*3+(c.str*2.5+c.agi*1.5+c.int*2)*s,arm=10+c.vit*2*s,hp=c.hp+c.vit*15+lvHpBonus,mp=c.mp+c.int*10+lvMpBonus,cr=5+c.agi*.4+P.lv*.1,pa=0,pd=0,php=0,pmp=0;
const a=P.at,w=CW[P.cls];atk+=a.str*w.str+a.dex*w.dex+a.int*w.int;arm+=a.vit*1.5+a.str*.4;hp+=a.vit*18;mp+=a.int*12;cr+=a.dex*.25;
SL.forEach(k=>{const i=P.eq[k];if(!i||effLv(i)>P.lv)return;const p=pw(i);
 if(k=="weapon")atk+=p;else if(k=="necklace")hp+=p*4;else if(k=="ring")mp+=p*3;else arm+=p;
 (i.af||[]).forEach(a=>{if(a.t=="atk")pa+=a.v;if(a.t=="def")pd+=a.v;if(a.t=="crit")cr+=a.v})});

// Set Bonusları
getActiveSets().forEach(st=>{pa+=st.atkPct;pd+=st.armPct;php+=st.hpPct;pmp+=st.mpPct;cr+=st.critAdd});

// Unvan Bonusları
const tb=getTitleBonus();
if(tb.atk)pa+=tb.atk;if(tb.arm)pd+=tb.arm;if(tb.hp)php+=tb.hp;if(tb.cr)cr+=tb.cr;

const fAtk=Math.floor(atk*(1+pa/100));
return{atk:fAtk,minAtk:Math.max(1,Math.floor(fAtk*.85)),maxAtk:Math.max(1,Math.ceil(fAtk*1.15)),arm:Math.floor(arm*(1+pd/100)),hp:Math.floor(hp*(1+php/100)),mp:Math.floor(mp*(1+pmp/100)),cr:Math.min(75,Math.floor(cr))}}
function sync(){const d=D();P.maxHp=d.hp;P.maxMp=d.mp;P.hp=Math.min(P.hp,P.maxHp);P.mp=Math.min(P.mp,P.maxMp);hud()}

/* ---------- HUD ---------- */
function hud(){const x=reqXp(P.lv);
const tObj=TITLES.find(t=>t.id==P.title)||TITLES[0];
$("hl").innerText="LV."+P.lv;$("hn").innerText=P.name;$("hc").innerText=CL[P.cls].n;$("htitle").innerText="🏅 "+tObj.n;
$("hg").innerText=P.gold.toLocaleString();$("hb").innerText=P.inv.length;
$("hh").style.width=Math.max(0,P.hp/P.maxHp*100)+"%";$("hm").style.width=Math.max(0,P.mp/P.maxMp*100)+"%";$("hx").style.width=Math.min(100,P.xp/x*100)+"%";
$("ht").innerText=P.hp+" / "+P.maxHp+" HP";$("hmt").innerText=P.mp+" / "+P.maxMp+" MP"}
const TABS=[["character","🧙","Karakter"],["inventory","🎒","Çanta"],["map","🗺️","Harita"],["forge","🔨","Demirci"],["city","🏰","Şehir"],["quests","📜","Görev"],["community","🌐","Topluluk"],["wiki","📖","Wiki"]];
function nav(){$("nv").innerHTML=TABS.map(t=>`<button class="${tab==t[0]?"a":""}" onclick="go('${t[0]}')"><span>${t[1]}</span>${t[2]}</button>`).join("")}
function go(t){tab=t;armed="";nav();view()}
function view(){const v=$("mv");if(CB.on){combatUI(v);return}({character:cChar,inventory:cBag,map:cMap,forge:cForge,city:cCity,skills:cSkills,quests:cQuests,community:(typeof cCommunity==="function"?cCommunity:cCity),wiki:cWiki})[tab](v)}
function toast(m){const e=document.createElement("div");e.className="t";e.innerText=m;$("tt").appendChild(e);setTimeout(()=>e.remove(),2400)}

/* ---------- GÖRSELLER (SVG) ---------- */
function banner(h){return`<svg viewBox="0 0 400 120" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="b${h}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(${h},50%,24%)"/><stop offset="1" stop-color="hsl(${h},40%,8%)"/></linearGradient></defs><rect width="400" height="120" fill="url(#b${h})"/><circle cx="325" cy="30" r="15" fill="hsl(${h},70%,82%)" opacity=".85"/><path d="M0 120V70L60 36 110 74 170 28 240 78 300 44 400 82V120Z" fill="hsl(${h},35%,13%)"/><path d="M0 120V92L80 66 150 94 230 68 320 96 400 74V120Z" fill="hsl(${h},30%,6%)"/></svg>`}
function mobSVG(m){const h=RG[m.ri].h,i=m.mi,id="g"+m.id,e=m.el,c1=`hsl(${h+i*14},45%,${30+i*4}%)`,c2=`hsl(${h+i*14},55%,13%)`,ey=e?"#ffd166":"#ff5d5d";
const hr=i%2?`<path d="M26 30L14 6 38 24ZM74 30L86 6 62 24Z" fill="#e8dcc0"/>`:`<path d="M20 42L4 28 26 30ZM80 42L96 28 74 30Z" fill="${c1}"/>`;
const sp=i>1?`<path d="M30 80L36 95 44 83 50 97 56 83 64 95 70 80Z" fill="${c2}"/>`:"";
return`<svg viewBox="0 0 100 100"><defs><radialGradient id="${id}" cx="50%" cy="35%"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></radialGradient></defs>${e?`<circle cx="50" cy="54" r="46" fill="none" stroke="#e6b450" stroke-width="1.5" stroke-dasharray="3 4" opacity=".8"/>`:""}${hr}${sp}<ellipse cx="50" cy="56" rx="33" ry="31" fill="url(#${id})" stroke="#000" stroke-opacity=".5"/><path d="M29 50Q38 41 47 52L34 57ZM71 50Q62 41 53 52L66 57Z" fill="${ey}"/><path d="M33 72Q50 84 67 72L62 70 58 77 50 71 42 77 38 70Z" fill="#0b0a10"/><path d="M40 73L42 77 44 73ZM56 73L58 77 60 73Z" fill="#fff"/>${e?`<path d="M34 24L40 12 46 22 50 8 54 22 60 12 66 24Z" fill="#e6b450"/>`:""}</svg>`}
const IC={weapon:"M14.5 2.5l7 7-8.5 8.5-7-7zM9.5 16l3.5 3.5-7 2.5z",offhand:"M12 2L4 5v6c0 5 3.4 9.8 8 11 4.6-1.2 8-6 8-11V5z",helm:"M12 3a9 9 0 00-9 9v3h18v-3a9 9 0 00-9-9z",chest:"M12 2L8 5H4v7l3 2v6h10v-6l3-2V5h-4z",pants:"M6 2l1 18 4-2 1 4 1-4 4 2 1-18z",boots:"M4 3v13l4 3 6-1 2 3h4v-7l-5-2V3z",necklace:"M12 2a7 7 0 00-7 7c0 4 7 11 7 11s7-7 7-11a7 7 0 00-7-7z",ring:"M12 2a8 8 0 100 16 8 8 0 000-16zm0 12a4 4 0 110-8 4 4 0 010 8z"};
const ico=s=>`<svg viewBox="0 0 24 24"><path d="${IC[s]}"/></svg>`;

/* ---------- SEKMELER ---------- */
let charSub="eq"; // "eq" | "build" | "titles" | "logs"
function setCharSub(s){charSub=s;armed="";view()}

function cChar(v){
const d=D(),c=CL[P.cls],s=P.st,sets=getActiveSets();
const box=(a,b,c2)=>`<div style="background:#0006;padding:6px 8px;border-radius:7px;font-size:11px"><span class="mu">${a}</span><b style="float:right;color:${c2||"#fff"}">${b}</b></div>`;
const ptsBdg=(P.ap+P.sp)>0?`<span class="bdg">${P.ap+P.sp}</span>`:"";

const subNav=`<div class="sub-tabs">
  <button class="sub-tab ${charSub=="eq"?"act":""}" onclick="setCharSub('eq')">🛡️ Donanım</button>
  <button class="sub-tab ${charSub=="build"?"act":""}" onclick="setCharSub('build')">⚡ Gelişim${ptsBdg}</button>
  <button class="sub-tab ${charSub=="titles"?"act":""}" onclick="setCharSub('titles')">🏅 Unvan</button>
  <button class="sub-tab ${charSub=="logs"?"act":""}" onclick="setCharSub('logs')">📊 Kayıt</button>
</div>`;

const headerCard=`<div class="cd" style="padding:8px 10px">
  <div class="r" style="gap:8px">
    <div style="display:flex;gap:10px;align-items:center;min-width:0">
      <div class="char-art" style="width:46px;height:60px" onclick="openCharSelect()">${getCharPortraitHTML(P)}</div>
      <div style="min-width:0">
        <div class="nm" style="font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${P.name}</div>
        <div class="mu" style="font-size:10px">${c.e} ${c.n} · Seviye ${P.lv}</div>
        <div style="font-size:10px;margin-top:2px">⚔️ <b style="color:#e5484d">${d.minAtk}–${d.maxAtk}</b> <span class="mu">(${d.atk})</span> · 🛡️ <b style="color:#38bdf8">${d.arm}</b> · 💥 <b class="g">%${d.cr}</b></div>
      </div>
    </div>
    <button class="btn s" style="width:auto;padding:5px 8px;font-size:10px;flex-shrink:0" onclick="openCharSelect()">👥 Yuvalar</button>
  </div>
</div>`;

let content="";
if(charSub=="eq"){
  const eq=SL.map(k=>{const i=P.eq[k];if(!i)return`<div class="sl">${ico(k)}<span class="mu">${SN[k]}</span></div>`;
  return`<div class="sl g${i.g} ${effLv(i)>P.lv?"off":""}" onclick="inspEq('${k}')"><span class="pl">+${i.p}</span>${ico(k)}<span style="color:${G[i.g].c};font-weight:700">${i.name}</span></div>`}).join("");
  const setHtml=sets.length?sets.map(st=>`<div class="set-badge" style="margin-bottom:4px;padding:6px 8px">
    <b style="color:#34d399;font-size:11px">🛡️ ${st.ore} Seti (${st.cnt} Parça)</b>
    <div class="mu" style="font-size:9.5px;margin-top:2px">
      ${st.cnt>=2?"✓ 2P: +%8 Saldırı & Zırh ":""}${st.cnt>=4?"· ✓ 4P: +%15 HP/MP, +%5 Kritik ":""}${st.cnt>=6?"· ✓ 6P: +%25 Güç, %3 HP Yenileme":""}
    </div>
  </div>`).join(""):`<p class="mu" style="font-size:10px">Aynı bölgeden 2, 4 veya 6 parça kuşanarak set bonusu aç.</p>`;
  content=`<div class="cd"><div class="ct">Ekipman Yuvaları <span class="mu" style="font-size:10px">İncelemek için dokun</span></div><div class="eg">${eq}</div></div>
  <div class="cd"><div class="ct">Aktif Set Bonusları</div>${setHtml}</div>`;
}else if(charSub=="build"){
  content=`${statsHTML()}${skillsHTML()}`;
}else if(charSub=="titles"){
  const titleHtml=TITLES.map(t=>{
    const unl=t.chk(P),isEq=P.title==t.id;
    return`<div class="q" style="padding:6px 8px;margin-bottom:5px;opacity:${unl?1:.45};border:1px solid ${isEq?"var(--gold)":"transparent"}">
      <div style="flex:1"><b>${unl?"🏅":"🔒"} ${t.n}</b> <span class="g" style="font-size:10px">(${t.bonus})</span><div class="mu" style="font-size:10px">${t.desc}</div></div>
      ${unl?`<button class="btn ${isEq?"s":""}" style="padding:5px 9px;font-size:10px" onclick="equipTitle('${t.id}')">${isEq?"Aktif":"Seç"}</button>`:""}
    </div>`;
  }).join("");
  content=`<div class="cd"><div class="ct">🏅 Unvanlar <span class="mu" style="font-size:10px">Pasif bonus verir</span></div>${titleHtml}</div>`;
}else{
  content=`<div class="cd"><div class="ct">📊 Savaş & İlerleme Kayıtları</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">${box("Öldürme",s.k)}${box("Elit öldürme",s.e)}${box("Kadim eşya",s.l)}${box("En yüksek vuruş",s.d)}${box("Yenilgi",s.dm)}${box("Açılan bölge",Object.keys(P.boss).length+1+"/5")}</div>
  <button class="btn s" style="margin-top:8px;padding:8px;font-size:11px" onclick="resetGame()">${armed=="rs"?"Emin misin? Tekrar dokun":"Bu karakteri sıfırla"}</button></div>${typeof cloudHTML==="function"?cloudHTML():""}${backupHTML()}`;
}

v.innerHTML=headerCard+subNav+content;
}

function equipTitle(tid){P.title=tid;A.pot();sync();save();view();toast("Unvan kuşanıldı!")}
function resetGame(){if(armed!="rs"){armed="rs";view();return}const keepArt=P.art,keepName=P.name,keepCls=P.cls;P=NEW();P.art=keepArt;P.name=keepName;P.cls=keepCls;armed="";sync();daily();P.hp=P.maxHp;P.mp=P.maxMp;save();view();toast("Karakter sıfırlandı.")}

let bagFilter="all"; // "all" | "eq" | "stk" | "junk"
let bagSort="default"; // "default" | "grade" | "power" | "level" | "slot" | "name"
function setBagFilter(f){bagFilter=f;armed="";view()}
function setBagSort(s){bagSort=s;view()}

/* Stacklenen eşyalar (İksirler, Parşömenler, Sandıklar, Artı Basma & Ot/Öz Malzemeleri) */
const STACK_DEFS=[
  {key:"pot_hp_S",cat:"İksir (Küçük)",g:1,e:"🧪",n:"Küçük Can İksiri",desc:"Savaşta maksimum canın %25'ini yeniler.",get:()=>P.pot.hp.S||0,set:v=>P.pot.hp.S=v,sell:3,act:"usePot('hp','S')",actLbl:"İç (+%25 HP)"},
  {key:"pot_hp_M",cat:"İksir (Orta)",g:2,e:"🧪",n:"Orta Can İksiri",desc:"Savaşta maksimum canın %50'sini yeniler.",get:()=>P.pot.hp.M||0,set:v=>P.pot.hp.M=v,sell:8,act:"usePot('hp','M')",actLbl:"İç (+%50 HP)"},
  {key:"pot_hp_L",cat:"İksir (Büyük)",g:4,e:"🧪",n:"Büyük Can İksiri",desc:"Savaşta maksimum canın %85'ini yeniler.",get:()=>P.pot.hp.L||0,set:v=>P.pot.hp.L=v,sell:20,act:"usePot('hp','L')",actLbl:"İç (+%85 HP)"},
  {key:"pot_mp_S",cat:"İksir (Küçük)",g:1,e:"💧",n:"Küçük Mana İksiri",desc:"Savaşta maksimum mananın %30'unu yeniler.",get:()=>P.pot.mp.S||0,set:v=>P.pot.mp.S=v,sell:2,act:"usePot('mp','S')",actLbl:"İç (+%30 MP)"},
  {key:"pot_mp_M",cat:"İksir (Orta)",g:3,e:"💧",n:"Orta Mana İksiri",desc:"Savaşta maksimum mananın %60'ını yeniler.",get:()=>P.pot.mp.M||0,set:v=>P.pot.mp.M=v,sell:6,act:"usePot('mp','M')",actLbl:"İç (+%60 MP)"},
  {key:"pot_mp_L",cat:"İksir (Büyük)",g:4,e:"💧",n:"Büyük Mana İksiri",desc:"Savaşta maksimum mananın %95'ini yeniler.",get:()=>P.pot.mp.L||0,set:v=>P.pot.mp.L=v,sell:16,act:"usePot('mp','L')",actLbl:"İç (+%95 MP)"},
  {key:"scroll",cat:"Artı Basma",g:4,e:"📜",n:"Koruma Parşömeni",desc:"Demircide +6 ve üzeri yükseltmelerde eşyanın düşmesini ve kırılmasını önler.",get:()=>P.sc||0,set:v=>P.sc=v,sell:50,act:"go('forge')",actLbl:"Demirciye Git"},
  {key:"chest",cat:"Sandık",g:5,e:"🎁",n:"Hazine Sandığı",desc:"İçerisinden altın, iksir, Koruma Parşömeni veya en az GR-III ekipman çıkar.",get:()=>P.ch||0,set:v=>P.ch=v,sell:0,act:"chestUI()",actLbl:"Sandıkları Aç"},
  {key:"mat_kirik",cat:"Artı Basma",g:1,e:"⚙️",n:"Demir Kırığı",desc:"Demirci ocağında tüm +1 ile +15 yükseltmelerde kullanılan temel maden.",get:()=>P.mat.kirik||0,set:v=>P.mat.kirik=v,sell:2,act:"go('forge')",actLbl:"Ocakta Kullan"},
  {key:"mat_oz",cat:"Şifalı Ot",g:2,e:"🌿",n:"Yeşil Öz",desc:"Yenilenen yaratıklardan toplanan şifalı bitki özü. +5 üzeri yükseltmelerde kullanılır.",get:()=>P.mat.oz||0,set:v=>P.mat.oz=v,sell:4,act:"go('forge')",actLbl:"Ocakta Kullan"},
  {key:"mat_zehir",cat:"Simya Özü",g:2,e:"🧪",n:"Zehir Bezi",desc:"Zehirli canavarlardan çıkarılan kesecik. +5 üzeri yükseltmelerde kullanılır.",get:()=>P.mat.zehir||0,set:v=>P.mat.zehir=v,sell:4,act:"go('forge')",actLbl:"Ocakta Kullan"},
  {key:"mat_zirh",cat:"Artı Basma",g:2,e:"🪨",n:"Zırh Parçası",desc:"Zırhlı düşmanlardan kırılan sert plaka. +5 üzeri yükseltmelerde kullanılır.",get:()=>P.mat.zirh||0,set:v=>P.mat.zirh=v,sell:4,act:"go('forge')",actLbl:"Ocakta Kullan"},
  {key:"mat_tuy",cat:"Simya Özü",g:2,e:"🪶",n:"Çevik Tüy",desc:"Çevik yaratıklardan düşen hafif tüy. +5 üzeri yükseltmelerde kullanılır.",get:()=>P.mat.tuy||0,set:v=>P.mat.tuy=v,sell:4,act:"go('forge')",actLbl:"Ocakta Kullan"},
  {key:"mat_kan",cat:"Artı Basma",g:4,e:"🩸",n:"Kan Kristali",desc:"+9 ve üzeri yüksek seviye yükseltmelerde gereken nadir kristal.",get:()=>P.mat.kan||0,set:v=>P.mat.kan=v,sell:15,act:"go('forge')",actLbl:"Ocakta Kullan"},
  {key:"mat_ruh",cat:"Artı Basma",g:5,e:"👻",n:"Elit Ruhu",desc:"Elit bosslardan ve Kadim eşya parçalamadan elde edilen saf ruh özü.",get:()=>P.mat.ruh||0,set:v=>P.mat.ruh=v,sell:25,act:"go('forge')",actLbl:"Ocakta Kullan"}
];

function getBagStacks(){
  return STACK_DEFS.map(d=>({...d,qty:d.get()})).filter(x=>x.qty>0);
}

function getSortedEquipIndices(){
  const arr=P.inv.map((it,idx)=>({it,idx}));
  const slotOrd=s=>SL.indexOf(s);
  if(bagSort=="grade"){
    arr.sort((a,b)=>(b.it.g-a.it.g)||(b.it.p-a.it.p)||(pw(b.it)-pw(a.it)));
  }else if(bagSort=="power"){
    arr.sort((a,b)=>pw(b.it)-pw(a.it));
  }else if(bagSort=="level"){
    arr.sort((a,b)=>(effLv(b.it)-effLv(a.it))||(b.it.g-a.it.g));
  }else if(bagSort=="slot"){
    arr.sort((a,b)=>(slotOrd(a.it.slot)-slotOrd(b.it.slot))||(b.it.g-a.it.g)||(pw(b.it)-pw(a.it)));
  }else if(bagSort=="name"){
    arr.sort((a,b)=>a.it.name.localeCompare(b.it.name,"tr"));
  }
  return arr;
}

function applyBagSortPermanent(){
  if(bagSort=="default"){
    // Varsayılan akıllı düzen: Önce sınıfına uygun en güçlüler, sonra nadirlik ve seviye
    P.inv.sort((a,b)=>((b.rc==P.cls)-(a.rc==P.cls))||(b.g-a.g)||(pw(b)-pw(a)));
    toast("🎒 Çanta akıllı sıraya göre düzenlendi!");
  }else{
    const sorted=getSortedEquipIndices().map(x=>x.it);
    P.inv=sorted;
    bagSort="default";
    toast("🎒 Sıralama kalıcı olarak uygulandı!");
  }
  save();view();
}

function bagCell(i,k,extra){const g=G[i.g],ok=i.rc==P.cls;return`<div class="bc g${i.g} ${ok?"":"mm"} ${extra||""}" onclick="${k}"><span class="cl" style="color:${ok?"#4ade80":"#f87171"}">${CL[i.rc].n.slice(0,3)}</span>${better(i)?'<span style="position:absolute;top:2px;left:50%;transform:translateX(-50%);color:#4ade80;font-size:9px;font-weight:900">▲</span>':""}<span class="pl">+${i.p}</span>${ico(i.slot)}<span style="color:${g.c};font-weight:700;font-size:7px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;width:100%">${i.name}</span></div>`}
function stackCell(st){return`<div class="bc g${st.g}" onclick="${st.key=="chest"?"chestUI()":`inspStack('${st.key}')`}"><span class="cl" style="color:#cbd5e1">${st.cat.slice(0,4)}</span><span class="stk-cnt">×${st.qty}</span><span class="stk-ico">${st.e}</span><span style="color:${G[st.g].c};font-weight:700;font-size:7px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;width:100%">${st.n}</span></div>`}

function cBag(v){
const stacks=getBagStacks();
let eqList=getSortedEquipIndices();
if(bagFilter=="junk")eqList=eqList.filter(x=>junk(x.it));
else if(bagFilter=="stk")eqList=[];

const showStacks=(bagFilter=="all"||bagFilter=="stk")?stacks:[];
const cellsHtml=[];
showStacks.forEach(st=>cellsHtml.push(stackCell(st)));
eqList.forEach(entry=>cellsHtml.push(bagCell(entry.it,`insp(${entry.idx})`)));

// En az 5x5 (25 yuva) görünür, fazlası 5'li satırlar halinde aşağı kaydırılarak kullanılır
const totalSlots=Math.max(25,Math.ceil(cellsHtml.length/5)*5);
for(let n=cellsHtml.length;n<totalSlots;n++){
  cellsHtml.push(`<div class="bc" style="opacity:.18"></div>`);
}

const cnt=P.inv.filter(junk).length;
const totalBagCount=P.inv.length+stacks.length;

v.innerHTML=`<div class="cd" style="padding:9px">
<div class="ct" style="margin-bottom:6px">
  <span>🎒 Sırt Çantası <span class="mu" style="font-size:10px;font-weight:600">(5×5 Görünüm)</span></span>
  <span class="g" style="font-size:11px">Ekipman: ${P.inv.length}/50 · Yığın: ${stacks.length}</span>
</div>
<div class="sub-tabs" style="margin-bottom:6px">
  <button class="sub-tab ${bagFilter=="all"?"act":""}" onclick="setBagFilter('all')">Tümü (${totalBagCount})</button>
  <button class="sub-tab ${bagFilter=="eq"?"act":""}" onclick="setBagFilter('eq')">Ekipman (${P.inv.length})</button>
  <button class="sub-tab ${bagFilter=="stk"?"act":""}" onclick="setBagFilter('stk')">Yığın (${stacks.length})</button>
  <button class="sub-tab ${bagFilter=="junk"?"act":""}" onclick="setBagFilter('junk')">Çöp (${cnt})</button>
</div>
<div class="sort-bar">
  <select class="sort-sel" onchange="setBagSort(this.value)">
    <option value="default" ${bagSort=="default"?"selected":""}>Sıralama: Varsayılan (Yığınlar Üstte)</option>
    <option value="grade" ${bagSort=="grade"?"selected":""}>Nadirlik (Elit → Sıradan)</option>
    <option value="power" ${bagSort=="power"?"selected":""}>Güç Puanı (Yüksek → Düşük)</option>
    <option value="level" ${bagSort=="level"?"selected":""}>Seviye Şartı (Yüksek → Düşük)</option>
    <option value="slot" ${bagSort=="slot"?"selected":""}>Yuva Türü (Silah → Yüzük)</option>
    <option value="name" ${bagSort=="name"?"selected":""}>İsim (A → Z)</option>
  </select>
  <button class="sort-btn" onclick="applyBagSortPermanent()">⇅ Düzenle</button>
</div>
<div class="bag-5x5">${cellsHtml.join("")}</div>
<div class="r" style="gap:6px;margin-top:8px">
  <button class="btn d" style="flex:1;padding:8px;font-size:11.5px" ${cnt?"":"disabled"} onclick="bulk()">${armed=="bk"?"Onayla: Sat ("+cnt+")":"🪙 Toplu Sat ("+cnt+")"}</button>
  <button class="btn em2" style="flex:1;padding:8px;font-size:11.5px" ${cnt?"":"disabled"} onclick="bulkSalvage()">${armed=="sv"?"Onayla: Parçala ("+cnt+")":"🔨 Toplu Parçala ("+cnt+")"}</button>
</div>
<p class="mu" style="font-size:9px;margin-top:5px">İksir, sandık, ot ve artı basma malzemeleri tek yuvada toplanır (50 ekipman sınırından yer kaplamaz).</p></div>`}

const junk=i=>i.g<=2||(i.rc!=P.cls&&i.g<=3);
const sellV=i=>3+i.rl*2+i.p*3+i.g*i.rl;

function salvageYield(i){
  const out={kirik:Math.max(1,Math.floor(i.rl/4)+i.g+i.p)};
  const regIdx=Math.min(3,Math.floor((i.rl-1)/10));
  const regMat=NT[regIdx]||"zehir";
  if(i.g>=2||i.rl>=11)out[regMat]=Math.max(1,Math.floor(i.g/2));
  if(i.g>=4)out.kan=i.g-3;
  if(i.g==5)out.ruh=1+Math.floor(i.p/5);
  return out;
}

function salvageItem(n){
  const i=P.inv[n];if(!i)return;
  const y=salvageYield(i);
  Object.entries(y).forEach(([k,v])=>{P.mat[k]=(P.mat[k]||0)+v;ev("mat",v)});
  P.inv.splice(n,1);
  A.hit();closeM();hud();save();view();
  toast("🔨 Parçalandı: "+Object.entries(y).map(([k,v])=>MT[k][0]+"+"+v).join(" "));
}

function bulk(){const l=P.inv.filter(junk);if(armed!="bk"){armed="bk";view();return}let t=0;l.forEach(i=>t+=sellV(i));P.inv=P.inv.filter(i=>!junk(i));P.gold+=t;armed="";toast("Satıldı: +"+t+" 🪙");hud();save();view()}

function bulkSalvage(){
  const l=P.inv.filter(junk);if(!l.length)return;
  if(armed!="sv"){armed="sv";view();return}
  const tot={};
  l.forEach(i=>{
    const y=salvageYield(i);
    Object.entries(y).forEach(([k,v])=>{tot[k]=(tot[k]||0)+v;P.mat[k]=(P.mat[k]||0)+v;ev("mat",v)});
  });
  P.inv=P.inv.filter(i=>!junk(i));
  armed="";A.hit();hud();save();view();
  toast("🔨 Parçalandı: "+Object.entries(tot).map(([k,v])=>MT[k][0]+"+"+v).join(" "));
}

const open=r=>(r==0||P.boss[r-1])&&P.lv>=RG[r].req;
let mapReg=-1;
function setMapReg(ri){mapReg=ri;view()}
function cMap(v){
  if(mapReg<0){
    let best=0;
    for(let i=0;i<RG.length;i++)if(open(i))best=i;
    mapReg=best;
  }
  const regTabs=RG.map((r,ri)=>{
    const o=open(ri),act=mapReg===ri;
    return`<button class="sub-tab ${act?"act":""}" style="padding:5px 2px;font-size:10px;opacity:${o?1:.55}" onclick="setMapReg(${ri})">${o?"":"🔒"}B${ri+1} <span style="font-size:8.5px;opacity:.8">Lv.${r.req}</span></button>`;
  }).join("");

  const r=RG[mapReg],o=open(mapReg);
  const why=P.lv<r.req?"🔒 Gerekli Seviye: Lv."+r.req:(!o?"🔒 Önce "+RG[mapReg-1].mobs[3].name+" yen":"✅ Bölge Açık");

  v.innerHTML=`
    <div class="cd" style="background:linear-gradient(135deg,#3b1d6e66,var(--pn));padding:9px 11px">
      <div class="r" style="gap:8px">
        <div>
          <div class="ct" style="margin-bottom:2px">🗼 Sonsuz Kule <span class="g" style="font-size:11px;margin-left:6px">Rekor: Kat ${P.tw}</span></div>
          <div class="mu" style="font-size:10px">Her 5 katta bir Boss ve 🎁 Hazine Sandığı</div>
        </div>
        <button class="btn v" style="width:auto;padding:8px 12px;font-size:11.5px;flex-shrink:0" onclick="startCombat(0,0,0,${P.tw+1})">Kat ${P.tw+1}’e Çık</button>
      </div>
    </div>
    <div class="sub-tabs" style="margin-bottom:8px">${regTabs}</div>
    <div class="rg ${o?"":"lk"}" style="margin-bottom:0">
      <div class="bn">${banner(r.h)}</div>
      <div class="ri" style="padding:11px">
        <div class="r">
          <div>
            <div class="nm" style="font-size:16px">${r.n}</div>
            <div style="font-size:10px;color:#cbd5e1">Maden & Set: <b class="g">${r.ore}</b> (Taban Güç ${r.pw})</div>
          </div>
          <span style="font-size:10px;font-weight:800;color:${o?"#4ade80":"#f87171"}">${why}</span>
        </div>
        <div class="mg" style="margin-top:10px;gap:7px">
          ${r.mobs.map(m=>`<button class="mb" style="padding:7px" ${o?"":"disabled"} onclick="startCombat(${mapReg},${m.mi})">${mobSVG(m)}<div><div style="font-size:11.5px;font-weight:700;color:${m.el?"var(--gold)":"#fff"}">${m.el?"👑 ":""}${m.name}</div><div style="font-size:9.5px;color:#cbd5e1">Lv.${m.lv} · ${m.hp.toLocaleString()} HP</div></div></button>`).join("")}
        </div>
      </div>
    </div>
  `;
}

/* ---------- DEMİRCİ ---------- */
function cForge(v){let src="";const mk=(i,k)=>`<div class="bc g${i.g} ${SF===i?"sel":""}" onclick="${k}"><span class="pl">+${i.p}</span>${ico(i.slot)}<span style="color:${G[i.g].c};font-size:7px;font-weight:700">${i.name}</span></div>`;
if(fsrc=="eq")SL.forEach(k=>{if(P.eq[k])src+=mk(P.eq[k],`selF('${k}')`)});else P.inv.forEach((i,n)=>src+=mk(i,`selF(${n})`));
let act=`<p class="mu" style="font-size:11px;text-align:center;padding:14px">Yükseltmek için bir eşya seç.</p>`;
if(SF){const i=SF,cost=8+i.rl*6+i.p*14,ch=i.p>=10?30-(i.p-10)*4:100-i.p*6,ne=i.g==5?Math.min(50,i.rl+(i.p+1)*2):i.rl;
const aff=(i.af||[]).map((a,n)=>`<div class="q"><span>✨ ${a.n} (+%${a.v})</span><button class="btn ${a.l?"":"s"}" onclick="lockA(${n})">${a.l?"🔒 Kilitli":"Açık"}</button></div>`).join("");
act=`<div style="border-top:1px solid var(--ln);margin-top:12px;padding-top:12px"><div class="r"><div><b style="color:${G[i.g].c}">${i.name} +${i.p}</b><div class="mu" style="font-size:10px">${G[i.g].n} · Gerekli Lv.${effLv(i)} · Başarı %${ch}</div></div><b class="g" style="font-size:11px">${cost} 🪙</b></div>
${i.g==5?`<div class="q" style="color:var(--gold)">👑 +${i.p+1} olunca seviye şartı Lv.${effLv(i)} → Lv.${ne}${ne>P.lv?" (kuşanılamaz olur, bonusu pasifleşir!)":""}</div>`:""}
<p class="mu" style="font-size:10px;margin:6px 0">+6 üstü başarısızlıkta eşya düşebilir (+10 üstü kırılabilir). Koruma parşömenin: <b class="g">${P.sc}</b></p>
${needHTML(i.p)}<button class="btn" onclick="upg()">Ocakta yükselt (+${i.p+1})</button>
${aff?`<div class="ct" style="margin-top:12px;font-size:12px;color:#c084fc">Efsun dönüştürücü</div>${aff}<button class="btn v" onclick="reroll()">Efsunları çevir (45 🪙)</button>`:""}</div>`}
v.innerHTML=`<div class="cd"><div class="ct">Demirci ocağı <span class="g" style="font-size:11px">+15 sınırı</span></div><div class="mu" style="font-size:10px;margin-bottom:8px">${matLine()}</div>
<div class="pr" style="margin:0 0 10px"><button style="${fsrc=="eq"?"border-color:var(--gold);color:var(--gold)":""}" onclick="fsrc='eq';SF=null;view()">Kuşanılanlar</button><button style="${fsrc=="bag"?"border-color:var(--gold);color:var(--gold)":""}" onclick="fsrc='bag';SF=null;view()">Çantadakiler</button></div>
<div class="bg5" style="max-height:170px;overflow:auto">${src||'<p class="mu" style="font-size:10px">Eşya yok.</p>'}</div>${act}</div>`}
function selF(k){SF=fsrc=="eq"?P.eq[k]:P.inv[k];view()}
function rm(i){SL.forEach(k=>{if(P.eq[k]===i)P.eq[k]=null});const n=P.inv.indexOf(i);if(n>-1)P.inv.splice(n,1)}
function upg(){const i=SF;if(!i)return;if(i.p>=15)return toast("Maksimum +15");const cost=8+i.rl*6+i.p*14,nd=need(i.p);if(!hasMat(nd))return toast("Yetersiz malzeme");if(P.gold<cost)return toast("Yetersiz altın");P.gold-=cost;useMat(nd);
const ch=i.p>=10?30-(i.p-10)*4:100-i.p*6;
if(R(100)<=ch){i.p++;P.st.fok=(P.st.fok||0)+1;ev("fok");A.crit();toast("🔥 Başarılı! +"+i.p)}else{A.hit();
 if(i.p>=6&&Math.random()<(i.p>=10?.25:.4)){if(P.sc>0){P.sc--;toast("📜 Parşömen eşyanı korudu")}else if(i.p>=10){rm(i);SF=null;toast("💥 Eşya ocakta parçalandı!")}else{i.p--;toast("Başarısız: eşya +"+i.p+" seviyesine düştü")}}else toast("Başarısız, seviye atlamadı")}
sync();save();view()}
function lockA(n){SF.af[n].l=!SF.af[n].l;save();view()}
function reroll(){if(P.gold<45)return toast("Yetersiz altın");P.gold-=45;SF.af.forEach(a=>{if(!a.l)a.v=RI(1,10)});A.pot();toast("Efsunlar yenilendi");sync();save();view()}

/* ---------- ŞEHİR & YETENEK ---------- */
function qp(q){return P.q[q.id]||(P.q[q.id]={p:0,c:0})}
let citySub="shop"; // "shop" | "alch"
function setCitySub(s){citySub=s;armed="";view()}
function cCity(v){
const subNav=`<div class="sub-tabs">
  <button class="sub-tab ${citySub=="shop"?"act":""}" onclick="setCitySub('shop')">🏪 Tüccar Maren</button>
  <button class="sub-tab ${citySub=="alch"?"act":""}" onclick="setCitySub('alch')">⛲ Pınar & Simyacı</button>
</div>`;
const alchHtml=`
  <div class="cd" style="background:linear-gradient(135deg,#12305a66,var(--pn))">
    <div class="ct">⛲ Yaşam Pınarı <span style="color:#38bdf8;font-size:11px">Ücretsiz</span></div>
    <p class="mu" style="font-size:11px;margin-bottom:8px">Can ve manayı tamamen yeniler.</p>
    <button class="btn b" onclick="fount()">Pınardan İç</button>
  </div>
  <div class="cd">
    <div class="ct">🧪 Simyacı — Can İksirleri <span class="mu" style="font-size:10px">Çanta: ${P.pot.hp.S}K · ${P.pot.hp.M}O · ${P.pot.hp.L}B</span></div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;text-align:center;margin-bottom:9px">
      ${["S","M","L"].map(sz=>{const d=POT_DEF.hp[sz];return`<div class="q" style="display:block;margin:0;padding:7px 4px;border:1px solid ${G[d.g].c}44"><b style="color:${G[d.g].c};font-size:10.5px">${d.sz} Can</b><div class="mu" style="font-size:9.5px">+%${Math.round(d.pct*100)} HP · <span style="color:#fff">×${P.pot.hp[sz]||0}</span></div><button class="btn" style="margin-top:5px;padding:6px;font-size:11px" ${P.gold>=d.cost?"":"disabled"} onclick="buy('hp',${d.cost},'${sz}')">${d.cost} 🪙</button></div>`}).join("")}
    </div>
    <div class="ct">💧 Simyacı — Mana İksirleri <span class="mu" style="font-size:10px">Çanta: ${P.pot.mp.S}K · ${P.pot.mp.M}O · ${P.pot.mp.L}B</span></div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;text-align:center;margin-bottom:9px">
      ${["S","M","L"].map(sz=>{const d=POT_DEF.mp[sz];return`<div class="q" style="display:block;margin:0;padding:7px 4px;border:1px solid ${G[d.g].c}44"><b style="color:${G[d.g].c};font-size:10.5px">${d.sz} Mana</b><div class="mu" style="font-size:9.5px">+%${Math.round(d.pct*100)} MP · <span style="color:#fff">×${P.pot.mp[sz]||0}</span></div><button class="btn b" style="margin-top:5px;padding:6px;font-size:11px" ${P.gold>=d.cost?"":"disabled"} onclick="buy('mp',${d.cost},'${sz}')">${d.cost} 🪙</button></div>`}).join("")}
    </div>
    <div class="q" style="margin:0;padding:8px 10px">
      <div><b style="color:#c084fc">📜 Koruma Parşömeni</b> <span class="mu">(Çanta: ×${P.sc})</span><div class="mu" style="font-size:9.5px">+6 ve üzeri yükseltmelerde kırılmayı/düşmeyi önler</div></div>
      <button class="btn v" style="width:auto;padding:7px 12px;font-size:11px" ${P.gold>=150?"":"disabled"} onclick="buy('sc',150)">150 🪙</button>
    </div>
  </div>`;
v.innerHTML=subNav+(citySub=="shop"?shopHTML():alchHtml);
}
function claim(id){const q=QS.find(x=>x.id==id),s=qp(q);if(s.c||s.p<q.n)return;s.c=1;P.gold+=q.g;P.sc+=q.sc;A.lvl();toast("Görev ödülü: +"+q.g+" 🪙"+(q.sc?" +📜":""));hud();save();view()}
function fount(){P.hp=P.maxHp;P.mp=P.maxMp;A.pot();hud();save();toast("Can ve mana doldu")}
function buy(t,c,sz="S"){if(P.gold<c)return toast("Yetersiz altın");P.gold-=c;if(t=="sc")P.sc++;else P.pot[t][sz]=(P.pot[t][sz]||0)+1;A.pot();hud();save();view();toast("Satın alındı")}
function cSkills(v){v.innerHTML=skillsHTML()}
function upSk(i){if(P.sp<=0)return;P.sp--;P.sr[i]=(P.sr[i]||0)+1;A.lvl();save();view()}

/* ---------- EŞYA İNCELEME ---------- */
function insp(n){const i=P.inv[n];if(!i)return;const ok=i.rc==P.cls,el=effLv(i),cur=P.eq[i.slot],sy=salvageYield(i);
const syTxt=Object.entries(sy).map(([k,v])=>MT[k][0]+"+"+v).join(" ");
$("ic").innerHTML=`<div style="text-align:center;margin-bottom:10px"><b style="color:${G[i.g].c};font-size:15px">${i.name} +${i.p}</b><div class="mu" style="font-size:11px">${G[i.g].n} ${G[i.g].t} · ${SN[i.slot]} (${i.setOre||i.name.split(" ")[0]} Seti)</div></div>
<div class="q" style="display:block;line-height:1.6">Sınıf: <b style="color:${ok?"#4ade80":"#f87171"}">${CL[i.rc].n}</b><br>Seviye: <b style="color:${P.lv>=el?"#4ade80":"#f87171"}">Lv.${el}</b> (sen: ${P.lv})<br>Güç: <b class="g">${pw(i)}</b>${cur?` <span class="mu">(kuşanılan: ${pw(cur)})</span>`:""}${(i.af||[]).map(a=>`<br><span style="color:#c084fc">✨ ${a.n} +%${a.v}</span>`).join("")}</div>
<div style="display:grid;grid-template-columns:2fr 1fr 1fr;gap:6px">
  <button class="btn" ${ok&&P.lv>=el?"":"disabled"} onclick="equip(${n})">${!ok?"Uyumsuz":P.lv<el?"Lv."+el:"Kuşan"}</button>
  <button class="btn em2" onclick="salvageItem(${n})">🔨 ${syTxt}</button>
  <button class="btn d" onclick="sell(${n})">${sellV(i)}🪙</button>
</div>
<button class="btn s" style="margin-top:8px" onclick="closeM()">Kapat</button>`;$("im").style.display="flex"}
function inspEq(k){const i=P.eq[k];$("ic").innerHTML=`<div style="text-align:center;margin-bottom:10px"><b style="color:${G[i.g].c}">${i.name} +${i.p}</b><div class="mu" style="font-size:11px">Güç ${pw(i)} · ${i.setOre||i.name.split(" ")[0]} Seti${effLv(i)>P.lv?" · seviye yetersiz, pasif":""}</div></div><button class="btn" onclick="unequip('${k}')">Çantaya çıkar</button><button class="btn s" style="margin-top:8px" onclick="closeM()">Kapat</button>`;$("im").style.display="flex"}

function inspStack(key){
  const st=STACK_DEFS.find(x=>x.key===key);if(!st)return;
  const qty=st.get();if(qty<=0){closeM();view();return}
  $("ic").innerHTML=`
    <div style="text-align:center;margin-bottom:10px">
      <div style="font-size:38px;margin-bottom:4px">${st.e}</div>
      <b style="color:${G[st.g].c};font-size:15px">${st.n} <span style="color:#fff">×${qty}</span></b>
      <div class="mu" style="font-size:11px">${st.cat} · Yığınlanabilir Eşya</div>
    </div>
    <div class="q" style="display:block;line-height:1.55">${st.desc}</div>
    <div style="display:grid;grid-template-columns:${st.sell>0?"2fr 1fr":"1fr"};gap:6px">
      <button class="btn" onclick="${st.act}">${st.actLbl}</button>
      ${st.sell>0?`<button class="btn d" onclick="sellStack('${st.key}',1)">1 Sat (${st.sell}🪙)</button>`:""}
    </div>
    <button class="btn s" style="margin-top:8px" onclick="closeM()">Kapat</button>`;
  $("im").style.display="flex";
}

function usePot(t,sz="S"){
  const def=POT_DEF[t][sz];
  if((P.pot[t][sz]||0)<=0)return toast("Bu iksirden kalmadı");
  if(t=="hp"&&P.hp>=P.maxHp)return toast("Canın zaten tamamen dolu!");
  if(t=="mp"&&P.mp>=P.maxMp)return toast("Manan zaten tamamen dolu!");
  P.pot[t][sz]--;A.pot();ev("pot");
  if(t=="hp"){const r=Math.floor(P.maxHp*def.pct);P.hp=Math.min(P.maxHp,P.hp+r);toast(`🧪 ${def.n} içildi: +${r} HP`)}
  else{const r=Math.floor(P.maxMp*def.pct);P.mp=Math.min(P.maxMp,P.mp+r);toast(`💧 ${def.n} içildi: +${r} MP`)}
  hud();save();
  if((P.pot[t][sz]||0)>0)inspStack("pot_"+t+"_"+sz);else{closeM();view()}
}

function sellStack(key,cnt){
  const st=STACK_DEFS.find(x=>x.key===key);if(!st)return;
  const cur=st.get();if(cur<cnt)return;
  st.set(cur-cnt);
  P.gold+=st.sell*cnt;
  hud();save();toast("Satıldı: +"+(st.sell*cnt)+" 🪙");
  if(st.get()>0)inspStack(key);else{closeM();view()}
}
const closeM=()=>$("im").style.display="none";
function equip(n){const i=P.inv[n],o=P.eq[i.slot];P.eq[i.slot]=i;P.inv.splice(n,1);if(o)P.inv.push(o);closeM();sync();save();view();toast(i.name+" kuşanıldı")}
function unequip(k){if(P.inv.length>=50)return toast("Çanta dolu");P.inv.push(P.eq[k]);P.eq[k]=null;closeM();sync();save();view()}
function sell(n){const i=P.inv[n];P.gold+=sellV(i);P.inv.splice(n,1);closeM();hud();save();view()}

/* ---------- SAVAŞ ---------- */
let CB={on:false,auto:false,fast:false},aT=null;
function startCombat(ri,mi,keep,tw){const m=tw?towerMob(tw):{...RG[ri].mobs[mi]};m.tr=m.el?"boss":["poison","armor","swift","regen","drain"][(m.ri+m.mi)%5];if(P.hp<=0)P.hp=1;
CB={...CB,on:true,over:false,busy:false,ri:m.ri,mi:m.mi,mob:m,tw:tw||0,pz:0,pzT:0,ph:0,armor:m.tr=="armor",sh:0,shT:0,dot:0,dotT:0,tele:false,stun:false,rage:false,log:keep?CB.log:[]};
view();if(!keep)lg("⚔️ <b>"+m.name+"</b> ile dövüş başladı!");upd()}
function lg(t){CB.log.unshift(t);if(CB.log.length>40)CB.log.pop();const b=$("lg");if(b)b.innerHTML=CB.log.map(x=>"<div>"+x+"</div>").join("")}
function combatUI(v){const m=CB.mob,c=CL[P.cls];
v.innerHTML=`<div class="cd mc" id="mc"><div class="bn" style="opacity:.55">${banner(RG[CB.ri].h)}</div><div class="rel"><div class="au"></div><div class="mav" id="mav">${mobSVG(m)}<div class="fl" id="fl"></div></div>
<div class="nm" style="font-size:16px;color:${m.el?"var(--gold)":"#fff"}">${m.el?"👑 ":""}${m.name} <span class="mu" style="font-size:11px;font-family:var(--bs)">Lv.${m.lv}</span></div>
<div class="bar" style="max-width:280px;margin:7px auto;height:11px"><i class="hpf" id="mh"></i><b id="mt"></b></div><div class="tb" id="tb"></div><div id="st" style="font-size:10px;min-height:14px"></div></div></div>
<div class="pr" style="margin:0;align-items:stretch">
  <div style="flex:1.25;display:flex;gap:2px">
    <button style="flex:1;padding:6px 2px" onclick="pot('hp')" id="ph"></button>
    <button style="width:24px;padding:0;font-size:9px;border-color:rgba(229,72,77,.5);color:#fca5a5" onclick="cycleSelPot('hp')" id="phs" title="Can iksiri boyutunu değiştir"></button>
  </div>
  <div style="flex:1.25;display:flex;gap:2px">
    <button style="flex:1;padding:6px 2px" onclick="pot('mp')" id="pm"></button>
    <button style="width:24px;padding:0;font-size:9px;border-color:rgba(59,130,246,.5);color:#93c5fd" onclick="cycleSelPot('mp')" id="pms" title="Mana iksiri boyutunu değiştir"></button>
  </div>
  <button style="flex:1" onclick="autoT()" id="pa"></button>
  <button style="flex:.9" onclick="CB.fast=!CB.fast;upd()" id="pf"></button>
  <button style="flex:.65" onclick="flee()">🏃</button>
</div>
<div id="auto-bar" style="display:none;background:rgba(230,180,80,.12);border:1px solid rgba(230,180,80,.35);border-radius:7px;padding:4px 8px;margin-top:5px;font-size:9.5px;justify-content:space-between;align-items:center"></div>
<div class="sg"><button class="sb" style="grid-column:span 2;text-align:center" onclick="act(-1)"><b style="justify-content:center">Temel saldırı · 0 MP</b></button>${c.sk.map((s,i)=>`<button class="sb" id="s${i}" onclick="act(${i})"><b><span>${s.n}</span><span style="color:#60a5fa">${s.mp}</span></b><small>${s.i?"⚡ ":""}${s.d}</small></button>`).join("")}</div>
<div class="log" id="lg"></div><div id="ov"></div>`;$("lg").innerHTML=CB.log.map(x=>"<div>"+x+"</div>").join("")}
function upd(){if(!CB.on||!$("mh"))return;const m=CB.mob;
$("mh").style.width=m.hp/m.mx*100+"%";$("mt").innerText=m.hp.toLocaleString()+" / "+m.mx.toLocaleString();
$("mc").classList.toggle("tl",!!CB.tele);const tb=$("tb");tb.style.display=CB.tele?"block":"none";tb.innerText="⚠️ AĞIR DARBE HAZIRLANIYOR! Kesinti yap!";
$("st").innerHTML=[TN[m.tr]||"",CB.pzT>0?"🤢 Zehir "+CB.pz+" ("+CB.pzT+")":"",CB.rage?"🔥 <b style=color:#f43f5e>ÖFKE</b>":"",CB.sh>0?"🛡️ Kalkan "+CB.sh+" ("+CB.shT+")":"",CB.dotT>0?(CB.dotN||"☠️ Etki")+" "+CB.dot+" ("+CB.dotT+")":"",CB.stun?"💫 Sersem":""].filter(Boolean).join(" · ");
CL[P.cls].sk.forEach((s,i)=>$("s"+i).disabled=P.mp<s.mp||CB.over);
const hSz=P.selPot.hp||"S",mSz=P.selPot.mp||"S";
const szTr={S:"K",M:"O",L:"B"};
$("ph").innerText=`🧪 ${P.pot.hp[hSz]||0}`;$("phs").innerText=szTr[hSz];
$("pm").innerText=`💧 ${P.pot.mp[mSz]||0}`;$("pms").innerText=szTr[mSz];
$("pa").innerText=CB.auto?"⏸ Oto":"▶ Oto";$("pf").innerText=CB.fast?"⏩ x2":"⏩ x1";
const ab=$("auto-bar");
if(ab){
  if(CB.auto){
    const hLbl=P.autoCfg.hp==="off"?"Kapalı":`${POT_DEF.hp[P.autoCfg.hp].sz} (×${P.pot.hp[P.autoCfg.hp]||0}) <%${P.autoCfg.hpThr}`;
    const mLbl=P.autoCfg.mp==="off"?"Kapalı":`${POT_DEF.mp[P.autoCfg.mp].sz} (×${P.pot.mp[P.autoCfg.mp]||0}) <%${P.autoCfg.mpThr}`;
    ab.style.display="flex";
    const skOn=(P.autoCfg.skills||[1,1,1,1]).filter(Boolean).length;
    ab.innerHTML=`<span>🤖 <b>Oto:</b> 🧪 ${hLbl} · 💧 ${mLbl} · ⚔️ ${skOn}/4 Skill</span><button class="btn s" style="width:auto;padding:2px 6px;font-size:9px;border:1px solid var(--gold)" onclick="openAutoSetup(true)">⚙️</button>`;
  }else ab.style.display="none";
}
hud()}
function fx(t,c){const f=$("fl");if(!f)return;const s=document.createElement("span");s.className="fn";s.style.cssText=`color:${c};left:${30+R(40)}%;top:${20+R(20)}%`;s.innerText=t;f.appendChild(s);setTimeout(()=>s.remove(),850)}
function shake(){const a=$("mav");if(!a)return;a.classList.add("sk");setTimeout(()=>a.classList.remove("sk"),250)}
function vig(){const e=$("vg");e.classList.add("h");setTimeout(()=>e.classList.remove("h"),200)}
function act(i){if(!CB.on||CB.over||CB.busy)return;const isBasic=i<0,c=CL[P.cls],s=isBasic?{n:"Temel saldırı",mp:0,m:1,dot:0}:c.sk[i],rk=isBasic?0:P.sr[i]||0,rm=(1+rk*.05)*(rk>=50?1.25:1);
if(P.mp<s.mp)return toast("Yetersiz mana!");P.mp-=s.mp;const d=D(),m=CB.mob;
if(!isBasic&&s.i&&CB.tele){CB.tele=false;CB.stun=true;CB.armor=false;A.int();lg("⚡ <b style=color:#e6b450>KESİNTİ!</b> Düşmanın hazırlığı bozuldu, tur kaybetti.");fx("KESİNTİ!","#e6b450")}
if(!isBasic&&s.heal){const h=Math.floor(P.maxHp*.45*(1+P.at.int*.01));P.hp=Math.min(P.maxHp,P.hp+h);A.pot();lg("💚 +"+h+" HP");fx("+"+h,"#22c55e")}
if(!isBasic&&s.sh){CB.sh=Math.floor(P.maxHp*.35*rm);CB.shT=3;lg("🛡️ Kalkan açtın ("+CB.sh+")")}
if(s.m>0){const ld=m.lv-P.lv,rng=isBasic?(.85+R(.30)):(.90+R(.20));let pen=ld>=3?Math.max(.25,1-(ld-2)*.12):1,x=Math.floor(d.atk*rng*s.m*rm*(1-m.def/(m.def+200))*pen),gl=ld>=5&&Math.random()<.4;if(gl)x=Math.floor(x*.35);
 const cr=s.crit||R(100)<d.cr;if(cr){x=Math.floor(x*1.8);A.crit();ev("crit")}else A.hit();if(CB.armor)x=Math.floor(x*.6);x=Math.max(5,x);m.hp=Math.max(0,m.hp-x);P.st.d=Math.max(P.st.d,x);ev("dmg",x);shake();fx(cr?"💥"+x:x,cr?"#e6b450":"#fff");
 lg((cr?"⚡ ":"")+(gl?"🛡️ ":"")+s.n+": <b style=color:#e5484d>"+x+"</b> hasar")}
if(!isBasic&&s.dot){CB.dot=Math.max(3,Math.floor(d.atk*.3*rm));CB.dotT=3;CB.dotN=P.cls=="tank"?"🩸 İç Kanama":P.cls=="mage"?"🔥 Yanma":P.cls=="archer"?"🧪 Zehir":P.cls=="assassin"?"🩸 Kanama":P.cls=="healer"?"✨ Kutsal Yanık":"☠️ Etki"}
upd();if(m.hp<=0){win();return}
CB.busy=true;setTimeout(mobTurn,CB.fast?120:380)}
function mobTurn(){CB.busy=false;if(!CB.on||CB.over)return;const m=CB.mob;
// 6 Parça Set Yenilenmesi
const regenSet=getActiveSets().find(s=>s.regenPct>0);
if(regenSet&&P.hp<P.maxHp){const rg=Math.max(5,Math.floor(P.maxHp*(regenSet.regenPct/100)));P.hp=Math.min(P.maxHp,P.hp+rg);lg("🌿 Set yenilemesi: +"+rg+" HP")}
if(m.tr=="regen")m.hp=Math.min(m.mx,m.hp+Math.floor(m.mx*.03));
if(CB.pzT>0){P.hp=Math.max(0,P.hp-CB.pz);CB.pzT--;lg("🤢 Zehir: <b style=color:#a3e635>"+CB.pz+"</b> hasar");if(P.hp<=0){upd();lose();return}}
if(CB.dotT>0){m.hp=Math.max(0,m.hp-CB.dot);CB.dotT--;lg((CB.dotN||"☠️ Etki")+": <b style=color:#a3e635>"+CB.dot+"</b> hasar");fx(CB.dot,"#a3e635");if(m.hp<=0){upd();win();return}}
if(m.el&&CB.ph<2&&m.hp<=m.mx*(CB.ph?.33:.66)){CB.ph++;CB.rage=true;m.atk=Math.floor(m.atk*1.3);lg("🔥 <b style=color:#f43f5e>"+m.name+" "+(CB.ph+1)+". faza geçti!</b> Daha sert vuruyor.");fx((CB.ph+1)+". FAZ!","#f43f5e")}
if(CB.stun){CB.stun=false;lg("💫 "+m.name+" sersemledi, saldıramadı.")}
else if(CB.tele){CB.tele=false;hit(Math.floor(m.atk*2.5),true)}
else if(R(1)<(CB.rage?.5:m.el?.38:.25)){CB.tele=true;lg("⚠️ <b style=color:#f43f5e>"+m.name+"</b> güçlü bir saldırı hazırlıyor!")}
else{hit(m.atk,false);if(m.tr=="swift"&&R(1)<.3)hit(Math.floor(m.atk*.6),false);if(m.tr=="poison"){CB.pz=Math.max(8,Math.floor(m.atk*.15));CB.pzT=3;lg("🤢 Zehirlendin!")}}
if(CB.shT>0&&--CB.shT==0)CB.sh=0;
upd();if(P.hp<=0)lose()}
function hit(a,t){const m=CB.mob,ld=m.lv-P.lv,ar=D().arm;a=Math.floor(a*(.90+R(.20)));if(ld>=3)a=Math.floor(a*(1+(ld-2)*.15));a=Math.max(8,Math.floor(a*(1-ar/(ar+180))));vig();
if(CB.sh>0){const b=Math.min(CB.sh,a);CB.sh-=b;a-=b;lg("🛡️ Kalkan <b style=color:#38bdf8>"+b+"</b> hasarı emdi")}
if(a>0){P.hp=Math.max(0,P.hp-a);if(m.tr=="drain")m.hp=Math.min(m.mx,m.hp+Math.floor(a*.5));A.hit();lg(t?"💥 <b style=color:#f43f5e>[AĞIR DARBE]</b> "+a+" hasar aldın!":"🩸 "+a+" hasar aldın")}}
function win(){CB.over=true;CB.busy=false;const m=CB.mob,g=RI(m.g[0],m.g[1]),x=killXp(m.xp,m.lv,P.lv);P.gold+=g;P.xp+=x;P.st.k++;P.stk++;dq(m);if(m.el){P.st.e++;if(!CB.tw)P.boss[m.ri]=true}
lg("🎉 <b>"+m.name+"</b> yenildi! +"+g+"🪙 "+(x?"+"+x+" XP":"(0 XP, seviye farkı)"));
QS.forEach(q=>{if(q.ri<0||(q.ri==m.ri&&q.mi==m.mi)){const s=qp(q);if(s.p<q.n){s.p++;if(s.p==q.n)toast("📜 Görev tamamlandı! Şehirden ödülünü al.")}}});
if(m.el&&!CB.tw&&m.ri<4&&!P.boss[m.ri+1])lg("🗝️ Yeni bölgenin kapısı açıldı!");
while(P.xp>=reqXp(P.lv)&&P.lv<50){const prevHp=P.maxHp,prevMp=P.maxMp;P.xp-=reqXp(P.lv);P.lv++;P.sp+=2;P.ap+=3;ev("lvl",P.lv);A.lvl();sync();const dHp=P.maxHp-prevHp,dMp=P.maxMp-prevMp;toast("🌟 Seviye "+P.lv+"! (+"+dHp+" HP, +"+dMp+" MP, +2 SP, +3 AP)");P.hp=P.maxHp;P.mp=P.maxMp}
if(R(1)<.16){const t=R(1)<.5?"hp":"mp",r=R(100),sz=r<65?"S":r<92?"M":"L",d=POT_DEF[t][sz];P.pot[t][sz]=(P.pot[t][sz]||0)+1;lg(`${d.e} 1× <b style=color:${G[d.g].c}>${d.n}</b> buldun`)}
matDrop(m);if(CB.tw){ev("tower",CB.tw);P.tw=Math.max(P.tw,CB.tw);if(CB.tw%5==0){P.ch++;lg("🎁 Kat ödülü: sandık!")}}if(m.el&&!CB.tw&&R(100)<50){P.ch++;lg("🎁 Elit sandığı düştü!")}if(m.el||R(100)<12)drop(m);
sync();save();upd();const o=$("ov");
if(o)o.innerHTML=`<div class="pr" style="margin-top:8px"><button class="btn" style="color:#000" onclick="${CB.tw?`startCombat(0,0,1,${CB.tw+1})`:`startCombat(${m.ri},${m.mi},1)`}">${CB.tw?"🗼 Sonraki kat":"⚔️ Tekrar savaş"}</button><button class="btn s" onclick="endC()">Harita</button>${P.ch?`<button class="btn s" onclick="chestUI()">🎁 ${P.ch}</button>`:""}</div>`;
if(CB.auto)setTimeout(()=>{if(CB.on&&CB.over&&CB.auto)startCombat(m.ri,m.mi,1,CB.tw?CB.tw+1:0)},CB.fast?400:800)}
function lose(){CB.over=true;stopAuto();const l=Math.floor(P.gold*.1);P.gold-=l;P.st.dm++;P.stk=0;P.hp=Math.max(1,Math.floor(P.maxHp*.3));CB.on=false;sync();save();toast("Yenildin! -"+l+" 🪙, şehirde uyandın");go("city")}
function endC(){CB.on=false;stopAuto();go("map")}
function flee(){CB.on=false;stopAuto();toast("Savaştan kaçtın");go("map")}
function cycleSelPot(t){
  const order=["S","M","L"];
  const cur=P.selPot[t]||"S";
  P.selPot[t]=order[(order.indexOf(cur)+1)%3];
  const d=POT_DEF[t][P.selPot[t]];
  toast(`${d.e} Seçili iksir: ${d.n} (+%${Math.round(d.pct*100)})`);
  save();upd();
}
function pot(t,szOverride){
  if(CB.over)return;
  const sz=szOverride||P.selPot[t]||"S";
  const d=POT_DEF[t][sz];
  if((P.pot[t][sz]||0)<=0){
    if(!szOverride)toast(`${d.n} kalmadı (yanındaki K/O/B tuşuyla boyut değiştir)`);
    return false;
  }
  if(t=="hp"&&P.hp>=P.maxHp){if(!szOverride)toast("Canın zaten tamamen dolu!");return false;}
  if(t=="mp"&&P.mp>=P.maxMp){if(!szOverride)toast("Manan zaten tamamen dolu!");return false;}
  P.pot[t][sz]--;A.pot();ev("pot");
  if(t=="hp"){
    const r=Math.floor(P.maxHp*d.pct);
    P.hp=Math.min(P.maxHp,P.hp+r);
    fx("+"+r,"#22c55e");
    lg(`🧪 ${d.n}: <b style=color:#4ade80>+${r} HP</b> (Kalan: ${P.pot.hp[sz]})`);
  }else{
    const r=Math.floor(P.maxMp*d.pct);
    P.mp=Math.min(P.maxMp,P.mp+r);
    fx("+"+r,"#38bdf8");
    lg(`💧 ${d.n}: <b style=color:#38bdf8>+${r} MP</b> (Kalan: ${P.pot.mp[sz]})`);
  }
  save();upd();
  return true;
}

/* oto savaş & iksir boyutu yapılandırması */
function autoT(){
  if(CB.auto){
    stopAuto();upd();toast("⏸ Otomatik savaş durduruldu");
  }else{
    openAutoSetup(false);
  }
}
function setAutoCfg(k,v){
  P.autoCfg[k]=v;
  save();
  openAutoSetup(CB.auto);
}
function toggleAutoSkill(idx){
  if(!Array.isArray(P.autoCfg.skills))P.autoCfg.skills=[1,1,1,1];
  P.autoCfg.skills[idx]=P.autoCfg.skills[idx]?0:1;
  save();
  openAutoSetup(CB.auto);
}
function setAllAutoSkills(val){
  P.autoCfg.skills=[val,val,val,val];
  save();
  openAutoSetup(CB.auto);
}
function openAutoSetup(alreadyRunning){
  const cfg=P.autoCfg;
  if(!Array.isArray(cfg.skills))cfg.skills=[1,1,1,1];
  const optBtn=(type,val,lbl,sub)=>`<button class="btn ${cfg[type]===val?"":"s"}" style="padding:6px 4px;font-size:10px;line-height:1.25;border:1px solid ${cfg[type]===val?"var(--gold)":"rgba(255,255,255,.15)"}" onclick="setAutoCfg('${type}','${val}')"><b>${lbl}</b><div style="font-size:8.5px;opacity:.85">${sub}</div></button>`;
  const thrBtn=(type,val)=>`<button class="btn ${cfg[type]===val?"":"s"}" style="padding:5px 2px;font-size:10px" onclick="setAutoCfg('${type}',${val})">%${val}</button>`;
  const sks=CL[P.cls].sk;
  const skGrid=sks.map((s,i)=>{
    const on=!!cfg.skills[i];
    return`<button class="btn ${on?"":"s"}" style="padding:6px 6px;font-size:10px;line-height:1.25;text-align:left;border:1px solid ${on?"#34d399":"rgba(255,255,255,.14)"};opacity:${on?1:.62}" onclick="toggleAutoSkill(${i})">
      <div class="r"><b>${on?"✅":"⛔"} ${s.n}</b><span style="font-size:9px;color:${on?"#000":"#60a5fa"};font-weight:800">${s.mp} MP</span></div>
      <div style="font-size:8.5px;opacity:.85;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${s.i?"⚡ ":""}${s.d}</div>
    </button>`;
  }).join("");
  $("ic").innerHTML=`
    <div style="text-align:center;margin-bottom:8px">
      <div style="font-size:26px">🤖</div>
      <b class="g" style="font-size:15px">Otomatik Savaş Ayarları</b>
      <div class="mu" style="font-size:10px">Kullanılacak yetenekleri ve iksir tercihlerini seç</div>
    </div>

    <div class="q" style="display:block;margin-bottom:7px">
      <div class="r" style="margin-bottom:5px">
        <b style="color:#34d399;font-size:11.5px">⚔️ Otomatik Kullanılacak Yetenekler</b>
        <div style="display:flex;gap:4px">
          <button class="btn s" style="width:auto;padding:2px 6px;font-size:9px" onclick="setAllAutoSkills(1)">Tümü Açık</button>
          <button class="btn s" style="width:auto;padding:2px 6px;font-size:9px" onclick="setAllAutoSkills(0)">Sadece Düz</button>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:5px">${skGrid}</div>
    </div>

    <div class="q" style="display:block;margin-bottom:7px">
      <div class="r" style="margin-bottom:5px"><b style="color:#f87171;font-size:11.5px">🧪 Can İksiri Boyutu</b><span class="mu" style="font-size:9.5px">Can %${cfg.hpThr} altına inince içer</span></div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:4px;margin-bottom:6px">
        ${optBtn("hp","off","Kullanma","Pasif")}
        ${["S","M","L"].map(sz=>{const d=POT_DEF.hp[sz];return optBtn("hp",sz,`${d.sz} (×${P.pot.hp[sz]||0})`,`+%${Math.round(d.pct*100)} HP`)}).join("")}
      </div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:4px">
        ${[25,40,55,70].map(v=>thrBtn("hpThr",v)).join("")}
      </div>
    </div>

    <div class="q" style="display:block;margin-bottom:10px">
      <div class="r" style="margin-bottom:5px"><b style="color:#60a5fa;font-size:11.5px">💧 Mana İksiri Boyutu</b><span class="mu" style="font-size:9.5px">Mana %${cfg.mpThr} altına inince içer</span></div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:4px;margin-bottom:6px">
        ${optBtn("mp","off","Kullanma","Pasif")}
        ${["S","M","L"].map(sz=>{const d=POT_DEF.mp[sz];return optBtn("mp",sz,`${d.sz} (×${P.pot.mp[sz]||0})`,`+%${Math.round(d.pct*100)} MP`)}).join("")}
      </div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:4px">
        ${[15,25,40,55].map(v=>thrBtn("mpThr",v)).join("")}
      </div>
    </div>

    <button class="btn" onclick="startAutoWithCfg()">${alreadyRunning?"✅ Ayarları Uygula":"▶ Otomatik Savaşı Başlat"}</button>
    <button class="btn s" style="margin-top:6px" onclick="closeM()">Vazgeç</button>
  `;
  $("im").style.display="flex";
}
function startAutoWithCfg(){
  closeM();
  if(!CB.auto){
    CB.auto=true;
    aT=setInterval(auto,CB.fast?450:850);
    if(CB.over)startCombat(CB.ri,CB.mi,1,CB.tw||0);
  }
  upd();
  toast("🤖 Otomatik savaş aktif!");
}
function stopAuto(){CB.auto=false;clearInterval(aT);aT=null}
function auto(){if(!CB.on||CB.over||CB.busy)return;
const cfg=P.autoCfg||{hp:"S",mp:"S",hpThr:40,mpThr:25,skills:[1,1,1,1]};
const skOn=Array.isArray(cfg.skills)?cfg.skills:[1,1,1,1];
if(P.hp<P.maxHp*(cfg.hpThr/100)){
  const hSz=pickBestAvailPot("hp",cfg.hp);
  if(hSz&&pot("hp",hSz))return;
  if(P.hp<P.maxHp*.18){lg("⛔ Oto savaş durdu: can kritik ve seçili iksir bitti");stopAuto();upd();return}
}
if(P.mp<P.maxMp*(cfg.mpThr/100)){
  const mSz=pickBestAvailPot("mp",cfg.mp);
  if(mSz&&pot("mp",mSz))return;
}
const sk=CL[P.cls].sk;
if(CB.tele){const k=sk.findIndex((s,i)=>skOn[i]&&s.i&&P.mp>=s.mp);if(k>-1)return act(k)}
if(CB.sh<=0&&CB.shT==0){const k=sk.findIndex((s,i)=>skOn[i]&&s.sh&&P.mp>=s.mp&&R(1)<.3);if(k>-1)return act(k)}
if(P.maxHp-P.hp>P.maxHp*.5){const k=sk.findIndex((s,i)=>skOn[i]&&s.heal&&P.mp>=s.mp);if(k>-1)return act(k)}
let b=-1,bm=0;sk.forEach((s,i)=>{if(skOn[i]&&!s.heal&&P.mp>=s.mp&&s.m*(1+(P.sr[i]||0)*.05)>bm&&s.mp<=P.mp*.6){bm=s.m;b=i}});
act(b)}

/* ---------- GANİMET ---------- */
function drop(m,fg){if(P.inv.length>=50){lg("⚠️ Çanta dolu, eşya kayboldu!");return}
const ks=Object.keys(CL),rc=R(1)<.6?P.cls:ks[RI(0,4)],si=RI(0,7),sl=SL[si],r=RG[m.ri];let g=1,x=R(100);
if(m.el)g=x<=2.5?5:x<=15?4:x<=40?3:x<=70?2:1;else g=x<=.4?5:x<=5?4:x<=18?3:x<=45?2:1;
if(fg)g=Math.max(g,fg);const ac=(()=>{const y=R(100);return y<=1?4:y<=5?3:y<=13?2:y<=28?1:0})(),P0=[["atk","Saldırı Gücü"],["def","Zırh Direnci"],["crit","Kritik Vuruş"]],af=[];
for(let n=0;n<ac;n++){const p=P0[RI(0,2)];af.push({t:p[0],n:p[1],v:RI(1,10),l:false})}
const it={name:r.ore+" "+CL[rc].it[si],setOre:r.ore,slot:sl,rc,rl:r.req,g,p:0,bp:r.pw,af};P.inv.push(it);P.st.l+=g==5?1:0;if(g>=3)ev("drop3");
if(g==5){A.elite();toast("👑 KADİM ELİT EŞYA: "+it.name+"!");lg("👑 <b style=color:#e6b450>[JACKPOT]</b> "+it.name)}else lg("📦 <b style=color:"+G[g].c+">"+it.name+" ["+G[g].t+"]</b>"+(rc==P.cls?" ✅":""))}

/* ---------- GÜNLÜK, SANDIK, KULE ---------- */
const TN={poison:"🤢 Zehirli",armor:"🪨 Zırhlı (kesinti kırar)",swift:"💨 Çevik",regen:"💚 Yenilenir",drain:"🧛 Can çalar",boss:"👑 Boss · 3 faz"};
const today=()=>new Date().toISOString().slice(0,10);
function daily(){const d=P.dl,t=today();if(d.d==t)return;const y=new Date(Date.now()-864e5).toISOString().slice(0,10);if(d.l!=y&&d.l!=t)d.s=0;d.d=t;d.c=0;
d.q=[{k:"any",n:15,g:60+P.lv*15},{k:"elite",n:2,g:100+P.lv*25,ch:1},{k:"tower",n:3,g:80+P.lv*20},[{k:"crit",n:12,g:90+P.lv*15},{k:"fok",n:2,g:100+P.lv*15,m:{kirik:5}},{k:"mat",n:12,g:80+P.lv*10},{k:"pot",n:3,g:70+P.lv*10}][RI(0,3)]].map(q=>({...q,p:0,c:0}));save()}
function offline(){const m=(Date.now()-(P.ts||Date.now()))/6e4;if(m<10)return;const h=Math.min(8,m/60),g=Math.floor(h*P.lv*12);P.gold+=g;if(h>=1)P.pot.hp.S=(P.pot.hp.S||0)+1;if(h>=4)P.ch++;
toast("Sen yokken +"+g+" 🪙"+(h>=1?" +🧪":"")+(h>=4?" +🎁":""));save();hud()}
function dailyHTML(){const d=P.dl,dn=d.c?((d.s-1)%7)+1:d.s%7,rw=["50","100","150","200","300","400","📜🎁"],lb={any:"canavar öldür",elite:"elit öldür",tower:"kule katı geç",crit:"kritik vuruş yap",fok:"başarılı yükseltme yap",mat:"malzeme topla",pot:"iksir kullan"};
return`<div class="cd" style="background:linear-gradient(135deg,#6b4a0a44,var(--pn))"><div class="ct">📅 Günlük giriş <span class="g" style="font-size:11px">Seri: ${d.s} gün</span></div>
<div style="display:flex;gap:4px;margin-bottom:9px">${rw.map((x,i)=>`<div style="flex:1;text-align:center;font-size:9px;padding:5px 0;border-radius:6px;background:${i<dn?"#34d39933":"#0006"}">${i+1}<br>${x}</div>`).join("")}</div>
<button class="btn" ${d.c?"disabled":""} onclick="claimD()">${d.c?"Bugünkü ödül alındı":"Giriş ödülünü al"}</button>
<div class="ct" style="margin:12px 0 6px;font-size:12px">Günlük görevler</div>${d.q.map((q,i)=>`<div class="q" style="cursor:pointer" onclick="goQ('${q.c||q.p>=q.n?"":q.k}')"><div style="flex:1"><b>${q.n}× ${lb[q.k]}</b><div class="mu">${q.g}🪙${q.ch?" + 🎁":""}</div><div class="pg"><i style="width:${q.p/q.n*100}%"></i></div></div>${q.c?'<span class="mu">Alındı</span>':`<button class="btn" ${q.p>=q.n?"":"disabled"} onclick="event.stopPropagation();claimDQ(${i})">${q.p}/${q.n}</button>`}</div>`).join("")}
${P.ch?`<button class="btn v" style="margin-top:6px" onclick="chestUI()">🎁 ${P.ch} sandık aç</button>`:""}</div>`}
function claimD(){const d=P.dl;if(d.c)return;const i=d.s%7,g=[50,100,150,200,300,400,500][i]*(1+Math.floor(P.lv/5));d.c=1;d.s++;d.l=today();P.gold+=g;if(i==6){P.sc++;P.ch++}A.lvl();toast("Giriş ödülü: +"+g+" 🪙"+(i==6?" +📜 +🎁":""));hud();save();view()}
function claimDQ(i){const q=P.dl.q[i];if(q.c||q.p<q.n)return;q.c=1;P.gold+=q.g;if(q.ch)P.ch++;Object.entries(q.m||{}).forEach(([k,n])=>P.mat[k]=(P.mat[k]||0)+n);A.lvl();toast("+"+q.g+" 🪙"+(q.ch?" +🎁":""));hud();save();view()}
function dq(m){P.dl.q.forEach(q=>{if(q.p<q.n&&(q.k=="any"||(q.k=="elite"&&m.el)||(q.k=="tower"&&CB.tw)))q.p++})}
let chOpenCnt=1;
function setChQty(n){
  chOpenCnt=Math.max(1,Math.min(P.ch||1,Math.floor(Number(n)||1)));
  const inp=$("ch-qty-inp"),rng=$("ch-qty-rng"),lbl=$("ch-open-lbl");
  if(inp)inp.value=chOpenCnt;
  if(rng)rng.value=chOpenCnt;
  if(lbl)lbl.innerText=`🎁 ${chOpenCnt} Sandık Aç`;
}
function chestUI(){
  if(P.ch<=0){closeM();view();return}
  chOpenCnt=Math.max(1,Math.min(P.ch,chOpenCnt||1));
  const freeBag=Math.max(0,50-P.inv.length);
  const presets=[1,5,10,25].filter(x=>x<P.ch);
  $("ic").innerHTML=`
    <div style="text-align:center">
      <div style="font-size:34px;margin-bottom:2px">🎁</div>
      <b class="g" style="font-size:15px">Hazine Sandığı Aç</b>
      <div class="mu" style="font-size:11px;margin:4px 0 10px">Mevcut: <b style="color:#fff">${P.ch} adet</b> · Boş ekipman yeri: <b style="color:${freeBag<5?"#f87171":"#4ade80"}">${freeBag}</b></div>
      <div class="q" style="display:block;padding:10px;margin-bottom:8px">
        <div class="r" style="margin-bottom:8px">
          <span class="mu" style="font-size:11px">Açılacak Adet:</span>
          <div style="display:flex;align-items:center;gap:6px">
            <button class="btn s" style="width:30px;padding:4px 0;font-size:14px" onclick="setChQty(chOpenCnt-1)">−</button>
            <input id="ch-qty-inp" type="number" min="1" max="${P.ch}" value="${chOpenCnt}" oninput="setChQty(this.value)" style="width:54px;text-align:center;background:#000;border:1px solid var(--gold);border-radius:6px;color:#fff;font-weight:800;font-size:13px;padding:4px">
            <button class="btn s" style="width:30px;padding:4px 0;font-size:14px" onclick="setChQty(chOpenCnt+1)">+</button>
          </div>
        </div>
        ${P.ch>1?`<input id="ch-qty-rng" type="range" min="1" max="${P.ch}" value="${chOpenCnt}" oninput="setChQty(this.value)" style="width:100%;accent-color:var(--gold);margin-bottom:8px;cursor:pointer">`:""}
        <div class="pr" style="margin-top:2px">
          ${presets.map(n=>`<button onclick="setChQty(${n})">${n} Adet</button>`).join("")}
          ${P.ch>1?`<button style="border-color:rgba(230,180,80,.5);color:var(--gold)" onclick="setChQty(${P.ch})">Tümü (${P.ch})</button>`:""}
        </div>
      </div>
      <button class="btn" id="ch-open-lbl" onclick="openChBulk(chOpenCnt)">🎁 ${chOpenCnt} Sandık Aç</button>
    </div>
    <button class="btn s" style="margin-top:8px" onclick="closeM();view()">Vazgeç</button>`;
  $("im").style.display="flex";
}
function openChBulk(count){
  const n=Math.max(1,Math.min(P.ch,Math.floor(Number(count)||1)));
  if(n<=0)return;
  CB.log=CB.log||[];
  let totGold=0,totSc=0,totHp=0,totMp=0,skippedEq=0;
  const items=[];
  for(let k=0;k<n;k++){
    P.ch--;ev("chest");
    const x=R(100);
    if(x<10){
      if(P.inv.length<50){
        drop(RG[Math.min(4,Math.floor((P.lv-1)/10))].mobs[0],3);
        items.push(P.inv[P.inv.length-1]);
      }else{
        skippedEq++;
        const g=RI(P.lv*20,P.lv*45)+40;
        P.gold+=g;totGold+=g;
      }
    }else if(x<17){
      P.sc++;totSc++;
    }else if(x<47){
      const rSz=R(100),sz=rSz<60?"S":rSz<90?"M":"L";
      P.pot.hp[sz]=(P.pot.hp[sz]||0)+2;P.pot.mp[sz]=(P.pot.mp[sz]||0)+2;totHp+=2;totMp+=2;
    }else{
      const g=RI(P.lv*25,P.lv*60)+50;
      P.gold+=g;totGold+=g;
    }
  }
  A.elite();hud();save();
  const lines=[];
  if(totGold>0)lines.push(`<div class="q" style="margin-bottom:4px"><span>🪙 Altın</span><b class="g">+${totGold.toLocaleString()} 🪙</b></div>`);
  if(totSc>0)lines.push(`<div class="q" style="margin-bottom:4px"><span>📜 Koruma Parşömeni</span><b style="color:#c084fc">+${totSc} adet</b></div>`);
  if(totHp>0)lines.push(`<div class="q" style="margin-bottom:4px"><span>🧪 Can & 💧 Mana İksiri</span><b style="color:#4ade80">+${totHp} 🧪 · +${totMp} 💧</b></div>`);
  items.forEach(it=>{
    lines.push(`<div class="q" style="margin-bottom:4px"><span>⚔️ ${SN[it.slot]}</span><b style="color:${G[it.g].c}">${it.name} [${G[it.g].t}]</b></div>`);
  });
  if(skippedEq>0)lines.push(`<div class="mu" style="font-size:10px;margin-top:4px">⚠️ Çanta dolu olduğu için ${skippedEq} ekipman altına dönüştürüldü.</div>`);
  chOpenCnt=Math.min(P.ch||1,n);
  $("ic").innerHTML=`
    <div style="text-align:center;margin-bottom:8px">
      <div style="font-size:36px">🎉</div>
      <b class="g" style="font-size:15px">${n} Hazine Sandığı Açıldı!</b>
      <div class="mu" style="font-size:10.5px">Kalan sandık: ${P.ch} adet</div>
    </div>
    <div style="max-height:44vh;overflow-y:auto;margin-bottom:8px">${lines.join("")}</div>
    ${P.ch>0?`<button class="btn" style="margin-bottom:6px" onclick="chestUI()">🎁 Tekrar Aç (Kalan: ${P.ch})</button>`:""}
    <button class="btn s" onclick="closeM();view()">Tamam</button>`;
}
function towerMob(f){const r=Math.min(4,Math.floor((P.lv-1)/10)),b=f%5==0,t=RG[r].mobs[b?3:f%3],s=1+f*.07;
return{...t,id:"t"+f,lv:Math.min(60,P.lv+Math.floor(f/4)),hp:Math.floor(t.hp*s),mx:Math.floor(t.hp*s),atk:Math.floor(t.atk*s),def:Math.floor(t.def*s),xp:Math.floor(t.xp*s*.6),el:b,name:(b?"Kule Muhafızı ":"")+t.name+" · Kat "+f}}
function towerCard(){return`<div class="cd" style="background:linear-gradient(135deg,#3b1d6e66,var(--pn))"><div class="ct">🗼 Sonsuz Kule <span class="g" style="font-size:11px">Rekor: Kat ${P.tw}</span></div><p class="mu" style="font-size:11px;margin-bottom:8px">Her kat zorlaşır. 5 katta bir boss ve sandık.</p><button class="btn v" onclick="startCombat(0,0,0,${P.tw+1})">Kat ${P.tw+1}’e çık</button></div>`}
const better=i=>i.rc==P.cls&&effLv(i)<=P.lv&&pw(i)>(P.eq[i.slot]?pw(P.eq[i.slot]):0);

/* ---------- NPC: TÜCCAR MAREN ---------- */
const shopR=()=>Math.min(4,Math.floor((P.lv-1)/10)),price=i=>sellV(i)*5+15;
function genShop(){const r=RG[shopR()];P.shop={d:today(),r:shopR(),c:P.cls,it:SL.map((sl,si)=>({name:r.ore+" "+CL[P.cls].it[si],setOre:r.ore,slot:sl,rc:P.cls,rl:r.req,g:1,p:0,bp:r.pw,af:[]}))};save()}
function shopHTML(){let s=P.shop;if(s.d!=today()||s.r!=shopR()||s.c!=P.cls){genShop();s=P.shop}
s.it.forEach(i=>{i.af=[];i.g=1});const n=SL.filter(k=>P.eq[k]).length,junkN=P.inv.filter(junk).length;
const line=!P.eq.weapon?"Silahsız mı geziyorsun evlat? Tezgâha bir göz at, ilk parçayı hemen kuşanırsın.":P.inv.length>=45?"Çantan dolmuş! Fazlalıkları bana sat, yer aç.":n<8?"Eksik parçaların var. İyi ekipman, uzun ömür demek.":"Hepsi üstünde, aferin. Yine de bak, yeni mallar geldi.";
const rows=s.it.map((i,k)=>{const c=price(i);return`<div class="q" style="padding:5px 8px;margin-bottom:4px"><div style="flex:1"><b style="color:${G[i.g].c};font-size:11px">${i.name}</b>${better(i)?' <span style="color:#4ade80;font-weight:900">▲</span>':""}<div class="mu" style="font-size:9.5px">${SN[i.slot]} · Güç ${pw(i)} · Lv.${i.rl}</div></div><button class="btn" style="padding:5px 9px;font-size:10.5px" ${P.gold>=c?"":"disabled"} onclick="buyShop(${k})">${c} 🪙</button></div>`}).join("");
return`<div class="cd" style="background:linear-gradient(135deg,#5a2e1033,var(--pn))"><div class="ct"><span>🏪 Tüccar Maren</span><span class="mu" style="font-size:10px">Her gün yeni mal</span></div>
<div style="display:flex;gap:10px;align-items:center;margin-bottom:10px"><div class="em" style="width:46px;height:46px;font-size:24px;flex-shrink:0">🧔</div><div class="q" style="margin:0;flex:1;font-style:italic">“${line}”</div></div>
${rows||'<p class="mu" style="font-size:11px;padding:8px">Tezgâh boş. Yenile.</p>'}
<div class="pr"><button onclick="reShop()">🔄 Malları yenile (80 🪙)</button><button ${junkN?"":"disabled"} onclick="bulk()">${armed=="bk"?"Onayla: sat":"Düşükleri sat ("+junkN+")"}</button></div></div>`}
function buyShop(k){const i=P.shop.it[k];if(!i)return;const c=price(i);if(P.gold<c)return toast("Yetersiz altın");if(P.inv.length>=50)return toast("Çanta dolu");
P.gold-=c;P.inv.push(i);P.shop.it.splice(k,1);A.pot();
if(!P.eq[i.slot]&&effLv(i)<=P.lv){equip(P.inv.length-1)}else{hud();save();view();toast(i.name+" çantana eklendi")}}
function reShop(){if(P.gold<80)return toast("Yetersiz altın");P.gold-=80;genShop();A.pot();hud();view()}

/* ---------- NİTELİKLER & YETENEKLER ---------- */
const CW={tank:{str:2.8,dex:.8,int:.2},mage:{str:.2,dex:.5,int:3.2},archer:{str:.5,dex:3.2,int:.3},assassin:{str:1.2,dex:2.8,int:.2},healer:{str:.5,dex:.3,int:2.4}};
const CP={tank:["vit","str"],mage:["int"],archer:["dex"],assassin:["dex"],healer:["int","vit"]};
const SD={str:["STR","Güç"],dex:["DEX","Çeviklik"],int:["INT","Zekâ"],vit:["VIT","Canlılık"]};
function statsHTML(){const c=CL[P.cls].b,w=CW[P.cls],bs={str:c.str,dex:c.agi,int:c.int,vit:c.vit},
ef={str:"+"+w.str+" saldırı, +0.4 zırh",dex:"+"+w.dex+" saldırı, +%0.25 kritik",int:"+"+w.int+" saldırı, +12 mana, şifa +%1",vit:"+18 can, +1.5 zırh"};
const tot=Object.values(P.at).reduce((a,b)=>a+b,0);
return`<div class="cd"><div class="ct">Nitelikler <span class="g" style="font-size:11px">Puan: ${P.ap}</span></div>
${Object.keys(SD).map(k=>`<div class="q"><div style="flex:1"><b>${SD[k][0]}${CP[P.cls].includes(k)?' <span class="g">★</span>':""}</b> <span class="mu">${SD[k][1]}</span> <b>${bs[k]+P.at[k]}</b><div class="mu">Taban ${bs[k]} + dağıtılan ${P.at[k]} · puan başı ${ef[k]}</div></div><button class="btn" style="width:auto;padding:6px 10px" ${P.ap>0?"":"disabled"} onclick="addStat('${k}',1)">+1</button><button class="btn s" style="width:auto;padding:6px 10px" ${P.ap>0?"":"disabled"} onclick="addStat('${k}',5)">+5</button></div>`).join("")}
<p class="mu" style="font-size:10px">★ sınıfının ana niteliği. Her seviye +3 puan verir.</p>
<button class="btn s" style="margin-top:8px" ${tot?"":"disabled"} onclick="respec()">${armed=="rp"?"Onayla: "+P.lv*30+" 🪙":"Puanları sıfırla ("+P.lv*30+" 🪙)"}</button></div>`}
function addStat(k,n){n=Math.min(n,P.ap);if(n<=0)return;P.at[k]+=n;P.ap-=n;A.pot();sync();save();view()}
function respec(){const c=P.lv*30;if(armed!="rp"){armed="rp";view();return}armed="";if(P.gold<c)return toast("Yetersiz altın");P.gold-=c;P.ap+=Object.values(P.at).reduce((a,b)=>a+b,0);P.at={str:0,dex:0,int:0,vit:0};sync();save();view();toast("Nitelikler sıfırlandı")}
function skillsHTML(){const c=CL[P.cls],d=D();
return`<div class="cd"><div class="ct">Yetenekler <span class="g" style="font-size:11px">SP: ${P.sp}</span></div>`+c.sk.map((s,i)=>{const r=P.sr[i]||0,t=r>=50?"S":r>=40?"A":r>=30?"B":r>=20?"C":r>=10?"D":"E",rm=(1+r*.05)*(r>=50?1.25:1),dm=s.m>0?" · ~"+Math.floor(d.atk*s.m*rm)+" hasar":s.heal?" · ~"+Math.floor(P.maxHp*.45*(1+P.at.int*.01))+" can":"";
return`<div class="q"><div style="flex:1"><b>${s.n}</b> <span class="g">[${t} · ${r}/50]</span><div class="mu">${s.d} · ${s.mp} MP${dm}</div></div><button class="btn" style="width:auto;padding:6px 10px" ${P.sp>0&&r<50?"":"disabled"} onclick="upSk(${i})">+1</button></div>`}).join("")+`</div>`}

/* ---------- MALZEME, GÖREV ÇEŞİTLİLİĞİ ---------- */
const MT={kirik:["⚙️","Demir Kırığı"],zehir:["🧪","Zehir Bezi"],zirh:["🪨","Zırh Parçası"],tuy:["🪶","Çevik Tüy"],oz:["🌿","Yeşil Öz"],kan:["🩸","Kan Kristali"],ruh:["👻","Elit Ruhu"]};
const TM={poison:"zehir",armor:"zirh",swift:"tuy",regen:"oz",drain:"kan"},NT=["zehir","zirh","tuy","oz"];
function need(p){if(p<5)return{kirik:2+p*2};const k=NT[p%4];if(p<9)return{kirik:6,[k]:2};if(p<12)return{kirik:8,[k]:3,kan:2,ruh:p-8};return{kirik:12,[k]:4,kan:p-9,ruh:p-8}}
const hasMat=n=>Object.keys(n).every(k=>(P.mat[k]||0)>=n[k]);
function useMat(n){Object.keys(n).forEach(k=>P.mat[k]-=n[k])}
function needHTML(p){if(p>=15)return"";return`<div class="q" style="flex-wrap:wrap;margin:6px 0">Gereken: ${Object.entries(need(p)).map(([k,n])=>`<b style="color:${(P.mat[k]||0)>=n?"#4ade80":"#f87171"}">${MT[k][0]}${MT[k][1]} ${P.mat[k]||0}/${n}</b>`).join(" · ")}</div>`}
const matLine=()=>Object.keys(MT).map(k=>MT[k][0]+" "+(P.mat[k]||0)).join(" &nbsp;");
function gm(k,n){P.mat[k]=(P.mat[k]||0)+n;ev("mat",n);lg(MT[k][0]+" +"+n+" "+MT[k][1])}
function matDrop(m){if(R(100)<65)gm("kirik",RI(1,2));const k=TM[m.tr];if(k&&R(100)<40)gm(k,1);if(m.el){gm("ruh",RI(1,2));if(R(100)<50)gm("kan",1)}}
const QV=[
{id:"v1",h:"Savaş",k:"crit",n:30,txt:"30 kritik vuruş yap",g:150,m:{kirik:5}},
{id:"v2",h:"Savaş",k:"crit",n:150,txt:"150 kritik vuruş yap",g:600,ch:1},
{id:"v3",h:"Savaş",k:"dmg",abs:1,n:500,txt:"Tek vuruşta 500 hasar ver",g:300,ch:1},
{id:"v4",h:"Demirci",k:"fok",n:5,txt:"5 başarılı yükseltme yap",g:200,m:{kirik:8}},
{id:"v5",h:"Demirci",k:"fok",n:25,txt:"25 başarılı yükseltme yap",g:900,sc:2},
{id:"v6",h:"Toplayıcı",k:"mat",n:20,txt:"20 malzeme topla",g:150},
{id:"v7",h:"Toplayıcı",k:"mat",n:100,txt:"100 malzeme topla",g:500,m:{ruh:2,kan:2}},
{id:"v8",h:"Kule",k:"tower",abs:1,n:5,txt:"Kulede 5. kata ulaş",g:300,ch:1},
{id:"v9",h:"Kule",k:"tower",abs:1,n:15,txt:"Kulede 15. kata ulaş",g:900,ch:2},
{id:"v10",h:"Gelişim",k:"lvl",abs:1,n:10,txt:"10. seviyeye ulaş",g:200,m:{kirik:10}},
{id:"v11",h:"Gelişim",k:"lvl",abs:1,n:25,txt:"25. seviyeye ulaş",g:800,sc:1},
{id:"v12",h:"Gelişim",k:"lvl",abs:1,n:40,txt:"40. seviyeye ulaş",g:2000,ch:2},
{id:"v13",h:"Ganimet",k:"drop3",n:3,txt:"3 adet GR-III veya üstü eşya bul",g:300},
{id:"v14",h:"Ganimet",k:"chest",n:5,txt:"5 sandık aç",g:250,sc:1},
{id:"v15",h:"Hazırlık",k:"pot",n:10,txt:"10 iksir kullan",g:100}];
function ev(k,a=1){QV.forEach(q=>{if(q.k!=k)return;const s=qp(q);if(s.c||s.p>=q.n)return;s.p=Math.min(q.n,q.abs?Math.max(s.p,a):s.p+a);if(s.p>=q.n)toast("📜 Görev tamam: "+q.txt)});
if(k!="tower"&&k!="lvl"&&k!="dmg")P.dl.q.forEach(q=>{if(q.k==k&&!q.c&&q.p<q.n)q.p=Math.min(q.n,q.p+a)})}
function qRow(q,fn,head){const s=qp(q),d=s.p>=q.n,gk=(d||s.c)?"":(q.k||"kill"),rw=q.g+"🪙"+(q.sc?" +📜"+(q.sc>1?q.sc:""):"")+(q.ch?" +🎁"+(q.ch>1?q.ch:""):"")+Object.entries(q.m||{}).map(([k,n])=>" +"+MT[k][0]+n).join("");
return`<div class="q" style="cursor:pointer" onclick="goQ('${gk}')"><div style="flex:1"><b>${head}</b><div class="mu">${q.txt||q.n+"× "+q.t} · ${rw}</div><div class="pg"><i style="width:${Math.min(100,s.p/q.n*100)}%"></i></div></div>${s.c?'<span class="mu">Alındı</span>':`<button class="btn" ${d?"":"disabled"} onclick="event.stopPropagation();${fn}('${q.id}')">${d?"Al":s.p+"/"+q.n}</button>`}</div>`}
function claimV(id){const q=QV.find(x=>x.id==id),s=qp(q);if(s.c||s.p<q.n)return;s.c=1;P.gold+=q.g;P.sc+=q.sc||0;P.ch+=q.ch||0;Object.entries(q.m||{}).forEach(([k,n])=>P.mat[k]=(P.mat[k]||0)+n);A.lvl();toast("Ödül alındı: +"+q.g+" 🪙");hud();save();view()}
let questSub="daily"; // "daily" | "reg" | "chal"
function setQuestSub(s){questSub=s;view()}
function cQuests(v){ev("lvl",P.lv);ev("tower",P.tw);
const availQs=QS.filter(q=>q.ri<0||P.lv>=RG[q.ri].req);
const dReady=P.dl.q.filter(q=>!q.c&&q.p>=q.n).length+(!P.dl.c?1:0)+(P.ch>0?1:0);
const rReady=availQs.filter(q=>{const s=qp(q);return!s.c&&s.p>=q.n}).length;
const cReady=QV.filter(q=>{const s=qp(q);return!s.c&&s.p>=q.n}).length;

const subNav=`<div class="sub-tabs">
  <button class="sub-tab ${questSub=="daily"?"act":""}" onclick="setQuestSub('daily')">📅 Günlük${dReady?`<span class="bdg">${dReady}</span>`:""}</button>
  <button class="sub-tab ${questSub=="reg"?"act":""}" onclick="setQuestSub('reg')">🗺️ Bölge${rReady?`<span class="bdg">${rReady}</span>`:""}</button>
  <button class="sub-tab ${questSub=="chal"?"act":""}" onclick="setQuestSub('chal')">🏆 Meydan Okuma${cReady?`<span class="bdg">${cReady}</span>`:""}</button>
</div>`;

let body="";
if(questSub=="daily"){
  body=dailyHTML();
}else if(questSub=="reg"){
  const qs=availQs.map(q=>qRow(q,"claim",q.ri<0?"Gezgin":RG[q.ri].n)).join("");
  body=`<div class="cd"><div class="ct">🗺️ Bölge Görevleri</div>${qs||'<p class="mu" style="font-size:11px">Aktif görev yok.</p>'}</div>`;
}else{
  body=`<div class="cd"><div class="ct">🏆 Meydan Okumalar</div>${QV.map(q=>qRow(q,"claimV",q.h)).join("")}</div>`;
}
v.innerHTML=subNav+body;
}

/* ---------- GÖREVE GİT ---------- */
const GH={fok:["forge","Eşyanı seç ve ocakta yükselt"],pot:["map","Savaşta iksir kullan"],any:["map","Bir av alanı seç"],kill:["map","Görevdeki canavarı bul"],elite:["map","Bir bölgenin elit canavarını seç"],tower:["map","Sonsuz Kule’ye çık"],crit:["map","Savaşa gir, kritik vur"],dmg:["map","Güçlü yeteneğini kullan"],mat:["map","Canavar avla, malzeme düşer"],lvl:["map","Canavar avla"],drop3:["map","Eşya avla, elitlerde şans yüksek"]};
function goQ(k){if(!k)return;if(k=="chest"){if(P.ch>0){chestUI();return}toast("➡️ Elit veya kule bossu yenerek sandık kazan");go("map");return}const h=GH[k]||GH.any;toast("➡️ "+h[1]);go(h[0])}

/* ---------- OYUN WİKİSİ ---------- */
let wikiSec=1;
function setWiki(n){wikiSec=n;view()}
function cWiki(v){
  const secs=[
    [1,"1. Sistemler"],
    [2,"2. Sınıflar"],
    [3,"3. Savaş"],
    [4,"4. Bölgeler"],
    [5,"5. Demirci & Set"],
    [6,"6. Kule & Unvan"]
  ];
  const tabsHtml=secs.map(([id,lbl])=>`<button class="wk-tab ${wikiSec===id?"act":""}" onclick="setWiki(${id})">${lbl}</button>`).join("");
  let body="";

  if(wikiSec===1){
    body=`
      <div class="cd">
        <div class="ct">1. Karakter Yuvaları ve Temel Sistemler</div>
        <ul class="wk-list">
          <li><b>Çoklu Karakter Yuvası (5 Yuva):</b> Giriş ekranında <b>5 ayrı karakter yuvası</b> bulunur. Sınıflara dokunulduğunda çizim üzerinde bilgi açılır; boş yuvalara dokunularak yeni kahraman oluşturulur.</li>
          <li><b>Pratik Alt Sekme Arayüzü:</b> <i>Karakter</i> (Donanım, Gelişim, Unvan, Kayıt), <i>Harita</i> (Kule + B1–B5 Bölge Sekmeleri), <i>Şehir</i> (Tüccar / Pınar & Simyacı) ve <i>Görev</i> (Günlük, Bölge, Meydan Okuma) ekranları aşağı kaydırma gerektirmeyen alt menülerle ayrılmıştır.</li>
          <li><b>5×5 Sırt Çantası, Yığınlama (Stack) ve Sıralama:</b> Çanta aynı anda <b>5×5 (25 yuva)</b> gösterir, fazlası aşağı kaydırılır. <i>İksirler, Hazine Sandıkları, Koruma Parşömenleri, Şifalı Ot/Özler ve Artı Basma Malzemeleri</i> tek yuvada yığınlanır ve 50 ekipman kapasitesini doldurmaz. Üstteki sıralama menüsüyle ekipmanlar <b>Nadirlik, Güç, Seviye, Yuva</b> veya <b>İsme</b> göre dizilebilir.</li>
          <li><b>Kayıt Yedeği (Dışa / İçe Aktar):</b> <i>Karakter → Kayıt</i> alt sekmesindeki yedekleme alanından karakter verisi Base64 koduna dönüştürülerek dışa aktarılabilir ve farklı cihazlara yüklenebilir.</li>
          <li><b>Maksimum Seviye ve Seviye Başına Büyüme:</b> Seviye sınırı <b>50</b>'dir. Nitelik puanı dağıtılmasa bile her seviye atlandığında sınıfa göre doğal olarak <b>+44–50 Maks. Can (HP)</b> ve <b>+21–24 Maks. Mana (MP)</b> artışı sağlanır; ayrıca <b>+2 Yetenek Puanı (SP)</b> ve <b>+3 Nitelik Puanı (AP)</b> kazanılarak Can ve Mana tamamen yenilenir.</li>
          <li><b>Savaş Dışı Otomatik Yenilenme:</b> Savaş dışında dolaşırken karakterin Canı her 2 saniyede maksimum HP'nin <b>%3'ü</b>, Manası ise maksimum MP'nin <b>%4'ü</b> kadar kendiliğinden yavaşça dolar.</li>
        </ul>
      </div>
      <div class="cd">
        <div class="ct">⏳ Çevrimdışı Kazanç (AFK Ödülü)</div>
        <p class="mu" style="font-size:11px;margin-bottom:6px">Oyundan en az <b>10 dakika</b> uzak kalındığında (maksimum <b>8 saat</b> birikir) oyuna dönüşte otomatik ödül verilir:</p>
        <table class="wk-tbl">
          <tr><th>Süre / Koşul</th><th>Kazanılan Ödül</th></tr>
          <tr><td><b>Her 1 Saat (Maks. 8s)</b></td><td>Saat × Seviye × 12 🪙 Altın</td></tr>
          <tr><td><b>1+ Saat Uzak Kalma</b></td><td>+1 🧪 Küçük Can İksiri</td></tr>
          <tr><td><b>4+ Saat Uzak Kalma</b></td><td>+1 🎁 Hazine Sandığı</td></tr>
        </table>
      </div>`;
  }else if(wikiSec===2){
    body=`
      <div class="cd">
        <div class="ct">2. Temel Nitelikler (Stats)</div>
        <p class="mu" style="font-size:10px;margin-bottom:4px">Her seviye +3 AP kazanılır. Şehir/Karakter sekmesinden Seviye × 30 🪙 karşılığı sıfırlanabilir.</p>
        <table class="wk-tbl">
          <tr><th>Nitelik</th><th>Her 1 Puanın Etkisi</th></tr>
          <tr><td><b>STR (Güç)</b></td><td>Sınıfa göre Saldırı + <b>0.4 Zırh</b></td></tr>
          <tr><td><b>DEX (Çeviklik)</b></td><td>Sınıfa göre Saldırı + <b>+%0.25 Kritik</b></td></tr>
          <tr><td><b>INT (Zekâ)</b></td><td>Sınıfa göre Saldırı + <b>+12 MP</b> + <b>+%1 Şifa</b></td></tr>
          <tr><td><b>VIT (Canlılık)</b></td><td><b>+18 Maks. Can</b> + <b>+1.5 Zırh</b></td></tr>
        </table>
      </div>
      <div class="cd">
        <div class="ct">Sınıf Taban Değerleri & Çarpanları</div>
        <table class="wk-tbl">
          <tr><th>Sınıf</th><th>HP / MP</th><th>Ana (★)</th><th>STR / DEX / INT Saldırı</th></tr>
          <tr><td><b>🛡️ Tank</b></td><td>420 / 90</td><td>VIT, STR</td><td>STR <b>2.8</b> · DEX 0.8 · INT 0.2</td></tr>
          <tr><td><b>🔮 Büyücü</b></td><td>250 / 210</td><td>INT</td><td>STR 0.2 · DEX 0.5 · INT <b>3.2</b></td></tr>
          <tr><td><b>🏹 Okçu</b></td><td>310 / 120</td><td>DEX</td><td>STR 0.5 · DEX <b>3.2</b> · INT 0.3</td></tr>
          <tr><td><b>🗡️ Suikastçı</b></td><td>280 / 110</td><td>DEX</td><td>STR 1.2 · DEX <b>2.8</b> · INT 0.2</td></tr>
          <tr><td><b>✨ Şifacı</b></td><td>340 / 180</td><td>INT, VIT</td><td>STR 0.5 · DEX 0.3 · INT <b>2.4</b></td></tr>
        </table>
      </div>
      <div class="cd">
        <div class="ct">Sınıf Yetenekleri (Maks. Lv.50)</div>
        <p class="mu" style="font-size:10px;margin-bottom:6px">Her yetenek seviyesi etkiyi <b>+%5</b> artırır. <b>Lv.50 (S Kademe)</b> ek <b>+%25</b> güç verir (E: 0–9, D: 10–19, C: 20–29, B: 30–39, A: 40–49, S: 50).</p>
        <ul class="wk-list">
          <li><b>🛡️ Tank:</b> Kalkan Darbesi (20 MP, 1.4x, ⚡Kesinti) · Kalkan Duvarı (30 MP, %35 HP Kalkan) · Meydan Okuma (25 MP, 1.8x + 3t İç Kanama) · Yıkılmaz İrade (45 MP, 2.8x)</li>
          <li><b>🔮 Büyücü:</b> Alev Patlaması (30 MP, 2.2x + 3t Yanma) · Buzul Halka (40 MP, 1.6x, ⚡Kesinti) · Arkana Kalkanı (35 MP, %35 HP Kalkan) · Kıyamet Meteoru (75 MP, 4.2x)</li>
          <li><b>🏹 Okçu:</b> Zehirli Ok (22 MP, 1.5x + 3t Zehir) · Kiriş Darbesi (25 MP, 1.3x, ⚡Kesinti) · Zayıf Nokta (35 MP, 2.4x, Garanti Kritik) · Ok Yağmuru (60 MP, 3.6x)</li>
          <li><b>🗡️ Suikastçı:</b> Gölge Kesiği (24 MP, 1.9x + 3t Kanama) · Kör Edici Toz (28 MP, 1.1x, ⚡Kesinti) · Gölgelere Karış (30 MP, 0.8x + Kalkan) · Gölge İnfazı (65 MP, 4.4x)</li>
          <li><b>✨ Şifacı:</b> Kutsal Işık (25 MP, 1.6x + 3t Kutsal Yanık) · İlahi Baston (22 MP, 1.2x, ⚡Kesinti) · Kutsal Lütuf (35 MP, %45 HP İyileştirme) · İlahi Kubbe (70 MP, 1.0x + Kalkan)</li>
        </ul>
      </div>`;
  }else if(wikiSec===3){
    body=`
      <div class="cd">
        <div class="ct">3. Savaş Mekaniği ve Ağır Darbe / Kesinti</div>
        <ul class="wk-list">
          <li><b>🎲 Dinamik Hasar Aralığı:</b> Saldırılar sabit tek bir sayı yerine dengeli bir hasar aralığında vurur. <b>Temel Saldırılar</b> yalnızca doğrudan fiziksel/büyü darbesi vurur (%85 – %115 aralığı); <b>İç Kanama, Yanma, Zehir, Kanama ve Kutsal Yanık</b> gibi zamanla hasar etkileri ise yalnızca ilgili <b>Sınıf Yetenekleri</b> (%90 – %110 aralığı) kullanıldığında uygulanır.</li>
          <li><b>⚠️ Ağır Darbe Hazırlığı & ⚡ Kesinti:</b> Düşman <i>"AĞIR DARBE HAZIRLANIYOR!"</i> uyarısı verdiğinde bir sonraki tur <b>2.5× Hasar</b> vurur. Aynı turda <b>⚡ Kesinti</b> yeteneği kullanılırsa saldırı bozulur, düşman <b>sersemler</b> (tur kaybeder) ve varsa <b>Zırhlı</b> savunması kırılır.</li>
          <li><b>👑 Elit Boss Fazları:</b> Bölge bossları ve Kule'nin 5. kat bossları <b>3 Fazlıdır</b>. Canları <b>%66</b> ve <b>%33</b> altına indiğinde faz atlar; saldırıları her fazda <b>+%30</b> artar ve ağır darbe ihtimali <b>%50</b> olur.</li>
          <li><b>Seviye Farkı Cezaları:</b> Canavardan 2–3 Lv yüksekte %65, 4–6 Lv yüksekte %25, 7+ Lv yüksekte <b>0 XP</b> alınır. Canavar 3+ Lv yüksekse hasar düşer, alınan hasar artar.</li>
          <li><b>🤖 Otomatik Savaş, Yetenek & İksir Seçimi:</b> Savaşta <b>▶ Oto</b> tuşuna basıldığında açılan ayar penceresinden sınıfının 4 yeteneğinden <b>hangilerinin otomatik kullanılıp hangilerinin kapatılacağı</b> (veya <i>Sadece Düz</i> saldırı modu), ayrıca otomatik kullanılacak <b>Can ve Mana iksiri boyutu</b> (Küçük, Orta, Büyük veya Kullanma) ile kullanım eşiği (%25–%70) seçilebilir. Manuel savaşta da iksir butonlarının yanındaki <b>K / O / B</b> tuşuyla boyut değiştirilebilir.</li>
        </ul>
      </div>
      <div class="cd">
        <div class="ct">Düşman Nitelikleri (Traits)</div>
        <table class="wk-tbl">
          <tr><th>Nitelik</th><th>Savaş Etkisi</th></tr>
          <tr><td><b>🤢 Zehirli</b></td><td>Vuruşlarında oyuncuyu 3 tur zehirler.</td></tr>
          <tr><td><b>🪨 Zırhlı</b></td><td>Alınan hasarı <b>%40 azaltır</b> (⚡ Kesinti ile kırılır).</td></tr>
          <tr><td><b>💨 Çevik</b></td><td>%30 ihtimalle aynı tur 0.6× ikinci saldırı yapar.</td></tr>
          <tr><td><b>💚 Yenilenir</b></td><td>Her tur maksimum canının <b>%3</b>'ünü iyileştirir.</td></tr>
          <tr><td><b>🧛 Can Çalar</b></td><td>Verdiği hasarın <b>%50</b>'si kadar can yeniler.</td></tr>
        </table>
      </div>`;
  }else if(wikiSec===4){
    body=`
      <div class="cd">
        <div class="ct">4. Bölgeler ve Canavar Listesi</div>
        <p class="mu" style="font-size:10px;margin-bottom:6px">Yeni bir bölgenin açılması için <b>gerekli seviyeye ulaşmak</b> ve <b>bir önceki bölgenin Elit Boss'unu yenmek</b> gerekir.</p>
        <table class="wk-tbl">
          <tr><th>Bölge (Lv / Set)</th><th>Canavarlar & 👑 Elit Boss</th></tr>
          <tr>
            <td><b>1. Çırak Ormanı</b><br><span class="mu">Lv.1 · Çırak (Güç 25)</span></td>
            <td>Yaban Domuzu (Lv.2) · Goblin Çırağı (Lv.5)<br>Orman Kurdu (Lv.8) · <b class="g">👑 Haydut Reisi (Lv.10)</b></td>
          </tr>
          <tr>
            <td><b>2. Zehirli Madenler</b><br><span class="mu">Lv.11 · Çelik (Güç 70)</span></td>
            <td>Mağara Akrebi (Lv.12) · Maden Golemi (Lv.15)<br>Goblin Kazıcı Başı (Lv.18) · <b class="g">👑 Zehirli Kraliçe (Lv.20)</b></td>
          </tr>
          <tr>
            <td><b>3. Batık Çöl Harabeleri</b><br><span class="mu">Lv.21 · Obsidyen (Güç 150)</span></td>
            <td>Kum Yılanı (Lv.22) · Lanetli Mumya (Lv.25)<br>Antik Muhafız (Lv.28) · <b class="g">👑 Firavun Ruhu (Lv.30)</b></td>
          </tr>
          <tr>
            <td><b>4. Donmuş Ruhlar Zirvesi</b><br><span class="mu">Lv.31 · Kristal (Güç 280)</span></td>
            <td>Buzul Kurdu (Lv.32) · Donmuş Ruh (Lv.35)<br>Buzul Yetisi (Lv.38) · <b class="g">👑 Buz Devi (Lv.40)</b></td>
          </tr>
          <tr>
            <td><b>5. Ejderha Yarığı</b><br><span class="mu">Lv.41 · Ejderha (Güç 550)</span></td>
            <td>Lav Golemi (Lv.42) · Kıyamet İblisi (Lv.45)<br>Ejderha Muhafızı (Lv.48) · <b class="g">👑 Kadim Kara Ejderha (Lv.50)</b></td>
          </tr>
        </table>
      </div>`;
  }else if(wikiSec===5){
    body=`
      <div class="cd">
        <div class="ct">5. Ekipman Yuvaları & Nadirlik</div>
        <ul class="wk-list">
          <li><b>8 Ekipman Yuvası:</b> <b>Silah</b> → Saldırı · <b>Sol El, Kask, Zırh, Pantolon, Çizme</b> → Zırh · <b>Kolye</b> → Güç×4 Can · <b>Yüzük</b> → Güç×3 Mana.</li>
          <li><b>Nadirlik Çarpanları:</b> <span style="color:#64748b">GR-I (1.0x)</span> · <span style="color:#22c55e">GR-II (1.15x)</span> · <span style="color:#38bdf8">GR-III (1.3x)</span> · <span style="color:#a855f7">GR-IV (1.5x)</span> · <span class="g">👑 ELİT (1.75x)</span>.</li>
          <li><b>Kadim Elit Kuralı:</b> Elit eşyalar her +1 yükseltmede seviye şartını <b>+2 artırır</b>.</li>
        </ul>
      </div>
      <div class="cd">
        <div class="ct">🛡️ Set Bonusları</div>
        <p class="mu" style="font-size:10px;margin-bottom:4px">Aynı bölge madeninden (Çırak, Çelik, Obsidyen, Kristal, Ejderha) parçalar kuşanıldığında aktif olur:</p>
        <table class="wk-tbl">
          <tr><th>Parça Sayısı</th><th>Aktif Set Bonusu</th></tr>
          <tr><td><b>2 Parça</b></td><td><b>+%8</b> Saldırı ve Fiziksel Zırh</td></tr>
          <tr><td><b>4 Parça</b></td><td><b>+%15</b> Maks. Can & Mana + <b>+%5</b> Kritik</td></tr>
          <tr><td><b>6 Parça</b></td><td><b>+%25</b> Saldırı & Zırh + Tur başı <b>%3 HP Yenileme</b></td></tr>
        </table>
      </div>
      <div class="cd">
        <div class="ct">🔨 Demirci (+15), Efsun ve Parçalama</div>
        <ul class="wk-list">
          <li><b>Yükseltme (+15):</b> Her seviye taban gücü <b>+%12</b> artırır. <b>+6</b> üstünde başarısızlıkta 1 seviye düşebilir; <b>+10</b> üstünde kırılabilir. <b>📜 Koruma Parşömeni</b> düşmeyi ve kırılmayı engeller.</li>
          <li><b>Efsun Dönüştürücü:</b> Savaş ganimetlerinde 1–4 arası efsun çıkar. İstenen efsunlar <b>kilitlenerek</b> diğerleri 45 🪙 karşılığında yenilenebilir.</li>
          <li><b>Eşya Parçalama:</b> İstenmeyen eşyalar parçalanarak <i>Demir Kırığı, Zehir Bezi, Zırh Parçası, Çevik Tüy, Yeşil Öz, Kan Kristali</i> ve <i>Elit Ruhu</i> elde edilir.</li>
        </ul>
      </div>`;
  }else{
    body=`
      <div class="cd">
        <div class="ct">6. Şehir, Sonsuz Kule ve Sandıklar</div>
        <ul class="wk-list">
          <li><b>🏪 Tüccar Maren:</b> Seviyene uygun bölgenin tüm 8 parça GR-I set eşyalarını satar. Her gün yenilenir veya 80 🪙 karşılığı tazelenebilir.</li>
          <li><b>⛲ Yaşam Pınarı & 🧪 Simyacı (İksir Boyutları):</b> Pınar Can ve Manayı <b>ücretsiz</b> doldurur. İksirler 3 boyuttadır; boyut büyüdükçe etkisi ve fiyatı artar, yaratıklardan düşme şansı azalır (Düşme dağılımı: <b>%65 Küçük, %27 Orta, %8 Büyük</b>):<br>
• <b>Can İksirleri:</b> Küçük (+%25 HP · 10 🪙) · Orta (+%50 HP · 25 🪙) · Büyük (+%85 HP · 60 🪙)<br>
• <b>Mana İksirleri:</b> Küçük (+%30 MP · 8 🪙) · Orta (+%60 MP · 20 🪙) · Büyük (+%95 MP · 50 🪙)<br>
• <b>Koruma Parşömeni:</b> 150 🪙 (+6 ve üzeri yükseltmeleri korur).</li>
          <li><b>🗼 Sonsuz Kule:</b> Her katta düşmanlar <b>+%7</b> güçlenir. Her <b>5 katta bir</b> Kule Muhafızı (Boss) çıkar ve zaferde <b>🎁 Hazine Sandığı</b> verir.</li>
          <li><b>🎁 Hazine Sandıkları (Tekli & Toplu Açım):</b> Bölge elit bosslarından <b>%50 ihtimalle</b>, Sonsuz Kule'nin her 5. kat bossundan, günlük görevlerden ve 4+ saat çevrimdışı ödülden kazanılır (normal canavarlardan düşmez). Çantada tek yuvada birikir ve toplu açılabilir; içinden <b>%53 Altın</b>, <b>%30 İksir Paketi</b> (2 Can + 2 Mana), <b>%10 Nadir Ekipman (GR-III+)</b> veya <b>%7 Koruma Parşömeni</b> çıkar.</li>
        </ul>
      </div>
      <div class="cd">
        <div class="ct">🏅 Unvanlar (Titles) ve Kalıcı Bonuslar</div>
        <table class="wk-tbl">
          <tr><th>Unvan</th><th>Açılma Şartı</th><th>Kuşanma Bonusu</th></tr>
          <tr><td><b>Çaylak Maceracı</b></td><td>Başlangıç</td><td>Yok</td></tr>
          <tr><td><b>Canavar Avcısı</b></td><td>50 canavar öldür</td><td><b>+%5 Saldırı</b></td></tr>
          <tr><td><b>Elit Celladı</b></td><td>10 elit öldür</td><td><b>+%8 Kritik Şansı</b></td></tr>
          <tr><td><b>Kule Fatihi</b></td><td>Kule 15. kata çık</td><td><b>+%10 Maksimum Can</b></td></tr>
          <tr><td><b>Demir Ustası</b></td><td>20 başarılı yükseltme</td><td><b>+%10 Fiziksel Zırh</b></td></tr>
          <tr><td><b>Efsanevi Kahraman</b></td><td>40. seviyeye ulaş</td><td><b>+%12 Saldırı & Zırh</b></td></tr>
          <tr><td><b>Karanlığın Efendisi</b></td><td>Kadim Kara Ejderha'yı yen</td><td><b>+%15 Tüm Güç & +%5 Kritik</b></td></tr>
        </table>
      </div>`;
  }

  v.innerHTML=`
    <div class="cd" style="background:linear-gradient(135deg,#2a1c3d88,var(--pn))">
      <div class="ct">📖 Karanlık Zindan RPG — Oyun Rehberi <span class="g" style="font-size:10px">WİKİ</span></div>
      <div class="wk-tabs">${tabsHtml}</div>
    </div>
    ${body}
  `;
}

/* ---------- KAYIT YEDEĞİ ---------- */
function backupHTML(){return`<div class="cd"><div class="ct">💾 Kayıt yedeği</div><p class="mu" style="font-size:10px">Dışa aktar: kodu kopyala ve bir yere sakla. İçe aktar: kodu yapıştırıp yükle.</p>
<textarea id="bk" placeholder="Yedek kodu burada görünür veya buraya yapıştır"></textarea>
<div class="pr"><button onclick="expSave()">📤 Dışa aktar</button><button onclick="impSave()">📥 İçe aktar</button></div></div>`}
function expSave(){const c=btoa(unescape(encodeURIComponent(JSON.stringify(P))));$("bk").value=c;try{navigator.clipboard.writeText(c).then(()=>toast("Kod kopyalandı"),()=>toast("Kodu elle kopyala"))}catch(e){toast("Kodu elle kopyala")}}
function impSave(){const t=$("bk").value.trim();if(!t)return toast("Önce kodu yapıştır");
try{const o=JSON.parse(decodeURIComponent(escape(atob(t))));if(typeof o.lv!="number"||!CL[o.cls])throw 0;P=Object.assign(NEW(),o);normPot(P);if(o.ap===undefined)P.ap=P.lv*3;SLOTS[activeSlot]=P;sync();daily();save();hud();view();toast("Kayıt yüklendi: "+P.name)}catch(e){toast("Geçersiz yedek kodu")}}

/* ---------- BAŞLANGIÇ & KARAKTER OLUŞTURMA ---------- */
function showIntro(){
  csMode="create";
  $("cs-screen").style.display="flex";
  renderCharSelect();
}
function pick(k){
  sel=k;
  A.pot();
  renderCharSelect();
}
function syncCreateBtn(){
  const inp=$("cn"),btn=$("cn-btn");
  if(inp&&btn)btn.disabled=!inp.value.trim();
}
function newGame(){
  const inp=$("cn");
  const charName=inp?inp.value.trim():"";
  if(!charName){
    toast("⚠️ Karakter oluşturmak için önce bir isim yazmalısın!");
    if(inp)inp.focus();
    return;
  }
  const created=NEW();
  created.name=charName;
  created.cls=sel;
  SLOTS[targetCreateSlot]=created;
  activeSlot=targetCreateSlot;
  P=created;
  sync();daily();P.hp=P.maxHp;P.mp=P.maxMp;
  $("cs-screen").style.display="none";
  saveAll();nav();view();
  toast("Hoş geldin, "+P.name+"!");
}

/* ---------- KÜL PARÇACIKLARI ---------- */
const cv=$("bg"),cx=cv.getContext("2d");let ps=[];
function rs(){cv.width=innerWidth;cv.height=innerHeight}addEventListener("resize",rs);rs();
for(let i=0;i<30;i++)ps.push({x:R(cv.width),y:R(cv.height),r:R(2)+1,v:R(.4)+.1});
(function f(){cx.clearRect(0,0,cv.width,cv.height);cx.fillStyle="rgba(230,180,80,.35)";ps.forEach(p=>{cx.beginPath();cx.arc(p.x,p.y,p.r,0,7);cx.fill();p.y-=p.v;if(p.y<0)p.y=cv.height});requestAnimationFrame(f)})();

/* ---------- AÇILIŞ EKRANI & YÖNLENDİRME ---------- */
(function(){
  const TP=["Kesinti yeteneği, ağır darbe hazırlayan canavarın saldırısını bozar.","Zırhlı canavarın zırhını kesinti kırar.","Koruma parşömeni eşyanı kırılmaktan korur.","Aynı bölgeden 2, 4 veya 6 parça giyerek Set Bonusu kazan.","Eşyaları parçalayarak demirci malzemesi elde edebilirsin.","Karakter seçim ekranından kendi karakter görsellerini yükleyebilirsin.","Efsunlu eşyalar sadece savaştan düşer, tüccarda satılmaz."],sp=$("sp");let d=0;
  $("spt").innerText="İpucu: "+TP[RI(0,TP.length-1)];
  function cl(){
    if(d)return;d=1;
    sp.classList.add("out");
    setTimeout(()=>{
      sp.remove();
      openCharSelect();
    },600);
  }
  setTimeout(cl,2400);sp.onclick=cl;
})();

/* ---------- SAVAŞ DIŞI PASİF CAN & MANA YENİLENMESİ ---------- */
let regenTicks=0;
setInterval(()=>{
  if(!SLOTS[activeSlot]||CB.on)return;
  const cs=$("cs-screen");
  if(cs&&cs.style.display==="flex")return;
  if(P.hp<P.maxHp||P.mp<P.maxMp){
    const hpStep=Math.max(3,Math.ceil(P.maxHp*0.03));
    const mpStep=Math.max(2,Math.ceil(P.maxMp*0.04));
    P.hp=Math.min(P.maxHp,P.hp+hpStep);
    P.mp=Math.min(P.maxMp,P.mp+mpStep);
    hud();
    regenTicks++;
    if(regenTicks%5===0)saveAll(true);
  }
},2000);

/* başlat */
addEventListener("DOMContentLoaded",()=>{
  nav();
  if(loadAll()){
    sync();hud();
  }else{
    sync();hud();
  }
});
document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="hidden")saveAll(true)});
window.addEventListener("pagehide",()=>saveAll(true));
