import { Outlet } from "react-router-dom";
import BottomNav from "./BottomNav";
import GiniMascot from "@/components/gini/GiniMascot";
import SurveyReminder from "@/components/study/SurveyReminder";

const AppLayout = () => {
  return (
    <div className="min-h-screen bg-background">
      <main className="pb-24 max-w-lg mx-auto px-4">
        <Outlet />
      </main>
      <BottomNav />
      <GiniMascot />
      <SurveyReminder />
    </div>
  );
};

export default AppLayout;
