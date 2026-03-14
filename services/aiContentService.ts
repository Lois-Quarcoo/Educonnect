import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "./api"; // reuse the same backend URL logic

export interface AILesson {
  id: string;
  title: string;
  description: string;
  content: string;
  duration: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  order: number;
}

export interface AIQuizQuestion {
  id: string;
  type: "multiple_choice" | "true_false";
  text: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  difficulty: "Easy" | "Medium" | "Hard";
}

export interface AISubjectContent {
  subjectId: string;
  subjectTitle: string;
  lessons: AILesson[];
  quizzes: AIQuizQuestion[];
  generatedAt: string;
}

// ── Rich static fallback content per subject ─────────────────────────────────

const STATIC_CONTENT: Record<
  string,
  {
    lessons: Omit<AILesson, "id">[];
    quizzes: Omit<AIQuizQuestion, "id">[];
  }
> = {
  math: {
    lessons: [
      {
        title: "Introduction to Numbers",
        description: "Understanding number systems and basic operations",
        content:
          "Numbers are the foundation of mathematics. Natural numbers (1, 2, 3…) let us count. Integers extend these with negative numbers and zero. Rational numbers include fractions like ½. Real numbers fill in the gaps with irrationals like π and √2.\n\nPrime numbers like 2, 3, 5, 7, 11 are only divisible by 1 and themselves — they are the atoms of arithmetic. Every whole number greater than 1 can be factored uniquely into primes. This Prime Factorization Theorem is the bedrock of number theory.\n\nOperations follow PEMDAS order: Parentheses first, then Exponents, then Multiplication/Division left-to-right, and finally Addition/Subtraction left-to-right. This ensures everyone arrives at the same answer regardless of how the expression is written.",
        duration: "15 min",
        difficulty: "Beginner",
        order: 1,
      },
      {
        title: "Algebra Fundamentals",
        description: "Variables, expressions, and solving equations",
        content:
          "Algebra uses letters (variables) to represent unknown values. An expression like 3x + 7 combines a variable term and a constant. An equation asserts equality between two expressions: 3x + 7 = 22 asks 'what value of x makes this true?'\n\nTo isolate x, use inverse operations while keeping both sides balanced. Subtract 7: 3x = 15. Divide by 3: x = 5. Check: 3(5) + 7 = 22 ✓. Always verify your solution. This principle — doing the same thing to both sides — is the golden rule of algebra.\n\nLinear equations graph as straight lines. The slope-intercept form y = mx + b tells you the slope m (steepness) and y-intercept b (where the line crosses the y-axis). Two lines are parallel if they have equal slopes and intersecting if they have different slopes.",
        duration: "20 min",
        difficulty: "Intermediate",
        order: 2,
      },
      {
        title: "Geometry: Shapes and Space",
        description: "Properties of 2D and 3D shapes",
        content:
          "Geometry explores shapes and spatial relationships. Polygons are closed figures with straight sides. Triangles have angles summing to 180°. The Pythagorean theorem (a² + b² = c²) lets you find any side of a right triangle given the other two.\n\nArea measures surface within a shape. A rectangle's area = length × width. A triangle's area = ½ × base × height. Circles use π (≈3.14159): circumference = 2πr and area = πr². These formulas let architects and engineers calculate materials needed for any design.\n\nVolume measures 3D space. A box has volume = length × width × height. A cylinder's volume = πr²h. A sphere's volume = (4/3)πr³. Understanding geometry is essential for construction, art, navigation, and computer graphics.",
        duration: "25 min",
        difficulty: "Intermediate",
        order: 3,
      },
      {
        title: "Statistics and Data Analysis",
        description: "Making sense of data",
        content:
          "Statistics helps us understand data by finding patterns and drawing conclusions. For a dataset, the mean (average) = sum ÷ count. The median is the middle value when sorted. The mode is the most frequent value. These three measures of central tendency describe where data clusters.\n\nSpread matters too. Range = max − min. Standard deviation measures how spread out values are from the mean. A small standard deviation means data clusters tightly; a large one means data is widely spread.\n\nProbability measures how likely events are, from 0 (impossible) to 1 (certain). P(event) = favorable outcomes ÷ total outcomes. For a fair die, P(rolling 3) = 1/6. Understanding probability is vital for risk assessment, weather forecasting, and decision-making.",
        duration: "20 min",
        difficulty: "Intermediate",
        order: 4,
      },
      {
        title: "Introduction to Calculus",
        description: "The mathematics of change",
        content:
          "Calculus studies continuous change. Differential calculus finds instantaneous rates of change using derivatives. If f(x) = x², then f'(x) = 2x, meaning at any point x the slope equals 2x.\n\nThe power rule makes differentiation systematic: d/dx(xⁿ) = nxⁿ⁻¹. Derivatives help find maxima and minima by solving f'(x) = 0. This is how engineers optimize shapes and economists maximize profits.\n\nIntegral calculus finds areas under curves and undoes differentiation. ∫x² dx = x³/3 + C. The Fundamental Theorem of Calculus: differentiation and integration are inverses of each other, connecting two seemingly unrelated operations.",
        duration: "30 min",
        difficulty: "Advanced",
        order: 5,
      },
    ],
    quizzes: [
      {
        type: "multiple_choice",
        text: "Solve for x: 4x − 8 = 20",
        options: ["5", "7", "3", "12"],
        correctAnswerIndex: 1,
        explanation: "Add 8 to both sides: 4x = 28. Divide by 4: x = 7.",
        difficulty: "Easy",
      },
      {
        type: "multiple_choice",
        text: "What is the area of a triangle with base 10 and height 6?",
        options: ["60", "30", "16", "45"],
        correctAnswerIndex: 1,
        explanation: "Area = ½ × base × height = ½ × 10 × 6 = 30.",
        difficulty: "Easy",
      },
      {
        type: "multiple_choice",
        text: "A circle has radius 7. What is its area? (Use π ≈ 22/7)",
        options: ["154", "44", "98", "22"],
        correctAnswerIndex: 0,
        explanation: "Area = πr² = (22/7) × 49 = 154.",
        difficulty: "Medium",
      },
      {
        type: "true_false",
        text: "The Pythagorean theorem a² + b² = c² applies to ALL triangles.",
        options: ["True", "False"],
        correctAnswerIndex: 1,
        explanation: "It only applies to RIGHT triangles, where c is the hypotenuse.",
        difficulty: "Medium",
      },
      {
        type: "multiple_choice",
        text: "What is the derivative of f(x) = 5x³?",
        options: ["5x²", "15x²", "15x", "x⁴"],
        correctAnswerIndex: 1,
        explanation: "Power rule: d/dx(5x³) = 5 × 3x² = 15x².",
        difficulty: "Hard",
      },
    ],
  },
  science: {
    lessons: [
      {
        title: "The Scientific Method",
        description: "How scientists investigate the natural world",
        content:
          "Science is a systematic method for understanding nature. It begins with observation — noticing something unexpected or interesting. This sparks a question, which leads to a hypothesis: a testable, specific prediction.\n\nExperiments test hypotheses by isolating one variable at a time. The independent variable is what you change; the dependent variable is what you measure; controlled variables are kept constant. Multiple trials and repetition by other scientists validate findings.\n\nResults either support or refute the hypothesis. Science is self-correcting — when evidence contradicts a theory, the theory must change. This willingness to update beliefs based on evidence distinguishes scientific thinking from other forms of knowledge.",
        duration: "15 min",
        difficulty: "Beginner",
        order: 1,
      },
      {
        title: "Cell Biology",
        description: "The fundamental units of all living things",
        content:
          "All living organisms are made of cells — the smallest units capable of carrying out life processes. Prokaryotic cells (bacteria and archaea) are simpler, lacking a membrane-bound nucleus. Eukaryotic cells (plants, animals, fungi) are more complex, with organelles performing specialized functions.\n\nAnimal cells contain: the nucleus (DNA control centre), mitochondria (energy factories producing ATP), ribosomes (protein-building machines), and the cell membrane (selective gatekeeper). The cytoplasm is the jelly-like interior fluid.\n\nPlant cells additionally have a rigid cell wall (structural support), chloroplasts (capturing sunlight for photosynthesis), and a large central vacuole (water storage). Cell division — mitosis creates identical daughter cells for growth; meiosis creates genetically unique sex cells for reproduction.",
        duration: "20 min",
        difficulty: "Intermediate",
        order: 2,
      },
      {
        title: "Chemistry: Matter and Reactions",
        description: "Atoms, molecules, and chemical change",
        content:
          "All matter is made of atoms. Each element's atom has a specific number of protons (atomic number). The periodic table organizes elements by atomic number — elements in the same column share similar chemical behaviours.\n\nAtoms bond to form molecules. Covalent bonds share electrons (water H₂O). Ionic bonds transfer electrons (table salt NaCl). Chemical reactions rearrange atoms — conservation of mass means the same atoms are present before and after.\n\nReaction rates depend on concentration, temperature, surface area, and catalysts. Acids donate H⁺ ions (pH < 7); bases accept them (pH > 7); neutral solutions have pH 7. These concepts explain everything from medicine to cooking.",
        duration: "25 min",
        difficulty: "Intermediate",
        order: 3,
      },
      {
        title: "Ecosystems and Ecology",
        description: "Living things and their environments",
        content:
          "Ecology studies relationships between organisms and their environments. An ecosystem includes all biotic (living) and abiotic (non-living) components. Each organism occupies a niche: its role and position in the ecosystem.\n\nEnergy flows through food chains. Producers (plants, algae) capture solar energy through photosynthesis. Primary consumers (herbivores) eat plants. Secondary consumers eat herbivores. Only about 10% of energy transfers between each level — this explains why food chains rarely exceed 4–5 links.\n\nBiogeochemical cycles recycle matter: the water cycle, carbon cycle, nitrogen cycle, and phosphorus cycle. Biodiversity stabilises ecosystems — diverse communities resist disruption better than simple ones.",
        duration: "20 min",
        difficulty: "Intermediate",
        order: 4,
      },
      {
        title: "Genetics and Heredity",
        description: "How traits are inherited and DNA works",
        content:
          "DNA is the molecule of heredity — a double helix of base pairs: adenine pairs with thymine, cytosine with guanine. DNA is packaged into 46 chromosomes (23 pairs) inside the nucleus of human cells.\n\nGenes are DNA segments that code for specific proteins. Gene expression: DNA → (transcription) → mRNA → (translation) → protein. Mutations are changes in DNA sequence that can alter protein function.\n\nMendel's laws describe inheritance patterns. Dominant alleles mask recessive ones. Punnett squares predict offspring ratios. Modern genetics has expanded to reveal polygenic traits, epigenetics, and gene-environment interactions explaining the complexity of living things.",
        duration: "25 min",
        difficulty: "Advanced",
        order: 5,
      },
    ],
    quizzes: [
      {
        type: "multiple_choice",
        text: "Which organelle is known as the 'powerhouse of the cell'?",
        options: ["Nucleus", "Ribosome", "Mitochondria", "Golgi apparatus"],
        correctAnswerIndex: 2,
        explanation: "Mitochondria produce ATP through cellular respiration, fuelling all cell activities.",
        difficulty: "Easy",
      },
      {
        type: "multiple_choice",
        text: "Photosynthesis uses CO₂ and water to produce:",
        options: ["Protein and oxygen", "Glucose and oxygen", "ATP and CO₂", "Starch and nitrogen"],
        correctAnswerIndex: 1,
        explanation: "6CO₂ + 6H₂O + light → C₆H₁₂O₆ (glucose) + 6O₂.",
        difficulty: "Easy",
      },
      {
        type: "true_false",
        text: "Prokaryotic cells have a membrane-bound nucleus.",
        options: ["True", "False"],
        correctAnswerIndex: 1,
        explanation: "Prokaryotes lack a membrane-bound nucleus — only eukaryotes have one.",
        difficulty: "Medium",
      },
      {
        type: "multiple_choice",
        text: "What percentage of energy typically transfers from one trophic level to the next?",
        options: ["50%", "25%", "10%", "1%"],
        correctAnswerIndex: 2,
        explanation: "The 10% rule: only ~10% of energy passes between trophic levels; the rest is lost as heat.",
        difficulty: "Hard",
      },
      {
        type: "multiple_choice",
        text: "In Mendel's genetics, a capital letter (B) represents a:",
        options: ["Recessive allele", "Dominant allele", "Mutated gene", "Sex-linked trait"],
        correctAnswerIndex: 1,
        explanation: "Convention: dominant alleles use capital letters; recessive alleles use lowercase.",
        difficulty: "Medium",
      },
    ],
  },
  // ── other subjects use the same keys as before (english, history, geography, physics)
  // They are omitted here for brevity — the backend will generate fresh Gemini content
  // and the cache means this static block is only a last-resort fallback.
};

