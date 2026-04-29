// All data extracted verbatim from Data_Gathering.pdf

export interface FocusTask {
  id: number;
  task: string;
  category: string;
}

export interface MealIngredient {
  item: string;
  amount: string;
}

export interface Meal {
  name: string;
  ingredients: MealIngredient[];
  recipe: string[];
  benefit: string;
}

export interface WellnessReminder {
  text: string;
}

// ─── 1. TODAY'S FOCUS (25 tasks) ────────────────────────────────
export const todaysFocus: FocusTask[] = [
  { id: 1, task: "Take a 15-minute walk after a meal", category: "movement" },
  { id: 2, task: "Drink 8 to 10 glasses of water throughout the day", category: "hydration" },
  { id: 3, task: "Do 5 minutes of light pregnancy-safe stretching", category: "movement" },
  { id: 4, task: "Eat one high-protein snack between meals", category: "nutrition" },
  { id: 5, task: "Add one fiber-rich food to your lunch or dinner", category: "nutrition" },
  { id: 6, task: "Include a collagen-supporting food like eggs, bone broth, citrus, or berries", category: "nutrition" },
  { id: 7, task: "Avoid skipping breakfast", category: "nutrition" },
  { id: 8, task: "Check in with your energy level and rest when needed", category: "wellbeing" },
  { id: 9, task: "Practice 5 minutes of deep breathing or relaxation", category: "mental_wellbeing" },
  { id: 10, task: "Choose a balanced breakfast with protein, fiber, and healthy fats", category: "nutrition" },
  { id: 11, task: "Reduce sugary drinks and choose water or unsweetened options", category: "nutrition" },
  { id: 12, task: "Eat slowly and mindfully during one meal today", category: "mindful_eating" },
  { id: 13, task: "Add one iron-rich food like spinach, lentils, beans, or lean meat", category: "nutrition" },
  { id: 14, task: "Pair iron-rich food with vitamin C-rich food for better absorption", category: "nutrition" },
  { id: 15, task: "Take a short movement break after sitting too long", category: "movement" },
  { id: 16, task: "Limit highly processed snacks today", category: "nutrition" },
  { id: 17, task: "Have a nourishing afternoon snack to keep blood sugar steady", category: "nutrition" },
  { id: 18, task: "Prioritize 7 to 9 hours of sleep tonight", category: "sleep" },
  { id: 19, task: "Track how you feel after meals: full, tired, energized, or bloated", category: "tracking" },
  { id: 20, task: "Add one calcium-rich food like yogurt, milk, cheese, or fortified alternatives", category: "nutrition" },
  { id: 21, task: "Spend 10 minutes doing gentle prenatal mobility exercises", category: "movement" },
  { id: 22, task: "Keep caffeine within pregnancy-safe limits", category: "health" },
  { id: 23, task: "Eat one colorful vegetable with a main meal", category: "nutrition" },
  { id: 24, task: "Take your prenatal supplement if prescribed", category: "health" },
  { id: 25, task: "End the day with 10 minutes of rest, gratitude, or quiet time", category: "wellbeing" },
];

// Helper text for each category
export const focusCategoryDescriptions: Record<string, string> = {
  movement: "Gentle movement helps with circulation and glucose management.",
  hydration: "Staying hydrated supports your body and helps maintain energy.",
  nutrition: "Good nutrition supports both you and your baby's health.",
  wellbeing: "Taking care of yourself emotionally matters just as much.",
  mental_wellbeing: "A calm mind helps create a calm environment for baby.",
  mindful_eating: "Mindful eating helps you tune into your body's signals.",
  sleep: "Quality sleep helps regulate hormones and glucose levels.",
  tracking: "Awareness of how food affects you helps make better choices.",
  health: "Small health habits add up to a big difference over time.",
};

