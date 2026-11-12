// @ts-nocheck
// Karanlık Zindan: battle fonksiyonu. OTOMATİK ÜRETİLDİ (engine.js + edge/handler.js + deno_glue.ts)
// Oyun motoru (engine.js) değişirse bu dosya yeniden üretilip Supabase'e tekrar yüklenmeli.
/* ============================================================
   ENGINE: oyunun veri tabloları ve formülleri (ekrandan bağımsız)
   Hem telefonda (game.js'ten ÖNCE yüklenir) hem sunucuda çalışacak şekilde yazıldı.
   Bu dosyada document, window, P, CB, toast gibi ekrana/oyuncuya bağlı şeyler OLMAMALI.
   ============================================================ */
const SL=["weapon","offhand","helm","chest","pants","boots","necklace","ring"],SN={weapon:"Silah",offhand:"Sol El",helm:"Kask",chest:"Zırh",pants:"Pantolon",boots:"Çizme",necklace:"Kolye",ring:"Yüzük"};
const CL={
tank:{n:"Tank",e:"🛡️",h:210,d:"Ağır zırh ustası, darbe soğuran ve sersemleten öncü.",b:{hp:420,mp:90,str:16,agi:8,vit:20,int:5},
 sk:[{n:"Kalkan Darbesi",mp:20,m:1.4,i:1,d:"Ağır darbe hazırlığını bozar, düşmanı sersemletir"},{n:"Kalkan Duvarı",mp:30,m:.6,sh:1,d:"3 tur hasar emen kalkan"},{n:"Meydan Okuma",mp:25,m:1.8,dot:1,d:"Yıkıcı vuruş ve 3 tur iç kanama"},{n:"Yıkılmaz İrade",mp:45,m:2.8,d:"Nihai savunma darbesi"}],
 it:["Ağır Çelik Kılıç","Kule Kalkanı","Demir Miğfer","Ağır Plaka Zırh","Çelik Dizlik","Ağır Demir Çizme","Dayanıklılık Gerdanlığı","Kaya Yüzüğü"]},
mage:{n:"Büyücü",e:"🔮",h:270,d:"Alev ve buzla yıkan arkana ustası.",b:{hp:250,mp:210,str:6,agi:9,vit:9,int:22},
 sk:[{n:"Alev Patlaması",mp:30,m:2.2,dot:1,d:"3 tur yakar"},{n:"Buzul Halka",mp:40,m:1.6,i:1,d:"Dondurur, ağır darbe hazırlığını bozar"},{n:"Arkana Kalkanı",mp:35,m:.5,sh:1,d:"Mana bariyeri"},{n:"Kıyamet Meteoru",mp:75,m:4.2,d:"Devasa büyü darbesi"}],
 it:["Kristal Asa","Odak Küresi","Arkana Tacı","Büyü Dokuma Cübbe","Efsunlu Pantolon","Astral Sandalet","Saf Mana Kolyesi","Yıldız Tozu Yüzüğü"]},
archer:{n:"Okçu",e:"🏹",h:140,d:"Yüksek kritik ve zehirli oklar.",b:{hp:310,mp:120,str:10,agi:22,vit:12,int:7},
 sk:[{n:"Zehirli Ok",mp:22,m:1.5,dot:1,d:"3 tur zehirler"},{n:"Kiriş Darbesi",mp:25,m:1.3,i:1,d:"Hızlı atış, ağır darbe hazırlığını bozar"},{n:"Zayıf Nokta",mp:35,m:2.4,crit:1,d:"Garanti kritik"},{n:"Ok Yağmuru",mp:60,m:3.6,d:"Ölümcül ok yağmuru"}],
 it:["Kompozit Avcı Yayı","Sadak & Bıçak","Deri Kapüşon","Sertleştirilmiş Yelek","Kamuflaj Pantolon","Sessiz İzci Çizmesi","Şahin Gözü Kolyesi","Rüzgâr Nişancı Yüzüğü"]},
assassin:{n:"Suikastçı",e:"🗡️",h:340,d:"Kritik uzmanı, kanatan ve kaçan gölge.",b:{hp:280,mp:110,str:12,agi:24,vit:10,int:6},
 sk:[{n:"Gölge Kesiği",mp:24,m:1.9,dot:1,d:"3 tur kanatır"},{n:"Kör Edici Toz",mp:28,m:1.1,i:1,d:"Ağır darbe hazırlığını iptal eder"},{n:"Gölgelere Karış",mp:30,m:.8,sh:1,d:"Darbeleri sıyırır"},{n:"Gölge İnfazı",mp:65,m:4.4,d:"Ölüm vuruşu"}],
 it:["Gölge Hançeri","Bilek Bıçağı","Yüz Maskesi","Gece Hayaleti Zırhı","Esnek Pantolon","Gölge Adımı Çizmesi","Engerek Gerdanlığı","Ölümcül Vuruş Yüzüğü"]},
healer:{n:"Şifacı",e:"✨",h:45,d:"Kutsal ışık, şifa ve koruyucu kubbe.",b:{hp:340,mp:180,str:9,agi:8,vit:15,int:14},
 sk:[{n:"Kutsal Işık",mp:25,m:1.6,dot:1,d:"Işık hasarı ve 3 tur kutsal yanık"},{n:"İlahi Baston",mp:22,m:1.2,i:1,d:"Ağır darbe hazırlığını bozar"},{n:"Kutsal Lütuf",mp:35,m:0,heal:1,d:"Canın %45’ini yeniler"},{n:"İlahi Kubbe",mp:70,m:1,sh:1,d:"Büyük ışık kubbesi"}],
 it:["Kutsal Topuz","Dua Kitabı","Işık Tacı","Ruhban Cübbesi","Arınma Pantolonu","Kutsal Sandalet","Hayat Madalyonu","Lütuf Yüzüğü"]}};

