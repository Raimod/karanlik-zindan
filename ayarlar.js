/* ============================================================
   AYARLAR (v2.13.0): ses, titreşim, sarsıntı, hasar sayıları, hesap. Üst çubuktaki ⚙️ düğmesiyle açılır.
   Ayarlar yalnızca bu cihazda (localStorage) saklanır.
   ============================================================ */
function setSave(){try{localStorage.setItem("kz_set",JSON.stringify(SET))}catch(e){}}
function setTog(k){SET[k]=SET[k]?0:1;if(k==="hap"){try{localStorage.setItem("kz_nohap",SET.hap?"0":"1")}catch(e){}if(SET.hap&&navigator.vibrate)try{navigator.vibrate(30)}catch(e){}}setSave();if(k==="snd"&&SET.snd)A.pot();openSettings()}
function setVol(v){SET.vol=v;SET.snd=v>0?1:SET.snd;setSave();A.pot();openSettings()}
function openSettings(){
  const row=(k,ic,t,d)=>`<div class="q" style="padding:8px;margin-bottom:5px;align-items:center"><div style="flex:1;min-width:0"><b style="font-size:12px">${ic} ${t}</b><div class="mu" style="font-size:9.5px">${d}</div></div>
    <button class="btn ${SET[k]?"":"s"}" style="width:auto;padding:6px 12px;font-size:11px;margin:0;min-width:64px" onclick="setTog('${k}')">${SET[k]?"Açık":"Kapalı"}</button></div>`;
  const vb=v=>`<button class="btn ${SET.vol===v?"":"s"}" style="padding:6px 2px;font-size:10.5px;margin:0" onclick="setVol(${v})">%${v}</button>`;
  const cloud=typeof CLOUD!=="undefined"&&CLOUD.user;
  $("ic").innerHTML=`<div style="text-align:center;margin-bottom:8px"><div style="font-size:26px">⚙️</div><b class="g" style="font-size:15px">Ayarlar</b></div>
    ${row("snd","🔊","Ses efektleri","Vuruş, kritik, iksir ve seviye sesleri")}
    <div class="q" style="display:block;padding:8px;margin-bottom:5px;opacity:${SET.snd?1:.5}"><b style="font-size:12px">🎚️ Ses seviyesi</b>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:5px;margin-top:6px">${[25,50,70,100].map(vb).join("")}</div></div>
    ${row("hap","📳","Titreşim","Kritik vuruş, seviye atlama gibi anlarda telefon titrer")}
    ${row("shk","💥","Ekran sarsıntısı","Canavar vurulunca resmin sarsılması")}
    ${row("dmg","🔢","Hasar sayıları","Savaşta uçuşan hasar ve iyileşme rakamları")}
    <div class="q" style="padding:8px;margin-bottom:5px;align-items:center"><div style="flex:1"><b style="font-size:12px">⛶ Tam ekran</b><div class="mu" style="font-size:9.5px">Tarayıcıda tam ekrana geç / çık</div></div><button class="btn s" style="width:auto;padding:6px 12px;font-size:11px;margin:0" onclick="toggleFS()">Değiştir</button></div>
    <div class="q" style="padding:8px;margin-bottom:5px;align-items:center"><div style="flex:1"><b style="font-size:12px">👥 Karakter değiştir</b><div class="mu" style="font-size:9.5px">Karakter seçim ekranına dön</div></div><button class="btn s" style="width:auto;padding:6px 12px;font-size:11px;margin:0" onclick="closeM();openCharSelect()">Yuvalar</button></div>
    ${cloud?`<div class="q" style="padding:8px;margin-bottom:5px;align-items:center"><div style="flex:1"><b style="font-size:12px">☁️ Hesap</b><div class="mu" style="font-size:9.5px">Bulut hesabından çıkış yap</div></div><button class="btn s" style="width:auto;padding:6px 12px;font-size:11px;margin:0;color:#f87171" onclick="closeM();cloudSignOut()">Çıkış</button></div>`:""}
    <div class="mu" style="font-size:9.5px;text-align:center;margin:8px 0">Valdrenn: Gölgelerin Mirası · sürüm ${GAME_VERSION}<br>Ayarlar yalnızca bu cihazda saklanır.</div>
    <button class="btn" onclick="closeM()">Kapat</button>`;
  $("im").style.display="flex";
}
