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
{n:"Çırak Ormanı",req:1,ore:"Çırak",pw:25,h:130,x:285,y:514,d:"Valdrenn'in kapısındaki yaşlı orman. Her büyük yolculuk burada başlar.",m:[["Yaban Domuzu",2,340,42,10,1,3,18],["Kuduz Tilki",3,443,53,14,2,5,23],["Dev Örümcek",4,576,67,19,3,5,31],["Goblin Çırağı",5,750,85,25,2,5,40],["Çürük Ağaç Ruhu",7,1164,127,37,4,8,61],["Orman Kurdu",8,1450,155,45,4,8,75],["Ayı Kafalı Haydut",9,1806,189,55,6,10,92],["Haydut Reisi",10,3200,260,75,15,25,220]]},
{n:"Zehirli Madenler",req:11,ore:"Çelik",pw:70,h:38,x:74,y:545,d:"Eski cücelerin terk ettiği madenler; derinlerde zehir ve çürüme var.",m:[["Mağara Akrebi",12,3600,320,110,8,14,280],["Maden Yarasası",13,4315,361,132,10,17,321],["Zehir Solucanı",14,5172,408,158,12,19,367],["Maden Golemi",15,6200,460,190,12,20,420],["Taş Gargoyl",17,8240,573,222,17,27,545],["Goblin Kazıcı Başı",18,9500,640,240,18,30,620],["Ölü Madenci",19,10952,714,259,22,35,706],["Zehirli Kraliçe",20,18000,920,340,40,70,1200]]},
{n:"Batık Çöl Harabeleri",req:21,ore:"Obsidyen",pw:150,h:28,x:97,y:416,d:"Kumlar altında kalmış kadim bir krallığın lanetli kalıntıları.",m:[["Kum Yılanı",22,12000,850,380,22,38,1100],["Kum Hortlağı",23,13863,940,422,25,43,1246],["Leş Akbabası",24,16014,1040,468,28,47,1412],["Lanetli Mumya",25,18500,1150,520,30,50,1600],["Kum Golemi",27,23212,1385,634,39,64,2097],["Antik Muhafız",28,26000,1520,700,42,70,2400],["Mezar Soyguncusu",29,29123,1668,773,48,79,2747],["Firavun Ruhu",30,48000,2200,980,90,160,4800]]},
{n:"Donmuş Ruhlar Zirvesi",req:31,ore:"Kristal",pw:280,h:200,x:81,y:284,d:"Ölenlerin ruhlarının donarak kaldığı, sonsuz kış tepesi.",m:[["Buzul Kurdu",32,34000,1950,1100,55,90,5200],["Kar Baykuşu",33,39173,2146,1206,62,100,5953],["Buz Örümceği",34,45133,2362,1322,69,110,6814],["Donmuş Ruh",35,52000,2600,1450,75,120,7800],["Dondurulmuş Savaşçı",37,66969,3170,1736,98,158,10104],["Buzul Yetisi",38,76000,3500,1900,110,180,11500],["Kış Cadısı",39,86248,3865,2079,126,207,13089],["Buz Devi",40,135000,4900,2600,220,380,22000]]},
{n:"Ejderha Yarığı",req:41,ore:"Ejderha",pw:550,h:4,x:187,y:381,d:"Dünyayı ikiye yaran, lav ve ejderha yuvalarıyla dolu yarık.",m:[["Lav Golemi",42,95000,4200,2400,140,240,22000],["Magma Böceği",43,109380,4677,2642,159,273,25436],["Ejderha Yavrusu",44,125937,5208,2907,179,310,29408],["Kıyamet İblisi",45,145000,5800,3200,200,350,34000],["Kül Şövalyesi",47,191457,7067,3957,263,457,45133],["Ejderha Muhafızı",48,220000,7800,4400,300,520,52000],["Ejderha Kâhini",49,252798,8610,4893,344,594,59912],["Kadim Kara Ejderha",50,450000,11500,6500,800,1500,120000]]},
{n:"Çürük Bataklık",req:51,ore:"Zümrüt",pw:900,h:100,x:61,y:377,d:"Sisin içinde yaşayan, zehirli ve çürümüş bir bataklık.",m:[["Bataklık Sülüğü",51,270967,9229,5437,319,637,72082],["Çamur Yengeci",52,291475,9698,5789,341,682,81175],["Kurbağa Şamanı",53,302382,9864,5878,365,729,91407],["Çürük Timsah",54,313505,10031,5967,390,780,102918],["Yırtıcı Sarmaşık",55,357520,11177,6878,418,835,115867],["Bataklık Cadısı",56,383174,11741,7302,447,893,130434],["Sis Hortlağı",56,386824,11741,7302,447,893,131676],["Çürümüş Hidra",57,710507,15505,9259,1386,2772,318570]]},
{n:"Kemik Vadisi",req:58,ore:"Kemik",pw:1250,h:60,x:274,y:403,d:"Bitmeyen savaşların cesetlerini yutmuş, kemik beyazı bir vadi.",m:[["İskelet Okçu",58,383050,12115,7512,512,1023,154437],["Kemik Köpeği",59,396092,12304,7618,548,1095,173919],["Mezar Bekçisi",60,461950,14025,9028,586,1171,195840],["Hortlak Şövalye",61,477013,14232,9151,627,1253,220503],["Kemik Golemi",62,492701,14425,9274,671,1341,248247],["Ruh Toplayıcı",63,508303,14635,9397,718,1435,279457],["Ölü Rahip",63,513144,14635,9397,718,1435,282119],["Kemik Kral",64,939632,19301,11900,2226,4452,682541]]},
{n:"Gölge Katedrali",req:65,ore:"Gölge",pw:1650,h:275,x:226,y:194,d:"Gölgelerin ibadet ettiği, çanları kendiliğinden çalan terk edilmiş katedral.",m:[["Gölge Çırağı",65,546697,16251,10671,822,1643,330884],["Vitray Gargoyl",66,563570,16476,10808,879,1758,372625],["Kara Rahibe",67,580708,16704,10944,941,1881,419591],["Fısıltı Hayaleti",68,598109,16932,11081,1006,2012,472430],["Çan Kulesi Bekçisi",69,615820,17161,11217,1077,2153,531874],["Gece Gezgini",70,681553,18648,12449,1152,2304,598742],["Karanlık Şövalye",70,688044,18648,12449,1152,2304,604444],["Gölge Başpiskopos",71,1257419,24560,15749,3575,7149,1462356]]},
{n:"Fırtına Zirveleri",req:72,ore:"Fırtına",pw:2150,h:215,x:284,y:168,d:"Şimşeklerin hiç dinmediği, bulutların üstündeki zirveler.",m:[["Fırtına Kartalı",72,674159,19120,12748,1319,2638,708925],["Şimşek Elementali",73,693443,19366,12897,1411,2822,798356],["Bulut Devi Çırağı",74,713034,19614,13047,1510,3020,898980],["Rüzgâr Cini",75,783385,21177,14354,1616,3231,1012190],["Yıldırım Boğası",76,804871,21439,14516,1729,3457,1139549],["Gök Gürültüsü Grifonu",77,826609,21702,14679,1850,3699,1282814],["Fırtına Okçusu",77,834481,21702,14679,1850,3699,1295032],["Fırtına Efendisi",78,1521349,28558,18552,5740,11479,3133121]]},
{n:"Cehennem Dişleri",req:79,ore:"Cehennem",pw:2750,h:12,x:74,y:139,d:"Yerin dibinden yükselen, kor ve zincirlerle kaplı sivri kayalıklar.",m:[["Kül İmpi",79,814206,22233,15005,2118,4235,1518883],["Lav Solucanı",80,889332,23880,16393,2266,4532,1710490],["Zincirli İblis",81,913249,24160,16569,2425,4849,1926079],["Kor Cehennem Köpeği",82,937072,24423,16744,2595,5189,2168633],["Alev Cadısı",83,961217,24705,16920,2776,5552,2441502],["Obsidyen Cellat",84,985683,24989,17096,2970,5940,2748450],["Kızıl Süvari",84,995071,24989,17096,2970,5940,2774626],["Cehennem Lordu",85,1918700,34731,23203,9217,18433,6712762]]},
{n:"Kadim Boşluk",req:86,ore:"Boşluk",pw:3500,h:300,x:158,y:139,d:"Zamanın ve mekânın çözüldüğü, yıldızsız bir boşluk.",m:[["Boşluk Sürüngeni",86,1025162,27014,18751,3401,6801,3254230],["Yıldız Parçası",87,1051001,27314,18941,3639,7277,3664752],["Boşluk Gezgini",88,1077208,27615,19130,3894,7787,4126655],["Delik Gözcüsü",89,1103784,27917,19319,4166,8332,4646331],["Rüya Yiyen",90,1193168,29719,20860,4458,8915,5230957],["Zaman Hırsızı",91,1222357,30036,21062,4770,9539,5888598],["Kadim Bekçi",91,1233998,30036,21062,4770,9539,5944680],["Boşluğun Yutan Gözü",92,2243102,39433,26579,14800,29600,14382201]]},
{n:"Valdrenn Tahtı",req:93,ore:"Kadim",pw:4400,h:45,x:187,y:74,d:"Gölgelerin mirasının saklandığı son taht. Her yol buraya çıkar.",m:[["Taht Muhafızı",93,1197098,30652,21466,5461,10921,6972241],["Kadim Şövalye",94,1225780,30972,21668,5843,11686,7851789],["Gölge Cellat",95,1319980,32859,23291,6252,12504,8841425],["Lanetli Danışman",96,1350869,33193,23506,6690,13379,9954838],["Kemik Ejderha",97,1382200,33529,23722,7158,14316,11207408],["Hükümdarın Gölgesi",98,1413876,33867,23937,7659,15318,12616416],["Sonsuz Nöbetçi",99,1445962,34205,24153,8195,16390,14201279],["Kadim Kral Valdrenn",100,2753595,47022,32317,25429,50858,34357716]]}];
RG.forEach((r,ri)=>{r.id=ri;r.mobs=r.m.map((a,mi)=>({id:ri+"_"+mi,ri,mi,name:a[0],lv:a[1],hp:a[2],mx:a[2],atk:a[3],def:a[4],g:[a[5],a[6]],xp:a[7],el:mi==r.m.length-1}))});
const rgOf=l=>{let r=0;RG.forEach((g,i)=>{if(l>=g.req)r=i});return r};

