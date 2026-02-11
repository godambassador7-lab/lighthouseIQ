  FL: {
    nursingEducation: {
      ufSystemPercentage: 22,
      stateCollegePercentage: 34,
      otherSchoolsPercentage: 44,
      totalGraduatesAnnual: 12500,
      retentionRate: 55
    },
    salaryMeta: {
      updatedAt: '2026-02-01',
      updateEveryDays: 7,
      breakdown: [
        { label: 'BLS Florida RN mean (May 2023)', value: '$37.66/hr • $78,330/yr', note: 'Statewide OEWS data' },
        { label: 'BLS Miami-Fort Lauderdale RN mean (May 2023)', value: '$39.52/hr • $82,200/yr', note: 'Metro OEWS data' },
        { label: 'Job board ranges (FL/metro)', value: '$32-44/hr typical', note: 'Company salary pages by system' }
      ],
      sources: [
        { name: 'BLS OEWS Florida RN (May 2023)', url: 'https://www.bls.gov/oes/2023/may/oes_fl.htm' },
        { name: 'BLS OEWS Miami-Fort Lauderdale MSA RN (May 2023)', url: 'https://www.bls.gov/oes/2023/may/oes_33100.htm' },
        { name: 'BLS OEWS Tampa-St. Petersburg MSA RN (May 2023)', url: 'https://www.bls.gov/oes/2023/may/oes_45300.htm' }
      ]
    },
    metros: [
      {
        name: 'Miami',
        size: 'major',
        population: '6.1M',
        competition: 'high',
        hospitals: [
          { name: 'Jackson Memorial Hospital', system: 'Jackson Health System', score: 93, beds: 1547, reviews: 4.2 },
          { name: 'Baptist Hospital of Miami', system: 'Baptist Health South Florida', score: 92, beds: 728, reviews: 4.3 },
          { name: 'University of Miami Hospital', system: 'UHealth', score: 91, beds: 560, reviews: 4.1 },
          { name: 'Mount Sinai Medical Center', system: 'Mount Sinai', score: 89, beds: 672, reviews: 4.0 },
          { name: 'Aventura Hospital and Medical Center', system: 'HCA Healthcare', score: 86, beds: 407, reviews: 3.9 },
          { name: 'Memorial Regional Hospital', system: 'Memorial Healthcare System', score: 90, beds: 704, reviews: 4.2 },
          { name: 'Broward Health Medical Center', system: 'Broward Health', score: 87, beds: 716, reviews: 3.9 },
          { name: 'Holy Cross Hospital', system: 'Trinity Health', score: 85, beds: 571, reviews: 4.0 },
          { name: 'Cleveland Clinic Weston', system: 'Cleveland Clinic Florida', score: 90, beds: 206, reviews: 4.4 }
        ],
        systems: [
          { name: 'Baptist Health South Florida', facilities: 6, marketShare: '25%' },
          { name: 'Jackson Health System', facilities: 3, marketShare: '20%' },
          { name: 'Memorial Healthcare System', facilities: 4, marketShare: '15%' },
          { name: 'HCA Healthcare', facilities: 5, marketShare: '15%' },
          { name: 'Independent/Other', facilities: 6, marketShare: '25%' }
        ],
        salary: {
          staffRN: '$34-48/hr',
          travelRN: '$2,200-2,800/wk',
          signOn: '$8-20K',
          systems: [
            { name: 'Baptist Health South Florida', value: '$39-44/hr est', source: 'Job boards' },
            { name: 'Jackson Health System', value: '$37-43/hr est', source: 'Job boards' },
            { name: 'Memorial Healthcare System', value: '$38-44/hr est', source: 'Job boards' },
            { name: 'HCA Healthcare', value: '$35-42/hr est', source: 'Job boards' }
          ]
        },
        factors: [
          { text: 'Massive diverse metro with high patient volume', type: 'positive' },
          { text: 'Year-round travel RN demand', type: 'positive' },
          { text: 'Bilingual (English/Spanish) strongly preferred', type: 'neutral' },
          { text: 'High cost of living relative to wages', type: 'negative' },
          { text: 'Seasonal population surge (snowbirds)', type: 'neutral' }
        ]
      },
      {
        name: 'Tampa',
        size: 'major',
        population: '3.2M',
        competition: 'high',
        hospitals: [
          { name: 'Tampa General Hospital', system: 'Tampa General', score: 92, beds: 1041, reviews: 4.2 },
          { name: 'AdventHealth Tampa', system: 'AdventHealth', score: 89, beds: 533, reviews: 4.1 },
          { name: 'St. Joseph\'s Hospital', system: 'BayCare Health System', score: 88, beds: 929, reviews: 4.0 },
          { name: 'Moffitt Cancer Center', system: 'Moffitt Cancer Center', score: 94, beds: 206, reviews: 4.5 },
          { name: 'James A. Haley Veterans Hospital', system: 'VA', score: 87, beds: 352, reviews: 4.0 },
          { name: 'Morton Plant Hospital', system: 'BayCare Health System', score: 86, beds: 687, reviews: 4.0 },
          { name: 'HCA Florida South Tampa Hospital', system: 'HCA Healthcare', score: 84, beds: 112, reviews: 3.8 }
        ],
        systems: [
          { name: 'BayCare Health System', facilities: 6, marketShare: '35%' },
          { name: 'AdventHealth', facilities: 3, marketShare: '20%' },
          { name: 'HCA Healthcare', facilities: 4, marketShare: '18%' },
          { name: 'Tampa General', facilities: 1, marketShare: '15%' },
          { name: 'Independent/Other', facilities: 3, marketShare: '12%' }
        ],
        salary: {
          staffRN: '$32-44/hr',
          travelRN: '$2,100-2,700/wk',
          signOn: '$8-18K',
          systems: [
            { name: 'BayCare Health System', value: '$36-42/hr est', source: 'Job boards' },
            { name: 'AdventHealth', value: '$35-41/hr est', source: 'Job boards' },
            { name: 'Tampa General Hospital', value: '$37-43/hr est', source: 'Job boards' },
            { name: 'HCA Healthcare', value: '$34-40/hr est', source: 'Job boards' }
          ]
        },
        factors: [
          { text: 'Major academic and cancer center hub', type: 'positive' },
          { text: 'Rapid population growth driving demand', type: 'positive' },
          { text: 'Multiple competing systems', type: 'positive' },
          { text: 'Growing elderly population increases acuity', type: 'neutral' },
          { text: 'Hurricane season staffing challenges', type: 'negative' }
        ]
      },
      {
        name: 'Orlando',
        size: 'major',
        population: '2.7M',
        competition: 'high',
        hospitals: [
          { name: 'Orlando Health Orlando Regional Medical Center', system: 'Orlando Health', score: 91, beds: 808, reviews: 4.1 },
          { name: 'AdventHealth Orlando', system: 'AdventHealth', score: 90, beds: 1368, reviews: 4.2 },
          { name: 'Nemours Children\'s Hospital', system: 'Nemours', score: 92, beds: 130, reviews: 4.5 },
          { name: 'Orlando Health Dr. P. Phillips Hospital', system: 'Orlando Health', score: 87, beds: 237, reviews: 4.0 },
          { name: 'HCA Florida Osceola Hospital', system: 'HCA Healthcare', score: 83, beds: 340, reviews: 3.8 },
          { name: 'AdventHealth Celebration', system: 'AdventHealth', score: 85, beds: 239, reviews: 4.0 }
        ],
        systems: [
          { name: 'AdventHealth', facilities: 8, marketShare: '40%' },
          { name: 'Orlando Health', facilities: 6, marketShare: '30%' },
          { name: 'HCA Healthcare', facilities: 4, marketShare: '18%' },
          { name: 'Independent/Other', facilities: 3, marketShare: '12%' }
        ],
        salary: {
          staffRN: '$31-43/hr',
          travelRN: '$2,000-2,600/wk',
          signOn: '$7-16K',
          systems: [
            { name: 'AdventHealth', value: '$35-41/hr est', source: 'Job boards' },
            { name: 'Orlando Health', value: '$36-42/hr est', source: 'Job boards' },
            { name: 'HCA Healthcare', value: '$33-40/hr est', source: 'Job boards' }
          ]
        },
        factors: [
          { text: 'Major tourism economy supports healthcare demand', type: 'positive' },
          { text: 'Rapid metro growth and expansion', type: 'positive' },
          { text: 'Two dominant systems competing for talent', type: 'positive' },
          { text: 'Seasonal tourist volume creates ER surges', type: 'neutral' },
          { text: 'Rising cost of living', type: 'negative' }
        ]
      },
      {
        name: 'Jacksonville',
        size: 'major',
        population: '1.6M',
        competition: 'high',
        hospitals: [
          { name: 'Mayo Clinic Jacksonville', system: 'Mayo Clinic', score: 95, beds: 304, reviews: 4.6 },
          { name: 'Baptist Medical Center Jacksonville', system: 'Baptist Health', score: 90, beds: 948, reviews: 4.1 },
          { name: 'UF Health Jacksonville', system: 'UF Health', score: 89, beds: 695, reviews: 4.0 },
          { name: 'Ascension St. Vincent\'s Medical Center', system: 'Ascension', score: 87, beds: 528, reviews: 4.0 },
          { name: 'Memorial Hospital Jacksonville', system: 'HCA Healthcare', score: 84, beds: 418, reviews: 3.8 },
          { name: 'Baptist Medical Center South', system: 'Baptist Health', score: 86, beds: 271, reviews: 4.0 }
        ],
        systems: [
          { name: 'Baptist Health', facilities: 5, marketShare: '35%' },
          { name: 'UF Health', facilities: 2, marketShare: '20%' },
          { name: 'Ascension', facilities: 2, marketShare: '15%' },
          { name: 'HCA Healthcare', facilities: 3, marketShare: '15%' },
          { name: 'Mayo Clinic / Other', facilities: 3, marketShare: '15%' }
        ],
        salary: {
          staffRN: '$32-44/hr',
          travelRN: '$2,100-2,700/wk',
          signOn: '$8-20K',
          systems: [
            { name: 'Baptist Health', value: '$36-42/hr est', source: 'Job boards' },
            { name: 'Mayo Clinic', value: '$40-48/hr est', source: 'Job boards' },
            { name: 'UF Health', value: '$35-41/hr est', source: 'Job boards' },
            { name: 'HCA Healthcare', value: '$34-40/hr est', source: 'Job boards' }
          ]
        },
        factors: [
          { text: 'Mayo Clinic presence elevates market', type: 'positive' },
          { text: 'Military/veteran population (Naval Station Mayport)', type: 'positive' },
          { text: 'Affordable cost of living for Florida', type: 'positive' },
          { text: 'Growing metro with increasing demand', type: 'positive' },
          { text: 'Sprawling geography impacts commutes', type: 'neutral' }
        ]
      }
    ]
  },
  IL: {
    nursingEducation: {
      uicSystemPercentage: 18,
      communityCollegePercentage: 35,
      otherSchoolsPercentage: 47,
      totalGraduatesAnnual: 8200,
      retentionRate: 60
    },
    salaryMeta: {
      updatedAt: '2026-02-01',
      updateEveryDays: 7,
      breakdown: [
        { label: 'BLS Illinois RN mean (May 2023)', value: '$40.67/hr • $84,600/yr', note: 'Statewide OEWS data' },
        { label: 'BLS Chicago-Naperville-Elgin RN mean (May 2023)', value: '$42.89/hr • $89,210/yr', note: 'Metro OEWS data' },
        { label: 'Job board ranges (IL/metro)', value: '$34-50/hr typical', note: 'Company salary pages by system' }
      ],
      sources: [
        { name: 'BLS OEWS Illinois RN (May 2023)', url: 'https://www.bls.gov/oes/2023/may/oes_il.htm' },
        { name: 'BLS OEWS Chicago-Naperville MSA RN (May 2023)', url: 'https://www.bls.gov/oes/2023/may/oes_16980.htm' },
        { name: 'BLS OEWS Springfield MSA RN (May 2023)', url: 'https://www.bls.gov/oes/2023/may/oes_44100.htm' }
      ]
    },
    metros: [
      {
        name: 'Chicago',
        size: 'major',
        population: '9.4M',
        competition: 'high',
        hospitals: [
          { name: 'Northwestern Memorial Hospital', system: 'Northwestern Medicine', score: 95, beds: 894, reviews: 4.4 },
          { name: 'Rush University Medical Center', system: 'Rush', score: 94, beds: 664, reviews: 4.3 },
          { name: 'University of Chicago Medical Center', system: 'UChicago Medicine', score: 93, beds: 811, reviews: 4.2 },
          { name: 'Advocate Christ Medical Center', system: 'Advocate Health', score: 91, beds: 749, reviews: 4.1 },
          { name: 'Lurie Children\'s Hospital', system: 'Northwestern Medicine', score: 94, beds: 360, reviews: 4.5 },
          { name: 'Loyola University Medical Center', system: 'Trinity Health/Loyola', score: 90, beds: 547, reviews: 4.1 },
          { name: 'Advocate Lutheran General Hospital', system: 'Advocate Health', score: 88, beds: 639, reviews: 4.0 },
          { name: 'Amita Health Resurrection Medical Center', system: 'Ascension', score: 84, beds: 409, reviews: 3.8 },
          { name: 'NorthShore University HealthSystem Evanston', system: 'NorthShore-Edward', score: 89, beds: 491, reviews: 4.1 },
          { name: 'Edward Hospital', system: 'NorthShore-Edward', score: 87, beds: 359, reviews: 4.2 }
        ],
        systems: [
          { name: 'Advocate Health', facilities: 12, marketShare: '25%' },
          { name: 'Northwestern Medicine', facilities: 6, marketShare: '20%' },
          { name: 'Ascension', facilities: 8, marketShare: '15%' },
          { name: 'NorthShore-Edward', facilities: 5, marketShare: '10%' },
          { name: 'UChicago Medicine / Other', facilities: 10, marketShare: '30%' }
        ],
        salary: {
          staffRN: '$36-52/hr',
          travelRN: '$2,400-3,100/wk',
          signOn: '$10-25K',
          systems: [
            { name: 'Northwestern Medicine', value: '$42-50/hr est', source: 'Job boards' },
            { name: 'Advocate Health', value: '$38-46/hr est', source: 'Job boards' },
            { name: 'Rush University Medical Center', value: '$40-48/hr est', source: 'Job boards' },
            { name: 'UChicago Medicine', value: '$41-49/hr est', source: 'Job boards' },
            { name: 'Ascension', value: '$36-43/hr est', source: 'Job boards' }
          ]
        },
        factors: [
          { text: 'World-class academic medical centers', type: 'positive' },
          { text: 'Strong union presence (SEIU, NNU)', type: 'neutral' },
          { text: 'Massive metro with diverse patient populations', type: 'positive' },
          { text: 'High cost of living in city core', type: 'negative' },
          { text: 'Excellent public transit access to hospitals', type: 'positive' },
          { text: 'Intense competition for specialty RNs', type: 'neutral' }
        ]
      },
      {
        name: 'Springfield',
        size: 'medium',
        population: '210K',
        competition: 'medium',
        hospitals: [
          { name: 'HSHS St. John\'s Hospital', system: 'HSHS', score: 87, beds: 432, reviews: 4.0 },
          { name: 'Memorial Medical Center', system: 'Memorial Health System', score: 88, beds: 500, reviews: 4.1 },
          { name: 'Springfield Memorial Hospital', system: 'Memorial Health System', score: 85, beds: 265, reviews: 3.9 },
          { name: 'Abraham Lincoln Memorial Hospital', system: 'Memorial Health System', score: 80, beds: 25, reviews: 3.7 }
        ],
        systems: [
          { name: 'Memorial Health System', facilities: 3, marketShare: '55%' },
          { name: 'HSHS', facilities: 1, marketShare: '35%' },
          { name: 'Independent', facilities: 1, marketShare: '10%' }
        ],
        salary: {
          staffRN: '$30-40/hr',
          travelRN: '$1,900-2,500/wk',
          signOn: '$7-15K',
          systems: [
            { name: 'Memorial Health System', value: '$34-40/hr est', source: 'Job boards' },
            { name: 'HSHS', value: '$33-39/hr est', source: 'Job boards' }
          ]
        },
        factors: [
          { text: 'State capital with stable government employment', type: 'positive' },
          { text: 'SIU School of Medicine pipeline', type: 'positive' },
          { text: 'Lower cost of living', type: 'positive' },
          { text: 'Two-system market with moderate competition', type: 'neutral' }
        ]
      },
      {
        name: 'Peoria',
        size: 'medium',
        population: '370K',
        competition: 'medium',
        hospitals: [
          { name: 'OSF Saint Francis Medical Center', system: 'OSF HealthCare', score: 89, beds: 616, reviews: 4.1 },
          { name: 'UnityPoint Health - Methodist', system: 'UnityPoint Health', score: 87, beds: 353, reviews: 4.0 },
          { name: 'UnityPoint Health - Proctor', system: 'UnityPoint Health', score: 84, beds: 186, reviews: 3.9 },
          { name: 'OSF Saint Francis Children\'s Hospital', system: 'OSF HealthCare', score: 90, beds: 136, reviews: 4.3 }
        ],
        systems: [
          { name: 'OSF HealthCare', facilities: 3, marketShare: '50%' },
          { name: 'UnityPoint Health', facilities: 3, marketShare: '40%' },
          { name: 'Independent', facilities: 1, marketShare: '10%' }
        ],
        salary: {
          staffRN: '$29-39/hr',
          travelRN: '$1,850-2,400/wk',
          signOn: '$6-14K',
          systems: [
            { name: 'OSF HealthCare', value: '$33-39/hr est', source: 'Job boards' },
            { name: 'UnityPoint Health', value: '$32-38/hr est', source: 'Job boards' }
          ]
        },
        factors: [
          { text: 'UICOMP medical campus (Level I trauma)', type: 'positive' },
          { text: 'Two strong competing health systems', type: 'positive' },
          { text: 'Affordable cost of living', type: 'positive' },
          { text: 'Declining regional population', type: 'negative' },
          { text: 'Moderate specialty opportunities', type: 'neutral' }
        ]
      }
    ]
  },
  MI: {
    nursingEducation: {
      umSystemPercentage: 20,
      communityCollegePercentage: 30,
      otherSchoolsPercentage: 50,
      totalGraduatesAnnual: 6500,
      retentionRate: 62
    },
    salaryMeta: {
      updatedAt: '2026-02-01',
      updateEveryDays: 7,
      breakdown: [
        { label: 'BLS Michigan RN mean (May 2023)', value: '$40.22/hr • $83,650/yr', note: 'Statewide OEWS data' },
        { label: 'BLS Detroit-Warren-Dearborn RN mean (May 2023)', value: '$42.15/hr • $87,670/yr', note: 'Metro OEWS data' },
        { label: 'Job board ranges (MI/metro)', value: '$33-46/hr typical', note: 'Company salary pages by system' }
      ],
      sources: [
        { name: 'BLS OEWS Michigan RN (May 2023)', url: 'https://www.bls.gov/oes/2023/may/oes_mi.htm' },
        { name: 'BLS OEWS Detroit-Warren MSA RN (May 2023)', url: 'https://www.bls.gov/oes/2023/may/oes_19820.htm' },
        { name: 'BLS OEWS Ann Arbor MSA RN (May 2023)', url: 'https://www.bls.gov/oes/2023/may/oes_11460.htm' }
      ]
    },
    metros: [
      {
        name: 'Detroit',
        size: 'major',
        population: '4.3M',
        competition: 'high',
        hospitals: [
          { name: 'Beaumont Hospital Royal Oak', system: 'Corewell Health', score: 92, beds: 1070, reviews: 4.2 },
          { name: 'Henry Ford Hospital', system: 'Henry Ford Health', score: 91, beds: 877, reviews: 4.1 },
          { name: 'DMC Harper University Hospital', system: 'Tenet/DMC', score: 87, beds: 421, reviews: 3.9 },
          { name: 'DMC Detroit Receiving Hospital', system: 'Tenet/DMC', score: 85, beds: 237, reviews: 3.8 },
          { name: 'Ascension Providence Rochester', system: 'Ascension', score: 86, beds: 518, reviews: 4.0 },
          { name: 'Beaumont Hospital Dearborn', system: 'Corewell Health', score: 88, beds: 632, reviews: 4.0 },
          { name: 'Henry Ford Macomb Hospital', system: 'Henry Ford Health', score: 86, beds: 349, reviews: 4.0 },
          { name: 'Beaumont Hospital Troy', system: 'Corewell Health', score: 89, beds: 520, reviews: 4.1 },
          { name: 'Ascension St. John Hospital', system: 'Ascension', score: 85, beds: 612, reviews: 3.9 }
        ],
        systems: [
          { name: 'Corewell Health (Beaumont)', facilities: 8, marketShare: '30%' },
          { name: 'Henry Ford Health', facilities: 6, marketShare: '25%' },
          { name: 'Ascension Michigan', facilities: 5, marketShare: '15%' },
          { name: 'Tenet/DMC', facilities: 4, marketShare: '15%' },
          { name: 'Trinity Health / Other', facilities: 4, marketShare: '15%' }
        ],
        salary: {
          staffRN: '$34-47/hr',
          travelRN: '$2,200-2,900/wk',
          signOn: '$10-22K',
          systems: [
            { name: 'Corewell Health', value: '$39-45/hr est', source: 'Job boards' },
            { name: 'Henry Ford Health', value: '$38-44/hr est', source: 'Job boards' },
            { name: 'Tenet/DMC', value: '$35-42/hr est', source: 'Job boards' },
            { name: 'Ascension Michigan', value: '$36-43/hr est', source: 'Job boards' }
          ]
        },
        factors: [
          { text: 'Large metro with multiple major health systems', type: 'positive' },
          { text: 'Strong union presence (MNA, SEIU)', type: 'neutral' },
          { text: 'High demand for ED and trauma nurses', type: 'positive' },
          { text: 'Significant sign-on bonuses market-wide', type: 'positive' },
          { text: 'Urban core safety concerns for some facilities', type: 'negative' }
        ]
      },
      {
        name: 'Grand Rapids',
        size: 'medium',
        population: '1.1M',
        competition: 'medium',
        hospitals: [
          { name: 'Corewell Health Butterworth Hospital', system: 'Corewell Health', score: 91, beds: 875, reviews: 4.2 },
          { name: 'Corewell Health Blodgett Hospital', system: 'Corewell Health', score: 88, beds: 400, reviews: 4.1 },
          { name: 'Trinity Health Saint Mary\'s', system: 'Trinity Health', score: 86, beds: 344, reviews: 4.0 },
          { name: 'Mary Free Bed Rehabilitation Hospital', system: 'Mary Free Bed', score: 89, beds: 167, reviews: 4.3 },
          { name: 'Holland Hospital', system: 'Holland Hospital', score: 84, beds: 189, reviews: 4.0 }
        ],
        systems: [
          { name: 'Corewell Health', facilities: 5, marketShare: '55%' },
          { name: 'Trinity Health', facilities: 2, marketShare: '25%' },
          { name: 'Independent', facilities: 3, marketShare: '20%' }
        ],
        salary: {
          staffRN: '$31-43/hr',
          travelRN: '$2,000-2,600/wk',
          signOn: '$8-18K',
          systems: [
            { name: 'Corewell Health', value: '$36-43/hr est', source: 'Job boards' },
            { name: 'Trinity Health', value: '$34-41/hr est', source: 'Job boards' }
          ]
        },
        factors: [
          { text: 'Growing West Michigan economy', type: 'positive' },
          { text: 'Corewell Health is dominant employer', type: 'neutral' },
          { text: 'Strong community hospital culture', type: 'positive' },
          { text: 'Lower cost of living than Detroit', type: 'positive' },
          { text: 'Growing medical research presence', type: 'positive' }
        ]
      },
      {
        name: 'Ann Arbor',
        size: 'medium',
        population: '370K',
        competition: 'high',
        hospitals: [
          { name: 'Michigan Medicine University Hospital', system: 'Michigan Medicine', score: 95, beds: 1000, reviews: 4.4 },
          { name: 'C.S. Mott Children\'s Hospital', system: 'Michigan Medicine', score: 95, beds: 348, reviews: 4.6 },
          { name: 'Michigan Medicine Cardiovascular Center', system: 'Michigan Medicine', score: 93, beds: 120, reviews: 4.4 },
          { name: 'VA Ann Arbor Healthcare System', system: 'VA', score: 86, beds: 146, reviews: 4.0 },
          { name: 'Trinity Health Ann Arbor', system: 'Trinity Health', score: 85, beds: 537, reviews: 3.9 }
        ],
        systems: [
          { name: 'Michigan Medicine (U-M)', facilities: 4, marketShare: '65%' },
          { name: 'Trinity Health', facilities: 1, marketShare: '20%' },
          { name: 'VA / Other', facilities: 2, marketShare: '15%' }
        ],
        salary: {
          staffRN: '$35-48/hr',
          travelRN: '$2,300-2,900/wk',
          signOn: '$10-20K',
          systems: [
            { name: 'Michigan Medicine', value: '$40-48/hr est', source: 'Job boards' },
            { name: 'Trinity Health', value: '$35-42/hr est', source: 'Job boards' }
          ]
        },
        factors: [
          { text: 'Top-ranked academic medical center (U-M)', type: 'positive' },
          { text: 'Excellent research and specialty opportunities', type: 'positive' },
          { text: 'Strong nurse residency programs', type: 'positive' },
          { text: 'Higher cost of living for Michigan', type: 'negative' },
          { text: 'Single dominant employer limits negotiation', type: 'neutral' }
        ]
      }
    ]
  },
  NY: {
    nursingEducation: {
      sunySystemPercentage: 25,
      cunyCityPercentage: 18,
      otherSchoolsPercentage: 57,
      totalGraduatesAnnual: 14000,
      retentionRate: 56
    },
    salaryMeta: {
      updatedAt: '2026-02-01',
      updateEveryDays: 7,
      breakdown: [
        { label: 'BLS New York RN mean (May 2023)', value: '$51.65/hr • $107,440/yr', note: 'Statewide OEWS data' },
        { label: 'BLS New York-Newark-Jersey City RN mean (May 2023)', value: '$55.19/hr • $114,790/yr', note: 'Metro OEWS data' },
        { label: 'Job board ranges (NY/metro)', value: '$42-65/hr typical', note: 'Company salary pages by system' }
      ],
      sources: [
        { name: 'BLS OEWS New York RN (May 2023)', url: 'https://www.bls.gov/oes/2023/may/oes_ny.htm' },
        { name: 'BLS OEWS New York-Newark MSA RN (May 2023)', url: 'https://www.bls.gov/oes/2023/may/oes_35620.htm' },
        { name: 'BLS OEWS Buffalo-Cheektowaga MSA RN (May 2023)', url: 'https://www.bls.gov/oes/2023/may/oes_15380.htm' }
      ]
    },
    metros: [
      {
        name: 'New York City',
        size: 'major',
        population: '8.3M',
        competition: 'high',
        hospitals: [
          { name: 'NYU Langone Health', system: 'NYU Langone', score: 95, beds: 1069, reviews: 4.4 },
          { name: 'NewYork-Presbyterian/Columbia', system: 'NewYork-Presbyterian', score: 95, beds: 745, reviews: 4.3 },
          { name: 'NewYork-Presbyterian/Weill Cornell', system: 'NewYork-Presbyterian', score: 94, beds: 862, reviews: 4.3 },
          { name: 'Mount Sinai Hospital', system: 'Mount Sinai Health System', score: 93, beds: 1134, reviews: 4.2 },
          { name: 'Memorial Sloan Kettering Cancer Center', system: 'MSK', score: 95, beds: 514, reviews: 4.5 },
          { name: 'Hospital for Special Surgery', system: 'HSS', score: 94, beds: 215, reviews: 4.5 },
          { name: 'Montefiore Medical Center', system: 'Montefiore', score: 90, beds: 1491, reviews: 4.0 },
          { name: 'NYC Health + Hospitals/Bellevue', system: 'NYC H+H', score: 87, beds: 844, reviews: 3.9 },
          { name: 'Northwell Health Lenox Hill Hospital', system: 'Northwell Health', score: 88, beds: 450, reviews: 4.0 },
          { name: 'Maimonides Medical Center', system: 'Maimonides', score: 85, beds: 711, reviews: 3.8 }
        ],
        systems: [
          { name: 'NewYork-Presbyterian', facilities: 6, marketShare: '18%' },
          { name: 'Northwell Health', facilities: 8, marketShare: '15%' },
          { name: 'Mount Sinai Health System', facilities: 7, marketShare: '14%' },
          { name: 'NYC Health + Hospitals', facilities: 11, marketShare: '15%' },
          { name: 'NYU Langone / Other', facilities: 12, marketShare: '38%' }
        ],
        salary: {
          staffRN: '$45-68/hr',
          travelRN: '$2,800-3,800/wk',
          signOn: '$10-25K',
          systems: [
            { name: 'NYU Langone', value: '$52-62/hr est', source: 'Job boards' },
            { name: 'NewYork-Presbyterian', value: '$50-60/hr est', source: 'Job boards' },
            { name: 'Mount Sinai', value: '$48-58/hr est', source: 'Job boards' },
            { name: 'Northwell Health', value: '$46-56/hr est', source: 'Job boards' },
            { name: 'NYC Health + Hospitals', value: '$50-65/hr est', source: 'Job boards' }
          ]
        },
        factors: [
          { text: 'Highest-paying RN market in the US', type: 'positive' },
          { text: 'World-renowned academic medical centers', type: 'positive' },
          { text: 'Strong union protections (NYSNA)', type: 'positive' },
          { text: 'Extremely high cost of living', type: 'negative' },
          { text: 'Safe staffing ratio legislation improving conditions', type: 'positive' },
          { text: 'Intense competition for specialty and Magnet roles', type: 'neutral' }
        ]
      },
      {
        name: 'Buffalo',
        size: 'medium',
        population: '1.2M',
        competition: 'medium',
        hospitals: [
          { name: 'Kaleida Health Buffalo General Medical Center', system: 'Kaleida Health', score: 88, beds: 437, reviews: 4.0 },
          { name: 'Roswell Park Comprehensive Cancer Center', system: 'Roswell Park', score: 93, beds: 133, reviews: 4.4 },
          { name: 'ECMC (Erie County Medical Center)', system: 'ECMC', score: 85, beds: 573, reviews: 3.9 },
          { name: 'Kaleida Health Millard Fillmore Suburban', system: 'Kaleida Health', score: 84, beds: 310, reviews: 3.9 },
          { name: 'Catholic Health Mercy Hospital', system: 'Catholic Health', score: 83, beds: 438, reviews: 3.8 },
          { name: 'Catholic Health Sisters of Charity Hospital', system: 'Catholic Health', score: 82, beds: 267, reviews: 3.7 }
        ],
        systems: [
          { name: 'Kaleida Health', facilities: 4, marketShare: '35%' },
          { name: 'Catholic Health', facilities: 4, marketShare: '30%' },
          { name: 'ECMC', facilities: 1, marketShare: '15%' },
          { name: 'Independent/Other', facilities: 3, marketShare: '20%' }
        ],
        salary: {
          staffRN: '$35-48/hr',
          travelRN: '$2,200-2,800/wk',
          signOn: '$8-18K',
          systems: [
            { name: 'Kaleida Health', value: '$38-46/hr est', source: 'Job boards' },
            { name: 'Catholic Health', value: '$36-44/hr est', source: 'Job boards' },
            { name: 'ECMC', value: '$37-45/hr est', source: 'Job boards' }
          ]
        },
        factors: [
          { text: 'NCI-designated cancer center (Roswell Park)', type: 'positive' },
          { text: 'Affordable cost of living for New York', type: 'positive' },
          { text: 'Strong union presence (CWA, NYSNA)', type: 'neutral' },
          { text: 'Canadian border proximity adds unique patient mix', type: 'neutral' },
          { text: 'Harsh winter weather impacts commutes', type: 'negative' }
        ]
      },
      {
        name: 'Rochester',
        size: 'medium',
        population: '1.1M',
        competition: 'medium',
        hospitals: [
          { name: 'Strong Memorial Hospital', system: 'UR Medicine', score: 92, beds: 886, reviews: 4.2 },
          { name: 'Rochester General Hospital', system: 'Rochester Regional Health', score: 88, beds: 528, reviews: 4.0 },
          { name: 'Highland Hospital', system: 'UR Medicine', score: 86, beds: 261, reviews: 4.1 },
          { name: 'Unity Hospital', system: 'Rochester Regional Health', score: 84, beds: 287, reviews: 3.9 },
          { name: 'Golisano Children\'s Hospital', system: 'UR Medicine', score: 91, beds: 142, reviews: 4.4 }
        ],
        systems: [
          { name: 'UR Medicine', facilities: 5, marketShare: '50%' },
          { name: 'Rochester Regional Health', facilities: 4, marketShare: '40%' },
          { name: 'Independent', facilities: 2, marketShare: '10%' }
        ],
        salary: {
          staffRN: '$34-47/hr',
          travelRN: '$2,100-2,700/wk',
          signOn: '$8-16K',
          systems: [
            { name: 'UR Medicine', value: '$38-46/hr est', source: 'Job boards' },
            { name: 'Rochester Regional Health', value: '$36-44/hr est', source: 'Job boards' }
          ]
        },
        factors: [
          { text: 'Strong academic medical center (U of R)', type: 'positive' },
          { text: 'Two-system market with healthy competition', type: 'positive' },
          { text: 'Affordable cost of living for New York', type: 'positive' },
          { text: 'Robust pediatric and specialty programs', type: 'positive' },
          { text: 'Winter weather challenges', type: 'negative' }
        ]
      }
    ]
  },
  TX: {
    nursingEducation: {
      utSystemPercentage: 20,
      communityCollegePercentage: 32,
      otherSchoolsPercentage: 48,
      totalGraduatesAnnual: 16000,
      retentionRate: 58
    },
    salaryMeta: {
      updatedAt: '2026-02-01',
      updateEveryDays: 7,
      breakdown: [
        { label: 'BLS Texas RN mean (May 2023)', value: '$40.69/hr • $84,630/yr', note: 'Statewide OEWS data' },
        { label: 'BLS Houston-The Woodlands RN mean (May 2023)', value: '$42.33/hr • $88,050/yr', note: 'Metro OEWS data' },
        { label: 'Job board ranges (TX/metro)', value: '$33-48/hr typical', note: 'Company salary pages by system' }
      ],
      sources: [
        { name: 'BLS OEWS Texas RN (May 2023)', url: 'https://www.bls.gov/oes/2023/may/oes_tx.htm' },
        { name: 'BLS OEWS Houston-The Woodlands MSA RN (May 2023)', url: 'https://www.bls.gov/oes/2023/may/oes_26420.htm' },
        { name: 'BLS OEWS Dallas-Fort Worth MSA RN (May 2023)', url: 'https://www.bls.gov/oes/2023/may/oes_19100.htm' }
      ]
    },
    metros: [
      {
        name: 'Houston',
        size: 'major',
        population: '7.1M',
        competition: 'high',
        hospitals: [
          { name: 'Houston Methodist Hospital', system: 'Houston Methodist', score: 95, beds: 907, reviews: 4.4 },
          { name: 'Memorial Hermann-Texas Medical Center', system: 'Memorial Hermann', score: 93, beds: 1052, reviews: 4.2 },
          { name: 'MD Anderson Cancer Center', system: 'UT MD Anderson', score: 95, beds: 654, reviews: 4.5 },
          { name: 'Texas Children\'s Hospital', system: 'Texas Children\'s', score: 95, beds: 973, reviews: 4.5 },
          { name: 'Ben Taub Hospital', system: 'Harris Health', score: 86, beds: 586, reviews: 3.9 },
          { name: 'St. Luke\'s Health - Baylor St. Luke\'s Medical Center', system: 'CommonSpirit Health', score: 89, beds: 881, reviews: 4.0 },
          { name: 'HCA Houston Healthcare Clear Lake', system: 'HCA Healthcare', score: 84, beds: 525, reviews: 3.8 },
          { name: 'Memorial Hermann The Woodlands', system: 'Memorial Hermann', score: 88, beds: 400, reviews: 4.1 },
          { name: 'Houston Methodist Willowbrook', system: 'Houston Methodist', score: 87, beds: 312, reviews: 4.1 }
        ],
        systems: [
          { name: 'Memorial Hermann', facilities: 10, marketShare: '25%' },
          { name: 'Houston Methodist', facilities: 7, marketShare: '20%' },
          { name: 'HCA Healthcare', facilities: 8, marketShare: '18%' },
          { name: 'Harris Health (safety net)', facilities: 3, marketShare: '10%' },
          { name: 'Texas Children\'s / MD Anderson / Other', facilities: 8, marketShare: '27%' }
        ],
        salary: {
          staffRN: '$34-48/hr',
          travelRN: '$2,300-3,000/wk',
          signOn: '$10-25K',
          systems: [
            { name: 'Houston Methodist', value: '$40-48/hr est', source: 'Job boards' },
            { name: 'Memorial Hermann', value: '$38-46/hr est', source: 'Job boards' },
            { name: 'MD Anderson', value: '$42-50/hr est', source: 'Job boards' },
            { name: 'Texas Children\'s', value: '$39-47/hr est', source: 'Job boards' },
            { name: 'HCA Healthcare', value: '$34-42/hr est', source: 'Job boards' }
          ]
        },
        factors: [
          { text: 'Texas Medical Center is world\'s largest medical complex', type: 'positive' },
          { text: 'Massive and diverse job market', type: 'positive' },
          { text: 'No state income tax boosts take-home pay', type: 'positive' },
          { text: 'High demand for oncology, peds, and trauma RNs', type: 'positive' },
          { text: 'Sprawling metro with long commute times', type: 'negative' },
          { text: 'Hurricane season staffing challenges', type: 'neutral' }
        ]
      },
      {
        name: 'Dallas-Fort Worth',
        size: 'major',
        population: '7.6M',
        competition: 'high',
        hospitals: [
          { name: 'UT Southwestern Medical Center', system: 'UT Southwestern', score: 94, beds: 740, reviews: 4.3 },
          { name: 'Baylor University Medical Center', system: 'Baylor Scott & White', score: 93, beds: 903, reviews: 4.2 },
          { name: 'Parkland Memorial Hospital', system: 'Parkland Health', score: 90, beds: 862, reviews: 4.0 },
          { name: 'Texas Health Presbyterian Dallas', system: 'Texas Health Resources', score: 88, beds: 850, reviews: 4.0 },
          { name: 'Medical City Dallas', system: 'HCA Healthcare', score: 87, beds: 661, reviews: 4.0 },
          { name: 'JPS Health Network', system: 'JPS Health', score: 86, beds: 537, reviews: 3.9 },
          { name: 'Cook Children\'s Medical Center', system: 'Cook Children\'s', score: 92, beds: 443, reviews: 4.4 },
          { name: 'Children\'s Medical Center Dallas', system: 'Children\'s Health', score: 93, beds: 490, reviews: 4.4 },
          { name: 'Baylor Scott & White All Saints - Fort Worth', system: 'Baylor Scott & White', score: 85, beds: 538, reviews: 3.9 }
        ],
        systems: [
          { name: 'Baylor Scott & White', facilities: 10, marketShare: '22%' },
          { name: 'Texas Health Resources', facilities: 14, marketShare: '20%' },
          { name: 'HCA Healthcare', facilities: 12, marketShare: '20%' },
          { name: 'UT Southwestern', facilities: 2, marketShare: '10%' },
          { name: 'Parkland / Other', facilities: 8, marketShare: '28%' }
        ],
        salary: {
          staffRN: '$34-48/hr',
          travelRN: '$2,200-2,900/wk',
          signOn: '$10-22K',
          systems: [
            { name: 'Baylor Scott & White', value: '$38-46/hr est', source: 'Job boards' },
            { name: 'Texas Health Resources', value: '$37-44/hr est', source: 'Job boards' },
            { name: 'UT Southwestern', value: '$40-48/hr est', source: 'Job boards' },
            { name: 'HCA Healthcare', value: '$34-42/hr est', source: 'Job boards' },
            { name: 'Parkland Health', value: '$38-45/hr est', source: 'Job boards' }
          ]
        },
        factors: [
          { text: 'Massive and rapidly growing metro', type: 'positive' },
          { text: 'Multiple competing systems drive wage competition', type: 'positive' },
          { text: 'No state income tax', type: 'positive' },
          { text: 'Strong academic medicine presence', type: 'positive' },
          { text: 'Extreme commute distances across DFW', type: 'negative' },
          { text: 'Corporate relocations driving population growth', type: 'neutral' }
        ]
      },
      {
        name: 'San Antonio',
        size: 'major',
        population: '2.6M',
        competition: 'high',
        hospitals: [
          { name: 'Methodist Hospital San Antonio', system: 'Methodist Healthcare', score: 90, beds: 1536, reviews: 4.1 },
          { name: 'University Hospital San Antonio', system: 'University Health', score: 89, beds: 716, reviews: 4.0 },
          { name: 'Baptist Medical Center San Antonio', system: 'Tenet Healthcare', score: 86, beds: 1577, reviews: 3.9 },
          { name: 'CHRISTUS Santa Rosa Hospital Medical Center', system: 'CHRISTUS Health', score: 85, beds: 433, reviews: 3.9 },
          { name: 'Brooke Army Medical Center (BAMC)', system: 'Military', score: 91, beds: 450, reviews: 4.2 },
          { name: 'Methodist Children\'s Hospital', system: 'Methodist Healthcare', score: 88, beds: 213, reviews: 4.2 }
        ],
        systems: [
          { name: 'Methodist Healthcare (HCA)', facilities: 6, marketShare: '30%' },
          { name: 'Tenet Healthcare', facilities: 4, marketShare: '20%' },
          { name: 'University Health', facilities: 2, marketShare: '18%' },
          { name: 'CHRISTUS Health', facilities: 3, marketShare: '12%' },
          { name: 'Military / Other', facilities: 4, marketShare: '20%' }
        ],
        salary: {
          staffRN: '$32-44/hr',
          travelRN: '$2,100-2,700/wk',
          signOn: '$8-18K',
          systems: [
            { name: 'Methodist Healthcare', value: '$36-43/hr est', source: 'Job boards' },
            { name: 'Tenet Healthcare', value: '$34-41/hr est', source: 'Job boards' },
            { name: 'University Health', value: '$37-44/hr est', source: 'Job boards' },
            { name: 'CHRISTUS Health', value: '$34-41/hr est', source: 'Job boards' }
          ]
        },
        factors: [
          { text: 'Major military healthcare hub (BAMC, Lackland)', type: 'positive' },
          { text: 'Affordable cost of living for large metro', type: 'positive' },
          { text: 'UT Health San Antonio academic pipeline', type: 'positive' },
          { text: 'Growing demand from aging population', type: 'positive' },
          { text: 'Bilingual (English/Spanish) preferred', type: 'neutral' }
        ]
      },
      {
        name: 'Austin',
        size: 'major',
        population: '2.3M',
        competition: 'high',
        hospitals: [
          { name: 'Ascension Seton Medical Center', system: 'Ascension', score: 89, beds: 458, reviews: 4.1 },
          { name: 'Dell Seton Medical Center at UT', system: 'Ascension', score: 91, beds: 211, reviews: 4.2 },
          { name: 'St. David\'s Medical Center', system: 'HCA Healthcare', score: 88, beds: 350, reviews: 4.0 },
          { name: 'St. David\'s North Austin Medical Center', system: 'HCA Healthcare', score: 86, beds: 396, reviews: 3.9 },
          { name: 'Dell Children\'s Medical Center', system: 'Ascension', score: 90, beds: 248, reviews: 4.3 },
          { name: 'Baylor Scott & White Medical Center - Round Rock', system: 'Baylor Scott & White', score: 85, beds: 300, reviews: 4.0 },
          { name: 'St. David\'s South Austin Medical Center', system: 'HCA Healthcare', score: 84, beds: 282, reviews: 3.8 }
        ],
        systems: [
          { name: 'HCA Healthcare (St. David\'s)', facilities: 6, marketShare: '40%' },
          { name: 'Ascension (Seton)', facilities: 4, marketShare: '30%' },
          { name: 'Baylor Scott & White', facilities: 2, marketShare: '15%' },
          { name: 'Independent/Other', facilities: 3, marketShare: '15%' }
        ],
        salary: {
          staffRN: '$33-46/hr',
          travelRN: '$2,200-2,800/wk',
          signOn: '$8-20K',
          systems: [
            { name: 'HCA Healthcare (St. David\'s)', value: '$36-44/hr est', source: 'Job boards' },
            { name: 'Ascension (Seton)', value: '$37-45/hr est', source: 'Job boards' },
            { name: 'Baylor Scott & White', value: '$35-43/hr est', source: 'Job boards' }
          ]
        },
        factors: [
          { text: 'Fastest-growing major metro in Texas', type: 'positive' },
          { text: 'Dell Medical School expanding academic medicine', type: 'positive' },
          { text: 'No state income tax', type: 'positive' },
          { text: 'Rising cost of living challenging affordability', type: 'negative' },
          { text: 'Tech industry driving healthcare benefit competition', type: 'neutral' },
          { text: 'Rapidly expanding suburban hospital capacity', type: 'positive' }
        ]
      }
    ]
  }