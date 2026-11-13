/* ============================================================
   Karanlık Zindan: BANKA, PAZAR ve TAKAS ekranları (Paket D)
   Şehir sekmesinin alt sekmeleridir. Her yazma işlemi sunucuda (battle fonksiyonu, op:"mk") yapılır;
   burada yalnızca listeleri okur ve istekleri gönderir.
   ============================================================ */
const MK={bank:null,list:[],mine:null,tr:null,q:"",slot:"",off:0,more:false,tab:"buy",
  bsel:new Set(),csel:new Set(),tsel:new Set(),asel:new Set(),tWn:"",tWs:"",gAmt:"",sellI:"",sellP:"",tTo:"",tG:"",tW:"",err:"",loading:false};
const MK_SUBS=["bank","market","trade"];
const MK_FEE=5;

function mkLeft(iso){
  const ms=new Date(iso).getTime()-Date.now();if(!(ms>0))return"süre doldu";
  const h=Math.floor(ms/36e5),m=Math.floor(ms%36e5/6e4);
  return h?h+" sa "+m+" dk":m+" dk";
}
const mkN=n=>Number(n||0).toLocaleString("tr-TR");
function mkItem(i,right,onclick){
  const g=G[i.g]||G[1],c=CL[i.rc]||CL.tank,af=(i.af||[]).map(a=>`<div style="font-size:9px;color:#c084fc">✨ ${escH(a.n||"")} +%${Number(a.v)||0}</div>`).join("");
  return`<div class="q" style="align-items:flex-start;${onclick?"cursor:pointer;":""}" ${onclick?`onclick="${onclick}"`:""}>
    <div style="flex:1;min-width:0"><b style="color:${g.c};font-size:11.5px">${escH(i.name||"?")} +${Number(i.p)||0}</b>
    <div class="mu" style="font-size:9.5px">${escH(SN[i.slot]||i.slot||"")} · ${c.e} ${escH(c.n)} · Lv.${effLv(i)} · Güç ${pw(i)}</div>${af}</div>${right||""}</div>`;
}
function mkBox(h){const b=$("mk-box");if(b)b.innerHTML=h}
function mkNeedSql(e){return`<p style="font-size:11px;color:#fbbf24">Yüklenemedi: ${escH(cloudErr(e))}<br><span class="mu">Supabase'te sql/pazar.sql kodunun çalıştırıldığından emin ol.</span></p>`}

/* ---- veri yükleme ---- */
async function mkLoad(sub){
  if(!CLOUD.sb||!CLOUD.user){mkBox('<p class="mu" style="text-align:center;padding:14px">Bu bölüm için hesabına bağlı ve çevrimiçi olmalısın.</p>');return}
  MK.err="";
  try{
    if(sub==="bank"){const r=await CLOUD.sb.rpc("kz_bank_get");if(r.error)throw r.error;MK.bank=r.data}
    else if(sub==="market"){
      const [a,b]=await Promise.all([CLOUD.sb.rpc("kz_market_list",{p_q:MK.q,p_slot:MK.slot,p_off:MK.off}),CLOUD.sb.rpc("kz_market_mine")]);
      if(a.error)throw a.error;if(b.error)throw b.error;
      MK.list=a.data||[];MK.more=MK.list.length>=20;MK.mine=b.data||[];
    }else if(sub==="trade"){const r=await CLOUD.sb.rpc("kz_trade_list");if(r.error)throw r.error;MK.tr=r.data}
  }catch(e){MK.err=mkNeedSql(e)}
}
async function mkOpen(sub){
  mkRender(sub);
  await mkLoad(sub);
  if(citySub===sub&&$("mk-box"))mkRender(sub);
}
function mkRender(sub){
  if(MK.err){mkBox(MK.err);return}
  mkBox(sub==="bank"?mkBankHtml():sub==="market"?mkMarketHtml():mkTradeHtml());
}
async function mkRefresh(){await mkLoad(citySub);if($("mk-box"))mkRender(citySub)}
async function mkRun(body){
  const r=await mkCall(body);
  if(!r)return null;
  MK.bsel.clear();MK.csel.clear();MK.tsel.clear();MK.asel.clear();
  if(r.done){MK.gAmt="";MK.sellI="";MK.sellP="";MK.tTo="";MK.tG="";MK.tW="";MK.tWn="";MK.tWs=""}
  if(r.bank)MK.bank=r.bank;
  await mkLoad(citySub);
  view();
  return r;
}
/* tek adımlık sunucu işlemi: önce bekleyen ilerleme gönderilir, sonra sonuç buraya işlenir */
async function mkCall(body){
  if(cbLocked()){cbWarn();return null}
  if(ecoBusy||battleBusy||bStarting)return null;
  ecoBusy=true;
  try{
    const ctx={P};
    if(!(await bflush())){toast("⚠️ İlerleme buluta gönderilemedi, işlem yapılamadı. Bağlantını kontrol et.");return null}
    if(ctx.P!==P)return null;
    const r=await bcall({op:"mk",...body});
    if(r.err){bFail(r);return null}
    if(ctx.P!==P)return null;
    const hp0=P.hp,mp0=P.mp;
    for(const k in r.ps)P[k]=r.ps[k];
    P.hp=hp0;P.mp=mp0;
    sync();CLOUD.sig=bSig();
    if(r.done)saveAll();
    toast((r.done?"":"⚠️ ")+r.msg);
    hud();
    return r;
  }finally{ecoBusy=false}
}

