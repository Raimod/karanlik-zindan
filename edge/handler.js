/* "battle" Edge Function mantığı. Veritabanına db adaptörü üzerinden erişir (test edilebilir).
   db.get(uid)  -> kz_b_get sonucu;  db.put(uid,rev,slot,pslot,b,lockMs) -> kz_b_put

   İki çalışma biçimi:
   * MANUEL: telefon savaşı kendisi oynar (sunucunun verdiği tohumla), bitince hamle listesini gönderir
     ("finish"). Sunucu aynı tohumla baştan oynatır; sonucu ve ödülü sunucu belirler. Savaş başına 1 çağrı.
   * OTO: sunucu bir istekte birkaç savaşı oynar ("auto"). */
const BH_FIELDS=["hp","mp","maxHp","maxMp","gold","xp","lv","sp","ap","pot","mat","tw","ch","boss","st","stk"];
const BH_MAX_STEPS=300,BH_MAX_ACTS=400;
const BH_ECO_FIELDS=BH_FIELDS.concat(["eq","sc"]);

function bhSnap(B,p,full){
  const s={hp:p.hp,mp:p.mp,maxHp:p.maxHp,maxMp:p.maxMp,pot:p.pot,d:p.st.d,
    B:{tele:B.tele,stun:B.stun,sh:B.sh,shT:B.shT,pz:B.pz,pzT:B.pzT,dot:B.dot,dotT:B.dotT,dotN:B.dotN||"",rage:B.rage,armor:B.armor,ph:B.ph,mhp:B.mob.hp,matk:B.mob.atk,k:B.k}};
  if(full){s.ps={};for(const k of BH_FIELDS)s.ps[k]=p[k];s.ps.inv=p.inv}
  return s;
}
function bhCfg(c,old){
  const ok=v=>["off","S","M","L"].includes(v),n=(v,d)=>typeof v==="number"&&v>=0&&v<=100?Math.floor(v):d;
  const o=old||{hp:"S",mp:"S",hpThr:40,mpThr:25,skills:[1,1,1,1]};
  if(!c||typeof c!=="object")return o;
  return{hp:ok(c.hp)?c.hp:o.hp,mp:ok(c.mp)?c.mp:o.mp,hpThr:n(c.hpThr,o.hpThr),mpThr:n(c.mpThr,o.mpThr),
    skills:Array.isArray(c.skills)&&c.skills.length==4?c.skills.map(x=>x?1:0):o.skills};
}
const bhInt=(v,a,b)=>Number.isInteger(v)&&v>=a&&v<=b;

