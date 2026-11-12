#!/bin/bash
# battle/index.ts üretir: engine.js + handler.js + deno_glue.ts (tek dosya, Supabase panelinde yapıştırılır)
D=$(cd "$(dirname "$0")" && pwd)
mkdir -p "$D/battle"
{ echo "// @ts-nocheck"; echo "// Karanlık Zindan: battle fonksiyonu. OTOMATİK ÜRETİLDİ (engine.js + edge/handler.js + deno_glue.ts)"; echo "// Oyun motoru (engine.js) değişirse bu dosya yeniden üretilip Supabase'e tekrar yüklenmeli."; cat "$D/../engine.js"; echo; cat "$D/handler.js"; cat "$D/deno_glue.ts"; } > "$D/battle/index.ts"
wc -c "$D/battle/index.ts"
