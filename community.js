/* ============================================================
   TOPLULUK: liderlik tablosu + genel sohbet
   cloud.js'e bağlıdır (giriş yapılmadıysa çalışmaz). game.js ve cloud.js'ten SONRA yüklenir.
   ============================================================ */
const COM={names:{},sub:"rank",by:"level",timer:null,msgs:[],sig:"",sending:false,muted:[],lastLb:""};
try{COM.muted=JSON.parse(localStorage.getItem("kz_muted")||"[]")}catch(e){}

const RANKS={level:["Seviye","Lv."],tower:["Kule","Kat "],elites:["Elit","elit"],maxhit:["Hasar","💥 "]};

/* ---- Liderlik tablosuna gönderilecek özet (en yüksek seviyeli karakterin) ---- */
function comBest(){
  const l=SLOTS.filter(Boolean);
  if(!l.length)return null;
  const kills=s=>(s.st&&s.st.k)|0;
  const top=l.reduce((a,b)=>(b.lv>a.lv||(b.lv===a.lv&&kills(b)>kills(a)))?b:a);
  return{
    char_name:String(top.name||"").slice(0,14),
    cls:CL[top.cls]?top.cls:"tank",
    level:Math.max(1,Math.min(100,top.lv|0)),
    tower:Math.max(0,Math.min(500,Math.max(...l.map(s=>s.tw|0)))),
    elites:Math.min(100000,l.reduce((n,s)=>n+((s.st&&s.st.e)|0),0)),
    kills:Math.min(10000000,l.reduce((n,s)=>n+kills(s),0))
  };
}
async function comPushLb(force){
  if(!CLOUD.user||!CLOUD.sb)return;
  const b=comBest();
  const key=JSON.stringify(b||"yok"); /* karakter kalmadıysa da sunucuya bildir: sıralamadan düşsün */
  if(!force&&key===COM.lastLb)return;
  try{
    const r=await CLOUD.sb.rpc("kz_lb_refresh");
    if(!r.error)COM.lastLb=key;
  }catch(e){}
}

/* ---- Sekme ---- */
function comSub(s){COM.sub=s;view()}
function comBy(k){COM.by=k;view()}
function comStop(){if(COM.timer){clearInterval(COM.timer);COM.timer=null}}

function cCommunity(v){
  comStop();
  const sub=`<div class="sub-tabs">
    <button class="sub-tab ${COM.sub=="rank"?"act":""}" onclick="comSub('rank')">🏆 Sıralama</button>
    <button class="sub-tab ${COM.sub=="chat"?"act":""}" onclick="comSub('chat')">💬 Sohbet</button>
    ${typeof cGuild==="function"?`<button class="sub-tab ${COM.sub=="guild"?"act":""}" onclick="comSub('guild')">🏰 Lonca</button>`:""}
  </div>`;
  if(typeof CLOUD==="undefined"||CLOUD.state!=="in"){
    const off=(typeof CLOUD!=="undefined"&&CLOUD.state==="offline");
    v.innerHTML=sub+`<div class="cd"><div class="ct">🌐 Topluluk</div>
      <p class="mu" style="font-size:11px;margin-bottom:8px">${off?"Çevrimdışısın. Topluluk için internet gerekir.":"Sıralamayı görmek ve sohbete katılmak için bulut hesabınla giriş yapmalısın."}</p>
      <button class="btn" onclick="${off?"cloudRetry()":"cloudOpenModal()"}">${off?"Tekrar dene":"☁️ Giriş yap / Hesap oluştur"}</button></div>`;
    return;
  }
  if(COM.sub==="guild"&&typeof cGuild==="function"){cGuild(v,sub);return}
  if(COM.sub==="rank"){
    v.innerHTML=sub+`<div class="cd"><div class="ct">🏆 Sıralama</div>
      <div class="sub-tabs" style="margin-bottom:8px">${Object.keys(RANKS).map(k=>`<button class="sub-tab ${COM.by==k?"act":""}" onclick="comBy('${k}')">${RANKS[k][0]}</button>`).join("")}</div>
      <div style="display:flex;gap:6px;margin-bottom:8px">
        <input id="rank-q" maxlength="20" placeholder="Karakter adı ara..." autocomplete="off" onkeydown="if(event.key==='Enter')comRankFind()" style="flex:1;min-width:0;padding:9px;background:#000;border:1px solid var(--ln);border-radius:8px;color:#fff;-webkit-user-select:text;user-select:text">
        <button class="btn" style="width:auto;padding:0 14px" onclick="comRankFind()">🔍 Ara</button>
      </div>
      <div id="rank-find"></div>
      <div id="rank-box"><p class="mu" style="font-size:11px">Yükleniyor...</p></div>
      <button class="btn s" style="margin-top:8px;padding:8px;font-size:11px" onclick="comLoadRank()">🔄 Yenile</button></div>`;
    comLoadRank();
  }else{
    v.innerHTML=sub+`<div class="cd"><div class="ct">💬 Genel Sohbet</div>
      <div id="chat-list" style="height:300px;overflow-y:auto;background:#0006;border-radius:8px;padding:8px;font-size:11px;line-height:1.4"><p class="mu">Yükleniyor...</p></div>
      <div style="display:flex;gap:6px;margin-top:8px">
        <input id="chat-in" maxlength="200" placeholder="Mesaj yaz..." autocomplete="off" onkeydown="if(event.key==='Enter')comSend()" style="flex:1;min-width:0;padding:10px;background:#000;border:1px solid var(--ln);border-radius:8px;color:#fff;-webkit-user-select:text;user-select:text">
        <button class="btn" style="width:auto;padding:0 16px" onclick="comSend()">Gönder</button>
      </div>
      <p class="mu" style="font-size:9.5px;margin-top:6px">Saygılı ol. Mesajlar 7 gün saklanır. Rahatsız eden birini 🔇 ile sustur.${COM.muted.length?` <span class="g" style="cursor:pointer" onclick="comUnmuteAll()">Susturulanları temizle (${COM.muted.length})</span>`:""}</p></div>`;
    COM.sig="";
    comLoadChat(true);
    COM.timer=setInterval(()=>{
      if(tab!=="community"||COM.sub!=="chat"||document.hidden||!CLOUD.user||CB.on){if(tab!=="community"||COM.sub!=="chat")comStop();return}
      comLoadChat(false);
    },8000);
  }
}

