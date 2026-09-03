"use strict";

const fs = require("fs");
const path = require("path");
const https = require("https");

const sourceUrl = "https://www.busybeesna.com/locations";
const outputFile = path.resolve(__dirname, "..", "data", "busy-bees-us-locations.json");
const states = {
  AL:"Alabama", AK:"Alaska", AZ:"Arizona", AR:"Arkansas", CA:"California", CO:"Colorado", CT:"Connecticut", DE:"Delaware", FL:"Florida", GA:"Georgia", HI:"Hawaii", ID:"Idaho", IL:"Illinois", IN:"Indiana", IA:"Iowa", KS:"Kansas", KY:"Kentucky", LA:"Louisiana", ME:"Maine", MD:"Maryland", MA:"Massachusetts", MI:"Michigan", MN:"Minnesota", MS:"Mississippi", MO:"Missouri", MT:"Montana", NE:"Nebraska", NV:"Nevada", NH:"New Hampshire", NJ:"New Jersey", NM:"New Mexico", NY:"New York", NC:"North Carolina", ND:"North Dakota", OH:"Ohio", OK:"Oklahoma", OR:"Oregon", PA:"Pennsylvania", RI:"Rhode Island", SC:"South Carolina", SD:"South Dakota", TN:"Tennessee", TX:"Texas", UT:"Utah", VT:"Vermont", VA:"Virginia", WA:"Washington", WV:"West Virginia", WI:"Wisconsin", WY:"Wyoming", DC:"District of Columbia"
};

function get(url) {
  return new Promise((resolve, reject) => https.get(url, response => {
    if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) return resolve(get(new URL(response.headers.location, url).href));
    if (response.statusCode !== 200) return reject(new Error(`Request failed: ${response.statusCode}`));
    let body = "";
    response.setEncoding("utf8");
    response.on("data", chunk => { body += chunk; });
    response.on("end", () => resolve(body));
  }).on("error", reject));
}

function decode(value) {
  return String(value).replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, " ").trim();
}

function stateFromAddress(address) {
  for (const [code, name] of Object.entries(states)) {
    if (new RegExp(`(?:,\\s*|\\s)${code}(?:\\s*,?\\s*\\d{5}(?:-\\d{4})?|\\s*$)`, "i").test(address) || new RegExp(`\\b${name}\\b`, "i").test(address)) return code;
  }
  return null;
}

function brandFrom(name, address) {
  const text = `${name} ${address}`;
  if (/malvern/i.test(text)) return "The Malvern School";
  if (/montessori|villa/i.test(text)) return "Montessori";
  if (/leap school/i.test(text)) return "LEAP School";
  if (/kids country/i.test(text)) return "Kids Country";
  if (/learn and play/i.test(text)) return "Learn and Play";
  if (/busy bees/i.test(text) || /\b(?:carefree|chandler|east mesa|el mirage|glendale|heritage square|laveen|mesa|north phoenix|palm valley|paradise valley|provinces|san tan|south phoenix|surprise|tempe)\b/i.test(name)) return "Busy Bees";
  return "BrightPath Kids";
}

(async () => {
  const html = await get(sourceUrl);
  const pattern = /<h3>(.*?)<\/h3><div class=\\?&quot;loc-address\\?&quot;>(.*?)<\/div>.*?href=\\?&quot;(\/locations\/[^&]+?)\\?&quot;.*?<\/div><\/div><\/div>\\?&quot;,&quot;(-?[0-9.]+)&quot;,&quot;(-?[0-9.]+)&quot;/gs;
  const seen = new Set();
  const locations = [];
  for (const match of html.matchAll(pattern)) {
    const name = decode(match[1]);
    const address = decode(match[2]);
    const state = stateFromAddress(address);
    const latitude = Number(match[4]);
    const longitude = Number(match[5]);
    if (!state || !Number.isFinite(latitude) || !Number.isFinite(longitude) || longitude > -60 || longitude < -170) continue;
    const url = new URL(match[3].replace(/\\+$/, ""), sourceUrl).href;
    const key = `${url}|${latitude}|${longitude}`;
    if (seen.has(key)) continue;
    seen.add(key);
    locations.push({ id: `bb-${locations.length + 1}`, name, brand: brandFrom(name, address), address, state, latitude, longitude, url });
  }
  locations.sort((a, b) => a.state.localeCompare(b.state) || a.name.localeCompare(b.name));
  fs.mkdirSync(path.dirname(outputFile), { recursive: true });
  const mappedCount = locations.filter(item => item.longitude >= -126 && item.longitude <= -66 && item.latitude >= 24 && item.latitude <= 50).length;
  fs.writeFileSync(outputFile, JSON.stringify({ metadata: { source: sourceUrl, generatedAt: new Date().toISOString(), count: locations.length, mappedCount, scope: "All United States locations published by Busy Bees North America, including BrightPath Kids and affiliated brands" }, locations }));
  console.log(`Imported ${locations.length} official Busy Bees North America U.S. locations.`);
  if (mappedCount !== locations.length) console.warn(`${locations.length - mappedCount} location(s) require an inset or expanded map projection.`);
})().catch(error => { console.error(error); process.exitCode = 1; });
