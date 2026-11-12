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
- `img/`: sınıf görselleri (tank, mage, archer, assassin, healer .webp)

## Yol haritası
1. Dosyalara bölme (yapıldı, 1.1.0)
2. Hesap ve bulut kayıt (cihazlar arası aynı karakter)
3. Liderlik tablosu ve genel sohbet
4. Savaşın kritik kısımlarını sunucuya taşıma (hileyi önlemek için)
5. Oyuncular arası takas ve birlikte boss savaşı

## Değişiklik günlüğü
- 1.1.0: Tek HTML dosyası index.html + style.css + game.js + img/ olarak bölündü. Kayıt yedeği kutusunun 2 saniyede silinmesi düzeltildi. Eski tek yuvalı kayıt (kz_rpg_v2) 1. yuvaya taşınıyor.