/* ---- Sıralama ---- */
async function comLoadRank(){
  const box=$("rank-box");if(!box)return;
  try{
    await comPushLb(true);
    const col=COM.by;
    const r=await CLOUD.sb.from("leaderboard").select("user_id,char_name,cls,level,tower,elites,kills,maxhit").order(col,{ascending:false}).order("kills",{ascending:false}).limit(100);
    if(r.error)throw r.error;
    const rows=r.data||[];
    const box2=$("rank-box");if(!box2||tab!=="community"||COM.sub!=="rank")return;
    if(!rows.length){box2.innerHTML='<p class="mu" style="font-size:11px">Henüz kimse listede yok.</p>';return}
    const unit=RANKS[col][1];
    box2.innerHTML=rows.map((x,i)=>{
      const mine=CLOUD.user&&x.user_id===CLOUD.user.id,c=CL[x.cls]||CL.tank;
      const val=col==="elites"?(x[col]+" "+unit):col==="maxhit"?(unit+Number(x[col]||0).toLocaleString("tr-TR")):(unit+x[col]);
      const medal=i===0?"🥇":i===1?"🥈":i===2?"🥉":"#"+(i+1);
      return`<div class="q" onclick="comProfile('${escH(x.user_id)}')" style="cursor:pointer;padding:6px 8px;margin-bottom:5px;${mine?"border:1px solid var(--gold);":""}">
        <div style="width:30px;text-align:center;font-weight:800">${medal}</div>
        <div style="flex:1;min-width:0"><b style="${mine?"color:var(--gold)":""}">${escH(x.char_name||"?")}</b>${mine?' <span class="mu" style="font-size:9px">(sen)</span>':""}
          <div class="mu" style="font-size:10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${c.e} ${escH(c.n||x.cls||"")}</div></div>
        <b class="g" style="font-size:12px">${escH(val)}</b></div>`;
    }).join("");
  }catch(e){
    const b=$("rank-box");
    if(b)b.innerHTML=`<p style="font-size:11px;color:#fbbf24">Sıralama yüklenemedi: ${escH(cloudErr(e))}<br><span class="mu">Supabase'te sql/topluluk.sql kodunun çalıştırıldığından emin ol.</span></p>`;
  }
}

