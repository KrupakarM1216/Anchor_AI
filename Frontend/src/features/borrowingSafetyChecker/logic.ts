/**
 * Borrowing Safety Checker — core logic
 * ---------------------------------------
 * Pure, deterministic calculation module. No AI calls needed here —
 * everything is math + rule-based checks. Safe to unit test directly.
 *
 * Drop this file in as e.g. `src/features/borrowingSafetyChecker/logic.ts`
 */

// ---------- Types ----------

export type LoanPurpose =
  | 'medical'
  | 'education'
  | 'business'
  | 'emergency'
  | 'consumption'
  | 'other';

export interface BorrowingSafetyInput {
  monthlyIncome: number;
  existingEMI: number;
  /** Optional: number of currently active loans/BNPL/credit lines, used for the "multiple loans" flag */
  existingLoanCount?: number;
  loanAmount: number;
  /** Annual interest rate, in % (e.g. 24 for 24% p.a.) */
  annualInterestRate: number;
  tenureMonths: number;
  /** Processing fee amount, OR a percentage if processingFeeIsPercent is true */
  processingFee: number;
  processingFeeIsPercent?: boolean;
  purpose: LoanPurpose;
  lenderName: string;
  /** Set true if the lender is a verified bank / RBI-registered NBFC. Leave undefined/false if unknown. */
  isRegulatedLender?: boolean;
  asksContactsAccess?: boolean;
  asksGalleryAccess?: boolean;
}

export type DebtPressureLevel = 'Safe' | 'Caution' | 'High Pressure';

export type WarningSeverity = 'low' | 'medium' | 'high';

export interface TrapWarning {
  code: string;
  severity: WarningSeverity;
  message: string;
}

export interface BorrowingSafetyResult {
  monthlyEMI: number;
  totalRepayable: number;
  totalInterest: number;
  processingFeeAmount: number;
  /** Total repayable + processing fee — the real all-in cost */
  totalCost: number;
  hiddenFeeImpactPercent: number;
  /** (existing EMI + new EMI) / monthly income, as a fraction (0.42 = 42%) */
  emiToIncomeRatio: number;
  debtPressureLevel: DebtPressureLevel;
  canAfford: boolean;
  warnings: TrapWarning[];
  saferNextSteps: string[];
  /** One-paragraph human-readable summary, matching the demo output style */
  summary: string;
}

// ---------- Tunable thresholds (edit freely, keep in one place) ----------

export const THRESHOLDS = {
  /** EMI-to-income ratio at/under which we call it Safe */
  SAFE_MAX_RATIO: 0.3,
  /** EMI-to-income ratio at/under which we call it Caution (above = High Pressure) */
  CAUTION_MAX_RATIO: 0.45,
  /** Annual interest rate (%) above which we flag "very high interest" */
  HIGH_INTEREST_ANNUAL_PCT: 30,
  /** Processing fee as % of loan amount above which we flag "upfront fee" */
  HIGH_PROCESSING_FEE_PCT: 3,
  /** Existing active loans/lines at/above which we flag "multiple loans" */
  MULTIPLE_LOANS_COUNT: 2,
} as const;

// ---------- Core math ----------

/**
 * Standard reducing-balance EMI formula.
 * EMI = P * r * (1+r)^n / ((1+r)^n - 1)
 * Falls back to a simple division when interest rate is 0.
 */
export function calculateEMI(
  principal: number,
  annualInterestRatePct: number,
  tenureMonths: number
): number {
  if (principal <= 0 || tenureMonths <= 0) return 0;

  const monthlyRate = annualInterestRatePct / 12 / 100;

  if (monthlyRate === 0) {
    return principal / tenureMonths;
  }

  const factor = Math.pow(1 + monthlyRate, tenureMonths);
  const emi = (principal * monthlyRate * factor) / (factor - 1);
  return emi;
}

function resolveProcessingFeeAmount(input: BorrowingSafetyInput): number {
  if (input.processingFeeIsPercent) {
    return (input.processingFee / 100) * input.loanAmount;
  }
  return input.processingFee;
}