// ─── 2. PREGNANCY-FRIENDLY MEALS ────────────────────────────────
export const pregnancyFriendlyMeals: {
  breakfast: Meal[];
  midMorningSnack: Meal[];
  lunch: Meal[];
  afternoonSnack: Meal[];
  dinner: Meal[];
} = {
  breakfast: [
    {
      name: "Oatmeal with banana and yogurt",
      ingredients: [
        { item: "Oats", amount: "50g" },
        { item: "Milk", amount: "200ml" },
        { item: "Banana", amount: "100g" },
        { item: "Plain yogurt", amount: "80g" },
      ],
      recipe: [
        "Cook oats in milk for about 5 minutes.",
        "Slice the banana.",
        "Top the oatmeal with banana and plain yogurt.",
      ],
      benefit: "Filling, budget-friendly, and gives protein plus steady energy.",
    },
    {
      name: "Spinach and cheese egg toast",
      ingredients: [
        { item: "Eggs", amount: "2 (about 110g)" },
        { item: "Spinach", amount: "30g" },
        { item: "Wholegrain bread", amount: "70g" },
        { item: "Grated cheese", amount: "20g" },
      ],
      recipe: [
        "Scramble the eggs with spinach.",
        "Toast the bread.",
        "Place the eggs on toast and sprinkle cheese on top.",
      ],
      benefit: "Good protein and folate-supportive ingredients.",
    },
    {
      name: "Bircher-style overnight oats",
      ingredients: [
        { item: "Oats", amount: "45g" },
        { item: "Grated apple", amount: "100g" },
        { item: "Yogurt", amount: "120g" },
        { item: "Milk", amount: "50ml" },
        { item: "Chopped nuts", amount: "15g" },
      ],
      recipe: [
        "Mix oats, grated apple, yogurt, and a splash of milk.",
        "Chill overnight.",
        "Top with chopped nuts in the morning.",
      ],
      benefit: "Easy prep and a good calcium-containing breakfast.",
    },
    {
      name: "Quark bowl with berries and seeds",
      ingredients: [
        { item: "Quark", amount: "150g" },
        { item: "Berries", amount: "80g" },
        { item: "Oats", amount: "20g" },
        { item: "Chia or sunflower seeds", amount: "10g" },
      ],
      recipe: [
        "Add quark to a bowl.",
        "Top with berries.",
        "Sprinkle with oats and chia or sunflower seeds.",
      ],
      benefit: "High-protein and very quick to assemble.",
    },
    {
      name: "Peanut butter apple toast",
      ingredients: [
        { item: "Wholegrain bread", amount: "70g" },
        { item: "Peanut butter", amount: "20g" },
        { item: "Apple", amount: "80g" },
        { item: "Cinnamon", amount: "1g" },
      ],
      recipe: [
        "Toast wholegrain bread.",
        "Spread peanut butter.",
        "Top with thin apple slices and a pinch of cinnamon.",
      ],
      benefit: "Quick fiber-and-energy combo that keeps hunger down longer.",
    },
  ],

  midMorningSnack: [
    {
      name: "Apple with peanut butter",
      ingredients: [{ item: "Apple", amount: "150g" }, { item: "Peanut butter", amount: "15g" }],
      recipe: ["Slice the apple.", "Serve with peanut butter for dipping."],
      benefit: "Simple snack with fiber and a little healthy fat.",
    },
    {
      name: "Yogurt with oats",
      ingredients: [{ item: "Plain yogurt", amount: "125g" }, { item: "Oats", amount: "20g" }],
      recipe: ["Add oats to yogurt.", "Mix and enjoy."],
      benefit: "Quick calcium and protein boost.",
    },
    {
      name: "Banana and walnuts",
      ingredients: [{ item: "Banana", amount: "100g" }, { item: "Walnuts", amount: "15g" }],
      recipe: ["Peel and slice the banana.", "Pair with walnuts."],
      benefit: "Easy energy snack with healthy fats.",
    },
    {
      name: "Cheese and crackers",
      ingredients: [{ item: "Mild cheese", amount: "30g" }, { item: "Wholegrain crackers", amount: "30g" }],
      recipe: ["Slice cheese.", "Serve with wholegrain crackers."],
      benefit: "Handy calcium-rich snack.",
    },
    {
      name: "Carrot sticks with hummus",
      ingredients: [{ item: "Carrot sticks", amount: "100g" }, { item: "Hummus", amount: "40g" }],
      recipe: ["Wash and cut carrots into sticks.", "Serve with hummus for dipping."],
      benefit: "Budget-friendly snack with fiber and some protein.",
    },
  ],

  lunch: [
    {
      name: "Lentil vegetable soup",
      ingredients: [
        { item: "Red lentils", amount: "70g dry" },
        { item: "Carrots", amount: "80g" },
        { item: "Onion", amount: "60g" },
        { item: "Canned tomatoes", amount: "150g" },
        { item: "Olive oil", amount: "5g" },
      ],
      recipe: [
        "Simmer red lentils with chopped carrots, onions, and canned tomatoes.",
        "Cook for 15 to 20 minutes until soft.",
        "Season lightly and serve warm.",
      ],
      benefit: "Budget-friendly source of iron and protein.",
    },
    {
      name: "Chicken rice bowl",
      ingredients: [
        { item: "Chicken breast", amount: "120g" },
        { item: "Cooked rice", amount: "150g" },
        { item: "Frozen mixed vegetables", amount: "120g" },
        { item: "Olive oil", amount: "5g" },
      ],
      recipe: [
        "Cook rice or use leftover rice.",
        "Pan-fry chicken strips.",
        "Add frozen mixed vegetables and combine.",
      ],
      benefit: "Balanced protein-rich lunch.",
    },
    {
      name: "Chickpea wrap",
      ingredients: [
        { item: "Tortilla", amount: "1 medium (60g)" },
        { item: "Chickpeas", amount: "100g" },
        { item: "Cucumber", amount: "50g" },
        { item: "Tomato", amount: "50g" },
        { item: "Lettuce", amount: "30g" },
        { item: "Yogurt sauce", amount: "30g" },
      ],
      recipe: [
        "Warm a tortilla wrap.",
        "Fill with chickpeas, cucumber, tomato, lettuce, and yogurt sauce.",
        "Roll and serve.",
      ],
      benefit: "Easy folate- and protein-supportive meal.",
    },
    {
      name: "Tuna potato salad",
      ingredients: [
        { item: "Potatoes", amount: "180g" },
        { item: "Canned tuna", amount: "80g" },
        { item: "Corn", amount: "50g" },
        { item: "Cucumber", amount: "60g" },
        { item: "Yogurt", amount: "30g" },
      ],
      recipe: [
        "Boil potatoes and let them cool slightly.",
        "Mix with canned tuna, corn, and cucumber.",
        "Dress with plain yogurt or olive oil.",
      ],
      benefit: "Simple protein-rich lunch using pantry staples.",
    },
    {
      name: "Tomato mozzarella pasta",
      ingredients: [
        { item: "Dry pasta", amount: "75g" },
        { item: "Tomatoes", amount: "120g" },
        { item: "Mozzarella", amount: "60g" },
        { item: "Spinach", amount: "30g" },
        { item: "Olive oil", amount: "5g" },
      ],
      recipe: [
        "Cook pasta.",
        "Toss with chopped tomatoes, mozzarella, olive oil, and spinach.",
        "Serve warm or lukewarm.",
      ],
      benefit: "Contains calcium and folate-supportive ingredients.",
    },
  ],

  afternoonSnack: [
    {
      name: "Quark with banana",
      ingredients: [{ item: "Quark", amount: "120g" }, { item: "Banana", amount: "80g" }],
      recipe: ["Slice the banana.", "Mix into quark and enjoy."],
      benefit: "Protein-rich and easy when energy is low.",
    },
    {
      name: "Boiled egg and toast fingers",
      ingredients: [{ item: "Egg", amount: "1 (55g)" }, { item: "Wholegrain bread", amount: "35g" }],
      recipe: ["Boil the egg.", "Toast the bread and cut into fingers.", "Dip and enjoy."],
      benefit: "Simple protein snack with minimal prep.",
    },
    {
      name: "Pear and almonds",
      ingredients: [{ item: "Pear", amount: "150g" }, { item: "Almonds", amount: "15g" }],
      recipe: ["Wash and slice the pear.", "Pair with almonds."],
      benefit: "Light snack with natural fiber and healthy fats.",
    },
    {
      name: "Cottage cheese and cucumber",
      ingredients: [{ item: "Cottage cheese", amount: "100g" }, { item: "Cucumber", amount: "80g" }],
      recipe: ["Slice the cucumber.", "Serve alongside cottage cheese."],
      benefit: "Refreshing protein snack that is easy on digestion.",
    },
    {
      name: "Rice cakes with avocado",
      ingredients: [{ item: "Rice cakes", amount: "2 pieces (20g)" }, { item: "Avocado", amount: "50g" }],
      recipe: ["Mash the avocado.", "Spread on rice cakes."],
      benefit: "Portable snack with fiber and healthy fats.",
    },
  ],

  dinner: [
    {
      name: "Salmon with potatoes and peas",
      ingredients: [
        { item: "Salmon fillet", amount: "120g" },
        { item: "Potatoes", amount: "200g" },
        { item: "Peas", amount: "100g" },
      ],
      recipe: [
        "Bake salmon fillet in the oven.",
        "Boil potatoes.",
        "Heat frozen peas and serve all together.",
      ],
      benefit: "Provides omega-3 fats that are important in pregnancy.",
    },
    {
      name: "Vegetable omelette with bread",
      ingredients: [
        { item: "Eggs", amount: "2 (110g)" },
        { item: "Mushrooms", amount: "60g" },
        { item: "Spinach", amount: "30g" },
        { item: "Tomato", amount: "50g" },
        { item: "Wholegrain bread", amount: "70g" },
      ],
      recipe: [
        "Whisk eggs.",
        "Cook with mushrooms, spinach, and tomato in a pan.",
        "Serve with wholegrain bread.",
      ],
      benefit: "High-protein and realistic for low-energy evenings.",
    },
    {
      name: "Chickpea coconut curry with rice",
      ingredients: [
        { item: "Chickpeas", amount: "120g" },
        { item: "Frozen vegetables", amount: "120g" },
        { item: "Coconut milk", amount: "60ml" },
        { item: "Curry powder", amount: "5g" },
        { item: "Cooked rice", amount: "150g" },
      ],
      recipe: [
        "Simmer chickpeas with frozen vegetables, curry powder, and a little coconut milk.",
        "Cook rice separately or use leftover rice.",
        "Serve together.",
      ],
      benefit: "Cheap pantry meal with iron and protein support.",
    },
    {
      name: "Turkey or chicken pasta",
      ingredients: [
        { item: "Dry pasta", amount: "75g" },
        { item: "Turkey or chicken mince", amount: "120g" },
        { item: "Tomato sauce", amount: "120g" },
        { item: "Grated carrots", amount: "50g" },
      ],
      recipe: [
        "Cook pasta.",
        "Sauté turkey or chicken mince with tomato sauce and grated carrots.",
        "Combine and serve.",
      ],
      benefit: "Lean protein and easy batch-cook potential.",
    },
    {
      name: "Creamy spinach bean rice pot",
      ingredients: [
        { item: "Rice", amount: "70g dry" },
        { item: "White beans", amount: "100g" },
        { item: "Spinach", amount: "40g" },
        { item: "Grated cheese", amount: "20g" },
        { item: "Stock", amount: "300ml" },
      ],
      recipe: [
        "Cook rice with stock.",
        "Stir in white beans and spinach near the end.",
        "Add grated cheese and stir until melted.",
      ],
      benefit: "One-pot meal with folate- and iron-supportive ingredients.",
    },
  ],
};

