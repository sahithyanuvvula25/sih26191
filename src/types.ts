export type HazardType = 'Flood' | 'Waterlogging' | 'Bund Breach' | 'Bank Erosion';

export type RiskCategory = 'Low' | 'Moderate' | 'High' | 'Critical';

export type PriorityLevel = 'Immediate' | 'Short-Term' | 'Medium-Term' | 'Monitor';

export type DataSourceType = 'OFFICIAL' | 'DERIVED' | 'ESTIMATED' | 'MODEL PREDICTION';

export interface FeatureContribution {
  feature: string;
  label: string;
  value: string | number;
  contribution: number; // positive increases risk, negative decreases
  description: string;
}

export interface MLPrediction {
  predictedProbability: number; // 0.00 to 1.00 (from Random Forest ensemble)
  binaryPrediction: 0 | 1; // 0 = no significant flood, 1 = significant flood
  riskCategory: RiskCategory;
  predictionConfidence: number; // probability margin
  primaryContributingFactors: FeatureContribution[];
  modelName: string;
  modelVersion: string;
}

export interface CarryingCapacityAssessment {
  populationRequiringEvacuation: number;
  availableSafeCapacity: number;
  capacityDeficit: number; // populationRequiringEvacuation - availableSafeCapacity (if > 0, deficit)
  shelterDeficit: number;
  potableWaterLpdAvailable: number; // Litres per day
  potableWaterLpdRequired: number; // 15L/person/day
  sanitationUnitsAvailable: number;
  sanitationUnitsRequired: number; // 1 per 20 persons
  healthcareReadiness: 'Adequate' | 'Strained' | 'Critical Deficit';
  roadAccessibilityStatus: 'Fully Accessible' | 'Partially Waterlogged' | 'Submerged / Boat Only';
  waterwayReadiness: 'SWTD Rescue Boats Deployed' | 'Standby' | 'Obstructed by Water Hyacinth';
}

export interface EvacuationRoute {
  assemblyPoint: string;
  transitMode: 'Boat + Road' | 'Waterway Inland Transit' | 'Elevated Road Convoy';
  primaryRouteName: string;
  routeStatus: 'Clear' | 'Waterlogged at Chithira' | 'Submerged at AC Road Km 12' | 'Requires Motorized Country Crafts';
  distanceKm: number;
  estimatedTravelTimeMins: number;
  alternativeRouteName: string;
  designatedReliefShelterName: string;
}

export interface HistoricalYearData {
  year: number;
  rainfallMm: number;
  peak24hMm: number;
  floodDepthM: number;
  floodOccurred: boolean;
  severity: 'None' | 'Moderate' | 'Severe' | 'Catastrophic';
  notes: string;
}

export interface Village {
  id: string;
  name: string;
  localBodyName: string; // e.g. Kainakary Grama Panchayat
  taluk: string; // Kuttanad
  district: string; // Alappuzha
  lat: number;
  lng: number;
  population: number; // Census of India 2011 / Panchayat Records
  households: number;
  vulnerablePopulation: number; // Elderly, children, infants, persons with disabilities
  elevationM: number; // Relative to Mean Sea Level (e.g. -1.8m in Kuttanad polders)
  distanceToWaterbodyM: number;
  polderName: string; // Name of Padasekharam (e.g., Kuttamangalam, R-Block, Valiya Vembanaad)
  bundBreachRiskPct: number; // Risk of agricultural polder earthen bund collapse
  drainageDensity: number; // km/km2 of canals and streams
  
  // Weather & Hydrology observations (Latest IMD & CWC Gauge)
  latestRainfall24hMm: number;
  latestMonsoonRainfallMm: number;
  rainfallAnomalyPct: number; // Deviation from long-term normal
  riverWaterLevelM: number; // Pamba / Manimala river gauge reading in meters MSL
  dangerWaterLevelM: number; // Gauge threshold
  historicalFloodCount: number; // High inundations since 2005

  // Baseline transparent index (0-100)
  baselineRiskScore: number;
  baselineRiskCategory: RiskCategory;

  // ML Random Forest Prediction Output
  mlPrediction: MLPrediction;

  // Carrying Capacity Analysis
  carryingCapacity: CarryingCapacityAssessment;

