/* ============================================================
   BULUT HESAP VE KAYIT (Supabase)
   Çevrimdışıysa veya bir hata olursa oyun bu cihazdaki kayıtla
   çalışmaya devam eder. Bu dosya game.js'ten SONRA yüklenir.
   ============================================================ */
const CLOUD_URL="https://vbyaraxgdthhhpxfkiir.supabase.co";
const CLOUD_KEY="sb_publishable_pYF8HKKVrN3d1t5x6t7Rcw_fHSnzCU9"; /* herkese açık anahtar, gizli değil */
const CLOUD_MAIL="@kz-oyun.com"; /* kullanıcı adından sahte e-posta üretmek için */
const CLOUD_LIB="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js";
const CLOUD_SYNC_KEY="kz_cloud_sync";
const CLOUD={sb:null,user:null,state:"loading",busy:false,msg:"",timer:null,silent:false,hold:false,asking:false,pending:null,lastSync:0,lastCheck:0};

const escH=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const cloudName=()=>CLOUD.user?((CLOUD.user.user_metadata&&CLOUD.user.user_metadata.username)||(CLOUD.user.email||"").split("@")[0]):"";

/* ---- Eşitleme kaydı: bu cihaz buluttan en son hangi ilerlemeyle eşitlendi ---- */
function cloudSyncGet(){try{const o=JSON.parse(localStorage.getItem(CLOUD_SYNC_KEY)||"null");return(o&&CLOUD.user&&o.uid===CLOUD.user.id)?o.ms:null}catch(e){return null}}
function cloudSyncSet(ms){try{localStorage.setItem(CLOUD_SYNC_KEY,JSON.stringify({uid:CLOUD.user.id,ms}))}catch(e){}}
/* Bu cihazdaki kayıtlar başka bir hesaba mı ait? (eşitleme işaretindeki hesap numarası farklıysa evet) */
function cloudForeign(){try{const o=JSON.parse(localStorage.getItem(CLOUD_SYNC_KEY)||"null");return!!(o&&CLOUD.user&&o.uid&&o.uid!==CLOUD.user.id)}catch(e){return false}}
/* Cihazdaki karakterleri siler (bulutta duran kayda dokunmaz) ve sayfayı yeniler */
function cloudWipeLocal(){
  CLOUD.silent=true;SLOTS=[null,null,null,null,null];activeSlot=0;
  try{localStorage.setItem(SLOTS_KEY,JSON.stringify({active:0,slots:[null,null,null,null,null]}));localStorage.removeItem(CLOUD_SYNC_KEY)}catch(e){}
  location.reload();
}
const cloudStamp=()=>SLOTS.reduce((m,s)=>s?Math.max(m,s.ts||0):m,0);
const cloudHasLocal=()=>SLOTS.some(Boolean);

/* ---- Başlatma ---- */
function cloudLoadLib(){
  return new Promise((res,rej)=>{
    if(window.supabase&&window.supabase.createClient)return res();
    const s=document.createElement("script");
    s.src=CLOUD_LIB;s.onload=()=>res();s.onerror=()=>rej(new Error("lib"));
    document.head.appendChild(s);
  });
}
async function cloudInit(){
  try{
    await cloudLoadLib();
    CLOUD.sb=window.supabase.createClient(CLOUD_URL,CLOUD_KEY);
    const r=await CLOUD.sb.auth.getSession();
    CLOUD.user=(r.data&&r.data.session)?r.data.session.user:null;
    CLOUD.state=CLOUD.user?"in":"out";
    cloudUI();
    if(CLOUD.user){await cloudReconcile(false);if(typeof comPushLb==="function")comPushLb()}
  }catch(e){
    CLOUD.state="offline";cloudUI();
  }
}
function cloudRetry(){CLOUD.state="loading";cloudUI();cloudInit()}

/* ---- Hata mesajları (Türkçe) ---- */
function cloudErr(e){
  const m=(e&&e.message)||String(e);
  if(/already registered|already been registered/i.test(m))return"Bu kullanıcı adı alınmış.";
  if(/invalid login/i.test(m))return"Kullanıcı adı veya şifre yanlış.";
  if(/at least|weak|short/i.test(m))return"Şifre en az 6 karakter olmalı.";
  if(/rate limit|too many/i.test(m))return"Çok fazla deneme. Biraz bekleyip tekrar dene.";
  if(/database error/i.test(m))return"Bu kullanıcı adı kullanılamıyor, başka bir tane dene.";
  if(/failed to fetch|network|load failed/i.test(m))return"Bağlantı kurulamadı. İnternetini kontrol et.";
  return"Hata: "+m;
}
function cloudSay(m){CLOUD.msg=m;cloudUI()}