// ─── 3. WELLNESS REMINDERS ──────────────────────────────────────
// ─── CULTURAL MEALS (GDM-friendly) ──────────────────────────
export interface CulturalMeal {
  name: string;
  recipe: string;
  benefit: string;
  cuisine: string;
}

export const culturalMeals: CulturalMeal[] = [
  // East Asian
  { name: "Garlic bok choy with eggs", recipe: "Eggs 2 (100g), bok choy 150g, garlic 5g, soy sauce 10ml, oyster sauce 5ml, sesame oil 3ml", benefit: "Light, low in refined carbs, rich in protein and iron", cuisine: "East Asian" },
  { name: "Chicken and vegetable stir-fry with rice", recipe: "Chicken breast 120g, broccoli 80g, bell pepper 70g, brown rice 80g (cooked), soy sauce 10ml", benefit: "Balanced protein and fiber with controlled carbs", cuisine: "East Asian" },
  { name: "Salmon rice bowl", recipe: "Salmon 120g, brown rice 80g, avocado 40g, cucumber 60g, soy sauce 10ml", benefit: "High in healthy fats and protein for fetal development", cuisine: "East Asian" },
  { name: "Soba noodle bowl with egg", recipe: "Soba noodles 80g, egg 1, spinach 50g, soy sauce 10ml", benefit: "Lower-GI noodles help reduce blood sugar spikes", cuisine: "East Asian" },
  { name: "Tofu vegetable stir-fry", recipe: "Tofu 120g, broccoli 80g, carrot 50g, soy sauce 10ml, garlic 5g", benefit: "Plant-based protein with high fiber and low fat", cuisine: "East Asian" },
  // South Asian
  { name: "Dal with whole wheat roti", recipe: "Cooked lentils 150g, whole wheat roti 40g, spinach 50g, onion 30g", benefit: "High fiber and plant protein help stabilize blood sugar", cuisine: "South Asian" },
  { name: "Chicken curry with rice", recipe: "Chicken breast 120g, curry sauce 60g, basmati rice 80g (cooked), tomato 50g", benefit: "Balanced protein and controlled rice portion", cuisine: "South Asian" },
  // Latin American
  { name: "Chicken tacos", recipe: "Grilled chicken 120g, corn tortillas 60g, avocado 40g, lettuce 30g, salsa 40g", benefit: "Balanced protein and fiber with moderate carbs", cuisine: "Latin American" },
  { name: "Black bean rice bowl", recipe: "Black beans 120g, brown rice 80g, avocado 40g, tomato 60g", benefit: "High fiber supports stable glucose levels", cuisine: "Latin American" },
  { name: "Chicken fajita bowl", recipe: "Chicken 120g, bell pepper 80g, onion 40g, quinoa 70g", benefit: "High protein and complex carbs", cuisine: "Latin American" },
  { name: "Grilled fish with corn and salad", recipe: "Fish 120g, corn 80g, mixed salad 80g", benefit: "Lean protein with moderate carb intake", cuisine: "Latin American" },
  { name: "Burrito bowl", recipe: "Rice 80g, beans 100g, chicken 100g, lettuce 50g, salsa 40g", benefit: "Balanced macronutrients with fiber-rich ingredients", cuisine: "Latin American" },
  // Middle Eastern
  { name: "Hummus with whole wheat pita", recipe: "Hummus 50g, whole wheat pita 40g, cucumber 80g, tomato 60g", benefit: "Fiber-rich and helps maintain steady blood sugar", cuisine: "Middle Eastern" },
  { name: "Lentil soup (Middle Eastern)", recipe: "Lentils 150g, carrot 40g, onion 30g, olive oil 5g", benefit: "High in fiber and plant protein", cuisine: "Middle Eastern" },
  { name: "Chicken kebab with bulgur", recipe: "Chicken 120g, bulgur 70g, tomato 50g, parsley 20g", benefit: "Balanced protein and whole grains", cuisine: "Middle Eastern" },
  { name: "Falafel salad bowl", recipe: "Falafel 3 pieces, mixed greens 80g, tomato 60g, tahini 20g", benefit: "Plant-based protein with healthy fats", cuisine: "Middle Eastern" },
  { name: "Grilled lamb with vegetables", recipe: "Lamb 100g, zucchini 80g, eggplant 80g, olive oil 5g", benefit: "Iron-rich meal with low refined carbs", cuisine: "Middle Eastern" },
];

