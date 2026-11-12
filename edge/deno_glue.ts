
/* ---------- Supabase / Deno bağlantısı ---------- */
import { createClient } from "npm:@supabase/supabase-js@2";
const CORS: Record<string,string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const J = (o: unknown, st = 200) => new Response(JSON.stringify(o), { status: st, headers: { ...CORS, "Content-Type": "application/json" } });
function svcKey(): string {
  const legacy = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (legacy) return legacy;
  try { const j = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") || "null"); if (j && j.default) return j.default; } catch (_) { /* yok */ }
  return "";
}
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
  try {
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, svcKey(), { auth: { persistSession: false } });
    const token = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
    const { data, error } = await sb.auth.getUser(token);
    if (error || !data || !data.user) return J({ err: "giris_gerekli" }, 401);
    const body = await req.json();
    const db = {
      get: async (uid: string) => { const r = await sb.rpc("kz_b_get", { p_uid: uid }); if (r.error) throw r.error; return r.data; },
      put: async (uid: string, rev: string, slot: number, pslot: unknown, b: unknown, lockMs: number) => {
        const r = await sb.rpc("kz_b_put", { p_uid: uid, p_rev: rev, p_slot: slot, p_pslot: pslot, p_b: b, p_lock_ms: lockMs });
        if (r.error) throw r.error;
      },
    };
    const out = await kzBattleHandle((globalThis as any).KZ, db, data.user.id, body, {});
    return J(out);
  } catch (e) {
    return J({ err: "sunucu_hatasi", msg: String((e as any)?.message || e) }, 500);
  }
});
