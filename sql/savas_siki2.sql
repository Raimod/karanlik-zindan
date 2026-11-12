-- ============================================================
-- Karanlık Zindan RPG: EŞYA KİLİDİ (aşama 3b, 1. adım)
-- Önce savas.sql (yeni sürüm) çalıştırılmış, battle fonksiyonu güncellenmiş ve yeni oyun dosyaları yüklenmiş olmalı.
-- Etkisi: güçlü eşyalar (düz olmayanlar) yalnızca sunucudan gelir: savaş düşüşü, sandık, demirci.
-- Geri almak için: update public.kz_config set val = 1 where key = 'srv_lock';
-- ============================================================
update public.kz_config set val = 2 where key = 'srv_lock';