// ─── LEARNING ARTICLES ──────────────────────────────────────
export interface LearningArticle {
  id: number;
  title: string;
  content: string;
  category: string;
  sourceUrl: string;
  readTime: string;
}

export const learningArticles: LearningArticle[] = [
  // Part 1: Understanding GDM
  { id: 1, title: "What Exactly is GDM?", content: "Gestational Diabetes Mellitus (GDM) isn't a permanent disease, and it's a specific metabolic state triggered by pregnancy. GDM is defined as any degree of glucose intolerance with onset or first recognition during pregnancy. Unlike Type 1 or Type 2 diabetes, which are chronic, GDM is usually diagnosed in the second or third trimester and often resolves immediately after the placenta is delivered. It happens when your body cannot produce enough insulin to overcome the resistance caused by pregnancy hormones.", category: "Understanding GDM", sourceUrl: "https://www.who.int/news-room/fact-sheets/detail/diabetes", readTime: "2 min" },
  { id: 2, title: "It's the Placenta, Not Your Fault", content: "Stop the guilt. Your placenta is the primary driver of insulin resistance. As the placenta grows to support your baby, it secretes hormones like Human Placental Lactogen (HPL), estrogen, and cortisol. These hormones are essential for the baby's development, but they have a side effect: they interfere with how your cells respond to insulin. This is called \"insulin resistance.\" In most pregnancies, the body just makes more insulin, but in GDM, the pancreas can't keep up with this hormonal interference. You didn't cause this by eating a cookie — your body is reacting to the intense hormonal changes of late pregnancy.", category: "Understanding GDM", sourceUrl: "https://www.who.int/news-room/fact-sheets/detail/diabetes", readTime: "2 min" },
  { id: 3, title: "How Blood Sugar Affects Your Baby", content: "Glucose crosses the placenta, but insulin does not. If the mother's sugar is high, the baby's pancreas produces extra insulin, acting as a growth hormone that can lead to macrosomia (large birth weight).", category: "Understanding GDM", sourceUrl: "https://www.who.int/news-room/fact-sheets/detail/diabetes", readTime: "1 min" },
  { id: 4, title: "The Commonness of GDM", content: "You are not alone. GDM is one of the most common pregnancy complications. Globally, approximately 1 in 6 to 1 in 7 live births are affected by some form of hyperglycemia in pregnancy. Most women have healthy babies with proper management.", category: "Understanding GDM", sourceUrl: "https://www.who.int/news-room/fact-sheets/detail/diabetes", readTime: "1 min" },
  { id: 5, title: "Why Is Fasting Sugar High Even Without Eating?", content: "Around 3-4 AM, your body releases cortisol and growth hormones to prepare you for waking up. This signals your liver to release stored sugar. In GDM, your body can't produce enough insulin to cover this natural sugar surge. A small, high-protein snack before bed (like Greek yogurt) can sometimes suppress this liver sugar release.", category: "Understanding GDM", sourceUrl: "https://www.who.int/news-room/fact-sheets/detail/diabetes", readTime: "2 min" },
  { id: 6, title: "How Do Your Beta Cells Work During Pregnancy?", content: "In a healthy pregnancy, the pancreas increases insulin production by 1.5–2x. GDM happens when pancreatic beta cells have a limited reserve and cannot compensate.", category: "Understanding GDM", sourceUrl: "https://www.who.int/news-room/fact-sheets/detail/diabetes", readTime: "1 min" },
  { id: 7, title: "GDM is Temporary (Mostly)", content: "For most, blood sugar returns to normal right after birth. Once the placenta is delivered, the primary source of insulin-blocking hormones is gone. However, it serves as a test for future health.", category: "Understanding GDM", sourceUrl: "https://www.who.int/news-room/fact-sheets/detail/diabetes", readTime: "1 min" },
  { id: 8, title: "Why Testing is Crucial", content: "You can't feel GDM, which is why data is your only eyes. High blood sugar in pregnancy rarely causes symptoms like extreme thirst or weight loss. Most women feel perfectly normal. This silence is dangerous because undetected high sugar can silently affect the baby's growth. This makes the OGTT (Oral Glucose Tolerance Test) non-negotiable. Don't rely on feeling fine; rely on your glucose monitor numbers.", category: "Understanding GDM", sourceUrl: "https://www.who.int/news-room/fact-sheets/detail/diabetes", readTime: "2 min" },
  { id: 9, title: "GDM vs Type 2 Diabetes", content: "GDM is a state of pregnancy, while Type 2 is a chronic condition. Type 2 diabetes is often characterized by a long-term decline in insulin production. GDM is a rapid, temporary surge in resistance. While they share some management strategies, GDM targets are much stricter because the fetus is highly sensitive to even small sugar spikes. Focus on the pregnancy-specific targets your doctor gives you, as they are tighter than standard diabetes goals.", category: "Understanding GDM", sourceUrl: "https://www.who.int/news-room/fact-sheets/detail/diabetes", readTime: "2 min" },
  // Part 2: Nutrition
  { id: 10, title: "Prioritize Low-GI Carbohydrates", content: "Traditional GDM diets often simply restrict total carbs, but research shows that quality is more important. Choosing low-GI foods (like lentils, barley, and non-starchy vegetables) prevents rapid glucose absorption.", category: "Nutrition", sourceUrl: "https://www.who.int/news-room/fact-sheets/detail/diabetes", readTime: "1 min" },
  { id: 11, title: "The 3+3 Meal Spacing Rule", content: "Consistently eating three small meals and three snacks every 2.5 to 3 hours is the most effective way to prevent glucose \"peaks and valleys.\" Clinical data indicates that women who follow this spacing are significantly more likely to meet their fasting glucose targets because it prevents the liver from overproducing glucose during long gaps.", category: "Nutrition", sourceUrl: "https://www.who.int/news-room/fact-sheets/detail/diabetes", readTime: "2 min" },
  { id: 12, title: "Strategic Macronutrient Pairing", content: "Never eat a carbohydrate naked. Always pair it with a protein or healthy fat (e.g., Greek yogurt with berries or nuts with an apple). Protein and fats stimulate incretin hormones in the gut, which slow down gastric emptying and blunt the blood sugar spike that follows a carb-heavy meal.", category: "Nutrition", sourceUrl: "https://www.who.int/news-room/fact-sheets/detail/diabetes", readTime: "2 min" },
  { id: 13, title: "High Dietary Fiber Intake (28g/day)", content: "Fiber is a physical buffer. It creates a viscous gel in the small intestine that traps sugar molecules, slowing their entry into the bloodstream. High-fiber diets are linked to lower HbA1c levels in GDM patients because fiber improves overall insulin sensitivity in peripheral tissues.", category: "Nutrition", sourceUrl: "https://www.who.int/news-room/fact-sheets/detail/diabetes", readTime: "2 min" },
  { id: 14, title: "Morning Carb Restriction", content: "Insulin resistance is naturally highest in the morning due to the \"dawn phenomenon\" and cortisol spikes. Research in Diabetologia proves that limiting breakfast to 15-30g of carbs and front-loading the rest of your intake earlier in the day improves the 24-hour glucose rhythm.", category: "Nutrition", sourceUrl: "https://www.who.int/news-room/fact-sheets/detail/diabetes", readTime: "2 min" },
  { id: 15, title: "The Protective Bedtime Snack", content: "A small, high-protein snack before bed (like a piece of cheese or a handful of almonds) is a clinical tool to manage morning fasting numbers. This prevents \"nocturnal hypoglycemia,\" which can trigger the body to release \"counter-regulatory\" hormones that cause high sugar levels when you wake up.", category: "Nutrition", sourceUrl: "https://www.who.int/news-room/fact-sheets/detail/diabetes", readTime: "2 min" },
  { id: 16, title: "Magnesium and Insulin Function", content: "Magnesium acts as a second messenger for insulin action. Without it, the insulin key cannot effectively open the cell door. Studies show that GDM patients often have lower magnesium levels, and increasing intake improves glucose clearance from the blood.", category: "Nutrition", sourceUrl: "https://www.who.int/news-room/fact-sheets/detail/diabetes", readTime: "1 min" },
  { id: 17, title: "The Vinegar Pre-Meal Protocol", content: "Acetic acid (found in vinegar) has been shown to inhibit certain digestive enzymes that break down starches. Consuming diluted vinegar before a meal can lower post-meal glucose by up to 20% by increasing glucose uptake in muscles.", category: "Nutrition", sourceUrl: "https://www.nature.com/articles/s43856-024-00491-1", readTime: "1 min" },
  { id: 18, title: "Hydration and Osmotic Balance", content: "Water is essential for maintaining blood volume. Dehydration can cause a concentrated spike in blood glucose readings. Adequate hydration supports the kidneys in filtering and excreting excess glucose through urine, a process known as glycosuria.", category: "Nutrition", sourceUrl: "https://assets-eu.researchsquare.com/files/rs-7632300/v1/c5789bbc-6477-4b5d-b1ac-ba3be252b3a4.pdf", readTime: "1 min" },
  // Part 3: Movement
  { id: 19, title: "The 150-Minute Standard", content: "The World Health Organization (WHO) and the American College of Obstetricians and Gynecologists (ACOG) recommend at least 150 minutes of moderate-intensity aerobic activity per week. Spreading this over 3 or more days is more effective for stabilizing blood glucose than a single long session.", category: "Movement", sourceUrl: "https://pmc.ncbi.nlm.nih.gov/articles/PMC12570639/", readTime: "1 min" },
  { id: 20, title: "Post-Meal Timing is Critical", content: "Engaging in light physical activity, such as a 10–20-minute walk immediately after meals, is one of the most effective ways to prevent spikes in postprandial (after-meal) blood glucose.", category: "Movement", sourceUrl: "https://acsm.org/physical-activity-gestational-diabetes/", readTime: "1 min" },
  { id: 21, title: "Circuit Resistance Training vs. Aerobic", content: "While walking is common, Circuit Resistance Training (using light weights or resistance bands) has been shown in some studies to be more effective than aerobic training alone in reducing both fasting and 2-hour postprandial glucose levels.", category: "Movement", sourceUrl: "https://pmc.ncbi.nlm.nih.gov/articles/PMC6322789/", readTime: "1 min" },
  { id: 22, title: "Yoga as a Prevention Tool", content: "A 2025 network meta-analysis identified Yoga as one of the most effective and accessible exercise modalities for reducing the risk of developing GDM, likely due to its combined effects on physical exertion and stress reduction (cortisol management).", category: "Movement", sourceUrl: "https://pmc.ncbi.nlm.nih.gov/articles/PMC12570639/", readTime: "1 min" },
  { id: 23, title: "Risk Reduction Benchmarks", content: "Research indicates a dose-response relationship: achieving 140 minutes of exercise per week can reduce GDM risk by 25%, while increasing this to 180 minutes can push that reduction as high as 35–40%.", category: "Movement", sourceUrl: "https://api.aerzteblatt.de/pdf/di/119/46/m793.pdf", readTime: "1 min" },
  { id: 24, title: "Safety of High-Intensity Interval Training", content: "Recent 2025 data suggests that for women who were already active, higher-intensity exercise (up to 90% of max heart rate) does not harm the fetus and may offer superior protection against GDM compared to light activity.", category: "Movement", sourceUrl: "https://www.nationalgeographic.com/health/article/exercise-during-pregnancy-new-research-safety-benefits", readTime: "1 min" },
  { id: 25, title: "Early Pregnancy Weight Management", content: "Starting a structured exercise program in the first trimester is more effective at preventing GDM than starting in the second, as it limits early excessive gestational weight gain (eGWG), a primary driver of insulin resistance.", category: "Movement", sourceUrl: "https://pmc.ncbi.nlm.nih.gov/articles/PMC7503359/", readTime: "1 min" },
  { id: 26, title: "Long-Term Protection", content: "For women diagnosed with GDM, maintaining regular physical activity postpartum reduces the risk of progressing to Type 2 Diabetes by approximately 28% in the years following delivery.", category: "Movement", sourceUrl: "https://pmc.ncbi.nlm.nih.gov/articles/PMC4515443/", readTime: "1 min" },
];

