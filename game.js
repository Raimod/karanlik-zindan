const GAME_VERSION="2.13.1";
const $=id=>document.getElementById(id),R=n=>Math.random()*n,RI=(a,b)=>Math.floor(a+R(b-a+1));
/* ---------- SES ---------- */
const SET={snd:1,vol:70,hap:1,shk:1,dmg:1};
try{const _s=JSON.parse(localStorage.getItem("kz_set")||"{}");for(const k in SET)if(typeof _s[k]==="number")SET[k]=_s[k]}catch(e){}
try{if(localStorage.getItem("kz_nohap")==="1"&&!(JSON.parse(localStorage.getItem("kz_set")||"{}").hap===1))SET.hap=0}catch(e){}
const A={c:null,t(f,ty,d,v=.15,dl=0){if(!SET.snd)return;v=v*(SET.vol/70);try{if(!this.c)this.c=new(window.AudioContext||window.webkitAudioContext)();setTimeout(()=>{const o=this.c.createOscillator(),g=this.c.createGain();o.type=ty;o.frequency.value=f;g.gain.setValueAtTime(v,this.c.currentTime);g.gain.exponentialRampToValueAtTime(1e-4,this.c.currentTime+d);o.connect(g);g.connect(this.c.destination);o.start();o.stop(this.c.currentTime+d)},dl)}catch(e){}},
hit(){this.t(130,"sawtooth",.12,.2)},crit(){this.t(420,"triangle",.1,.25);this.t(660,"square",.25,.25,60)},
int(){this.t(880,"sine",.08,.3);this.t(1100,"square",.2,.25,80)},pot(){this.t(330,"sine",.15,.2);this.t(520,"sine",.25,.2,90)},
lvl(){[261,329,392,523,659].forEach((f,i)=>this.t(f,"triangle",.25,.25,i*80))},elite(){[392,523,659,1046].forEach((f,i)=>this.t(f,"square",.35,.25,i*110))}};

/* ---------- VERİ ---------- */

/* ---------- UNVANLAR (TITLES) ---------- */

/* ---------- DURUM & ÇOKLU KARAKTER YUVASI ---------- */
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
let genSel="e",raceSel="kul";
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

/* Kadın görselleri: dosya img/<sınıf>_f.webp olarak eklenince buraya sınıf adını yaz (ör. FEM_ART.tank=1). Yoksa erkek görseli gösterilir. */
const FEM_ART={tank:1,mage:1,archer:1,assassin:1,healer:1};
const artSrc=(cls,g)=>g==="k"&&FEM_ART[cls]?"img/"+cls+"_f.webp":CLASS_BG_IMAGES[cls];
function getFullClassArtHTML(clsId,g){
  const srcUrl=artSrc(clsId,g);
  const fallback=defaultClassFullArt(clsId);
  if(!srcUrl)return fallback;
  return`<img class="cs-bg-blur" src="${srcUrl}" alt="" aria-hidden="true"><img class="cs-bg-main" src="${srcUrl}" alt="${clsId}" onerror="this.style.display='none';this.previousElementSibling.style.display='none';this.nextElementSibling.style.display='block'"><div style="display:none;width:100%;height:100%">${fallback}</div>`;
}

function getCharPortraitHTML(charObj, clsOverride){
  const clsId=clsOverride||(charObj?charObj.cls:"tank");
  return getFullClassArtHTML(clsId,charObj&&charObj.g);
}

let csShowcaseCls="tank",csShowcaseG="e";

function getShowcaseBgOnlyHTML(clsId,g){
  const activeCls=clsId||csShowcaseCls||"tank";
  const cl=CL[activeCls]||CL.tank;
  const srcUrl=artSrc(activeCls,g);
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
  csShowcaseCls=initChar?initChar.cls:"tank";csShowcaseG=initChar?initChar.g:"e";
  $("cs-screen").style.display="flex";
  renderCharSelect();
}

function toggleCsMode(){
  csMode="select";
  const firstIdx=SLOTS.findIndex(Boolean);
  csPreviewSlot=SLOTS[activeSlot]?activeSlot:(firstIdx>-1?firstIdx:0);
  const initChar=SLOTS[csPreviewSlot]||SLOTS.find(Boolean);
  csShowcaseCls=initChar?initChar.cls:csShowcaseCls;csShowcaseG=initChar?initChar.g:csShowcaseG;
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
    bgLayer.innerHTML=getShowcaseBgOnlyHTML(csShowcaseCls,csShowcaseG);

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
        <div style="display:flex;flex-direction:column;gap:5px;align-items:stretch">
          <button class="btn" style="width:auto;padding:6px 12px;font-size:11px;margin:0" onclick="event.stopPropagation();selectAndPlaySlot(${idx})">▶ Oyna</button>
          <button class="btn d" style="width:auto;padding:5px 8px;font-size:10.5px;margin:0" onclick="event.stopPropagation();deleteSlot(${idx})">${armed=="del"+idx?"Sil?":"🗑️"}</button>
        </div>
      </div>`;
    }).join("");

    const playBtnHtml="";

    bottom.innerHTML=`
      ${getShowcaseOverlayControlsHTML(csShowcaseCls)}
      ${slotsHtml}
      ${playBtnHtml}
    `;
  }else{
    // Yeni Karakter Oluşturma Modu (Boş yuvaya tıklanınca açılır)
    bgLayer.innerHTML=getFullClassArtHTML(sel,genSel);
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
      <div class="rc-row"><button class="rc-chip ${genSel==="e"?"act":""}" onclick="pickGen('e')">♂ Erkek</button><button class="rc-chip ${genSel==="k"?"act":""}" onclick="pickGen('k')">♀ Kadın</button></div>
      <div class="rc-row">${Object.entries(RACES).map(([k,r])=>`<button class="rc-chip ${k===raceSel?"act":""}" onclick="pickRace('${k}')">${icoHTML(r.ic)} ${r.n}</button>`).join("")}</div>
      <div class="rc-info"><b>${RACES[raceSel].n}</b> · ${RACES[raceSel].bt}<br><span>${RACES[raceSel].pn}: ${RACES[raceSel].pt}</span></div>
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
  csShowcaseCls=SLOTS[idx].cls;csShowcaseG=SLOTS[idx].g;
  armed="";
  renderCharSelect();
}

/* ---------- IRK (v2.7.0) ---------- */
function raceCard(){const r=RACES[P.race];if(!r)return`<div class="cd" style="padding:8px 10px"><div class="r"><span class="mu" style="font-size:11px">Karakterin henüz bir ırk seçmedi.</span><button class="btn" style="width:auto;padding:6px 12px;font-size:11px" onclick="raceAsk()">Irk seç</button></div></div>`;
  return`<div class="cd" style="padding:8px 10px"><div style="display:flex;gap:8px;align-items:flex-start"><div style="font-size:22px;color:var(--gold)">${icoHTML(r.ic)}</div><div style="min-width:0"><b style="color:var(--gold)">${r.n}</b> <span class="mu" style="font-size:10px">· ${r.s} · ${r.bt}</span><div style="font-size:10.5px;color:#cbd5e1;margin-top:2px"><b>${r.pn}:</b> ${r.pt}</div></div></div></div>`}
let raceTmp="kul";
function raceAsk(){raceTmp=raceTmp||"kul";raceAskUI()}
function raceAskUI(){const r=RACES[raceTmp];
  $("ic").innerHTML=`<div style="text-align:center;margin-bottom:8px"><b style="font-family:var(--hd);color:var(--gold);font-size:16px">Irkını Seç</b><div class="mu" style="font-size:11px;margin-top:3px">Karakterin için bir ırk seç. Bu seçim bir kez yapılır ve sonradan değiştirilemez.</div></div>
  <div class="rc-row" style="justify-content:center">${Object.entries(RACES).map(([k,x])=>`<button class="rc-chip ${k===raceTmp?"act":""}" onclick="raceTmp='${k}';raceAskUI()">${icoHTML(x.ic)} ${x.n}</button>`).join("")}</div>
  <div class="rc-info" style="margin:10px 0"><b>${r.n}</b> · ${r.bt}<br><span>${r.pn}: ${r.pt}</span><div class="mu" style="font-size:10px;margin-top:5px;font-style:italic">${r.st}</div></div>
  <button class="btn" onclick="raceSet()">Bu ırkı seç: ${r.n}</button>`;
  $("im").style.display="flex"}
function raceSet(){if(P.race||!RACES[raceTmp])return;P.race=raceTmp;sync();save();closeM();view();toast("Irkın: "+RACES[P.race].n)}
function selectAndPlaySlot(idx){
  if(!SLOTS[idx])return;
  activeSlot=idx;
  P=SLOTS[idx];
  armed="";
  $("cs-screen").style.display="none";
  sync();
  saveAll();
  nav();
  view();
  ecoSync();
  toast("Hoş geldin, "+P.name+"!");
  if(!P.race)setTimeout(raceAsk,600);
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

const getActiveSets=()=>getActiveSetsOf(P),getTitleBonus=()=>getTitleBonusOf(P);
function D(){return statsOf(P)}
function sync(){const d=D();P.maxHp=d.hp;P.maxMp=d.mp;P.hp=Math.min(P.hp,P.maxHp);P.mp=Math.min(P.mp,P.maxMp);hud()}

/* ---------- HUD ---------- */
function hud(){const x=reqXp(P.lv);
const tObj=TITLES.find(t=>t.id==P.title)||TITLES[0];
$("hl").innerText="LV."+P.lv;$("hn").innerText=P.name;$("hc").innerText=CL[P.cls].n;$("htitle").innerText="🏅 "+tObj.n;
$("hg").innerText=P.gold.toLocaleString();$("hb").innerText=P.inv.length;
$("hh").style.width=Math.max(0,P.hp/P.maxHp*100)+"%";$("hm").style.width=Math.max(0,P.mp/P.maxMp*100)+"%";$("hx").style.width=Math.min(100,P.xp/x*100)+"%";
$("ht").innerText=P.hp+" / "+P.maxHp+" HP";$("hmt").innerText=P.mp+" / "+P.maxMp+" MP"}
const TABS=[["character","🧙","Karakter"],["inventory","🎒","Çanta"],["map","🗺️","Harita"],["forge","🔨","Demirci"],["city","🏰","Şehir"],["quests","📜","Görev"],["community","🌐","Topluluk"],["wiki","📖","Wiki"]];
function nav(){const bd=typeof frBadge==="function"?frBadge():0;$("nv").innerHTML=TABS.map(t=>`<button class="${tab==t[0]?"a":""}" onclick="go('${t[0]}')"><span>${t[1]}</span>${t[2]}${t[0]==="community"&&bd>0?`<i class="nbd">${bd>9?"9+":bd}</i>`:""}</button>`).join("")}
let wmAuto=false;
function go(t){if(t==="map")wmAuto=true;else if(typeof wmClose==="function")wmClose();tab=t;armed="";CB.nav=!!(CB.on&&t!=="map"&&(CB.auto||CB.nav));nav();view()}
function view(){const v=$("mv");if(CB.on&&!(CB.nav&&tab!=="map")){combatUI(v);return}({character:cChar,inventory:cBag,map:cMap,forge:cForge,city:cCity,skills:cSkills,quests:cQuests,community:(typeof cCommunity==="function"?cCommunity:cCity),wiki:cWiki})[tab](v);if(CB.on)updMini(true)}
function toast(m){const e=document.createElement("div");e.className="t";e.innerText=m;$("tt").appendChild(e);setTimeout(()=>e.remove(),2400)}

/* ---------- GÖRSELLER (SVG) ---------- */
function banner(h){return`<svg viewBox="0 0 400 120" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="b${h}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(${h},50%,24%)"/><stop offset="1" stop-color="hsl(${h},40%,8%)"/></linearGradient></defs><rect width="400" height="120" fill="url(#b${h})"/><circle cx="325" cy="30" r="15" fill="hsl(${h},70%,82%)" opacity=".85"/><path d="M0 120V70L60 36 110 74 170 28 240 78 300 44 400 82V120Z" fill="hsl(${h},35%,13%)"/><path d="M0 120V92L80 66 150 94 230 68 320 96 400 74V120Z" fill="hsl(${h},30%,6%)"/></svg>`}
function mobSVGold(m){const h=RG[m.ri].h,i=m.mi,id="g"+m.id,e=m.el,c1=`hsl(${h+i*14},45%,${30+i*4}%)`,c2=`hsl(${h+i*14},55%,13%)`,ey=e?"#ffd166":"#ff5d5d";
const hr=i%2?`<path d="M26 30L14 6 38 24ZM74 30L86 6 62 24Z" fill="#e8dcc0"/>`:`<path d="M20 42L4 28 26 30ZM80 42L96 28 74 30Z" fill="${c1}"/>`;
const sp=i>1?`<path d="M30 80L36 95 44 83 50 97 56 83 64 95 70 80Z" fill="${c2}"/>`:"";
return`<svg viewBox="0 0 100 100"><defs><radialGradient id="${id}" cx="50%" cy="35%"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></radialGradient></defs>${e?`<circle cx="50" cy="54" r="46" fill="none" stroke="#e6b450" stroke-width="1.5" stroke-dasharray="3 4" opacity=".8"/>`:""}${hr}${sp}<ellipse cx="50" cy="56" rx="33" ry="31" fill="url(#${id})" stroke="#000" stroke-opacity=".5"/><path d="M29 50Q38 41 47 52L34 57ZM71 50Q62 41 53 52L66 57Z" fill="${ey}"/><path d="M33 72Q50 84 67 72L62 70 58 77 50 71 42 77 38 70Z" fill="#0d0908"/><path d="M40 73L42 77 44 73ZM56 73L58 77 60 73Z" fill="#fff"/>${e?`<path d="M34 24L40 12 46 22 50 8 54 22 60 12 66 24Z" fill="#e6b450"/>`:""}</svg>`}
function mobSVG(m){const b=MONS[m.ri+"_"+m.mi];if(!b)return mobSVGold(m);return`<svg viewBox="0 0 200 200">${m.el?`<circle cx="100" cy="104" r="95" fill="none" stroke="#e8b04a" stroke-width="2" stroke-dasharray="4 6" opacity=".85"/>`:""}${b}</svg>`}
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
        <div class="mu" style="font-size:10px">${c.e} ${P.race&&RACES[P.race]?RACES[P.race].n+" ":""}${c.n} · Seviye ${P.lv}</div>
        <div style="font-size:10px;margin-top:2px">⚔️ <b style="color:#e5484d">${d.minAtk}–${d.maxAtk}</b> <span class="mu">(${d.atk})</span> · 🛡️ <b style="color:#38bdf8">${d.arm}</b> · 💥 <b class="g">%${d.cr}</b></div>
      </div>
    </div>
    <button class="btn s" style="width:auto;padding:5px 8px;font-size:10px;flex-shrink:0" onclick="openCharSelect()">👥 Yuvalar</button>
  </div>
</div>`+raceCard();

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
  <button class="btn s" style="margin-top:8px;padding:8px;font-size:11px" onclick="togHap()">Titreşim: ${hapOn()?"Açık":"Kapalı"}</button>
  <button class="btn s" style="margin-top:8px;padding:8px;font-size:11px" onclick="resetGame()">${armed=="rs"?"Emin misin? Tekrar dokun":"Bu karakteri sıfırla"}</button></div>${typeof cloudHTML==="function"?cloudHTML():""}${backupHTML()}`;
}

v.innerHTML=headerCard+subNav+content;
}

function equipTitle(tid){P.title=tid;A.pot();sync();save();view();toast("Unvan kuşanıldı!")}
function resetGame(){if(armed!="rs"){armed="rs";view();return}const keepArt=P.art,keepName=P.name,keepCls=P.cls;P=NEW();P.art=keepArt;P.name=keepName;P.cls=keepCls;armed="";sync();P.hp=P.maxHp;P.mp=P.maxMp;save();view();toast("Karakter sıfırlandı.");ecoSync()}

let bagFilter="all"; // "all" | "eq" | "stk" | "junk"
let bagSort="default"; // "default" | "grade" | "power" | "level" | "slot" | "name"
function setBagFilter(f){bagFilter=f;armed="";view()}
function setBagSort(s){bagSort=s;view()}

/* Stacklenen eşyalar (İksirler, Parşömenler, Sandıklar, Artı Basma & Ot/Öz Malzemeleri) */
const STACK_DEFS=[
  {key:"pot_hp_S",cat:"İksir (Küçük)",g:1,e:"🧪",n:"Küçük Can İksiri",desc:"Savaşta en az 150 can (ya da maksimumun %15'i) yeniler.",get:()=>P.pot.hp.S||0,set:v=>P.pot.hp.S=v,sell:3,act:"usePot('hp','S')",actLbl:"İç (+150 HP)"},
  {key:"pot_hp_M",cat:"İksir (Orta)",g:2,e:"🧪",n:"Orta Can İksiri",desc:"Savaşta en az 400 can (ya da maksimumun %35'i) yeniler.",get:()=>P.pot.hp.M||0,set:v=>P.pot.hp.M=v,sell:8,act:"usePot('hp','M')",actLbl:"İç (+400 HP)"},
  {key:"pot_hp_L",cat:"İksir (Büyük)",g:4,e:"🧪",n:"Büyük Can İksiri",desc:"Savaşta en az 900 can (ya da maksimumun %65'i) yeniler.",get:()=>P.pot.hp.L||0,set:v=>P.pot.hp.L=v,sell:20,act:"usePot('hp','L')",actLbl:"İç (+900 HP)"},
  {key:"pot_mp_S",cat:"İksir (Küçük)",g:1,e:"💧",n:"Küçük Mana İksiri",desc:"Savaşta en az 60 mana (ya da maksimumun %15'i) yeniler.",get:()=>P.pot.mp.S||0,set:v=>P.pot.mp.S=v,sell:2,act:"usePot('mp','S')",actLbl:"İç (+60 MP)"},
  {key:"pot_mp_M",cat:"İksir (Orta)",g:3,e:"💧",n:"Orta Mana İksiri",desc:"Savaşta en az 180 mana (ya da maksimumun %35'i) yeniler.",get:()=>P.pot.mp.M||0,set:v=>P.pot.mp.M=v,sell:6,act:"usePot('mp','M')",actLbl:"İç (+180 MP)"},
  {key:"pot_mp_L",cat:"İksir (Büyük)",g:4,e:"💧",n:"Büyük Mana İksiri",desc:"Savaşta en az 400 mana (ya da maksimumun %65'i) yeniler.",get:()=>P.pot.mp.L||0,set:v=>P.pot.mp.L=v,sell:16,act:"usePot('mp','L')",actLbl:"İç (+400 MP)"},
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
<button class="btn v" style="margin-bottom:6px;padding:8px;font-size:12px" onclick="autoEquip()">⚡ Çantadaki en iyileri kuşan</button>
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
<button class="btn s" style="margin-top:6px;padding:7px;font-size:11.5px" onclick="JRopen=!JRopen;view()">⚙️ Çöp kuralları ${jrOf(P).auto===1?"· 🧹 oto sat":jrOf(P).auto===2?"· 🧹 oto parçala":""} ${JRopen?"▲":"▼"}</button>${JRopen?jrPanel(cnt):""}
<p class="mu" style="font-size:9px;margin-top:5px">İksir, sandık, ot ve artı basma malzemeleri tek yuvada toplanır (50 ekipman sınırından yer kaplamaz).</p></div>`}