/* ---- ortak: seçilebilir eşya satırları ---- */
function mkPick(set,k,on){if(on)set.add(k);else set.delete(k);mkRender(citySub)}
function mkPickRows(items,set,fn){
  if(!items.length)return'<p class="mu" style="font-size:11px;text-align:center;padding:8px">Eşya yok</p>';
  return items.map((it,k)=>mkItem(it,`<input type="checkbox" ${set.has(k)?"checked":""} onclick="event.stopPropagation()" onchange="${fn}(${k},this.checked)" style="width:20px;height:20px;flex:none">`,`${fn}(${k},${set.has(k)?"false":"true"})`)).join("");
}
const mkEq=()=>P.inv.map((i,k)=>({i,k})).filter(x=>x.i&&x.i.slot);

/* ================= BANKA ================= */
function mkBankHtml(){
  const b=MK.bank||{gold:0,items:[],ver:0};
  const bag=P.inv;
  return`<div class="cd" style="background:linear-gradient(135deg,#1a2a4a66,var(--pn))">
    <div class="ct">🏦 Banka <span class="mu" style="font-size:10px">Tüm karakterlerin ortak kasası</span></div>
    <div class="r" style="margin-bottom:8px"><span>Bankadaki altın</span><b class="g">${mkN(b.gold)} 🪙</b></div>
    <div class="r" style="margin-bottom:6px"><span>Üstündeki altın</span><b class="g">${mkN(P.gold)} 🪙</b></div>
    <div style="display:flex;gap:6px;margin-bottom:6px">
      <input type="number" inputmode="numeric" min="0" placeholder="Altın miktarı" value="${escH(MK.gAmt)}" oninput="MK.gAmt=this.value" style="flex:1;min-width:0;padding:8px;background:#000;border:1px solid var(--ln);border-radius:8px;color:#fff;-webkit-user-select:text;user-select:text">
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">
      <button class="btn" style="padding:8px;font-size:12px" onclick="mkBankGold(1)">⬇ Yatır</button>
      <button class="btn s" style="padding:8px;font-size:12px" onclick="mkBankGold(-1)">⬆ Çek</button>
    </div>
  </div>
  <div class="cd">
    <div class="ct">🎒 Çantadaki ekipman <span class="mu" style="font-size:10px">${bag.length}/50</span></div>
    ${mkPickRows(bag,MK.csel,"mkPickC")}
    <button class="btn" style="margin-top:6px;padding:8px;font-size:12px" ${MK.csel.size?"":"disabled"} onclick="mkBankItems(1)">⬇ Seçilenleri bankaya koy (${MK.csel.size})</button>
  </div>
  <div class="cd">
    <div class="ct">🗄️ Bankadaki eşyalar <span class="mu" style="font-size:10px">${b.items.length}/100</span></div>
    ${mkPickRows(b.items,MK.bsel,"mkPickB")}
    <button class="btn v" style="margin-top:6px;padding:8px;font-size:12px" ${MK.bsel.size?"":"disabled"} onclick="mkBankItems(-1)">⬆ Seçilenleri çantaya al (${MK.bsel.size})</button>
  </div>`;
}
const mkPickC=(k,on)=>mkPick(MK.csel,k,on),mkPickB=(k,on)=>mkPick(MK.bsel,k,on),mkPickT=(k,on)=>mkPick(MK.tsel,k,on),mkPickA=(k,on)=>mkPick(MK.asel,k,on);
async function mkBankGold(dir){
  const g=Math.floor(Number(MK.gAmt));if(!(g>0))return toast("Geçerli bir altın miktarı yaz");
  await mkRun(dir>0?{a:"bdep",g}:{a:"bwd",g});
}
async function mkBankItems(dir){
  if(dir>0)await mkRun({a:"bdep",ii:[...MK.csel].sort((a,b)=>a-b)});
  else await mkRun({a:"bwd",bi:[...MK.bsel].sort((a,b)=>a-b)});
}

