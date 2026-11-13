/* ============================================================
   ENGINE: oyunun veri tabloları ve formülleri (ekrandan bağımsız)
   Hem telefonda (game.js'ten ÖNCE yüklenir) hem sunucuda çalışacak şekilde yazıldı.
   Bu dosyada document, window, P, CB, toast gibi ekrana/oyuncuya bağlı şeyler OLMAMALI.
   ============================================================ */
const SL=["weapon","offhand","helm","chest","pants","boots","necklace","ring"],SN={weapon:"Silah",offhand:"Sol El",helm:"Kask",chest:"Zırh",pants:"Pantolon",boots:"Çizme",necklace:"Kolye",ring:"Yüzük"};
const CL={
tank:{n:"Tank",e:"🛡️",h:210,d:"Ağır zırh ustası, darbe soğuran ve sersemleten öncü.",b:{hp:420,mp:90,str:16,agi:8,vit:20,int:5},
 sk:[{n:"Kalkan Darbesi",mp:13,m:1.4,i:1,d:"Ağır darbe hazırlığını bozar, düşmanı sersemletir"},{n:"Kalkan Duvarı",mp:20,m:.6,sh:1,d:"3 tur hasar emen kalkan"},{n:"Meydan Okuma",mp:16,m:1.8,dot:1,d:"Yıkıcı vuruş ve 3 tur iç kanama"},{n:"Yıkılmaz İrade",mp:30,m:2.8,d:"Nihai savunma darbesi"}],
 it:["Ağır Çelik Kılıç","Kule Kalkanı","Demir Miğfer","Ağır Plaka Zırh","Çelik Dizlik","Ağır Demir Çizme","Dayanıklılık Gerdanlığı","Kaya Yüzüğü"]},
mage:{n:"Büyücü",e:"🔮",h:270,d:"Alev ve buzla yıkan arkana ustası.",b:{hp:250,mp:210,str:6,agi:9,vit:9,int:22},
 sk:[{n:"Alev Patlaması",mp:30,m:2.2,dot:1,d:"3 tur yakar"},{n:"Buzul Halka",mp:40,m:1.6,i:1,d:"Dondurur, ağır darbe hazırlığını bozar"},{n:"Arkana Kalkanı",mp:35,m:.5,sh:1,d:"Mana bariyeri"},{n:"Kıyamet Meteoru",mp:75,m:4.2,d:"Devasa büyü darbesi"}],
 it:["Kristal Asa","Odak Küresi","Arkana Tacı","Büyü Dokuma Cübbe","Efsunlu Pantolon","Astral Sandalet","Saf Mana Kolyesi","Yıldız Tozu Yüzüğü"]},
archer:{n:"Okçu",e:"🏹",h:140,d:"Yüksek kritik ve zehirli oklar.",b:{hp:310,mp:120,str:10,agi:22,vit:12,int:7},
 sk:[{n:"Zehirli Ok",mp:14,m:1.5,dot:1,d:"3 tur zehirler"},{n:"Kiriş Darbesi",mp:16,m:1.3,i:1,d:"Hızlı atış, ağır darbe hazırlığını bozar"},{n:"Zayıf Nokta",mp:23,m:2.4,crit:1,d:"Garanti kritik"},{n:"Ok Yağmuru",mp:40,m:3.6,d:"Ölümcül ok yağmuru"}],
 it:["Kompozit Avcı Yayı","Sadak & Bıçak","Deri Kapüşon","Sertleştirilmiş Yelek","Kamuflaj Pantolon","Sessiz İzci Çizmesi","Şahin Gözü Kolyesi","Rüzgâr Nişancı Yüzüğü"]},
assassin:{n:"Suikastçı",e:"🗡️",h:340,d:"Kritik uzmanı, kanatan ve kaçan gölge.",b:{hp:280,mp:110,str:12,agi:24,vit:10,int:6},
 sk:[{n:"Gölge Kesiği",mp:15,m:1.9,dot:1,d:"3 tur kanatır"},{n:"Kör Edici Toz",mp:18,m:1.1,i:1,d:"Ağır darbe hazırlığını iptal eder"},{n:"Gölgelere Karış",mp:20,m:.8,sh:1,d:"Darbeleri sıyırır"},{n:"Gölge İnfazı",mp:42,m:4.4,d:"Ölüm vuruşu"}],
 it:["Gölge Hançeri","Bilek Bıçağı","Yüz Maskesi","Gece Hayaleti Zırhı","Esnek Pantolon","Gölge Adımı Çizmesi","Engerek Gerdanlığı","Ölümcül Vuruş Yüzüğü"]},
healer:{n:"Şifacı",e:"✨",h:45,d:"Kutsal ışık, şifa ve koruyucu kubbe.",b:{hp:340,mp:180,str:9,agi:8,vit:15,int:14},
 sk:[{n:"Kutsal Işık",mp:25,m:1.6,dot:1,d:"Işık hasarı ve 3 tur kutsal yanık"},{n:"İlahi Baston",mp:22,m:1.2,i:1,d:"Ağır darbe hazırlığını bozar"},{n:"Kutsal Lütuf",mp:35,m:0,heal:1,d:"Seviyene göre sabit miktarda can yeniler (100 + 30×seviye)"},{n:"İlahi Kubbe",mp:70,m:1,sh:1,d:"Büyük ışık kubbesi"}],
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
    S:{id:"S",sz:"Küçük",e:"🧪",n:"Küçük Can İksiri",amt:150,cost:10,sell:3,g:1,dropW:65},
    M:{id:"M",sz:"Orta",e:"🧪",n:"Orta Can İksiri",amt:400,cost:25,sell:8,g:2,dropW:27},
    L:{id:"L",sz:"Büyük",e:"🧪",n:"Büyük Can İksiri",amt:900,cost:60,sell:20,g:4,dropW:8}
  },
  mp:{
    S:{id:"S",sz:"Küçük",e:"💧",n:"Küçük Mana İksiri",amt:60,cost:8,sell:2,g:1,dropW:65},
    M:{id:"M",sz:"Orta",e:"💧",n:"Orta Mana İksiri",amt:180,cost:20,sell:6,g:3,dropW:27},
    L:{id:"L",sz:"Büyük",e:"💧",n:"Büyük Mana İksiri",amt:400,cost:50,sell:16,g:4,dropW:8}
  }
};