/* ---------- IRKLAR (v2.7.0) ---------- */
const RACES={
 kul:{n:"Küllenmiş",s:"Kül Soyu",ic:"r_kul",m:{atk:4},bt:"+%4 Saldırı",pn:"Kor Öfkesi",pt:"Canın %50'nin altındayken verdiğin hasar %10 artar.",st:"Eski çağda yanıp yıkılmış bir halkın küllerinden doğdular. Içlerindeki kor hâlâ sönmedi."},
 gol:{n:"Gölgeoğlu",s:"Gölge Soyu",ic:"r_gol",m:{cr:5},bt:"+%5 Kritik Şansı",pn:"Gölge Vuruşu",pt:"Canı dolu bir düşmana yaptığın ilk vuruş %35 daha sert olur.",st:"Karanlıkta doğdular, gölgeyle birlikte yaşarlar. İlk vuruş, en keskin vuruştur."},
 tas:{n:"Taşdoğan",s:"Kaya Soyu",ic:"r_tas",m:{hp:6,arm:5},bt:"+%6 Maks. Can, +%5 Zırh",pn:"Taş Deri",pt:"Aldığın tüm hasar %4 azalır.",st:"Dağın kayasından yontulmuş gibi dururlar. Ağır, sakin ve yıkılması zor."},
 kem:{n:"Kemikli",s:"Mezar Soyu",ic:"r_kem",m:{hp:3},bt:"+%3 Maks. Can",pn:"Mezarın Direnci",pt:"Zehir hasarı %50 azalır. Ölümcül darbede %20 ihtimalle 1 canla ayakta kalırsın.",st:"Ölümle yarı yarıya bağ kurmuş mezarlık çocukları. Ölüm onları kolay almaz."},
 yir:{n:"Yırtıcı",s:"Bozkır Soyu",ic:"r_yir",m:{atk:3},bt:"+%3 Saldırı",pn:"Av Hissi",pt:"Canı %30'un altındaki düşmana +%15 hasar verirsin; verdiğin hasarın %3'ü kadar can çalarsın.",st:"Yarı insan, yarı canavar; vahşi doğada büyümüş avcılar. Yaralı avı asla kaçırmazlar."},
 fis:{n:"Fısıltılı",s:"Rün Soyu",ic:"r_fis",m:{mp:8,sk:6},bt:"+%8 Maks. Mana, Beceri Vuruşu +%6",pn:"Rün Yankısı",pt:"Yetenek kullanınca %8 ihtimalle maks. mananın %8'ini geri kazanırsın.",st:"Eski dilin rünlerini okuyabilen bilge halk. Büyü onlar için bir fısıltı kadar kolay."}
};
const raceMul=(p,m)=>{let k=1;const r=p.race;if(r==="kul"&&p.hp<p.maxHp*.5)k*=1.1;if(r==="gol"&&m.hp>=m.mx)k*=1.35;if(r==="yir"&&m.hp<m.mx*.3)k*=1.15;return k};
const TITLES=[
  {id:"t0",n:"Çaylak Maceracı",desc:"Yolculuğun başlangıcı",bonus:"Yok",b:{},chk:p=>true},
  {id:"t1",n:"Canavar Avcısı",desc:"50 canavar öldür",bonus:"+%5 Saldırı",b:{atk:5},chk:p=>p.st.k>=50},
  {id:"t2",n:"Elit Celladı",desc:"10 elit canavar öldür",bonus:"+%8 Kritik Şansı",b:{cr:8},chk:p=>p.st.e>=10},
  {id:"t3",n:"Kule Fatihi",desc:"Sonsuz Kule 15. kata çık",bonus:"+%10 Maksimum Can",b:{hp:10},chk:p=>p.tw>=15},
  {id:"t4",n:"Demir Ustası",desc:"20 başarılı yükseltme yap",bonus:"+%10 Fiziksel Zırh",b:{arm:10},chk:p=>(p.st.fok||0)>=20},
  {id:"t5",n:"Efsanevi Kahraman",desc:"40. seviyeye ulaş",bonus:"+%12 Saldırı & Zırh",b:{atk:12,arm:12},chk:p=>p.lv>=40},
  {id:"t6",n:"Karanlığın Efendisi",desc:"Kadim Kara Ejderha'yı yen",bonus:"+%15 Tüm Güç & +%5 Kritik",b:{atk:15,arm:15,hp:15,cr:5},chk:p=>!!p.boss[4]},
  {id:"t7",n:"Gölgelerin Mirasçısı",desc:"Kadim Kral Valdrenn'i yen",bonus:"+%20 Tüm Güç & +%8 Kritik",b:{atk:20,arm:20,hp:20,cr:8},chk:p=>!!p.boss[11]}
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

const MAXLV=100;
const reqXp0=l=>Math.floor(140*Math.pow(l,2.38)*(l>25?Math.pow(1.085,l-25):1)*(l>40?Math.pow(1.18,l-40):1));
const reqXp=l=>l>=MAXLV?1e15:l<50?reqXp0(l):Math.floor(reqXp0(49)*Math.pow(1.115,l-49));
function killXp(x,ml,pl){const d=pl-ml;if(d>=7)return 0;if(d>=4)return Math.floor(x*.25);if(d>=2)return Math.floor(x*.65);if(ml-pl>=6)return Math.floor(x*.35);return x}
const healAmt=p=>Math.floor((100+p.lv*30)*(1+p.at.int*.01));
const effLv=i=>i.rl;
const pw=i=>Math.floor(i.bp*G[i.g].m*(1+i.p*.12));

/* ---------- KADEMELER (1-50), SİLAH HASAR ARALIĞI VE HIZI, ÖZEL EFSUNLAR ---------- */
const TIERS=[1,5,10,15,20,25,30,35,40,45,50,55,60,65,70,75,80,85,90,95,100],TBP={1:25,5:38,10:62,15:92,20:130,25:180,30:250,35:340,40:440,45:550,50:650};
for(let t=55;t<=100;t+=5)TBP[t]=650+(t-50)*18;
const tierOf=lv=>{let t=1;for(const x of TIERS)if(x<=lv)t=x;return t};
const oreIx=rl=>rgOf(Math.max(1,rl));
const tierSuf=t=>{const o=oreIx(t),f=TIERS.filter(x=>oreIx(x)==o),k=f.indexOf(t);return k>0?" "+["","II","III"][k]:""};
/* Eşya adları (v2.12.0): silah her kademede özgün; diğer parçalar kademenin temasını taşır */
const ITW={
tank:["Yosun Tutmuş Pala","Kök Kesen Kılıç","Meşe Bekçisinin Yemini","Paslı Maden Baltası","Zehir Kırıcı","Kumtaşı Pala","Firavunun Cellat Kılıcı","Kırağı Dişi","Buzul Yarıcı","Ejderha Pulu Baltası","Yarık Bekçisi","Bataklık Ezici","Kemik Kırıcı Çekiç","Vitray Yarıcı","Çan Susturan","Yıldırım Hükmü","Zincir Kıran","Cehennem Dişi Pala","Boşluk Yarığı","Taht Muhafızının Hükmü","Valdrenn'in Son Yemini"],
mage:["Kurumuş Dal Asa","Ruh Meşesi Asası","Orman Ruhu Asası","Zehir Kristali Asa","Maden Fısıltısı","Kum Fırtınası Asası","Mumya Sarmalı Asa","Kırağı Düğümü","Ruh Dondurucu Asa","Kül Alevi Asası","Kıyamet Alevi","Sis Dokuyucu","Hortlak Rahibin Asası","Vitray Gözü","Çan Kulesi Asası","Bulut Yarıcı Asa","Kor Büyüsü Asası","Cehennem Kâhini","Yıldızsız Asa","Danışmanın Lanetli Asası","Mirasın Son Kıvılcımı"],
archer:["Çıtır Avcı Yayı","Tilki Kuyruğu Yayı","Haydut Avcısı","Mağara Yarasası Yayı","Zehirli Kiriş","Akbaba Gözü Yayı","Kum Yılanı Yayı","Kar Baykuşu Yayı","Buzul Kirişi","Magma Çıtası","Ejderha Kemiği Yayı","Sarmaşık Kirişi","Mezar Okçusu","Katedral Avcısı","Gece Gezgini Yayı","Rüzgâr Kartalı Yayı","Kül Okçusunun Yayı","Zincir Kirişli Yay","Yıldız Avcısı","Taht Avcısı","Son Ok"],
assassin:["Pas Tutmuş Bıçak","Orman Gölgesi","Kıl Payı","Zehirli Diş","Akrep Kuyruğu","Mezar Soyguncusunun Bıçağı","Kum Fısıltısı","Buz Dişi Hançer","Kırağı Kesiği","Kül Hançeri","Ejderha Pençesi","Sülük Bıçağı","Kemik Hançer","Karanlık Vitray","Sessiz Çan","Şimşek Dişi","Kor Hançer","Zincir Kesen","Zaman Hırsızı","Gölge Cellat","Gölgenin Son Fısıltısı"],
healer:["Rahip Çırağı Topuzu","Orman Duası Topuzu","Meşe Lütfu","Maden Şifacısı Topuzu","Arınma Topuzu","Güneş Mühürlü Topuz","Kutsal Mumya Asası","Kar Duası","Ruh Dindirici","Kutsal Kül Topuzu","Yarık Rahibinin Topuzu","Bataklık Şifacısı","Mezar Duası","Katedral Çanı Topuzu","Vitray Lütfu","Fırtına Duası","Kor Şifası","Cehennem Dindirici","Boşluk Işığı","Taht Rahibinin Topuzu","Valdrenn'in Son Duası"]};
const ITH={
tank:["Yosun Tutmuş","Kök Sarmış","Meşe Bekçisi","Paslı Maden","Zehir Kırıcı","Kumtaşı","Firavun Cellatı","Kırağı Dişli","Buzul Yarıcı","Ejderha Pullu","Yarık Bekçisi","Bataklık Ezici","Kemik Kırıcı","Vitray Yarıcı","Çan Susturan","Yıldırım Hükümlü","Zincir Kıran","Cehennem Dişli","Boşluk Yarığı","Taht Muhafızı","Son Yemin"],
mage:["Kurumuş Dal","Ruh Meşesi","Orman Ruhu","Zehir Kristali","Maden Fısıltılı","Kum Fırtınalı","Mumya Sarmalı","Kırağı Düğümlü","Ruh Dondurucu","Kül Alevli","Kıyamet Alevli","Sis Dokuyan","Hortlak Rahip","Vitray Gözlü","Çan Kuleli","Bulut Yaran","Kor Büyülü","Cehennem Kâhini","Yıldızsız","Lanetli Danışman","Mirasın Kıvılcımı"],
archer:["Çıtır Avcı","Tilki Kuyruklu","Haydut Avcısı","Yarasa Kanatlı","Zehirli Kirişli","Akbaba Gözlü","Kum Yılanı","Kar Baykuşu","Buzul Kirişli","Magma Çıtalı","Ejderha Kemiği","Sarmaşık Kirişli","Mezar Okçusu","Katedral Avcısı","Gece Gezgini","Rüzgâr Kartalı","Kül Okçusu","Zincir Kirişli","Yıldız Avcısı","Taht Avcısı","Son Ok"],
assassin:["Pas Tutmuş","Orman Gölgesi","Kıl Payı","Zehirli Diş","Akrep Kuyruklu","Mezar Soyguncusu","Kum Fısıltılı","Buz Dişli","Kırağı Kesikli","Kül Gölgesi","Ejderha Pençeli","Sülük","Kemik Gölgesi","Karanlık Vitray","Sessiz Çan","Şimşek Dişli","Kor Gölgesi","Zincir Kesen","Zaman Hırsızı","Gölge Cellat","Gölgenin Fısıltısı"],
healer:["Rahip Çırağı","Orman Duası","Meşe Lütuflu","Maden Şifacısı","Arınma","Güneş Mühürlü","Kutsal Mumya","Kar Duası","Ruh Dindirici","Kutsal Kül","Yarık Rahibi","Bataklık Şifacısı","Mezar Duası","Katedral Çanı","Vitray Lütuflu","Fırtına Duası","Kor Şifası","Cehennem Dindirici","Boşluk Işığı","Taht Rahibi","Son Dua"]};
const ITN={
tank:["Muhafız Kılıcı","Kule Kalkanı","Savaş Miğferi","Plaka Zırh","Dizlik","Demir Çizme","Yeminli Gerdanlık","Mühür Yüzüğü"],
mage:["Kadim Asa","Odak Küresi","Büyücü Tacı","Efsun Cübbesi","Rün Pantolonu","Astral Sandalet","Mana Kolyesi","Yıldız Yüzüğü"],
archer:["Av Yayı","Sadak & Bıçak","Avcı Kapüşonu","Deri Yelek","Pusu Pantolonu","İzci Çizmesi","Şahin Gözü Kolyesi","Nişancı Yüzüğü"],
assassin:["Gölge Hançeri","Bilek Bıçağı","Sessiz Maske","Gece Zırhı","Esnek Pantolon","Gölge Çizmesi","Engerek Gerdanlığı","Ölüm Yüzüğü"],
healer:["Kutsal Topuz","Dua Kitabı","Işık Tacı","Ruhban Cübbesi","Arınma Pantolonu","Kutsal Sandalet","Hayat Madalyonu","Lütuf Yüzüğü"]};
const mkName=(rc,si,t)=>{const k=TIERS.indexOf(t);if(k<0||!ITW[rc])return RG[oreIx(t)].ore+" "+CL[rc].it[si]+tierSuf(t);return si==0?ITW[rc][k]:ITH[rc][k]+" "+ITN[rc][si]};
const tierItem=(rc,si,t,g,af)=>({name:mkName(rc,si,t),setOre:RG[oreIx(t)].ore,slot:SL[si],rc,rl:t,g:g||1,p:0,bp:TBP[t],af:af||[]});
/* Milestone silahlar (Lv 10/30/50): düz vuruş (ba) ve beceri vuruşu (sk) ortalamasını artıran özel efsunlar */
const SPC={10:{ba:20,sk:12},30:{ba:35,sk:21},50:{ba:50,sk:30},75:{ba:65,sk:38},100:{ba:80,sk:45}};
const SPN={ba:"Düz Vuruş Ortalaması",sk:"Beceri Vuruşu Ortalaması"};
const spcRoll=(t,k,rng)=>Math.max(.1,Math.round(SPC[t][k]*Math.pow(rng.R(1),3)*10)/10);
const isSpcW=i=>i&&i.slot==="weapon"&&!!SPC[i.rl];
const rerollCost=i=>45+(i&&Array.isArray(i.af)?i.af.filter(a=>!a.l&&SPN[a.t]).length*i.rl*8:0);
/* Silaha özgü hız ve hasar aralığı (eşya verisinden formülle; eski silahlar da çalışır) */
const WSPD={tank:.8,mage:.9,archer:1.25,assassin:1.5,healer:.9};
function wInfo(i){
  if(!i)return{spd:1,sp:.15,min:0,max:0,avg:0};
  const ci=Object.keys(CL).indexOf(i.rc),ti=TIERS.indexOf(tierOf(i.rl));
  const spd=Math.round((WSPD[i.rc]||1)*(.92+.04*((ti*3+Math.max(0,ci))%5))*100)/100;
  const sp=Math.min(.4,Math.max(.12,.12+.3*(1.5-spd))),w=pw(i);
  return{spd,sp,avg:w,min:Math.max(1,Math.floor(w*(1-sp))),max:Math.ceil(w*(1+sp))};
}
const spdTxt=s=>s>=1.4?"Çok hızlı":s>=1.15?"Hızlı":s>=.95?"Orta":s>=.85?"Yavaş":"Ağır";
const wLine=i=>{const w=wInfo(i);return"Hasar "+w.min+"–"+w.max+" · Hız "+w.spd.toFixed(2)+" ("+spdTxt(w.spd)+")"};

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
let ba=0,sk=0,atk=20+pl.lv*3+(c.str*2.5+c.agi*1.5+c.int*2)*s,arm=10+c.vit*2*s,hp=c.hp+c.vit*15+lvHpBonus,mp=c.mp+c.int*10+lvMpBonus,cr=5+c.agi*.4+pl.lv*.1,pa=0,pd=0,php=0,pmp=0;
const a=pl.at,w=CW[pl.cls];atk+=a.str*w.str+a.dex*w.dex+a.int*w.int;arm+=a.vit*1.5+a.str*.4;hp+=a.vit*18;mp+=a.int*12;cr+=a.dex*.25;
SL.forEach(k=>{const i=pl.eq[k];if(!i||effLv(i)>pl.lv)return;const p=pw(i);
 if(k=="weapon")atk+=p;else if(k=="necklace")hp+=p*4;else if(k=="ring")mp+=p*3;else arm+=p;
 (i.af||[]).forEach(a=>{if(a.t=="atk")pa+=a.v;if(a.t=="def")pd+=a.v;if(a.t=="crit")cr+=a.v;if(k=="weapon"&&a.t=="ba")ba+=a.v;if(k=="weapon"&&a.t=="sk")sk+=a.v})});

// Set Bonusları
getActiveSetsOf(pl).forEach(st=>{pa+=st.atkPct;pd+=st.armPct;php+=st.hpPct;pmp+=st.mpPct;cr+=st.critAdd});

// Unvan Bonusları
const tb=getTitleBonusOf(pl);const rcm=(RACES[pl.race]||{}).m;if(rcm){pa+=rcm.atk||0;pd+=rcm.arm||0;php+=rcm.hp||0;pmp+=rcm.mp||0;cr+=rcm.cr||0;sk+=rcm.sk||0}
if(tb.atk)pa+=tb.atk;if(tb.arm)pd+=tb.arm;if(tb.hp)php+=tb.hp;if(tb.cr)cr+=tb.cr;

const fAtk=Math.floor(atk*(1+pa/100)),wp=pl.eq.weapon&&effLv(pl.eq.weapon)<=pl.lv?wInfo(pl.eq.weapon):null,wsp=wp?wp.sp:.15;
return{atk:fAtk,ba,sk,wsp,wspd:wp?wp.spd:1,minAtk:Math.max(1,Math.floor(fAtk*(1-wsp))),maxAtk:Math.max(1,Math.ceil(fAtk*(1+wsp))),arm:Math.floor(arm*(1+pd/100)),hp:Math.floor(hp*(1+php/100)),mp:Math.floor(mp*(1+pmp/100)),cr:Math.min(75,Math.floor(cr))}}


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
function towerMobOf(p,f){const r=rgOf(p.lv),b=f%5==0,t=RG[r].mobs[b?RG[r].mobs.length-1:f%(RG[r].mobs.length-1)],s=1+f*.07;
return{...t,id:"t"+f,lv:Math.min(105,p.lv+Math.floor(f/4)),hp:Math.floor(t.hp*s),mx:Math.floor(t.hp*s),atk:Math.floor(t.atk*s),def:Math.floor(t.def*s),xp:Math.floor(t.xp*s*.6),el:b,name:(b?"Kule Muhafızı ":"")+t.name+" · Kat "+f}}

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
  if(p.race==="tas")a=Math.max(8,Math.floor(a*.96));
  out.push({vig:1});
  if(B.sh>0){const b=Math.min(B.sh,a);B.sh-=b;a-=b;_lg(out,"🛡️ Kalkan <b style=color:#38bdf8>"+b+"</b> hasarı emdi")}
  if(a>0&&p.race==="kem"&&p.hp-a<=0&&rng.R(1)<.2){a=Math.max(0,p.hp-1);_lg(out,"💀 <b style=color:#e6b450>Mezarın Direnci</b>: ölümden döndün!")}
  if(a>0){p.hp=Math.max(0,p.hp-a);if(m.tr=="drain")m.hp=Math.min(m.mx,m.hp+Math.floor(a*.5));out.push({snd:"hit"});_lg(out,t?"💥 <b style=color:#f43f5e>[AĞIR DARBE]</b> "+a+" hasar aldın!":"🩸 "+a+" hasar aldın")}
}

