// Translates the "extras" English keyset into 5 other languages via Lovable AI,
// then merges into src/locales/<lang>.json
import fs from "node:fs";
import path from "node:path";

const API_KEY = process.env.LOVABLE_API_KEY;
if (!API_KEY) { console.error("LOVABLE_API_KEY not set"); process.exit(1); }

// ---- Build the English extras keyset (everything missing from current locales) ----
const focusTasks = [
  "Take a 15-minute walk after a meal",
  "Drink 8 to 10 glasses of water throughout the day",
  "Do 5 minutes of light pregnancy-safe stretching",
  "Eat one high-protein snack between meals",
  "Add one fiber-rich food to your lunch or dinner",
  "Include a collagen-supporting food like eggs, bone broth, citrus, or berries",
  "Avoid skipping breakfast",
  "Check in with your energy level and rest when needed",
  "Practice 5 minutes of deep breathing or relaxation",
  "Choose a balanced breakfast with protein, fiber, and healthy fats",
  "Reduce sugary drinks and choose water or unsweetened options",
  "Eat slowly and mindfully during one meal today",
  "Add one iron-rich food like spinach, lentils, beans, or lean meat",
  "Pair iron-rich food with vitamin C-rich food for better absorption",
  "Take a short movement break after sitting too long",
  "Limit highly processed snacks today",
  "Have a nourishing afternoon snack to keep blood sugar steady",
  "Prioritize 7 to 9 hours of sleep tonight",
  "Track how you feel after meals: full, tired, energized, or bloated",
  "Add one calcium-rich food like yogurt, milk, cheese, or fortified alternatives",
  "Spend 10 minutes doing gentle prenatal mobility exercises",
  "Keep caffeine within pregnancy-safe limits",
  "Eat one colorful vegetable with a main meal",
  "Take your prenatal supplement if prescribed",
  "End the day with 10 minutes of rest, gratitude, or quiet time",
];

const focusCategories = {
  movement: { label: "Movement", desc: "Gentle movement helps with circulation and glucose management." },
  hydration: { label: "Hydration", desc: "Staying hydrated supports your body and helps maintain energy." },
  nutrition: { label: "Nutrition", desc: "Good nutrition supports both you and your baby's health." },
  wellbeing: { label: "Wellbeing", desc: "Taking care of yourself emotionally matters just as much." },
  mental_wellbeing: { label: "Mental wellbeing", desc: "A calm mind helps create a calm environment for baby." },
  mindful_eating: { label: "Mindful eating", desc: "Mindful eating helps you tune into your body's signals." },
  sleep: { label: "Sleep", desc: "Quality sleep helps regulate hormones and glucose levels." },
  tracking: { label: "Tracking", desc: "Awareness of how food affects you helps make better choices." },
  health: { label: "Health", desc: "Small health habits add up to a big difference over time." },
};

const wellnessDo = [
  "Take a gentle 5-minute walk.",
  "Do a few light pregnancy-safe stretches.",
  "Change positions and avoid sitting too long.",
  "Roll your shoulders and relax your neck.",
  "Do a quick posture check and sit with support.",
  "Walk around the room for 2–3 minutes.",
  "Step outside for a little fresh air.",
  "Do a few pelvic floor squeezes.",
  "Move your ankles and feet to ease stiffness.",
  "Take a short, slow walk after a meal if you feel comfortable.",
];
const wellnessEat = [
  "Drink a glass of water.",
  "Refill your water bottle.",
  "Have a small healthy snack instead of skipping food.",
  "Eat a fruit with a protein or fat pairing, like apple with nut butter.",
  "Have yogurt or another simple calcium-rich snack.",
  "Add a vegetable to your next meal.",
  "Choose a protein-rich bite, like eggs, yogurt, cheese, beans, or nuts.",
  "Sip water slowly if you have been forgetting to drink.",
  "Have a light snack if nausea feels better when you avoid an empty stomach.",
  "Make a simple nourishing drink, like milk or a smoothie if tolerated.",
];
const wellnessRelax = [
  "Take 5 slow deep breaths.",
  "Close your eyes and rest for 1 minute.",
  "Unclench your jaw and drop your shoulders.",
  "Put your phone away for 5 minutes.",
  "Sit quietly and breathe into your belly and ribs gently.",
  "Listen to one calming song.",
  "Rest your legs and feet for a few minutes.",
  "Say one kind thing to yourself and your body.",
  "Do a short gratitude pause for yourself and baby.",
  "Lie or sit comfortably and do a 2-minute calm breathing reset.",
];