const CW={tank:{str:2.8,dex:.8,int:.2},mage:{str:.2,dex:.5,int:3.2},archer:{str:.5,dex:3.2,int:.3},assassin:{str:1.2,dex:2.8,int:.2},healer:{str:.5,dex:.3,int:2.4}};

const reqXp=l=>l>=50?1e12:Math.floor(140*Math.pow(l,2.38)*(l>25?Math.pow(1.085,l-25):1)*(l>40?Math.pow(1.18,l-40):1));
function killXp(x,ml,pl){const d=pl-ml;if(d>=7)return 0;if(d>=4)return Math.floor(x*.25);if(d>=2)return Math.floor(x*.65);if(ml-pl>=6)return Math.floor(x*.35);return x}
const healAmt=p=>Math.floor((100+p.lv*30)*(1+p.at.int*.01));
const effLv=i=>i.rl;
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
  if(!isBasic&&s.heal){const h=healAmt(p);p.hp=Math.min(p.maxHp,p.hp+h);out.push({snd:"pot"});_lg(out,"💚 +"+h+" HP");out.push({fx:["+"+h,"#22c55e"]})}
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
  if(t=="hp"){const r=Math.min(d.amt,p.maxHp-p.hp);p.hp=Math.min(p.maxHp,p.hp+r);out.push({fx:["+"+r,"#22c55e"]});_lg(out,`🧪 ${d.n}: <b style=color:#4ade80>+${r} HP</b> (Kalan: ${p.pot.hp[sz]})`)}
  else{const r=Math.min(d.amt,p.maxMp-p.mp);p.mp=Math.min(p.maxMp,p.mp+r);out.push({fx:["+"+r,"#38bdf8"]});_lg(out,`💧 ${d.n}: <b style=color:#38bdf8>+${r} MP</b> (Kalan: ${p.pot.mp[sz]})`)}
  out.ok=true;return out;
}

/* Oto savaşın bir adımı. kind: "pot" (iksir içti), "stop" (oto savaş durmalı), "act" (k numaralı hamle yap, -1 temel saldırı) */
/* Oto savaş: seçili boy bittiyse ve altın yetiyorsa 10 adede kadar satın al (yalnızca iksir gerektiğinde) */
function autoBuyOf(p,t,sz,thr,out){
  if(!["S","M","L"].includes(sz))return;
  if((p.pot[t][sz]||0)>0)return;
  const need=t==="hp"?p.hp<p.maxHp*(thr/100):p.mp<p.maxMp*(thr/100);
  if(!need)return;
  const d=POT_DEF[t][sz],n=Math.min(10,Math.floor(p.gold/d.cost));
  if(n<1)return;
  p.gold-=d.cost*n;p.pot[t][sz]=(p.pot[t][sz]||0)+n;
  _lg(out,`🛒 Otomatik satın alma: ${n}× ${d.n} (-${d.cost*n} 🪙)`);
}
function bAutoStep(B,p,rng){
  const out=[];
  const cfg=p.autoCfg||{hp:"S",mp:"S",hpThr:40,mpThr:25,skills:[1,1,1,1]};
  const skOn=Array.isArray(cfg.skills)?cfg.skills:[1,1,1,1];
  if(cfg.buy){autoBuyOf(p,"hp",cfg.hp,cfg.hpThr,out);autoBuyOf(p,"mp",cfg.mp,cfg.mpThr,out)}
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
  if(m.el)g=x<=.5?5:x<=4?4:x<=22?3:x<=60?2:1;else g=x<=.4?5:x<=5?4:x<=18?3:x<=45?2:1;
  if(fg)g=Math.max(g,fg);
  const ac=(()=>{const y=rng.R(100);return y<=1?4:y<=5?3:y<=13?2:y<=28?1:0})(),P0=[["atk","Saldırı Gücü"],["def","Zırh Direnci"],["crit","Kritik Vuruş"]],af=[];
  for(let n=0;n<ac;n++){const q=P0[rng.RI(0,2)];af.push({t:q[0],n:q[1],v:rng.RI(1,10),l:false})}
  const it={name:r.ore+" "+CL[rc].it[si],setOre:r.ore,slot:sl,rc,rl:r.req,g,p:0,bp:r.pw,af};
  p.inv.push(it);p.st.l+=g==5?1:0;out.push({loot:{k:"item",t:it.name+" ["+G[g].t+"]",c:G[g].c,g}});
  if(g>=3)out.push({ev:["drop3",1]});
  if(g==5){out.push({snd:"elite"});out.push({toast:"👑 KADİM ELİT EŞYA: "+it.name+"!"});_lg(out,"👑 <b style=color:#e6b450>[JACKPOT]</b> "+it.name)}
  else _lg(out,"📦 <b style=color:"+G[g].c+">"+it.name+" ["+G[g].t+"]</b>"+(rc==p.cls?" ✅":""));
  return out;
}