  // Relocation Recommendation (Decision Support)
  relocationRecommendation: 'Monitor' | 'Preparedness Alert' | 'Temporary Evacuation' | 'Partial Relocation' | 'Permanent Relocation Assessment';
  relocationPriority: PriorityLevel;
  relocationRequired: boolean;

  // Evacuation route blueprint
  evacuationRoute: EvacuationRoute;

  // Historical Disaster Record (2005 - 2025)
  historicalTimeline: HistoricalYearData[];

  // Data Quality Metrics
  dataQuality: {
    officialPct: number;
    derivedPct: number;
    estimatedPct: number;
    modelPredictionPct: number;
    lastUpdated: string;
  };

  reasonsWhyAtRisk: string[];
}

export interface SafeSite {
  id: string;
  name: string;
  locationName: string;
  taluk: string;
  lat: number;
  lng: number;
  elevationM: number; // Height above MSL (high ground: +2.8m to +14m)
  maxCapacity: number;
  currentPopulation: number;
  availableCapacity: number; // maxCapacity - currentPopulation
  drinkingWaterLpd: number;
  sanitationToilets: number;
  medicalStaffPresent: boolean;
  roadAccess: 'Good' | 'Moderate' | 'Difficult';
  boatAccess: boolean;
  electricityStatus: 'Stable Grid + Solar Backup' | 'Grid Dependent' | 'Generator Transit';
  shelterStatus: 'Multi-Purpose Cyclone/Disaster Shelter' | 'College/School Camp' | 'Community Hall Refuge';
  hazardExposure: 'Negligible' | 'Low' | 'Moderate';
  suitabilityScore: number; // 0-100
  distanceToKainakaryKm: number;
  isOfficialKsdmaCamp: boolean;
}

export interface RedZone {
  id: string;
  name: string;
  primaryHazard: HazardType;
  riskLevel: 'Critical' | 'High';
  affectedVillageIds: string[];
  recommendedAction: string;
  description: string;
  peakFloodDepthRecordedM: number;
  coordinates: [number, number][]; // Polygon vertices
}

export interface SiteSuitabilityResult {
  siteId: string;
  siteName: string;
  isSuitable: boolean;
  suitabilityScore: number;
  capacityDiff: number; // available - required
  reasons: {
    text: string;
    passed: boolean;
  }[];
  verdict: 'RECOMMENDED' | 'NOT SUITABLE' | 'SECONDARY OPTION';
  verdictSummary: string;
  capacityAudit: {
    requiredPopulation: number;
    availableShelter: number;
    deficit: number;
    waterAdequate: boolean;
    sanitationAdequate: boolean;
  };
}

export interface MLModelMetrics {
  modelName: string;
  algorithm: string;
  trainingPeriod: string; // '2005 - 2018'
  validationPeriod: string; // '2019 - 2021'
  testingPeriod: string; // '2022 - 2025'
  totalSamples: number;
  trainSamples: number;
  valSamples: number;
  testSamples: number;
  accuracy: number; // Calculated from test set
  precision: number;
  recall: number;
  f1Score: number;
  rocAuc: number;
  confusionMatrix: {
    truePositive: number;
    falsePositive: number;
    trueNegative: number;
    falseNegative: number;
  };
  featureImportances: {
    feature: string;
    label: string;
    importance: number; // 0.0 to 1.0 sum to 1
  }[];
  lastTrainedDate: string;
  dataProvenance: string;
}

export interface SimulationParams {
  rainfallIncreasePct: number; // e.g. +20%
  riverWaterLevelIncreaseM: number; // e.g. +0.5m
  polderBundBreachSimulated: boolean; // Bund failure
  shelterCapacityChangePct: number; // e.g. -20%
  acRoadBlocked: boolean; // Alappuzha-Changanassery road waterlogged
}

export interface DataSourceItem {
  id: string;
  datasetName: string;
  authority: string;
  url: string;
  timePeriod: string;
  spatialResolution: string;
  updateFrequency: string;
  dataType: DataSourceType;
  description: string;
  reliabilityNotes: string;
}

export type NavigationPage = 
  | 'dashboard' 
  | 'red-zones'
  | 'villages' 
  | 'village-detail' 
  | 'hazard-analysis'
  | 'planning' 
  | 'sites' 
  | 'site-detail' 
  | 'carrying-capacity'
  | 'map' 
  | 'reports'
  | 'analytics' 
  | 'sources'
  | 'settings'
  | 'simulation';

export type ActivePage = NavigationPage;