const junk=i=>junkOf(P,i);
let JRopen=false;
function setJR(k,v){P.jr={...jrOf(P),[k]:Number(v)};save();view()}
function jrPanel(cnt){
  const r=jrOf(P),gs=[[0,"Hiçbiri"],[1,"GR-I Sıradan"],[2,"GR-II İşlenmiş"],[3,"GR-III Usta İşi"],[4,"GR-IV Kusursuz"]];
  const sel=(k,opts,cur)=>`<select class="sort-sel" style="flex:none;width:55%" onchange="setJR('${k}',this.value)">${opts.map(([v,t])=>`<option value="${v}" ${v==cur?"selected":""}>${t}</option>`).join("")}</select>`;
  const row=(t,s)=>`<div class="r" style="margin-bottom:6px;gap:6px"><span style="font-size:11px">${t}</span>${s}</div>`;
  return`<div class="cd" style="margin-top:6px;padding:9px;border-color:rgba(230,180,80,.4)">
    <div class="mu" style="font-size:10px;margin-bottom:6px">Aşağıdaki şartların <b>hepsine</b> uyan eşya "çöp" sayılır. Toplu Sat / Toplu Parçala yalnızca bunlara dokunur. Kadim Elit eşyalar hiçbir zaman çöp sayılmaz.</div>
    ${row("Kendi sınıfımın eşyası, en çok",sel("g",gs,r.g))}
    ${row("Başka sınıfın eşyası, en çok",sel("og",gs,r.og))}
    ${row("Efsun sayısı en çok",sel("af",[[0,"0 (efsunsuz)"],[1,"1"],[2,"2"],[3,"3"],[4,"Sınır yok"]],r.af))}
    ${row("Artı (+) seviyesi en çok",sel("p",[[0,"+0 (artısız)"],[1,"+1"],[2,"+2"],[3,"+3"],[5,"+5"],[10,"+10"]],r.p))}
    ${row("🧹 Otomatik işlem",sel("auto",[[0,"Kapalı"],[1,"Düşünce otomatik SAT"],[2,"Düşünce otomatik PARÇALA"]],r.auto))}
    <div class="mu" style="font-size:10px">Şu an kurala uyan: <b class="g">${cnt}</b> eşya${r.auto?" · Savaşta düşen çöp eşyalar anında "+(r.auto===1?"satılır":"parçalanır")+" (çanta dolmaz).":"."}</div>
  </div>`;
}

async function salvageItem(n){
  closeM();
  const r=await ecoCall({op:"eco",a:"salvage",i:n});
  if(r){hud();view()}
}

async function bulk(){
  const l=P.inv.filter(junk);if(armed!="bk"){armed="bk";view();return}
  armed="";
  const r=await ecoCall({op:"eco",a:"bulk",m:"sell"});
  if(r){hud();view()}else view();
}

async function bulkSalvage(){
  const l=P.inv.filter(junk);if(!l.length)return;
  if(armed!="sv"){armed="sv";view();return}
  armed="";
  const r=await ecoCall({op:"eco",a:"bulk",m:"salvage"});
  if(r){hud();view()}else view();
}

