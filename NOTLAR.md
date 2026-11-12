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
- `cloud.js`: Supabase hesap ve bulut kayıt (giriş, kayıt, eşitleme, çakışma sorusu)
- `img/`: sınıf görselleri (tank, mage, archer, assassin, healer .webp)
- `sql/kurulum.sql`: Supabase'e bir kez yapıştırılan veritabanı kodu (tablolar + erişim kuralları)

## Yol haritası
1. Dosyalara bölme (yapıldı, 1.1.0)
2. Hesap ve bulut kayıt (cihazlar arası aynı karakter): kod yazıldı (1.2.0), gerçek Supabase ile test bekliyor
3. Liderlik tablosu ve genel sohbet
4. Savaşın kritik kısımlarını sunucuya taşıma (hileyi önlemek için)
5. Oyuncular arası takas ve birlikte boss savaşı

## Bulut notları
- Giriş: kullanıcı adı + şifre. Kullanıcı adından sahte e-posta (`ad@kz-oyun.com`) üretiliyor. Supabase'te "Confirm email" KAPALI olmalı.
- Kayıt tek satırda tutuluyor (`saves` tablosu, `data` alanı = 5 yuva). `ts` alanı gerçek oyun kaydında güncellenir; `saveAll(true)` sadece cihaza yazar (can yenilenmesi, arka plan).
- Supabase publishable anahtarı kodda açık durabilir. `sb_secret_` ve `eyJ...` ile başlayan anahtarlar ASLA koda veya GitHub'a konmaz.
- Hile koruması yok: önemli hesaplamalar hâlâ istemcide. Takas/liderlik tablosundan önce sunucuya taşınmalı.

## Değişiklik günlüğü
- 1.2.0: Bulut hesap ve kayıt (cloud.js, sql/kurulum.sql). Cihaz değişince aynı karakter, 15 sn'de otomatik bulut kaydı, çakışmada "hangi kayıt kalsın" sorusu.- 1.1.0: Tek HTML dosyası index.html + style.css + game.js + img/ olarak bölündü. Kayıt yedeği kutusunun 2 saniyede silinmesi düzeltildi. Eski tek yuvalı kayıt (kz_rpg_v2) 1. yuvaya taşınıyor.
