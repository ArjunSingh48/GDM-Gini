import { createContext, useContext, useState, useCallback } from "react";

interface DemoProfile {
  name: string;
  age: number;
  pregnancy_week: number;
  risk_level: string;
  pre_pregnancy_bmi: number;
  previous_gdm: boolean;
  family_diabetes_history: boolean;
  onboarding_completed: boolean;
}

interface DemoAuthContextType {
  isDemoMode: boolean;
  demoProfile: DemoProfile;
  enterDemoMode: () => void;
  exitDemoMode: () => void;
}

const defaultProfile: DemoProfile = {
  name: "Sarah",
  age: 30,
  pregnancy_week: 28,
  risk_level: "moderate",
  pre_pregnancy_bmi: 25.2,
  previous_gdm: false,
  family_diabetes_history: true,
  onboarding_completed: true,
};

const DemoAuthContext = createContext<DemoAuthContextType>({
  isDemoMode: false,
  demoProfile: defaultProfile,
  enterDemoMode: () => {},
  exitDemoMode: () => {},
});

export const DemoAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isDemoMode, setIsDemoMode] = useState(() => {
    return sessionStorage.getItem("gdm_demo_mode") === "true";
  });

  const enterDemoMode = useCallback(() => {
    sessionStorage.setItem("gdm_demo_mode", "true");
    setIsDemoMode(true);
  }, []);

  const exitDemoMode = useCallback(() => {
    sessionStorage.removeItem("gdm_demo_mode");
    setIsDemoMode(false);
  }, []);

  return (
    <DemoAuthContext.Provider value={{ isDemoMode, demoProfile: defaultProfile, enterDemoMode, exitDemoMode }}>
      {children}
    </DemoAuthContext.Provider>
  );
};

export const useDemoAuth = () => useContext(DemoAuthContext);
