import { Village, SafeSite, SiteSuitabilityResult, RiskCategory, PriorityLevel } from '../types';

export const BASELINE_RISK_WEIGHTS = {
  elevation: 0.25,
  rain24h: 0.20,
  riverGauge: 0.20,
  bundBreach: 0.20,
  history: 0.15,
};

/**
 * Transparent Baseline Risk Score (0-100)
 */
export function calculateBaselineRiskScore(v: {
  elevationM: number;
  latestRainfall24hMm: number;
  riverWaterLevelM: number;
  bundBreachRiskPct: number;
  historicalFloodCount: number;
}): number {
  const elevFactor = Math.min(100, Math.max(0, Math.round((-(v.elevationM) / 2.0) * 100)));
  const rainFactor = Math.min(100, Math.round((v.latestRainfall24hMm / 200) * 100));
  const riverFactor = Math.min(100, Math.round(((v.riverWaterLevelM - 1.0) / 2.0) * 100));
  const bundFactor = v.bundBreachRiskPct;
  const historyFactor = Math.min(100, v.historicalFloodCount * 12);

  const rawScore = 
    elevFactor * BASELINE_RISK_WEIGHTS.elevation +
    rainFactor * BASELINE_RISK_WEIGHTS.rain24h +
    riverFactor * BASELINE_RISK_WEIGHTS.riverGauge +
    bundFactor * BASELINE_RISK_WEIGHTS.bundBreach +
    historyFactor * BASELINE_RISK_WEIGHTS.history;

  return Math.round(Math.min(100, Math.max(0, rawScore)));
}

export function getRiskCategory(score: number): RiskCategory {
  if (score >= 75) return 'Critical';
  if (score >= 55) return 'High';
  if (score >= 35) return 'Moderate';
  return 'Low';
}

export function getRelocationPriority(score: number, vulnerablePop: number): {
  priority: PriorityLevel;
  relocationRequired: boolean;
} {
  if (score >= 75 || (score >= 60 && vulnerablePop >= 800)) {
    return { priority: 'Immediate', relocationRequired: true };
  }
  if (score >= 55) {
    return { priority: 'Short-Term', relocationRequired: false };
  }
  if (score >= 35) {
    return { priority: 'Medium-Term', relocationRequired: false };
  }
  return { priority: 'Monitor', relocationRequired: false };
}

/**
 * Calculates geographic distance (Haversine formula in km)
 */
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Comprehensive Safe-Site Ranking & Multi-Criteria Carrying Capacity Engine
 * Enforces capacity deficit, potable water supply, sanitation, and elevation safety
 */