/* ---- Giriş / kayıt / çıkış ---- */
function cloudCreds(w){
  const ue=$("cl-u-"+w),pe=$("cl-p-"+w);
  const u=(ue?ue.value:"").trim().toLowerCase(),p=pe?pe.value:"";
  if(!/^[a-z0-9_]{3,16}$/.test(u))return{err:"Kullanıcı adı 3-16 karakter olmalı: küçük harf (a-z), rakam ve _ kullan. Türkçe harf kullanma."};
  if(p.length<6)return{err:"Şifre en az 6 karakter olmalı."};
  return{u,p};
}
async function cloudSignIn(reg,w){
  if(CLOUD.busy)return;
  if(!CLOUD.sb)return cloudSay("Bulut şu an kullanılamıyor (çevrimdışı).");
  const c=cloudCreds(w);
  if(c.err)return cloudSay(c.err);
  CLOUD.busy=true;cloudSay(reg?"Hesap oluşturuluyor...":"Giriş yapılıyor...");
  try{
    let r;
    if(reg){
      r=await CLOUD.sb.auth.signUp({email:c.u+CLOUD_MAIL,password:c.p,options:{data:{username:c.u}}});
      if(r.error)throw r.error;
      if(!r.data||!r.data.session){
        CLOUD.busy=false;
        return cloudSay("Hesap açıldı ama e-posta doğrulaması isteniyor. Supabase panelinde Authentication > Sign In / Providers > Email bölümünde 'Confirm email' ayarını kapat.");
      }
    }else{
      r=await CLOUD.sb.auth.signInWithPassword({email:c.u+CLOUD_MAIL,password:c.p});
      if(r.error)throw r.error;
    }
    CLOUD.user=r.data.session.user;CLOUD.state="in";CLOUD.msg="";
    toast("☁️ Giriş yapıldı: "+c.u);
    cloudUI();
    await cloudReconcile(true);
    if(typeof comPushLb==="function")comPushLb();
  }catch(e){CLOUD.msg=cloudErr(e)}
  CLOUD.busy=false;cloudUI();
}
async function cloudSignOut(){
  let safe=true;
  try{
    if(CLOUD.timer){clearTimeout(CLOUD.timer);CLOUD.timer=null;safe=await cloudPush(true)}
    await CLOUD.sb.auth.signOut();
  }catch(e){safe=false}
  CLOUD.user=null;CLOUD.state="out";CLOUD.hold=false;CLOUD.msg="";
  /* Kayıtlar buluta gittiyse cihazı temizle: başka hesap açınca eski karakterler karışmasın */
  if(safe){cloudWipeLocal();return}
  cloudUI();toast("Çıkış yapıldı. Buluta gönderilemeyen ilerleme bu cihazda duruyor.");
}