async function kzBattleHandle(KZ,db,uid,body,opts){
  opts=opts||{};
  const rngS=KZ.mkRng(opts.rand||Math.random);            /* ödül rastgeleliği: yalnızca sunucuda, telefon bilemez */
  const op=body&&body.op;
  if(!["start","finish","auto","end","act","pot","forge","chest"].includes(op))return{err:"gecersiz_istek"};
  if(!bhInt(body.slot,0,4))return{err:"gecersiz_istek"};
  const g=await db.get(uid);
  if(!g||g.nosave)return{err:"kayit_yok"};
  const slots=g.data&&g.data.slots;
  const ps=Array.isArray(slots)?slots[body.slot]:null;
  if(!ps||typeof ps!=="object")return{err:"kayit_yok"};
  if(ps.name!==body.name||ps.cls!==body.cls)return{err:"kayit_uyumsuz"};
  let B=g.bslot===body.slot?g.b:null;

  if(op==="end"){await db.put(uid,g.rev,body.slot,ps,null,0);return{ok:true,steps:[]}}
  if((op==="act"||op==="pot"||op==="auto")&&g.wait_ms>0)return{err:"bekle",ms:g.wait_ms};

  /* Demirci ve sandık: savaştan bağımsız, tek adımlık işlemler. Sürmekte olan savaş kaydı korunur. */
  if(op==="forge"||op==="chest"){
    const p=JSON.parse(JSON.stringify(ps)),rng=rngS;
    let o;
    if(op==="forge"){
      if(body.a==="upg")o=KZ.forgeUpg(p,body.loc,rng);
      else if(body.a==="reroll")o=KZ.forgeReroll(p,body.loc,rng);
      else return{err:"gecersiz_istek"};
    }else{
      if(!bhInt(body.n,1,500))return{err:"gecersiz_istek"};
      o=KZ.chestOpen(p,body.n,rng);
    }
    if(!o.ok){return{ok:true,done:false,steps:[{out:[...o]}],ps:Object.fromEntries(BH_ECO_FIELDS.map(k=>[k,ps[k]]).concat([["inv",ps.inv]]))}}
    try{await db.put(uid,g.rev,body.slot,p,g.bslot===body.slot?g.b:null,0)}
    catch(e){const m=String(e&&e.message||e);return{err:/cakisma/.test(m)?"cakisma":"sunucu_hatasi",msg:m}}
    const ps3={};for(const k of BH_ECO_FIELDS)ps3[k]=p[k];ps3.inv=p.inv;
    return{ok:true,done:true,steps:[{out:[...o]}],res:o.res,removed:!!o.removed,ps:ps3};
  }

  const p=JSON.parse(JSON.stringify(ps));
  let rngC=null;                                           /* savaş (hamle) rastgeleliği: tohumlu, telefonla aynı */
  const setB=nb=>{B=nb;rngC=nb?KZ.seeded(nb.seed,nb.k||0):null};
  setB(B);
  const S=full=>{if(B&&rngC)B.k=rngC.k;return bhSnap(B,p,full)};
  const steps=[];let stopped="",lockMs=0;
  const push=(out,extra)=>{steps.push({out:[...out],s:S(false),...extra})};
  const open=r=>(r==0||p.boss[r-1])&&p.lv>=KZ.RG[r].req;
  const startFight=(ri,mi,tw)=>{
    const nb=KZ.newBattle(p,ri,mi,tw);nb.seed=rngS.RI(1,4294967295);nb.k=0;
    setB(nb);
    steps.push({out:[{lg:"⚔️ <b>"+nb.mob.name+"</b> ile dövüş başladı!"}],s:S(false),start:nb});
    return nb;
  };
  const winNow=()=>{const o=KZ.bWin(B,p,rngS);steps.push({out:o,s:S(true),win:true});return"win"};
  const loseNow=()=>{B.over=true;const r=KZ.bLose(p);steps.push({out:[],lose:r.lost,s:S(true)});return"lose"};
  /* bir tur: oyuncu hamlesi + canavar sırası (+ zafer/yenilgi) */
  const round=i=>{
    const o=KZ.bAct(B,p,i,rngC);
    if(!o.acted){steps.push({out:o,s:S(false),noact:true});return"noact"}
    steps.push({out:o,s:S(false)});
    if(B.mob.hp<=0)return winNow();
    const o2=KZ.bMobTurn(B,p,rngC);steps.push({out:o2,s:S(false)});
    if(p.hp<=0)return loseNow();
    if(B.mob.hp<=0)return winNow();
    return"ok";
  };
  /* telefonun oynadığı hamleleri aynı tohumla baştan oynat. dönüş: "bad" | "open" | "win" | "lose" (win/lose ödül adımını ÜRETMEZ) */
  const replay=acts=>{
    if(!Array.isArray(acts)||acts.length>BH_MAX_ACTS)return"bad";
    for(let n=0;n<acts.length;n++){
      const a=acts[n],last=n===acts.length-1;
      if(Array.isArray(a)){
        if(a[0]!=="p"||!["hp","mp"].includes(a[1])||!["S","M","L"].includes(a[2]))return"bad";
        if(!KZ.bPot(p,a[1],a[2],false).ok)return"bad";
        continue;
      }
      if(!bhInt(a,-1,3))return"bad";
      if(!KZ.bAct(B,p,a,rngC).acted)return"bad";
      if(B.mob.hp<=0)return last?"win":"bad";
      KZ.bMobTurn(B,p,rngC);
      if(p.hp<=0)return last?"lose":"bad";
      if(B.mob.hp<=0)return last?"win":"bad";
    }
    return"open";
  };
  /* başlatma isteğini doğrula ve savaşı kur */
  const begin=(a,hp,mp)=>{
    if(!a||typeof a!=="object")return"gecersiz_istek";
    const tw=a.tw|0;
    if(a.tw&&!bhInt(a.tw,1,500))return"gecersiz_istek";
    if(tw){ if(tw>p.tw+1)return"gecersiz_istek"; }
    else{
      if(!bhInt(a.ri,0,4)||!bhInt(a.mi,0,3))return"gecersiz_istek";
      if(!open(a.ri))return"bolge_kapali";
    }
    if(Number.isFinite(hp)||Number.isFinite(mp)){ /* pasif yenilenme istemcide: can/mana başlangıçta istemciden alınır (sınırlanır) */
      KZ.syncP(p);
      if(Number.isFinite(hp))p.hp=Math.max(1,Math.min(p.maxHp,Math.floor(hp)));
      if(Number.isFinite(mp))p.mp=Math.max(0,Math.min(p.maxMp,Math.floor(mp)));
    }
    startFight(tw?0:a.ri,tw?0:a.mi,tw);
    return"";
  };

  try{
    if(op==="start"){
      const e=begin(body,body.hp,body.mp);if(e)return{err:e};
    }else if(op==="finish"){
      if(!B||B.over)return{err:"savas_yok"};
      const acts=body.acts;
      if(!Array.isArray(acts))return{err:"gecersiz_istek"};
      if(acts.length>BH_MAX_ACTS)return{err:"gecersiz_eylem"};
      /* gerçek zamandan hızlı bitirilemez: hamle başına en az 200 ms, savaş başına en az 1.5 sn (telefon bunu kendisi bekler) */
      const need=Math.max(body.partial?0:1500,acts.length*200);
      if((g.age_ms||0)<need)return{err:"bekle",ms:need-(g.age_ms||0)};
      const res=replay(acts);
      if(res==="bad")return{err:"gecersiz_eylem"};
      if(res==="win")winNow();
      else if(res==="lose")loseNow();
      else if(body.partial){B.over=true;steps.push({out:[],s:S(true),partial:true})}   /* kaçış: harcanan iksir/mana kaydedilir */
      else return{err:"bitmedi"};
      if(res==="win"&&body.next){const e=begin(body.next);if(e)steps.push({out:[],s:S(false),nextErr:e})}
    }else if(op==="act"){
      if(!B||B.over)return{err:"savas_yok"};
      if(!bhInt(body.i,-1,3))return{err:"gecersiz_istek"};
      round(body.i);lockMs=250;
    }else if(op==="pot"){
      if(!B||B.over)return{err:"savas_yok"};
      if(!["hp","mp"].includes(body.t)||!["S","M","L"].includes(body.sz))return{err:"gecersiz_istek"};
      push(KZ.bPot(p,body.t,body.sz,false));lockMs=120;
    }else if(op==="auto"){
      if(!B||B.over){const e=begin(body);if(e)return{err:e}}
      else if(Array.isArray(body.acts)&&body.acts.length){     /* telefonun manuel oynadığı hamleleri önce işle */
        const res=replay(body.acts);
        if(res!=="open")return{err:"gecersiz_eylem"};
      }
      p.autoCfg=bhCfg(body.cfg,p.autoCfg);
      let left=bhInt(body.fights,1,10)?body.fights:1,acts=0;
      for(let n=0;n<BH_MAX_STEPS;n++){
        const r=KZ.bAutoStep(B,p,rngC);
        if(r.kind==="pot"){push(r.out);continue}
        if(r.kind==="stop"){push(r.out);stopped="stop";break}
        for(const e of r.out)if(e.lg!==undefined||e.toast)steps.push({out:[e],s:S(false)});
        acts++;
        const res=round(r.k);
        if(res==="noact"){stopped="noact";break}
        if(res==="lose"){stopped="lose";break}
        if(res==="win"){
          if(--left>0){const tw=B.tw?B.tw+1:0;startFight(B.ri,B.mi,tw)}
          else{stopped="win";break}
        }
      }
      lockMs=acts*150;
    }
  }catch(e){return{err:"sunucu_hatasi",msg:String(e&&e.message||e)}}

  if(B&&rngC)B.k=rngC.k;
  const over=!B||B.over;
  try{await db.put(uid,g.rev,body.slot,p,over?null:B,lockMs)}
  catch(e){const m=String(e&&e.message||e);return{err:/cakisma/.test(m)?"cakisma":"sunucu_hatasi",msg:m}}
  const ps2={};for(const k of BH_FIELDS)ps2[k]=p[k];ps2.inv=p.inv;
  return{ok:true,steps,stopped,over,B:over?null:B,ps:ps2};
}
if(typeof module!=="undefined"&&module.exports)module.exports={kzBattleHandle};
