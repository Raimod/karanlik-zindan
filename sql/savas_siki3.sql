-- ============================================================
-- Karanlık Zindan RPG: EKONOMİ KİLİDİ (aşama 3b, 2. adım)
-- Önce savas.sql (yeni sürüm) çalıştırılmış, battle fonksiyonu güncellenmiş ve yeni oyun dosyaları yüklenmiş olmalı.
-- Etkisi: altın, iksir, parşömen, sandık ve malzeme telefondan artırılamaz (yalnızca harcanır);
--         satış, parçalama, dükkân, görev ve günlük ödüller sunucuda hesaplanır.
-- Geri almak için: update public.kz_config set val = 2 where key = 'srv_lock';
-- ============================================================
update public.kz_config set val = 3 where key = 'srv_lock';
