/* ============================================================
   HİKÂYE GÜNLÜĞÜ: "Valdrenn: Gölgelerin Mirası"
   Her bölgenin Elit Boss'u yenilince o bölümün sayfası açılır. Prolog en baştan okunur.
   Kayıt formatına dokunmaz: hangi sayfaların bildirildiği yalnızca bu cihazda (localStorage) tutulur.
   ============================================================ */
const STORY=[
{id:"pro",t:"Prolog: Çanlar Susmadan Önce",ic:"📜",at:-1,x:`Valdrenn'de bir çocuk doğduğunda ilk işi gölgesine bakmaktır. Gölge uzun ve koyuysa çocuk sağlıklı sayılır; solgunsa ebeler fısıldaşır, çünkü solgun gölge, Gölgelerin Mirası'nın seni seçtiğinin işaretidir.

Miras eski bir hikâyedir. Yüzyıllar önce Kral Valdrenn ölümden korkmuş, tahtının altına inen yedi kat taş merdivenin dibinde karanlık bir pazarlık yapmıştı. Bedeni toprağa karışacaktı ama gölgesi karışmayacaktı. Gölgesini on iki parçaya böldü, her parçayı bir mührle krallığın bir köşesine çaktı ve hepsini tahtına bağladı. Tahta oturan, gölgenin efendisi olacak; gölge de, o efendi var oldukça, ölmeyecekti. Kral bunun adına "miras" dedi. Halk buna kuyruğunu kendi yutan yılan dedi.

Sonra mühürler çatladı. Önce ormanın ağaçları geceleri fısıldamaya başladı. Sonra madenlerden sızan kara su kuyuları zehirledi. Çöl, bir sabah uyandığında kendi kralını hatırlamaya başlamıştı. Valdrenn'in çanları, kimse çalmadığı hâlde gece yarıları çalıyordu. Her çalışta bir köy biraz daha sessizleşti.

Altı halk, altı ayrı sebeple kapıya geldi. Küllenmişler, yanmış köylerinin külünden doğan öfkeyle geldi. Gölgeoğlular, kendi gölgelerinin gece bir başkasına benzediğini fark ettikleri için. Taşdoğanlar dağlarının kalbi sızladığı için. Kemikliler, yatmaları gereken yerlerden kalkıp yürüdükleri için. Yırtıcılar sürülerinin kokusunu kaybettikleri için. Fısıltılılar ise rünlerin artık kendi dillerinden başka bir dilde konuştuğunu duydukları için.

Orman kapısındaki eski çan bekçisi Aldrin hepsini aynı soruyla karşıladı:

— Gölgen sana ait mi, yolcu?

Sen, ister savaşçı ister büyücü, ister okçu, suikastçı ya da şifacı ol, bu soruya hiç düşünmeden "evet" dedin. Aldrin gülümsedi. Gölgene baktı ve gülümsemesi yarım kaldı.

— Bu kadar soluk bir gölgeyi son kez Kral'ın doğum yılında gördüm, dedi. Yürü. Çanlar susmadan yetiş.`},
{id:"r0",t:"Çırak Ormanı",ic:"🌲",at:0,x:`Yaşlı orman, yolcularını sevmezdi ama öldürmeyi de hevesle yapmazdı. Burada öğrendiğin ilk şey, canavarların da bir korkusu olduğuydu. Yaban domuzu çığlık atarak saldırırdı, çünkü ormandaki fısıltılar onu da ürkütüyordu. Haydut Reisi, ormana sığınmış bir adamdı. Sen onu yenince ceplerinden çıkan ilk şey bir çocuğun tahta atlısı oldu. Aldrin bunu görünce yüzünü çevirdi.

— Haydutlar da gölgelerini kaybetmiş insanlardır, dedi. Sadece kaybettiklerini geç anladılar.

İlk mührün kalıntısı Haydut Reisi'nin göğsündeydi: kara, sıcak, kalp gibi atan bir taş. Sen dokunduğun anda gölgen biraz koyulaştı. Birinci mühür kapandı.`},
{id:"r1",t:"Zehirli Madenler",ic:"⛏️",at:1,x:`Eski madencilerin terk ettiği galeriler sessizdi, çünkü zehir sesi de çürütür. Taş Gargoyl'lar duvarlardan sana baktı, Maden Golemi hiç durmadan aynı kazı hareketini yaptı; çünkü ona verilen son emir "daha derine" idi ve kimse onu iptal etmemişti. Derinde, Zehirli Kraliçe seni bekliyordu. Eskiden madenlerin üstünde bir aşçıydı; kral gölgesinin bir parçasını duvara çakarken aynı duvarın ardındaki sığınakta bir çocuk düşünerek ona karşı durmuştu. Kraliçe o çocuktu.

— Kral nereye bağlarsa orada kalırım, dedi. Ama sen yolun sonuna varabilirsen kimseye kalmayan bir şey bulursun: bir seçim.

İkinci mühür kapandı.`},
{id:"r2",t:"Batık Çöl Harabeleri",ic:"🏜️",at:2,x:`Kumun altındaki krallık Valdrenn'den bile eskiydi. Firavun Ruhu, kendi gölgesini kuma gömmüş ilk hükümdardı; bu yüzden çöl her gece ona geri çekilirdi. Mezar Soyguncusu seni görünce silahını bıraktı ve çok eski bir yazıtı gösterdi: "Tahta oturan gölgeyi kazanır. Gölge kazananı yutar." Yazıtın altındaki son satır silinmişti. Sen silinen satırı daha sonra, çok daha sonra, başka bir yerde okuyacaktın.

Üçüncü mühür kapandı.`},
{id:"r3",t:"Donmuş Ruhlar Zirvesi",ic:"🏔️",at:3,x:`Zirvede kar yağmazdı; kar zaten oradaydı ve yüzlerce yıldır kalkmayı reddediyordu. Her bir kar tanesi, kralın gölgesini bağlarken düşen bir ruhun son nefesiydi. Dondurulmuş Savaşçılar hiç yürümeden sana döndüler; çünkü onların savaşı hiç bitmemiş, sadece durmuştu. Kış Cadısı seni üşümeye başladığını görünce ateş yakmana izin verdi.

— Buz Devi'ni yenersen ruhlar özgür kalır, dedi. Yenmezsen yine de kalırlar. Fark şu ki bu sefer sen de onlara katılırsın.

Dördüncü mühür kapandı.`},
{id:"r4",t:"Ejderha Yarığı",ic:"🐉",at:4,x:`Dünyayı ikiye yaran yarık, kralın mühürlerinin en sert vurulduğu yerdi. Lav Golemleri bile burada kendi sıcaklıklarından korkardı. Ejderha Kâhini sana kül gibi gri bir gözle baktı ve üç şey söyledi: Kadim Kara Ejderha'nın kralın ilk mühürcüsü olduğunu, bir gece mührü çatlatmaya çalışıp yarığın açılmasına yol açtığını ve bu suçun bedelini her gece ateşle ödediğini. Ejderha seni görünce hemen saldırmadı; önce gölgene baktı. Sonra savaş başladı ve bu, o güne kadar yürüdüğün en sıcak savaştı.

Beşinci mühür kapandı.`},
{id:"r5",t:"Çürük Bataklık",ic:"🐸",at:5,x:`Sis, burada bir hava durumu değil, bir canlıydı. Sis Hortlağı yanına geldiğinde adını sorar gibi ürperdi; çünkü bataklık, üstüne basanın hatalarını yutardı. Bataklık Cadısı, Küllenmiş ve Kemikli yolcuların bir zamanlar çok sevdiği bir ninni mırıldanıyordu. Senin ninnin hangisiydi? Hatırlamadığını fark ettin. Çürümüş Hidra'nın başları sana aynı anda aynı soruyu sordu: "Kim seni çocuk yaparken gölgeni seçti?" Cevap veremedin. Ama ilk kez, bu sorunun bir cevabı olduğunu anladın.

Altıncı mühür kapandı.`},
{id:"r6",t:"Kemik Vadisi",ic:"💀",at:6,x:`Burada kimse ölmemişti; sadece bitmeyen savaşların cesetleri bir türlü toprağa karışmayı reddetmişti. Kemikli yolcuların bu vadide bir başka acısı vardı: cesetlerin hepsi tanıdıktı. İskelet Okçular yaylı sıra halinde durup geçişine izin verdiler, çünkü onlara verilen son emir "kralın yolunu aç" idi. Ölü Rahip seni selamladı ve yüzyıl önce kralın gölgesini bağlarken okunan duayı sana ezberden okudu. Dua bitince Kemik Kral kalkıp seni karşıladı: başında sadece bir taç vardı, çünkü başka hiçbir şey kalmamıştı.

Yedinci mühür kapandı.`},
{id:"r7",t:"Gölge Katedrali",ic:"⛪",at:7,x:`Çanların kendiliğinden çaldığı yer burasıydı; her çan vuruşu kralın gölgesinden bir nefes daha eksilmesiydi. Kara Rahibe, katedralin avlusunda gölgelere dua ederdi ve gölgeler ona cevap verirdi. Fısıltı Hayaleti sana bir fısıltıyla bir ismi kulaklarına bıraktı: kendi adını değil, kralın doğmadan önceki adını. Gölge Başpiskopos kapıyı senin için ardına kadar açtı.

— Tahta bir mirasçı geleceğini biliyorduk, dedi. Ama mirasçının bu kadar sessiz geldiğini bilmiyorduk.

Sekizinci mühür kapandı.`},
{id:"r8",t:"Fırtına Zirveleri",ic:"⚡",at:8,x:`Zirvelerin üzerinde şimşek hiç dinmezdi; çünkü kralın gölgesinin bir parçası göğe fırlatılmış ve geri düşecek yer bulamamıştı. Fırtına Okçusu sana ok atmadı; sadece okunu göğe doğrultup açık bıraktı ve şimşek senin yanına düştü. Fırtına Efendisi ile savaşırken fark ettin ki bulutların üstünde gölge yoktu. Orada sıfır gölge ile ilk kez rahat nefes aldın. Bu, bir uyarıydı: gölgesiz kalmak güzel bir şey değildi, sadece altındaki boşluğu gösteriyordu.

Dokuzuncu mühür kapandı.`},
{id:"r9",t:"Cehennem Dişleri",ic:"🔥",at:9,x:`Yerin dibinden yükselen kayalıklar zincirlerle örülüydü; zincirlerin bir ucu cehennemde, diğer ucu kraliçenin tacındaydı. Zincirli İblis sana yolu gösterdi, çünkü kendisi de bağlıydı ve açıkça hiç sevmiyordu. Cehennem Lordu bir başka sorunun cevabı gibi konuştu: "Ben kralın korkusundan doğdum. Sen onun hangi yanından doğdun?"

Onuncu mühür kapandı.`},
{id:"r10",t:"Kadim Boşluk",ic:"🌌",at:10,x:`Yıldızsız boşlukta zaman bir mağaza gibi açılıp kapanıyordu. Zaman Hırsızı sana yaşını sordu. Doğru cevabı veremedin; çünkü aynı anda hem çocuktun hem yaşlı. Kadim Bekçi, dünyanın en eski görevlisi, sana üç şey gösterdi: kralın bağlama törenini, o törende kullanılan yastık kadar küçük bir gölgeyi ve o gölgenin üzerinde yazılı bir ismi. İsim seninkiydi. Boşluğun Yutan Gözü'nü yenerken asıl savunduğun şey kendi geçmişindi.

On birinci mühür kapandı.`},
{id:"r11",t:"Valdrenn Tahtı",ic:"👑",at:11,x:`Son kapı açıldığında sessizlik çöktü. Taht Muhafızı, Kadim Şövalye, Gölge Cellat, Lanetli Danışman, Kemik Ejderha, Hükümdarın Gölgesi ve Sonsuz Nöbetçi. Her biri senden önce bu salonda aynı ölümü ölmüş biri gibi duruyordu. Hepsini geçtin ve tahtın önünde Kadim Kral Valdrenn ile yüz yüze geldin.

Kral beklenenden küçüktü. Bedeni yüzyıllar önce toprakla bir olmuştu; tahtın üstünde duran, yalnızca tek başına kalmış bir gölgeydi.

— Seni uzun süredir bekliyorum, dedi gölge. Çok uzun. Ben ölmeyi başaramadım, çünkü ben senin gölgendim.

Sen, gölgenin soluk, boş ve bir parça eksik olduğunu ilk kez anladın. Kral ölümden korkmuş ve doğmamış bir çocuğun gölgesini ödünç almıştı. O çocuk sendin. On iki mühür kralı değil, senin gölgeni on iki parçaya bölerek tutuyordu. Yolculuğun boyunca her mührü kapatırken asıl yaptığın şey kendi gölgeni toplamaktı.

— Taht senin, dedi kral. Oturursan gölge senindir; ama gölgenin efendisi tahtın kendisidir. Oturmazsan gölgeni geri alırsın, ben de nihayet ölürüm. Ama bunun bir bedeli vardır: gölge geri döndüğünde onu yürütecek olan yalnızca sensin.

On ikinci mühür kapandı.`},
{id:"epi",t:"Epilog: Miras",ic:"🌒",at:11,x:`Tahta oturmadın.

Kral gölgesi bir nefes gibi dağıldı ve on iki mühür aynı anda söndü. Gölgen sana döndü: uzun, koyu ve biraz fazla aç bir gölge. Valdrenn'in çanları çalmayı bıraktı. Ormanın ağaçları geceleri fısıldamayı unuttu, madenlerin suyu berraklaştı, çöl krallarını hatırlamayı bıraktı.

Aldrin seni kapıda bekliyordu. Gölgene baktı ve bu kez gülümsemesi yarım kalmadı.

— Bu kadar koyu bir gölgeyi hiç görmemiştim, dedi.

Ama gölge yeni bir şey öğrenmişti: yürümeyi. Gece olduğunda kendiliğinden, senden önce kapıdan çıkar, sana yön gösterirdi. Doğu yönünde, çok uzakta, hiç kimsenin yapmadığı bir kule belirmeye başladı. Her katı bir öncekinden yüksekti. Halk ona Sonsuz Kule dedi. Sen buna kendi gölgenin yeni bir yeri olduğunu anladın.

Bu, bir sonun hikâyesi değildi. Valdrenn'in mirası artık kralın değildi, senindi. Ve miras, hep olduğu gibi, kullanıldıkça büyüyen bir şeydi.`}
];
/* Bir sayfa açık mı: Prolog hep; bölge sayfaları o bölgenin Elit Boss'u yenilince */
const stOpen=s=>s.at<0||!!(P&&P.boss&&P.boss[s.at]);
const stKey=()=>"kz_story_"+(P&&P.name||"");
function stSeen(){try{return Math.max(0,parseInt(localStorage.getItem(stKey()))||0)}catch(e){return 0}}
function stMark(n){try{localStorage.setItem(stKey(),String(n))}catch(e){}}
const stCount=()=>STORY.filter(stOpen).length;
/* Yeni sayfa açıldıysa haber ver (ilk girişte Prolog'u kendiliğinden göster) */
function storyCheck(){
  if(typeof P==="undefined"||!P||!P.name||CB.on&&!CB.over)return;
  const n=stCount(),seen=stSeen();
  if(n<=seen)return;
  if(seen===0){stMark(n);setTimeout(()=>storyOpen(0),700);return}
  stMark(n);toast("📖 Hikâye günlüğüne yeni sayfa eklendi");
}
function storyHTML(s){return s.x.split("\n\n").map(p=>p.startsWith("—")?`<p style="margin:0 0 9px;font-style:italic;color:#f2c868">${escH(p)}</p>`:`<p style="margin:0 0 9px">${escH(p)}</p>`).join("")}
function storyOpen(i){
  const s=STORY[i];if(!s)return;
  $("ic").innerHTML=`<div class="ct" style="margin-bottom:8px">${s.ic} ${escH(s.t)}</div>
    <div style="max-height:56vh;overflow-y:auto;font-size:12.5px;line-height:1.55;-webkit-overflow-scrolling:touch;padding-right:4px">${storyHTML(s)}</div>
    <div style="display:flex;gap:6px;margin-top:10px"><button class="btn s" style="margin:0" onclick="storyList()">📖 Günlük</button><button class="btn" style="margin:0" onclick="closeM()">Kapat</button></div>`;
  $("im").style.display="flex";
}
function storyList(){
  const n=stCount();
  $("ic").innerHTML=`<div class="ct" style="margin-bottom:4px">📖 Hikâye Günlüğü</div><div class="mu" style="font-size:10.5px;margin-bottom:8px">${n}/${STORY.length} sayfa · Bir bölgenin Elit Boss'unu yenince o bölgenin sayfası açılır.</div>
    <div style="max-height:56vh;overflow-y:auto;-webkit-overflow-scrolling:touch">${STORY.map((s,i)=>stOpen(s)?`<div class="q" onclick="storyOpen(${i})" style="cursor:pointer;padding:7px 8px;margin-bottom:4px"><span style="width:26px;text-align:center">${s.ic}</span><b style="flex:1">${escH(s.t)}</b><span class="mu">▸</span></div>`:`<div class="q" style="padding:7px 8px;margin-bottom:4px;opacity:.5"><span style="width:26px;text-align:center">🔒</span><span style="flex:1" class="mu">${s.at>=0?"Sayfa kilitli: "+escH(RG[s.at].n)+" Elit Boss'unu yen":"Kilitli"}</span></div>`).join("")}</div>
    <button class="btn s" style="margin-top:8px" onclick="closeM()">Kapat</button>`;
  $("im").style.display="flex";
}