const G={1:{t:"GR-I",n:"Sıradan",m:1,c:"#64748b"},2:{t:"GR-II",n:"İşlenmiş",m:1.15,c:"#22c55e"},3:{t:"GR-III",n:"Usta İşi",m:1.3,c:"#38bdf8"},4:{t:"GR-IV",n:"Kusursuz",m:1.5,c:"#a855f7"},5:{t:"👑 ELİT",n:"Kadim Elit",m:1.75,c:"#e6b450"}};
const RG=[
{n:"Çırak Ormanı",req:1,ore:"Çırak",pw:25,h:130,m:[["Yaban Domuzu",2,340,42,10,1,3,18],["Goblin Çırağı",5,750,85,25,2,5,40],["Orman Kurdu",8,1450,155,45,4,8,75],["Haydut Reisi",10,3200,260,75,15,25,220]]},
{n:"Zehirli Madenler",req:11,ore:"Çelik",pw:70,h:38,m:[["Mağara Akrebi",12,3600,320,110,8,14,280],["Maden Golemi",15,6200,460,190,12,20,420],["Goblin Kazıcı Başı",18,9500,640,240,18,30,620],["Zehirli Kraliçe",20,18000,920,340,40,70,1200]]},
{n:"Batık Çöl Harabeleri",req:21,ore:"Obsidyen",pw:150,h:28,m:[["Kum Yılanı",22,12000,850,380,22,38,1100],["Lanetli Mumya",25,18500,1150,520,30,50,1600],["Antik Muhafız",28,26000,1520,700,42,70,2400],["Firavun Ruhu",30,48000,2200,980,90,160,4800]]},
{n:"Donmuş Ruhlar Zirvesi",req:31,ore:"Kristal",pw:280,h:200,m:[["Buzul Kurdu",32,34000,1950,1100,55,90,5200],["Donmuş Ruh",35,52000,2600,1450,75,120,7800],["Buzul Yetisi",38,76000,3500,1900,110,180,11500],["Buz Devi",40,135000,4900,2600,220,380,22000]]},
{n:"Ejderha Yarığı",req:41,ore:"Ejderha",pw:550,h:4,m:[["Lav Golemi",42,95000,4200,2400,140,240,22000],["Kıyamet İblisi",45,145000,5800,3200,200,350,34000],["Ejderha Muhafızı",48,220000,7800,4400,300,520,52000],["Kadim Kara Ejderha",50,450000,11500,6500,800,1500,120000]]}];
RG.forEach((r,ri)=>{r.id=ri;r.mobs=r.m.map((a,mi)=>({id:ri+"_"+mi,ri,mi,name:a[0],lv:a[1],hp:a[2],mx:a[2],atk:a[3],def:a[4],g:[a[5],a[6]],xp:a[7],el:mi==3}))});

const TITLES=[
  {id:"t0",n:"Çaylak Maceracı",desc:"Yolculuğun başlangıcı",bonus:"Yok",b:{},chk:p=>true},
  {id:"t1",n:"Canavar Avcısı",desc:"50 canavar öldür",bonus:"+%5 Saldırı",b:{atk:5},chk:p=>p.st.k>=50},
  {id:"t2",n:"Elit Celladı",desc:"10 elit canavar öldür",bonus:"+%8 Kritik Şansı",b:{cr:8},chk:p=>p.st.e>=10},
  {id:"t3",n:"Kule Fatihi",desc:"Sonsuz Kule 15. kata çık",bonus:"+%10 Maksimum Can",b:{hp:10},chk:p=>p.tw>=15},
  {id:"t4",n:"Demir Ustası",desc:"20 başarılı yükseltme yap",bonus:"+%10 Fiziksel Zırh",b:{arm:10},chk:p=>(p.st.fok||0)>=20},
  {id:"t5",n:"Efsanevi Kahraman",desc:"40. seviyeye ulaş",bonus:"+%12 Saldırı & Zırh",b:{atk:12,arm:12},chk:p=>p.lv>=40},
  {id:"t6",n:"Karanlığın Efendisi",desc:"Kadim Kara Ejderha'yı yen",bonus:"+%15 Tüm Güç & +%5 Kritik",b:{atk:15,arm:15,hp:15,cr:5},chk:p=>!!p.boss[4]}
];

