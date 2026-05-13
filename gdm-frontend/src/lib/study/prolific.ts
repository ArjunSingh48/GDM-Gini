const STUDY_KEY = "study_id";
const SESSION_KEY = "session_id";

export const setStudyId = (v: string) => { try { sessionStorage.setItem(STUDY_KEY, v); } catch {} };
export const getStudyId = (): string | null => { try { return sessionStorage.getItem(STUDY_KEY); } catch { return null; } };
export const setSessionId = (v: string) => { try { sessionStorage.setItem(SESSION_KEY, v); } catch {} };
export const getSessionId = (): string | null => { try { return sessionStorage.getItem(SESSION_KEY); } catch { return null; } };
