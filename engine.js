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

const KZ={SL,SN,CL,G,RG,TITLES,POT_DEF,CW,reqXp,killXp,effLv,pw,getActiveSetsOf,getTitleBonusOf,statsOf};
(typeof globalThis!=="undefined"?globalThis:window).KZ=KZ;
if(typeof module!=="undefined"&&module.exports)module.exports=KZ;