/* ================= PAZAR ================= */
const MK_SLOTS=()=>'<option value="">Tüm bölmeler</option>'+SL.map(k=>`<option value="${k}" ${MK.slot===k?"selected":""}>${SN[k]}</option>`).join("");
function mkMarketHtml(){
  const tabs=`<div class="sub-tabs" style="margin-bottom:8px">
    <button class="sub-tab ${MK.tab==="buy"?"act":""}" onclick="MK.tab='buy';mkRender('market')">🛒 Pazar</button>
    <button class="sub-tab ${MK.tab==="mine"?"act":""}" onclick="MK.tab='mine';mkRender('market')">🏪 Tezgâhım${mkAlertN()?` (${mkAlertN()}!)`:""}</button>
  </div>`;
  return tabs+(MK.tab==="buy"?mkBuyHtml():mkMineHtml());
}
function mkAlertN(){return(MK.mine||[]).filter(x=>x.state!=="open").length}
function mkBuyHtml(){
  const rows=MK.list.map(x=>{
    const can=!x.mine&&P.gold>=x.price&&P.lv>=MK_MINLV;
    return mkItem(x.item,`<div style="text-align:right;flex:none"><b class="g" style="font-size:12px">${mkN(x.price)} 🪙</b><div class="mu" style="font-size:9px">${escH(x.seller_name)}${x.mine?" (sen)":""}</div><div class="mu" style="font-size:9px">⏳ ${mkLeft(x.expires)}</div>
      <button class="btn" style="margin-top:4px;padding:5px 8px;font-size:11px" ${can?"":"disabled"} onclick="mkBuy('${Number(x.id)}')">Satın al</button></div>`);
  }).join("");
  return`<div class="cd">
    <div class="ct">🛒 Pazar <span class="mu" style="font-size:10px">Tezgâhlar 24 saat açık kalır, sahibi çevrimdışı olsa da satış sürer</span></div>
    ${P.lv<MK_MINLV?`<p style="font-size:11px;color:#fbbf24">Pazarda alışveriş için seviye ${MK_MINLV} gerekir.</p>`:""}
    <div style="display:flex;gap:6px;margin-bottom:6px">
      <input type="text" placeholder="Eşya adı ara" maxlength="30" value="${escH(MK.q)}" oninput="MK.q=this.value" style="flex:1;min-width:0;padding:8px;background:#000;border:1px solid var(--ln);border-radius:8px;color:#fff;-webkit-user-select:text;user-select:text">
      <select onchange="MK.slot=this.value" class="sort-sel" style="flex:none;width:34%">${MK_SLOTS()}</select>
    </div>
    <button class="btn s" style="padding:7px;font-size:12px;margin-bottom:8px" onclick="MK.off=0;mkRefresh()">🔍 Ara / Yenile</button>
    ${rows||'<p class="mu" style="font-size:11px;text-align:center;padding:10px">Pazarda eşya yok.</p>'}
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:6px">
      <button class="btn s" style="padding:7px;font-size:11px" ${MK.off>0?"":"disabled"} onclick="MK.off=Math.max(0,MK.off-20);mkRefresh()">◀ Önceki</button>
      <button class="btn s" style="padding:7px;font-size:11px" ${MK.more?"":"disabled"} onclick="MK.off+=20;mkRefresh()">Sonraki ▶</button>
    </div>
  </div>`;
}
function mkMineHtml(){
  const m=MK.mine||[],open=m.filter(x=>x.state==="open"),sold=m.filter(x=>x.state==="sold"),exp=m.filter(x=>x.state==="expired");
  const eq=mkEq();
  const opts='<option value="">— Eşya seç —</option>'+eq.map(x=>`<option value="${x.k}" ${String(MK.sellI)===String(x.k)?"selected":""}>${escH(x.i.name)} +${x.i.p} (Güç ${pw(x.i)})</option>`).join("");
  const price=Math.floor(Number(MK.sellP))||0,net=Math.floor(price*(100-MK_FEE)/100);
  return`<div class="cd">
    <div class="ct">➕ Tezgâha eşya koy <span class="mu" style="font-size:10px">${m.length}/10 tezgâh</span></div>
    ${P.lv<MK_MINLV?`<p style="font-size:11px;color:#fbbf24">Satış için seviye ${MK_MINLV} gerekir.</p>`:""}
    <select class="sort-sel" style="width:100%;margin-bottom:6px" onchange="MK.sellI=this.value">${opts}</select>
    <input type="number" inputmode="numeric" min="1" max="100000000" placeholder="Fiyat (🪙)" value="${escH(MK.sellP)}" oninput="MK.sellP=this.value;mkNetUpd()" style="width:100%;box-sizing:border-box;padding:8px;background:#000;border:1px solid var(--ln);border-radius:8px;color:#fff;margin-bottom:4px;-webkit-user-select:text;user-select:text">
    <div class="mu" id="mk-net" style="font-size:10px;margin-bottom:6px">Satılırsa eline geçecek: ${mkN(net)} 🪙 (%${MK_FEE} vergi)</div>
    <button class="btn" style="padding:8px;font-size:12px" onclick="mkSell()">🏪 Tezgâha koy (24 saat)</button>
  </div>
  <div class="cd"><div class="ct">🏪 Tezgâhta (${open.length})</div>
    ${open.map(x=>mkItem(x.item,`<div style="text-align:right;flex:none"><b class="g" style="font-size:12px">${mkN(x.price)} 🪙</b><div class="mu" style="font-size:9px">⏳ ${mkLeft(x.expires)}</div><button class="btn d" style="margin-top:4px;padding:5px 8px;font-size:11px" onclick="mkCancel('${Number(x.id)}')">Kapat</button></div>`)).join("")||'<p class="mu" style="font-size:11px;text-align:center">Tezgâhta eşya yok</p>'}
  </div>
  <div class="cd"><div class="ct">💰 Satılanlar (${sold.length})</div>
    ${sold.map(x=>mkItem(x.item,`<div style="text-align:right;flex:none"><b style="color:#4ade80;font-size:12px">+${mkN(x.proceeds)} 🪙</b><div class="mu" style="font-size:9px">Alıcı: ${escH(x.buyer||"?")}</div><button class="btn" style="margin-top:4px;padding:5px 8px;font-size:11px" onclick="mkClaim('${Number(x.id)}')">Topla</button></div>`)).join("")||'<p class="mu" style="font-size:11px;text-align:center">Satılan eşya yok</p>'}
  </div>
  <div class="cd" style="${exp.length?"border-color:#f59e0b":""}"><div class="ct">⚠️ Süresi dolanlar — iade (${exp.length})</div>
    ${exp.length?'<p style="font-size:10.5px;color:#fbbf24;margin-bottom:6px">Bu eşyalar 24 saat içinde satılmadı. Çantana alman gerekir.</p>':""}
    ${exp.map(x=>mkItem(x.item,`<div style="text-align:right;flex:none"><div class="mu" style="font-size:9px">${mkN(x.price)} 🪙</div><button class="btn v" style="margin-top:4px;padding:5px 8px;font-size:11px" onclick="mkClaim('${Number(x.id)}')">Çantaya al</button></div>`)).join("")||'<p class="mu" style="font-size:11px;text-align:center">İade bekleyen eşya yok</p>'}
  </div>`;
}
function mkNetUpd(){const p=Math.floor(Number(MK.sellP))||0,e=$("mk-net");if(e)e.textContent="Satılırsa eline geçecek: "+mkN(Math.floor(p*(100-MK_FEE)/100))+" 🪙 (%"+MK_FEE+" vergi)"}
async function mkBuy(id){await mkRun({a:"mbuy",id,k:"m"})}
async function mkCancel(id){await mkRun({a:"mcancel",id,k:"m"})}
async function mkClaim(id){await mkRun({a:"mclaim",id,k:"m"})}
async function mkSell(){
  const i=Number(MK.sellI),price=Math.floor(Number(MK.sellP));
  if(MK.sellI===""||!Number.isInteger(i))return toast("Önce bir eşya seç");
  if(!(price>=1&&price<=1e8))return toast("Fiyat 1 ile 100.000.000 arasında olmalı");
  await mkRun({a:"msell",i,price});
}

