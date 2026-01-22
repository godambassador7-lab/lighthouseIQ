export type USStateAbbrev =
  | 'AL' | 'AK' | 'AZ' | 'AR' | 'CA' | 'CO' | 'CT' | 'DE' | 'FL' | 'GA'
  | 'HI' | 'ID' | 'IL' | 'IN' | 'IA' | 'KS' | 'KY' | 'LA' | 'ME' | 'MD'
  | 'MA' | 'MI' | 'MN' | 'MS' | 'MO' | 'MT' | 'NE' | 'NV' | 'NH' | 'NJ'
  | 'NM' | 'NY' | 'NC' | 'ND' | 'OH' | 'OK' | 'OR' | 'PA' | 'RI' | 'SC'
  | 'SD' | 'TN' | 'TX' | 'UT' | 'VT' | 'VA' | 'WA' | 'WV' | 'WI' | 'WY'
  | 'DC' | 'PR';

export interface NormalizedWarnNotice {
  /** Stable ID: recommended = `${state}:${sourceId}:${noticeDate}:${employerName}` hashed */
  id: string;
  state: USStateAbbrev;
  employerName: string;
  /** Employer parent system if resolved (optional) */
  parentSystem?: string;
  /** City, county, and address are often partial in WARN */
  city?: string;
  county?: string;
  address?: string;
  /** Dates as ISO strings (YYYY-MM-DD) when known */
  noticeDate?: string;
  effectiveDate?: string;
  /** Integer affected employees when known */
  employeesAffected?: number;
  /** If state provides NAICS / industry code */
  naics?: string;
  /** Free-text reason / comments */
  reason?: string;
  /** Raw extracted text from PDFs/HTML (for classification/auditing) */
  rawText?: string;
  /** Where this came from */
  source: {
    state: USStateAbbrev;
    sourceName: string;
    sourceUrl: string;
    sourceId?: string;
    retrievedAt: string; // ISO timestamp
  };
  /** Attachments (PDF links etc.) */
  attachments?: Array<{ url: string; label?: string; contentType?: string }>;
  /** Nursing relevance scoring */
  nursingImpact?: {
    score: number; // 0-100
    label: 'Likely' | 'Possible' | 'Unclear';
    signals: string[];
    keywordsFound: string[];
    roleMix?: {
      rn: number;
      lpn: number;
      cna: number;
    };
    careSetting?: 'acute' | 'snf' | 'outpatient' | 'home' | 'behavioral' | 'unknown';
    specialties?: string[];
    explanations?: string[];
  };
}

export interface AdapterFetchResult {
  state: USStateAbbrev;
  fetchedAt: string; // ISO timestamp
  notices: NormalizedWarnNotice[];
}

export interface StateAdapter {
  state: USStateAbbrev;
  sourceName: string;
  sourceUrl: string;
  fetchLatest: () => Promise<AdapterFetchResult>;
}
