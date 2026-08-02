export type FraudAssessment = {
  riskLevel: "safe" | "low" | "medium" | "high" | "critical";
  verdict: string;
  confidence: "low" | "medium" | "high";
  scamType: string;
  redFlags: Array<{ flag: string; why: string; rule?: string }>;
  greenFlags: string[];
  whatWouldHappen: { narrative: string; estimatedLoss: string };
  doNow: string[];
  reportTo: Array<{ channel: string; how: string }>;
  shareWarning: string;
  relatedFeatures: string[];
  mode?: "live" | "guided";
};

const REPORTING = [
  { channel: "1930 — Cyber Crime Helpline", how: "Call immediately if you have sent money or shared banking details." },
  { channel: "cybercrime.gov.in", how: "File a complaint and keep screenshots, transaction IDs, and phone numbers." },
];

/** A safe, useful response when an AI provider is not configured or temporarily unavailable. */
export function createGuidedFraudAssessment(input: string): FraudAssessment {
  const text = input.toLowerCase();
  const checks = [
    [/(guaranteed|assured).{0,24}(return|profit)|\b\d{1,3}%\s*(return|per month)/, "Guaranteed or unusually high returns", "Legitimate investments cannot promise fixed high returns."],
    [/(apk|download.{0,24}(app|file))/, "An APK or direct app download", "Apps sent outside an official app store can be used to steal information."],
    [/(today|tonight|urgent|limited time|last chance|hurry)/, "Pressure to act quickly", "Scammers use urgency so you skip independent checks."],
    [/(otp|pin|password|cvv|kyc).{0,60}(share|send|tell|give)|share.{0,40}(otp|pin|password|cvv)/, "Request for sensitive banking information", "Banks never need your OTP, PIN, password, or CVV to help you."],
    [/(fee|deposit|registration).{0,50}(pay|payment)|pay.{0,50}(fee|deposit|registration)/, "Money requested up front", "Genuine jobs and prizes do not require an advance payment to release money."],
    [/(no cibil|no documents|instant loan)/, "A loan promise with no normal checks", "Predatory loan apps often use this to obtain broad phone permissions."],
  ] as const;

  const redFlags = checks.flatMap(([pattern, flag, why]) => pattern.test(text) ? [{ flag, why }] : []);
  const investment = /(invest|trading|return|profit|wealth)/.test(text);
  const riskLevel: FraudAssessment["riskLevel"] = redFlags.length >= 3 ? "high" : redFlags.length ? "medium" : "low";

  return {
    riskLevel,
    verdict: riskLevel === "high"
      ? "This has several strong scam warning signs. Do not send money or install anything."
      : riskLevel === "medium"
        ? "This has warning signs. Verify it independently before you act."
        : "I cannot verify this from the message alone. Treat it as unverified until you check the official source.",
    confidence: redFlags.length >= 2 ? "high" : "medium",
    scamType: investment ? "Possible investment scam" : redFlags.length ? "Suspicious offer" : "Unverified offer",
    redFlags,
    greenFlags: [],
    whatWouldHappen: {
      narrative: riskLevel === "high"
        ? "The sender may first ask for a small payment or app install, show a fake balance, and then demand more money or access to withdraw it."
        : "A real provider should be easy to verify through its official website, registered details, and independently published contact number.",
      estimatedLoss: riskLevel === "high" ? "Your deposit and any additional money requested" : "Avoid paying until verified",
    },
    doNow: [
      "Do not send money, OTPs, passwords, or identity documents.",
      "Do not install an APK or allow screen-sharing or remote-access permissions.",
      "Verify the company using a contact number you find independently — not the one in the message.",
    ],
    reportTo: REPORTING,
    shareWarning: "Do not trust guaranteed returns, urgent deadlines, or APK links — verify every offer through an official source first.",
    relatedFeatures: ["Financial Health Score", "Rights Finder"],
    mode: "guided",
  };
}