const POT_DEF={
  hp:{
    S:{id:"S",sz:"Küçük",e:"🧪",n:"Küçük Can İksiri",pct:.25,cost:10,sell:3,g:1,dropW:65},
    M:{id:"M",sz:"Orta",e:"🧪",n:"Orta Can İksiri",pct:.50,cost:25,sell:8,g:2,dropW:27},
    L:{id:"L",sz:"Büyük",e:"🧪",n:"Büyük Can İksiri",pct:.85,cost:60,sell:20,g:4,dropW:8}
  },
  mp:{
    S:{id:"S",sz:"Küçük",e:"💧",n:"Küçük Mana İksiri",pct:.30,cost:8,sell:2,g:1,dropW:65},
    M:{id:"M",sz:"Orta",e:"💧",n:"Orta Mana İksiri",pct:.60,cost:20,sell:6,g:3,dropW:27},
    L:{id:"L",sz:"Büyük",e:"💧",n:"Büyük Mana İksiri",pct:.95,cost:50,sell:16,g:4,dropW:8}
  }
};

const CW={tank:{str:2.8,dex:.8,int:.2},mage:{str:.2,dex:.5,int:3.2},archer:{str:.5,dex:3.2,int:.3},assassin:{str:1.2,dex:2.8,int:.2},healer:{str:.5,dex:.3,int:2.4}};

const reqXp=l=>l>=50?1e12:Math.floor(140*Math.pow(l,2.38)*(l>25?Math.pow(1.085,l-25):1)*(l>40?Math.pow(1.18,l-40):1));
function killXp(x,ml,pl){const d=pl-ml;if(d>=7)return 0;if(d>=4)return Math.floor(x*.25);if(d>=2)return Math.floor(x*.65);if(ml-pl>=6)return Math.floor(x*.35);return x}
const effLv=i=>i.g==5?Math.min(50,i.rl+i.p*2):i.rl;
const pw=i=>Math.floor(i.bp*G[i.g].m*(1+i.p*.12));

/* ---------- OYUNCU DURUMUNDAN HESAPLANANLAR (p = karakter) ---------- */
function getActiveSetsOf(pl){
  const counts={};
  SL.forEach(k=>{
    const it=pl.eq[k];
    if(!it||effLv(it)>pl.lv)return;
    const setOre=it.setOre||it.name.split(" ")[0];
    counts[setOre]=(counts[setOre]||0)+1;
  });
  const active=[];
  Object.entries(counts).forEach(([ore,cnt])=>{
    if(cnt>=2){
      active.push({
        ore,cnt,
        atkPct:cnt>=6?25:(cnt>=2?8:0),
        armPct:cnt>=6?25:(cnt>=2?8:0),
        hpPct:cnt>=4?15:0,
        mpPct:cnt>=4?15:0,
        critAdd:cnt>=4?5:0,
        regenPct:cnt>=6?3:0
      });
    }
  });
  return active;
}

function getTitleBonusOf(pl){
  const t=TITLES.find(x=>x.id==pl.title);
  return(t&&t.chk(pl))?t.b:{};
}