function _gmat(p,k,n,out){p.mat[k]=(p.mat[k]||0)+n;out.push({ev:["mat",n]});out.push({loot:{k:"mat",t:MT[k][0]+" "+MT[k][1],n}});_lg(out,MT[k][0]+" +"+n+" "+MT[k][1])}
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
  out.push({win:{g,x,el:!!m.el}});
  _lg(out,"🎉 <b>"+m.name+"</b> yenildi! +"+g+"🪙 "+(x?"+"+x+" XP":"(0 XP, seviye farkı)"));
  if(m.el&&!B.tw&&m.ri<4&&!p.boss[m.ri+1])_lg(out,"🗝️ Yeni bölgenin kapısı açıldı!");
  while(p.xp>=reqXp(p.lv)&&p.lv<50){
    const prevHp=p.maxHp,prevMp=p.maxMp;p.xp-=reqXp(p.lv);p.lv++;p.sp+=2;p.ap+=3;
    out.push({ev:["lvl",p.lv]});out.push({snd:"lvl"});syncP(p);
    const dHp=p.maxHp-prevHp,dMp=p.maxMp-prevMp;
    out.push({toast:"🌟 Seviye "+p.lv+"! (+"+dHp+" HP, +"+dMp+" MP, +2 SP, +3 AP)"});
    p.hp=p.maxHp;p.mp=p.maxMp;
  }
  if(rng.R(1)<.16){const t=rng.R(1)<.5?"hp":"mp",r=rng.R(100),sz=r<65?"S":r<92?"M":"L",d=POT_DEF[t][sz];p.pot[t][sz]=(p.pot[t][sz]||0)+1;out.push({loot:{k:"pot",t:d.n,c:G[d.g].c}});_lg(out,`${d.e} 1× <b style=color:${G[d.g].c}>${d.n}</b> buldun`)}
  matDropOf(p,m,rng,out);
  if(B.tw){out.push({ev:["tower",B.tw]});p.tw=Math.max(p.tw,B.tw);if(B.tw%5==0){p.ch++;_lg(out,"🎁 Kat ödülü: sandık!")}}
  if(m.el?rng.R(100)<15:rng.R(100)<12)out.push(...dropItem(p,m,0,rng));
  syncP(p);
  return out;
}

/* Yenilgi: altının %10'u gider, can %30 */
function bLose(p){
  const l=Math.floor(p.gold*.1);p.gold-=l;p.st.dm++;p.stk=0;p.hp=Math.max(1,Math.floor(p.maxHp*.3));syncP(p);
  return{lost:l};
}