// ─── 3. WELLNESS REMINDERS ──────────────────────────────────────
export const pregnancyWellnessReminders = {
  somethingToDo: [
    { text: "Take a gentle 5-minute walk." },
    { text: "Do a few light pregnancy-safe stretches." },
    { text: "Change positions and avoid sitting too long." },
    { text: "Roll your shoulders and relax your neck." },
    { text: "Do a quick posture check and sit with support." },
    { text: "Walk around the room for 2–3 minutes." },
    { text: "Step outside for a little fresh air." },
    { text: "Do a few pelvic floor squeezes." },
    { text: "Move your ankles and feet to ease stiffness." },
    { text: "Take a short, slow walk after a meal if you feel comfortable." },
  ],
  somethingToEatDrink: [
    { text: "Drink a glass of water." },
    { text: "Refill your water bottle." },
    { text: "Have a small healthy snack instead of skipping food." },
    { text: "Eat a fruit with a protein or fat pairing, like apple with nut butter." },
    { text: "Have yogurt or another simple calcium-rich snack." },
    { text: "Add a vegetable to your next meal." },
    { text: "Choose a protein-rich bite, like eggs, yogurt, cheese, beans, or nuts." },
    { text: "Sip water slowly if you have been forgetting to drink." },
    { text: "Have a light snack if nausea feels better when you avoid an empty stomach." },
    { text: "Make a simple nourishing drink, like milk or a smoothie if tolerated." },
  ],
  somethingToRelax: [
    { text: "Take 5 slow deep breaths." },
    { text: "Close your eyes and rest for 1 minute." },
    { text: "Unclench your jaw and drop your shoulders." },
    { text: "Put your phone away for 5 minutes." },
    { text: "Sit quietly and breathe into your belly and ribs gently." },
    { text: "Listen to one calming song." },
    { text: "Rest your legs and feet for a few minutes." },
    { text: "Say one kind thing to yourself and your body." },
    { text: "Do a short gratitude pause for yourself and baby." },
    { text: "Lie or sit comfortably and do a 2-minute calm breathing reset." },
  ],
};