function statsOf(pl){const c=CL[pl.cls].b,s=1+pl.lv*.06;
const lvGain=Math.max(0,pl.lv-1),lvHpBonus=lvGain*(35+Math.floor(c.hp*.035)),lvMpBonus=lvGain*(18+Math.floor(c.mp*.03));
let atk=20+pl.lv*3+(c.str*2.5+c.agi*1.5+c.int*2)*s,arm=10+c.vit*2*s,hp=c.hp+c.vit*15+lvHpBonus,mp=c.mp+c.int*10+lvMpBonus,cr=5+c.agi*.4+pl.lv*.1,pa=0,pd=0,php=0,pmp=0;
const a=pl.at,w=CW[pl.cls];atk+=a.str*w.str+a.dex*w.dex+a.int*w.int;arm+=a.vit*1.5+a.str*.4;hp+=a.vit*18;mp+=a.int*12;cr+=a.dex*.25;
SL.forEach(k=>{const i=pl.eq[k];if(!i||effLv(i)>pl.lv)return;const p=pw(i);
 if(k=="weapon")atk+=p;else if(k=="necklace")hp+=p*4;else if(k=="ring")mp+=p*3;else arm+=p;
 (i.af||[]).forEach(a=>{if(a.t=="atk")pa+=a.v;if(a.t=="def")pd+=a.v;if(a.t=="crit")cr+=a.v})});

// Set Bonusları
getActiveSetsOf(pl).forEach(st=>{pa+=st.atkPct;pd+=st.armPct;php+=st.hpPct;pmp+=st.mpPct;cr+=st.critAdd});

// Unvan Bonusları
const tb=getTitleBonusOf(pl);
if(tb.atk)pa+=tb.atk;if(tb.arm)pd+=tb.arm;if(tb.hp)php+=tb.hp;if(tb.cr)cr+=tb.cr;

const fAtk=Math.floor(atk*(1+pa/100));
return{atk:fAtk,minAtk:Math.max(1,Math.floor(fAtk*.85)),maxAtk:Math.max(1,Math.ceil(fAtk*1.15)),arm:Math.floor(arm*(1+pd/100)),hp:Math.floor(hp*(1+php/100)),mp:Math.floor(mp*(1+pmp/100)),cr:Math.min(75,Math.floor(cr))}}


/* ============================================================
   SAVAŞ MOTORU
   Ekrana dokunmaz. Ne olacağını "olay listesi" (out) olarak döndürür:
   {lg:"yazı"} {fx:[yazı,renk]} {snd:"hit"} {toast:"yazı"} {shake:1} {vig:1} {ev:[ad,sayı]}
   Rastgelelik rng parametresinden gelir (aynı tohum = aynı savaş).
   B = savaş durumu (oyundaki CB ile aynı alanlar), p = karakter (oyundaki P).
   ============================================================ */
const MT={kirik:["⚙️","Demir Kırığı"],zehir:["🧪","Zehir Bezi"],zirh:["🪨","Zırh Parçası"],tuy:["🪶","Çevik Tüy"],oz:["🌿","Yeşil Öz"],kan:["🩸","Kan Kristali"],ruh:["👻","Elit Ruhu"]};
const TM={poison:"zehir",armor:"zirh",swift:"tuy",regen:"oz",drain:"kan"},NT=["zehir","zirh","tuy","oz"];
const mkRng=f=>({R:n=>f()*n,RI:(a,b)=>Math.floor(a+f()*(b-a+1))});
/* Tohumlu rastgelelik: (seed,k) ile kaldığı yerden devam edilebilir. Telefon ve sunucu aynı sayıları üretir. */
function seeded(seed,k){k=k||0;let a=(seed+Math.imul(k,0x6D2B79F5))|0;
  const f=()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;k++;return((t^t>>>14)>>>0)/4294967296};
  const r=mkRng(f);Object.defineProperty(r,"k",{get:()=>k});return r}
const _lg=(o,t)=>o.push({lg:t});

function syncP(p){const d=statsOf(p);p.maxHp=d.hp;p.maxMp=d.mp;p.hp=Math.min(p.hp,p.maxHp);p.mp=Math.min(p.mp,p.maxMp)}
function pickBestAvailPotOf(p,t,pref){
  if(pref&&pref!=="off"&&(p.pot[t][pref]||0)>0)return pref;
  return null;
}
function towerMobOf(p,f){const r=Math.min(4,Math.floor((p.lv-1)/10)),b=f%5==0,t=RG[r].mobs[b?3:f%3],s=1+f*.07;
return{...t,id:"t"+f,lv:Math.min(60,p.lv+Math.floor(f/4)),hp:Math.floor(t.hp*s),mx:Math.floor(t.hp*s),atk:Math.floor(t.atk*s),def:Math.floor(t.def*s),xp:Math.floor(t.xp*s*.6),el:b,name:(b?"Kule Muhafızı ":"")+t.name+" · Kat "+f}}

/* Yeni savaş durumu */
function newBattle(p,ri,mi,tw){
  const m=tw?towerMobOf(p,tw):{...RG[ri].mobs[mi]};
  m.tr=m.el?"boss":["poison","armor","swift","regen","drain"][(m.ri+m.mi)%5];
  if(p.hp<=0)p.hp=1;
  return{ri:m.ri,mi:m.mi,mob:m,tw:tw||0,pz:0,pzT:0,ph:0,armor:m.tr=="armor",sh:0,shT:0,dot:0,dotT:0,tele:false,stun:false,rage:false};
}