/* ---- Sohbet ---- */
async function comLoadChat(scroll){
  const list=$("chat-list");if(!list)return;
  try{
    const r=await CLOUD.sb.from("chat_messages").select("id,user_id,username,body,created_at").order("id",{ascending:false}).limit(50);
    if(r.error)throw r.error;
    COM.msgs=(r.data||[]).slice().reverse();
    const need=[...new Set(COM.msgs.map(m=>m.user_id))].filter(u=>!(u in COM.names)||COM.names[u]===null);
    if(need.length){
      try{
        const n=await CLOUD.sb.from("leaderboard").select("user_id,char_name").in("user_id",need);
        (n.data||[]).forEach(x=>{COM.names[x.user_id]=x.char_name||null});
      }catch(e){}
      need.forEach(u=>{if(!(u in COM.names))COM.names[u]=null});
    }
    comRenderChat(scroll);
  }catch(e){
    const l=$("chat-list");
    if(l)l.innerHTML=`<p style="font-size:11px;color:#fbbf24">Sohbet yüklenemedi: ${escH(cloudErr(e))}<br><span class="mu">Supabase'te sql/topluluk.sql kodunun çalıştırıldığından emin ol.</span></p>`;
  }
}
function comRenderChat(force){
  const list=$("chat-list");if(!list)return;
  const sig=COM.msgs.map(m=>m.id+":"+(COM.names[m.user_id]||"")).join(",")+"|"+COM.muted.length;
  if(!force&&sig===COM.sig)return;
  COM.sig=sig;
  const nearBottom=list.scrollHeight-list.scrollTop-list.clientHeight<60;
  const rows=COM.msgs.filter(m=>!COM.muted.includes(m.user_id)).map(m=>{
    const mine=CLOUD.user&&m.user_id===CLOUD.user.id;
    const t=new Date(m.created_at).toLocaleTimeString("tr-TR",{hour:"2-digit",minute:"2-digit"});
    const act=mine?`<span style="cursor:pointer;margin-left:6px" onclick="comDel(${Number(m.id)})">🗑️</span>`:`<span style="cursor:pointer;margin-left:6px" onclick="comMute('${escH(m.user_id)}')">🔇</span>`;
    return`<div style="margin-bottom:6px"><b style="color:${mine?"var(--gold)":"#93c5fd"}">${escH(COM.names[m.user_id]||"Oyuncu")}</b> <span class="mu" style="font-size:9px">${t}</span>${act}<div style="word-break:break-word">${escH(m.body)}</div></div>`;
  }).join("")||'<p class="mu">Henüz mesaj yok. İlk mesajı sen yaz!</p>';
  list.innerHTML=rows;
  if(force||nearBottom)list.scrollTop=list.scrollHeight;
}
async function comSend(){
  if(COM.sending)return;
  const inp=$("chat-in");if(!inp)return;
  const t=(inp.value||"").trim();
  if(!t)return;
  if(t.length>200)return toast("Mesaj en fazla 200 karakter olabilir");
  COM.sending=true;
  try{
    const r=await CLOUD.sb.from("chat_messages").insert({user_id:CLOUD.user.id,body:t});
    if(r.error)throw r.error;
    inp.value="";
    await comLoadChat(true);
  }catch(e){
    const m=(e&&e.message)||"";
    toast(/kufur/i.test(m)?"Mesajın uygunsuz içerik içeriyor":/cok hizli/i.test(m)?"Çok hızlı yazıyorsun, 2 saniye bekle":"Mesaj gönderilemedi: "+cloudErr(e));
  }
  COM.sending=false;
}
async function comDel(id){
  try{
    const r=await CLOUD.sb.from("chat_messages").delete().eq("id",id);
    if(r.error)throw r.error;
    await comLoadChat(false);
  }catch(e){toast("Mesaj silinemedi")}
}
function comMute(uid){
  if(!COM.muted.includes(uid)){
    COM.muted.push(uid);
    try{localStorage.setItem("kz_muted",JSON.stringify(COM.muted))}catch(e){}
  }
  toast("Bu oyuncu susturuldu");
  comRenderChat(true);
}
function comUnmuteAll(){
  COM.muted=[];
  try{localStorage.removeItem("kz_muted")}catch(e){}
  view();
}