const open=r=>(r==0||P.boss[r-1])&&P.lv>=RG[r].req;
let mapReg=-1;
/* ---------- DÜNYA HARİTASI (v2.6.0): çizilmiş harita üzerinde dokunulan bölge noktaları ---------- */
const WG=[
'<path d="M12 3l5 8h-3l4 6H6l4-6H7z"/><path d="M12 17v4"/>',
'<path d="M5 19L15 9"/><path d="M12 5c4-1 8 2 8 7-2-3-4-4-8-4z"/>',
'<path d="M3 20L12 5l9 15z"/><path d="M8 20l4-7 4 7"/>',
'<path d="M3 20l6-10 3 5 3-8 6 13z"/><path d="M8 12l2 2 2-3"/>',
'<path d="M12 3c2 4 6 6 6 11a6 6 0 01-12 0c0-3 2-4 3-7 1 2 2 2 3-4z"/>',
'<path d="M4 19c3-3 5 2 8-1s5 2 8-1"/><path d="M8 14V8M8 8c-3-1-3-4 0-4s3 3 0 4M16 15V9"/>',
'<path d="M12 3a7 7 0 00-4 12.800V19h8v-3.200A7 7 0 0012 3z"/><circle cx="9.500" cy="11" r="1.500"/><circle cx="14.500" cy="11" r="1.500"/>',
'<path d="M5 20V10l7-7 7 7v10z"/><path d="M10 20v-5h4v5"/>',
'<path d="M7 14a4 4 0 010-8 5 5 0 019 1 3.500 3.500 0 010 7z"/><path d="M12 14l-2 4 4-2-2 5"/>',
'<path d="M12 21l-5-6 2-4-3-3 6 1 2-6 2 6 6-1-3 3 2 4z"/>',
'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/>',
'<path d="M4 18l1-9 4 4 3-7 3 7 4-4 1 9z"/><path d="M4 21h16"/>'];
let wmY=null;
const wmBest=()=>{let b=0;for(let i=0;i<RG.length;i++)if(open(i))b=i;return b};
function setMapReg(ri){const e=document.getElementById("wmap");wmY=e?e.scrollTop:null;mapReg=ri;view()}
function worldMapSVG(full){
  const W=360,H=649,n=RG.length,here=wmBest();
  const nodes=[];
  RG.forEach((r,i)=>{
    const o=open(i),cl=!!P.boss[i],sel=i===mapReg,x=r.x,y=r.y;
    const col=o?`hsl(${r.h},70%,74%)`:"#8a7d70";
    nodes.push(`<g onclick="${full?"wmPick":"setMapReg"}(${i})" style="cursor:pointer">
      <circle cx="${x}" cy="${y}" r="28" fill="transparent"/>
      ${i===here?`<circle class="wm-pulse" cx="${x}" cy="${y}" r="21" fill="none" stroke="#e6b450" stroke-width="2.4"/>`:""}
      ${sel?`<circle cx="${x}" cy="${y}" r="23" fill="none" stroke="#e6b450" stroke-width="2.6" stroke-dasharray="5 4"/>`:""}
      <circle cx="${x}" cy="${y}" r="17" fill="${o?`hsl(${r.h},42%,14%)`:"#161110"}" fill-opacity=".92" stroke="${o?`hsl(${r.h},65%,58%)`:"#5a4d44"}" stroke-width="${sel?3:2}"/>
      <g transform="translate(${x-10} ${y-10}) scale(.84)" fill="none" stroke="${col}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${WG[i]||""}</g>
      <circle cx="${x-14}" cy="${y-14}" r="7" fill="#0d0908" stroke="${o?"#e6b450":"#5a4d44"}"/><text x="${x-14}" y="${y-11}" text-anchor="middle" font-size="8" font-weight="800" fill="${o?"#e6b450":"#8a7d70"}">${i+1}</text>
      ${cl?`<circle cx="${x+14}" cy="${y-14}" r="7" fill="#1f6f3a" stroke="#0d0908"/><path d="M${x+10.500} ${y-14}l2.500 2.500 4-5" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/>`:""}
      ${!o?`<circle cx="${x+14}" cy="${y-14}" r="7" fill="#2a2320" stroke="#0d0908"/><path d="M${x+11.500} ${y-13}h5v4h-5zM${x+12.500} ${y-13}v-2a1.500 1.500 0 013 0v2" fill="none" stroke="#c0b0a0" stroke-width="1.300"/>`:""}
      <text x="${x}" y="${y+31}" text-anchor="middle" font-size="9.500" font-weight="800" fill="${o?"#fff6e0":"#d8cdbd"}" stroke="#0d0908" stroke-width="3" paint-order="stroke">${r.n}</text>
      <text x="${x}" y="${y+41}" text-anchor="middle" font-size="8" font-weight="700" fill="${o?"#f2c868":"#b0a290"}" stroke="#0d0908" stroke-width="2.600" paint-order="stroke">Lv.${r.req}–${RG[i+1]?RG[i+1].req-1:100}</text>
      ${i===here?`<text x="${x}" y="${y-25}" text-anchor="middle" font-size="8" font-weight="800" fill="#e6b450" stroke="#0d0908" stroke-width="2.600" paint-order="stroke">▼ SEN BURADASIN</text>`:""}
    </g>`);
  });
  return`<svg viewBox="0 0 ${W} ${H}" style="width:100%;display:block"><defs><linearGradient id="wsh" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0d0908" stop-opacity=".35"/><stop offset=".15" stop-color="#0d0908" stop-opacity="0"/><stop offset=".85" stop-color="#0d0908" stop-opacity="0"/><stop offset="1" stop-color="#0d0908" stop-opacity=".35"/></linearGradient></defs>
    <rect width="${W}" height="${H}" fill="#17100d"/><image href="img/harita.webp" width="${W}" height="${H}" preserveAspectRatio="none"/>
    <rect width="${W}" height="${H}" fill="#0d0908" opacity=".22"/><rect width="${W}" height="${H}" fill="url(#wsh)"/>${nodes.join("")}</svg>`;
}
function wmOpen(){
  let o=document.getElementById("wmfull");
  if(!o){o=document.createElement("div");o.id="wmfull";document.body.appendChild(o)}
  o.innerHTML=`<div class="wmf-bar"><span>🗺️ Valdrenn Haritası</span><button class="btn s" style="width:auto;padding:5px 12px" onclick="wmClose()">✕ Kapat</button></div><div class="wmf-body" id="wmbody" onclick="wmBg(event)"></div><div id="wmpop"></div>`;
  const nvEl=document.getElementById("nv");o.style.bottom=(nvEl?nvEl.offsetHeight:58)+"px";
  o.style.display="flex";
  wmRender();
  const b=document.getElementById("wmbody"),sv=b.querySelector("svg"),sc=(sv?sv.clientWidth:b.clientWidth)/360,r=RG[wmBest()];
  if(b&&r)b.scrollTop=Math.max(0,(r.y-200)*sc);
}
function wmRender(){
  const b=document.getElementById("wmbody"),p=document.getElementById("wmpop");if(!b)return;
  const st=b.scrollTop;b.innerHTML=worldMapSVG(true);b.scrollTop=st;
  if(p)p.innerHTML=wmPanel();
  if(b)b.style.paddingBottom=wmPop?"46vh":"0";
}
let wmPop=false;
function wmBg(e){const t=e.target;if(t&&t.closest&&t.closest("g[onclick]"))return;if(wmPop){wmPop=false;wmRender()}}
function wmPanel(){
  if(!wmPop||mapReg<0)return"";
  const r=RG[mapReg],o=open(mapReg),cl=!!P.boss[mapReg];
  const why=P.lv<r.req?"🔒 Gerekli Seviye: Lv."+r.req:(!o?"🔒 Önce "+RG[mapReg-1].mobs[RG[mapReg-1].mobs.length-1].name+" yen":"✅ Bölge Açık");
  return`<div class="wmf-pop"><div class="r" style="gap:8px;align-items:flex-start"><div style="min-width:0"><div class="nm" style="font-size:16px">${r.n} <span class="mu" style="font-size:10px;font-weight:400">${mapReg+1}/${RG.length}</span></div>
    <div style="font-size:10px;color:#cbd5e1">Maden & Set: <b class="g">${r.ore}</b> (Taban Güç ${r.pw})</div></div>
    <button class="btn s" style="width:auto;padding:4px 10px;margin:0;flex-shrink:0" onclick="wmPop=false;wmRender()">✕</button></div>
    <div style="font-size:10px;font-weight:800;color:${o?"#4ade80":"#f87171"};margin-top:4px">${why}${cl?" · 👑 Elit yenildi":""}</div>
    <div class="mu" style="font-size:10.5px;margin:6px 0;font-style:italic">${r.d||""}</div>
    <div class="mg" style="gap:7px">${r.mobs.map(m=>`<button class="mb" style="padding:7px" ${o?"":"disabled"} onclick="wmFight(${mapReg},${m.mi})">${mobSVG(m)}<div><div style="font-size:11.5px;font-weight:700;color:${m.el?"var(--gold)":"#fff"}">${m.el?"👑 ":""}${m.name}</div><div style="font-size:9.5px;color:#cbd5e1">Lv.${m.lv} · ${m.hp.toLocaleString()} HP</div></div></button>`).join("")}</div></div>`;
}
function wmClose(){wmPop=false;const o=document.getElementById("wmfull");if(o)o.style.display="none"}
function wmPick(i){mapReg=i;wmPop=true;wmRender();const b=document.getElementById("wmbody");if(b){const sv=b.querySelector("svg"),sc=(sv?sv.clientWidth:b.clientWidth)/360,y=RG[i].y*sc,vis=b.clientHeight*.5;if(y>b.scrollTop+vis-30||y<b.scrollTop+20)b.scrollTop=Math.max(0,y-vis/2+20)}}
function wmFight(ri,mi){wmClose();startCombat(ri,mi)}
function cMap(v){
  if(mapReg<0)mapReg=wmBest();
  const r=RG[wmBest()];
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
    <div class="cd"><div class="ct">🗺️ Valdrenn Haritası</div>
      <p class="mu" style="font-size:11px;margin-bottom:8px">Şu anki bölgen: <b class="g">${r.n}</b>. Haritada bir bölgeye dokununca canavarlar küçük bir pencerede açılır.</p>
      <button class="btn" onclick="wmOpen()">🗺️ Haritayı aç</button></div>
    ${typeof stCount==="function"?`<div class="cd"><div class="ct">📖 Hikâye Günlüğü <span class="g" style="font-size:11px;margin-left:6px">${stCount()}/${STORY.length}</span></div><p class="mu" style="font-size:11px;margin-bottom:8px">Her bölgenin Elit Boss'unu yendikçe Valdrenn'in gizli hikâyesinin yeni bir sayfası açılır.</p><button class="btn s" onclick="storyList()">📖 Günlüğü aç</button></div>`:""}`;
  if(wmAuto){wmAuto=false;setTimeout(wmOpen,0)}
  if(typeof storyCheck==='function')storyCheck();
}

/* ---------- DEMİRCİ ---------- */
function cForge(v){let src="";const mk=(i,k)=>`<div class="bc g${i.g} ${SF===i?"sel":""}" onclick="${k}"><span class="pl">+${i.p}</span>${ico(i.slot)}<span style="color:${G[i.g].c};font-size:7px;font-weight:700">${i.name}</span></div>`;
if(fsrc=="eq")SL.forEach(k=>{if(P.eq[k])src+=mk(P.eq[k],`selF('${k}')`)});else P.inv.forEach((i,n)=>src+=mk(i,`selF(${n})`));
let act=`<p class="mu" style="font-size:11px;text-align:center;padding:14px">Yükseltmek için bir eşya seç.</p>`;
if(SF){const i=SF,cost=8+i.rl*6+i.p*14,ch=i.p>=10?30-(i.p-10)*4:100-i.p*6;
const aff=(i.af||[]).map((a,n)=>`<div class="q"><span>✨ ${a.n} (+%${a.v})</span><button class="btn ${a.l?"":"s"}" onclick="lockA(${n})">${a.l?"🔒 Kilitli":"Açık"}</button></div>`).join("");
act=`<div style="border-top:1px solid var(--ln);margin-top:12px;padding-top:12px"><div class="r"><div><b style="color:${G[i.g].c}">${i.name} +${i.p}</b><div class="mu" style="font-size:10px">${G[i.g].n} · Gerekli Lv.${effLv(i)} · Başarı %${ch}</div></div><b class="g" style="font-size:11px">${cost} 🪙</b></div>
<p class="mu" style="font-size:10px;margin:6px 0">+6 üstü başarısızlıkta eşya düşebilir (+10 üstü kırılabilir). Koruma parşömenin: <b class="g">${P.sc}</b></p>
<label class="q" style="cursor:pointer;gap:8px"><input type="checkbox" ${SFprot?"checked":""} ${P.sc>0?"":"disabled"} onchange="SFprot=this.checked;view()" style="width:18px;height:18px"><span style="flex:1;font-size:11px">📜 Koruma parşömeni kullan <span class="mu">(yalnızca eşya zarar görecekse harcanır)</span></span></label>
${needHTML(i.p)}<button class="btn" onclick="upg()">Ocakta yükselt (+${i.p+1})</button>
${aff?`<div class="ct" style="margin-top:12px;font-size:12px;color:#c084fc">Efsun dönüştürücü</div>${aff}<button class="btn v" onclick="reroll()">Efsunları çevir (${rerollCost(i)} 🪙)</button>`:""}</div>`}
v.innerHTML=`<div class="cd"><div class="ct">Demirci ocağı <span class="g" style="font-size:11px">+15 sınırı</span></div><div class="mu" style="font-size:10px;margin-bottom:8px">${matLine()}</div>
<div class="pr" style="margin:0 0 10px"><button style="${fsrc=="eq"?"border-color:var(--gold);color:var(--gold)":""}" onclick="fsrc='eq';SF=null;view()">Kuşanılanlar</button><button style="${fsrc=="bag"?"border-color:var(--gold);color:var(--gold)":""}" onclick="fsrc='bag';SF=null;view()">Çantadakiler</button></div>
<div class="bg5" style="max-height:170px;overflow:auto">${src||'<p class="mu" style="font-size:10px">Eşya yok.</p>'}</div>${act}</div>`}
function selF(k){SF=fsrc=="eq"?P.eq[k]:P.inv[k];SFloc=[fsrc=="eq"?"eq":"inv",k];view()}
let SFloc=null,SFprot=false;
function sfReselect(){if(!SFloc){SF=null;return}SF=SFloc[0]==="eq"?P.eq[SFloc[1]]:P.inv[SFloc[1]];if(!SF)SFloc=null}
function rm(i){SL.forEach(k=>{if(P.eq[k]===i)P.eq[k]=null});const n=P.inv.indexOf(i);if(n>-1)P.inv.splice(n,1)}
async function upg(){
  const i=SF;if(!i||!SFloc)return;
  if(i.p>=15)return toast("Maksimum +15");
  const loc=SFloc,r=await ecoCall({op:"forge",a:"upg",loc,prot:SFprot&&P.sc>0});
  if(!r)return;
  if(r.removed){SF=null;SFloc=null}else sfReselect();
  view();
}
function lockA(n){SF.af[n].l=!SF.af[n].l;save();view()}
async function reroll(){
  if(!SF||!SFloc)return;
  const r=await ecoCall({op:"forge",a:"reroll",loc:SFloc});
  if(!r)return;
  sfReselect();view();
}

/* ---------- ŞEHİR & YETENEK ---------- */
function qp(q){return (P.q&&P.q[q.id])||{p:0,c:0}}
let citySub="shop"; // "shop" | "alch"
function setCitySub(s){citySub=s;armed="";view()}
function cCity(v){
const subNav=`<div class="sub-tabs">
  <button class="sub-tab ${citySub=="shop"?"act":""}" onclick="setCitySub('shop')">🏪 Tüccar</button>
  <button class="sub-tab ${citySub=="alch"?"act":""}" onclick="setCitySub('alch')">⛲ Pınar</button>
  <button class="sub-tab ${citySub=="bank"?"act":""}" onclick="setCitySub('bank')">🏦 Banka</button>
  <button class="sub-tab ${citySub=="market"?"act":""}" onclick="setCitySub('market')">🛒 Pazar</button>
  <button class="sub-tab ${citySub=="trade"?"act":""}" onclick="setCitySub('trade')">🤝 Takas</button>
</div>`;
const alchHtml=`
  <div class="cd" style="background:linear-gradient(135deg,#12305a66,var(--pn))">
    <div class="ct">⛲ Yaşam Pınarı <span style="color:#38bdf8;font-size:11px">${fountCost()} 🪙</span></div>
    <p class="mu" style="font-size:11px;margin-bottom:8px">Can ve manayı tamamen yeniler. Ücret seviyene göre artar.</p>
    <button class="btn b" ${P.gold>=fountCost()?"":"disabled"} onclick="fount()">Pınardan İç (${fountCost()} 🪙)</button>
  </div>
  <div class="cd">
    <div class="cd" style="padding:8px"><div class="r" style="margin-bottom:6px"><b style="font-size:12px">🛒 Alınacak adet</b><span class="mu" style="font-size:10px">Toplam fiyat butonlarda yazar</span></div>
    <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:4px;margin-bottom:6px">${[1,5,10,25,50].map(n=>`<button class="btn ${BUYQ===n?"":"s"}" style="padding:6px 2px;font-size:11px;border:1px solid ${BUYQ===n?"var(--gold)":"rgba(255,255,255,.15)"}" onclick="setBuyQ(${n})">${n}</button>`).join("")}</div>
    <div style="display:flex;gap:6px"><input type="number" inputmode="numeric" min="1" max="999" value="${BUYQ}" onchange="setBuyQ(this.value)" style="flex:1;min-width:0;padding:8px;background:#000;border:1px solid var(--ln);border-radius:8px;color:#fff;-webkit-user-select:text;user-select:text"><span class="mu" style="align-self:center;font-size:10px">adet (1-999)</span></div></div>
    <div class="ct">🧪 Simyacı — Can İksirleri <span class="mu" style="font-size:10px">Çanta: ${P.pot.hp.S}K · ${P.pot.hp.M}O · ${P.pot.hp.L}B</span></div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;text-align:center;margin-bottom:9px">
      ${["S","M","L"].map(sz=>{const d=POT_DEF.hp[sz];return`<div class="q" style="display:block;margin:0;padding:7px 4px;border:1px solid ${G[d.g].c}44"><b style="color:${G[d.g].c};font-size:10.5px">${d.sz} Can</b><div class="mu" style="font-size:9.5px">+${potAmt(P,"hp",sz)} HP · <span style="color:#fff">×${P.pot.hp[sz]||0}</span></div><button class="btn" style="margin-top:5px;padding:6px;font-size:11px" ${P.gold>=d.cost*BUYQ?"":"disabled"} onclick="buy('hp',${d.cost},'${sz}')">${d.cost*BUYQ} 🪙</button></div>`}).join("")}
    </div>
    <div class="ct">💧 Simyacı — Mana İksirleri <span class="mu" style="font-size:10px">Çanta: ${P.pot.mp.S}K · ${P.pot.mp.M}O · ${P.pot.mp.L}B</span></div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;text-align:center;margin-bottom:9px">
      ${["S","M","L"].map(sz=>{const d=POT_DEF.mp[sz];return`<div class="q" style="display:block;margin:0;padding:7px 4px;border:1px solid ${G[d.g].c}44"><b style="color:${G[d.g].c};font-size:10.5px">${d.sz} Mana</b><div class="mu" style="font-size:9.5px">+${potAmt(P,"mp",sz)} MP · <span style="color:#fff">×${P.pot.mp[sz]||0}</span></div><button class="btn b" style="margin-top:5px;padding:6px;font-size:11px" ${P.gold>=d.cost*BUYQ?"":"disabled"} onclick="buy('mp',${d.cost},'${sz}')">${d.cost*BUYQ} 🪙</button></div>`}).join("")}
    </div>
    <div class="q" style="margin:0;padding:8px 10px">
      <div><b style="color:#c084fc">📜 Koruma Parşömeni</b> <span class="mu">(Çanta: ×${P.sc})</span><div class="mu" style="font-size:9.5px">+6 ve üzeri yükseltmelerde kırılmayı/düşmeyi önler</div></div>
      <button class="btn v" style="width:auto;padding:7px 12px;font-size:11px" ${P.gold>=150*BUYQ?"":"disabled"} onclick="buy('sc',150)">${150*BUYQ} 🪙</button>
    </div>
  </div>`;
if(typeof mkOpen==="function"&&["bank","market","trade"].includes(citySub)){v.innerHTML=subNav+'<div id="mk-box"></div>';mkOpen(citySub);return}
v.innerHTML=subNav+(citySub=="shop"?shopHTML():alchHtml);
}
async function claim(id){const r=await ecoCall({op:"eco",a:"claim",kind:"q",id});if(r){hud();view()}}
const fountCost=()=>20+P.lv*8;
function fount(){if(P.hp>=P.maxHp&&P.mp>=P.maxMp)return toast("Canın ve manan zaten dolu");const c=fountCost();if(P.gold<c)return toast("Yetersiz altın ("+c+" 🪙 gerekir)");P.gold-=c;P.hp=P.maxHp;P.mp=P.maxMp;A.pot();hud();save();view();toast("Can ve mana doldu (-"+c+" 🪙)")}
let BUYQ=1;
function setBuyQ(v){BUYQ=Math.max(1,Math.min(999,Math.floor(Number(v))||1));view()}
async function buy(t,c,sz="S"){const n=BUYQ;if(P.gold<c*n)return toast("Yetersiz altın");const r=await ecoCall({op:"eco",a:"buy",t,sz,n});if(r){hud();view()}}
function cSkills(v){v.innerHTML=skillsHTML()}
function resetSk(){const c=P.lv*30;if(armed!="rsk"){armed="rsk";view();return}armed="";if(P.gold<c)return toast("Yetersiz altın");const t=Object.values(P.sr).reduce((a,b)=>a+(b|0),0);if(!t)return;P.gold-=c;P.sp+=t;P.sr={};sync();save();view();toast("Yetenekler sıfırlandı: +"+t+" SP")}
function upSk(i){if(P.sp<=0)return;P.sp--;P.sr[i]=(P.sr[i]||0)+1;A.lvl();save();view()}

/* ---------- EŞYA İNCELEME ---------- */
function insp(n){const i=P.inv[n];if(!i)return;const ok=i.rc==P.cls,el=effLv(i),cur=P.eq[i.slot],sy=salvageYield(i);
const syTxt=Object.entries(sy).map(([k,v])=>MT[k][0]+"+"+v).join(" ");
$("ic").innerHTML=`<div style="text-align:center;margin-bottom:10px"><b style="color:${G[i.g].c};font-size:15px">${i.name} +${i.p}</b><div class="mu" style="font-size:11px">${G[i.g].n} ${G[i.g].t} · ${SN[i.slot]} (${i.setOre||i.name.split(" ")[0]} Seti)</div></div>
<div class="q" style="display:block;line-height:1.6">Sınıf: <b style="color:${ok?"#4ade80":"#f87171"}">${CL[i.rc].n}</b><br>Seviye: <b style="color:${P.lv>=el?"#4ade80":"#f87171"}">Lv.${el}</b> (sen: ${P.lv})<br>Güç: <b class="g">${pw(i)}</b>${cur?` <span class="mu">(kuşanılan: ${pw(cur)})</span>`:""}${i.slot=="weapon"?`<br>⚔️ <b style="color:#fbbf24">${wLine(i)}</b>${cur&&cur.slot=="weapon"?`<br><span class="mu" style="font-size:10px">Kuşanılan: ${wLine(cur)}</span>`:""}`:""}${(i.af||[]).map(a=>`<br><span style="color:#c084fc">✨ ${a.n} +%${a.v}</span>`).join("")}</div>
<div style="display:grid;grid-template-columns:2fr 1fr 1fr;gap:6px">
  <button class="btn" ${ok&&P.lv>=el?"":"disabled"} onclick="equip(${n})">${!ok?"Uyumsuz":P.lv<el?"Lv."+el:"Kuşan"}</button>
  <button class="btn em2" onclick="salvageItem(${n})">🔨 ${syTxt}</button>
  <button class="btn d" onclick="sell(${n})">${sellV(i)}🪙</button>
</div>
<button class="btn s" style="margin-top:8px" onclick="closeM()">Kapat</button>`;$("im").style.display="flex"}
function inspEq(k){const i=P.eq[k];$("ic").innerHTML=`<div style="text-align:center;margin-bottom:10px"><b style="color:${G[i.g].c}">${i.name} +${i.p}</b><div class="mu" style="font-size:11px">Güç ${pw(i)} · ${i.setOre||i.name.split(" ")[0]} Seti${effLv(i)>P.lv?" · seviye yetersiz, pasif":""}</div>${k=="weapon"?`<div style="text-align:center;color:#fbbf24;font-size:12px;margin-top:4px">⚔️ ${wLine(i)}</div>`:""}${(i.af||[]).map(a=>`<div style="text-align:center;color:#c084fc;font-size:11px">✨ ${a.n} +%${a.v}</div>`).join("")}</div><button class="btn" onclick="unequip('${k}')">Çantaya çıkar</button><button class="btn s" style="margin-top:8px" onclick="closeM()">Kapat</button>`;$("im").style.display="flex"}

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
  if(t=="hp"){const r=Math.min(potAmt(P,"hp",sz),P.maxHp-P.hp);P.hp=Math.min(P.maxHp,P.hp+r);toast(`🧪 ${def.n} içildi: +${r} HP`)}
  else{const r=Math.min(potAmt(P,"mp",sz),P.maxMp-P.mp);P.mp=Math.min(P.maxMp,P.mp+r);toast(`💧 ${def.n} içildi: +${r} MP`)}
  hud();save();
  if((P.pot[t][sz]||0)>0)inspStack("pot_"+t+"_"+sz);else{closeM();view()}
}

async function sellStack(key,cnt){
  const st=STACK_DEFS.find(x=>x.key===key);if(!st)return;
  if(st.get()<cnt)return;
  const r=await ecoCall({op:"eco",a:"stack",key,cnt});
  if(!r)return;
  hud();
  if(st.get()>0)inspStack(key);else{closeM();view()}
}
const closeM=()=>$("im").style.display="none";
function equip(n){const i=P.inv[n],o=P.eq[i.slot];P.eq[i.slot]=i;P.inv.splice(n,1);if(o)P.inv.push(o);closeM();sync();save();view();toast(i.name+" kuşanıldı")}
function unequip(k){if(P.inv.length>=50)return toast("Çanta dolu");P.inv.push(P.eq[k]);P.eq[k]=null;closeM();sync();save();view()}
async function sell(n){closeM();const r=await ecoCall({op:"eco",a:"sell",i:n});if(r){hud();view()}}

/* ---------- SAVAŞ ---------- */
let CB={on:false,auto:false,fast:false},aT=null;
const RNG=mkRng(()=>Math.random());
/* Motorun döndürdüğü olayları ekranda uygula (sıra korunur) */
function applyEv(out){for(const e of out){if(e.lg!==undefined)lg(e.lg);else if(e.fx)fx(e.fx[0],e.fx[1]);else if(e.snd){A[e.snd]();if(e.snd==='crit')hap(25);else if(e.snd==='lvl')hap([40,60,40,60,90])}else if(e.toast)toast(e.toast);else if(e.shake)shake();else if(e.vig){vig();hap(18);hurtFx()}else if(e.ev){ssEv(e.ev[0],e.ev[1]);ev(e.ev[0],e.ev[1]);if(e.ev[0]==='lvl')lvlFx(e.ev[1])}else if(e.win)ssWin(e.win);else if(e.junk)ssJunk(e.junk);else if(e.loot)ssLoot(e.loot);else if(e.kill){dieFx();hap([30,40,30]);onKill(e.kill)}else if(e.sk!==undefined)skillFx(e.sk)}}
/* Öldürme: günlük ve normal görev ilerlemesi */
function onKill(){}
/* ---- Savaş sunucuda oynanır (Supabase 'battle' fonksiyonu). Burası sonucu ekranda oynatır. ---- */
let battleBusy=false,bStarting=false,autoRun=false;
const bSleep=ms=>new Promise(r=>setTimeout(r,ms));
const B_ERR={bolge_kapali:"Bu bölge henüz açık değil",gecersiz_istek:"Geçersiz savaş isteği",savas_yok:"Savaş sona ermiş",kayit_yok:"Kayıt sunucuya yüklenemedi",kayit_uyumsuz:"Kayıt eşitlenemedi, tekrar dene",giris_gerekli:"Oturum süresi dolmuş, hesaba tekrar giriş yap",cakisma:"Kayıt çakıştı, tekrar dene",sunucu_hatasi:"Sunucu hatası, biraz sonra tekrar dene",fn_yok:"Savaş fonksiyonu sunucuda bulunamadı (kurulum eksik)"};
function bFail(r){toast("⚠️ "+(r.err==="ag"?"Sunucuya ulaşılamadı. Savaş için internet gerekli.":r.err==="cevrimdisi"?"Savaş için hesabına bağlı ve çevrimiçi olmalısın.":(B_ERR[r.err]||"Savaş hatası: "+r.err)))}
/* sunucunun kaydı hesaplarken dikkate aldığı alanlar (can/mana, görev, ayar hariç) */
function bSig(){const o={};for(const k in P)if(!["hp","mp","ts","dl","q","selPot","autoCfg","art"].includes(k))o[k]=P[k];return JSON.stringify(o)}
async function bcall(body){
  if(!CLOUD.sb||!CLOUD.user)return{err:"cevrimdisi"};
  body={...body,slot:activeSlot,name:P.name,cls:P.cls};
  for(let t=0;t<4;t++){
    let data=null,error=null;
    try{const r=await CLOUD.sb.functions.invoke("battle",{body});data=r.data;error=r.error}catch(e){error=e}
    if(error||!data){const st=error&&error.context&&error.context.status;
      return{err:st===401?"giris_gerekli":st===404?"fn_yok":"ag"}}
    if(data.err==="bekle"){await bSleep(Math.min(3000,(data.ms||200)+40));continue}
    if(data.err==="cakisma"){await bSleep(300);continue}
    return data;
  }
  return{err:"bekle"};
}
/* Savaştan önce: son değişiklikler (kuşanma, satış, nitelik...) sunucudaki kayda ulaşmış olmalı */
async function bflush(){
  if(CLOUD.sig===bSig())return true;
  clearTimeout(CLOUD.timer);CLOUD.timer=null;
  for(let i=0;i<3;i++){if(await cloudPush(true))return true;if(CLOUD.hold)return false;await bSleep(2600)}
  return false;
}
/* Demirci, sandık gibi tek adımlık işlemler sunucuda yapılır; sonuç kayda yazılır, burada gösterilir */
let ecoBusy=false;
async function ecoCall(body){
  if(cbLocked()){cbWarn();return null}
  if(ecoBusy||battleBusy||bStarting)return null;
  ecoBusy=true;
  try{
    const ctx={P};
    if(!(await bflush())){toast("⚠️ İlerleme buluta gönderilemedi, işlem yapılamadı. Bağlantını kontrol et.");return null}
    if(ctx.P!==P)return null;
    const r=await bcall(body);
    if(r.err){bFail(r);return null}
    if(ctx.P!==P)return null;
    const hp0=P.hp,mp0=P.mp;
    for(const k in r.ps)P[k]=r.ps[k];
    P.hp=hp0;P.mp=mp0; /* can/mana yerelde tutulur; sunucudaki kopya eski kalabiliyordu (çubuk oynuyordu) */
    sync();CLOUD.sig=bSig();
    if(r.done)saveAll();
    applyEv(r.steps[0].out);
    return r;
  }finally{ecoBusy=false}
}
function applySnap(s){
  P.hp=s.hp;P.mp=s.mp;P.maxHp=s.maxHp;P.maxMp=s.maxMp;P.pot=s.pot;P.st.d=s.d;
  const b=s.B,m=CB.mob;
  CB.tele=b.tele;CB.stun=b.stun;CB.sh=b.sh;CB.shT=b.shT;CB.pz=b.pz;CB.pzT=b.pzT;CB.dot=b.dot;CB.dotT=b.dotT;CB.dotN=b.dotN;CB.rage=b.rage;CB.armor=b.armor;CB.ph=b.ph;
  if(m){m.hp=b.mhp;m.atk=b.matk}
  if(s.ps)for(const k in s.ps)P[k]=s.ps[k];
}
function bShowWin(m){
  CB.over=true;const o=$("ov");
  if(o)o.innerHTML=`<div class="pr" style="margin-top:8px"><button class="btn" style="color:#000" onclick="${CB.tw?`startCombat(0,0,1,${CB.tw+1})`:`startCombat(${m.ri},${m.mi},1)`}">${CB.tw?"🗼 Sonraki kat":"⚔️ Tekrar savaş"}</button><button class="btn s" onclick="endC()">Harita</button>${P.ch?`<button class="btn s" onclick="chestUI()">🎁 ${P.ch}</button>`:""}</div>`}
/* Sunucudan gelen adımları sırayla ekranda oynat. Sunucu işi çoktan bitirdi; oynatma kesilse bile son durum uygulanır. */
async function bReplay(r,ctx){
  let first=true,lost=false;
  const d=()=>CB.fast?230:520;
  try{
    for(const st of r.steps){
      if(!CB.on||P!==ctx.P)break;
      if(!first)await bSleep((ctx.auto&&!CB.auto)?70:d());first=false;   /* oto savaş durdurulsa da kalan savaşlar anında yutulmaz: her adım görünür (hızlı) oynar */
      if(!CB.on||P!==ctx.P)break;
      if(st.start){CB={...CB,on:true,over:false,...st.start,log:CB.log||[],acts:[],fin:false};if(!(CB.nav&&tab!=="map"))view()}
      applySnap(st.s);applyEv(st.out);
      if(st.win){bShowWin(CB.mob);hud();saveAll(true)}
      if(st.lose!==undefined){
        stopAuto();CB.on=false;CB.over=true;lost=true;
        toast("Yenildin! Altın kaybetmedin, şehirde uyandın");break}
      upd();
    }
  }finally{
    if(P===ctx.P){
      for(const k in r.ps)P[k]=r.ps[k];
      if(r.over)CB.over=true;
      sync();CLOUD.sig=bSig();
      /* savaş sürüyorsa: sunucunun bıraktığı yerden (tohum, sayaç) yerel oynamaya devam edilir */
      if(r.B&&CB.on&&!CB.over&&!lost){CB.seed=r.B.seed;CB.k=r.B.k;CB.rng=seeded(CB.seed,CB.k||0);CB.acts=[];CB.t0=Date.now()}
      if(lost){saveAll();CB.busy=false;battleBusy=false;go("city");return}
      if(CB.on)upd();
      saveAll(true);
    }
    CB.busy=false;battleBusy=false;
  }
}
/* Zaferde sunucu bir sonraki savaşı da hazır tutar (çağrı tasarrufu): "Tekrar savaş" ek çağrı gerektirmez */
function adoptPre(ri,mi,tw){
  const pr=CB.pre;
  if(!(pr&&CB.on&&CB.over&&pr.ri===ri&&pr.mi===mi&&(pr.tw||0)===(tw||0)&&CLOUD.sig===bSig()))return false;
  CB={...CB,on:true,over:false,busy:false,...pr.nb,pre:null,acts:[],fin:false};
  CB.rng=seeded(CB.seed,CB.k||0);CB.t0=Date.now();view();lg("⚔️ <b>"+CB.mob.name+"</b> ile dövüş başladı!");upd();return true;
}
async function startCombat(ri,mi,keep,tw){
  if(battleBusy||bStarting)return;
  if(!keep&&!CB.on)SS=newSS();
  if(adoptPre(ri,mi,tw))return;
  CB.pre=null;
  bStarting=true;
  const ctx={P};
  try{
    if(!(await bflush())){toast("⚠️ İlerleme buluta gönderilemedi, savaş başlatılamadı. Bağlantını kontrol et.");return}
    if(ctx.P!==P)return;
    battleBusy=true;
    let r=await bcall({op:"start",ri,mi,tw:tw||0,hp:Math.floor(P.hp),mp:Math.floor(P.mp)});
    if(r.err==="kayit_yok"||r.err==="kayit_uyumsuz"){
      if(await cloudPush(true))r=await bcall({op:"start",ri,mi,tw:tw||0,hp:Math.floor(P.hp),mp:Math.floor(P.mp)});
    }
    if(r.err||ctx.P!==P){battleBusy=false;if(r.err)bFail(r);return}
    CB={...CB,on:true,over:false,busy:true,log:keep?CB.log:[]};
    await bReplay(r,ctx);
  }finally{bStarting=false}
}
function lg(t){CB.log.unshift(t);if(CB.log.length>40)CB.log.pop();if(CB.lt!=="gain")renderLG()}
function combatUI(v){const m=CB.mob,c=CL[P.cls];
v.innerHTML=`<div class="cd mc" id="mc"><div class="bn" style="opacity:.55">${banner(RG[CB.ri].h)}</div><div class="rel"><div class="au"></div><div class="mav" id="mav">${mobSVG(m)}<div class="fl" id="fl"></div></div>
<div class="nm" style="font-size:16px;color:${m.el?"var(--gold)":"#fff"}">${m.el?"👑 ":""}${m.name} <span class="mu" style="font-size:11px;font-family:var(--bs)">Lv.${m.lv}</span></div>
<div class="bar" style="max-width:280px;margin:7px auto;height:11px"><i class="gh" id="mgh"></i><i class="hpf" id="mh"></i><b id="mt"></b></div><div class="tb" id="tb"></div><div id="st" style="font-size:10px;min-height:14px"></div></div></div>
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
<div class="sub-tabs" style="margin:6px 0 4px;padding:3px"><button class="sub-tab" id="lt1" onclick="setLT('log')">📜 Günlük</button><button class="sub-tab" id="lt2" onclick="setLT('gain')">🏆 Kazanımlar</button></div><div class="log" id="lg"></div><div id="ov"></div>`;renderLG()}
/* ---------- Oto savaş sürerken diğer sekmelere bakabilme ---------- */
const cbLocked=()=>!!(CB.on&&(CB.auto||!CB.over));
function cbWarn(){toast("⚔️ Savaş sürerken bu işlem yapılamaz. Önce ⏸ Oto'yu durdur ve savaşı bitir (bakmak serbest).");return true}
function updMini(make){
  const v=$("mv");if(!v||!CB.on||!(CB.nav&&tab!=="map"))return;
  let b=$("cbm");
  if(!b){if(!make)return;v.insertAdjacentHTML("afterbegin",'<div id="cbm" onclick="go(\'map\')" style="cursor:pointer;background:rgba(230,180,80,.13);border:1px solid rgba(230,180,80,.5);border-radius:9px;padding:6px 9px;margin-bottom:8px;font-size:10.5px"></div>');b=$("cbm")}
  const m=CB.mob,pc=m?Math.max(0,Math.floor(m.hp/m.mx*100)):0;
  b.innerHTML=`<div style="display:flex;justify-content:space-between;gap:6px"><span>${CB.auto?"🤖 <b>Oto savaş sürüyor</b>":"⏸ <b>Oto durdu</b>"}${m?" · "+(m.el?"👑 ":"")+m.name+" %"+pc:""}</span><span class="g">☠️ ${SS.k} · 🪙 +${SS.g.toLocaleString("tr-TR")}</span></div><div class="mu" style="font-size:9.5px">Savaşa dönmek için dokun · Bu sırada yalnızca bakabilirsin</div>`;
}
/* Savaş oturumu kazanımları (savaş ekranının "Kazanımlar" bölümü) */
const newSS=()=>({t0:Date.now(),k:0,e:0,g:0,x:0,dmg:0,max:0,hits:0,crit:0,items:{},mats:{},pots:{},lvl:0});
let SS=newSS();
function ssEv(n,v){if(n==="dmg"){SS.dmg+=v;SS.hits++;if(v>SS.max)SS.max=v}else if(n==="crit")SS.crit++}
function ssWin(w){SS.k++;if(w.el)SS.e++;SS.g+=w.g;SS.x+=w.x;if(CB.lt==="gain")renderLG()}
function ssJunk(j){SS.jn=(SS.jn||0)+j.n;SS.jg=(SS.jg||0)+j.g;if(CB.lt==="gain")renderLG()}
function ssLoot(l){
  const to=l.k==="item"?SS.items:l.k==="mat"?SS.mats:SS.pots;
  const o=to[l.t]||(to[l.t]={n:0,c:l.c||"#fff",g:l.g||0});o.n+=l.n||1;
  if(CB.lt==="gain")renderLG();
}
function gainHtml(){
  const s=SS,mins=Math.max(1,(Date.now()-s.t0)/6e4),f=n=>Math.floor(n).toLocaleString("tr-TR");
  const list=(o,ic)=>Object.entries(o).sort((a,b)=>(b[1].g||0)-(a[1].g||0)||b[1].n-a[1].n).map(([t,v])=>`<div style="color:${v.c}">${ic} ${t} <b>×${v.n}</b></div>`).join("");
  const loot=list(s.items,"📦")+list(s.pots,"🧪")+list(s.mats,"🔹");
  return`<div style="display:grid;grid-template-columns:1fr 1fr;gap:2px 8px;margin-bottom:5px">
    <div>☠️ Öldürülen: <b>${s.k}</b>${s.e?" (👑"+s.e+")":""}</div><div>🪙 Altın: <b class="g">+${f(s.g)}</b></div>
    <div>✨ XP: <b>+${f(s.x)}</b></div><div>⏱️ Süre: <b>${Math.floor(mins)} dk</b></div>
    <div>⚔️ Toplam hasar: <b>${f(s.dmg)}</b></div><div>💥 En yüksek: <b>${f(s.max)}</b></div>
    <div>🎯 Ort. vuruş: <b>${s.hits?f(s.dmg/s.hits):0}</b></div><div>🔥 Kritik: <b>${s.crit}</b>${s.hits?" (%"+Math.round(s.crit/s.hits*100)+")":""}</div>
    <div>🪙/dk: <b>${f(s.g/mins)}</b></div><div>☠️/dk: <b>${(s.k/mins).toFixed(1)}</b></div></div>
    ${s.jn?`<div style="margin-bottom:3px">🧹 Otomatik ${s.jn} eşya ${s.jg?"satıldı (+"+f(s.jg)+" 🪙)":"işlendi"}</div>`:""}
    <div style="border-top:1px solid var(--ln);padding-top:4px">${loot||'<span class="mu">Henüz eşya/malzeme düşmedi</span>'}</div>
    <button class="btn s" style="margin-top:5px;padding:3px;font-size:9.5px" onclick="SS=newSS();renderLG()">🔄 Sayacı sıfırla</button>`;
}
function setLT(m){CB.lt=m;renderLG()}
function renderLG(){
  const b=$("lg");if(!b)return;
  const gm=CB.lt==="gain";
  const t1=$("lt1"),t2=$("lt2");if(t1)t1.className="sub-tab"+(gm?"":" act");if(t2)t2.className="sub-tab"+(gm?" act":"");
  b.innerHTML=gm?gainHtml():CB.log.map(x=>"<div>"+x+"</div>").join("");
}
function upd(){if(!CB.on)return;if(!$("mh")){updMini();return}const m=CB.mob;
$("mh").style.width=m.hp/m.mx*100+"%";if($("mgh"))$("mgh").style.width=m.hp/m.mx*100+"%";$("mt").innerText=m.hp.toLocaleString()+" / "+m.mx.toLocaleString();
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
function fx(t,c){if(!SET.dmg)return;const f=$("fl");if(!f)return;const s=document.createElement("span");s.className="fn"+(String(t).charAt(0)==="💥"?" cr":String(t).charAt(0)==="+"?" hl":"");s.style.cssText=`color:${c};left:${30+R(40)}%;top:${20+R(20)}%`;s.innerText=t;f.appendChild(s);setTimeout(()=>s.remove(),850)}
function shake(){if(!SET.shk)return;const a=$("mav");if(!a)return;a.classList.add("sk");setTimeout(()=>a.classList.remove("sk"),250)}
/* ---- Savaş efektleri (yalnızca görsel) ---- */
function hap(p){try{if(!SET.hap||localStorage.getItem("kz_nohap")==="1")return;if(navigator.vibrate)navigator.vibrate(p)}catch(e){}}
function togHap(){SET.hap=SET.hap?0:1;try{localStorage.setItem("kz_nohap",SET.hap?"0":"1");localStorage.setItem("kz_set",JSON.stringify(SET))}catch(e){}view()}
function hapOn(){return !!SET.hap}
const SFX={tank:["bash","ward","roar","nova"],mage:["fire","ice","ward","meteor"],archer:["poison","arrows","mark","rain"],assassin:["bleed","dust","dark","exec"],healer:["holy","bash","heal","dome"]};
const SFXB={tank:"slash",mage:"bolt",archer:"arrow",assassin:"slash",healer:"spark"};
function sxAdd(f,cls,col,dl,st){const d=document.createElement("div");d.className="sx "+cls;d.style.setProperty("--c",col);if(dl)d.style.animationDelay=dl+"ms";if(st)d.style.cssText+=st;f.appendChild(d);setTimeout(()=>d.remove(),900+(dl||0))}
function skillFx(i){const f=$("fl");if(!f||!CB.on)return;const k=i<0?SFXB[P.cls]:SFX[P.cls][i];
 const W="#fff",G="#e8b04a";
 if(k==="slash")sxAdd(f,"sl",W);
 else if(k==="bolt"){sxAdd(f,"bl","#9ecbff");sxAdd(f,"bb","#7aa8ff")}
 else if(k==="arrow")sxAdd(f,"ar","#f1e6df");
 else if(k==="spark"){sxAdd(f,"bb",G)}
 else if(k==="bash"){sxAdd(f,"sl",W);sxAdd(f,"rg","#9ecbff",120)}
 else if(k==="ward"){sxAdd(f,"rg","#4f9bf0");sxAdd(f,"rg","#4f9bf0",150)}
 else if(k==="roar"){sxAdd(f,"rg","#e5484d");sxAdd(f,"rg","#e5484d",140);shake()}
 else if(k==="nova"||k==="dome"){sxAdd(f,"bb",G,0,"width:150px;height:150px;margin:-75px");sxAdd(f,"rg",G,60);if(k==="nova")shake()}
 else if(k==="fire"){sxAdd(f,"bb","#f08a3c");sxAdd(f,"rg","#f08a3c",80)}
 else if(k==="ice"){sxAdd(f,"bb","#8fd6ff");sxAdd(f,"rg","#bfe8ff",60)}
 else if(k==="meteor"){sxAdd(f,"bb","#ff6a2a",0,"width:170px;height:170px;margin:-85px");sxAdd(f,"rg","#ffb060",90);shake();hap(40)}
 else if(k==="poison"||k==="bleed"){sxAdd(f,"bb",k==="poison"?"#8fd32a":"#e5484d");sxAdd(f,"ar","#caff5a")}
 else if(k==="arrows"||k==="rain"){for(let n=0;n<(k==="rain"?5:3);n++)sxAdd(f,"ar","#f1e6df",n*70,"top:"+(18+n*13)+"%")}
 else if(k==="mark"){sxAdd(f,"rg","#e5484d");sxAdd(f,"sl","#e5484d",100)}
 else if(k==="dust"){sxAdd(f,"bb","#a58f84")}
 else if(k==="dark"){sxAdd(f,"bb","#7c3aed")}
 else if(k==="exec"){for(let n=0;n<3;n++)sxAdd(f,"sl","#e5484d",n*90,"transform:rotate("+(-50+n*35)+"deg);top:"+(24+n*8)+"%");shake()}
 else if(k==="holy"){sxAdd(f,"bb",G);sxAdd(f,"rg","#fff3b0",90)}
 else if(k==="heal"){sxAdd(f,"bb","#4ade80")}
}
function hurtFx(){const c=$("mc");if(!c)return;c.classList.add("hurt");const a=$("mav");if(a)a.classList.add("lunge");setTimeout(()=>{c.classList.remove("hurt");if(a)a.classList.remove("lunge")},320)}
function dieFx(){const a=$("mav");if(a)a.classList.add("die")}
function lvlFx(l){const o=document.createElement("div");o.className="lvfx";o.innerHTML=`<div class="lvr"></div><b>SEVİYE ${l}</b>`;document.body.appendChild(o);setTimeout(()=>o.remove(),1900)}
function vig(){const e=$("vg");e.classList.add("h");setTimeout(()=>e.classList.remove("h"),200)}
/* Manuel savaş telefonda oynanır (sunucunun verdiği tohumla); bitince hamle listesi sunucuya gider, sunucu aynısını oynatıp ödülü verir */
function act(i){
  if(!CB.on||CB.over||CB.busy||battleBusy||!CB.rng)return;
  const out=bAct(CB,P,i,CB.rng);applyEv(out);if(!out.acted)return;
  CB.acts.push(i);upd();
  if(CB.mob.hp<=0){finishFight();return}
  CB.busy=true;setTimeout(mobTurn,CB.fast?120:380)}
function mobTurn(){CB.busy=false;if(!CB.on||CB.over)return;const out=bMobTurn(CB,P,CB.rng);applyEv(out);upd();
  if(P.hp<=0||CB.mob.hp<=0)finishFight()}
async function finishFight(partial){
  if(CB.fin||!CB.on)return;
  CB.fin=true;CB.busy=true;battleBusy=true;
  const ctx={P},acts=CB.acts.slice();
  /* sunucunun tempo kuralı: gereksiz çağrı (ve 'bekle' yanıtı) olmasın diye süreyi burada bekle */
  const need=Math.max(partial?0:1500,acts.length*200)+120-(Date.now()-(CB.t0||0));
  if(need>0)await bSleep(need);
  const next=partial?undefined:(CB.tw?{ri:0,mi:0,tw:CB.tw+1}:{ri:CB.ri,mi:CB.mi,tw:0});
  const r=await bcall({op:"finish",acts,partial:!!partial,next});
  CB.fin=false;
  if(ctx.P!==P){battleBusy=false;return}
  if(r.err){
    CB.busy=false;battleBusy=false;
    if(["gecersiz_eylem","bitmedi","savas_yok"].includes(r.err)){toast("⚠️ Savaş sunucuyla eşleşmedi, savaş sıfırlandı");CB.on=false;stopAuto();go("map")}
    else{bFail(r);if(!partial&&CB.on){CB.busy=false;CB.fin=false;setTimeout(()=>finishFight(),2500)}}
    return}
  const pre=r.steps.find(x=>x.start);
  r.steps=r.steps.filter(x=>!x.start);
  CB.pre=pre?{ri:pre.start.ri,mi:pre.start.mi,tw:pre.start.tw||0,nb:pre.start}:null;
  await bReplay(r,ctx);
}
function endC(){CB.on=false;CB.pre=null;stopAuto();save();go("map")}
function flee(){
  if(CB.on&&!CB.over&&CB.acts&&CB.acts.length&&!CB.fin)finishFight(true);
  CB.on=false;CB.pre=null;stopAuto();save();toast("Savaştan kaçtın");go("map")}
function cycleSelPot(t){
  const order=["S","M","L"];
  const cur=P.selPot[t]||"S";
  P.selPot[t]=order[(order.indexOf(cur)+1)%3];
  const d=POT_DEF[t][P.selPot[t]];
  toast(`${d.e} Seçili iksir: ${d.n} (+${potAmt(P,t,P.selPot[t])})`);
  save();upd();
}
function pot(t,szOverride){
  if(!CB.on||CB.over||CB.busy||battleBusy||!CB.rng)return false;
  const sz=szOverride||P.selPot[t]||"S";
  const out=bPot(P,t,sz,!!szOverride);applyEv(out);
  if(!out.ok)return false;
  CB.acts.push(["p",t,sz]);
  saveAll(true);upd();
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
        ${["S","M","L"].map(sz=>{const d=POT_DEF.hp[sz];return optBtn("hp",sz,`${d.sz} (×${P.pot.hp[sz]||0})`,`+${potAmt(P,"hp",sz)} HP`)}).join("")}
      </div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:4px">
        ${[25,40,55,70].map(v=>thrBtn("hpThr",v)).join("")}
      </div>
    </div>

    <div class="q" style="display:block;margin-bottom:10px">
      <div class="r" style="margin-bottom:5px"><b style="color:#60a5fa;font-size:11.5px">💧 Mana İksiri Boyutu</b><span class="mu" style="font-size:9.5px">Mana %${cfg.mpThr} altına inince içer</span></div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:4px;margin-bottom:6px">
        ${optBtn("mp","off","Kullanma","Pasif")}
        ${["S","M","L"].map(sz=>{const d=POT_DEF.mp[sz];return optBtn("mp",sz,`${d.sz} (×${P.pot.mp[sz]||0})`,`+${potAmt(P,"mp",sz)} MP`)}).join("")}
      </div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:4px">
        ${[15,25,40,55].map(v=>thrBtn("mpThr",v)).join("")}
      </div>
    </div>

    <div class="q" style="display:block;margin-bottom:10px">
      <button class="btn ${cfg.buy?"":"s"}" style="width:100%;padding:8px;font-size:11px;border:1px solid ${cfg.buy?"var(--gold)":"rgba(255,255,255,.15)"}" onclick="setAutoCfg('buy',${cfg.buy?"false":"true"})"><b>${cfg.buy?"✅":"⛔"} İksir bitince otomatik satın al</b><div style="font-size:9px;opacity:.85;margin-top:2px">Seçili iksir bitince ve gerekince 10 adede kadar altınla alır</div></button>
      ${cfg.buy?`<div style="margin-top:8px;font-size:10.5px"><b>💰 Altın rezervi</b> <span class="mu" style="font-size:9.5px">(altının bunun altına inmesin)</span></div>
      <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:5px;margin-top:5px">${[[0,"Yok"],[200,"200"],[1000,"1.000"],[5000,"5.000"],[20000,"20.000"]].map(([v,l])=>`<button class="btn ${(cfg.keep|0)===v?"":"s"}" style="padding:5px 1px;font-size:10px;margin:0" onclick="setAutoCfg('keep',${v})">${l}</button>`).join("")}</div>`:""}
    </div>
    <button class="btn" onclick="startAutoWithCfg()">${alreadyRunning?"✅ Ayarları Uygula":"▶ Otomatik Savaşı Başlat"}</button>
    <button class="btn s" style="margin-top:6px" onclick="closeM()">Vazgeç</button>
  `;
  $("im").style.display="flex";
}
function startAutoWithCfg(){
  closeM();
  if(!CB.auto){CB.auto=true;autoLoop()}
  upd();
  toast("🤖 Otomatik savaş aktif!");
}
function stopAuto(){CB.auto=false;if(battleBusy&&CB.on&&!CB.over&&typeof toast==="function"&&autoRun)toast("⏹ Oto savaş duruyor: sunucuda başlamış savaşlar bitiriliyor")}
/* Oto savaş: her istekte sunucu birkaç savaşı birden oynar, burada sırayla izlenir */
async function autoLoop(){
  if(autoRun)return;autoRun=true;
  try{
    while(CB.auto&&CB.on){
      if(battleBusy||CB.busy||bStarting){await bSleep(200);continue}
      if(!((CB.over||(CB.acts&&CB.acts.length))?true:await bflush())){stopAuto();toast("⚠️ İlerleme buluta gönderilemedi, oto savaş durdu");upd();break}
      const nx=CB.over?{ri:CB.ri,mi:CB.mi,tw:CB.tw?CB.tw+1:0}:{ri:CB.ri,mi:CB.mi,tw:CB.tw||0};
      if(CB.over&&CB.pre&&!adoptPre(nx.ri,nx.mi,nx.tw)){CB.pre=null}
      const pend=(!CB.over&&CB.acts&&CB.acts.length)?CB.acts.slice():undefined;
      const ctx={P,auto:true};battleBusy=true;CB.busy=true;
      const r=await bcall({op:"auto",fights:CB.fast?8:5,...nx,acts:pend,cfg:P.autoCfg});
      if(ctx.P!==P||!CB.on){CB.busy=false;battleBusy=false;break}
      if(r.err){CB.busy=false;battleBusy=false;stopAuto();bFail(r);upd();break}
      await bReplay(r,ctx);
      if(r.stopped==="stop"||r.stopped==="noact"){if(CB.auto){stopAuto();upd();if(r.stopped==="noact")toast("⛔ Oto savaş durdu: mana yok")}}
    }
  }finally{autoRun=false}
}
/* ---------- GANİMET ---------- */
function drop(m,fg){applyEv(dropItem(P,m,fg,RNG))}

/* ---------- GÜNLÜK, SANDIK, KULE ---------- */
const TN={poison:"🤢 Zehirli",armor:"🪨 Zırhlı (kesinti kırar)",swift:"💨 Çevik",regen:"💚 Yenilenir",drain:"🧛 Can çalar",boss:"👑 Boss · 3 faz"};
const today=()=>new Date().toISOString().slice(0,10);
function daily(){} /* günlük görev yenileme artık sunucuda */
async function ecoSync(){const r=await ecoCall({op:"eco",a:"sync"});if(r){hud();nav();view()}}
function offline(){}
function dailyHTML(){const d=P.dl,dn=d.c?((d.s-1)%7)+1:d.s%7,rw=["50","100","150","200","300","400","📜🎁"],lb={any:"canavar öldür",elite:"elit öldür",tower:"kule katı geç",crit:"kritik vuruş yap",fok:"başarılı yükseltme yap",mat:"malzeme topla",pot:"iksir kullan"};
return`<div class="cd" style="background:linear-gradient(135deg,#6b4a0a44,var(--pn))"><div class="ct">📅 Günlük giriş <span class="g" style="font-size:11px">Seri: ${d.s} gün</span></div>
<div style="display:flex;gap:4px;margin-bottom:9px">${rw.map((x,i)=>`<div style="flex:1;text-align:center;font-size:9px;padding:5px 0;border-radius:6px;background:${i<dn?"#34d39933":"#0006"}">${i+1}<br>${x}</div>`).join("")}</div>
<button class="btn" ${d.c?"disabled":""} onclick="claimD()">${d.c?"Bugünkü ödül alındı":"Giriş ödülünü al"}</button>
<div class="ct" style="margin:12px 0 6px;font-size:12px">Günlük görevler</div>${d.q.map((q,i)=>`<div class="q" style="cursor:pointer" onclick="goQ('${q.c||q.p>=q.n?"":q.k}')"><div style="flex:1"><b>${q.n}× ${lb[q.k]}</b><div class="mu">${q.g}🪙${q.ch?" + 🎁":""}</div><div class="pg"><i style="width:${q.p/q.n*100}%"></i></div></div>${q.c?'<span class="mu">Alındı</span>':`<button class="btn" ${q.p>=q.n?"":"disabled"} onclick="event.stopPropagation();claimDQ(${i})">${q.p}/${q.n}</button>`}</div>`).join("")}
${P.ch?`<button class="btn v" style="margin-top:6px" onclick="chestUI()">🎁 ${P.ch} sandık aç</button>`:""}</div>`}
async function claimD(){const r=await ecoCall({op:"eco",a:"claim",kind:"d"});if(r){hud();view()}}
async function claimDQ(i){const r=await ecoCall({op:"eco",a:"claim",kind:"dq",i});if(r){hud();view()}}
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
async function openChBulk(count){
  const n=Math.max(1,Math.min(P.ch,Math.floor(Number(count)||1)));
  if(n<=0)return;
  const r=await ecoCall({op:"chest",n});
  if(!r||!r.done)return;
  const {gold:totGold,sc:totSc,hp:totHp,mp:totMp,items,skipped:skippedEq}=r.res;
  hud();
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
function towerMob(f){return towerMobOf(P,f)}
function towerCard(){return`<div class="cd" style="background:linear-gradient(135deg,#3b1d6e66,var(--pn))"><div class="ct">🗼 Sonsuz Kule <span class="g" style="font-size:11px">Rekor: Kat ${P.tw}</span></div><p class="mu" style="font-size:11px;margin-bottom:8px">Her kat zorlaşır. 5 katta bir boss ve sandık.</p><button class="btn v" onclick="startCombat(0,0,0,${P.tw+1})">Kat ${P.tw+1}’e çık</button></div>`}
const better=i=>i.rc==P.cls&&effLv(i)<=P.lv&&pw(i)>(P.eq[i.slot]?pw(P.eq[i.slot]):0);

/* ---------- NPC: TÜCCAR MAREN ---------- */
const shopR=()=>Math.min(4,Math.floor((P.lv-1)/10)),shopCap=()=>10*(shopR()+1),price=i=>sellV(i)*5+15+Math.floor(i.rl*i.rl*.8);
let shopSlot="weapon",shopAll=false;
function setShopSlot(k){shopSlot=k;view()}
function setShopAll(v){shopAll=!!v;view()}
const shopList=()=>{const si=SL.indexOf(shopSlot),cap=shopCap(),cs=shopAll?[P.cls,...Object.keys(CL).filter(c=>c!=P.cls)]:[P.cls],o=[];
TIERS.filter(t=>t==1).forEach(t=>cs.forEach(c=>o.push(tierItem(c,si,t))));return o};
function shopHTML(){
const n=SL.filter(k=>P.eq[k]).length,junkN=P.inv.filter(junk).length,cap=shopCap();
const line=!P.eq.weapon?"Silahsız mı geziyorsun evlat? Tezgâha bir göz at, ilk parçayı hemen kuşanırsın.":P.inv.length>=45?"Çantan dolmuş! Fazlalıkları bana sat, yer aç.":n<8?"Eksik parçaların var. İyi ekipman, uzun ömür demek.":"Hepsi üstünde, aferin. Mallarım hiç değişmez, güvenebilirsin.";
const tabs=SL.map(k=>`<button class="sub-tab ${shopSlot==k?"act":""}" style="padding:7px 2px;font-size:10.5px" onclick="setShopSlot('${k}')">${SN[k]}</button>`).join("");
const rows=shopList().map(i=>{const c=price(i),cur=P.eq[i.slot];const bt=i.rc==P.cls&&effLv(i)<=P.lv&&pw(i)>(cur?pw(cur):0);
const wl=i.slot=="weapon"?`<div class="mu" style="font-size:9.5px;color:#fbbf24">⚔️ ${wLine(i)}</div>`:"";
return`<div class="q" style="padding:5px 8px;margin-bottom:4px"><div style="flex:1"><b style="color:${G[i.g].c};font-size:11px">${i.name}</b>${bt?' <span style="color:#4ade80;font-weight:900">▲</span>':""}<div class="mu" style="font-size:9.5px">${shopAll?CL[i.rc].n+" · ":""}Güç ${pw(i)} · Lv.${i.rl}</div>${wl}</div><button class="btn" style="padding:5px 9px;font-size:10.5px" ${P.gold>=c?"":"disabled"} onclick="buyShop('${i.rc}',${SL.indexOf(i.slot)},${i.rl})">${c} 🪙</button></div>`}).join("");
return`<div class="cd" style="background:linear-gradient(135deg,#5a2e1033,var(--pn))"><div class="ct"><span>🏪 Tüccar Maren</span><span class="mu" style="font-size:10px">Sabit tezgâh · Lv.1 eşyalar</span></div>
<div style="display:flex;gap:10px;align-items:center;margin-bottom:10px"><div class="em" style="width:46px;height:46px;font-size:24px;flex-shrink:0">🧔</div><div class="q" style="margin:0;flex:1;font-style:italic">“${line}”</div></div>
<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:4px;margin-bottom:8px">${tabs}</div>
<div class="pr" style="margin:0 0 8px"><button style="${shopAll?"":"border-color:var(--gold);color:var(--gold)"}" onclick="setShopAll(false)">${CL[P.cls].e} Sınıfım</button><button style="${shopAll?"border-color:var(--gold);color:var(--gold)":""}" onclick="setShopAll(true)">Tüm sınıflar</button></div>
${rows}
<p class="mu" style="font-size:10px;text-align:center;margin:6px 0">Üst seviye eşyalar yalnızca savaşta düşer.</p>
<div class="pr"><button ${junkN?"":"disabled"} onclick="bulk()">${armed=="bk"?"Onayla: sat":"Düşükleri sat ("+junkN+")"}</button></div></div>`}
function buyShop(rc,si,t){if(!CL[rc]||!(si>=0&&si<8)||!TIERS.includes(t)||t!=1)return;const i=tierItem(rc,si,t),c=price(i);if(P.gold<c)return toast("Yetersiz altın");if(P.inv.length>=50)return toast("Çanta dolu");
P.gold-=c;P.inv.push(i);A.pot();
if(!P.eq[i.slot]&&i.rc==P.cls&&effLv(i)<=P.lv){equip(P.inv.length-1)}else{hud();save();view();toast(i.name+" çantana eklendi")}}

/* ---------- NİTELİKLER & YETENEKLER ---------- */
const CP={tank:["vit","str"],mage:["int"],archer:["dex"],assassin:["dex"],healer:["int","vit"]};
const SD={str:["STR","Güç"],dex:["DEX","Çeviklik"],int:["INT","Zekâ"],vit:["VIT","Canlılık"]};
function statsHTML(){const c=CL[P.cls].b,w=CW[P.cls],bs={str:c.str,dex:c.agi,int:c.int,vit:c.vit},
ef={str:"+"+w.str+" saldırı, +0.4 zırh",dex:"+"+w.dex+" saldırı, +%0.25 kritik",int:"+"+w.int+" saldırı, +12 mana, şifa +%1",vit:"+18 can, +1.5 zırh"};
const tot=Object.values(P.at).reduce((a,b)=>a+b,0);
return`<div class="cd"><div class="ct">Nitelikler <span class="g" style="font-size:11px">Puan: ${P.ap}</span></div>
${Object.keys(SD).map(k=>`<div class="q"><div style="flex:1"><b>${SD[k][0]}${CP[P.cls].includes(k)?' <span class="g">★</span>':""}</b> <span class="mu">${SD[k][1]}</span> <b>${bs[k]+P.at[k]}</b><div class="mu">Taban ${bs[k]} + dağıtılan ${P.at[k]} · puan başı ${ef[k]}</div></div><button class="btn" style="width:auto;padding:6px 10px" ${P.ap>0?"":"disabled"} onclick="addStat('${k}',1)">+1</button><button class="btn s" style="width:auto;padding:6px 10px" ${P.ap>0?"":"disabled"} onclick="addStat('${k}',5)">+5</button></div>`).join("")}
<p class="mu" style="font-size:10px">★ sınıfının ana niteliği. Her seviye +3 puan verir.</p>
<button class="btn s" style="margin-top:8px" ${tot?"":"disabled"} onclick="respec()">${armed=="rp"?"Onayla: "+P.lv*30+" 🪙":"Puanları sıfırla ("+P.lv*30+" 🪙)"}</button></div>`}
function addStat(k,n){n=Math.min(n,P.ap);if(n<=0)return;const h0=P.maxHp,m0=P.maxMp;P.at[k]+=n;P.ap-=n;A.pot();sync();/* artan üst sınır kadar mevcut can/mana da artar (kalıcı puan, istismar yok) */const d=D();if(d.hp>h0)P.hp=Math.min(d.hp,P.hp+(d.hp-h0));if(d.mp>m0)P.mp=Math.min(d.mp,P.mp+(d.mp-m0));hud();save();view()}
function respec(){const c=P.lv*30;if(armed!="rp"){armed="rp";view();return}armed="";if(P.gold<c)return toast("Yetersiz altın");P.gold-=c;P.ap+=Object.values(P.at).reduce((a,b)=>a+b,0);P.at={str:0,dex:0,int:0,vit:0};sync();save();view();toast("Nitelikler sıfırlandı")}
function skillsHTML(){const c=CL[P.cls],d=D();
return`<div class="cd"><div class="ct">Yetenekler <span class="g" style="font-size:11px">SP: ${P.sp}</span></div><button class="btn s" style="margin-bottom:8px" ${Object.values(P.sr).some(x=>x>0)?"":"disabled"} onclick="resetSk()">${armed=="rsk"?"Onayla: "+P.lv*30+" 🪙":"Yetenekleri sıfırla ("+P.lv*30+" 🪙)"}</button>`+c.sk.map((s,i)=>{const r=P.sr[i]||0,t=r>=50?"S":r>=40?"A":r>=30?"B":r>=20?"C":r>=10?"D":"E",rm=(1+r*.05)*(r>=50?1.25:1),dm=s.m>0?" · ~"+Math.floor(d.atk*s.m*rm)+" hasar":s.heal?" · ~"+healAmt(P)+" can":"";
return`<div class="q"><div style="flex:1"><b>${s.n}</b> <span class="g">[${t} · ${r}/50]</span><div class="mu">${s.d} · ${s.mp} MP${dm}</div></div><button class="btn" style="width:auto;padding:6px 10px" ${P.sp>0&&r<50?"":"disabled"} onclick="upSk(${i})">+1</button></div>`}).join("")+`</div>`}

/* ---------- MALZEME, GÖREV ÇEŞİTLİLİĞİ ---------- */
function need(p){if(p<5)return{kirik:2+p*2};const k=NT[p%4];if(p<9)return{kirik:6,[k]:2};if(p<12)return{kirik:8,[k]:3,kan:2,ruh:p-8};return{kirik:12,[k]:4,kan:p-9,ruh:p-8}}
const hasMat=n=>Object.keys(n).every(k=>(P.mat[k]||0)>=n[k]);
function useMat(n){Object.keys(n).forEach(k=>P.mat[k]-=n[k])}
function needHTML(p){if(p>=15)return"";return`<div class="q" style="flex-wrap:wrap;margin:6px 0">Gereken: ${Object.entries(need(p)).map(([k,n])=>`<b style="color:${(P.mat[k]||0)>=n?"#4ade80":"#f87171"}">${MT[k][0]}${MT[k][1]} ${P.mat[k]||0}/${n}</b>`).join(" · ")}</div>`}
const matLine=()=>Object.keys(MT).map(k=>MT[k][0]+" "+(P.mat[k]||0)).join(" &nbsp;");
function gm(k,n){P.mat[k]=(P.mat[k]||0)+n;ev("mat",n);lg(MT[k][0]+" +"+n+" "+MT[k][1])}
function ev(){} /* görev ilerlemesi artık sunucuda işlenir */
function qRow(q,fn,head){const s=qp(q),d=s.p>=q.n,gk=(d||s.c)?"":(q.k||"kill"),rw=q.g+"🪙"+(q.sc?" +📜"+(q.sc>1?q.sc:""):"")+(q.ch?" +🎁"+(q.ch>1?q.ch:""):"")+Object.entries(q.m||{}).map(([k,n])=>" +"+MT[k][0]+n).join("");
return`<div class="q" style="cursor:pointer" onclick="goQ('${gk}')"><div style="flex:1"><b>${head}</b><div class="mu">${q.txt||q.n+"× "+q.t} · ${rw}</div><div class="pg"><i style="width:${Math.min(100,s.p/q.n*100)}%"></i></div></div>${s.c?'<span class="mu">Alındı</span>':`<button class="btn" ${d?"":"disabled"} onclick="event.stopPropagation();${fn}('${q.id}')">${d?"Al":s.p+"/"+q.n}</button>`}</div>`}
async function claimV(id){const r=await ecoCall({op:"eco",a:"claim",kind:"v",id});if(r){hud();view()}}
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
      <button class="btn v" style="margin-bottom:8px;padding:9px;font-size:12px" onclick="tutStart(true)">📘 Öğreticiyi tekrar göster</button>
      <div class="cd">
        <div class="ct">1. Karakter Yuvaları ve Temel Sistemler</div>
        <ul class="wk-list">
          <li><b>Çoklu Karakter Yuvası (5 Yuva):</b> Giriş ekranında <b>5 ayrı karakter yuvası</b> bulunur. Sınıflara dokunulduğunda çizim üzerinde bilgi açılır; boş yuvalara dokunularak yeni kahraman oluşturulur.</li>
          <li><b>Pratik Alt Sekme Arayüzü:</b> <i>Karakter</i> (Donanım, Gelişim, Unvan, Kayıt), <i>Harita</i> (Kule + çizilmiş Valdrenn haritası ve 12 bölge noktası), <i>Şehir</i> (Tüccar / Pınar & Simyacı / Banka / Pazar / Takas) ve <i>Görev</i> (Günlük, Bölge, Meydan Okuma) ekranları aşağı kaydırma gerektirmeyen alt menülerle ayrılmıştır.</li>
          <li><b>5×5 Sırt Çantası, Yığınlama (Stack) ve Sıralama:</b> Çanta aynı anda <b>5×5 (25 yuva)</b> gösterir, fazlası aşağı kaydırılır. <i>İksirler, Hazine Sandıkları, Koruma Parşömenleri, Şifalı Ot/Özler ve Artı Basma Malzemeleri</i> tek yuvada yığınlanır ve 50 ekipman kapasitesini doldurmaz. Üstteki sıralama menüsüyle ekipmanlar <b>Nadirlik, Güç, Seviye, Yuva</b> veya <b>İsme</b> göre dizilebilir.</li>
          <li><b>🧹 Çöp Kuralları ve Otomatik Sat/Parçala:</b> Çanta → <i>⚙️ Çöp kuralları</i>. Kendi sınıfın ve başka sınıfların eşyaları için ayrı <b>kalite sınırı</b>, <b>en çok kaç efsun</b> ve <b>en çok kaç artı (+)</b> seçersin; şartların hepsine uyan eşya "çöp" sayılır ve <i>Toplu Sat / Toplu Parçala</i> yalnızca bunlara dokunur. <b>🧹 Otomatik işlem</b> açıksa savaşta düşen çöp eşya anında satılır ya da parçalanır (çanta dolmaz). Kadim Elit eşyalar hiçbir zaman çöp sayılmaz. Varsayılan kural: kendi sınıfın GR-II ve altı, başka sınıf GR-III ve altı, artısız.</li>
          <li><b>📘 Öğretici:</b> Yeni karakter açınca 6 kısa adımlık tur başlar (atlayabilirsin). Bu sayfanın en üstündeki düğmeyle istediğin zaman tekrar açabilirsin.</li>
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
          <li><b>🛡️ Tank:</b> Kalkan Darbesi (13 MP, 1.4x, ⚡Kesinti) · Kalkan Duvarı (20 MP, %35 HP Kalkan) · Meydan Okuma (16 MP, 1.8x + 3t İç Kanama) · Yıkılmaz İrade (30 MP, 2.8x)</li>
          <li><b>🔮 Büyücü:</b> Alev Patlaması (30 MP, 2.2x + 3t Yanma) · Buzul Halka (40 MP, 1.6x, ⚡Kesinti) · Arkana Kalkanı (35 MP, %35 HP Kalkan) · Kıyamet Meteoru (75 MP, 4.2x)</li>
          <li><b>🏹 Okçu:</b> Zehirli Ok (14 MP, 1.5x + 3t Zehir) · Kiriş Darbesi (16 MP, 1.3x, ⚡Kesinti) · Zayıf Nokta (23 MP, 2.4x, Garanti Kritik) · Ok Yağmuru (40 MP, 3.6x)</li>
          <li><b>🗡️ Suikastçı:</b> Gölge Kesiği (15 MP, 1.9x + 3t Kanama) · Kör Edici Toz (18 MP, 1.1x, ⚡Kesinti) · Gölgelere Karış (20 MP, 0.8x + Kalkan) · Gölge İnfazı (42 MP, 4.4x)</li>
          <li><b>✨ Şifacı:</b> Kutsal Işık (25 MP, 1.6x + 3t Kutsal Yanık) · İlahi Baston (22 MP, 1.2x, ⚡Kesinti) · Kutsal Lütuf (35 MP, 100+30×seviye HP iyileştirme) · İlahi Kubbe (70 MP, 1.0x + Kalkan)</li>
        </ul>
      </div>`;
  }else if(wikiSec===3){
    body=`
      <div class="cd">
        <div class="ct">3. Savaş Mekaniği ve Ağır Darbe / Kesinti</div>
        <ul class="wk-list">
          <li><b>🎲 Dinamik Hasar Aralığı:</b> Saldırılar sabit tek bir sayı yerine dengeli bir hasar aralığında vurur. Aralık <b>silahına</b> bağlıdır: ağır silahlar (Tank, Büyücü, Şifacı) geniş aralıkta ve daha sert vurur; hızlı silahlar (Okçu, Suikastçı) dar aralıkta vurur. Yetenekler silah aralığının yaklaşık %70'ini kullanır. <b>İç Kanama, Yanma, Zehir, Kanama ve Kutsal Yanık</b> gibi zamanla hasar etkileri yalnızca ilgili <b>Sınıf Yetenekleri</b> kullanıldığında uygulanır.</li>
          <li><b>⚔️ Silah Hızı:</b> Bir silaha dokununca <b>hasar aralığı</b> ve <b>saldırı hızı</b> görünür. Hızı 1'in üstündeki silahlar temel saldırıda bazen <b>art arda 2 vuruş</b> yapar (vuruş başı hasar biraz düşer); hızı 1'in altındaki silahlar tek ama daha ağır vurur. Yetenekler her zaman tek vuruştur.</li>
          <li><b>⚠️ Ağır Darbe Hazırlığı & ⚡ Kesinti:</b> Düşman <i>"AĞIR DARBE HAZIRLANIYOR!"</i> uyarısı verdiğinde bir sonraki tur <b>2.5× Hasar</b> vurur. Aynı turda <b>⚡ Kesinti</b> yeteneği kullanılırsa saldırı bozulur, düşman <b>sersemler</b> (tur kaybeder) ve varsa <b>Zırhlı</b> savunması kırılır.</li>
          <li><b>👑 Elit Boss Fazları:</b> Bölge bossları ve Kule'nin 5. kat bossları <b>3 Fazlıdır</b>. Canları <b>%66</b> ve <b>%33</b> altına indiğinde faz atlar; saldırıları her fazda <b>+%30</b> artar ve ağır darbe ihtimali <b>%50</b> olur.</li>
          <li><b>Seviye Farkı Cezaları:</b> Canavardan 2–3 Lv yüksekte %65, 4–6 Lv yüksekte %25, 7+ Lv yüksekte <b>0 XP</b> alınır. Canavar 3+ Lv yüksekse hasar düşer, alınan hasar artar.</li>
          <li><b>🤖 Otomatik Savaş, Yetenek & İksir Seçimi:</b> Savaşta <b>▶ Oto</b> tuşuna basıldığında açılan ayar penceresinden sınıfının 4 yeteneğinden <b>hangilerinin otomatik kullanılıp hangilerinin kapatılacağı</b> (veya <i>Sadece Düz</i> saldırı modu), ayrıca otomatik kullanılacak <b>Can ve Mana iksiri boyutu</b> (Küçük, Orta, Büyük veya Kullanma) ile kullanım eşiği (%25–%70) seçilebilir. Manuel savaşta da iksir butonlarının yanındaki <b>K / O / B</b> tuşuyla boyut değiştirilebilir.</li>
          <li><b>🏆 Oto Savaşta Gezinme ve Kazanımlar:</b> Oto savaş sürerken <b>Çanta, Karakter, Görev, Şehir, Topluluk ve Wiki</b> sekmelerine bakabilirsin; üstteki altın şeritte savaşın durumu görünür, dokununca savaşa dönersin. Bu sırada eşya kuşanma, satma, nitelik dağıtma gibi değişiklikler kapalıdır (önce ⏸ Oto'yu durdur). Savaş ekranının altı ikiye ayrılır: <b>📜 Günlük</b> ve <b>🏆 Kazanımlar</b> (öldürülen, altın, XP, toplam/en yüksek hasar, kritik oranı, dakikada kazanç, düşen eşya ve malzemeler).</li>
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
          ${RG.map((r,i)=>`<tr><td><b>${i+1}. ${r.n}</b><br><span class="mu">Lv.${r.req} · ${r.ore} (Güç ${r.pw})</span></td><td>${r.mobs.slice(0,-1).map(m=>m.name+" (Lv."+m.lv+")").join(" · ")}<br><b class="g">👑 ${r.mobs[r.mobs.length-1].name} (Lv.${r.mobs[r.mobs.length-1].lv})</b></td></tr>`).join("")}
        </table>
      </div>`;
  }else if(wikiSec===5){
    body=`
      <div class="cd">
        <div class="ct">5. Ekipman Yuvaları & Nadirlik</div>
        <ul class="wk-list">
          <li><b>8 Ekipman Yuvası:</b> <b>Silah</b> → Saldırı · <b>Sol El, Kask, Zırh, Pantolon, Çizme</b> → Zırh · <b>Kolye</b> → Güç×4 Can · <b>Yüzük</b> → Güç×3 Mana.</li>
          <li><b>Nadirlik Çarpanları:</b> <span style="color:#64748b">GR-I (1.0x)</span> · <span style="color:#22c55e">GR-II (1.15x)</span> · <span style="color:#38bdf8">GR-III (1.3x)</span> · <span style="color:#a855f7">GR-IV (1.5x)</span> · <span class="g">👑 ELİT (1.75x)</span>.</li>
        </ul>
      </div>
      <div class="cd">
        <div class="ct">🛡️ Set Bonusları</div>
        <p class="mu" style="font-size:10px;margin-bottom:4px">Aynı bölge madeninden (Çırak, Çelik, Obsidyen, Kristal, Ejderha, Zümrüt, Kemik, Gölge, Fırtına, Cehennem, Boşluk, Kadim) parçalar kuşanıldığında aktif olur:</p>
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
          <li><b>✨ Kilometre Taşı Silahları (Lv 10 / 30 / 50 / 75 / 100):</b> Bu seviyelerdeki silahlar iki özel efsunla düşer: <b>Düz Vuruş Ortalaması</b> (temel saldırı hasarını % artırır; en çok %20 / %35 / %50) ve <b>Beceri Vuruşu Ortalaması</b> (yetenek hasarını % artırır; en çok %12 / %21 / %30). Bu efsunlar yenilenebilir ama en üst değeri yakalamak <b>çok zordur</b>; değerler çoğunlukla alt-orta aralıkta çıkar. Çevirme ücreti her özel efsun için silahın seviyesiyle birlikte artar. Bu silahlar en çok bölge bosslarından (Haydut Reisi, Firavun Ruhu, Kadim Kara Ejderha) düşer; </li>
          <li><b>📈 Eşya Kademeleri:</b> Eşyalar Lv 1, 5, 10, 15 … 50 olmak üzere <b>11 kademede</b> gelir. Canavarın seviyesi hangi kademenin düşeceğini belirler; üst kademe eşya her zaman bir öncekinden güçlüdür, yükseltilmiş (+) eski eşyan ise yeni kademeye yaklaşana kadar işe yarar.</li>
          <li><b>Eşya Parçalama:</b> İstenmeyen eşyalar parçalanarak <i>Demir Kırığı, Zehir Bezi, Zırh Parçası, Çevik Tüy, Yeşil Öz, Kan Kristali</i> ve <i>Elit Ruhu</i> elde edilir.</li>
        </ul>
      </div>`;
  }else{
    body=`
      <div class="cd">
        <div class="ct">6. Şehir, Sonsuz Kule ve Sandıklar</div>
        <ul class="wk-list">
          <li><b>💥 Savaş Efektleri:</b> Her yetenek ve temel saldırı sınıfına göre kendi görsel efektini oynatır. Kritik vuruşlar büyük ve altın renkli sayıyla çıkar, canavar yenilince dağılır, ağır darbe hazırlığı yanıp söner, seviye atlayınca ekranda parlama olur. Telefonun destekliyorsa kritik, hasar alma ve zafer anlarında hafif <b>titreşim</b> gelir; Karakter → Kayıt sekmesinden kapatılabilir.</li>
          <li><b>🧬 Irklar (v2.7.0):</b> Karakter oluştururken bir ırk seçilir ve sonradan değiştirilemez. Her ırkın küçük bir bonusu ve bir pasifi vardır: ${Object.values(RACES).map(r=>`<b>${r.n}</b> (${r.bt}; ${r.pn}: ${r.pt})`).join(" · ")} Eski karakterler ilk girişte bir kez ırk seçer. Karakter oluştururken ayrıca <b>Erkek / Kadın</b> görseli seçebilirsin; bu yalnızca görünümdür.</li>
          <li><b>🗺️ 12 Bölge ve Seviye 100:</b> Dünya artık 12 bölgeden oluşuyor ve seviye sınırı <b>100</b>. Her bölgede 7 canavar ve 1 👑 Elit Boss var (toplam 96 canavar, hepsinin kendi çizimi var). Haritada bölge noktalarına dokunarak bölgeleri gezebilirsin; bir sonraki bölge için seviye gerekir ve önceki bölgenin Elit Boss'unu yenmelisin. 51-100 arası eşyalar yeni kademelerde (55, 60 … 100) düşer; Lv 75 ve Lv 100 silahları da kilometre taşı efsunlu gelir.</li>
          <li><b>🏰 Lonca (v2.8.0):</b> Topluluk > Lonca sekmesinden 10. seviyeden itibaren lonca kurabilir ya da açık bir loncaya katılabilirsin (en çok 30 üye). Roller: <b>Lider</b> (ayarlar, rütbe, atma, devir, dağıtma), <b>Subay</b> (sıradan üyeleri atar), <b>Üye</b>. Lider ayrılırsa liderlik en eski subaya geçer. Loncanın gücü üyelerinin seviyeleri toplamıdır; lonca listesi güce göre sıralanır. Lonca sohbetini yalnızca üyeler görür.</li>
          <li><b>🗺️ Harita (v2.8.0):</b> Harita sekmesi doğrudan tam ekran haritayı açar. Bir bölgeye dokununca küçük bir pencerede bölgenin canavarları çıkar; haritanın boş yerine dokunarak pencereyi kapatırsın.</li>
          <li><b>🐉 Dünya Boss'u (v2.13.0):</b> Topluluk > Boss sekmesinde herkesin ortak vurduğu boss durur (10. seviyeden itibaren). Karakter başına günde 3 saldırı hakkın var (her gün 03:00'te yenilenir); bir saldırı en çok 30 tur sürer ve boss seviyene göre ayarlanır. Saldırıda canın, manan ve iksirlerin harcanmaz. Boss 3 gün yaşar; canı %75, %50, %25'e inince herkese sandık, ölürse katılanlara sandık çıkar. Hasarda ilk 3'e <i>Dünya Yıkıcı</i>, katılanlara <i>Boss Avcısı</i> ünvanı verilir; en çok hasar veren 3 loncanın üyelerine ek sandık vardır. Boss ölünce ya da kaçınca 12 saat sonra sıradaki bölgenin bossu gelir.</li>
          <li><b>🧍 Karakterler birbirinden bağımsızdır (v2.11.0):</b> Aynı hesapta birden çok karakter açsan da her biri ayrı bir oyuncu sayılır: kendi sıralaması, arkadaşları, mesajları, engelleri ve loncası vardır. Ortak olan tek şey deponun (banka, pazar, takas) hesaba bağlı olmasıdır.</li>
          <li><b>👥 Arkadaşlar ve Mesajlar (v2.9.0):</b> Sıralamada, sohbette ya da loncada bir oyuncunun adına dokununca profilinin altında <i>Mesaj gönder</i>, <i>Arkadaş ekle</i> ve <i>Engelle</i> düğmeleri çıkar. Arkadaşlık iki taraflıdır (istek gönderilir, karşı taraf kabul eder; en çok 50 arkadaş). Arkadaşlarının çevrimiçi olup olmadığını Topluluk > Arkadaş sekmesinde görürsün (son 3 dakikada oyundaysa çevrimiçidir; bu bilgiyi yalnızca arkadaşların görür). Özel mesaj herkese gönderilebilir; rahatsız eden oyuncuyu engelleyebilirsin. Okunmamış mesaj ve istekler Topluluk sekmesinde kırmızı rozetle görünür. Mesajlar 14 gün saklanır.</li>
          <li><b>📖 Hikâye Günlüğü (v2.10.0):</b> Harita sekmesindeki günlükte Valdrenn'in hikâyesi (Kral Valdrenn, gölgenin on iki mührü ve senin gölgen) yer alır. Prolog ilk girişte kendiliğinden açılır; her bölgenin Elit Boss'unu yenince o bölgenin sayfası açılır ve bildirim gelir. Son sayfalar Valdrenn Tahtı'ndaki Elit Boss'u yenince açılır.</li>
          <li><b>🎨 Kor Teması ve Çizimler:</b> Oyunun görünümü kızıl-altın <i>Kor</i> temasına geçti. Emojilerin yerine özgün çizim ikonlar, 20 canavarın her biri için ise kendi çizimi geldi. Kule canavarları bağlı oldukları bölge canavarının çizimini kullanır.</li>
          <li><b>🏪 Tüccar Maren:</b> Tezgâhı <b>sabittir</b>, yenilenmez. Tüm sınıfların GR-I eşyalarını <b>kategori sekmeleriyle</b> (Silah, Sol El, Kask, Zırh, Pantolon, Çizme, Kolye, Yüzük) satar. Varsayılan olarak kendi sınıfının eşyaları görünür; <i>Tüm sınıflar</i> ile hepsini görebilirsin. Yalnızca <b>Lv 1</b> eşyalar satılır; üst seviye eşyalar savaşta düşer. Silahların hasar aralığı ve hızı satırında görünür.</li>
          <li><b>⛲ Yaşam Pınarı & 🧪 Simyacı (İksir Boyutları):</b> Pınar Can ve Manayı doldurur (seviyene göre altın ister: 20 + 8×seviye). İksirler 3 boyuttadır; boyut büyüdükçe etkisi ve fiyatı artar, yaratıklardan düşme şansı azalır (Düşme dağılımı: <b>%65 Küçük, %27 Orta, %8 Büyük</b>):<br>
• <b>Can İksirleri:</b> Küçük (+150 HP · 10 🪙) · Orta (+400 HP · 25 🪙) · Büyük (+900 HP · 60 🪙)<br>
• <b>Mana İksirleri:</b> Küçük (+60 MP · 8 🪙) · Orta (+180 MP · 20 🪙) · Büyük (+400 MP · 50 🪙)<br>
• <b>Koruma Parşömeni:</b> 150 🪙 (+6 ve üzeri yükseltmeleri korur).</li>
          <li><b>🗼 Sonsuz Kule:</b> Her katta düşmanlar <b>+%7</b> güçlenir. Her <b>5 katta bir</b> Kule Muhafızı (Boss) çıkar ve zaferde <b>🎁 Hazine Sandığı</b> verir.</li>
          <li><b>👑 Elit Boss Ödülü:</b> Elit boss her kesişte eşya vermez; yaklaşık <b>%15 ihtimalle (8 kesişte 1)</b> bir ekipman düşer. Düşen eşyalar çoğunlukla düşük/orta kalitedir, Kadim kalite çok nadirdir. Elit bosslar sandık düşürmez ve Kadim elit artık seviye bonusu almaz.</li>
          <li><b>🏆 Sıralama:</b> Seviye, Kule, Elit ve <b>Hasar (en yüksek tek vuruş)</b> sekmeleri; ilk 100 oyuncu listelenir, oyuncu adıyla arayıp sırasını bulabilir, bir oyuncuya dokunarak profilini (kuşandığı eşyalar dahil) görebilirsin.</li>
          <li><b>🛒 Pratik Araçlar:</b> Simyacıda iksiri <b>1/5/10/25/50 veya yazdığın adet</b> kadar toplu alabilirsin. Çantadaki <b>⚡ en iyileri kuşan</b> tuşu her slotta seviyene uygun en güçlü eşyayı giydirir. Oto savaş ayarındaki <b>otomatik iksir alma</b> seçeneği iksirin bitince altınla yenisini alır. Şifacı'nın şifa yeteneği sabit bir can verir ve seviyeyle artar.</li>
          <li><b>🏦 Banka:</b> Şehir → Banka. Tüm karakterlerin ortak kasasıdır: en çok <b>100 ekipman</b> ve sınırsız altın saklar. Eşya ve altını istediğin zaman yatırıp çekebilirsin; bu sayede eşyaları kendi karakterlerin arasında taşıyabilirsin.</li>
          <li><b>🛒 Pazar (Tezgâh):</b> Seviye 5'ten itibaren ekipmanını fiyat belirleyip tezgâha koyarsın (en çok 10 tezgâh). Tezgâh <b>24 saat</b> açık kalır; sen çevrimdışı olsan da satış sürer. Satış gelirinden <b>%5 vergi</b> kesilir. Satılanların parasını <i>Tezgâhım → Satılanlar</i> bölümünden toplarsın. 24 saatte satılmayan eşya otomatik kapanır ve <b>⚠️ Süresi dolanlar</b> listesine düşer; oradan çantana alırsın. Süresi dolmadan tezgâhı istediğin an kapatabilirsin.</li>
          <li><b>🤝 Takas:</b> Bir oyuncuya karakter adıyla teklif gönderirsin: sen eşya ve/veya altın verirsin, karşılığında altın ve/ya en çok 5 eşya (istersen belirli bir bölme) istersin. Karşı taraf eşyayı kendi çantasından seçip verir. Teklif 24 saat geçerlidir (en çok 5 açık teklif); verdiklerin teklif süresince emanette durur. Kabul edilirse ödemeyi <i>Gönderdiklerim</i> bölümünden toplarsın; reddedilir ya da süresi dolarsa eşyanı geri alırsın.</li>
          <li><b>🎁 Hazine Sandıkları (Tekli & Toplu Açım):</b> Sonsuz Kule'nin her 5. kat bossundan, günlük görevlerden ve 4+ saat çevrimdışı ödülden kazanılır (normal canavarlardan ve elit bosslardan düşmez). Çantada tek yuvada birikir ve toplu açılabilir; içinden <b>%58 Altın</b>, <b>%30 İksir Paketi</b> (1 Can + 1 Mana), <b>%6 Nadir Ekipman (GR-III+)</b> veya <b>%6 Koruma Parşömeni</b> çıkar.</li>
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
      <div class="ct">📖 Valdrenn — Oyun Rehberi <span class="g" style="font-size:10px">WİKİ</span></div>
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
function pickGen(g){genSel=g;const v=$("cn")?$("cn").value:"";renderCharSelect();if(v&&$("cn"))$("cn").value=v;syncCreateBtn()}
function pickRace(k){raceSel=k;const v=$("cn")?$("cn").value:"";renderCharSelect();if(v&&$("cn"))$("cn").value=v;syncCreateBtn()}
function pick(k){
  sel=k;
  A.pot();
  renderCharSelect();
}
function syncCreateBtn(){
  const inp=$("cn"),btn=$("cn-btn");
  if(inp&&btn)btn.disabled=!inp.value.trim();
}
async function newGame(){
  const inp=$("cn");
  const charName=inp?inp.value.trim():"";
  if(!charName){
    toast("⚠️ Karakter oluşturmak için önce bir isim yazmalısın!");
    if(inp)inp.focus();
    return;
  }
  if((charName.match(/\p{L}/gu)||[]).length<3){
    toast("⚠️ Karakter adında en az 3 harf olmalı (sadece rakam veya işaret olmaz)");
    if(inp)inp.focus();
    return;
  }
  if(typeof CLOUD!=="undefined"&&CLOUD.user&&CLOUD.sb){
    const btn=$("cn-btn");if(btn)btn.disabled=true;
    let st=null;
    try{const r=await CLOUD.sb.rpc("kz_name_status",{p_name:charName});if(!r.error)st=r.data}catch(e){}
    if(btn)btn.disabled=false;
    if(st==="alinmis"){toast("⚠️ Bu karakter adı başka bir oyuncuda var, başka bir isim seç");if(inp)inp.focus();return}
    if(st==="uygunsuz"){toast("⚠️ Bu isim uygun değil, başka bir isim seç");if(inp)inp.focus();return}
  }
  const created=NEW();
  created.name=charName;
  created.cls=sel;created.race=raceSel;created.g=genSel;
  created.tut=0;
  SLOTS[targetCreateSlot]=created;
  activeSlot=targetCreateSlot;
  P=created;
  sync();P.hp=P.maxHp;P.mp=P.maxMp;
  $("cs-screen").style.display="none";
  saveAll();nav();view();
  toast("Hoş geldin, "+P.name+"!");
  ecoSync();
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
    sp.remove();
    openCharSelect();
  }
  sp.style.display="none";setTimeout(cl,0);
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

/* ---------- TAM EKRAN ---------- */
function toggleFS(){
  const de=document.documentElement,on=document.fullscreenElement||document.webkitFullscreenElement;
  const rq=de.requestFullscreen||de.webkitRequestFullscreen,ex=document.exitFullscreen||document.webkitExitFullscreen;
  if(on){ex&&ex.call(document);return}
  if(rq){try{const p=rq.call(de);if(p&&p.catch)p.catch(()=>toast("Tam ekran bu tarayıcıda açılamadı"))}catch(e){toast("Tam ekran bu tarayıcıda açılamadı")}return}
  toast("iPhone: Paylaş ⬆️ → «Ana Ekrana Ekle» ile tam ekran açılır");
}

/* ---------- OTOMATİK KUŞAN ---------- */
function autoEquip(){
  let n=0;const names=[];
  SL.forEach(sl=>{
    const cur=P.eq[sl],curOn=cur&&effLv(cur)<=P.lv;
    let best=-1,bp=curOn?pw(cur):-1;
    P.inv.forEach((i,k)=>{if(i.slot!==sl||i.rc!==P.cls||effLv(i)>P.lv)return;const v=pw(i);if(v>bp){bp=v;best=k}});
    if(best>-1){const it=P.inv[best];P.inv.splice(best,1);if(cur)P.inv.push(cur);P.eq[sl]=it;n++;names.push(it.name)}
  });
  if(!n)return toast("Çantada kuşanılacak daha iyi eşya yok");
  A.pot();sync();save();view();toast("⚡ "+n+" eşya kuşanıldı");
}

/* Savaş sürerken çantayı/ekipmanı/niteliği değiştiren işlemler kapalı (bakmak serbest): sunucu kaydıyla çakışmasın */
["equip","unequip","autoEquip","buyShop","fount","usePot","resetSk","upSk","addStat","respec","equipTitle","applyBagSortPermanent"].forEach(n=>{
  const f=window[n];if(typeof f!=="function")return;
  window[n]=function(){if(cbLocked())return cbWarn();return f.apply(this,arguments)};
});
