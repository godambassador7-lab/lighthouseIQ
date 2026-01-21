import type { StateAdapter, USStateAbbrev } from '@lni/core';
import { INAdapter } from './state/in.js';
import { NYAdapter } from './state/ny.js';
import { ORAdapter } from './state/or.js';
// Midwest adapters
import { WIAdapter } from './state/wi.js';
import { IAAdapter } from './state/ia.js';
import { MIAdapter } from './state/mi.js';
import { ILAdapter } from './state/il.js';
import { OHAdapter } from './state/oh.js';
import { MNAdapter } from './state/mn.js';
import { MOAdapter } from './state/mo.js';
import { NEAdapter } from './state/ne.js';
import { SDAdapter } from './state/sd.js';
import { KSAdapter } from './state/ks.js';
import { NDAdapter } from './state/nd.js';
import { AKAdapter } from './state/ak.js';
import { AZAdapter } from './state/az.js';
import { COAdapter } from './state/co.js';
import { HIAdapter } from './state/hi.js';
import { IDAdapter } from './state/id.js';
import { MTAdapter } from './state/mt.js';
import { NMAdapter } from './state/nm.js';
import { UTAdapter } from './state/ut.js';
import { WYAdapter } from './state/wy.js';
// South adapters
import { ALAdapter } from './state/al.js';
import { ARAdapter } from './state/ar.js';
import { DCAdapter } from './state/dc.js';
import { DEAdapter } from './state/de.js';
import { FLAdapter } from './state/fl.js';
import { GAAdapter } from './state/ga.js';
import { KYAdapter } from './state/ky.js';
import { LAAdapter } from './state/la.js';
import { MDAdapter } from './state/md.js';
import { MSAdapter } from './state/ms.js';
import { NCAdapter } from './state/nc.js';
import { OKAdapter } from './state/ok.js';
import { SCAdapter } from './state/sc.js';
import { TNAdapter } from './state/tn.js';
import { TXAdapter } from './state/tx.js';
import { VAAdapter } from './state/va.js';
import { WVAdapter } from './state/wv.js';
// Northeast adapters
import { CTAdapter } from './state/ct.js';
import { MEAdapter } from './state/me.js';
import { MAAdapter } from './state/ma.js';
import { NHAdapter } from './state/nh.js';
import { NJAdapter } from './state/nj.js';
import { PAAdapter } from './state/pa.js';
import { RIAdapter } from './state/ri.js';
import { VTAdapter } from './state/vt.js';
// West adapters
import { CAAdapter } from './state/ca.js';
import { WAAdapter } from './state/wa.js';
import { NVAdapter } from './state/nv.js';
import { PRAdapter } from './state/pr.js';

const ADAPTERS: StateAdapter[] = [
  // Original adapters
  INAdapter,
  NYAdapter,
  ORAdapter,
  // Midwest adapters
  WIAdapter,
  IAAdapter,
  MIAdapter,
  ILAdapter,
  OHAdapter,
  MNAdapter,
  MOAdapter,
  NEAdapter,
  NDAdapter,
  SDAdapter,
  KSAdapter,
  AKAdapter,
  AZAdapter,
  COAdapter,
  HIAdapter,
  IDAdapter,
  MTAdapter,
  NMAdapter,
  UTAdapter,
  WYAdapter,
  // South adapters
  ALAdapter,
  ARAdapter,
  DCAdapter,
  DEAdapter,
  FLAdapter,
  GAAdapter,
  KYAdapter,
  LAAdapter,
  MDAdapter,
  MSAdapter,
  NCAdapter,
  OKAdapter,
  SCAdapter,
  TNAdapter,
  TXAdapter,
  VAAdapter,
  WVAdapter,
  // Northeast adapters
  CTAdapter,
  MEAdapter,
  MAAdapter,
  NHAdapter,
  NJAdapter,
  PAAdapter,
  RIAdapter,
  VTAdapter,
  // West adapters
  CAAdapter,
  WAAdapter,
  NVAdapter,
  PRAdapter,
];

export function getAdapter(state: USStateAbbrev): StateAdapter | undefined {
  return ADAPTERS.find(a => a.state === state);
}

export function getAllAdapters(): StateAdapter[] {
  return [...ADAPTERS];
}
