export type SurveyQuestion =
  | { id: string; type: "text"; text: string; placeholder?: string; required?: boolean; readOnly?: boolean }
  | { id: string; type: "number"; text: string; placeholder?: string; required?: boolean }
  | { id: string; type: "textarea"; text: string; placeholder?: string; required?: boolean }
  | { id: string; type: "single"; text: string; options: string[]; required?: boolean }
  | { id: string; type: "multi"; text: string; options: string[]; required?: boolean };

export type SurveyPage = { title: string; subtitle?: string; questions: SurveyQuestion[] };

const AGREE_SCALE_IDK = [
  "Strongly Agree",
  "Agree",
  "Neutral",
  "Disagree",
  "Strongly Disagree",
  "I don't know / Didn't explore this option",
];

const AGREE_SCALE = ["Strongly Agree", "Agree", "Neutral", "Disagree", "Strongly Disagree"];

export const surveyPages: SurveyPage[] = [
  {
    title: "Basic Information",
    questions: [
      { id: "prolific_id", type: "text", text: "Please provide your Prolific ID", required: true, readOnly: true },
      { id: "age", type: "number", text: "How old are you? (numerical input only)", required: true, placeholder: "e.g. 28" },
      {
        id: "pregnancy_status",
        type: "single",
        text: "Are you currently pregnant or have you been pregnant before?",
        options: ["Currently pregnant", "Previously pregnant", "Never been pregnant"],
        required: true,
      },
      {
        id: "app_familiarity",
        type: "single",
        text: "How familiar are you with pregnancy health tracking apps?",
        options: ["Very familiar", "Somewhat familiar", "Not familiar"],
        required: true,
      },
    ],
  },
  {
    title: "First Impressions",
    questions: [
      { id: "first_impression", type: "textarea", text: "What was your first impression of the app/dashboard?", required: true },
      {
        id: "ease_of_understanding",
        type: "single",
        text: "How easy was it to understand what the app does?",
        options: ["Very easy", "Easy", "Neutral", "Difficult", "Very Difficult"],
        required: true,
      },
      { id: "liked_most", type: "textarea", text: "What did you like the most about the app?", required: true },
      { id: "confusing", type: "textarea", text: "What confused you or felt unclear?", required: false },
    ],
  },
  {
    title: "Feature Feedback",
    questions: [
      { id: "daily_checklist_useful", type: "single", text: "Did you find the daily checklist useful?", options: AGREE_SCALE_IDK, required: true },
      { id: "would_follow_daily_tasks", type: "single", text: "Would you realistically follow these daily tasks?", options: AGREE_SCALE_IDK, required: true },
      { id: "recipes_appealing", type: "single", text: "Do you find the recipe recommendations appealing?", options: AGREE_SCALE_IDK, required: true },
      {
        id: "reminders_feel",
        type: "single",
        text: "Did the reminders feel supportive or overwhelming?",
        options: ["Supportive", "Neutral", "Overwhelming", "I don't know / Didn't explore this option"],
        required: true,
      },
      {
        id: "preferred_wellness_reminder",
        type: "single",
        text: "Which type of wellness reminder did you like most or are you most likely to do?",
        options: [
          "Something to eat / drink",
          "Something to do (Activity)",
          "Something to relax (Breathing techniques, meditation)",
          "I don't know / Didn't explore this option",
        ],
        required: true,
      },
      { id: "track_meals_health_daily", type: "single", text: "Would you use a feature to track meals or health daily?", options: AGREE_SCALE_IDK, required: true },
      { id: "motivation_to_track", type: "textarea", text: "What would motivate you to track consistently?", required: false },
      { id: "learning_materials_interesting", type: "single", text: "Do you find the learning materials interesting?", options: AGREE_SCALE_IDK, required: true },
    ],
  },
  {
    title: "Meal / Nutrition Suggestions",
    questions: [
      {
        id: "meal_suggestions_helpful",
        type: "single",
        text: "How helpful were the meal suggestions?",
        options: ["Very Helpful", "Helpful", "Neutral", "Not helpful"],
        required: true,
      },
      {
        id: "meals_feel",
        type: "multi",
        text: "Do the meals feel: (select all that apply)",
        options: ["Easy to prepare", "Affordable", "Realistic"],
        required: true,
      },
      {
        id: "ingredients_easy_to_buy",
        type: "single",
        text: "Do the ingredients feel easy to buy with respect to cost and access?",
        options: AGREE_SCALE,
        required: true,
      },
    ],
  },
  {
    title: "Value & Real Usage",
    questions: [
      {
        id: "would_use_app",
        type: "single",
        text: "Would you use this app if it were available?",
        options: ["Yes", "Maybe", "No"],
        required: true,
      },
      {
        id: "use_frequency",
        type: "single",
        text: "How often would you use it?",
        options: ["Daily", "Few times a week", "Occasionally"],
        required: true,
      },
      { id: "consistent_use_motivator", type: "textarea", text: "What would make you use it more consistently?", required: false },
    ],
  },
];

// Backwards-compat flat list (kept for any legacy imports)
export const surveyQuestions: SurveyQuestion[] = surveyPages.flatMap((p) => p.questions);