/* ---- Buluta yaz / buluttan oku ---- */
async function cloudFetch(){
  const r=await CLOUD.sb.from("saves").select("data,updated_ms").eq("user_id",CLOUD.user.id).maybeSingle();
  if(r.error)throw r.error;
  return r.data;
}
async function cloudPush(quiet){
  if(!CLOUD.user||!CLOUD.sb||CLOUD.hold)return false;
  const ms=cloudStamp()||Date.now();
  try{
    const r=await CLOUD.sb.from("saves").upsert(
      {user_id:CLOUD.user.id,data:{v:GAME_VERSION,active:activeSlot,slots:SLOTS},updated_ms:ms,updated_at:new Date().toISOString()},
      {onConflict:"user_id"});
    if(r.error)throw r.error;
    cloudSyncSet(ms);CLOUD.lastSync=Date.now();CLOUD.msg="";
    if(typeof comPushLb==="function")comPushLb();
    if(!quiet)toast("☁️ Buluta kaydedildi");
    cloudUI();return true;
  }catch(e){
    CLOUD.msg="Buluta kaydedilemedi: "+cloudErr(e);cloudUI();
    if(!quiet)toast("☁️ "+CLOUD.msg);
    return false;
  }
}
/* game.js her gerçek kayıtta bunu çağırır: 15 sn sonra buluta yaz */
function cloudQueue(){
  if(!CLOUD.user||CLOUD.silent||CLOUD.hold)return;
  clearTimeout(CLOUD.timer);
  CLOUD.timer=setTimeout(()=>{CLOUD.timer=null;cloudPush(true)},15000);
}
function cloudApply(row){
  const d=row.data||{},raw=d.slots||[];
  CLOUD.silent=true;
  try{
    SLOTS=Array.from({length:5},(_,i)=>{if(!raw[i])return null;const x=Object.assign(NEW(),raw[i]);normPot(x);return x});
    activeSlot=(d.active>=0&&SLOTS[d.active])?d.active:Math.max(0,SLOTS.findIndex(Boolean));
    if(SLOTS[activeSlot])P=SLOTS[activeSlot];
    saveAll();
    cloudSyncSet(cloudStamp());
    CLOUD.lastSync=Date.now();
    try{
      if($("cs-screen").style.display==="flex")renderCharSelect();
      else{sync();nav();view()}
    }catch(e){}
  }finally{CLOUD.silent=false}
}

/* ---- Bulut ve cihaz arasındaki farkı çöz ---- */
async function cloudReconcile(manual){
  if(!CLOUD.user||!CLOUD.sb)return;
  CLOUD.lastCheck=Date.now();
  try{
    if(cloudForeign()){cloudWipeLocal();return}
    const row=await cloudFetch(),last=cloudSyncGet(),has=cloudHasLocal(),stamp=cloudStamp();
    if(!row){
      if(has)await cloudPush(true);
      if(manual)toast("☁️ Kayıtların buluta yüklendi");
      return;
    }
    if(!has){cloudApply(row);toast("☁️ Bulut kaydın yüklendi");return}
    if(row.updated_ms===stamp){cloudSyncSet(stamp);if(manual)toast("☁️ Zaten güncel");return}
    const cloudNew=(last==null)||row.updated_ms>last;
    const localNew=(last==null)||stamp>last;
    if(cloudNew&&localNew){cloudAsk(row);return}
    if(cloudNew){
      if(CB.on){cloudAsk(row);return}
      cloudApply(row);toast("☁️ Başka cihazdaki ilerleme yüklendi");return;
    }
    if(localNew){cloudQueue();if(manual)toast("☁️ Bu cihazdaki ilerleme buluta gidecek");return}
    if(manual)toast("☁️ Zaten güncel");
  }catch(e){
    CLOUD.msg="Bulut eşitlenemedi: "+cloudErr(e);cloudUI();
  }
}
function cloudSummary(slots){
  const l=(slots||[]).filter(Boolean);
  if(!l.length)return"Boş";
  return l.map(s=>escH(s.name)+" (Lv."+s.lv+" · 🪙"+(s.gold||0)+")").join(", ");
}
function cloudAsk(row){
  CLOUD.hold=true;CLOUD.pending=row;CLOUD.asking=true;
  const cs=(row.data&&row.data.slots)||[];
  cloudModal(`<div class="ct">☁️ Hangi kayıt kalsın?</div>
  <p class="mu" style="font-size:11px;margin-bottom:8px">Bulutta ve bu cihazda farklı ilerleme var. Seçmediğin taraf silinecek.</p>
  <div class="q" style="display:block"><b>☁️ Bulut</b><div class="mu">${cloudSummary(cs)}<br>Son: ${new Date(row.updated_ms).toLocaleString("tr-TR")}</div>
    <button class="btn" style="margin-top:6px" onclick="cloudChoose('cloud')">Bulut kaydını kullan</button></div>
  <div class="q" style="display:block"><b>📱 Bu cihaz</b><div class="mu">${cloudSummary(SLOTS)}<br>Son: ${new Date(cloudStamp()).toLocaleString("tr-TR")}</div>
    <button class="btn" style="margin-top:6px" onclick="cloudChoose('local')">Bu cihazdakini kullan</button></div>
  <button class="btn s" style="margin-top:6px" onclick="cloudChoose('later')">Sonra karar vereyim</button>`);
}
async function cloudChoose(w){
  const row=CLOUD.pending;
  CLOUD.asking=false;
  if(w==="later"){cloudCloseModal();cloudUI();return}
  CLOUD.hold=false;
  if(w==="cloud"&&row){cloudApply(row);toast("☁️ Bulut kaydı yüklendi")}
  else if(w==="local"){await cloudPush(true);toast("☁️ Bu cihazdaki kayıt buluta yazıldı")}
  CLOUD.pending=null;
  cloudCloseModal();cloudUI();
}
function cloudResolveNow(){CLOUD.hold=false;cloudReconcile(true)}

