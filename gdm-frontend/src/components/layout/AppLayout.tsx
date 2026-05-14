import { Outlet } from "react-router-dom";
import BottomNav from "./BottomNav";
import GiniMascot from "@/components/gini/GiniMascot";
import SurveyReminder from "@/components/study/SurveyReminder";
import LanguageSwitcher from "@/components/study/LanguageSwitcher";
import SurveyCTA from "@/components/study/SurveyCTA";
import SurveyFab from "@/components/study/SurveyFab";

const AppLayout = () => {
  return (
    <div className="min-h-screen bg-background">
      <LanguageSwitcher className="fixed top-3 right-3 z-40" />
      <main className="pb-24 max-w-lg mx-auto px-4">
        <SurveyCTA />
        <Outlet />
      </main>
      <BottomNav />
      <SurveyFab />
      <GiniMascot />
      <SurveyReminder />
    </div>
  );
};

export default AppLayout;
