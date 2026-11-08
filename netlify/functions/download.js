// Vérifie le paiement auprès de Stripe, puis donne un lien de téléchargement valable 1 heure.
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
// La liste des prods vient de public/beats.json (le même fichier que le site).
async function loadBeats(event) {
  const base = process.env.URL || ("https://" + (event.headers.host || ""));
  const r = await fetch(base + "/beats.json");
  const list = await r.json();
  return Object.fromEntries(list.map((b) => [b.id, b.t]));
}

exports.handler = async (event) => {
  const id = (event.queryStringParameters || {}).session_id;
  if (!id || !/^cs_[A-Za-z0-9_]+$/.test(id)) return { statusCode: 400, body: "{}" };
  try {
    const BEATS = await loadBeats(event);
    const r = await fetch("https://api.stripe.com/v1/checkout/sessions/" + id, {
      headers: { Authorization: "Bearer " + process.env.STRIPE_SECRET_KEY },
    });
    const s = await r.json();
    const { beat, license } = s.metadata || {};
    const recent = Date.now() / 1000 - s.created < 7 * 24 * 3600;
    if (!r.ok || s.payment_status !== "paid" || !recent || !BEATS[beat] || !["mp3", "wav"].includes(license))
      return { statusCode: 403, body: "{}" };
    const c = new S3Client({
      region: "auto",
      endpoint: "https://" + process.env.R2_ACCOUNT_ID + ".r2.cloudflarestorage.com",
      credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY },
    });
    const url = await getSignedUrl(c, new GetObjectCommand({
      Bucket: process.env.R2_BUCKET,
      Key: beat + "." + license,
      ResponseContentDisposition: 'attachment; filename="DIAZBEATS - ' + BEATS[beat].replace(/[^A-Za-z0-9 ]/g, "") + "." + license + '"',
    }), { expiresIn: 3600 });
    return { statusCode: 200, body: JSON.stringify({ url, title: BEATS[beat], license }) };
  } catch (e) {
    return { statusCode: 500, body: "{}" };
  }
};
