// Banco Orologi – server Cloudflare Worker che inoltra le richieste a Gemini.
// La chiave Gemini resta qui (variabile segreta GEMINI_API_KEY), mai nell'app.
// Variabili: GEMINI_API_KEY (segreta), APP_CODE (segreta, facoltativa),
// GEMINI_MODEL (facoltativa, predefinita "gemini-flash-latest"),
// ALLOWED_ORIGIN (facoltativa, predefinita "https://relo022.github.io").

export default {
  async fetch(req, env) {
    const origin = env.ALLOWED_ORIGIN || "https://relo022.github.io";
    const cors = {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, X-Codice",
      "Access-Control-Max-Age": "86400",
    };
    const reply = (obj, status = 200) =>
      new Response(JSON.stringify(obj), { status, headers: { ...cors, "Content-Type": "application/json" } });

    if (req.method === "OPTIONS") return new Response(null, { headers: cors });
    if (req.method !== "POST") return reply({ errore: "Usa POST" }, 405);
    if (req.headers.get("Origin") !== origin) return reply({ errore: "Origine non ammessa" }, 403);
    if (env.APP_CODE && req.headers.get("X-Codice") !== env.APP_CODE) return reply({ errore: "Codice non valido" }, 401);
    if (Number(req.headers.get("Content-Length") || 0) > 12_000_000) return reply({ errore: "Foto troppo grandi" }, 413);

    let body;
    try { body = await req.json(); } catch { return reply({ errore: "Richiesta non valida" }, 400); }
    const prompt = typeof body.prompt === "string" ? body.prompt.slice(0, 8000) : "";
    const images = Array.isArray(body.images) ? body.images.slice(0, 4) : [];
    if (!prompt) return reply({ errore: "Manca la domanda" }, 400);

    const parts = [{ text: prompt }];
    for (const im of images) {
      if (im && typeof im.data === "string" && /^image\/(jpeg|png|webp)$/.test(im.mime || "")) {
        parts.push({ inline_data: { mime_type: im.mime, data: im.data } });
      }
    }

    const model = env.GEMINI_MODEL || "gemini-flash-latest";
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": env.GEMINI_API_KEY },
      body: JSON.stringify({
        contents: [{ role: "user", parts }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.3 },
      }),
    });
    if (r.status === 429) return reply({ errore: "limite" }, 429);
    if (!r.ok) return reply({ errore: "Gemini ha risposto con errore " + r.status, dettaglio: (await r.text()).slice(0, 500) }, 502);

    const data = await r.json();
    const text = (data.candidates?.[0]?.content?.parts || []).map(p => p.text || "").join("");
    try { return reply({ risultato: JSON.parse(text) }); }
    catch { return reply({ errore: "Risposta non leggibile", testo: text.slice(0, 500) }, 502); }
  },
};