/* ---- Sıralamada oyuncu arama ve profil ---- */
async function comRankFind(){
  const q=($("rank-q")||{}).value||"",box=$("rank-find");if(!box)return;
  if(!q.trim()){box.innerHTML="";return}
  box.innerHTML='<p class="mu" style="font-size:11px">Aranıyor...</p>';
  try{
    const r=await CLOUD.sb.rpc("kz_rank_find",{p_col:COM.by,p_q:q});
    if(r.error)throw r.error;
    const rows=r.data||[];
    if(!rows.length){box.innerHTML='<p class="mu" style="font-size:11px;margin-bottom:8px">Bu adla oyuncu bulunamadı.</p>';return}
    const col=COM.by,unit=RANKS[col][1];
    box.innerHTML='<div class="mu" style="font-size:10px;margin-bottom:4px">Arama sonuçları ('+RANKS[col][0]+' sırasına göre):</div>'+rows.map(x=>{
      const c=CL[x.cls]||CL.tank,val=col==="elites"?(x[col]+" "+unit):col==="maxhit"?(unit+Number(x[col]||0).toLocaleString("tr-TR")):(unit+x[col]);
      return`<div class="q" onclick="comProfile('${escH(x.user_id)}')" style="cursor:pointer;padding:6px 8px;margin-bottom:5px;border:1px solid var(--gold)"><div style="width:42px;text-align:center;font-weight:800">#${Number(x.rk)}</div>
        <div style="flex:1;min-width:0"><b>${escH(x.char_name||"?")}</b><div class="mu" style="font-size:10px">${c.e} ${escH(c.n||x.cls||"")}</div></div><b class="g" style="font-size:12px">${escH(val)}</b></div>`}).join("")+'<hr style="border:0;border-top:1px solid var(--ln);margin:8px 0">';
  }catch(e){box.innerHTML=`<p style="font-size:11px;color:#fbbf24">Arama yapılamadı: ${escH(cloudErr(e))}<br><span class="mu">Supabase'te sql/liderlik.sql kodunun çalıştırıldığından emin ol.</span></p>`}
}
async function comProfile(uid){
  $("ic").innerHTML='<p class="mu" style="text-align:center;padding:20px">Profil yükleniyor...</p>';$("im").style.display="flex";
  try{
    const r=await CLOUD.sb.rpc("kz_profile",{p_user:uid});
    if(r.error)throw r.error;
    const p=r.data;
    if(!p){$("ic").innerHTML='<p class="mu" style="text-align:center;padding:16px">Profil bulunamadı.</p><button class="btn s" onclick="closeM()">Kapat</button>';return}
    const c=CL[p.cls]||CL.tank,t=(TITLES.find(x=>x.id===p.title)||{}).n;
    const items=SL.map(k=>{
      const i=(p.eq||{})[k];
      if(!i)return`<div class="q" style="padding:5px 8px;margin-bottom:3px"><span class="mu" style="width:62px;font-size:10px">${SN[k]}</span><span class="mu" style="font-size:10px">— boş —</span></div>`;
      const g=G[i.g]||G[1];
      const af=(i.af||[]).map(a=>`<div class="mu" style="font-size:9px">✨ ${escH(a.n||"")} +%${Number(a.v)||0}</div>`).join("");
      return`<div class="q" style="padding:5px 8px;margin-bottom:3px;align-items:flex-start"><span class="mu" style="width:62px;font-size:10px;padding-top:2px">${SN[k]}</span><div style="flex:1;min-width:0"><b style="color:${g.c};font-size:11px">${escH(i.name||"?")} +${Number(i.p)||0}</b> <span class="mu" style="font-size:9px">${g.t||""}</span>${af}</div></div>`}).join("");
    $("ic").innerHTML=`<div style="text-align:center;margin-bottom:10px"><div style="font-size:30px">${c.e}</div><b style="font-size:16px">${escH(p.name||"?")}</b>
      <div class="mu" style="font-size:11px">${escH(c.n||p.cls)} · Lv.${Number(p.lv)||1}${t?" · "+escH(t):""}</div></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:10px;text-align:center">
        <div class="q" style="display:block;margin:0"><div class="mu" style="font-size:9.5px">Kule</div><b>Kat ${Number(p.tower)||0}</b></div>
        <div class="q" style="display:block;margin:0"><div class="mu" style="font-size:9.5px">En yüksek vuruş</div><b>💥 ${Number(p.maxhit||0).toLocaleString("tr-TR")}</b></div>
        <div class="q" style="display:block;margin:0"><div class="mu" style="font-size:9.5px">Elit öldürme</div><b>${Number(p.elites)||0}</b></div>
        <div class="q" style="display:block;margin:0"><div class="mu" style="font-size:9.5px">Toplam öldürme</div><b>${Number(p.kills||0).toLocaleString("tr-TR")}</b></div></div>
      <div class="ct" style="font-size:12px;margin-bottom:5px">Kuşandığı eşyalar</div>${items}
      <button class="btn s" style="margin-top:8px" onclick="closeM()">Kapat</button>`;
  }catch(e){$("ic").innerHTML=`<p style="font-size:11px;color:#fbbf24;padding:10px">Profil açılamadı: ${escH(cloudErr(e))}<br><span class="mu">Supabase'te sql/liderlik.sql kodunun çalıştırıldığından emin ol.</span></p><button class="btn s" onclick="closeM()">Kapat</button>`}
}