// ── Cache ─────────────────────────────────────────────────────────────────────
const CONTENT_CACHE_KEY = "ai_subject_content_v4"; // bumped version clears old cache
const CACHE_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export class AIContentService {
  /**
   * Get subject content — tries the backend (Gemini) first, falls back to
   * rich static content if the backend is unreachable.
   */
  static async getSubjectContent(
    subjectId: string,
    subjectTitle: string,
    forceRefresh = false,
  ): Promise<AISubjectContent> {
    if (!forceRefresh) {
      const cached = await this.readCache(subjectId);
      if (cached) return cached;
    }

    try {
      const content = await this.fetchFromBackend(subjectId, subjectTitle);
      if (content) {
        await this.writeCache(subjectId, content);
        return content;
      }
    } catch (e) {
      console.log("[AIContentService] backend unavailable, using static fallback:", e);
    }

    const fallback = this.buildStaticContent(subjectId, subjectTitle);
    await this.writeCache(subjectId, fallback);
    return fallback;
  }

  // ── Backend call ─────────────────────────────────────────────────────────────

  private static async fetchFromBackend(
    subjectId: string,
    subjectTitle: string,
  ): Promise<AISubjectContent | null> {
    const res = await fetch(`${API_URL}/ai/content`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subjectId, subjectTitle }),
      signal: AbortSignal.timeout(30_000),
    });

    if (!res.ok) return null;

    const json = await res.json();
    if (!json.success || !json.data) return null;

    return json.data as AISubjectContent;
  }

  // ── Static fallback ───────────────────────────────────────────────────────────

  private static buildStaticContent(
    subjectId: string,
    subjectTitle: string,
  ): AISubjectContent {
    const key = subjectId.toLowerCase();
    const data = STATIC_CONTENT[key] || STATIC_CONTENT["math"];

    return {
      subjectId,
      subjectTitle,
      lessons: data.lessons.map((l, i) => ({ ...l, id: `${key}_l${i + 1}` })),
      quizzes: data.quizzes.map((q, i) => ({ ...q, id: `${key}_q${i + 1}` })),
      generatedAt: new Date().toISOString(),
    };
  }

  // ── AsyncStorage cache ────────────────────────────────────────────────────────

  private static async readCache(subjectId: string): Promise<AISubjectContent | null> {
    try {
      const raw = await AsyncStorage.getItem(`${CONTENT_CACHE_KEY}:${subjectId}`);
      if (!raw) return null;
      const content: AISubjectContent = JSON.parse(raw);
      const age = Date.now() - new Date(content.generatedAt).getTime();
      return age > CACHE_DURATION_MS ? null : content;
    } catch {
      return null;
    }
  }

  private static async writeCache(
    subjectId: string,
    content: AISubjectContent,
  ): Promise<void> {
    try {
      await AsyncStorage.setItem(
        `${CONTENT_CACHE_KEY}:${subjectId}`,
        JSON.stringify(content),
      );
    } catch (e) {
      console.error("[AIContentService] cache write failed:", e);
    }
  }
}