const mealNames = [
  // breakfasts
  "Oatmeal with banana and yogurt",
  "Spinach and cheese egg toast",
  "Bircher-style overnight oats",
  "Quark bowl with berries and seeds",
  "Peanut butter apple toast",
  // lunches
  "Lentil vegetable soup",
  "Chicken rice bowl",
  "Chickpea wrap",
  "Tuna potato salad",
  "Tomato mozzarella pasta",
  // dinners
  "Salmon with potatoes and peas",
  "Vegetable omelette with bread",
  "Chickpea coconut curry with rice",
  "Turkey or chicken pasta",
  "Creamy spinach bean rice pot",
  // cultural
  "Garlic bok choy with eggs",
  "Chicken and vegetable stir-fry with rice",
  "Salmon rice bowl",
  "Soba noodle bowl with egg",
  "Tofu vegetable stir-fry",
  "Dal with whole wheat roti",
  "Chicken curry with rice",
  "Chicken tacos",
  "Black bean rice bowl",
  "Chicken fajita bowl",
  "Grilled fish with corn and salad",
  "Burrito bowl",
  "Hummus with whole wheat pita",
  "Lentil soup (Middle Eastern)",
  "Chicken kebab with bulgur",
  "Falafel salad bowl",
  "Grilled lamb with vegetables",
  // nutrition page extras
  "Veggie egg scramble",
  "Greek yogurt bowl",
  "Avocado toast",
  "Apple & almond butter",
  "Cheese & crackers",
  "Grilled chicken salad",
  "Quinoa buddha bowl",
  "Hummus & veggies",
  "Baked salmon",
  "Turkey stir-fry",
];

const extras = {
  nav: { home: "Home", nutrition: "Nutrition", wellbeing: "Wellbeing", community: "Community", profile: "Profile" },
  focus: {
    title: "Today's Focus",
    markDone: "Mark as Done",
    skip: "Skip",
    completed: "Completed — great job, mama! 💚",
    skipped: "Skipped today — that's okay, tomorrow is a new day 🌿",
    category: Object.fromEntries(Object.entries(focusCategories).map(([k, v]) => [k, v.label])),
    desc: Object.fromEntries(Object.entries(focusCategories).map(([k, v]) => [k, v.desc])),
    tasks: Object.fromEntries(focusTasks.map((t, i) => [String(i + 1), t])),
  },
  wellnessItems: {
    do: Object.fromEntries(wellnessDo.map((t, i) => [String(i), t])),
    eat: Object.fromEntries(wellnessEat.map((t, i) => [String(i), t])),
    relax: Object.fromEntries(wellnessRelax.map((t, i) => [String(i), t])),
  },
  mealNames: Object.fromEntries(mealNames.map((n) => [n, n])),
};

// ---- Translate via Lovable AI ----
async function translate(targetLang, langName) {
  console.log(`Translating -> ${langName}...`);
  const prompt = `Translate the VALUES in this JSON object from English to ${langName}. Keep all KEYS exactly the same. Return ONLY valid JSON (no markdown, no commentary). Preserve emojis and placeholders like {{week}}. Keep the JSON structure identical.

INPUT:
${JSON.stringify(extras, null, 2)}`;

  const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${API_KEY}` },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: "You are a precise translator. Output only valid JSON." },
        { role: "user", content: prompt },
      ],
    }),
  });
  if (!r.ok) { console.error(await r.text()); throw new Error(`AI failed for ${targetLang}`); }
  const j = await r.json();
  let text = j.choices[0].message.content.trim();
  // strip code fences if any
  text = text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");
  return JSON.parse(text);
}

const langs = [
  ["de", "German"],
  ["it", "Italian"],
  ["fr", "French"],
  ["hi", "Hindi"],
  ["zh", "Simplified Chinese"],
];

function deepMerge(a, b) {
  const out = { ...a };
  for (const k of Object.keys(b)) {
    if (b[k] && typeof b[k] === "object" && !Array.isArray(b[k]) && a[k] && typeof a[k] === "object") {
      out[k] = deepMerge(a[k], b[k]);
    } else out[k] = b[k];
  }
  return out;
}

const localesDir = path.resolve("src/locales");

// Merge English first
const enPath = path.join(localesDir, "en.json");
const en = JSON.parse(fs.readFileSync(enPath, "utf8"));
fs.writeFileSync(enPath, JSON.stringify(deepMerge(en, extras), null, 2));
console.log("Updated en.json");

for (const [code, name] of langs) {
  const translated = await translate(code, name);
  const filePath = path.join(localesDir, `${code}.json`);
  const existing = JSON.parse(fs.readFileSync(filePath, "utf8"));
  fs.writeFileSync(filePath, JSON.stringify(deepMerge(existing, translated), null, 2));
  console.log(`Updated ${code}.json`);
}

console.log("Done.");