/* Canavarın oyuncuya vuruşu */
function bHit(B,p,a,t,out,rng){
  const m=B.mob,ld=m.lv-p.lv,ar=statsOf(p).arm;
  a=Math.floor(a*(.90+rng.R(.20)));
  if(ld>=3)a=Math.floor(a*(1+(ld-2)*.15));
  a=Math.max(8,Math.floor(a*(1-ar/(ar+180))));
  out.push({vig:1});
  if(B.sh>0){const b=Math.min(B.sh,a);B.sh-=b;a-=b;_lg(out,"🛡️ Kalkan <b style=color:#38bdf8>"+b+"</b> hasarı emdi")}
  if(a>0){p.hp=Math.max(0,p.hp-a);if(m.tr=="drain")m.hp=Math.min(m.mx,m.hp+Math.floor(a*.5));out.push({snd:"hit"});_lg(out,t?"💥 <b style=color:#f43f5e>[AĞIR DARBE]</b> "+a+" hasar aldın!":"🩸 "+a+" hasar aldın")}
}

/* Oyuncunun hamlesi: i=-1 temel saldırı, 0..3 yetenek. out.acted=false ise hamle yapılmadı (mana yok). */
function bAct(B,p,i,rng){
  const out=[];out.acted=false;
  const isBasic=i<0,c=CL[p.cls],s=isBasic?{n:"Temel saldırı",mp:0,m:1,dot:0}:c.sk[i],rk=isBasic?0:p.sr[i]||0,rm=(1+rk*.05)*(rk>=50?1.25:1);
  if(p.mp<s.mp){out.push({toast:"Yetersiz mana!"});return out}
  p.mp-=s.mp;out.acted=true;
  const d=statsOf(p),m=B.mob;
  if(!isBasic&&s.i&&B.tele){B.tele=false;B.stun=true;B.armor=false;out.push({snd:"int"});_lg(out,"⚡ <b style=color:#e6b450>KESİNTİ!</b> Düşmanın hazırlığı bozuldu, tur kaybetti.");out.push({fx:["KESİNTİ!","#e6b450"]})}
  if(!isBasic&&s.heal){const h=Math.floor(p.maxHp*.45*(1+p.at.int*.01));p.hp=Math.min(p.maxHp,p.hp+h);out.push({snd:"pot"});_lg(out,"💚 +"+h+" HP");out.push({fx:["+"+h,"#22c55e"]})}
  if(!isBasic&&s.sh){B.sh=Math.floor(p.maxHp*.35*rm);B.shT=3;_lg(out,"🛡️ Kalkan açtın ("+B.sh+")")}
  if(s.m>0){
    const ld=m.lv-p.lv,rg=isBasic?(.85+rng.R(.30)):(.90+rng.R(.20));
    let pen=ld>=3?Math.max(.25,1-(ld-2)*.12):1,x=Math.floor(d.atk*rg*s.m*rm*(1-m.def/(m.def+200))*pen),gl=ld>=5&&rng.R(1)<.4;
    if(gl)x=Math.floor(x*.35);
    const cr=s.crit||rng.R(100)<d.cr;
    if(cr){x=Math.floor(x*1.8);out.push({snd:"crit"});out.push({ev:["crit",1]})}else out.push({snd:"hit"});
    if(B.armor)x=Math.floor(x*.6);
    x=Math.max(5,x);m.hp=Math.max(0,m.hp-x);p.st.d=Math.max(p.st.d,x);
    out.push({ev:["dmg",x]});out.push({shake:1});out.push({fx:[cr?"💥"+x:x,cr?"#e6b450":"#fff"]});
    _lg(out,(cr?"⚡ ":"")+(gl?"🛡️ ":"")+s.n+": <b style=color:#e5484d>"+x+"</b> hasar");
  }
  if(!isBasic&&s.dot){B.dot=Math.max(3,Math.floor(d.atk*.3*rm));B.dotT=3;B.dotN=p.cls=="tank"?"🩸 İç Kanama":p.cls=="mage"?"🔥 Yanma":p.cls=="archer"?"🧪 Zehir":p.cls=="assassin"?"🩸 Kanama":p.cls=="healer"?"✨ Kutsal Yanık":"☠️ Etki"}
  return out;
}

