"use strict";

const fs = require("fs");
const path = require("path");
const https = require("https");

const sourceUrl = "https://recruit.hirebridge.com/v3/Jobs/list.aspx?bid=5&cid=8116";
const appRoot = path.resolve(__dirname,"..");
const outputFile = path.join(appRoot,"data","brightpath-jobs.json");
const historyFile = path.join(appRoot,"data","brightpath-jobs-history.json");
const locationsFile = path.join(appRoot,"data","busy-bees-us-locations.json");

function get(url) { return new Promise((resolve,reject) => https.get(url,response => { if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) return resolve(get(new URL(response.headers.location,url).href)); if (response.statusCode !== 200) return reject(new Error(`Request failed: ${response.statusCode}`)); let body=""; response.setEncoding("utf8"); response.on("data",chunk => { body += chunk; }); response.on("end",() => resolve(body)); }).on("error",reject)); }
function decode(value) { return String(value).replace(/<[^>]+>/g," ").replace(/&amp;/g,"&").replace(/&#39;|&apos;/g,"'").replace(/&quot;/g,'"').replace(/\s+/g," ").trim(); }
function normalize(value) { return String(value).toLowerCase().replace(/\b(center|centre|school|location|bp)\b/g,"").replace(/[^a-z0-9]/g,""); }
function family(title,department) { const text=`${title} ${department}`; if (/director|administration|manager/i.test(text)) return "Leadership"; if (/teacher|educator|classroom/i.test(text)) return "Education"; if (/cook|kitchen|driver|maintenance|clean|facilities/i.test(text)) return "Support"; return "Corporate & other"; }
function priorityBase(job) { const text=`${job.title} ${job.department}`; if (/center director/i.test(text)) return [80,"Center leadership vacancy"]; if (/associate|assistant director/i.test(text)) return [75,"Center leadership vacancy"]; if (/area director/i.test(text)) return [73,"Multi-center leadership role"]; if (/lead.*teacher|teacher.*lead/i.test(text)) return [70,"Lead classroom coverage"]; if (/certified|pre-k|preschool|infant|toddler/i.test(text) && /teacher/i.test(text)) return [66,"Specialized classroom coverage"]; if (/assistant teacher|teacher|educator/i.test(text)) return [58,"Classroom coverage"]; if (/cook|driver|maintenance|facilities/i.test(text)) return [48,"Center operations coverage"]; if (/director|manager/i.test(text)) return [52,"Functional leadership role"]; return [40,"General organizational role"]; }

(async () => {
  const html = await get(sourceUrl);
  const portfolio = fs.existsSync(locationsFile) ? JSON.parse(fs.readFileSync(locationsFile,"utf8")).locations || [] : [];
  const stateHints = { belred:"WA", dallasfortwortharea:"TX", cincinnatioh:"OH", generalareaakronoh:"OH", generalareachicagoil:"IL", montgomerynj:"NJ", windsortct:"CT" };
  function inferState(location) { const key=normalize(location); if (stateHints[key]) return stateHints[key]; const direct=portfolio.find(item => normalize(item.name) === key); if (direct) return direct.state; const close=portfolio.find(item => normalize(item.name).includes(key) || key.includes(normalize(item.name))); return close?.state || null; }
  const jobs=[];
  const sectionPattern=/<section[^>]*>[\s\S]*?<div class="row"><h2>(.*?)<\/h2>[\s\S]*?<\/section>/g;
  for (const section of html.matchAll(sectionPattern)) {
    const location=decode(section[1]);
    const jobPattern=/href="(\/v3\/Jobs\/JobDetails\.aspx\?[^\"]*?jid=(\d+)[^\"]*)">([\s\S]*?)<\/a>[\s\S]*?<span class="department">([\s\S]*?)<\/span>/g;
    for (const match of section[0].matchAll(jobPattern)) {
      const title=decode(match[3]); const department=decode(match[4]);
      jobs.push({ id:match[2], title, location, state:inferState(location), department, role_family:family(title,department), url:new URL(match[1].replace(/&amp;/g,"&"),sourceUrl).href });
    }
  }
  const capturedAt=new Date().toISOString();
  const previous=fs.existsSync(outputFile) ? JSON.parse(fs.readFileSync(outputFile,"utf8")) : { jobs:[] };
  const history=fs.existsSync(historyFile) ? JSON.parse(fs.readFileSync(historyFile,"utf8")) : { snapshots:[] };
  const priorIds=new Set((previous.jobs || []).map(item => item.id));
  const priorById=new Map((previous.jobs || []).map(item => [item.id,item]));
  const earliestSnapshot=(history.snapshots || []).map(item => item.capturedAt).filter(Boolean).sort()[0] || previous.metadata?.capturedAt || capturedAt;
  const locationDemand=jobs.reduce((map,item) => { const key=normalize(item.location); map[key]=(map[key]||0)+1; return map; },{});
  const stateDemand=jobs.reduce((map,item) => { const key=item.state || "Unmapped"; map[key]=(map[key]||0)+1; return map; },{});
  jobs.forEach(job => { const prior=priorById.get(job.id); job.first_observed_at=prior?.first_observed_at || (priorIds.has(job.id) ? earliestSnapshot : capturedAt); job.observed_open_days=Math.max(0,Math.floor((new Date(capturedAt)-new Date(job.first_observed_at))/86400000)); const [base,primary]=priorityBase(job); const factors=[primary]; let score=base; const local=Math.min(10,Math.max(0,(locationDemand[normalize(job.location)]||1)-1)*2); if (local) { score+=local; factors.push(`${locationDemand[normalize(job.location)]} openings at this center or market`); } const market=Math.min(8,Math.floor((stateDemand[job.state || "Unmapped"]||0)/10)); if (market) { score+=market; factors.push("High state hiring demand"); } if (/new (center|campus)/i.test(job.title)) { score+=8; factors.push("New-center staffing indicator"); } if (/certified/i.test(job.title)) { score+=4; factors.push("Credential-specific requirement"); } const ageBonus=job.observed_open_days>=30?15:job.observed_open_days>=14?10:job.observed_open_days>=7?5:job.observed_open_days>=3?2:0; if (ageBonus) { score+=ageBonus; factors.push(`${job.observed_open_days} days continuously observed open`); } job.priority_score=Math.min(99,score); job.priority_tier=job.priority_score>=85?"Urgent":job.priority_score>=75?"High":job.priority_score>=60?"Elevated":"Standard"; job.priority_factors=factors; });
  jobs.forEach(job => { const elapsedBonus=job.observed_open_days>=30?15:job.observed_open_days>=14?10:job.observed_open_days>=7?5:job.observed_open_days>=3?2:0; const calendarDays=Math.max(0,Math.round((new Date(`${capturedAt.slice(0,10)}T00:00:00Z`)-new Date(`${job.first_observed_at.slice(0,10)}T00:00:00Z`))/86400000)); const calendarBonus=calendarDays>=30?15:calendarDays>=14?10:calendarDays>=7?5:calendarDays>=3?2:0; job.observed_open_days=calendarDays; job.priority_score=Math.min(99,job.priority_score-elapsedBonus+calendarBonus); job.priority_factors=job.priority_factors.filter(item => !/days continuously observed open/.test(item)); if (calendarBonus) job.priority_factors.push(`${calendarDays} days continuously observed open`); job.priority_tier=job.priority_score>=85?"Urgent":job.priority_score>=75?"High":job.priority_score>=60?"Elevated":"Standard"; });
  jobs.sort((a,b) => b.priority_score-a.priority_score || a.title.localeCompare(b.title) || a.location.localeCompare(b.location));
  jobs.forEach((job,index) => { job.priority_rank=index+1; });
  const ids=new Set(jobs.map(item => item.id));
  const newJobs=jobs.filter(item => !priorIds.has(item.id)).map(item => item.id); const closedJobs=(previous.jobs || []).filter(item => !ids.has(item.id)).map(item => item.id);
  const byState=Object.entries(jobs.reduce((map,item) => { const key=item.state || "Unmapped"; map[key]=(map[key]||0)+1; return map; },{})).sort((a,b)=>b[1]-a[1]);
  const byRole=Object.entries(jobs.reduce((map,item) => { map[item.role_family]=(map[item.role_family]||0)+1; return map; },{})).sort((a,b)=>b[1]-a[1]);
  const snapshot={ capturedAt,total:jobs.length,newCount:newJobs.length,closedCount:closedJobs.length,byState:Object.fromEntries(byState),byRole:Object.fromEntries(byRole) };
  const today=capturedAt.slice(0,10); history.snapshots=(history.snapshots || []).filter(item => !String(item.capturedAt).startsWith(today)); history.snapshots.push(snapshot); history.snapshots=history.snapshots.slice(-180);
  fs.writeFileSync(outputFile,JSON.stringify({ metadata:{ source:sourceUrl,capturedAt,count:jobs.length,newCount:newJobs.length,closedCount:closedJobs.length,ageBasis:"First observed by LightkeeperIQ because the official career feed does not expose posting dates.",priorityMethod:"Estimated operational priority based on role criticality, local opening concentration, state demand, new-center language, credential requirements, and continuously observed time open. Not an internal BrightPath ranking." },jobs,newJobs,closedJobs,summary:{byState,byRole} }));
  fs.writeFileSync(historyFile,JSON.stringify(history));
  console.log(`Captured ${jobs.length} active BrightPath jobs (${newJobs.length} new, ${closedJobs.length} closed since prior snapshot).`);
})().catch(error => { console.error(error); process.exitCode=1; });