/* ================= TAKAS ================= */
function mkTradeHtml(){
  const t=MK.tr||{in:[],out:[]},eq=mkEq();
  const mkIns=t.in.map(x=>`<div class="cd" style="margin-bottom:6px;padding:8px"><div class="r" style="margin-bottom:4px"><b>${escH(x.from_name)}</b><span class="mu" style="font-size:9px">⏳ ${mkLeft(x.expires)}</span></div>
    ${x.items.map(i=>mkItem(i)).join("")}${x.gold?`<div class="q"><span>Verdiği altın</span><b class="g">${mkN(x.gold)} 🪙</b></div>`:""}
    <div class="q"><span>Senden istediği</span><b style="color:#f87171">${mkN(x.want)} 🪙${x.want_n?" + "+x.want_n+" eşya"+(x.want_slot?" ("+escH(SN[x.want_slot]||x.want_slot)+")":""):""}</b></div>
    ${x.want_n?`<div class="mu" style="font-size:10px;margin:4px 0">Karşılığında vereceğin ${x.want_n} eşyayı seç (${MK.asel.size}/${x.want_n}):</div>${mkEq().filter(y=>!x.want_slot||y.i.slot===x.want_slot).map(y=>mkItem(y.i,`<input type="checkbox" ${MK.asel.has(y.k)?"checked":""} onclick="event.stopPropagation()" onchange="mkPickA(${y.k},this.checked)" style="width:20px;height:20px;flex:none">`,`mkPickA(${y.k},${MK.asel.has(y.k)?"false":"true"})`)).join("")||'<p class="mu" style="font-size:11px">Uygun eşyan yok</p>'}`:""}
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px"><button class="btn" style="padding:7px;font-size:12px" ${P.gold>=x.want&&P.lv>=MK_MINLV&&MK.asel.size===(x.want_n|0)?"":"disabled"} onclick="mkTrade('tacc','${Number(x.id)}','${x.want_slot||""}')">✔ Kabul et</button><button class="btn d" style="padding:7px;font-size:12px" onclick="mkTrade('tdec','${Number(x.id)}')">✖ Reddet</button></div></div>`).join("");
  const mkOuts=t.out.map(x=>{
    const st=x.state,lbl=st==="open"?"⏳ Bekliyor · "+mkLeft(x.expires):st==="done"?"✅ Kabul edildi":st==="back"?"❌ Reddedildi":"⏰ Süresi doldu";
    const btn=st==="open"?`<button class="btn d" style="padding:7px;font-size:12px" onclick="mkTrade('tcancel','${Number(x.id)}')">Teklifi geri çek</button>`
      :st==="done"?`<button class="btn" style="padding:7px;font-size:12px" onclick="mkTrade('tclaim','${Number(x.id)}')">💰 Takas ödemesini topla</button>`
      :`<button class="btn v" style="padding:7px;font-size:12px" onclick="mkTrade('tclaim','${Number(x.id)}')">İade al (eşya + altın)</button>`;
    return`<div class="cd" style="margin-bottom:6px;padding:8px;${st==="expired"||st==="back"?"border-color:#f59e0b":""}"><div class="r" style="margin-bottom:4px"><b>→ ${escH(x.to_name)}</b><span class="mu" style="font-size:10px">${lbl}</span></div>
      ${st==="done"?"":x.items.map(i=>mkItem(i)).join("")+(x.gold?`<div class="q"><span>Verilen altın</span><b class="g">${mkN(x.gold)} 🪙</b></div>`:"")}
      <div class="q"><span>${st==="done"?"Alacağın":"İstenen"}</span><b class="g">${mkN(x.want)} 🪙${x.want_n?" + "+x.want_n+" eşya"+(x.want_slot&&st!=="done"?" ("+escH(SN[x.want_slot]||x.want_slot)+")":""):""}</b></div>
      ${st==="done"?(x.ret_items||[]).map(i=>mkItem(i)).join(""):""}${btn}</div>`}).join("");
  return`<div class="cd"><div class="ct">🤝 Gelen teklifler (${t.in.length})</div>${mkIns||'<p class="mu" style="font-size:11px;text-align:center">Gelen teklif yok</p>'}</div>
  <div class="cd"><div class="ct">📤 Gönderdiklerim (${t.out.length}/5)</div>${mkOuts||'<p class="mu" style="font-size:11px;text-align:center">Gönderilmiş teklif yok</p>'}</div>
  <div class="cd"><div class="ct">➕ Yeni teklif <span class="mu" style="font-size:10px">Eşya/altın verirsin, karşı taraf altın öder</span></div>
    ${P.lv<MK_MINLV?`<p style="font-size:11px;color:#fbbf24">Takas için seviye ${MK_MINLV} gerekir.</p>`:""}
    <input type="text" maxlength="14" placeholder="Karakter adı" value="${escH(MK.tTo)}" oninput="MK.tTo=this.value" style="width:100%;box-sizing:border-box;padding:8px;background:#000;border:1px solid var(--ln);border-radius:8px;color:#fff;margin-bottom:6px;-webkit-user-select:text;user-select:text">
    <div class="mu" style="font-size:10px;margin-bottom:4px">Vereceğin eşyalar (en çok 10):</div>
    ${mkPickRows(P.inv,MK.tsel,"mkPickT")}
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin:6px 0">
      <input type="number" inputmode="numeric" min="0" placeholder="Vereceğin altın" value="${escH(MK.tG)}" oninput="MK.tG=this.value" style="min-width:0;padding:8px;background:#000;border:1px solid var(--ln);border-radius:8px;color:#fff;-webkit-user-select:text;user-select:text">
      <input type="number" inputmode="numeric" min="0" placeholder="İstediğin altın" value="${escH(MK.tW)}" oninput="MK.tW=this.value" style="min-width:0;padding:8px;background:#000;border:1px solid var(--ln);border-radius:8px;color:#fff;-webkit-user-select:text;user-select:text">
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:6px">
      <input type="number" inputmode="numeric" min="0" max="5" placeholder="İstediğin eşya sayısı (0-5)" value="${escH(MK.tWn)}" oninput="MK.tWn=this.value" style="min-width:0;padding:8px;background:#000;border:1px solid var(--ln);border-radius:8px;color:#fff;-webkit-user-select:text;user-select:text">
      <select class="sort-sel" onchange="MK.tWs=this.value">${'<option value="">Her bölme</option>'+SL.map(k=>`<option value="${k}" ${MK.tWs===k?"selected":""}>${SN[k]}</option>`).join("")}</select>
    </div>
    <div class="mu" style="font-size:9.5px;margin-bottom:6px">İstediğin eşyayı karşı taraf kendi çantasından seçip verir. Boş bırakırsan yalnızca altın istenir.</div>
    <button class="btn" style="padding:8px;font-size:12px" onclick="mkTradeSend()">🤝 Teklifi gönder (24 saat geçerli)</button>
    <p class="mu" style="font-size:9.5px;margin-top:6px">Gönderdiğin eşya ve altın teklif süresince emanette durur. Reddedilirse ya da süresi dolarsa buradan geri alırsın.</p>
  </div>`;
}
async function mkTrade(a,id){
  if(a==="tacc")await mkRun({a,id,k:"t",ii:[...MK.asel].map(k=>k)});
  else await mkRun({a,id,k:"t"});
}
async function mkTradeSend(){
  const to=MK.tTo.trim(),g=Math.floor(Number(MK.tG))||0,w=Math.floor(Number(MK.tW))||0,ii=[...MK.tsel].sort((a,b)=>a-b);
  if(!to)return toast("Alıcının karakter adını yaz");
  if(!ii.length&&!g)return toast("En az bir eşya ya da altın ver");
  const wn=Math.max(0,Math.min(5,Math.floor(Number(MK.tWn))||0));
  await mkRun({a:"tsend",to,ii,g,want:w,wn,ws:wn?MK.tWs:""});
}
