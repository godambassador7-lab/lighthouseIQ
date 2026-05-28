const { getNotices, filterNotices } = require('./_lib/data');

module.exports = function handler(req, res) {
  const notices = filterNotices(getNotices(), req.query || {});
  res.status(200).json({
    notices,
    nextCursor: null,
    cached: true,
    mode: 'vercel-serverless'
  });
};