/* ---------- DEMİRCİ VE SANDIK (sunucuda çalışır; rastgelelik rng ile) ---------- */
function forgeNeed(p){if(p<5)return{kirik:2+p*2};const k=NT[p%4];if(p<9)return{kirik:6,[k]:2};if(p<12)return{kirik:8,[k]:3,kan:2,ruh:p-8};return{kirik:12,[k]:4,kan:p-9,ruh:p-8}}
/* konum: ["eq",slot] ya da ["inv",sıra] */
function itemAt(p,loc){
  if(!Array.isArray(loc)||loc.length!==2)return null;
  if(loc[0]==="eq")return SL.includes(loc[1])&&p.eq[loc[1]]?p.eq[loc[1]]:null;
  if(loc[0]==="inv")return Number.isInteger(loc[1])&&loc[1]>=0&&loc[1]<p.inv.length?p.inv[loc[1]]:null;
  return null;
}
function itemRemove(p,loc){if(loc[0]==="eq")p.eq[loc[1]]=null;else p.inv.splice(loc[1],1)}
/* Ocakta yükselt. out.ok=true ise malzeme/altın harcandı. */
function forgeUpg(p,loc,rng,prot){
  const out=[];out.ok=false;const i=itemAt(p,loc);
  if(!i){out.push({toast:"Eşya bulunamadı"});return out}
  if(i.p>=15){out.push({toast:"Maksimum +15"});return out}
  const cost=8+i.rl*6+i.p*14,nd=forgeNeed(i.p);
  if(!Object.keys(nd).every(k=>(p.mat[k]||0)>=nd[k])){out.push({toast:"Yetersiz malzeme"});return out}
  if(p.gold<cost){out.push({toast:"Yetersiz altın"});return out}
  p.gold-=cost;Object.keys(nd).forEach(k=>p.mat[k]-=nd[k]);out.ok=true;
  const ch=i.p>=10?30-(i.p-10)*4:100-i.p*6;
  if(rng.R(100)<=ch){i.p++;p.st.fok=(p.st.fok||0)+1;out.push({ev:["fok",1]});out.push({snd:"crit"});out.push({toast:"🔥 Başarılı! +"+i.p})}
  else{
    out.push({snd:"hit"});
    if(i.p>=6&&rng.R(1)<(i.p>=10?.25:.4)){
      if(prot&&p.sc>0){p.sc--;out.push({toast:"📜 Parşömen eşyanı korudu"})}
      else if(i.p>=10){itemRemove(p,loc);out.removed=true;out.push({toast:"💥 Eşya ocakta parçalandı!"})}
      else{i.p--;out.push({toast:"Başarısız: eşya +"+i.p+" seviyesine düştü"})}
    }else out.push({toast:"Başarısız, seviye atlamadı"});
  }
  syncP(p);return out;
}
/* Kilitli olmayan efsunları yeniden çevir (45 altın) */
function forgeReroll(p,loc,rng){
  const out=[];out.ok=false;const i=itemAt(p,loc);
  if(!i||!Array.isArray(i.af)||!i.af.length){out.push({toast:"Efsun yok"});return out}
  if(p.gold<45){out.push({toast:"Yetersiz altın"});return out}
  p.gold-=45;i.af.forEach(a=>{if(!a.l)a.v=rng.RI(1,10)});
  out.push({snd:"pot"});out.push({toast:"Efsunlar yenilendi"});out.ok=true;syncP(p);return out;
}
/* n sandık aç. out.res = özet (altın, parşömen, iksir, eşyalar) */
function chestOpen(p,n,rng){
  const out=[];out.ok=false;n=Math.max(0,Math.min(p.ch,Math.floor(n)||0));
  const res={n,gold:0,sc:0,hp:0,mp:0,items:[],skipped:0};
  if(n<=0){out.push({toast:"Sandık yok"});out.res=res;return out}
  for(let k=0;k<n;k++){
    p.ch--;out.push({ev:["chest",1]});
    const x=rng.R(100);
    if(x<6){
      if(p.inv.length<50){
        const o=dropItem(p,RG[Math.min(4,Math.floor((p.lv-1)/10))].mobs[0],3,rng);
        for(const e of o)if(e.ev)out.push(e);
        res.items.push(p.inv[p.inv.length-1]);
      }else{res.skipped++;const g=rng.RI(p.lv*10,p.lv*22)+20;p.gold+=g;res.gold+=g}
    }else if(x<12){p.sc++;res.sc++}
    else if(x<42){const r=rng.R(100),sz=r<60?"S":r<90?"M":"L";p.pot.hp[sz]=(p.pot.hp[sz]||0)+1;p.pot.mp[sz]=(p.pot.mp[sz]||0)+1;res.hp+=1;res.mp+=1}
    else{const g=rng.RI(p.lv*12,p.lv*30)+25;p.gold+=g;res.gold+=g}
  }
  out.push({snd:"elite"});out.res=res;out.ok=true;return out;
}

