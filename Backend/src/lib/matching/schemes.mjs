import fs from 'fs';
import path from 'path';

// Load schemes from data files
const loadSchemes = () => {
  const schemesDir = path.resolve(process.cwd(), 'data', 'schemes');
  const files = fs.readdirSync(schemesDir);
  return files
    .filter(f => f.endsWith('.json'))
    .map(f => JSON.parse(fs.readFileSync(path.join(schemesDir, f), 'utf-8')));
};

// Deterministic rule engine
export const matchSchemes = (userProfile) => {
  const schemes = loadSchemes();
  const matches = [];

  for (const scheme of schemes) {
    let matchLevel = 'unlikely_match';
    let matchedCriteria = [];
    let unmetCriteria = [];

    // Simple deterministic evaluation
    if (scheme.id === 'pm-awas-yojana-urban-ews') {
      const isEligible = userProfile.income <= 300000 && userProfile.age >= 18 && !userProfile.ownsPuccaHouse;
      if (isEligible) {
        matchLevel = 'likely_match';
        matchedCriteria.push("Income under ₹3 lakh", "Age 18+", "Does not own a pucca house");
      } else {
        unmetCriteria.push("Did not meet income, age, or housing criteria.");
      }
    } 
    else if (scheme.id === 'ayushman-bharat-pmjay') {
      const isVulnerable = ['street_vendor', 'domestic_worker', 'construction_worker', 'unorganized_worker'].includes(userProfile.occupation);
      if (isVulnerable || userProfile.income === 0) {
        matchLevel = 'likely_match';
        matchedCriteria.push("Vulnerable occupation or no regular formal income");
      } else {
        matchLevel = 'possible_match';
        unmetCriteria.push("May require verification of SECC 2011 data status.");
      }
    }
    else if (scheme.id === 'pm-vishwakarma') {
      if (userProfile.occupation === 'traditional_artisan' && userProfile.age >= 18) {
        matchLevel = 'likely_match';
        matchedCriteria.push("Traditional artisan occupation", "Age 18+");
      }
    }
    else if (scheme.id === 'pm-svanidhi') {
      if (userProfile.occupation === 'street_vendor') {
        matchLevel = 'likely_match';
        matchedCriteria.push("Street vendor occupation");
      }
    }
    else if (scheme.id === 'e-shram') {
      const isUnorganized = ['street_vendor', 'domestic_worker', 'construction_worker', 'unorganized_worker', 'traditional_artisan'].includes(userProfile.occupation);
      if (isUnorganized && userProfile.age >= 16 && userProfile.age <= 59) {
        matchLevel = 'likely_match';
        matchedCriteria.push("Unorganized sector occupation", "Age between 16 and 59");
      }
    }
    else if (scheme.id === 'scss') {
      if (userProfile.age >= 60) {
        matchLevel = 'likely_match';
        matchedCriteria.push("Age 60+");
      }
    }

    if (matchLevel !== 'unlikely_match') {
      matches.push({
        schemeId: scheme.id,
        officialName: scheme.officialName,
        shortName: scheme.shortName,
        summary: scheme.summary,
        benefit: scheme.benefit,
        matchLevel,
        matchedCriteria,
        unmetCriteria,
        applicationSteps: scheme.applicationSteps,
        sources: scheme.sources,
        verifiedAt: scheme.verifiedAt
      });
    }
  }

  return matches;
};
