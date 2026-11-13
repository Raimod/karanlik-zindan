/* ============================================================
   Karanlık Zindan: YENİ KARAKTER ÖĞRETİCİSİ
   Yeni karakter açılınca kısa (6 adım) bir tur başlar. Atlanabilir; Wiki'den tekrar açılır.
   Karakterde P.tut: 0 = henüz gösterilmedi, 1 = bitti/atlandı (eski karakterlerde yok = gösterme).
   ============================================================ */
const TUT_STEPS=[
  {e:"⚔️",t:"Hoş geldin, {ad}!",x:"Karanlık Zindan'da canavar keser, güçlenir, eşya toplar ve Sonsuz Kule'yi tırmanırsın. <b>6 kısa adımda</b> nereye bakacağını göstereyim. İstediğin an atlayabilirsin.",modal:true},
  {tab:"map",hl:[2],e:"🗺️",t:"Harita: savaş burada",x:"Bir bölge ve canavar seç, savaşa gir. <b>▶ Oto</b> ile otomatik savaşabilirsin; oto sürerken diğer sekmelere bakabilirsin. Yeni bölgeler seviyene göre açılır."},
  {tab:"character",hl:[0],e:"🧙",t:"Karakter: gelişimini buradan izle",x:"Eşyalarını kuşan, <b>+</b> ile nitelik puanı dağıt, yeteneklere puan ver. Seviyen, unvanın ve ilerlemen hep burada."},
  {tab:"inventory",hl:[1,3],e:"🎒",t:"Çanta ve Demirci",x:"Düşen eşyalar <b>Çanta</b>'ya gelir: <b>⚡ en iyileri kuşan</b>, fazlayı sat ya da parçala. <b>⚙️ Çöp kuralları</b> ile bunu otomatik yaptırabilirsin. <b>Demirci</b>'de eşyalarını + basıp efsunlarını yenilersin."},
  {tab:"city",hl:[4],e:"🏰",t:"Şehir: alışveriş ve takas",x:"<b>Pınar</b> canını doldurur, <b>Simyacı</b> iksir satar. <b>Banka</b> eşyanı saklar; <b>Pazar</b> ve <b>Takas</b> ile diğer oyunculara eşya satar, değiş tokuş edersin (seviye 5'ten sonra)."},
  {tab:"quests",hl:[5,6,7],e:"📜",t:"Görev, Topluluk ve Wiki",x:"<b>Görevler</b> altın, parşömen ve sandık verir; her gün gir. <b>Topluluk</b>'ta sıralama ve sohbet var. Takılırsan <b>Wiki</b> oyunun tüm kurallarını anlatır, öğreticiyi de oradan tekrar açabilirsin.",last:true}
];
let TUT={on:false,i:0};

function tutClear(){
  document.querySelectorAll("#nv button.tutpulse").forEach(b=>b.classList.remove("tutpulse"));
  const o=$("tut");if(o)o.remove();
}
function tutStart(replay){
  try{if(!replay&&localStorage.getItem("kz_notut")==="1")return}catch(e){}
  if(TUT.on)return;
  if(CB&&CB.on){toast("Önce savaştan çık, sonra öğreticiyi açabilirsin");return}
  TUT={on:true,i:0};tutShow();
}
function tutDone(){
  tutClear();TUT.on=false;
  if(P&&P.tut!==1){P.tut=1;try{save()}catch(e){}}
}
function tutNext(){
  if(TUT.i>=TUT_STEPS.length-1){tutDone();go("map");toast("🗡️ Hazırsın! İlk hedef: Harita → Çırak Ormanı → Yaban Domuzu");return}
  TUT.i++;tutShow();
}
function tutPrev(){if(TUT.i>0){TUT.i--;tutShow()}}
function tutShow(){
  tutClear();
  const s=TUT_STEPS[TUT.i],n=TUT_STEPS.length;
  if(s.tab)go(s.tab);
  const nv=$("nv"),btns=nv?[...nv.children]:[];
  (s.hl||[]).forEach(k=>btns[k]&&btns[k].classList.add("tutpulse"));
  const dots=TUT_STEPS.map((_,k)=>`<i class="${k===TUT.i?"on":k<TUT.i?"dn":""}"></i>`).join("");
  const body=`<div class="tut-h"><span class="tut-e">${s.e}</span><b>${s.t.replace("{ad}",escH(P.name||""))}</b></div><div class="tut-x">${s.x}</div>
    <div class="tut-f"><div class="tut-d">${dots}</div><div class="tut-b">
      ${TUT.i>0?'<button class="btn s" onclick="tutPrev()">◀</button>':""}
      ${s.last?"":'<button class="btn s" onclick="tutDone()">Atla</button>'}
      <button class="btn" onclick="tutNext()">${s.last?"Başla ⚔️":"İleri ▶"}</button></div></div>`;
  const o=document.createElement("div");o.id="tut";
  if(s.modal){o.className="tut-m";o.innerHTML=`<div class="tut-c">${body}</div>`}
  else{
    o.className="tut-p";
    o.innerHTML=`<div class="tut-c">${body}<span class="tut-a" id="tut-a"></span></div>`;
  }
  document.body.appendChild(o);
  if(!s.modal){
    /* ok işareti: vurgulanan sekmelerin ortasına bakar */
    const tg=(s.hl||[]).map(k=>btns[k]).filter(Boolean);
    const a=$("tut-a"),c=o.querySelector(".tut-c");
    if(tg.length&&a&&c){
      const rs=tg.map(b=>b.getBoundingClientRect()),mid=(Math.min(...rs.map(r=>r.left))+Math.max(...rs.map(r=>r.right)))/2;
      const cr=c.getBoundingClientRect();
      a.style.left=Math.max(14,Math.min(cr.width-14,mid-cr.left))+"px";
    }
  }
}
/* Yeni karakter (P.tut===0) oyuna girince otomatik başlar */
setInterval(()=>{
  try{
    if(TUT.on||typeof P==="undefined"||!P||P.tut!==0)return;
    const cs=$("cs-screen");if(cs&&cs.style.display!=="none")return;
    if(CB&&CB.on)return;
    tutStart(false);
  }catch(e){}
},1200);