export function evaluateRelocationMatch(village: Village, site: SafeSite): SiteSuitabilityResult {
  const requiredPop = village.carryingCapacity.populationRequiringEvacuation;
  const availableCap = site.availableCapacity;
  const capacityDiff = availableCap - requiredPop;
  const distanceKm = calculateDistanceKm(village.lat, village.lng, site.lat, site.lng);

  const reasons: { text: string; passed: boolean }[] = [];

  // 1. Shelter Capacity (Hard check)
  const hasCapacity = capacityDiff >= 0;
  if (hasCapacity) {
    reasons.push({
      text: `Sufficient shelter capacity: ${availableCap.toLocaleString()} available seats vs ${requiredPop.toLocaleString()} required (Buffer: +${capacityDiff.toLocaleString()})`,
      passed: true
    });
  } else {
    reasons.push({
      text: `Capacity deficit: Requires ${requiredPop.toLocaleString()} spaces, but site has only ${availableCap.toLocaleString()} (Deficit: -${Math.abs(capacityDiff).toLocaleString()} persons)`,
      passed: false
    });
  }

  // 2. High Elevation Safety
  const isHighGround = site.elevationM >= 2.0;
  reasons.push({
    text: `Elevation buffer: Located at +${site.elevationM}m MSL (${isHighGround ? 'Elevated above all Kuttanad historical flood levels' : 'Low plinth staging refuge'})`,
    passed: isHighGround
  });

  // 3. Potable Water Supply (Sphere Minimum: 15L / person / day)
  const requiredWaterLpd = requiredPop * 15;
  const hasAdequateWater = site.drinkingWaterLpd >= requiredWaterLpd;
  reasons.push({
    text: `Drinking water capacity: ${site.drinkingWaterLpd.toLocaleString()} L/day vs ${requiredWaterLpd.toLocaleString()} L/day needed (${hasAdequateWater ? 'Meets Sphere 15L/day standard' : 'Water tanker augmentation needed'})`,
    passed: hasAdequateWater
  });

  // 4. Sanitation / Bio-Toilet Units (Standard: 1 toilet per 20-25 persons)
  const requiredToilets = Math.ceil(requiredPop / 25);
  const hasAdequateSanitation = site.sanitationToilets >= requiredToilets;
  reasons.push({
    text: `Sanitation facilities: ${site.sanitationToilets} units available vs ${requiredToilets} minimum recommended`,
    passed: hasAdequateSanitation
  });

  // 5. Medical Staff & Primary Health Station
  reasons.push({
    text: `Healthcare readiness: ${site.medicalStaffPresent ? 'Medical officer & emergency triage posted on-site' : 'External PHC transit required'}`,
    passed: site.medicalStaffPresent
  });

  // 6. Transit Corridor & Road Accessibility
  const hasGoodRoad = site.roadAccess === 'Good' || site.roadAccess === 'Moderate';
  reasons.push({
    text: `Logistics connectivity: ${site.roadAccess} road access (${distanceKm} km from ${village.name})`,
    passed: hasGoodRoad
  });

  // Calculate Suitability Score (0 - 100)
  let score = 0;
  if (!hasCapacity) {
    // If capacity deficit exists, suitability is strictly penalized
    score = Math.max(15, Math.round(40 - (Math.abs(capacityDiff) / requiredPop) * 25));
    return {
      siteId: site.id,
      siteName: site.name,
      isSuitable: false,
      suitabilityScore: score,
      capacityDiff,
      reasons,
      verdict: 'NOT SUITABLE',
      verdictSummary: `Not suitable as primary evacuation sanctuary — capacity deficit of ${Math.abs(capacityDiff).toLocaleString()} persons. Can only be utilized as an emergency interim transit staging point.`,
      capacityAudit: {
        requiredPopulation: requiredPop,
        availableShelter: availableCap,
        deficit: Math.abs(capacityDiff),
        waterAdequate: hasAdequateWater,
        sanitationAdequate: hasAdequateSanitation,
      }
    };
  }

  // Base score
  let base = 55;
  // Extra capacity buffer points
  const bufferRatio = capacityDiff / requiredPop;
  base += Math.min(15, Math.round(bufferRatio * 10));

  // Elevation points
  if (site.elevationM >= 10.0) base += 12; // Highland ridge (e.g. Changanassery)
  else if (site.elevationM >= 2.5) base += 8;

  // Infrastructure points
  if (site.roadAccess === 'Good') base += 6;
  if (hasAdequateWater) base += 5;
  if (hasAdequateSanitation) base += 4;
  if (site.medicalStaffPresent) base += 5;
  if (site.isOfficialKsdmaCamp) base += 3;

  // Transit distance penalty
  if (distanceKm > 20) base -= 6;
  else if (distanceKm <= 12) base += 4;

  score = Math.min(98, Math.max(45, base));
  const verdict = score >= 80 ? 'RECOMMENDED' : 'SECONDARY OPTION';
  const verdictSummary = `${site.name} is ${verdict.toLowerCase()} for relocation of ${village.name} residents based on elevated topography (+${site.elevationM}m MSL), available carrying capacity, and medical/sanitation support.`;

  return {
    siteId: site.id,
    siteName: site.name,
    isSuitable: true,
    suitabilityScore: score,
    capacityDiff,
    reasons,
    verdict,
    verdictSummary,
    capacityAudit: {
      requiredPopulation: requiredPop,
      availableShelter: availableCap,
      deficit: 0,
      waterAdequate: hasAdequateWater,
      sanitationAdequate: hasAdequateSanitation,
    }
  };
}
