-- ============================================================
-- Karanlık Zindan RPG: SAVAŞ KİLİDİ (aşama 3, en son adım)
-- Bunu yalnızca: savas.sql çalıştırıldı + "battle" fonksiyonu yüklendi + yeni oyun dosyaları GitHub'a yüklendi
-- ve savaş denemesi başarıyla çalıştıktan SONRA çalıştır.
-- Etkisi: seviye, tecrübe, kule katı, boss ve öldürme sayaçlarını artık yalnızca sunucudaki savaş değiştirebilir.
-- Geri almak için: update public.kz_config set val = 0 where key = 'srv_lock';
-- ============================================================
update public.kz_config set val = 1 where key = 'srv_lock';