/* Canavarın sırası. Bittikten sonra: p.hp<=0 ise oyuncu öldü, B.mob.hp<=0 ise canavar öldü. */
function bMobTurn(B,p,rng){
  const out=[],m=B.mob;
  const regenSet=getActiveSetsOf(p).find(s=>s.regenPct>0);
  if(regenSet&&p.hp<p.maxHp){const rg=Math.max(5,Math.floor(p.maxHp*(regenSet.regenPct/100)));p.hp=Math.min(p.maxHp,p.hp+rg);_lg(out,"🌿 Set yenilemesi: +"+rg+" HP")}
  if(m.tr=="regen")m.hp=Math.min(m.mx,m.hp+Math.floor(m.mx*.03));
  if(B.pzT>0){p.hp=Math.max(0,p.hp-B.pz);B.pzT--;_lg(out,"🤢 Zehir: <b style=color:#a3e635>"+B.pz+"</b> hasar");if(p.hp<=0)return out}
  if(B.dotT>0){m.hp=Math.max(0,m.hp-B.dot);B.dotT--;_lg(out,(B.dotN||"☠️ Etki")+": <b style=color:#a3e635>"+B.dot+"</b> hasar");out.push({fx:[B.dot,"#a3e635"]});if(m.hp<=0)return out}
  if(m.el&&B.ph<2&&m.hp<=m.mx*(B.ph?.33:.66)){B.ph++;B.rage=true;m.atk=Math.floor(m.atk*1.3);_lg(out,"🔥 <b style=color:#f43f5e>"+m.name+" "+(B.ph+1)+". faza geçti!</b> Daha sert vuruyor.");out.push({fx:[(B.ph+1)+". FAZ!","#f43f5e"]})}
  if(B.stun){B.stun=false;_lg(out,"💫 "+m.name+" sersemledi, saldıramadı.")}
  else if(B.tele){B.tele=false;bHit(B,p,Math.floor(m.atk*2.5),true,out,rng)}
  else if(rng.R(1)<(B.rage?.5:m.el?.38:.25)){B.tele=true;_lg(out,"⚠️ <b style=color:#f43f5e>"+m.name+"</b> güçlü bir saldırı hazırlıyor!")}
  else{bHit(B,p,m.atk,false,out,rng);if(m.tr=="swift"&&rng.R(1)<.3)bHit(B,p,Math.floor(m.atk*.6),false,out,rng);if(m.tr=="poison"){B.pz=Math.max(8,Math.floor(m.atk*.15));B.pzT=3;_lg(out,"🤢 Zehirlendin!")}}
  if(B.shT>0&&--B.shT==0)B.sh=0;
  return out;
}

/* Savaşta iksir içme. quiet=true ise uyarı yazısı üretmez (oto savaş). out.ok = içildi mi. */
function bPot(p,t,sz,quiet){
  const out=[];out.ok=false;
  const d=POT_DEF[t][sz];
  if((p.pot[t][sz]||0)<=0){if(!quiet)out.push({toast:`${d.n} kalmadı (yanındaki K/O/B tuşuyla boyut değiştir)`});return out}
  if(t=="hp"&&p.hp>=p.maxHp){if(!quiet)out.push({toast:"Canın zaten tamamen dolu!"});return out}
  if(t=="mp"&&p.mp>=p.maxMp){if(!quiet)out.push({toast:"Manan zaten tamamen dolu!"});return out}
  p.pot[t][sz]--;out.push({snd:"pot"});out.push({ev:["pot",1]});
  if(t=="hp"){const r=Math.floor(p.maxHp*d.pct);p.hp=Math.min(p.maxHp,p.hp+r);out.push({fx:["+"+r,"#22c55e"]});_lg(out,`🧪 ${d.n}: <b style=color:#4ade80>+${r} HP</b> (Kalan: ${p.pot.hp[sz]})`)}
  else{const r=Math.floor(p.maxMp*d.pct);p.mp=Math.min(p.maxMp,p.mp+r);out.push({fx:["+"+r,"#38bdf8"]});_lg(out,`💧 ${d.n}: <b style=color:#38bdf8>+${r} MP</b> (Kalan: ${p.pot.mp[sz]})`)}
  out.ok=true;return out;
}

/* Oto savaşın bir adımı. kind: "pot" (iksir içti), "stop" (oto savaş durmalı), "act" (k numaralı hamle yap, -1 temel saldırı) */
function bAutoStep(B,p,rng){
  const out=[];
  const cfg=p.autoCfg||{hp:"S",mp:"S",hpThr:40,mpThr:25,skills:[1,1,1,1]};
  const skOn=Array.isArray(cfg.skills)?cfg.skills:[1,1,1,1];
  if(p.hp<p.maxHp*(cfg.hpThr/100)){
    const hSz=pickBestAvailPotOf(p,"hp",cfg.hp);
    if(hSz){const o=bPot(p,"hp",hSz,true);out.push(...o);if(o.ok)return{out,kind:"pot"}}
    if(p.hp<p.maxHp*.18){_lg(out,"⛔ Oto savaş durdu: can kritik ve seçili iksir bitti");return{out,kind:"stop"}}
  }
  if(p.mp<p.maxMp*(cfg.mpThr/100)){
    const mSz=pickBestAvailPotOf(p,"mp",cfg.mp);
    if(mSz){const o=bPot(p,"mp",mSz,true);out.push(...o);if(o.ok)return{out,kind:"pot"}}
  }
  const sk=CL[p.cls].sk;
  if(B.tele){const k=sk.findIndex((s,i)=>skOn[i]&&s.i&&p.mp>=s.mp);if(k>-1)return{out,kind:"act",k}}
  if(B.sh<=0&&B.shT==0){const k=sk.findIndex((s,i)=>skOn[i]&&s.sh&&p.mp>=s.mp&&rng.R(1)<.3);if(k>-1)return{out,kind:"act",k}}
  if(p.maxHp-p.hp>p.maxHp*.5){const k=sk.findIndex((s,i)=>skOn[i]&&s.heal&&p.mp>=s.mp);if(k>-1)return{out,kind:"act",k}}
  let b=-1,bm=0;sk.forEach((s,i)=>{if(skOn[i]&&!s.heal&&p.mp>=s.mp&&s.m*(1+(p.sr[i]||0)*.05)>bm&&s.mp<=p.mp*.6){bm=s.m;b=i}});
  return{out,kind:"act",k:b};
}

