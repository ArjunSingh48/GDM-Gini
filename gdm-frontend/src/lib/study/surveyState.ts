export const SURVEY_DONE_KEY = "study_survey_done";
export const SURVEY_PROMPT_SHOWN_KEY = "study_survey_prompt_shown";
export const SURVEY_TIMER_START_KEY = "study_survey_timer_start";

export const isSurveyDone = (): boolean => {
  try { return localStorage.getItem(SURVEY_DONE_KEY) === "1"; } catch { return false; }
};

export const wasPromptShown = (): boolean => {
  try { return sessionStorage.getItem(SURVEY_PROMPT_SHOWN_KEY) === "1"; } catch { return false; }
};

export const markPromptShown = () => {
  try { sessionStorage.setItem(SURVEY_PROMPT_SHOWN_KEY, "1"); } catch {}
};

export const getOrInitTimerStart = (): number => {
  try {
    const existing = localStorage.getItem(SURVEY_TIMER_START_KEY);
    if (existing) {
      const n = parseInt(existing, 10);
      if (!Number.isNaN(n)) return n;
    }
    const now = Date.now();
    localStorage.setItem(SURVEY_TIMER_START_KEY, String(now));
    return now;
  } catch {
    return Date.now();
  }
};