/* Oyuncunun hamlesi: i=-1 temel saldırı, 0..3 yetenek. out.acted=false ise hamle yapılmadı (mana yok). */
function bAct(B,p,i,rng){
  const out=[];out.acted=false;
  const isBasic=i<0,c=CL[p.cls],s=isBasic?{n:"Temel saldırı",mp:0,m:1,dot:0}:c.sk[i],rk=isBasic?0:p.sr[i]||0,rm=(1+rk*.05)*(rk>=50?1.25:1);
  if(p.mp<s.mp){out.push({toast:"Yetersiz mana!"});return out}
  p.mp-=s.mp;out.acted=true;
  if(!isBasic&&p.race==="fis"&&rng.R(1)<.08){const g=Math.floor(p.maxMp*.08);p.mp=Math.min(p.maxMp,p.mp+g);_lg(out,"🔮 <b style=color:#c084fc>Rün Yankısı</b>: +"+g+" MP")}
  if(!isBasic)out.push({sk:i});
  const d=statsOf(p),m=B.mob;
  if(!isBasic&&s.i&&B.tele){B.tele=false;B.stun=true;B.armor=false;out.push({snd:"int"});_lg(out,"⚡ <b style=color:#e6b450>KESİNTİ!</b> Düşmanın hazırlığı bozuldu, tur kaybetti.");out.push({fx:["KESİNTİ!","#e6b450"]})}
  if(!isBasic&&s.heal){const h=healAmt(p);p.hp=Math.min(p.maxHp,p.hp+h);out.push({snd:"pot"});_lg(out,"💚 +"+h+" HP");out.push({fx:["+"+h,"#22c55e"]})}
  if(!isBasic&&s.sh){B.sh=Math.floor(p.maxHp*.35*rm);B.shT=3;_lg(out,"🛡️ Kalkan açtın ("+B.sh+")")}
  if(s.m>0){
    const ld=m.lv-p.lv,pen=ld>=3?Math.max(.25,1-(ld-2)*.12):1,spd=d.wspd,sp=isBasic?d.wsp:Math.max(.08,d.wsp*.7);
    let nh=1,hm=1;
    if(isBasic){if(spd>=1){hm=Math.pow(spd,-.85);if(rng.R(1)<spd-1)nh=2}else hm=Math.pow(1/spd,.35)}
    const bon=1+((isBasic?d.ba:d.sk)||0)/100;
    for(let h=0;h<nh&&m.hp>0;h++){
      if(isBasic)out.push({sk:-1});
      const rg=1-sp+rng.R(sp*2);
      let x=Math.floor(d.atk*rg*s.m*rm*hm*bon*(1-m.def/(m.def+200))*pen*raceMul(p,m)),gl=ld>=5&&rng.R(1)<.4;
      if(gl)x=Math.floor(x*.35);
      const cr=s.crit||rng.R(100)<d.cr;
      if(cr){x=Math.floor(x*1.8);out.push({snd:"crit"});out.push({ev:["crit",1]})}else out.push({snd:"hit"});
      if(B.armor)x=Math.floor(x*.6);
      x=Math.max(5,x);m.hp=Math.max(0,m.hp-x);p.st.d=Math.max(p.st.d,x);
      if(p.race==="yir"){const hl=Math.floor(x*.03);if(hl>0)p.hp=Math.min(p.maxHp,p.hp+hl)}
      out.push({ev:["dmg",x]});out.push({shake:1});out.push({fx:[cr?"💥"+x:x,cr?"#e6b450":"#fff"]});
      _lg(out,(cr?"⚡ ":"")+(gl?"🛡️ ":"")+s.n+(nh>1?" ("+(h+1)+"/"+nh+")":"")+": <b style=color:#e5484d>"+x+"</b> hasar");
    }
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
  if(B.pzT>0){const pzd=p.race==="kem"?Math.max(1,Math.floor(B.pz*.5)):B.pz;p.hp=Math.max(0,p.hp-pzd);B.pzT--;_lg(out,"🤢 Zehir: <b style=color:#a3e635>"+pzd+"</b> hasar");if(p.hp<=0)return out}
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
  const ks=Object.keys(CL),rc=rng.R(1)<.6?p.cls:ks[rng.RI(0,4)];let si=rng.RI(0,7),g=1,x=rng.R(100);
  const t=tierOf(m.ri!=null&&RG[m.ri]&&RG[m.ri].m[m.mi]?RG[m.ri].m[m.mi][1]:m.lv);
  if(m.el&&SPC[t]&&rng.R(1)<.5)si=0;
  if(m.el)g=x<=.5?5:x<=4?4:x<=22?3:x<=60?2:1;else g=x<=.4?5:x<=5?4:x<=18?3:x<=45?2:1;
  if(fg)g=Math.max(g,fg);
  const spc=si==0&&!!SPC[t];
  const ac=(()=>{const y=rng.R(100),n=y<=1?4:y<=5?3:y<=13?2:y<=28?1:0;return spc?Math.min(n,2):n})(),P0=[["atk","Saldırı Gücü"],["def","Zırh Direnci"],["crit","Kritik Vuruş"]],af=[];
  for(let n=0;n<ac;n++){const q=P0[rng.RI(0,2)];af.push({t:q[0],n:q[1],v:rng.RI(1,10),l:false})}
  if(spc)["ba","sk"].forEach(k=>af.push({t:k,n:SPN[k],v:spcRoll(t,k,rng),l:false}));
  const it=tierItem(rc,si,t,g,af);
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
  if(m.el&&!B.tw&&m.ri<RG.length-1&&!p.boss[m.ri+1])_lg(out,"🗝️ Yeni bölgenin kapısı açıldı!");
  while(p.xp>=reqXp(p.lv)&&p.lv<MAXLV){
    const prevHp=p.maxHp,prevMp=p.maxMp;p.xp-=reqXp(p.lv);p.lv++;p.sp+=2;p.ap+=3;
    out.push({ev:["lvl",p.lv]});out.push({snd:"lvl"});syncP(p);
    const dHp=p.maxHp-prevHp,dMp=p.maxMp-prevMp;
    out.push({toast:"🌟 Seviye "+p.lv+"! (+"+dHp+" HP, +"+dMp+" MP, +2 SP, +3 AP)"});
    p.hp=p.maxHp;p.mp=p.maxMp;
  }
  if(rng.R(1)<.16){const t=rng.R(1)<.5?"hp":"mp",r=rng.R(100),sz=r<65?"S":r<92?"M":"L",d=POT_DEF[t][sz];p.pot[t][sz]=(p.pot[t][sz]||0)+1;out.push({loot:{k:"pot",t:d.n,c:G[d.g].c}});_lg(out,`${d.e} 1× <b style=color:${G[d.g].c}>${d.n}</b> buldun`)}
  matDropOf(p,m,rng,out);
  if(B.tw){out.push({ev:["tower",B.tw]});p.tw=Math.max(p.tw,B.tw);if(B.tw%5==0){p.ch++;_lg(out,"🎁 Kat ödülü: sandık!")}}
  if(m.el?rng.R(100)<15:rng.R(100)<12){const n0=p.inv.length;out.push(...dropItem(p,m,0,rng));if(p.inv.length>n0)autoJunk(p,p.inv[p.inv.length-1],out)}
  syncP(p);
  return out;
}

/* Yenilgi: altın kaybı yok (2.4.1), can %30 */
function bLose(p){
  const l=0;p.st.dm++;p.stk=0;p.hp=Math.max(1,Math.floor(p.maxHp*.3));syncP(p);
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
/* Kilitli olmayan efsunları yeniden çevir (45 altın; özel efsun başına seviyeye göre ek ücret) */
function forgeReroll(p,loc,rng){
  const out=[];out.ok=false;const i=itemAt(p,loc);
  if(!i||!Array.isArray(i.af)||!i.af.length){out.push({toast:"Efsun yok"});return out}
  const cost=rerollCost(i);
  if(p.gold<cost){out.push({toast:"Yetersiz altın"});return out}
  p.gold-=cost;i.af.forEach(a=>{if(a.l)return;a.v=SPN[a.t]&&SPC[i.rl]?spcRoll(i.rl,a.t,rng):rng.RI(1,10)});
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
        const o=dropItem(p,RG[rgOf(p.lv)].mobs[0],3,rng);
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
const QS=[];RG.forEach((r,ri)=>[[0,8,40],[ri<5?5:4,6,70],[r.m.length-1,1,180]].forEach(([mi,n,g],k)=>QS.push({id:"q"+ri+[0,2,3][k],ri,mi,n,g:Math.floor(g*Math.pow(ri+1,1.6)),sc:k==2?1:0,t:r.m[mi][0]})));
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
/* Çöp kuralı (oyuncunun ayarı p.jr): kendi sınıfı için kalite ≤ g, başka sınıf için kalite ≤ og, efsun sayısı ≤ af, artı ≤ p.
   auto: 0 kapalı, 1 düşünce otomatik sat, 2 düşünce otomatik parçala. Kadim Elit (5) hiçbir zaman çöp sayılmaz. */
const jrOf=p=>{const r=(p&&p.jr)||{};const n=(v,lo,hi,d)=>Number.isInteger(v)&&v>=lo&&v<=hi?v:d;return{g:n(r.g,0,4,2),og:n(r.og,0,4,3),af:n(r.af,0,4,4),p:n(r.p,0,50,0),auto:n(r.auto,0,2,0)}};
const junkOf=(p,i)=>{const r=jrOf(p);return i.g<=4&&i.g<=(i.rc==p.cls?r.g:r.og)&&(Array.isArray(i.af)?i.af.length:0)<=r.af&&(i.p|0)<=r.p};
/* Savaştan düşen eşya kurala uyuyorsa ve otomatik mod açıksa hemen satılır/parçalanır */
function autoJunk(p,it,out){
  const r=jrOf(p);if(!r.auto||!it||!junkOf(p,it))return;
  const k=p.inv.lastIndexOf(it);if(k<0)return;
  p.inv.splice(k,1);
  if(r.auto===1){const v=sellV(it);p.gold+=v;out.push({junk:{a:1,g:v,n:1}});_lg(out,"🧹 Otomatik satıldı: "+it.name+" +"+v+"🪙")}
  else{const y=salvageYield(it);Object.entries(y).forEach(([m,v])=>{p.mat[m]=(p.mat[m]||0)+v;out.push({ev:["mat",v]})});out.push({junk:{a:2,g:0,n:1}});_lg(out,"🧹 Otomatik parçalandı: "+it.name+" "+Object.entries(y).map(([m,v])=>MT[m][0]+"+"+v).join(" "))}
}
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
const KZ={RACES,raceMul,bHit,MAXLV,rgOf,reqXp,TIERS,TBP,tierOf,tierItem,mkName,SPC,SPN,isSpcW,rerollCost,wInfo,wLine,spdTxt,jrOf,autoJunk,mkDo,MK_MINLV,healAmt,QS,QV,qpOf,evQ,killQ,questOut,rollDaily,sellV,junkOf,salvageYield,STK_SELL,ecoDo,SL,SN,CL,G,RG,TITLES,POT_DEF,CW,MT,TM,NT,reqXp,killXp,effLv,pw,getActiveSetsOf,getTitleBonusOf,statsOf,mkRng,seeded,forgeNeed,itemAt,forgeUpg,forgeReroll,chestOpen,syncP,towerMobOf,newBattle,bHit,bAct,bMobTurn,bPot,bAutoStep,dropItem,matDropOf,bWin,bLose};
(typeof globalThis!=="undefined"?globalThis:window).KZ=KZ;
if(typeof module!=="undefined"&&module.exports)module.exports=KZ;