/* Eşya düşürme */
function dropItem(p,m,fg,rng){
  const out=[];
  if(p.inv.length>=50){_lg(out,"⚠️ Çanta dolu, eşya kayboldu!");return out}
  const ks=Object.keys(CL),rc=rng.R(1)<.6?p.cls:ks[rng.RI(0,4)],si=rng.RI(0,7),sl=SL[si],r=RG[m.ri];let g=1,x=rng.R(100);
  if(m.el)g=x<=2.5?5:x<=15?4:x<=40?3:x<=70?2:1;else g=x<=.4?5:x<=5?4:x<=18?3:x<=45?2:1;
  if(fg)g=Math.max(g,fg);
  const ac=(()=>{const y=rng.R(100);return y<=1?4:y<=5?3:y<=13?2:y<=28?1:0})(),P0=[["atk","Saldırı Gücü"],["def","Zırh Direnci"],["crit","Kritik Vuruş"]],af=[];
  for(let n=0;n<ac;n++){const q=P0[rng.RI(0,2)];af.push({t:q[0],n:q[1],v:rng.RI(1,10),l:false})}
  const it={name:r.ore+" "+CL[rc].it[si],setOre:r.ore,slot:sl,rc,rl:r.req,g,p:0,bp:r.pw,af};
  p.inv.push(it);p.st.l+=g==5?1:0;
  if(g>=3)out.push({ev:["drop3",1]});
  if(g==5){out.push({snd:"elite"});out.push({toast:"👑 KADİM ELİT EŞYA: "+it.name+"!"});_lg(out,"👑 <b style=color:#e6b450>[JACKPOT]</b> "+it.name)}
  else _lg(out,"📦 <b style=color:"+G[g].c+">"+it.name+" ["+G[g].t+"]</b>"+(rc==p.cls?" ✅":""));
  return out;
}

function _gmat(p,k,n,out){p.mat[k]=(p.mat[k]||0)+n;out.push({ev:["mat",n]});_lg(out,MT[k][0]+" +"+n+" "+MT[k][1])}
function matDropOf(p,m,rng,out){
  if(rng.R(100)<65)_gmat(p,"kirik",rng.RI(1,2),out);
  const k=TM[m.tr];if(k&&rng.R(100)<40)_gmat(p,k,1,out);
  if(m.el){_gmat(p,"ruh",rng.RI(1,2),out);if(rng.R(100)<50)_gmat(p,"kan",1,out)}
}

