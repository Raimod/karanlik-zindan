/* ============================================================
   LONCA SİSTEMİ (Topluluk > 🏰 Lonca)
   community.js'ten SONRA yüklenir. Sunucu tarafı: sql/lonca.sql
   ============================================================ */
const GD={me:undefined,list:null,q:"",form:false,chat:[],sig:"",busy:false,err:""};
const G_EMB=["⚔️","🛡️","🐉","💀","🦅","🔥","🌙","👑","🐺","🗡️","🏹","🔮"];
const G_ROLE={lider:["Lider","👑"],subay:["Subay","⭐"],uye:["Üye",""]};
function gErr(e){
  const m=((e&&e.message)||String(e)).replace(/^.*?lonca:\s*/i,"");
  const T=[[/kufur/i,"Uygunsuz içerik algılandı, değiştir."],[/zaten loncan var/,"Zaten bir loncadasın."],[/seviye 10/,"Lonca kurmak için en az 10. seviye gerekir."],
    [/3-16/,"Lonca adı 3 ile 16 karakter arasında olmalı."],[/adi alinmis/,"Bu lonca adı alınmış."],[/once oyunda/,"Önce oyunda bir karakter oluştur ve oyna."],
    [/davetli/,"Bu lonca katılıma kapalı."],[/en az seviye (\d+)/,"Bu loncaya girmek için en az seviye $1 gerekir."],[/dolu/,"Lonca dolu (en çok 30 üye)."],
    [/bulunamadi/,"Lonca bulunamadı."],[/yetkin yok/,"Bunun için yetkin yok."],[/loncanda degil/,"Bu oyuncu artık loncanda değil."],[/loncan yok/,"Bir loncan yok."],
    [/cok hizli/,"Çok hızlı yazıyorsun, 2 saniye bekle."],[/kendini atamazsin|kendine islem/,"Kendine bu işlemi yapamazsın."],[/1-200/,"Mesaj 1-200 karakter olmalı."],[/karakter: bu karakter/,"Karakterin henüz buluta kaydedilmedi, birkaç saniye sonra tekrar dene."]];
  for(const[r,t]of T){const x=m.match(r);if(x)return t.replace("$1",x[1]||"")}
  return"İşlem yapılamadı: "+(typeof cloudErr==="function"?cloudErr(e):m);
}
async function gLoad(){
  try{
    await comPushLb(false);
    const r=await CLOUD.sb.rpc("kz_g_me",{p_me:P.name});if(r.error)throw r.error;
    GD.me=r.data||null;GD.err="";
  }catch(e){GD.err=(e&&e.message)||"hata";if(GD.me===undefined)GD.me=null}
  if(tab==="community"&&COM.sub==="guild")view();
}
function gRefresh(){GD.me=undefined;GD.list=null;view()}
function cGuild(v,sub){socSync();
  if(GD.me===undefined){
    v.innerHTML=sub+'<div class="cd"><div class="ct">🏰 Lonca</div><p class="mu" style="font-size:11px">Yükleniyor...</p></div>';
    gLoad();return;
  }
  if(GD.err&&/function .*kz_g_me|Could not find/i.test(GD.err)){
    v.innerHTML=sub+`<div class="cd"><div class="ct">🏰 Lonca</div><p style="font-size:11px;color:#fbbf24">Lonca sistemi henüz kurulmamış.<br><span class="mu">Supabase'te sql/lonca.sql kodunu çalıştır.</span></p><button class="btn s" onclick="gRefresh()">Tekrar dene</button></div>`;return;
  }
  if(!GD.me){gNoGuild(v,sub);return}
  gMain(v,sub);
}
/* ---------- Loncası olmayan ---------- */
function gNoGuild(v,sub){
  const lv=(comBest()||{}).level|0;
  if(GD.form){
    v.innerHTML=sub+`<div class="cd"><div class="ct">➕ Lonca Kur</div>
      <p class="mu" style="font-size:11px;margin-bottom:8px">Lonca kurmak için en az 10. seviye bir karakterin olmalı. Kurucu lider olur, en çok 30 kişi katılabilir.</p>
      <input id="g-name" maxlength="16" placeholder="Lonca adı (3-16 harf)" autocomplete="off" style="${GI}">
      <input id="g-desc" maxlength="80" placeholder="Kısa tanıtım (isteğe bağlı)" autocomplete="off" style="${GI};margin-top:6px">
      <div class="mu" style="font-size:10px;margin:8px 0 4px">Amblem:</div><div id="g-emb">${gEmbPick(0)}</div>
      <div style="display:flex;gap:6px;margin-top:10px"><button class="btn s" onclick="GD.form=false;view()">Vazgeç</button><button class="btn" onclick="gCreate()">Kur</button></div></div>`;
    return;
  }
  v.innerHTML=sub+`<div class="cd"><div class="ct">🏰 Lonca</div>
    <p class="mu" style="font-size:11px;margin-bottom:8px">Bir loncaya katıl ya da kendi loncanı kur. Loncanın gücü, üyelerinin seviyelerinin toplamıdır; güçlü loncalar listenin tepesinde yer alır. Lonca sohbeti yalnızca üyelere açıktır.</p>
    <button class="btn" onclick="GD.form=true;view()" ${lv>=10?"":'style="opacity:.55"'}>➕ Lonca Kur${lv>=10?"":" (Lv.10 gerekir)"}</button></div>
    <div class="cd"><div class="ct">🔍 Loncalar</div>
    <div style="display:flex;gap:6px;margin-bottom:8px"><input id="g-q" maxlength="16" placeholder="Lonca adı ara..." value="${escH(GD.q)}" autocomplete="off" onkeydown="if(event.key==='Enter')gSearch()" style="${GI};flex:1;min-width:0"><button class="btn" style="width:auto;padding:0 14px" onclick="gSearch()">Ara</button></div>
    <div id="g-list"><p class="mu" style="font-size:11px">Yükleniyor...</p></div></div>`;
  gLoadList();
}
const GI="width:100%;padding:9px;background:#000;border:1px solid var(--ln);border-radius:8px;color:#fff;-webkit-user-select:text;user-select:text;box-sizing:border-box";
let gEmbSel=0;
function gEmbPick(sel){gEmbSel=sel;return G_EMB.map((e,i)=>`<span onclick="gEmbSet(${i})" style="display:inline-block;width:38px;height:38px;line-height:38px;text-align:center;font-size:20px;border-radius:8px;margin:0 4px 4px 0;cursor:pointer;border:2px solid ${i===sel?"var(--gold)":"var(--ln)"}">${e}</span>`).join("")}
function gEmbSet(i){const b=$("g-emb");if(b)b.innerHTML=gEmbPick(i)}
function gSearch(){GD.q=(($("g-q")||{}).value||"").trim();GD.list=null;gLoadList()}
async function gLoadList(){
  try{
    const r=await CLOUD.sb.rpc("kz_g_list",{p_q:GD.q});if(r.error)throw r.error;
    GD.list=r.data||[];
    const b=$("g-list");if(!b)return;
    if(!GD.list.length){b.innerHTML='<p class="mu" style="font-size:11px">'+(GD.q?"Bu adla lonca bulunamadı.":"Henüz lonca yok. İlk loncayı sen kur!")+"</p>";return}
    b.innerHTML=GD.list.map(g=>`<div class="q" style="padding:7px 8px;margin-bottom:5px;align-items:center">
      <div style="width:34px;text-align:center;font-size:22px">${G_EMB[g.emblem]||"⚔️"}</div>
      <div style="flex:1;min-width:0"><b>${escH(g.name)}</b><div class="mu" style="font-size:10px">${Number(g.cnt)}/30 üye · Güç ${Number(g.power)} · ${g.open?"Açık":"Davetli"}${g.min_lv>1?" · Lv."+g.min_lv+"+":""}</div>${g.descr?`<div class="mu" style="font-size:10px;word-break:break-word">${escH(g.descr)}</div>`:""}</div>
      ${g.open?`<button class="btn s" style="width:auto;padding:6px 12px;margin:0" onclick="gJoin(${Number(g.id)})">Katıl</button>`:'<span class="mu" style="font-size:10px">🔒</span>'}</div>`).join("");
  }catch(e){const b=$("g-list");if(b)b.innerHTML=`<p style="font-size:11px;color:#fbbf24">Liste yüklenemedi: ${escH(gErr(e))}<br><span class="mu">Supabase'te sql/lonca.sql kodunun çalıştırıldığından emin ol.</span></p>`}
}
async function gDo(fn,okMsg){
  if(GD.busy)return false;GD.busy=true;
  try{const r=await socRetry(fn);if(r&&r.error)throw r.error;if(okMsg)toast(okMsg);GD.busy=false;return true}
  catch(e){GD.busy=false;toast(gErr(e));return false}
}
async function gCreate(){
  const n=(($("g-name")||{}).value||"").trim(),d=(($("g-desc")||{}).value||"").trim();
  if(n.length<3)return toast("Lonca adı en az 3 karakter olmalı");
  try{if(typeof cloudPush==="function")await cloudPush(true)}catch(e){}
  await comPushLb(true);
  if(await gDo(()=>CLOUD.sb.rpc("kz_g_create",{p_me:P.name,p_name:n,p_descr:d,p_emblem:gEmbSel}),"Lonca kuruldu! 🏰")){GD.form=false;gRefresh()}
}
async function gJoin(id){await comPushLb(true);if(await gDo(()=>CLOUD.sb.rpc("kz_g_join",{p_me:P.name,p_id:id}),"Loncaya katıldın!"))gRefresh()}
/* ---------- Loncası olan ---------- */
function gMain(v,sub){
  const m=GD.me,lead=m.role==="lider";
  const mem=m.members.map(x=>{
    const c=CL[x.cls]||CL.tank,me=x.name===P.name,r=G_ROLE[x.role]||G_ROLE.uye;
    return`<div class="q" onclick="gMember('${escH(x.ck)}')" style="cursor:pointer;padding:6px 8px;margin-bottom:4px;${me?"border:1px solid var(--gold);":""}">
      <div style="width:26px;text-align:center">${r[1]||c.e}</div>
      <div style="flex:1;min-width:0"><b style="${me?"color:var(--gold)":""}">${escH(x.name)}</b>${me?' <span class="mu" style="font-size:9px">(sen)</span>':""}<div class="mu" style="font-size:10px">${r[0]} · ${escH(c.n||x.cls)}</div></div>
      <b class="g" style="font-size:12px">Lv.${Number(x.level)}</b></div>`}).join("");
  v.innerHTML=sub+`<div class="cd"><div style="display:flex;align-items:center;gap:10px"><div style="font-size:34px">${G_EMB[m.emblem]||"⚔️"}</div>
      <div style="flex:1;min-width:0"><div class="ct" style="margin:0">${escH(m.name)}</div><div class="mu" style="font-size:10.5px">${m.count}/30 üye · Güç ${Number(m.power)} · ${m.open?"Açık":"Davetli"}${m.min_lv>1?" · Lv."+m.min_lv+"+":""}</div></div></div>
    ${m.descr?`<p class="mu" style="font-size:11px;margin-top:8px;word-break:break-word">${escH(m.descr)}</p>`:""}
    <div style="display:flex;gap:6px;margin-top:10px">${lead?'<button class="btn s" style="margin:0" onclick="gSettings()">⚙️ Ayarlar</button>':""}<button class="btn s" style="margin:0" onclick="gLeaveAsk()">🚪 Ayrıl</button><button class="btn s" style="margin:0;flex:0 0 auto;width:auto;padding:0 12px" onclick="gRefresh()">🔄</button></div></div>
    <div class="cd"><div class="ct">👥 Üyeler</div>${mem}<p class="mu" style="font-size:9.5px;margin-top:4px">Bir üyeye dokununca profili ve yetkin varsa işlemler açılır. Güç değeri, karakterlerini oynadıkça güncellenir.</p></div>
    <div class="cd"><div class="ct">💬 Lonca Sohbeti</div>
      <div id="g-chat" style="height:240px;overflow-y:auto;background:#0006;border-radius:8px;padding:8px;font-size:11px;line-height:1.4"><p class="mu">Yükleniyor...</p></div>
      <div style="display:flex;gap:6px;margin-top:8px"><input id="g-in" maxlength="200" placeholder="Loncaya yaz..." autocomplete="off" onkeydown="if(event.key==='Enter')gSay()" style="${GI};flex:1;min-width:0"><button class="btn" style="width:auto;padding:0 16px" onclick="gSay()">Gönder</button></div>
      <p class="mu" style="font-size:9.5px;margin-top:6px">Yalnızca lonca üyeleri görür. Mesajlar 7 gün saklanır.</p></div>`;
  GD.sig="";gLoadChat(true);
  COM.timer=setInterval(()=>{
    if(tab!=="community"||COM.sub!=="guild"){comStop();return}
    if(document.hidden||!CLOUD.user||CB.on)return;
    gLoadChat(false);
  },8000);
}
async function gLoadChat(scroll){
  const list=$("g-chat");if(!list)return;
  try{
    const r=await CLOUD.sb.rpc("kz_g_chat",{p_me:P.name});if(r.error)throw r.error;
    const rows=r.data||[];
    const sig=rows.map(x=>x.id).join(",");
    if(!scroll&&sig===GD.sig)return;GD.sig=sig;
    const l=$("g-chat");if(!l)return;
    const near=l.scrollHeight-l.scrollTop-l.clientHeight<60;
    l.innerHTML=rows.map(x=>{
      const mine=x.name===P.name;
      const t=new Date(x.created).toLocaleTimeString("tr-TR",{hour:"2-digit",minute:"2-digit"});
      return`<div style="margin-bottom:6px"><b ${mine?"":`onclick="comProfile('${escH(x.ck)}')" `}style="cursor:pointer;color:${mine?"var(--gold)":"#93c5fd"}">${escH(x.name||"Oyuncu")}</b> <span class="mu" style="font-size:9px">${t}</span><div style="word-break:break-word">${escH(x.body)}</div></div>`}).join("")||'<p class="mu">Henüz mesaj yok. İlk mesajı sen yaz!</p>';
    if(scroll||near)l.scrollTop=l.scrollHeight;
  }catch(e){const l=$("g-chat");if(l)l.innerHTML=`<p style="font-size:11px;color:#fbbf24">Sohbet yüklenemedi: ${escH(gErr(e))}</p>`}
}
async function gSay(){
  const inp=$("g-in");if(!inp)return;const t=(inp.value||"").trim();if(!t)return;
  if(await gDo(()=>CLOUD.sb.rpc("kz_g_say",{p_me:P.name,p_body:t}))){inp.value="";gLoadChat(true)}
}
function gMember(uid){
  const m=GD.me,x=m.members.find(a=>a.ck===uid);if(!x)return;
  const self=x.name===P.name,lead=m.role==="lider",off=m.role==="subay";
  const b=[];
  b.push(`<button class="btn s" onclick="closeM();comProfile('${escH(uid)}')">👤 Profili gör</button>`);
  if(!self&&lead){
    b.push(x.role==="uye"?`<button class="btn s" onclick="gAct('role','${escH(uid)}','subay')">⭐ Subay yap</button>`:x.role==="subay"?`<button class="btn s" onclick="gAct('role','${escH(uid)}','uye')">⬇️ Üyeliğe indir</button>`:"");
    b.push(`<button class="btn s" onclick="gAsk('Liderliği ${escH(x.name)} adlı oyuncuya devret?','gAct(\\'role\\',\\'${escH(uid)}\\',\\'lider\\')')">👑 Liderliği devret</button>`);
  }
  if(!self&&(lead||(off&&x.role==="uye")))b.push(`<button class="btn s" style="color:#f87171" onclick="gAsk('${escH(x.name)} loncadan atılsın mı?','gAct(\\'kick\\',\\'${escH(uid)}\\')')">🚫 Loncadan at</button>`);
  $("ic").innerHTML=`<div style="text-align:center;margin-bottom:10px"><b style="font-size:16px">${escH(x.name)}</b><div class="mu" style="font-size:11px">${(G_ROLE[x.role]||G_ROLE.uye)[0]} · Lv.${Number(x.level)}</div></div>${b.join("")}<button class="btn s" onclick="closeM()">Kapat</button>`;
  $("im").style.display="flex";
}
function gAsk(txt,js){
  $("ic").innerHTML=`<p style="text-align:center;margin-bottom:12px">${txt}</p><div style="display:flex;gap:6px"><button class="btn s" onclick="closeM()">Vazgeç</button><button class="btn" onclick="closeM();${js}">Evet</button></div>`;
  $("im").style.display="flex";
}
async function gAct(kind,uid,role){
  closeM();
  const ok=await gDo(()=>kind==="kick"?CLOUD.sb.rpc("kz_g_kick",{p_me:P.name,p_user:uid}):CLOUD.sb.rpc("kz_g_role",{p_me:P.name,p_user:uid,p_role:role}),kind==="kick"?"Oyuncu atıldı":"Rütbe güncellendi");
  if(ok)gRefresh();
}
function gLeaveAsk(){
  const m=GD.me,alone=m.count===1;
  gAsk(alone?"Loncadan ayrılırsan lonca silinir. Emin misin?":m.role==="lider"?"Liderlik en eski subaya (yoksa en eski üyeye) geçer. Ayrılmak istiyor musun?":"Loncadan ayrılmak istiyor musun?","gLeave()");
}
async function gLeave(){if(await gDo(()=>CLOUD.sb.rpc("kz_g_leave",{p_me:P.name}),"Loncadan ayrıldın"))gRefresh()}
function gSettings(){
  const m=GD.me;
  $("ic").innerHTML=`<div class="ct" style="margin-bottom:8px">⚙️ Lonca Ayarları</div>
    <input id="g-desc" maxlength="80" value="${escH(m.descr)}" placeholder="Kısa tanıtım" autocomplete="off" style="${GI}">
    <div class="mu" style="font-size:10px;margin:8px 0 4px">Amblem:</div><div id="g-emb">${gEmbPick(m.emblem)}</div>
    <div class="mu" style="font-size:10px;margin:8px 0 4px">Katılım için en düşük seviye:</div>
    <input id="g-min" type="number" min="1" max="100" value="${m.min_lv}" style="${GI}">
    <label style="display:flex;align-items:center;gap:8px;margin:10px 0;font-size:12px"><input id="g-open" type="checkbox" ${m.open?"checked":""}> Herkes doğrudan katılabilsin</label>
    <button class="btn" onclick="gSave()">Kaydet</button>
    <button class="btn s" style="color:#f87171" onclick="gAsk('Lonca tamamen silinsin mi? Bu geri alınamaz.','gDisband()')">🗑️ Loncayı dağıt</button>
    <button class="btn s" onclick="closeM()">Kapat</button>`;
  $("im").style.display="flex";
}
async function gSave(){
  const d=($("g-desc")||{}).value||"",mn=Math.max(1,Math.min(100,parseInt(($("g-min")||{}).value)||1)),op=!!($("g-open")||{}).checked;
  if(await gDo(()=>CLOUD.sb.rpc("kz_g_set",{p_me:P.name,p_descr:d,p_emblem:gEmbSel,p_min_lv:mn,p_open:op}),"Ayarlar kaydedildi")){closeM();gRefresh()}
}
async function gDisband(){if(await gDo(()=>CLOUD.sb.rpc("kz_g_disband",{p_me:P.name}),"Lonca dağıtıldı"))gRefresh()}