/* ===== EKONOMİ, GÖREV, GÜNLÜK (sunucuda işlenir; telefon yalnızca sonucu gösterir) ===== */
const QS=[];RG.forEach((r,ri)=>[[0,8,40],[2,6,70],[3,1,180]].forEach(([mi,n,g],k)=>QS.push({id:"q"+ri+mi,ri,mi,n,g:Math.floor(g*Math.pow(ri+1,1.6)),sc:k==2?1:0,t:r.m[mi][0]})));
QS.push({id:"qa",ri:-1,mi:-1,n:60,g:400,sc:1,t:"herhangi bir canavar"});
const QV=[
{id:"v1",h:"Savaş",k:"crit",n:30,txt:"30 kritik vuruş yap",g:150,m:{kirik:5}},
{id:"v2",h:"Savaş",k:"crit",n:150,txt:"150 kritik vuruş yap",g:600,ch:1},
{id:"v3",h:"Savaş",k:"dmg",abs:1,n:500,txt:"Tek vuruşta 500 hasar ver",g:300,ch:1},
{id:"v4",h:"Demirci",k:"fok",n:5,txt:"5 başarılı yükseltme yap",g:200,m:{kirik:8}},
{id:"v5",h:"Demirci",k:"fok",n:25,txt:"25 başarılı yükseltme yap",g:900,sc:2},
{id:"v6",h:"Toplayıcı",k:"mat",n:20,txt:"20 malzeme topla",g:150},
{id:"v7",h:"Toplayıcı",k:"mat",n:100,txt:"100 malzeme topla",g:500,m:{ruh:2,kan:2}},
{id:"v8",h:"Kule",k:"tower",abs:1,n:5,txt:"Kulede 5. kata ulaş",g:300,ch:1},
{id:"v9",h:"Kule",k:"tower",abs:1,n:15,txt:"Kulede 15. kata ulaş",g:900,ch:2},
{id:"v10",h:"Gelişim",k:"lvl",abs:1,n:10,txt:"10. seviyeye ulaş",g:200,m:{kirik:10}},
{id:"v11",h:"Gelişim",k:"lvl",abs:1,n:25,txt:"25. seviyeye ulaş",g:800,sc:1},
{id:"v12",h:"Gelişim",k:"lvl",abs:1,n:40,txt:"40. seviyeye ulaş",g:2000,ch:2},
{id:"v13",h:"Ganimet",k:"drop3",n:3,txt:"3 adet GR-III veya üstü eşya bul",g:300},
{id:"v14",h:"Ganimet",k:"chest",n:5,txt:"5 sandık aç",g:250,sc:1},
{id:"v15",h:"Hazırlık",k:"pot",n:10,txt:"10 iksir kullan",g:100}];
const qpOf=(p,q)=>{if(!p.q||typeof p.q!=="object")p.q={};return p.q[q.id]||(p.q[q.id]={p:0,c:0})};
function evQ(p,k,a){
  a=a===undefined?1:a;
  QV.forEach(q=>{if(q.k!=k)return;const s=qpOf(p,q);if(s.c||s.p>=q.n)return;s.p=Math.min(q.n,q.abs?Math.max(s.p,a):s.p+a)});
  if(k!="tower"&&k!="lvl"&&k!="dmg"&&p.dl&&Array.isArray(p.dl.q))p.dl.q.forEach(q=>{if(q.k==k&&!q.c&&q.p<q.n)q.p=Math.min(q.n,q.p+a)});
}
function killQ(p,k){
  if(p.dl&&Array.isArray(p.dl.q))p.dl.q.forEach(q=>{if(q.p<q.n&&(q.k=="any"||(q.k=="elite"&&k.el)||(q.k=="tower"&&k.tw)))q.p++});
  QS.forEach(q=>{if(q.ri<0||(q.ri==k.ri&&q.mi==k.mi)){const s=qpOf(p,q);if(s.p<q.n)s.p++}});
}
/* savaş/işlem çıktısındaki olayları görev ilerlemesine işle */
function questOut(p,out){for(const e of out||[]){if(e.ev&&e.ev[0]==="dmg"&&p.st&&Number.isFinite(e.ev[1]))p.st.mh=Math.max(p.st.mh|0,Math.min(2e9,Math.floor(e.ev[1])));if(e.ev)evQ(p,e.ev[0],e.ev[1]);else if(e.kill)killQ(p,e.kill)}}
function rollDaily(p,rng,t){
  if(!p.dl||typeof p.dl!=="object"||Array.isArray(p.dl))p.dl={d:"",s:0,c:0,q:[]};
  const d=p.dl;if(d.d==t)return false;
  const y=new Date(Date.parse(t+"T00:00:00Z")-864e5).toISOString().slice(0,10);
  if(d.l!=y&&d.l!=t)d.s=0;
  d.d=t;d.c=0;
  d.q=[{k:"any",n:15,g:60+p.lv*15},{k:"elite",n:2,g:100+p.lv*25,ch:1},{k:"tower",n:3,g:80+p.lv*20},
    [{k:"crit",n:12,g:90+p.lv*15},{k:"fok",n:2,g:100+p.lv*15,m:{kirik:5}},{k:"mat",n:12,g:80+p.lv*10},{k:"pot",n:3,g:70+p.lv*10}][rng.RI(0,3)]].map(q=>({...q,p:0,c:0}));
  return true;
}
const sellV=i=>3+i.rl*2+i.p*3+i.g*i.rl;
const junkOf=(p,i)=>i.g<=2||(i.rc!=p.cls&&i.g<=3);
function salvageYield(i){
  const out={kirik:Math.max(1,Math.floor(i.rl/4)+i.g+i.p)};
  const regIdx=Math.min(3,Math.floor((i.rl-1)/10));
  const regMat=NT[regIdx]||"zehir";
  if(i.g>=2||i.rl>=11)out[regMat]=Math.max(1,Math.floor(i.g/2));
  if(i.g>=4)out.kan=i.g-3;
  if(i.g==5)out.ruh=1+Math.floor(i.p/5);
  return out;
}
/* yığın eşyalar: anahtar -> [okuma, yazma, satış fiyatı] */
const STK_SELL={pot_hp_S:3,pot_hp_M:8,pot_hp_L:20,pot_mp_S:2,pot_mp_M:6,pot_mp_L:16,scroll:50,chest:0,mat_kirik:2,mat_oz:4,mat_zehir:4,mat_zirh:4,mat_tuy:4,mat_kan:15,mat_ruh:25};
function _stkGet(p,k){
  if(k==="scroll")return p.sc||0;if(k==="chest")return p.ch||0;
  if(k.startsWith("pot_"))return (p.pot[k.slice(4,6)]||{})[k.slice(7)]||0;
  return p.mat[k.slice(4)]||0;
}
function _stkSet(p,k,v){
  if(k==="scroll")p.sc=v;else if(k==="chest")p.ch=v;
  else if(k.startsWith("pot_"))p.pot[k.slice(4,6)][k.slice(7)]=v;
  else p.mat[k.slice(4)]=v;
}
const _rewTxt=(g,sc,ch,m)=>"+"+g+" 🪙"+(sc?" +📜":"")+(ch?" +🎁":"");
function _grantQ(p,q){
  p.gold+=q.g;p.sc+=q.sc||0;p.ch+=q.ch||0;
  Object.entries(q.m||{}).forEach(([k,n])=>{p.mat[k]=(p.mat[k]||0)+n});
}
const _bad=(out,m)=>{out.push({toast:m});out.ok=false;return out};
/* tek eko işlemi. body.a: sell | salvage | bulk | stack | buy | claim | sync.  dönüş dizisi: .ok, .info */
function ecoDo(p,body,rng,t,now){
  const out=[];out.ok=false;const a=body.a;
  normPotOf(p);
  if(a==="sell"||a==="salvage"){
    if(!Number.isInteger(body.i)||body.i<0||body.i>=p.inv.length)return _bad(out,"Eşya bulunamadı");
    const i=p.inv[body.i];
    if(a==="sell"){p.gold+=sellV(i);p.inv.splice(body.i,1);out.push({toast:"Satıldı"})}
    else{
      const y=salvageYield(i);
      Object.entries(y).forEach(([k,v])=>{p.mat[k]=(p.mat[k]||0)+v;out.push({ev:["mat",v]})});
      p.inv.splice(body.i,1);out.push({snd:"hit"});
      out.push({toast:"🔨 Parçalandı: "+Object.entries(y).map(([k,v])=>MT[k][0]+"+"+v).join(" ")});
    }
    out.ok=true;return out;
  }
  if(a==="bulk"){
    const l=p.inv.filter(i=>junkOf(p,i));
    if(!l.length)return _bad(out,"Satılacak düşük eşya yok");
    if(body.m==="salvage"){
      const tot={};
      l.forEach(i=>{const y=salvageYield(i);Object.entries(y).forEach(([k,v])=>{tot[k]=(tot[k]||0)+v;p.mat[k]=(p.mat[k]||0)+v;out.push({ev:["mat",v]})})});
      p.inv=p.inv.filter(i=>!junkOf(p,i));out.push({snd:"hit"});
      out.push({toast:"🔨 Parçalandı: "+Object.entries(tot).map(([k,v])=>MT[k][0]+"+"+v).join(" ")});
    }else if(body.m==="sell"){
      let s=0;l.forEach(i=>{s+=sellV(i)});p.inv=p.inv.filter(i=>!junkOf(p,i));p.gold+=s;
      out.push({toast:"Satıldı: +"+s+" 🪙"});
    }else return _bad(out,"Geçersiz istek");
    out.ok=true;return out;
  }
  if(a==="stack"){
    const k=body.key,c=body.cnt;
    if(typeof k!=="string"||!Object.prototype.hasOwnProperty.call(STK_SELL,k)||!Number.isInteger(c)||c<1)return _bad(out,"Geçersiz istek");
    if(_stkGet(p,k)<c)return _bad(out,"Yeterli adet yok");
    _stkSet(p,k,_stkGet(p,k)-c);p.gold+=STK_SELL[k]*c;
    out.push({toast:"Satıldı: +"+(STK_SELL[k]*c)+" 🪙"});out.ok=true;return out;
  }
  if(a==="buy"){
    const tt=body.t,n=body.n===undefined?1:body.n;let cost;
    if(!Number.isInteger(n)||n<1||n>999)return _bad(out,"Geçersiz adet");
    if(tt==="sc")cost=150;
    else if((tt==="hp"||tt==="mp")&&["S","M","L"].includes(body.sz))cost=POT_DEF[tt][body.sz].cost;
    else return _bad(out,"Geçersiz istek");
    if(p.gold<cost*n)return _bad(out,"Yetersiz altın");
    p.gold-=cost*n;
    if(tt==="sc")p.sc+=n;else p.pot[tt][body.sz]=(p.pot[tt][body.sz]||0)+n;
    out.push({snd:"pot"});out.push({toast:"Satın alındı: "+n+" adet (-"+(cost*n)+" 🪙)"});out.ok=true;return out;
  }
  if(a==="claim"){
    const kd=body.kind;
    if(kd==="q"||kd==="v"){
      const q=(kd==="q"?QS:QV).find(x=>x.id===body.id);
      if(!q)return _bad(out,"Görev bulunamadı");
      const s=qpOf(p,q);
      if(s.c||s.p<q.n)return _bad(out,"Görev henüz tamamlanmadı");
      s.c=1;_grantQ(p,q);out.push({snd:"lvl"});out.push({toast:"Görev ödülü: +"+q.g+" 🪙"+(q.sc?" +📜":"")+(q.ch?" +🎁":"")});
      out.ok=true;return out;
    }
    if(kd==="dq"){
      const q=p.dl&&Array.isArray(p.dl.q)?p.dl.q[body.i]:null;
      if(!q||!Number.isInteger(body.i))return _bad(out,"Görev bulunamadı");
      if(q.c||q.p<q.n)return _bad(out,"Görev henüz tamamlanmadı");
      q.c=1;p.gold+=q.g;if(q.ch)p.ch++;
      Object.entries(q.m||{}).forEach(([k,n])=>{p.mat[k]=(p.mat[k]||0)+n});
      out.push({snd:"lvl"});out.push({toast:"+"+q.g+" 🪙"+(q.ch?" +🎁":"")});out.ok=true;return out;
    }
    if(kd==="d"){
      const d=p.dl;if(!d||d.c)return _bad(out,"Bugünkü ödül alındı");
      const i=d.s%7,g=[50,100,150,200,300,400,500][i]*(1+Math.floor(p.lv/5));
      d.c=1;d.s++;d.l=t;p.gold+=g;if(i==6){p.sc++;p.ch++}
      out.push({snd:"lvl"});out.push({toast:"Giriş ödülü: +"+g+" 🪙"+(i==6?" +📜 +🎁":"")});out.ok=true;return out;
    }
    return _bad(out,"Geçersiz istek");
  }
  if(a==="sync"){
    out.ok=true;
    const last=p.sts;
    if(last){
      const m=(now-last)/6e4;
      if(m>=10){
        const h=Math.min(8,m/60),g=Math.floor(h*p.lv*12);
        p.gold+=g;if(h>=1)p.pot.hp.S=(p.pot.hp.S||0)+1;if(h>=4)p.ch++;
        out.push({toast:"Sen yokken +"+g+" 🪙"+(h>=1?" +🧪":"")+(h>=4?" +🎁":"")});
      }
    }
    return out;
  }
  return _bad(out,"Geçersiz istek");
}
function normPotOf(p){
  if(!p.pot||typeof p.pot!=="object")p.pot={};
  ["hp","mp"].forEach(t=>{p.pot[t]=Object.assign({S:0,M:0,L:0},p.pot[t]&&typeof p.pot[t]==="object"?p.pot[t]:{})});
  if(!p.mat||typeof p.mat!=="object")p.mat={};
}