/* Zafer: ödülleri verir. {kill:..} olayı görev ilerlemesi için telefona bildirilir. */
function bWin(B,p,rng){
  const out=[];B.over=true;
  const m=B.mob,g=rng.RI(m.g[0],m.g[1]),x=killXp(m.xp,m.lv,p.lv);
  p.gold+=g;p.xp+=x;p.st.k++;p.stk++;
  out.push({kill:{el:!!m.el,tw:B.tw,ri:m.ri,mi:m.mi}});
  if(m.el){p.st.e++;if(!B.tw)p.boss[m.ri]=true}
  _lg(out,"🎉 <b>"+m.name+"</b> yenildi! +"+g+"🪙 "+(x?"+"+x+" XP":"(0 XP, seviye farkı)"));
  if(m.el&&!B.tw&&m.ri<4&&!p.boss[m.ri+1])_lg(out,"🗝️ Yeni bölgenin kapısı açıldı!");
  while(p.xp>=reqXp(p.lv)&&p.lv<50){
    const prevHp=p.maxHp,prevMp=p.maxMp;p.xp-=reqXp(p.lv);p.lv++;p.sp+=2;p.ap+=3;
    out.push({ev:["lvl",p.lv]});out.push({snd:"lvl"});syncP(p);
    const dHp=p.maxHp-prevHp,dMp=p.maxMp-prevMp;
    out.push({toast:"🌟 Seviye "+p.lv+"! (+"+dHp+" HP, +"+dMp+" MP, +2 SP, +3 AP)"});
    p.hp=p.maxHp;p.mp=p.maxMp;
  }
  if(rng.R(1)<.16){const t=rng.R(1)<.5?"hp":"mp",r=rng.R(100),sz=r<65?"S":r<92?"M":"L",d=POT_DEF[t][sz];p.pot[t][sz]=(p.pot[t][sz]||0)+1;_lg(out,`${d.e} 1× <b style=color:${G[d.g].c}>${d.n}</b> buldun`)}
  matDropOf(p,m,rng,out);
  if(B.tw){out.push({ev:["tower",B.tw]});p.tw=Math.max(p.tw,B.tw);if(B.tw%5==0){p.ch++;_lg(out,"🎁 Kat ödülü: sandık!")}}
  if(m.el&&!B.tw&&rng.R(100)<50){p.ch++;_lg(out,"🎁 Elit sandığı düştü!")}
  if(m.el||rng.R(100)<12)out.push(...dropItem(p,m,0,rng));
  syncP(p);
  return out;
}

/* Yenilgi: altının %10'u gider, can %30 */
function bLose(p){
  const l=Math.floor(p.gold*.1);p.gold-=l;p.st.dm++;p.stk=0;p.hp=Math.max(1,Math.floor(p.maxHp*.3));syncP(p);
  return{lost:l};
}

const KZ={SL,SN,CL,G,RG,TITLES,POT_DEF,CW,MT,TM,NT,reqXp,killXp,effLv,pw,getActiveSetsOf,getTitleBonusOf,statsOf,mkRng,seeded,syncP,towerMobOf,newBattle,bHit,bAct,bMobTurn,bPot,bAutoStep,dropItem,matDropOf,bWin,bLose};
(typeof globalThis!=="undefined"?globalThis:window).KZ=KZ;
if(typeof module!=="undefined"&&module.exports)module.exports=KZ;

/* "battle" Edge Function mantığı. Veritabanına db adaptörü üzerinden erişir (test edilebilir).
   db.get(uid)  -> kz_b_get sonucu;  db.put(uid,rev,slot,pslot,b,lockMs) -> kz_b_put

   İki çalışma biçimi:
   * MANUEL: telefon savaşı kendisi oynar (sunucunun verdiği tohumla), bitince hamle listesini gönderir
     ("finish"). Sunucu aynı tohumla baştan oynatır; sonucu ve ödülü sunucu belirler. Savaş başına 1 çağrı.
   * OTO: sunucu bir istekte birkaç savaşı oynar ("auto"). */
const BH_FIELDS=["hp","mp","maxHp","maxMp","gold","xp","lv","sp","ap","pot","mat","tw","ch","boss","st","stk"];
const BH_MAX_STEPS=300,BH_MAX_ACTS=400;

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
  if(!["start","finish","auto","end","act","pot"].includes(op))return{err:"gecersiz_istek"};
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

/* ---------- Supabase / Deno bağlantısı ---------- */
import { createClient } from "npm:@supabase/supabase-js@2";
const CORS: Record<string,string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const J = (o: unknown, st = 200) => new Response(JSON.stringify(o), { status: st, headers: { ...CORS, "Content-Type": "application/json" } });
function svcKey(): string {
  const legacy = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (legacy) return legacy;
  try { const j = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") || "null"); if (j && j.default) return j.default; } catch (_) { /* yok */ }
  return "";
}
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
  try {
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, svcKey(), { auth: { persistSession: false } });
    const token = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
    const { data, error } = await sb.auth.getUser(token);
    if (error || !data || !data.user) return J({ err: "giris_gerekli" }, 401);
    const body = await req.json();
    const db = {
      get: async (uid: string) => { const r = await sb.rpc("kz_b_get", { p_uid: uid }); if (r.error) throw r.error; return r.data; },
      put: async (uid: string, rev: string, slot: number, pslot: unknown, b: unknown, lockMs: number) => {
        const r = await sb.rpc("kz_b_put", { p_uid: uid, p_rev: rev, p_slot: slot, p_pslot: pslot, p_b: b, p_lock_ms: lockMs });
        if (r.error) throw r.error;
      },
    };
    const out = await kzBattleHandle((globalThis as any).KZ, db, data.user.id, body, {});
    return J(out);
  } catch (e) {
    return J({ err: "sunucu_hatasi", msg: String((e as any)?.message || e) }, 500);
  }
});
