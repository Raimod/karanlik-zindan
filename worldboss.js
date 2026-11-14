/* ============================================================
   DÜNYA BOSS'U (v2.13.0): herkesin ortak vurduğu boss. Sunucu tarafı: sql/dunyaboss.sql + battle fonksiyonu ("wb" işlemi)
   community.js'ten sonra yüklenir. Topluluk > Boss sekmesi.
   ============================================================ */
const WBU={data:null,busy:false,err:"",last:null,timer:null};
function wbN(n){return Number(n||0).toLocaleString("tr-TR")}
function wbTime(s){s=Math.max(0,s|0);const d=Math.floor(s/86400),h=Math.floor(s%86400/3600),m=Math.floor(s%3600/60);return d?d+" gün "+h+" sa":h?h+" sa "+m+" dk":m+" dk"}
async function wbLoad(){
  if(!CLOUD.user||!CLOUD.sb)return;
  try{
    socSync();
    const r=await socRetry(()=>CLOUD.sb.rpc("kz_wb_state",{p_me:P.name}));
    if(r.error)throw r.error;
    WBU.data=r.data;WBU.err="";
  }catch(e){WBU.err=/boss|function|does not exist|schema/i.test((e&&e.message)||"")?"Dünya Boss'u henüz kurulu değil (Supabase'te sql/dunyaboss.sql çalıştırılmalı).":"Boss bilgisi alınamadı: "+(typeof cloudErr==="function"?cloudErr(e):"")}
  if(tab==="community"&&COM.sub==="boss")wbRender()
}
function cBoss(v,sub){
  v.innerHTML=sub+`<div id="wb-box"><div class="cd"><p class="mu" style="font-size:11px">Yükleniyor...</p></div></div>`;
  if(WBU.data)wbRender();
  wbLoad();
  if(WBU.timer)clearInterval(WBU.timer);
  WBU.timer=setInterval(()=>{if(tab!=="community"||COM.sub!=="boss"||document.hidden){if(tab!=="community"||COM.sub!=="boss"){clearInterval(WBU.timer);WBU.timer=null}return}wbLoad()},20000);
}
function wbRender(){
  const box=$("wb-box");if(!box)return;
  if(WBU.err&&!WBU.data){box.innerHTML=`<div class="cd"><p style="font-size:11px;color:#fbbf24">${escH(WBU.err)}</p></div>`;return}
  const d=WBU.data;if(!d)return;
  const live=d.status==="live",pct=Math.max(0,Math.min(100,d.hp/d.max_hp*100)),nm=wbName(d.wi);
  const left=d.ends-d.now;
  const stTxt=live?`⏳ Kalan süre: <b>${wbTime(left)}</b>`:d.status==="dead"?`💀 <b>Yenildi!</b> Sıradaki boss: <b>${wbTime(d.next_in)}</b> sonra`:`🏃 Boss kaçtı. Sıradaki boss: <b>${wbTime(d.next_in)}</b> sonra`;
  const lvOk=P.lv>=WB.MINLV;
  const topRows=(d.top||[]).map((x,i)=>`<div class="q" style="padding:5px 8px;margin-bottom:3px;${x.name===P.name?"border:1px solid var(--gold);":""}"><b style="width:26px">#${i+1}</b><span style="flex:1;min-width:0">${escH(x.name)}</span><b class="g" style="font-size:11px">${wbN(x.dmg)}</b></div>`).join("")||'<p class="mu" style="font-size:10.5px">Henüz kimse vurmadı. İlk vuran sen ol!</p>';
  const gRows=(d.guilds||[]).map((x,i)=>`<div class="q" style="padding:5px 8px;margin-bottom:3px"><b style="width:26px">#${i+1}</b><span style="flex:1;min-width:0">🏰 ${escH(x.name)} <span class="mu" style="font-size:9.5px">(${Number(x.n)} üye)</span></span><b class="g" style="font-size:11px">${wbN(x.dmg)}</b></div>`).join("")||'<p class="mu" style="font-size:10.5px">Henüz lonca vurmadı.</p>';
  box.innerHTML=`<div class="cd"><div class="ct">🐉 Dünya Boss'u</div>
    <div style="text-align:center;margin:6px 0 8px"><div style="font-size:34px">${live?"👹":d.status==="dead"?"💀":"🌫️"}</div><b style="font-size:16px;color:#f87171">${escH(nm)}</b>
      <div class="mu" style="font-size:10.5px;margin-top:2px">${escH(RG[d.wi%RG.length].n)} bölgesinin gölgesi</div></div>
    <div style="height:14px;background:#000;border:1px solid var(--ln);border-radius:8px;overflow:hidden"><div style="height:100%;width:${pct}%;background:linear-gradient(90deg,#b91c1c,#f43f5e)"></div></div>
    <div style="display:flex;justify-content:space-between;font-size:10.5px;margin:4px 0 8px"><span>${wbN(d.hp)} / ${wbN(d.max_hp)} ❤️</span><span>%${pct.toFixed(1)}</span></div>
    <div class="mu" style="font-size:11px;margin-bottom:8px;text-align:center">${stTxt}</div>
    <div class="q" style="display:block;margin-bottom:8px;font-size:11px;text-align:center">Senin hasarın: <b class="g">${wbN(d.my_dmg)}</b>${d.my_rank?` · Sıran: <b>#${d.my_rank}</b>`:""}<br>Bugünkü hakkın: <b>${Math.max(0,d.left)}/${WB.HITS}</b> <span class="mu">(her gün 03:00'te yenilenir)</span></div>
    ${live?`<button class="btn" ${(!lvOk||d.left<=0||WBU.busy)?"disabled":""} onclick="wbHit()">${WBU.busy?"⚔️ Savaşılıyor...":!lvOk?"Seviye "+WB.MINLV+" gerekir":d.left<=0?"Bugünlük hakkın bitti":"⚔️ Saldır ("+d.left+" hak)"}</button>`:""}
    ${d.pending>0?`<button class="btn v" style="margin-top:6px" onclick="wbClaim()">🎁 Ödülleri Al</button>`:""}
    <p class="mu" style="font-size:9.5px;margin-top:8px">Her saldırı bir savaştır (en çok ${WB.ROUNDS} tur). Boss seviyene göre ayarlanır, bu yüzden herkes katkı verir; güçlü eşya ve beceri daha çok hasar yapar. Saldırıda canın, manan ve iksirlerin harcanmaz, ölmezsin. Boss canı %75, %50 ve %25'e inince herkese sandık verilir; boss ölürse katılanlara sandık, hasarda ilk 3'e ve en çok vuran 3 loncanın üyelerine ek ödül ve ünvan çıkar.</p></div>
    <div class="cd"><div class="ct">🏅 En çok hasar verenler</div>${topRows}</div>
    <div class="cd"><div class="ct">🏰 Lonca sıralaması</div>${gRows}</div>`;
}
/* sunucu işlemi: ecoCall gibi, kaydı önce gönderir ve dönen durumu karaktere işler */
async function wbCall(body){
  if(typeof cbLocked==="function"&&cbLocked()){cbWarn();return null}
  if(ecoBusy||battleBusy||bStarting)return null;
  ecoBusy=true;
  try{
    const ctx={P};
    if(!(await bflush())){toast("⚠️ İlerleme buluta gönderilemedi, işlem yapılamadı. Bağlantını kontrol et.");return null}
    if(ctx.P!==P)return null;
    const r=await bcall(body);
    if(r.err){bFail(r);return null}
    if(ctx.P!==P)return null;
    if(r.ps){const hp0=P.hp,mp0=P.mp;for(const k in r.ps)P[k]=r.ps[k];P.hp=hp0;P.mp=mp0;sync();CLOUD.sig=bSig();saveAll()}
    return r;
  }finally{ecoBusy=false}
}
async function wbHit(){
  if(WBU.busy)return;
  WBU.busy=true;wbRender();
  try{
    const r=await wbCall({op:"wb",a:"hit"});
    if(!r)return;
    if(!r.done){toast(r.msg||"Saldırı yapılamadı");return}
    hud();
    $("ic").innerHTML=`<div style="text-align:center"><div style="font-size:34px">⚔️</div><b class="g" style="font-size:15px">${escH(wbName(r.wi))}</b>
      <div style="font-size:26px;font-weight:800;color:#f87171;margin:8px 0">${wbN(r.dmg)}</div><div class="mu" style="font-size:11px">toplam hasar · ${Number(r.rounds)} tur${r.fell?" · bu savaşta yere düştün":""}</div>
      <div class="q" style="display:block;margin:10px 0;font-size:11px">Ödül: <b class="g">+${wbN(r.reward.gold)} 🪙</b> · ⚙️ Demir Kırığı +${Number(r.reward.kirik)}<br>Kalan hakkın: <b>${Math.max(0,r.left)}/${WB.HITS}</b>${r.dead?"<br><b style='color:#4ade80'>🎉 Boss yenildi! Ödülleri alabilirsin.</b>":""}</div>
      <button class="btn" onclick="closeM()">Tamam</button></div>`;
    $("im").style.display="flex";
  }finally{WBU.busy=false;await wbLoad()}
}
async function wbClaim(){
  if(WBU.busy)return;
  WBU.busy=true;
  try{
    const r=await wbCall({op:"wb",a:"claim"});
    if(!r)return;
    if(!r.done){toast(r.msg||"Alınacak ödül yok");return}
    hud();
    const c=r.claim;
    $("ic").innerHTML=`<div style="text-align:center"><div style="font-size:34px">🎁</div><b class="g" style="font-size:15px">Dünya Boss'u Ödülleri</b>
      <div class="q" style="display:block;margin:10px 0;font-size:12px">🎁 Hazine Sandığı: <b class="g">+${Number(c.chests)}</b><br>🪙 Altın: <b class="g">+${wbN(c.gold)}</b>${c.wbk?"<br>🏷️ Ünvan açıldı: <b>Boss Avcısı</b>":""}${c.wbt?"<br>🏷️ Ünvan açıldı: <b>Dünya Yıkıcı</b>":""}</div>
      <button class="btn" onclick="closeM()">Tamam</button></div>`;
    $("im").style.display="flex";
  }finally{WBU.busy=false;await wbLoad()}
}
