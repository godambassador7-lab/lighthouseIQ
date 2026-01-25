/**
 * Export Nursing Programs Script
 *
 * Fetches accredited nursing programs from CCNE and CNEA and writes to static JSON.
 * Used by GitHub Actions to generate data for GitHub Pages.
 *
 * Output: public/data/programs.json
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

const ROOT_DIR = process.cwd();
const OUTPUT_DIR = path.join(ROOT_DIR, 'public', 'data');

const CCNE_STATE_URL_TEMPLATE = 'https://directory.ccnecommunity.org/reports/rptAccreditedPrograms_New.asp?state={STATE}';
const CNEA_DIRECTORY_URL = process.env.CNEA_DIRECTORY_URL ?? 'https://cnea.nln.org/accredited-programs';

const ALL_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC'
];
const STATE_SET = new Set(ALL_STATES);
const STATE_NAME_MAP: Record<string, string> = {
  ALABAMA: 'AL',
  ALASKA: 'AK',
  ARIZONA: 'AZ',
  ARKANSAS: 'AR',
  CALIFORNIA: 'CA',
  COLORADO: 'CO',
  CONNECTICUT: 'CT',
  DELAWARE: 'DE',
  FLORIDA: 'FL',
  GEORGIA: 'GA',
  HAWAII: 'HI',
  IDAHO: 'ID',
  ILLINOIS: 'IL',
  INDIANA: 'IN',
  IOWA: 'IA',
  KANSAS: 'KS',
  KENTUCKY: 'KY',
  LOUISIANA: 'LA',
  MAINE: 'ME',
  MARYLAND: 'MD',
  MASSACHUSETTS: 'MA',
  MICHIGAN: 'MI',
  MINNESOTA: 'MN',
  MISSISSIPPI: 'MS',
  MISSOURI: 'MO',
  MONTANA: 'MT',
  NEBRASKA: 'NE',
  NEVADA: 'NV',
  'NEW HAMPSHIRE': 'NH',
  'NEW JERSEY': 'NJ',
  'NEW MEXICO': 'NM',
  'NEW YORK': 'NY',
  'NORTH CAROLINA': 'NC',
  'NORTH DAKOTA': 'ND',
  OHIO: 'OH',
  OKLAHOMA: 'OK',
  OREGON: 'OR',
  PENNSYLVANIA: 'PA',
  'RHODE ISLAND': 'RI',
  'SOUTH CAROLINA': 'SC',
  'SOUTH DAKOTA': 'SD',
  TENNESSEE: 'TN',
  TEXAS: 'TX',
  UTAH: 'UT',
  VERMONT: 'VT',
  VIRGINIA: 'VA',
  WASHINGTON: 'WA',
  'WEST VIRGINIA': 'WV',
  WISCONSIN: 'WI',
  WYOMING: 'WY',
  'DISTRICT OF COLUMBIA': 'DC',
  'WASHINGTON DC': 'DC',
  'WASHINGTON D.C.': 'DC'
};

interface NursingProgram {
  id: string;
  institution_name: string;
  campus_name: string | null;
  city: string | null;
  state: string;
  program_level: 'ASN' | 'BSN' | 'MSN';
  credential_notes: string | null;
  accreditor: string;
  accreditation_status: string | null;
  source_url: string;
  school_website_url: string | null;
  nces_unitid: string | null;
  last_verified_date: string;
}

function generateProgramId(program: Partial<NursingProgram>): string {
  const key = `${program.institution_name}|${program.campus_name ?? ''}|${program.state}|${program.program_level}|${program.accreditor}`;
  return crypto.createHash('sha1').update(key).digest('hex').slice(0, 40);
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)));
}

function stripHtml(value: string): string {
  return decodeHtmlEntities(value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
}

function parseState(value: string | null | undefined): string | null {
  if (!value) return null;
  const normalized = value.trim().toUpperCase();
  if (STATE_SET.has(normalized)) return normalized;
  return STATE_NAME_MAP[normalized] ?? null;
}

function parseHtmlTable(html: string): string[][] {
  const rows: string[][] = [];
  const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let rowMatch: RegExpExecArray | null;
  while ((rowMatch = rowRegex.exec(html)) !== null) {
    const rowHtml = rowMatch[1];
    const cellRegex = /<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi;
    const cells: string[] = [];
    let cellMatch: RegExpExecArray | null;
    while ((cellMatch = cellRegex.exec(rowHtml)) !== null) {
      const cellText = stripHtml(cellMatch[1]);
      if (cellText) cells.push(cellText);
    }
    if (cells.length) rows.push(cells);
  }
  return rows;
}

function extractCmsField(html: string, fieldName: string): string {
  const pattern = new RegExp(`fs-cmsfilter-field="${fieldName}"[^>]*>([\\s\\S]*?)<\\/`, 'i');
  const match = html.match(pattern);
  return match ? stripHtml(match[1]) : '';
}

function extractProgramLevels(text: string): Array<'ASN' | 'BSN' | 'MSN'> {
  const lowered = text.toLowerCase();
  const levels = new Set<'ASN' | 'BSN' | 'MSN'>();
  if (lowered.includes('associate') || lowered.includes('adn') || lowered.includes('asn')) {
    levels.add('ASN');
  }
  if (lowered.includes('baccalaureate') || lowered.includes('bsn') || lowered.includes('bachelor')) {
    levels.add('BSN');
  }
  if (lowered.includes('master') || lowered.includes('msn')) {
    levels.add('MSN');
  }
  return Array.from(levels);
}

async function fetchWithTimeout(url: string, timeoutMs: number = 30000): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; NursingProgramsScraper/1.0)'
      }
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.text();
  } finally {
    clearTimeout(timeout);
  }
}

function parseCcneProgramsFromHtml(html: string, fallbackState: string): NursingProgram[] {
  const results: NursingProgram[] = [];
  const updatedAt = new Date().toISOString().slice(0, 10);
  const sections = html.split(/<table[^>]+id="finder"[^>]*>/i).slice(1);

  sections.forEach(section => {
    const tableEnd = section.indexOf('</table>');
    const finderBlock = tableEnd >= 0 ? section.slice(0, tableEnd + 8) : section;

    // Extract institution name from h3 tag
    const institutionMatch = finderBlock.match(/<h3[^>]*>([\s\S]*?)<\/h3>/i);
    const institution = institutionMatch ? stripHtml(institutionMatch[1]) : '';
    if (!institution) return;

    // Extract location
    const locationMatch = finderBlock.match(/([A-Za-z .'-]+),\s*([A-Z]{2})/);
    const city = locationMatch?.[1]?.trim() || null;
    const state = locationMatch?.[2] || fallbackState;

    // Extract website
    const websiteMatch = finderBlock.match(/<a[^>]+href=([^\s>]+)[^>]*>Link to Website/i);
    const website = websiteMatch ? websiteMatch[1].replace(/['"]/g, '') : null;

    // Extract program levels from program names
    const programNames = new Set<string>();
    const programMatches = Array.from(section.matchAll(/<h3><b>([^<]+)<\/b><\/h3>/gi));
    programMatches.forEach(match => {
      const programName = stripHtml(match[1]).trim();
      if (programName) programNames.add(programName);
    });

    // If no specific programs found, try to extract from the whole block
    if (!programNames.size) {
      const fallbackLevels = extractProgramLevels(stripHtml(finderBlock));
      fallbackLevels.forEach(level => {
        const program: NursingProgram = {
          id: '',
          institution_name: institution,
          campus_name: null,
          city,
          state,
          program_level: level,
          credential_notes: null,
          accreditor: 'CCNE',
          accreditation_status: null,
          source_url: CCNE_STATE_URL_TEMPLATE.replace('{STATE}', state),
          school_website_url: website,
          nces_unitid: null,
          last_verified_date: updatedAt
        };
        program.id = generateProgramId(program);
        results.push(program);
      });
      return;
    }

    // Create records for each program
    programNames.forEach(programName => {
      const programLevels = extractProgramLevels(programName);
      if (!programLevels.length) return;

      programLevels.forEach(level => {
        const program: NursingProgram = {
          id: '',
          institution_name: institution,
          campus_name: null,
          city,
          state,
          program_level: level,
          credential_notes: programName || null,
          accreditor: 'CCNE',
          accreditation_status: null,
          source_url: CCNE_STATE_URL_TEMPLATE.replace('{STATE}', state),
          school_website_url: website,
          nces_unitid: null,
          last_verified_date: updatedAt
        };
        program.id = generateProgramId(program);
        results.push(program);
      });
    });
  });

  return results;
}

function parseCneaProgramsFromHtml(html: string): NursingProgram[] {
  const results: NursingProgram[] = [];
  const updatedAt = new Date().toISOString().slice(0, 10);
  const itemRegex = /<div[^>]*class="w-dyn-item"[^>]*>([\s\S]*?)(?=<div[^>]*class="w-dyn-item"|<\/div>\s*<\/div>\s*<\/div>)/gi;
  let match: RegExpExecArray | null;
  let sawCms = false;

  while ((match = itemRegex.exec(html)) !== null) {
    sawCms = true;
    const block = match[1];
    const institution = extractCmsField(block, 'institution')
      || extractCmsField(block, 'institution-name')
      || extractCmsField(block, 'school')
      || extractCmsField(block, 'school-name')
      || extractCmsField(block, 'governing-org');
    const program = extractCmsField(block, 'program')
      || extractCmsField(block, 'program-name')
      || extractCmsField(block, 'program-type')
      || extractCmsField(block, 'degree')
      || extractCmsField(block, 'degree-level')
      || extractCmsField(block, 'program-level');
    const city = extractCmsField(block, 'city') || '';
    const stateRaw = extractCmsField(block, 'state') || '';
    const location = extractCmsField(block, 'location')
      || extractCmsField(block, 'city-state');
    const status = extractCmsField(block, 'status')
      || extractCmsField(block, 'accreditation-status')
      || extractCmsField(block, 'accreditation');

    let state = parseState(stateRaw);
    let resolvedCity: string | null = city || null;

    if (!state && location) {
      const locationMatch = location.match(/(.+?),\s*([A-Z]{2})\b/);
      if (locationMatch) {
        resolvedCity = resolvedCity || locationMatch[1].trim();
        state = parseState(locationMatch[2]);
      }
    }

    if (!institution || !state) continue;
    const programLevels = extractProgramLevels(program || '');
    if (!programLevels.length) continue;

    programLevels.forEach(level => {
      const programRecord: NursingProgram = {
        id: '',
        institution_name: institution,
        campus_name: null,
        city: resolvedCity,
        state,
        program_level: level,
        credential_notes: program || null,
        accreditor: 'CNEA',
        accreditation_status: status || null,
        source_url: CNEA_DIRECTORY_URL,
        school_website_url: null,
        nces_unitid: null,
        last_verified_date: updatedAt
      };
      programRecord.id = generateProgramId(programRecord);
      results.push(programRecord);
    });
  }

  if (results.length || sawCms) return results;

  const rows = parseHtmlTable(html);
  if (!rows.length) return results;

  const header = rows[0].map(cell => cell.toLowerCase());
  const hasHeader = header.some(cell =>
    cell.includes('state') || cell.includes('institution') || cell.includes('program')
  );
  const startIndex = hasHeader ? 1 : 0;
  const findHeader = (key: string) => header.findIndex(cell => cell.includes(key));
  const idxInstitution = hasHeader ? findHeader('institution') : -1;
  const idxProgram = hasHeader ? findHeader('program') : -1;
  const idxCity = hasHeader ? findHeader('city') : -1;
  const idxState = hasHeader ? findHeader('state') : -1;
  const idxStatus = hasHeader ? findHeader('status') : -1;
  const idxWebsite = hasHeader ? findHeader('website') : -1;

  for (let i = startIndex; i < rows.length; i += 1) {
    const cells = rows[i];
    if (!cells.length) continue;
    const institution = (idxInstitution >= 0 ? cells[idxInstitution] : cells[0])?.trim();
    if (!institution) continue;
    const program = (idxProgram >= 0 ? cells[idxProgram] : cells[1] ?? '').trim();
    const city = (idxCity >= 0 ? cells[idxCity] : cells[2] ?? '').trim();
    const state = parseState(idxState >= 0 ? cells[idxState] : cells[3]);
    if (!state) continue;
    const status = idxStatus >= 0 ? cells[idxStatus] : '';
    const website = idxWebsite >= 0 ? cells[idxWebsite] : '';
    const programLevels = extractProgramLevels(`${program} ${status}`);
    if (!programLevels.length) continue;

    programLevels.forEach(level => {
      const programRecord: NursingProgram = {
        id: '',
        institution_name: institution,
        campus_name: null,
        city: city || null,
        state,
        program_level: level,
        credential_notes: program || null,
        accreditor: 'CNEA',
        accreditation_status: status || null,
        source_url: CNEA_DIRECTORY_URL,
        school_website_url: website || null,
        nces_unitid: null,
        last_verified_date: updatedAt
      };
      programRecord.id = generateProgramId(programRecord);
      results.push(programRecord);
    });
  }

  return results;
}

async function fetchCcnePrograms(): Promise<NursingProgram[]> {
  const results: NursingProgram[] = [];
  const concurrency = 4;
  let index = 0;
  let completed = 0;

  async function worker() {
    while (index < ALL_STATES.length) {
      const state = ALL_STATES[index++];
      const url = CCNE_STATE_URL_TEMPLATE.replace('{STATE}', state);
      try {
        const html = await fetchWithTimeout(url, 45000);
        const programs = parseCcneProgramsFromHtml(html, state);
        results.push(...programs);
        completed++;
        console.log(`  ✓ ${state}: ${programs.length} programs (${completed}/${ALL_STATES.length})`);
      } catch (err: any) {
        completed++;
        console.warn(`  ✗ ${state}: ${err?.message || err} (${completed}/${ALL_STATES.length})`);
      }
    }
  }

  console.log(`\nFetching CCNE programs from ${ALL_STATES.length} states...\n`);

  const workers = Array.from({ length: concurrency }, () => worker());
  await Promise.all(workers);

  return results;
}

async function fetchCneaPrograms(): Promise<NursingProgram[]> {
  if (!CNEA_DIRECTORY_URL) return [];
  try {
    const html = await fetchWithTimeout(CNEA_DIRECTORY_URL, 60000);
    return parseCneaProgramsFromHtml(html);
  } catch (err: any) {
    console.warn(`  âœ— CNEA: ${err?.message || err}`);
    return [];
  }
}

function ensureDirectories() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
}

function writeJsonFile(filePath: string, data: any) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`  Written: ${path.relative(ROOT_DIR, filePath)}`);
}

async function main() {
  console.log('='.repeat(60));
  console.log('Nursing Programs Export');
  console.log('='.repeat(60));
  console.log(`Started at: ${new Date().toISOString()}`);

  ensureDirectories();

  const startTime = Date.now();
  const ccnePrograms = await fetchCcnePrograms();
  const cneaPrograms = await fetchCneaPrograms();
  const programs = [...ccnePrograms, ...cneaPrograms];
  const duration = Date.now() - startTime;

  // Deduplicate by ID
  const uniquePrograms = Array.from(
    new Map(programs.map(p => [p.id, p])).values()
  );

  console.log('\n' + '='.repeat(60));
  console.log('Writing output files...\n');

  writeJsonFile(path.join(OUTPUT_DIR, 'programs.json'), {
    programs: uniquePrograms,
    count: uniquePrograms.length,
    sources: [
      { name: 'CCNE', url: CCNE_STATE_URL_TEMPLATE },
      { name: 'CNEA', url: CNEA_DIRECTORY_URL }
    ],
    lastUpdated: new Date().toISOString()
  });

  console.log('\n' + '='.repeat(60));
  console.log('Export Complete!');
  console.log('='.repeat(60));
  console.log(`Total programs: ${uniquePrograms.length}`);
  console.log(`Duration: ${(duration / 1000).toFixed(1)}s`);
  console.log(`Finished at: ${new Date().toISOString()}`);
}

main().catch(err => {
  console.error('Export failed:', err);
  process.exit(1);
});
