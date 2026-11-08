// Crée une session de paiement Stripe. Les prix sont fixés ici, côté serveur.
const PRICES = { mp3: 1500, wav: 2500 }; // en centimes de dollar
// La liste des prods vient de public/beats.json (le même fichier que le site).
async function loadBeats(event) {
  const base = process.env.URL || ("https://" + (event.headers.host || ""));
  const r = await fetch(base + "/beats.json");
  const list = await r.json();
  return Object.fromEntries(list.map((b) => [b.id, b.t]));
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "{}" };
  try {
    const BEATS = await loadBeats(event);
    const { beat, license, consent } = JSON.parse(event.body || "{}");
    if (consent !== true) return { statusCode: 400, body: JSON.stringify({ error: "consent" }) };
    if (!BEATS[beat] || !PRICES[license]) return { statusCode: 400, body: JSON.stringify({ error: "invalid" }) };
    const origin = process.env.URL || event.headers.origin;
    const p = new URLSearchParams({
      mode: "payment", locale: "fr",
      success_url: origin + "/merci.html?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: origin + "/#prods",
      "line_items[0][quantity]": "1",
      "line_items[0][price_data][currency]": "usd",
      "line_items[0][price_data][unit_amount]": String(PRICES[license]),
      "line_items[0][price_data][product_data][name]": BEATS[beat] + " (licence " + license.toUpperCase() + ")",
      "metadata[beat]": beat, "metadata[license]": license,
      "metadata[consent]": "telechargement immediat, renonciation retractation, CGV acceptees", "metadata[consent_at]": new Date().toISOString(),
    });
    const r = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: { Authorization: "Bearer " + process.env.STRIPE_SECRET_KEY, "Content-Type": "application/x-www-form-urlencoded" },
      body: p,
    });
    const s = await r.json();
    if (!r.ok) return { statusCode: 502, body: JSON.stringify({ error: "stripe" }) };
    return { statusCode: 200, body: JSON.stringify({ url: s.url }) };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: "server" }) };
  }
};
