/* ============================================================
   ARKADAŞ LİSTESİ + ÇEVRİMİÇİ DURUMU + ÖZEL MESAJ + ENGELLEME
   community.js ve lonca.js'ten SONRA yüklenir. Sunucu tarafı: sql/arkadas.sql
   ============================================================ */
const FR={data:null,unread:0,reqs:0,lastPing:0,dm:null,dmTimer:null,inbox:null,busy:false,err:""};
function frErr(e){
  const m=((e&&e.message)||String(e)).replace(/^.*?arkadas:\s*/i,"");
  const T=[[/kufur/i,"Uygunsuz içerik algılandı, değiştir."],[/cok hizli/,"Çok hızlı yazıyorsun, 2 saniye bekle."],[/kendini ekleyemezsin/,"Kendini ekleyemezsin."],
    [/kendine yazamazsin/,"Kendine mesaj yazamazsın."],[/bulunamadi/,"Oyuncu bulunamadı."],[/engelli/,"Bu oyuncuyla işlem yapılamıyor (engelli)."],[/zaten arkadas/,"Zaten arkadaşsınız."],
    [/listen dolu/,"Arkadaş listen dolu (en çok 50)."],[/cok fazla bekleyen/,"Çok fazla bekleyen isteğin var."],[/kabul etmiyor/,"Bu oyuncu sana mesaj kabul etmiyor."],
    [/engelledin/,"Bu oyuncuyu engelledin. Önce engeli kaldır."],[/1-200/,"Mesaj 1-200 karakter olmalı."],[/istek bulunamadi/,"İstek artık yok."],[/karakter: bu karakter/,"Karakterin henüz buluta kaydedilmedi, birkaç saniye sonra tekrar dene."]];
  for(const[r,t]of T){if(r.test(m))return t}
  return"İşlem yapılamadı: "+(typeof cloudErr==="function"?cloudErr(e):m);
}
async function frDo(fn,okMsg){
  if(FR.busy)return false;FR.busy=true;
  try{const r=await socRetry(fn);if(r&&r.error)throw r.error;if(okMsg)toast(okMsg);FR.busy=false;return r||true}
  catch(e){FR.busy=false;toast(frErr(e));return false}
}
/* ---------- Çevrimiçi sinyali + rozet ---------- */
async function frPing(){
  socSync();
  if(!CLOUD.user||!CLOUD.sb||document.hidden)return;
  FR.lastPing=Date.now();
  try{
    const r=await CLOUD.sb.rpc("kz_ping",{p_me:P.name});if(r.error||!r.data)return;
    const bad=(r.data.unread|0)+(r.data.reqs|0)!==FR.unread+FR.reqs;
    FR.unread=r.data.unread|0;FR.reqs=r.data.reqs|0;
    if(bad){nav();if(tab==="community"&&COM.sub==="friends"&&!FR.dm)view()}
  }catch(e){}
}
setInterval(()=>{if(Date.now()-FR.lastPing>=60000||(!FR.lastPing&&CLOUD.user))frPing()},5000);
document.addEventListener("visibilitychange",()=>{if(!document.hidden&&CLOUD.user)frPing()});
const frBadge=()=>FR.unread+FR.reqs;
/* ---------- Arkadaşlar sekmesi ---------- */
async function frLoad(){
  try{
    const [a,b]=await Promise.all([CLOUD.sb.rpc("kz_f_list",{p_me:P.name}),CLOUD.sb.rpc("kz_dm_inbox",{p_me:P.name})]);
    if(a.error)throw a.error;if(b.error)throw b.error;
    FR.data=a.data;FR.inbox=b.data||[];FR.err="";
  }catch(e){FR.err=(e&&e.message)||"hata";if(!FR.data)FR.data={friends:[],incoming:[],outgoing:[]};if(!FR.inbox)FR.inbox=[]}
  if(tab==="community"&&COM.sub==="friends"&&!FR.dm)view();
}
function frRefresh(){FR.data=null;FR.inbox=null;view()}
const frDot=on=>`<span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:${on?"#4ade80":"#6b7280"};box-shadow:${on?"0 0 6px #4ade80":"none"};margin-right:6px"></span>`;
function cFriends(v,sub){socSync();
  if(!FR.data){
    v.innerHTML=sub+'<div class="cd"><div class="ct">👥 Arkadaşlar</div><p class="mu" style="font-size:11px">Yükleniyor...</p></div>';
    frLoad();return;
  }
  if(FR.err&&/Could not find|function .*kz_f_list/i.test(FR.err)){
    v.innerHTML=sub+`<div class="cd"><div class="ct">👥 Arkadaşlar</div><p style="font-size:11px;color:#fbbf24">Arkadaş sistemi henüz kurulmamış.<br><span class="mu">Supabase'te sql/arkadas.sql kodunu çalıştır.</span></p><button class="btn s" onclick="frRefresh()">Tekrar dene</button></div>`;return;
  }
  const d=FR.data,online=d.friends.filter(f=>f.online).length;
  const inc=d.incoming.length?`<div class="cd"><div class="ct">📨 Arkadaşlık istekleri (${d.incoming.length})</div>${d.incoming.map(x=>`<div class="q" style="padding:6px 8px;margin-bottom:4px;align-items:center"><div style="flex:1;min-width:0"><b>${escH(x.name)}</b> <span class="mu" style="font-size:10px">Lv.${Number(x.level)}</span></div>
      <button class="btn" style="width:auto;padding:5px 10px;margin:0 4px 0 0" onclick="frAccept('${escH(x.ck)}')">Kabul</button><button class="btn s" style="width:auto;padding:5px 10px;margin:0" onclick="frDecline('${escH(x.ck)}')">Reddet</button></div>`).join("")}</div>`:"";
  const fl=d.friends.length?d.friends.map(f=>{const c=CL[f.cls]||CL.tank;
    return`<div class="q" onclick="frFriendMenu('${escH(f.ck)}')" style="cursor:pointer;padding:7px 8px;margin-bottom:4px;align-items:center">
      <div style="flex:1;min-width:0">${frDot(f.online)}<b>${escH(f.name)}</b> <span class="mu" style="font-size:10px">${escH(c.n||f.cls)} · Lv.${Number(f.level)}</span><div class="mu" style="font-size:10px;margin-left:15px">${f.online?"Çevrimiçi":"Çevrimdışı"}</div></div>
      ${f.unread>0?`<span class="nbd2">${Number(f.unread)}</span>`:""}<button class="btn s" style="width:auto;padding:5px 10px;margin:0" onclick="event.stopPropagation();dmOpen('${escH(f.ck)}','${escH(f.name)}')">✉️</button></div>`}).join(""):'<p class="mu" style="font-size:11px">Henüz arkadaşın yok. Sıralamada, sohbette ya da loncada bir oyuncunun adına dokunup "Arkadaş ekle" diyebilirsin.</p>';
  const ib=FR.inbox.length?FR.inbox.map(x=>`<div class="q" onclick="dmOpen('${escH(x.ck)}','${escH(x.name)}')" style="cursor:pointer;padding:6px 8px;margin-bottom:4px;align-items:center"><div style="flex:1;min-width:0"><b>${escH(x.name)}</b><div class="mu" style="font-size:10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${x.mine?"Sen: ":""}${escH(x.body)}</div></div>${x.unread>0?`<span class="nbd2">${Number(x.unread)}</span>`:""}</div>`).join(""):'<p class="mu" style="font-size:11px">Henüz mesajın yok.</p>';
  const out=d.outgoing.length?`<div class="mu" style="font-size:10px;margin-top:8px">Bekleyen isteklerin: ${d.outgoing.map(x=>`${escH(x.name)} <span class="g" style="cursor:pointer" onclick="frCancel('${escH(x.ck)}')">(geri çek)</span>`).join(", ")}</div>`:"";
  v.innerHTML=sub+inc+`<div class="cd"><div class="ct">👥 Arkadaşlar <span class="mu" style="font-size:10.5px;font-weight:400">${online}/${d.friends.length} çevrimiçi</span></div>${fl}${out}
    <div style="display:flex;gap:6px;margin-top:10px"><input id="fr-q" maxlength="20" placeholder="Karakter adıyla oyuncu ara..." autocomplete="off" onkeydown="if(event.key==='Enter')frFind()" style="${GI};flex:1;min-width:0"><button class="btn" style="width:auto;padding:0 14px" onclick="frFind()">Ara</button></div><div id="fr-find"></div>
    <button class="btn s" style="margin-top:8px;padding:8px;font-size:11px" onclick="frRefresh()">🔄 Yenile</button></div>
    <div class="cd"><div class="ct">💌 Mesajlar</div>${ib}</div>`;
}
async function frFind(){
  const q=(($("fr-q")||{}).value||"").trim(),box=$("fr-find");if(!box||!q)return;
  box.innerHTML='<p class="mu" style="font-size:11px;margin-top:6px">Aranıyor...</p>';
  try{
    const r=await CLOUD.sb.rpc("kz_rank_find",{p_col:"level",p_q:q});if(r.error)throw r.error;
    const rows=r.data||[];
    box.innerHTML=rows.length?rows.map(x=>`<div class="q" onclick="comProfile('${escH(x.ck)}')" style="cursor:pointer;padding:6px 8px;margin-top:5px"><div style="flex:1"><b>${escH(x.char_name)}</b> <span class="mu" style="font-size:10px">Lv.${Number(x.level)}</span></div><span class="mu" style="font-size:10px">Dokun ▸</span></div>`).join(""):'<p class="mu" style="font-size:11px;margin-top:6px">Oyuncu bulunamadı.</p>';
  }catch(e){box.innerHTML=`<p style="font-size:11px;color:#fbbf24">Arama yapılamadı: ${escH(frErr(e))}</p>`}
}
async function frAccept(u){if(await frDo(()=>CLOUD.sb.rpc("kz_f_accept",{p_me:P.name,p_user:u}),"Arkadaş oldunuz!")){frPing();frRefresh()}}
async function frDecline(u){if(await frDo(()=>CLOUD.sb.rpc("kz_f_remove",{p_me:P.name,p_user:u}))){frPing();frRefresh()}}
async function frCancel(u){if(await frDo(()=>CLOUD.sb.rpc("kz_f_remove",{p_me:P.name,p_user:u}),"İstek geri çekildi"))frRefresh()}
function frFriendMenu(u){comProfile(u)}
/* ---------- Oyuncu profili altındaki işlem düğmeleri ---------- */
async function frProfileActs(uid){
  const box=$("pf-act");if(!box)return;
  try{
    const r=await CLOUD.sb.rpc("kz_f_rel",{p_me:P.name,p_user:uid});if(r.error)throw r.error;
    const rel=(r.data||{}).rel,on=(r.data||{}).online;
    const nm=($("pf-name")||{}).textContent||"";
    if(rel==="self"){box.innerHTML="";return}
    const B=(t,js,st)=>`<button class="btn s" style="${st||""}" onclick="${js}">${t}</button>`;
    const q=escH(uid),n=escH(nm).replace(/'/g,"&#39;");
    let h="";
    if(rel!=="blocked"&&rel!=="blockedby")h+=B("✉️ Mesaj gönder",`closeM();dmOpen('${q}','${n}')`);
    if(rel==="none")h+=B("➕ Arkadaş ekle",`frProfAct('req','${q}')`);
    else if(rel==="sent")h+=B("⏳ İstek gönderildi (geri çek)",`frProfAct('cancel','${q}')`);
    else if(rel==="got")h+=B("✅ İsteği kabul et",`frProfAct('accept','${q}')`);
    else if(rel==="friend")h+=`<div class="mu" style="font-size:11px;text-align:center;margin:4px 0">${frDot(on)}${on?"Çevrimiçi":"Çevrimdışı"} · arkadaşın</div>`+B("➖ Arkadaşlıktan çıkar",`frProfAct('remove','${q}')`);
    if(rel==="blocked")h+=B("🔓 Engeli kaldır",`frProfAct('unblock','${q}')`);
    else h+=B("🚫 Engelle",`frProfAct('block','${q}')`,"color:#f87171");
    box.innerHTML=h;
  }catch(e){box.innerHTML=""}
}
async function frProfAct(k,uid){
  const f={req:()=>CLOUD.sb.rpc("kz_f_req",{p_me:P.name,p_user:uid}),cancel:()=>CLOUD.sb.rpc("kz_f_remove",{p_me:P.name,p_user:uid}),accept:()=>CLOUD.sb.rpc("kz_f_accept",{p_me:P.name,p_user:uid}),
    remove:()=>CLOUD.sb.rpc("kz_f_remove",{p_me:P.name,p_user:uid}),block:()=>CLOUD.sb.rpc("kz_f_block",{p_me:P.name,p_user:uid,p_on:true}),unblock:()=>CLOUD.sb.rpc("kz_f_block",{p_me:P.name,p_user:uid,p_on:false})}[k];
  const msg={req:"Arkadaşlık isteği gönderildi",cancel:"İstek geri çekildi",accept:"Arkadaş oldunuz!",remove:"Arkadaşlıktan çıkarıldı",block:"Oyuncu engellendi",unblock:"Engel kaldırıldı"}[k];
  const r=await frDo(f,msg);
  if(r){FR.data=null;FR.inbox=null;frProfileActs(uid);frPing()}
}
/* ---------- Özel mesaj penceresi ---------- */
function dmOpen(uid,name){
  FR.dm={uid,name,sig:""};
  $("ic").innerHTML=`<div class="ct" style="margin-bottom:6px">✉️ ${escH(name)}</div>
    <div id="dm-list" style="height:260px;overflow-y:auto;background:#0006;border-radius:8px;padding:8px;font-size:11.5px;line-height:1.4"><p class="mu">Yükleniyor...</p></div>
    <div style="display:flex;gap:6px;margin-top:8px"><input id="dm-in" maxlength="200" placeholder="Mesaj yaz..." autocomplete="off" onkeydown="if(event.key==='Enter')dmSend()" style="${GI};flex:1;min-width:0"><button class="btn" style="width:auto;padding:0 16px" onclick="dmSend()">Gönder</button></div>
    <button class="btn s" style="margin-top:8px" onclick="dmClose()">Kapat</button>`;
  $("im").style.display="flex";
  dmLoad(true);
  clearInterval(FR.dmTimer);
  FR.dmTimer=setInterval(()=>{if(!FR.dm||$("im").style.display==="none"){dmClose();return}if(!document.hidden)dmLoad(false)},5000);
}
function dmClose(){clearInterval(FR.dmTimer);FR.dmTimer=null;FR.dm=null;closeM();FR.data=null;FR.inbox=null;frPing();if(tab==="community"&&COM.sub==="friends")view()}
async function dmLoad(scroll){
  const d=FR.dm;if(!d)return;
  try{
    const r=await CLOUD.sb.rpc("kz_dm_thread",{p_me:P.name,p_user:d.uid});if(r.error)throw r.error;
    const rows=r.data||[],sig=rows.map(x=>x.id).join(",");
    if(!scroll&&sig===d.sig)return;d.sig=sig;
    const l=$("dm-list");if(!l||FR.dm!==d)return;
    const near=l.scrollHeight-l.scrollTop-l.clientHeight<60;
    l.innerHTML=rows.map(x=>{const t=new Date(x.created).toLocaleTimeString("tr-TR",{hour:"2-digit",minute:"2-digit"});
      return`<div style="margin-bottom:6px;text-align:${x.mine?"right":"left"}"><span style="display:inline-block;max-width:85%;text-align:left;padding:5px 9px;border-radius:10px;background:${x.mine?"#6b4a0a88":"#1f2937"};word-break:break-word">${escH(x.body)}</span><div class="mu" style="font-size:9px">${t}</div></div>`}).join("")||'<p class="mu">Henüz mesaj yok. İlk mesajı sen yaz!</p>';
    if(scroll||near)l.scrollTop=l.scrollHeight;
  }catch(e){const l=$("dm-list");if(l)l.innerHTML=`<p style="font-size:11px;color:#fbbf24">Mesajlar yüklenemedi: ${escH(frErr(e))}</p>`}
}
async function dmSend(){
  const d=FR.dm,inp=$("dm-in");if(!d||!inp)return;const t=(inp.value||"").trim();if(!t)return;
  if(await frDo(()=>CLOUD.sb.rpc("kz_dm_send",{p_me:P.name,p_user:d.uid,p_body:t}))){inp.value="";dmLoad(true)}
}
