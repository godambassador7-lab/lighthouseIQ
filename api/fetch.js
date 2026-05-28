module.exports = function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
  return res.status(200).json({
    success: false,
    error: 'Live upstream fetch is not enabled in this deployment'
  });
};

