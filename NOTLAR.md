# Karanlık Zindan RPG: Proje Notları

Bu dosya, projede çalışan herkesin (Berkay, Claude, Gemini, GPT) okuması için.

## Çalışma kuralları
1. Düzenlemeye başlamadan önce GitHub'daki **güncel** dosyaları oku. Eski kopyadan devam etme.
2. Sadece ilgili dosyayı değiştir. Tüm oyunu baştan yazma.
3. Değişiklik yapınca aşağıdaki "Değişiklik günlüğü"ne bir satır ekle ve `GAME_VERSION`'ı (game.js'in ilk satırı) ile `index.html` içindeki `?v=` numarasını artır. Böylece telefonlar eski dosyayı önbellekten açmaz.
4. Günlük görev/giriş sıfırlaması **bilerek** UTC'ye göre (Türkiye'de saat 03:00). Berkay istedi, değiştirme.

## Dosyalar
- `index.html`: sadece iskelet
- `style.css`: tasarım
- `game.js`: oyun kodu (savaş, eşya, görev, kayıt, arayüz)
- `engine.js`: oyunun veri tabloları ve formülleri (sınıflar, bölgeler, canavarlar, eşya gücü, XP, set/unvan, karakter gücü statsOf). Ekrandan bağımsız: document/window/P/toast YOK. Telefon (game.js'ten önce) ve ileride sunucu aynı dosyayı kullanır. Formülleri değiştirirsen SADECE burada değiştir
- `cloud.js`: Supabase hesap ve bulut kayıt (giriş, kayıt, eşitleme, çakışma sorusu)
- `img/`: sınıf görselleri (tank, mage, archer, assassin, healer .webp)
- `community.js`: Topluluk sekmesi (liderlik tablosu + genel sohbet). cloud.js'e bağlı, giriş gerekir
- `sql/topluluk.sql`: liderlik + sohbet tabloları (kurulum.sql'den SONRA Supabase'te çalıştırılır)
- `sql/koruma.sql`: hile koruması (sunucu her kayıtta altın/seviye/kule/eşya sınırlarını kontrol eder). topluluk.sql'den SONRA çalıştırılır; topluluk.sql tekrar çalıştırılırsa koruma.sql da tekrar çalıştırılmalı. Ayarlar kz_config tablosunda (guard_enabled=0 acil kapatma)
- `sql/sunucu.sql`: kayıt ve liderliğe doğrudan yazmayı kapatır; yazma yalnızca kz_save / kz_lb_refresh fonksiyonlarından geçer (en son çalıştırılır; kurulum/topluluk tekrar çalıştırılırsa bunu da tekrar çalıştır)
- `sql/savas.sql`: sunucu savaşı: kz_battle tablosu, kz_b_get/kz_b_put (yalnızca service_role), kz_lock_err. koruma.sql ve sunucu.sql'den SONRA çalıştırılır. Kilit `kz_config.srv_lock` (0 kapalı, 1 açık)
- `sql/savas_siki2.sql`: srv_lock=2 (eşya kilidi, savas_siki.sql'den sonra)
- `sql/savas_siki.sql`: srv_lock=1 yapar: seviye/tecrübe/kule/boss/öldürme-elit-kadim sayaçlarını yalnızca sunucu değiştirebilir (savaş denemesi çalıştıktan sonra çalıştırılır)
- `edge/handler.js`: battle fonksiyonunun mantığı (Node'da test edilir). `edge/deno_glue.ts`: Supabase bağlantısı. `edge/build.sh`: engine.js + handler.js + glue -> `edge/battle/index.ts` (Supabase panelinde yapıştırılan TEK dosya). engine.js değişirse build.sh çalıştırılıp fonksiyon yeniden yüklenmeli
- `sql/kurulum.sql`: Supabase'e bir kez yapıştırılan veritabanı kodu (tablolar + erişim kuralları)

## Yol haritası
1. Dosyalara bölme (yapıldı, 1.1.0)
2. Hesap ve bulut kayıt (cihazlar arası aynı karakter): yapıldı (1.2.0, gerçek cihazda doğrulandı)
3. Liderlik tablosu ve genel sohbet (kod yazıldı, 1.3.0, Supabase testi bekliyor)
4. Savaşın kritik kısımlarını sunucuya taşıma (hileyi önlemek için)
5. Oyuncular arası takas ve birlikte boss savaşı

## Bulut notları
- Giriş: kullanıcı adı + şifre. Kullanıcı adından sahte e-posta (`ad@kz-oyun.com`) üretiliyor. Supabase'te "Confirm email" KAPALI olmalı.
- Kayıt tek satırda tutuluyor (`saves` tablosu, `data` alanı = 5 yuva). `ts` alanı gerçek oyun kaydında güncellenir; `saveAll(true)` sadece cihaza yazar (can yenilenmesi, arka plan).
- Supabase publishable anahtarı kodda açık durabilir. `sb_secret_` ve `eyJ...` ile başlayan anahtarlar ASLA koda veya GitHub'a konmaz.
- Savaş (1.5.0+) Supabase Edge Function `battle` içinde oynanır; oyun `CLOUD.sb.functions.invoke('battle')` ile çağırır. İnternet ve giriş şart. Seviye/tecrübe/kule/boss/sayaçlar savas_siki.sql sonrası yalnızca sunucudan değişir.
- Hâlâ istemcide kalanlar (aşama 3b): görev/günlük ödül altını, sandık içeriği, satış, demirci, dükkan, iksir/malzeme sayıları. Altın ve eşya yine bütçe kurallarıyla sınırlı. Takas öncesi bunlar sunucuya taşınmalı.
- Sunucu savaş tempo sınırı: oyuncu hamlesi 250 ms, oto savaşta hamle başına 150 ms (kz_battle.lock_until).

## Değişiklik günlüğü

- 1.5.3: Karakter adında en az 3 harf (Türkçe harfler dahil) şartı; kullanıcı adında en az bir harf (sadece rakamla hesap açılamaz). Yalnızca istemci kontrolü (sunucuda yok, eski kayıtlar bozulmasın diye). Test: tests/t23.js.

- 1.5.2: Aşama 3b / 1. adım: eşya üretimi sunucuya taşındı. Demirci (yükseltme, efsun çevirme) ve sandık açma artık `battle` fonksiyonunun `forge` ve `chest` işlemleri (engine.js: forgeUpg, forgeReroll, chestOpen). Oyun işlemden önce bflush ile kaydı gönderir, sonucu ecoCall ile uygular. sql/savas.sql: kz_item_key, kz_items_err; sql/savas_siki2.sql srv_lock=2 yapar: çantadaki/kuşanılan her eşya ya önceki kayıtta aynen var olmalı (efsun kilidi `l` hariç) ya da düz (g=1, +0, efsunsuz, Tüccar türü) olmalı; güçlü eşya yalnızca sunucudan gelir. Kuşanma, atma, satma, efsun kilidi serbest. Testler: pgtest/t4.js (27), tests/t22.js (9). Hâlâ istemcide: altın/malzeme/iksir kazançları, görev ve günlük ödüller, satış geliri (aşama 3b/2).

- 1.5.1: Çağrı tasarrufu (50 kişilik test, ücretsiz plan 500 bin çağrı/ay): MANUEL savaş artık telefonda oynanır; sunucu `start` ile tohum (seed) verir, telefon engine.js'i `seeded(seed,k)` ile oynar, savaş bitince hamle listesi `finish` ile gider, sunucu aynı tohumla baştan oynatır, sonuç ve ödülü (sunucuya özel rastgelelikle) o belirler. Savaş başına ~1 çağrı; zaferde sonraki savaş (`next`) önceden hazırlanır, "Tekrar savaş" çağrısız. Hamle listesi tutmazsa reddedilir. Tempo: savaş başına en az 1.5 sn, hamle başına 200 ms (telefon kendisi bekler). Oto savaş 5-8 savaşı tek çağrıda oynar; manuel<->oto geçişi hamleleri `auto` ile taşır. Manuel savaş sürerken bulut kaydı bekletilir. Sohbet yenileme 4 sn -> 8 sn. Yeni test: tests/t21.js.

- 1.5.0: Aşama 3 / 3-4. adım: SAVAŞ SUNUCUDA OYNANIR. Edge Function `battle` (ops: start/act/pot/auto/end) engine.js'i kullanır, sonucu kaydın içine yazar (kz_b_put, hile korumasını ve updated_ms'i atlar). Oyun sonucu adım adım ekranda oynatır (bReplay). Oto savaş tek istekte 3-5 savaş oynatır (çağrı tasarrufu). Savaş öncesi bflush: kuşanma/satış gibi değişiklikler önce buluta gider. Savaş sırasında bulut kaydı bekletilir (battleBusy). Kilit hatasında sunucu kaydı otomatik yüklenir. Savaş için internet gerekir. Yeni testler: pgtest/t3.js (35, gerçek PostgreSQL), tests/t19.js (19, uçtan uca), tests/t20_deno.js. Eski testler (t1-t10, t18) için tests/legacy_patch.js yerel savaş kodunu enjekte eder.

- 1.4.2: Aşama 3 / 2. adım: savaş döngüsü (vuruş, canavar sırası, iksir, oto savaş, ödül, eşya düşürme, yenilgi) engine.js'e taşındı. Ekrana dokunmaz, olay listesi döndürür; rastgelelik rng parametresiyle. game.js bu olayları ekranda uygular. 60 karakter x 25 savaş (1500 savaş) eski sürümle karakter durumu ve savaş mesajlarında BİREBİR aynı doğrulandı (tests/t17.js). Node'da ekransız çalıştığı doğrulandı.
- 1.4.1: Aşama 3 hazırlığı: veri tabloları ve formüller game.js'ten engine.js'e taşındı. Oyun davranışı değişmedi (175 karakterde eski sürümle birebir doğrulandı). index.html engine.js'i game.js'ten önce yükler.
- 1.4.0: Aşama 2: sunucu kaydın sahibi. cloudPush -> rpc kz_save, comPushLb -> rpc kz_lb_refresh (liderlik kayıttan hesaplanır). Yeni hesaplar yalnızca yeni karakterle başlar (first_days=0). İki kayıt arası en az 5 sn (min_save_s); 'cok sik kayit' hatasında istemci sessizce yeniden dener.
- 1.3.4: Hile koruması aşama 1 (sql/koruma.sql): sunucu, kayıtlar arası geçen süreye göre mantıksız ilerlemeyi reddeder. Eşya sınırları: rl/bp bölge sınırı, sahte elit eşya (st.l) engeli. Liderlik değerleri kayıtlı veriyle uyuşmak zorunda. Yeni eşya kuralları takas aşamasında gözden geçirilmeli (kz_item_err).
- 1.3.3: Giriş zorunlu: hesapla giriş yapılmadan oyun açılmaz (cloud.js cloudGate). İstisna: daha önce giriş yapılmış cihaz çevrimdışıyken oynayabilir.
- 1.3.2: Kullanıcı adı sadece giriş ekranında; sohbet ve düğmelerde karakter adı görünür (sohbet adı liderlik tablosundaki karakterden gelir).
- 1.3.1: Sıralamada artık kullanıcı adı değil karakter adı görünür. Hata düzeltme: hesaptan çıkınca cihazdaki karakterler siliniyor (bulutta kalır), başka hesap açınca eski hesabın karakteri kopyalanmıyor.
- 1.3.0: Topluluk sekmesi: liderlik tablosu (Seviye/Kule/Elit, ilk 25) ve genel sohbet (4 sn'de yenilenir, 200 karakter, 2 sn hız sınırı, 7 gün saklama, kendi mesajını sil, 🔇 sustur). Alt menü 8 sekme. Not: değerler hâlâ istemciden geliyor, hile sunucu doğrulaması gelene kadar mümkün.
- 1.2.0: Bulut hesap ve kayıt (cloud.js, sql/kurulum.sql). Cihaz değişince aynı karakter, 15 sn'de otomatik bulut kaydı, çakışmada "hangi kayıt kalsın" sorusu.- 1.1.0: Tek HTML dosyası index.html + style.css + game.js + img/ olarak bölündü. Kayıt yedeği kutusunun 2 saniyede silinmesi düzeltildi. Eski tek yuvalı kayıt (kz_rpg_v2) 1. yuvaya taşınıyor.

## Aşama 3 planı: savaşı sunucuda oynat (karar verildi)
Neden: sunucu "savaş şu kadar sürede bitebilir" diyebilir ama gerçek hasarı bilemez; zaman kontrolü mevcut korumadan çok az iyi. Gerçek çözüm savaşı sunucuda oynatmak.
Yöntem: Supabase Edge Function (Deno) aynı engine.js'i kullanır. Savaş mantığı (act, mobTurn, hit, win ödülü, drop, matDrop, towerMob, otomatik iksir/yetenek) ekrandan ayrılıp engine.js'e taşınır; telefon sonucu sunucudan alıp ekranda oynatır.
Parçalar:
 1. Veri/formüller engine.js'e (YAPILDI, 1.4.1)
 2. Savaş döngüsü saf fonksiyona (rng parametreli), Node'da test; eski oyunla sonuç karşılaştırma (YAPILDI, 1.4.2)
 3. Edge Function `battle` + sql/savas.sql (YAPILDI, 1.5.0)
 4. Telefon sonucu oynatır; kz_save ilerleme alanlarını değiştiremez (savas_siki.sql) (YAPILDI, 1.5.0)
 5. Görev/sandık/satış/demirci kazançları sırayla sunucuya (aşama 3b)
Bilinen maliyet: internetsiz oynama biter, her savaş bir sunucu çağrısı (ücretsiz plan 500 bin çağrı/ay), oyun mantığı değişince Edge Function da güncellenmeli.


## 1.5.4
- Rakamlı kullanıcı adı kuralı geri alındı. Kullanıcı adları zaten benzersiz (Supabase Auth).
- Benzersiz karakter adı + küfür filtresi (sql/filtre.sql). Çalıştırma sırası: kurulum, topluluk, koruma, sunucu, savas, savas_siki, savas_siki2, filtre. sunucu.sql tekrar çalışırsa filtre.sql de tekrar çalıştırılmalı.
- Kelime eklemek: insert into public.kz_badwords(word,sub) values ('kelime',true);  (sub=true: kelime başka kelimenin içinde de yakalanır; false: sadece tam kelime)
- Sohbet mesajlarında da küfür engellenir.

## 1.5.5
- Karakter oluşturma ekranında uyarılar (ad alınmış, uygunsuz, eksik ad) ekranın arkasında kalıp görünmüyordu; bildirimler artık en üstte.

## 1.5.6
- index.html içindeki ?v= önbellek numarası 1.5.4/1.5.5'te güncellenmemişti, tarayıcı eski dosyaları gösteriyordu. Her sürümde index.html'deki ?v= numarasını da değiştir.

## 1.6.0 — Ekonomi sunucuda (aşama 3b-2)
- Yeni "eco" işlemi (battle fonksiyonu): satış, parçalama, toplu satış/parçalama, yığın satışı, iksir/parşömen alma,
  görev ödülü (bölge/meydan okuma/günlük), günlük giriş ödülü, günlük görev yenileme, çevrimdışı ödül ("sync").
- Görev ilerlemesi (öldürme, kritik, malzeme, kule...) savaş sırasında SUNUCUDA sayılır (engine.js: evQ/killQ/questOut).
- Çevrimdışı ödül sunucu saatine göre (kayıttaki "sts"). Günlük sıfırlama UTC (TR 03:00) aynen duruyor.
- Veritabanı: sql/savas.sql (yeni sürüm: kz_pristine, kz_eco_err) + sql/savas_siki3.sql (srv_lock=3).
  Kilit 3: altın/iksir/parşömen/sandık/malzeme telefondan sadece AZALIR; q, dl, sts telefondan değişmez.
- Geri almak: update public.kz_config set val = 2 where key = 'srv_lock';
- Edge Function'ı mutlaka yeniden yükle (edge/battle/index.ts = battle-index.ts), çünkü engine.js ve handler.js değişti.
- Kapsam dışı (hâlâ telefonda): Tüccar dükkânı eşya alımı, karakter yetenek/nitelik puanı, iksirin savaş dışı içilmesi
  (artık "iksir kullan" görevine sayılmaz), kaydı kod ile içe aktarma (kilit yine reddeder).
- Çalıştırma sırası: kurulum, topluluk, koruma, sunucu, savas, filtre, savas_siki, savas_siki2, savas_siki3.

## 1.7.0 — Paket A (hatalar)
- Silinen karakter sıralamadan düşer (sql/liderlik.sql; sunucu.sql tekrar çalışırsa liderlik.sql de tekrar çalıştırılır).
- + puan basınca artan üst sınır kadar can/mana da artar; iksir alınca/satınca can-mana çubuğu oynamaz (ecoCall yerel can/manayı korur).
- Oto savaş durdurulunca kalan oynatma beklemeden biter.
- iPhone: yatay kaydırma kapatıldı, viewport kilitli, ⛶ tam ekran düğmesi + manifest.json (iPhone'da Paylaş → Ana Ekrana Ekle).

## 1.8.0 — Paket B (denge)
- İksirler sabit: Can 150/400/900, Mana 60/180/400 (POT_DEF.amt). Şifacı Kutsal Lütuf: (100+30×seviye)×(1+Zeka×%1) can.
- Mana düştü: Tank 13/20/16/30, Okçu 14/16/23/40, Suikastçı 15/18/20/42.
- Pınar ücretli: 20 + 8×seviye altın; doluyken ücret alınmaz.
- Elit: sandık düşmez, 1 eşya; Kadim oranı %2.5 → %0.7 (el için: g4 %9, g3 %32, g2 %65). Kadim eşyada +level şartı artışı kaldırıldı.
- Koruma parşömeni seçimli (demirci panelinde kutucuk, varsayılan kapalı; sunucuya prot:true gider).
- Yetenek sıfırlama (seviye×30 altın), SP geri verilir.
- Edge Function yeniden yüklenmeli (engine.js değişti).

## 1.9.0 (Paket C)
- Elit: eşya düşme şansı %15, daha düşük kalite dağılımı.
- Sıralamada "Hasar" sekmesi (en yüksek tek vuruş), oyuncu arama, ilk 100 oyuncu, tıklayınca profil.
- İksir alırken miktar seçimi (1/5/10/25/50 veya yaz).
- "Çantadaki en iyileri kuşan" düğmesi.
- Otomatik savaşta otomatik iksir alma (ayarlardan aç/kapa).
- Çalıştırma sırası: Edge Function yeniden dağıt (battle-index.ts), SQL: savas.sql sonra liderlik.sql, dosyaları GitHub'a yükle.

## 2.0.0 (Paket D)
- Banka (Şehir → Banka): hesap başına ortak kasa, 100 ekipman + altın.
- Pazar: 24 saat açık tezgâh, %5 vergi, süresi dolanlar iade listesine düşer, sahibi çevrimdışı olsa da satış sürer.
- Takas: oyuncuya adıyla teklif (eşya/altın verip altın ve/veya eşya isteme, en çok 5 eşya), emanet sistemi, 24 saat.
- Hepsi sunucuda tek işlemde yapılır (kz_m_put): eşya kopyalanamaz. Pazar ve takas için seviye 5 gerekir.
- Yeni dosyalar: pazar.js, sql/pazar.sql. Çalıştırma: Edge Function yeniden dağıt, SQL'de sql/pazar.sql (savas.sql ve liderlik.sql zaten çalışmış olmalı), dosyaları GitHub'a yükle (pazar.js dahil!).
- Wiki güncellendi (Banka, Pazar, Takas, elit ödülü, sıralama, pratik araçlar).

## 2.1.0 (Paket E)
- Oto savaş sürerken diğer sekmelere bakılabilir (üstte mini şerit). Çanta/ekipman/nitelik değiştiren işlemler savaş sürerken kapalı.
- Savaş ekranının altı: Günlük + Kazanımlar (öldürülen, altın, XP, hasar, kritik, düşenler).
- Sandık ödülleri azaltıldı: altın ~yarıya, iksir paketi 1+1, nadir eşya %6, parşömen %6.
- Yeni SQL yok. Edge Function yeniden dağıtılmalı (battle-index.ts), dosyalar GitHub'a yüklenmeli.

## 2.2.0 (Paket F)
- Yeni karakter öğreticisi (ogretici.js): 6 adım, atlanabilir, Wiki'den tekrar açılır. P.tut alanı (0 = göster, 1 = bitti, yok = eski karakter, gösterme).
- Çöp kuralları (P.jr): kalite (kendi/başka sınıf), efsun sayısı, artı sınırı; Toplu Sat/Parçala bu kurala göre. Otomatik sat/parçala (savaşta düşünce).
- Savaş ekranı küçük telefonlarda sıkıştırıldı; Günlük/Kazanımlar alanı ekran boyuna göre büyür (kaydırma gerekmez).
- Yeni SQL yok. Yeni dosya: ogretici.js. Edge Function yeniden dağıtılmalı.

- 2.3.0 (Paket G): Tüccar Maren sabit ve kategorili (8 yuva sekmesi, sınıfım/tüm sınıflar). Eşyalar 11 kademede (1,5,10,…,50; engine.js TIERS/TBP/tierItem). Düşen eşyanın kademesi, canavarın bölgedeki seviyesinden gelir (kule/sandık da bölgeye göre). Silahlara hasar aralığı ve saldırı hızı eklendi (wInfo: sınıfa ve kademeye göre formülle, kayıtlı alan yok): hızlı silah temel saldırıda bazen 2 vuruş, yavaş silah tek ama sert vuruş. Lv 10/30/50 silahlar iki özel efsunla düşer (ba = düz vuruş %, sk = beceri %; üst sınırlar 20/12, 35/21, 50/30; değer = max·u³ ile çarpık). Çevirme ücreti = 45 + özel efsun başına seviye×8. sql/koruma.sql güncellendi (kz_item_err: yeni kademe sınırları, ba/sk efsun türleri) — SQL yeniden çalıştırılmalı.
- 2.3.0 (düzeltme): Tüccar yalnızca Lv 1 eşya satar (8 kategori sekmesi aynı); üst kademeler savaşta düşer.
- 2.4.0: Kor teması (style.css sonuna eklenen kurallar, kızıl-altın renkler). Yeni dosya gorsel.js: 20 canavar çizimi (MONS, anahtar bölge_canavar; game.js mobSVG artık buradan okur) ve emoji->SVG ikon çevirici (EMO tablosu + MutationObserver, sayfadaki emojileri otomatik ikona çevirir; tabloda olmayan emoji olduğu gibi kalır). Testlerde emoji metni aranıyorsa ikon yüzünden bulunamaz; onclick vb. ile ara.
