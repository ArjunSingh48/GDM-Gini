const KEY = "study_consent";

export const setConsent = (v: boolean) => {
  try { sessionStorage.setItem(KEY, v ? "1" : "0"); } catch {}
};
export const hasConsent = (): boolean => {
  try { return sessionStorage.getItem(KEY) === "1"; } catch { return false; }
};
export const clearConsent = () => {
  try { sessionStorage.removeItem(KEY); } catch {}
};

export const PROLIFIC_DECLINE_URL = "https://app.prolific.com/submissions/complete?cc=C1MJOHSV";
