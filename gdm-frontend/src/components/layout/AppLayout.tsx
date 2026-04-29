import { Outlet } from "react-router-dom";
import BottomNav from "./BottomNav";
import GiniMascot from "@/components/gini/GiniMascot";

const AppLayout = () => {
  return (
    <div className="min-h-screen bg-background">
      <main className="pb-24 max-w-lg mx-auto px-4">
        <Outlet />
      </main>
      <BottomNav />
      <GiniMascot />
    </div>
  );
};

export default AppLayout;