/* ---- Arayüz ---- */
function cloudModal(html){
  let m=$("cloud-modal");
  if(!m){
    m=document.createElement("div");m.id="cloud-modal";
    m.style.cssText="position:fixed;inset:0;background:#000d;z-index:400;display:flex;align-items:center;justify-content:center;padding:14px";
    document.body.appendChild(m);
  }
  m.innerHTML=`<div class="mm2">${html}</div>`;m.style.display="flex";
}
function cloudCloseModal(){const m=$("cloud-modal");if(m)m.style.display="none";CLOUD.modalOpen=false}
function cloudOpenModal(){
  CLOUD.modalOpen=true;CLOUD.asking=false;
  cloudModal(`<div class="ct">☁️ Bulut hesabı</div><div id="cloud-m">${cloudPanel("m")}</div>
  <button class="btn s" style="margin-top:10px" onclick="cloudCloseModal()">Kapat</button>`);
}
function cloudPanel(w){
  const st=CLOUD.state;
  const msg=CLOUD.msg?`<p style="font-size:11px;color:#fbbf24;margin:8px 0">${escH(CLOUD.msg)}</p>`:"";
  if(st==="loading")return`<p class="mu" style="font-size:11px">Bulut bağlantısı hazırlanıyor...</p>`;
  if(st==="offline")return`<p class="mu" style="font-size:11px">Çevrimdışısın. Oyun bu cihazda çalışır, internet gelince bulut kullanılabilir.</p><button class="btn s" style="margin-top:8px" onclick="cloudRetry()">Tekrar dene</button>`;
  if(st==="in"){
    const t=CLOUD.lastSync?" Son bulut kaydı: "+new Date(CLOUD.lastSync).toLocaleTimeString("tr-TR")+".":"";
    return`<p style="font-size:12px">Giriş yapıldı: <b class="g">${escH(cloudName())}</b></p>
    <p class="mu" style="font-size:10px;margin:4px 0 8px">${CLOUD.hold?"⏸ Eşitleme karar bekliyor, şimdilik buluta kaydedilmiyor.":"İlerleme değiştikçe 15 saniye içinde otomatik buluta kaydedilir."}${t}</p>
    ${msg}
    <div class="pr" style="margin:0 0 6px">
      <button onclick="cloudPush(false)">☁️ Şimdi kaydet</button>
      <button onclick="${CLOUD.hold?"cloudResolveNow()":"cloudReconcile(true)"}">🔄 Eşitle</button>
    </div>
    <button class="btn s" style="padding:8px;font-size:11px" onclick="cloudSignOut()">Çıkış yap</button>`;
  }
  const inp="width:100%;padding:10px;background:#000;border:1px solid var(--ln);border-radius:8px;color:#fff;font-weight:700;margin-bottom:8px;-webkit-user-select:text;user-select:text";
  return`<p class="mu" style="font-size:10.5px;margin-bottom:8px">Hesapla aynı karaktere her cihazdan ulaşırsın. E-posta gerekmez. Şifreni unutursan sıfırlanamaz, bir yere not et.</p>
  <input id="cl-u-${w}" placeholder="Kullanıcı adı (a-z, 0-9, _)" maxlength="16" autocapitalize="none" autocorrect="off" spellcheck="false" autocomplete="username" style="${inp}">
  <input id="cl-p-${w}" type="password" placeholder="Şifre (en az 6 karakter)" autocomplete="current-password" style="${inp}">
  ${msg}
  <div class="pr" style="margin:0"><button onclick="cloudSignIn(false,'${w}')">Giriş yap</button><button onclick="cloudSignIn(true,'${w}')">Hesap oluştur</button></div>`;
}
/* Karakter sekmesi > Kayıt bölümündeki kart */
function cloudHTML(){
  return`<div class="cd" id="cloud-card"><div class="ct">☁️ Bulut hesabı</div><div id="cloud-c">${cloudPanel("c")}</div></div>`;
}
function cloudUI(){
  const keep={};
  ["u","p"].forEach(k=>["c","m","g"].forEach(w=>{const e=$("cl-"+k+"-"+w);if(e)keep[e.id]=e.value}));
  const c=$("cloud-c");if(c)c.innerHTML=cloudPanel("c");
  const m=$("cloud-m");if(m&&!CLOUD.asking)m.innerHTML=cloudPanel("m");
  Object.keys(keep).forEach(id=>{const e=$(id);if(e)e.value=keep[id]});
  const b=$("cl-open");if(b)b.textContent=CLOUD.state==="in"?"☁️ Bağlı":"☁️ Hesap";
  cloudGate();
}
/* Giriş zorunlu: hesapla giriş yapılana kadar oyun ekranı kapalı kalır.
   İstisna: daha önce bu cihazda giriş yapılmışsa ve şu an çevrimdışıysa oyun açılır. */
