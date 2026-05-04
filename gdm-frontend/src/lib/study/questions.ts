// Placeholder survey questions — replace with the real ones when ready.
export type SurveyQuestion =
  | { id: string; type: "text"; text: string; placeholder?: string; required?: boolean }
  | { id: string; type: "textarea"; text: string; placeholder?: string; required?: boolean }
  | { id: string; type: "single"; text: string; options: string[]; required?: boolean }
  | { id: string; type: "multi"; text: string; options: string[]; required?: boolean }
  | { id: string; type: "likert"; text: string; min?: number; max?: number; minLabel?: string; maxLabel?: string; required?: boolean };

export const surveyQuestions: SurveyQuestion[] = [
  { id: "q1_age_range", type: "single", text: "What is your age range?", options: ["18–24", "25–34", "35–44", "45–54", "55+"], required: true },
  { id: "q2_familiarity", type: "likert", text: "How familiar are you with health chatbots?", min: 1, max: 5, minLabel: "Not at all", maxLabel: "Very familiar", required: true },
  { id: "q3_topics", type: "multi", text: "Which topics interest you most? (select all that apply)", options: ["Nutrition", "Exercise", "Sleep", "Mental health", "Pregnancy"], required: false },
  { id: "q4_first_impression", type: "textarea", text: "In one sentence, what is your first impression of the assistant?", required: true },
  { id: "q5_trust", type: "likert", text: "How much would you trust this assistant for general wellness questions?", min: 1, max: 7, minLabel: "Not at all", maxLabel: "Completely", required: true },
];
