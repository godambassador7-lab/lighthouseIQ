export default function handler(_req, res) {
  res.status(200).json({
    ok: true,
    db: false,
    mode: 'vercel-serverless'
  });
}