// ---------- Warnings / loan trap detection ----------

function buildWarnings(
  input: BorrowingSafetyInput,
  computed: {
    processingFeeAmount: number;
    hiddenFeeImpactPercent: number;
    emiToIncomeRatio: number;
  }
): TrapWarning[] {
  const warnings: TrapWarning[] = [];

  if (input.annualInterestRate > THRESHOLDS.HIGH_INTEREST_ANNUAL_PCT) {
    warnings.push({
      code: 'HIGH_INTEREST',
      severity: 'high',
      message: `Interest rate of ${input.annualInterestRate}% p.a. is very high. Regulated lenders rarely charge this much for this kind of loan — compare other options before proceeding.`,
    });
  }

  if (computed.hiddenFeeImpactPercent > THRESHOLDS.HIGH_PROCESSING_FEE_PCT) {
    warnings.push({
      code: 'HIGH_UPFRONT_FEE',
      severity: 'medium',
      message: `The processing fee (${computed.hiddenFeeImpactPercent.toFixed(
        1
      )}% of the loan) is unusually high. Legitimate lenders typically deduct fees from the disbursed amount and disclose them upfront — confirm this is clearly stated in writing.`,
    });
  }

  if (input.isRegulatedLender === false || input.isRegulatedLender === undefined) {
    warnings.push({
      code: 'UNVERIFIED_LENDER',
      severity: input.isRegulatedLender === false ? 'high' : 'medium',
      message: input.lenderName
        ? `We could not confirm "${input.lenderName}" is an RBI-registered bank or NBFC. Verify it on the RBI website before sharing any documents or making payments.`
        : `Lender identity is unclear. Only borrow from RBI-registered banks or NBFCs, or well-known regulated apps.`,
    });
  }

  if (input.asksContactsAccess || input.asksGalleryAccess) {
    const items = [
      input.asksContactsAccess ? 'contacts' : null,
      input.asksGalleryAccess ? 'photos/gallery' : null,
    ].filter(Boolean);
    warnings.push({
      code: 'SUSPICIOUS_PERMISSIONS',
      severity: 'high',
      message: `This app requests access to your ${items.join(
        ' and '
      )}. Legitimate lending apps do not need this. This is a common pattern used for harassment-based recovery in loan-trap scams — do not install or grant access until you verify the lender.`,
    });
  }

  if ((input.existingLoanCount ?? 0) >= THRESHOLDS.MULTIPLE_LOANS_COUNT) {
    warnings.push({
      code: 'MULTIPLE_LOANS',
      severity: 'medium',
      message: `You already have ${input.existingLoanCount} active loans/credit lines. Taking on another increases the risk of a debt spiral — consider consolidating instead of adding a new loan.`,
    });
  }

  if (computed.emiToIncomeRatio > THRESHOLDS.CAUTION_MAX_RATIO) {
    warnings.push({
      code: 'AFFORDABILITY_RISK',
      severity: 'high',
      message: `Combined EMIs would take up ${(computed.emiToIncomeRatio * 100).toFixed(
        0
      )}% of your monthly income, putting essential expenses (rent, food, utilities) at risk.`,
    });
  }

  return warnings;
}

function determinePressureLevel(ratio: number): DebtPressureLevel {
  if (ratio <= THRESHOLDS.SAFE_MAX_RATIO) return 'Safe';
  if (ratio <= THRESHOLDS.CAUTION_MAX_RATIO) return 'Caution';
  return 'High Pressure';
}

