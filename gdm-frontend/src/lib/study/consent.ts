const KEY = "study_consent";
const SCREEN_KEY = "study_screening_passed";

export const setConsent = (v: boolean) => {
  try { sessionStorage.setItem(KEY, v ? "1" : "0"); } catch {}
};
export const hasConsent = (): boolean => {
  try { return sessionStorage.getItem(KEY) === "1"; } catch { return false; }
};
export const clearConsent = () => {
  try { sessionStorage.removeItem(KEY); sessionStorage.removeItem(SCREEN_KEY); } catch {}
};

export const setScreeningPassed = (v: boolean) => {
  try { sessionStorage.setItem(SCREEN_KEY, v ? "1" : "0"); } catch {}
};
export const hasScreeningPassed = (): boolean => {
  try { return sessionStorage.getItem(SCREEN_KEY) === "1"; } catch { return false; }
};

// Updated Prolific completion URLs (per professor feedback)
export const PROLIFIC_DECLINE_URL  = "https://app.prolific.com/submissions/complete?cc=CJP36C1H";
export const PROLIFIC_SCREENOUT_URL = "https://app.prolific.com/submissions/complete?cc=C19CNQSX";
export const PROLIFIC_COMPLETE_URL  = "https://app.prolific.com/submissions/complete?cc=CSI9H44M";
