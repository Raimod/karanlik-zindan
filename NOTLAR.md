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
- Hile koruması yok: önemli hesaplamalar hâlâ istemcide. Takas/liderlik tablosundan önce sunucuya taşınmalı.

## Değişiklik günlüğü

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
 3. Edge Function `battle`: kaydı sunucudan okur, savaşı oynatır, ödülü sunucu kaydına yazar (kz_apply, sadece service_role)
 4. Telefon: savaş sonucunu sunucudan alır, log'u oynatır; kz_save sunucu alanlarını (xp, seviye, öldürme, kule, elit eşya, ödüller) değiştiremez
 5. Görev/sandık/satış/demirci kazançları sırayla sunucuya (aşama 3b)
Bilinen maliyet: internetsiz oynama biter, her savaş bir sunucu çağrısı (ücretsiz plan 500 bin çağrı/ay), oyun mantığı değişince Edge Function da güncellenmeli.