/* ---- Paket D: banka, pazar, takas. Saf mantık: d = {bank,row,mcnt,tcnt,to_uid,uid}; dönüş {ok,msg,act} ya da {ok:false,msg} ---- */
const MK_MINLV=5,MK_MAXP=1e8,MK_INV=50,MK_BANKN=100;
function mkDo(p,body,d,now){
  const a=body.a,bad=m=>({ok:false,msg:m});
  const I=(v,lo,hi)=>Number.isInteger(v)&&v>=lo&&v<=hi;
  const idxs=(arr,len,mx)=>{
    if(!Array.isArray(arr)||arr.length>mx)return null;
    const u=[...new Set(arr)];
    if(u.length!==arr.length||u.some(x=>!I(x,0,len-1)))return null;
    return u;
  };
  const isEq=i=>i&&typeof i==="object"&&typeof i.slot==="string"&&typeof i.name==="string";
  const room=n=>p.inv.length+n<=MK_INV;
  const takeInv=ix=>{const out=ix.map(k=>p.inv[k]);[...ix].sort((x,y)=>y-x).forEach(k=>p.inv.splice(k,1));return out};
  const bank=d.bank||{gold:0,items:[],ver:0},row=d.row||null;
  const mine=row&&(row.seller===d.uid||row.from_uid===d.uid);
  if(a==="bdep"){
    const g=body.g===undefined?0:body.g,ix=idxs(body.ii||[],p.inv.length,25);
    if(!ix||!I(g,0,2e9)||(!ix.length&&!g))return bad("Geçersiz istek");
    if(ix.some(k=>!isEq(p.inv[k])))return bad("Yalnızca ekipman bankaya konur");
    if(g>p.gold)return bad("Yetersiz altın");
    if(bank.items.length+ix.length>MK_BANKN)return bad("Banka dolu (en çok "+MK_BANKN+" eşya)");
    const its=takeInv(ix);p.gold-=g;
    return{ok:true,msg:"🏦 Bankaya konuldu"+(its.length?": "+its.length+" eşya":"")+(g?" "+g+" 🪙":""),act:{t:"bank",ver:bank.ver,gold:bank.gold+g,items:bank.items.concat(its)}};
  }
  if(a==="bwd"){
    const g=body.g===undefined?0:body.g,ix=idxs(body.bi||[],bank.items.length,25);
    if(!ix||!I(g,0,2e9)||(!ix.length&&!g))return bad("Geçersiz istek");
    if(g>bank.gold)return bad("Bankada o kadar altın yok");
    if(!room(ix.length))return bad("Çantada yer yok");
    const out=ix.map(k=>bank.items[k]),rest=bank.items.filter((_,k)=>!ix.includes(k));
    out.forEach(i=>p.inv.push(i));p.gold+=g;
    return{ok:true,msg:"🏦 Bankadan alındı"+(out.length?": "+out.length+" eşya":"")+(g?" "+g+" 🪙":""),act:{t:"bank",ver:bank.ver,gold:bank.gold-g,items:rest}};
  }
  if(["msell","mbuy","tsend","tacc"].includes(a)&&p.lv<MK_MINLV)return bad("Pazar ve takas için seviye "+MK_MINLV+" gerekir");
  if(a==="msell"){
    if(!I(body.i,0,p.inv.length-1)||!I(body.price,1,MK_MAXP))return bad("Geçersiz istek");
    const it=p.inv[body.i];if(!isEq(it))return bad("Yalnızca ekipman satılır");
    if((d.mcnt|0)>=10)return bad("En çok 10 tezgâh (süresi dolanları ya da satılanları topla)");
    p.inv.splice(body.i,1);
    return{ok:true,msg:"🏪 Tezgâha kondu: "+it.name+" ("+body.price+" 🪙, 24 saat açık)",act:{t:"msell",item:it,price:body.price,name:p.name}};
  }
  if(a==="mbuy"){
    if(!row||body.k!=="m"||!row.live||row.seller===d.uid)return bad("Bu ilan artık yok ya da satıldı");
    if(p.gold<row.price)return bad("Yetersiz altın");
    if(!room(1))return bad("Çanta dolu");
    p.gold-=row.price;p.inv.push(row.item);
    return{ok:true,msg:"🛒 Satın alındı: "+row.item.name,act:{t:"mbuy",id:String(row.id),price:row.price,name:p.name}};
  }
  if(a==="mcancel"){
    if(!row||body.k!=="m"||!mine||!row.live)return bad("İlan bulunamadı");
    if(!room(1))return bad("Çanta dolu");
    p.inv.push(row.item);
    return{ok:true,msg:"Tezgâh kapatıldı, eşya çantana döndü",act:{t:"mcancel",id:String(row.id)}};
  }
  if(a==="mclaim"){
    if(!row||body.k!=="m"||!mine)return bad("İlan bulunamadı");
    if(row.status==="sold"){p.gold+=row.proceeds;return{ok:true,msg:"💰 Satış geliri alındı: "+row.proceeds+" 🪙 (%5 vergi kesildi)",act:{t:"mclaim",id:String(row.id),st:"sold"}}}
    if(row.status==="open"&&!row.live){
      if(!room(1))return bad("Çanta dolu");
      p.inv.push(row.item);
      return{ok:true,msg:"Süresi dolan eşya çantana alındı",act:{t:"mclaim",id:String(row.id),st:"expired"}};
    }
    return bad("Bu ilan hâlâ tezgâhta");
  }
  if(a==="tsend"){
    const ix=idxs(body.ii||[],p.inv.length,10),g=body.g===undefined?0:body.g,w=body.want===undefined?0:body.want;
    const wn=body.wn===undefined?0:body.wn,ws=body.ws===undefined?"":body.ws;
    if(!ix||!I(g,0,2e9)||!I(w,0,1e9)||!I(wn,0,5)||(ws!==""&&!SL.includes(ws))||(!ix.length&&!g)||typeof body.to!=="string"||!body.to.trim())return bad("Geçersiz istek");
    if(!d.to_uid)return bad("Bu adda bir oyuncu bulunamadı");
    if(d.to_uid===d.uid)return bad("Kendine teklif gönderemezsin");
    if((d.tcnt|0)>=5)return bad("En çok 5 açık teklifin olabilir");
    if(ix.some(k=>!isEq(p.inv[k])))return bad("Yalnızca ekipman gönderilir");
    if(g>p.gold)return bad("Yetersiz altın");
    const its=takeInv(ix);p.gold-=g;
    return{ok:true,msg:"🤝 Teklif gönderildi (24 saat geçerli)",act:{t:"tsend",to:body.to.trim().slice(0,14),to_uid:d.to_uid,name:p.name,items:its,gold:g,want:w,want_n:wn,want_slot:wn?ws:""}};
  }
  if(a==="tacc"){
    if(!row||body.k!=="t"||row.to_uid!==d.uid||!row.live)return bad("Teklif artık geçerli değil");
    if(p.gold<row.want)return bad("Yetersiz altın");
    const wn=row.want_n|0,ix=idxs(body.ii||[],p.inv.length,5);
    if(!ix||ix.length!==wn)return bad(wn?"Karşılığında tam "+wn+" eşya seçmelisin":"Geçersiz istek");
    if(ix.some(k=>!isEq(p.inv[k])||(row.want_slot&&p.inv[k].slot!==row.want_slot)))return bad(row.want_slot?"İstenen bölme: "+(SN[row.want_slot]||row.want_slot):"Yalnızca ekipman verilir");
    if(p.inv.length-wn+row.items.length>MK_INV)return bad("Çantada yer yok");
    const ret=takeInv(ix);
    p.gold=p.gold-row.want+row.gold;row.items.forEach(i=>p.inv.push(i));
    return{ok:true,msg:"🤝 Takas tamam: "+row.items.length+" eşya"+(row.gold?" + "+row.gold+" 🪙":"")+" aldın",act:{t:"tacc",id:String(row.id),want:row.want,ret}};
  }
  if(a==="tdec"){
    if(!row||body.k!=="t"||row.to_uid!==d.uid||!row.live)return bad("Teklif artık geçerli değil");
    return{ok:true,msg:"Teklif reddedildi",act:{t:"tdec",id:String(row.id)}};
  }
  if(a==="tcancel"||a==="tclaim"){
    if(!row||body.k!=="t"||row.from_uid!==d.uid)return bad("Teklif bulunamadı");
    let st;
    if(a==="tcancel"){if(!row.live)return bad("Teklif bulunamadı");st="open"}
    else st=row.status==="done"?"done":row.status==="back"?"back":!row.live?"expired":"";
    if(!st)return bad("Teklif hâlâ açık");
    if(st==="done"){
      const ri=row.ret_items||[];if(!room(ri.length))return bad("Çantada yer yok");
      p.gold+=row.want;ri.forEach(i=>p.inv.push(i));
      return{ok:true,msg:"💰 Takas tamam: "+row.want+" 🪙"+(ri.length?" + "+ri.length+" eşya":"")+" aldın",act:{t:"tclaim",id:String(row.id),st}};
    }
    if(!room(row.items.length))return bad("Çantada yer yok");
    row.items.forEach(i=>p.inv.push(i));p.gold+=row.gold;
    return{ok:true,msg:"Teklifteki eşya ve altın geri alındı",act:a==="tcancel"?{t:"tcancel",id:String(row.id)}:{t:"tclaim",id:String(row.id),st}};
  }
  return bad("Geçersiz istek");
}
const KZ={mkDo,MK_MINLV,healAmt,QS,QV,qpOf,evQ,killQ,questOut,rollDaily,sellV,junkOf,salvageYield,STK_SELL,ecoDo,SL,SN,CL,G,RG,TITLES,POT_DEF,CW,MT,TM,NT,reqXp,killXp,effLv,pw,getActiveSetsOf,getTitleBonusOf,statsOf,mkRng,seeded,forgeNeed,itemAt,forgeUpg,forgeReroll,chestOpen,syncP,towerMobOf,newBattle,bHit,bAct,bMobTurn,bPot,bAutoStep,dropItem,matDropOf,bWin,bLose};
(typeof globalThis!=="undefined"?globalThis:window).KZ=KZ;
if(typeof module!=="undefined"&&module.exports)module.exports=KZ;