function cloudGate(){
  let g=$("cloud-gate");
  let wasOk=false;try{const o=JSON.parse(localStorage.getItem(CLOUD_SYNC_KEY)||"null");wasOk=!!(o&&o.uid)}catch(e){}
  if(CLOUD.state==="in"||(CLOUD.state==="offline"&&wasOk)){if(g)g.remove();return}
  if(!g){
    g=document.createElement("div");g.id="cloud-gate";
    g.style.cssText="position:fixed;inset:0;background:#07060c;z-index:500;display:flex;align-items:center;justify-content:center;padding:18px;overflow-y:auto";
    document.body.appendChild(g);
  }
  const st=CLOUD.state;
  let body;
  if(st==="loading")body=`<p class="mu" style="font-size:12px;text-align:center">Bağlanıyor...</p>`;
  else if(st==="offline")body=`<p class="mu" style="font-size:12px;margin-bottom:10px">Sunucuya ulaşılamıyor. Oynamak için hesapla giriş yapman gerekiyor, internetini kontrol et.</p><button class="btn" onclick="cloudRetry()">Tekrar dene</button>`;
  else body=cloudPanel("g");
  const keep={};["u","p"].forEach(k=>{const e=$("cl-"+k+"-g");if(e)keep[e.id]=e.value});
  g.innerHTML=`<div class="mm2" style="max-width:360px;width:100%"><div class="ct" style="text-align:center;font-size:18px">⚔️ Karanlık Zindan</div><p class="mu" style="text-align:center;font-size:11px;margin:4px 0 12px">Oynamak için giriş yap veya hesap oluştur</p>${body}</div>`;
  Object.keys(keep).forEach(id=>{const e=$(id);if(e)e.value=keep[id]});
}
function cloudInjectBtn(){
  const top=document.querySelector("#cs-screen .cs-top");
  if(!top||$("cl-open"))return;
  const b=document.createElement("button");
  b.id="cl-open";b.textContent="☁️ Hesap";
  b.style.cssText="position:absolute;top:calc(12px + env(safe-area-inset-top,0px));right:14px;z-index:3;background:rgba(18,15,27,.78);border:1px solid rgba(230,180,80,.5);color:#e6b450;border-radius:8px;padding:6px 10px;font-size:11px;font-weight:800;max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap";
  b.onclick=()=>cloudOpenModal();
  top.appendChild(b);
}

/* ---- Olaylar: uygulama arka plana gidince yaz, öne gelince başka cihazı kontrol et ---- */
document.addEventListener("visibilitychange",()=>{
  if(!CLOUD.user)return;
  if(document.visibilityState==="hidden"){
    if(CLOUD.timer){clearTimeout(CLOUD.timer);CLOUD.timer=null;cloudPush(true)}
  }else if(!CB.on&&!CLOUD.hold&&!CLOUD.asking&&Date.now()-CLOUD.lastCheck>60000){
    cloudReconcile(false);
  }
});
window.addEventListener("online",()=>{if(CLOUD.state==="offline")cloudRetry()});

(function(){
  const go=()=>{cloudInjectBtn();cloudInit()};
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",go);else go();
})();
