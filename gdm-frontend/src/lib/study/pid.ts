export const PID_RE = /^[A-Za-z0-9]{6,40}$/;
const KEY = "study_pid";

export const isValidPid = (pid: string | null | undefined): pid is string =>
  typeof pid === "string" && PID_RE.test(pid);

export const getStoredPid = (): string | null => {
  try {
    const v = sessionStorage.getItem(KEY);
    return isValidPid(v) ? v : null;
  } catch {
    return null;
  }
};

export const setStoredPid = (pid: string) => {
  try { sessionStorage.setItem(KEY, pid); } catch {}
};

export const clearStoredPid = () => {
  try { sessionStorage.removeItem(KEY); } catch {}
};