function buildSaferNextSteps(
  level: DebtPressureLevel,
  warnings: TrapWarning[],
  purpose: LoanPurpose
): string[] {
  const steps: string[] = [];

  const hasHighSeverity = warnings.some((w) => w.severity === 'high');

  if (level === 'High Pressure' || hasHighSeverity) {
    steps.push('Wait before borrowing — this loan is likely to hurt your finances.');
    steps.push('Try to borrow a smaller amount, or extend the tenure to lower the EMI.');
  } else if (level === 'Caution') {
    steps.push('Proceed carefully — consider borrowing slightly less to stay under 30% of your income.');
  }

  if (warnings.some((w) => w.code === 'UNVERIFIED_LENDER' || w.code === 'SUSPICIOUS_PERMISSIONS')) {
    steps.push('Verify the lender is RBI-registered before sharing any documents or making payments.');
  }

  if (warnings.some((w) => w.code === 'HIGH_INTEREST' || w.code === 'HIGH_UPFRONT_FEE')) {
    steps.push('Compare at least 2–3 regulated lenders (banks, NBFCs) for a lower rate.');
  }

  if (['medical', 'education', 'emergency'].includes(purpose)) {
    steps.push('Check if a government scheme or employer/institution support option can cover part of this need.');
  }

  if (level === 'High Pressure' && purpose === 'emergency') {
    steps.push('If this is a financial emergency, seek urgent help before taking on high-cost debt.');
  }

  if (steps.length === 0) {
    steps.push('This loan looks manageable — just confirm the lender and terms in writing before signing.');
  }

  // De-duplicate while preserving order
  return Array.from(new Set(steps));
}

// ---------- Summary text (matches the demo output style) ----------

function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

function buildSummary(input: BorrowingSafetyInput, result: Omit<BorrowingSafetyResult, 'summary'>): string {
  const ratioPct = (result.emiToIncomeRatio * 100).toFixed(0);
  const riskClause =
    result.debtPressureLevel === 'High Pressure'
      ? 'which puts essential expenses at risk'
      : result.debtPressureLevel === 'Caution'
      ? 'which leaves little room for other expenses'
      : 'which is a manageable share of your income';

  let summary = `This ${formatINR(input.loanAmount)} loan may cost you ${formatINR(
    result.totalCost
  )} in total. Your EMI would consume ${ratioPct}% of your monthly income, ${riskClause}.`;

  const permissionWarning = result.warnings.find((w) => w.code === 'SUSPICIOUS_PERMISSIONS');
  if (permissionWarning) {
    summary += ' Do not install the app until you verify the lender and permissions.';
  } else if (result.warnings.some((w) => w.code === 'UNVERIFIED_LENDER')) {
    summary += ' Verify the lender is RBI-registered before proceeding.';
  }

  return summary;
}

// ---------- Public entry point ----------

export function checkBorrowingSafety(input: BorrowingSafetyInput): BorrowingSafetyResult {
  const monthlyEMI = calculateEMI(input.loanAmount, input.annualInterestRate, input.tenureMonths);
  const totalRepayable = monthlyEMI * input.tenureMonths;
  const totalInterest = totalRepayable - input.loanAmount;
  const processingFeeAmount = resolveProcessingFeeAmount(input);
  const totalCost = totalRepayable + processingFeeAmount;
  const hiddenFeeImpactPercent = input.loanAmount > 0 ? (processingFeeAmount / input.loanAmount) * 100 : 0;

  const combinedEMI = input.existingEMI + monthlyEMI;
  const emiToIncomeRatio = input.monthlyIncome > 0 ? combinedEMI / input.monthlyIncome : 1;

  const debtPressureLevel = determinePressureLevel(emiToIncomeRatio);
  const canAfford = debtPressureLevel !== 'High Pressure';

  const warnings = buildWarnings(input, {
    processingFeeAmount,
    hiddenFeeImpactPercent,
    emiToIncomeRatio,
  });

  const saferNextSteps = buildSaferNextSteps(debtPressureLevel, warnings, input.purpose);

  const partialResult: Omit<BorrowingSafetyResult, 'summary'> = {
    monthlyEMI,
    totalRepayable,
    totalInterest,
    processingFeeAmount,
    totalCost,
    hiddenFeeImpactPercent,
    emiToIncomeRatio,
    debtPressureLevel,
    canAfford,
    warnings,
    saferNextSteps,
  };

  return {
    ...partialResult,
    summary: buildSummary(input, partialResult),
  };
}
