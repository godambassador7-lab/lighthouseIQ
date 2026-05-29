import { getNotices, isHealthcareNotice, readJson } from '../_lib/data.js';

export default function handler(_req, res) {
  const snapshot = readJson('alerts.json', null);
  if (snapshot && Array.isArray(snapshot.alerts)) {
    return res.status(200).json(snapshot);
  }

  const notices = getNotices()
    .filter(isHealthcareNotice)
    .slice(0, 50)
    .map((n) => ({
      notice_id: n.id,
      state: n.state,
      employer_name: n.employer_name || n.employerName || 'Unknown',
      parent_system: n.parent_system || n.parentSystem || null,
      facility_name: n.facility_name || null,
      notice_date: n.notice_date || n.noticeDate || null,
      effective_date: n.effective_date || n.effectiveDate || null,
      lead_time_days: null,
      expected_lead_days: null,
      early_warning: false,
      nursing_score: Number(n.nursing_score ?? n.nursingImpact?.score ?? 0),
      silent_signal_flag: false
    }));

  res.status(200).json({ alerts: notices, count: notices.length });
}

