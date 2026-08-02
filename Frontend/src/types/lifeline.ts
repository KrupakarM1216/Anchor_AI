export type UrgencyLevel = "critical" | "high" | "moderate";

export interface LifelineAction {
  action: string;
  why: string;
  how: string;
  priority?: string;
}

export interface LifelineScheme {
  name: string;
  ministry: string;
  benefit: string;
  valuePerYear: number;
  valueDisplay: string;
  eligibility: string;
  howToApply: string;
  applyUrl: string;
  timeToAccess: string;
}

export interface LifelineSchemeGroup {
  nationalSchemes: LifelineScheme[];
  stateSchemes: LifelineScheme[];
  stateName: string;
}

export interface LifelineHelpline {
  name: string;
  number: string;
  available: string;
  useFor: string;
}

export interface LifelineResult {
  urgencyLevel: UrgencyLevel;
  openingMessage: string;
  next24Hours: LifelineAction[];
  thisWeek: LifelineAction[];
  thisMonth: LifelineAction[];
  nationalSchemes: LifelineScheme[];
  stateSchemes: LifelineScheme[];
  stateName: string;
  totalSupportAvailable: number;
  totalSupportDisplay: string;
  doNotDo: string[];
  helplines: LifelineHelpline[];
  oneActionNow: string;
}

export interface LifelineFormData {
  crisisType: string;
  description: string;
  monthlyIncome: string;
  city: string;
  state: string;
  familySize: string;
  earnerType: string;
}

export type ScreenState = "intro" | "input" | "loading" | "results";

export interface CrisisType {
  value: string;
  emoji: string;
  title: string;
  description: string;
}
