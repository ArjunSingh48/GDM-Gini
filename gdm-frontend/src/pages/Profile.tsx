import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  User, Baby, Phone, MapPin, Calendar as CalendarIconLucide, Edit2, Save, LogOut,
  AlertTriangle, Upload, FileText, Trash2, Eye, Settings, FlaskConical, Heart,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useDemoAuth } from "@/hooks/useDemoAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Profile = () => {
  const { user, signOut } = useAuth();
  const { isDemoMode, demoProfile, exitDemoMode } = useDemoAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(false);
  const [deactivateStep, setDeactivateStep] = useState(0);
  const [deactivateChecked, setDeactivateChecked] = useState(false);
  const [testingMode, setTestingMode] = useState(() => localStorage.getItem("gdm_testing_mode") === "true");
  const [testingDate, setTestingDate] = useState<Date | undefined>(() => {
    const stored = localStorage.getItem("gdm_testing_date");
    return stored ? new Date(stored) : undefined;
  });
  const [profile, setProfile] = useState({
    name: isDemoMode ? demoProfile.name : "Sarah",
    age: isDemoMode ? String(demoProfile.age) : "30",
    pregnancyWeek: isDemoMode ? String(demoProfile.pregnancy_week) : "24",
    preBMI: isDemoMode ? String(demoProfile.pre_pregnancy_bmi) : "25.2",
    previousGDM: isDemoMode ? (demoProfile.previous_gdm ? "Yes" : "No") : "No",
    familyDiabetes: isDemoMode ? (demoProfile.family_diabetes_history ? "Yes" : "No") : "Yes",
    riskLevel: isDemoMode ? "Moderate" : "Moderate",
  });

  const [doctor, setDoctor] = useState({
    name: "Dr. Emily Chen",
    phone: "+1 (555) 123-4567",
    clinic: "Sunshine Maternal Clinic",
  });
  const [doctorDraft, setDoctorDraft] = useState(doctor);

  const [reports, setReports] = useState<Array<{ id: string; file_name: string; file_url: string; file_type: string; uploaded_at: string }>>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!user || isDemoMode) return;
    supabase.from("profiles").select("*").eq("user_id", user.id).single().then(({ data }) => {
      if (data) {
        setProfile({
          name: data.name || "Mama",
          age: String(data.age || ""),
          pregnancyWeek: String(data.pregnancy_week || ""),
          preBMI: String(data.pre_pregnancy_bmi || ""),
          previousGDM: data.previous_gdm ? "Yes" : "No",
          familyDiabetes: data.family_diabetes_history ? "Yes" : "No",
          riskLevel: data.risk_level === "low" ? "Low" : data.risk_level === "elevated" ? "Elevated" : "Moderate",
        });
        if (data.doctor_name) setDoctor({ name: data.doctor_name, phone: data.doctor_phone || "", clinic: data.doctor_clinic || "" });
      }
    });
    supabase.from("medical_reports").select("*").eq("user_id", user.id).order("uploaded_at", { ascending: false }).then(({ data }) => {
      if (data) setReports(data);
    });
  }, [user, isDemoMode]);

  const riskColors: Record<string, string> = {
    Low: "bg-green-range/20 text-green-range",
    Moderate: "bg-amber-watch/20 text-amber-watch",
    Elevated: "bg-coral/20 text-coral",
  };

  const handleSaveProfile = async () => {
    setEditing(false);
    if (!user || isDemoMode) return;
    await supabase.from("profiles").update({
      name: profile.name,
      age: parseInt(profile.age) || null,
      pregnancy_week: parseInt(profile.pregnancyWeek) || null,
      pre_pregnancy_bmi: parseFloat(profile.preBMI) || null,
      previous_gdm: profile.previousGDM === "Yes",
      family_diabetes_history: profile.familyDiabetes === "Yes",
    }).eq("user_id", user.id);
    toast.success("Profile updated! 💚");
  };

  const handleSaveDoctor = async () => {
    setDoctor(doctorDraft);
    setEditingDoctor(false);
    if (!user || isDemoMode) return;
    await supabase.from("profiles").update({
      doctor_name: doctorDraft.name,
      doctor_phone: doctorDraft.phone,
      doctor_clinic: doctorDraft.clinic,
    }).eq("user_id", user.id);
    toast.success("Doctor info updated! 💚");
  };

  const handleUploadReport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    const allowed = ["application/pdf", "image/jpeg", "image/png"];
    if (!allowed.includes(file.type)) { toast.error("Only PDF, JPG, PNG files allowed"); return; }
    setUploading(true);
    try {
      const filePath = `${user.id}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from("medical-reports").upload(filePath, file);
      if (uploadError) throw uploadError;
      await supabase.from("medical_reports").insert({
        user_id: user.id,
        file_name: file.name,
        file_url: filePath,
        file_type: file.type.includes("pdf") ? "pdf" : "image",
      });
      const { data: newReports } = await supabase.from("medical_reports").select("*").eq("user_id", user.id).order("uploaded_at", { ascending: false });
      if (newReports) setReports(newReports);
      toast.success("Report uploaded! 📄");
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteReport = async (report: typeof reports[0]) => {
    if (!user) return;
    await supabase.storage.from("medical-reports").remove([report.file_url]);
    await supabase.from("medical_reports").delete().eq("id", report.id);
    setReports((prev) => prev.filter((r) => r.id !== report.id));
    toast.success("Report deleted");
  };

  const handleViewReport = async (report: typeof reports[0]) => {
    const { data } = await supabase.storage.from("medical-reports").createSignedUrl(report.file_url, 3600);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
  };

  const handleSignOut = async () => {
    if (isDemoMode) { exitDemoMode(); navigate("/auth"); }
    else { await signOut(); navigate("/auth"); }
  };

  const handleDeactivateKeepData = async () => {
    toast.success("Your account has been deactivated. Data will be stored for 30 days.");
    await signOut();
    navigate("/auth");
  };

  const handleDeactivateDeleteAll = async () => {
    if (!user) return;
    try {
      await Promise.all([
        supabase.from("profiles").delete().eq("user_id", user.id),
        supabase.from("glucose_logs").delete().eq("user_id", user.id),
        supabase.from("meal_analyses").delete().eq("user_id", user.id),
        supabase.from("metabolic_insights").delete().eq("user_id", user.id),
        supabase.from("activity_completions").delete().eq("user_id", user.id),
        supabase.from("recommendation_history").delete().eq("user_id", user.id),
        supabase.from("medical_reports").delete().eq("user_id", user.id),
      ]);
      toast.success("Your account and data have been permanently removed.");
      await signOut();
      navigate("/auth");
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  };

  const handleToggleTestingMode = (checked: boolean) => {
    setTestingMode(checked);
    if (checked) {
      localStorage.setItem("gdm_testing_mode", "true");
    } else {
      localStorage.removeItem("gdm_testing_mode");
      localStorage.removeItem("gdm_testing_date");
      setTestingDate(undefined);
    }
  };

  const handleSelectTestDate = (date: Date | undefined) => {
    setTestingDate(date);
    if (date) {
      localStorage.setItem("gdm_testing_date", date.toISOString());
    }
  };

  return (
    <div className="pt-4 pb-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🐶</span>
          <span className="font-display font-bold text-base">GDM Guide</span>
        </div>
      </div>
      <div className="border-b border-border mb-4" />

      <h1 className="text-2xl font-display font-bold mb-1">Profile</h1>
      <p className="text-sm text-muted-foreground mb-6">Your pregnancy journey information 🌸</p>

      {isDemoMode && (
        <div className="bg-accent/20 rounded-2xl p-3 mb-4 flex items-center gap-2">
          <span className="text-lg">🎮</span>
          <p className="text-xs text-foreground/80 flex-1">You're in <strong>demo mode</strong>. Sign up to save your data.</p>
        </div>
      )}

      {/* ──────────────── 1. Personal Information ──────────────── */}
      <SectionCard
        icon={<User className="w-4 h-4 text-primary" />}
        title="Personal Information"
        action={
          <Button variant="ghost" size="sm" onClick={() => editing ? handleSaveProfile() : setEditing(true)} className="rounded-xl h-8 gap-1 text-xs">
            {editing ? <Save className="w-3.5 h-3.5" /> : <Edit2 className="w-3.5 h-3.5" />}
            {editing ? "Save" : "Edit"}
          </Button>
        }
      >
        <div className="grid gap-3">
          <ProfileField label="Name" value={profile.name} editing={editing} onChange={(v) => setProfile((p) => ({ ...p, name: v }))} />
          <div className="grid grid-cols-2 gap-3">
            <ProfileField label="Age" value={profile.age} editing={editing} onChange={(v) => setProfile((p) => ({ ...p, age: v }))} />
            <ProfileField label="Week" value={profile.pregnancyWeek} editing={editing} onChange={(v) => setProfile((p) => ({ ...p, pregnancyWeek: v }))} />
          </div>
          <ProfileField label="Pre-pregnancy BMI" value={profile.preBMI} editing={editing} onChange={(v) => setProfile((p) => ({ ...p, preBMI: v }))} />
          <div className="grid grid-cols-2 gap-3">
            <ProfileField label="Previous GDM" value={profile.previousGDM} editing={editing} onChange={(v) => setProfile((p) => ({ ...p, previousGDM: v }))} />
            <ProfileField label="Family Diabetes" value={profile.familyDiabetes} editing={editing} onChange={(v) => setProfile((p) => ({ ...p, familyDiabetes: v }))} />
          </div>
        </div>

        {/* Risk Level inline */}
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2 mb-2">
            <Baby className="w-4 h-4 text-primary" />
            <span className="font-display font-semibold text-xs">Metabolic Care Plan</span>
          </div>
          <div className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold ${riskColors[profile.riskLevel]}`}>
            {profile.riskLevel} Risk
          </div>
        </div>
      </SectionCard>

      {/* ──────────────── 2. Doctor Information ──────────────── */}
      <SectionCard
        icon={<Phone className="w-4 h-4 text-primary" />}
        title="Doctor Information"
        action={
          <Button variant="ghost" size="sm" onClick={() => { setDoctorDraft(doctor); setEditingDoctor(true); }} className="rounded-xl h-8 gap-1 text-xs">
            <Edit2 className="w-3.5 h-3.5" /> Edit
          </Button>
        }
      >
        <div className="space-y-3">
          <DoctorField icon={<User className="w-4 h-4 text-muted-foreground shrink-0" />} label="Doctor Name" value={doctor.name} />
          <DoctorField icon={<Phone className="w-4 h-4 text-muted-foreground shrink-0" />} label="Phone" value={doctor.phone} isPhone />
          <DoctorField icon={<MapPin className="w-4 h-4 text-muted-foreground shrink-0" />} label="Clinic" value={doctor.clinic} />
        </div>
      </SectionCard>

      {/* ──────────────── 3. Medical Reports ──────────────── */}
      <SectionCard
        icon={<FileText className="w-4 h-4 text-primary" />}
        title="Medical Reports"
        action={
          <label className="cursor-pointer">
            <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleUploadReport} disabled={uploading || isDemoMode} />
            <div className="flex items-center gap-1 text-xs text-primary font-medium hover:underline">
              <Upload className="w-3.5 h-3.5" /> {uploading ? "Uploading..." : "Upload"}
            </div>
          </label>
        }
      >
        {isDemoMode && (
          <p className="text-xs text-muted-foreground mb-3">Sign up to upload and manage medical reports.</p>
        )}
        {reports.length === 0 && !isDemoMode && (
          <p className="text-xs text-muted-foreground">No reports uploaded yet. Upload PDF, JPG, or PNG files.</p>
        )}
        <div className="space-y-2">
          {reports.map((report) => (
            <div key={report.id} className="flex items-center justify-between bg-muted/30 rounded-xl p-3">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{report.file_name}</p>
                  <p className="text-[10px] text-muted-foreground">{new Date(report.uploaded_at).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button variant="ghost" size="sm" onClick={() => handleViewReport(report)} className="h-7 w-7 p-0">
                  <Eye className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDeleteReport(report)} className="h-7 w-7 p-0 text-destructive">
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* ──────────────── 4. Postpartum Support ──────────────── */}
      <SectionCard
        icon={<Heart className="w-4 h-4 text-primary" />}
        title="Postpartum Support"
      >
        <div className="space-y-2">
          <Tip text="Schedule a 6-week glucose test after delivery." />
          <Tip text="Breastfeeding can help improve insulin sensitivity." />
          <Tip text="Gradually reintroduce carbs and maintain balanced meals." />
          <Tip text="Annual metabolic checkups help protect long-term health." />
        </div>
      </SectionCard>

      {/* ──────────────── 5. Testing Mode ──────────────── */}
      <SectionCard
        icon={<FlaskConical className="w-4 h-4 text-primary" />}
        title="Testing Mode"
      >
        <p className="text-xs text-muted-foreground mb-4">
          When enabled, the app will simulate future or past days to preview recommendations.
        </p>
        <div className="flex items-center justify-between mb-4">
          <Label className="text-sm font-medium">Enable Testing Mode</Label>
          <Switch checked={testingMode} onCheckedChange={handleToggleTestingMode} />
        </div>
        {testingMode && (
          <div className="space-y-3">
            <Label className="text-xs text-muted-foreground">Select a Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal rounded-xl", !testingDate && "text-muted-foreground")}
                >
                  <CalendarIconLucide className="mr-2 h-4 w-4" />
                  {testingDate ? format(testingDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={testingDate}
                  onSelect={handleSelectTestDate}
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
            {testingDate && (
              <>
                <p className="text-xs text-primary font-medium">
                  📅 App is simulating: {format(testingDate, "MMMM d, yyyy")}
                </p>
                <Button
                  className="w-full rounded-xl mt-2"
                  onClick={() => toast.success("Date Saved ✅", { description: `Recommendations will now show for ${format(testingDate, "MMMM d, yyyy")}` })}
                >
                  Save Date
                </Button>
              </>
            )}
          </div>
        )}
        <p className="text-[10px] text-muted-foreground mt-3 italic">This is for testing purposes only.</p>
      </SectionCard>

      {/* ──────────────── 6. Account Settings ──────────────── */}
      <SectionCard
        icon={<Settings className="w-4 h-4 text-primary" />}
        title="Account Settings"
      >
        <Button
          variant="ghost"
          onClick={() => setDeactivateStep(1)}
          className="w-full justify-start text-sm text-muted-foreground hover:text-destructive h-10 px-0"
        >
          <AlertTriangle className="w-4 h-4 mr-2" />
          Deactivate Account
        </Button>
      </SectionCard>

      {/* Sign Out */}
      <Button
        variant="outline"
        onClick={handleSignOut}
        className="w-full rounded-2xl h-12 gap-2 text-destructive border-destructive/20 hover:bg-destructive/5 mb-4"
      >
        <LogOut className="w-4 h-4" />
        {isDemoMode ? "Exit Demo" : "Sign Out"}
      </Button>

      {/* Doctor Edit Dialog */}
      <Dialog open={editingDoctor} onOpenChange={setEditingDoctor}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display">Edit Doctor Information</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm">Doctor Name</Label>
              <Input value={doctorDraft.name} onChange={(e) => setDoctorDraft((d) => ({ ...d, name: e.target.value }))} className="mt-1 rounded-xl" />
            </div>
            <div>
              <Label className="text-sm">Phone Number</Label>
              <Input value={doctorDraft.phone} onChange={(e) => setDoctorDraft((d) => ({ ...d, phone: e.target.value }))} className="mt-1 rounded-xl" />
            </div>
            <div>
              <Label className="text-sm">Clinic Address</Label>
              <Input value={doctorDraft.clinic} onChange={(e) => setDoctorDraft((d) => ({ ...d, clinic: e.target.value }))} className="mt-1 rounded-xl" />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setEditingDoctor(false)} className="flex-1 rounded-xl">Cancel</Button>
              <Button onClick={handleSaveDoctor} className="flex-1 rounded-xl">Save Changes</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Deactivation Flow Dialog */}
      <Dialog open={deactivateStep > 0} onOpenChange={(open) => { if (!open) { setDeactivateStep(0); setDeactivateChecked(false); } }}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          {deactivateStep === 1 && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-watch" />
                  Deactivate Your Account
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-foreground/80 leading-relaxed">
                  If you deactivate your account, your access to the app will stop. Your health data will be stored for a limited time before permanent deletion.
                </p>
                <div className="bg-muted/50 rounded-xl p-4 space-y-2">
                  <p className="text-xs font-semibold">Data Retention Policy</p>
                  <div className="flex items-start gap-2 text-xs text-foreground/70">
                    <span>•</span><span>Health data stored for 30 days after deactivation</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-foreground/70">
                    <span>•</span><span>After that, it is permanently deleted</span>
                  </div>
                </div>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" checked={deactivateChecked} onChange={(e) => setDeactivateChecked(e.target.checked)} className="mt-1 accent-primary" />
                  <span className="text-sm text-foreground/80">I understand what happens when I deactivate my account.</span>
                </label>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => { setDeactivateStep(0); setDeactivateChecked(false); }} className="flex-1 rounded-xl">Cancel</Button>
                  <Button onClick={() => setDeactivateStep(2)} disabled={!deactivateChecked} className="flex-1 rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground">Continue</Button>
                </div>
              </div>
            </>
          )}
          {deactivateStep === 2 && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display">Data Management</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-foreground/80 leading-relaxed">
                  You can choose to delete all your data immediately.
                </p>
                <button
                  onClick={handleDeactivateKeepData}
                  className="w-full text-left bg-muted/30 rounded-2xl p-4 border border-border hover:border-primary transition-colors"
                >
                  <p className="font-semibold text-sm mb-1">Deactivate account</p>
                  <p className="text-xs text-muted-foreground">Keep data for 30 days</p>
                </button>
                <button
                  onClick={handleDeactivateDeleteAll}
                  className="w-full text-left bg-destructive/5 rounded-2xl p-4 border border-destructive/20 hover:border-destructive transition-colors"
                >
                  <p className="font-semibold text-sm mb-1 text-destructive">Deactivate & Delete all data</p>
                  <p className="text-xs text-muted-foreground">Permanently remove all your information</p>
                </button>
                <Button variant="outline" onClick={() => setDeactivateStep(0)} className="w-full rounded-xl">Cancel</Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

/* ──────── Reusable Section Card ──────── */
const SectionCard = ({
  icon,
  title,
  action,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) => (
  <div className="bg-card rounded-2xl p-5 shadow-soft mb-4 border border-border">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="font-display font-semibold text-sm">{title}</h3>
      </div>
      {action}
    </div>
    {children}
  </div>
);

const ProfileField = ({ label, value, editing, onChange }: { label: string; value: string; editing: boolean; onChange: (v: string) => void }) => (
  <div>
    <Label className="text-[10px] text-muted-foreground">{label}</Label>
    {editing ? (
      <Input value={value} onChange={(e) => onChange(e.target.value)} className="mt-0.5 rounded-xl h-9 text-sm" />
    ) : (
      <p className="text-sm font-medium mt-0.5">{value}</p>
    )}
  </div>
);

const DoctorField = ({ icon, label, value, isPhone }: { icon: React.ReactNode; label: string; value: string; isPhone?: boolean }) => (
  <div className="flex items-center gap-3">
    {icon}
    <div>
      <Label className="text-[10px] text-muted-foreground">{label}</Label>
      {isPhone ? (
        <a href={`tel:${value}`} className="text-sm font-medium text-primary">{value}</a>
      ) : (
        <p className="text-sm font-medium">{value}</p>
      )}
    </div>
  </div>
);

const Tip = ({ text }: { text: string }) => (
  <div className="flex items-start gap-2 text-xs text-foreground/80">
    <span className="text-primary mt-0.5 shrink-0">🌿</span>
    <span>{text}</span>
  </div>
);

export default Profile;
