import AsyncStorage from "@react-native-async-storage/async-storage";

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
          "Statistics helps us understand data by finding patterns and drawing conclusions. For a dataset, the mean (average) = sum ÷ count. The median is the middle value when sorted. The mode is the most frequent value. These three measures of central tendency describe where data clusters.\n\nSpread matters too. Range = max − min. Standard deviation measures how spread out values are from the mean. A small standard deviation means data clusters tightly; a large one means data is widely spread. Box plots visually show median, quartiles, and outliers at a glance.\n\nProbability measures how likely events are, from 0 (impossible) to 1 (certain). P(event) = favorable outcomes ÷ total outcomes. For a fair die, P(rolling 3) = 1/6. Understanding probability is vital for risk assessment, weather forecasting, and decision-making.",
        duration: "20 min",
        difficulty: "Intermediate",
        order: 4,
      },
      {
        title: "Introduction to Calculus",
        description: "The mathematics of change",
        content:
          "Calculus studies continuous change — perhaps the most powerful mathematical tool ever developed. Differential calculus finds instantaneous rates of change using derivatives. If f(x) = x², then f'(x) = 2x, meaning at any point x, the slope of the curve equals 2x.\n\nThe power rule makes differentiation systematic: d/dx(xⁿ) = nxⁿ⁻¹. Derivatives help find maxima and minima by solving f'(x) = 0. This is how engineers optimize bridge shapes, economists maximize profits, and physicists predict particle paths.\n\nIntegral calculus finds areas under curves and undoes differentiation. ∫x² dx = x³/3 + C. The Fundamental Theorem of Calculus is perhaps the deepest result in mathematics: differentiation and integration are inverses of each other, connecting two seemingly unrelated operations.",
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
        explanation: "Area = πr² = (22/7) × 49 = 22 × 7 = 154.",
        difficulty: "Medium",
      },
      {
        type: "true_false",
        text: "The Pythagorean theorem a² + b² = c² applies to ALL triangles.",
        options: ["True", "False"],
        correctAnswerIndex: 1,
        explanation: "It only applies to RIGHT triangles, where c is the hypotenuse (opposite the 90° angle).",
        difficulty: "Medium",
      },
      {
        type: "multiple_choice",
        text: "What is the derivative of f(x) = 5x³?",
        options: ["5x²", "15x²", "15x", "x⁴"],
        correctAnswerIndex: 1,
        explanation: "Using the power rule: d/dx(5x³) = 5 × 3x² = 15x².",
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
          "Science is a systematic method for understanding nature. It begins with observation — noticing something unexpected or interesting. This sparks a question, which leads to a hypothesis: a testable, specific prediction. A good hypothesis can be proven wrong — that's what makes science powerful.\n\nExperiments test hypotheses by isolating one variable at a time. The independent variable is what you change; the dependent variable is what you measure; controlled variables are kept constant so they don't confuse results. Multiple trials and repetition by other scientists validate findings.\n\nResults either support or refute the hypothesis. Science is self-correcting — when evidence contradicts a theory, the theory must change. This willingness to update beliefs based on evidence is what distinguishes scientific thinking from other forms of knowledge.",
        duration: "15 min",
        difficulty: "Beginner",
        order: 1,
      },
      {
        title: "Cell Biology",
        description: "The fundamental units of all living things",
        content:
          "All living organisms are made of cells — the smallest units capable of carrying out life processes. Prokaryotic cells (bacteria and archaea) are simpler, lacking a membrane-bound nucleus. Eukaryotic cells (plants, animals, fungi) are more complex, with organelles performing specialized functions.\n\nAnimal cells contain: the nucleus (DNA, the cell's instruction manual), mitochondria (energy factories producing ATP), ribosomes (protein-building machines), the endoplasmic reticulum (transport system), Golgi apparatus (packaging station), and the cell membrane (selective gatekeeper). The cytoplasm is the jelly-like interior fluid.\n\nPlant cells additionally have: a rigid cell wall (structural support), chloroplasts (capturing sunlight for photosynthesis), and a large central vacuole (water storage, maintaining pressure). Cell division — mitosis creates identical daughter cells for growth and repair; meiosis creates genetically unique sex cells for reproduction.",
        duration: "20 min",
        difficulty: "Intermediate",
        order: 2,
      },
      {
        title: "Chemistry: Matter and Reactions",
        description: "Atoms, molecules, and chemical change",
        content:
          "All matter is made of atoms. Each element's atom has a specific number of protons (atomic number). The periodic table organizes elements by atomic number — elements in the same column share similar chemical behaviors because they have the same number of outer electrons.\n\nAtoms bond to form molecules. In covalent bonds, atoms share electrons (water H₂O, carbon dioxide CO₂). In ionic bonds, electrons transfer from one atom to another (table salt NaCl). Chemical reactions rearrange atoms — the same atoms are present before and after, just in different arrangements. Balanced equations show conservation of matter.\n\nReaction rates depend on concentration, temperature, surface area, and catalysts (which speed reactions without being consumed). Acids donate H⁺ ions (pH < 7); bases accept them (pH > 7); neutral solutions have pH 7. These concepts explain everything from medicine to cooking.",
        duration: "25 min",
        difficulty: "Intermediate",
        order: 3,
      },
      {
        title: "Ecosystems and Ecology",
        description: "Living things and their environments",
        content:
          "Ecology studies the relationships between organisms and their environments. An ecosystem includes all biotic (living) and abiotic (non-living) components in an area — from rainforests to coral reefs to urban parks. Each organism occupies a niche: its role and position in the ecosystem.\n\nEnergy flows through food chains. Producers (plants, algae) capture solar energy through photosynthesis. Primary consumers (herbivores) eat plants. Secondary consumers eat herbivores, and so on. Only about 10% of energy transfers between each level — this explains why food chains rarely exceed 4-5 links.\n\nBiogeochemical cycles recycle matter: the water cycle, carbon cycle, nitrogen cycle, and phosphorus cycle. Biodiversity stabilizes ecosystems — diverse communities resist disruption better than simple ones. Human activities (deforestation, pollution, climate change) disrupt these delicate systems with cascading consequences.",
        duration: "20 min",
        difficulty: "Intermediate",
        order: 4,
      },
      {
        title: "Genetics and Heredity",
        description: "How traits are inherited and DNA works",
        content:
          "DNA (deoxyribonucleic acid) is the molecule of heredity. It's a double helix of nucleotide base pairs — adenine pairs with thymine, cytosine with guanine. DNA is packaged into chromosomes inside the nucleus. Humans have 46 chromosomes (23 pairs) in most cells.\n\nGenes are segments of DNA that code for specific proteins — the building blocks of life that carry out virtually every cellular function. Gene expression: DNA → (transcription) → mRNA → (translation) → protein. Mutations are changes in DNA sequence that can alter protein function, sometimes harmfully, sometimes beneficially.\n\nMendel's laws describe inheritance patterns. Dominant alleles mask recessive ones (Bb shows dominant trait). Using Punnett squares predicts offspring genotype ratios. Modern genetics has expanded beyond Mendelian patterns to reveal polygenic traits, epigenetics, and gene-environment interactions that explain the complexity of living things.",
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
        explanation: "Mitochondria produce ATP energy through cellular respiration, fueling all cell activities.",
        difficulty: "Easy",
      },
      {
        type: "multiple_choice",
        text: "The chemical equation for photosynthesis uses CO₂ and water to produce:",
        options: ["Protein and oxygen", "Glucose and oxygen", "ATP and CO₂", "Starch and nitrogen"],
        correctAnswerIndex: 1,
        explanation: "Photosynthesis: 6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ (glucose) + 6O₂.",
        difficulty: "Easy",
      },
      {
        type: "true_false",
        text: "Prokaryotic cells have a membrane-bound nucleus.",
        options: ["True", "False"],
        correctAnswerIndex: 1,
        explanation: "Prokaryotes (bacteria, archaea) lack a membrane-bound nucleus. Only eukaryotes have one.",
        difficulty: "Medium",
      },
      {
        type: "multiple_choice",
        text: "In Mendel's genetics, a capital letter (B) represents a:",
        options: ["Recessive allele", "Dominant allele", "Mutated gene", "Sex-linked trait"],
        correctAnswerIndex: 1,
        explanation: "By convention, dominant alleles are written with capital letters; recessive alleles with lowercase.",
        difficulty: "Medium",
      },
      {
        type: "multiple_choice",
        text: "What percentage of energy typically transfers from one trophic level to the next?",
        options: ["50%", "25%", "10%", "1%"],
        correctAnswerIndex: 2,
        explanation: "The 10% rule: only ~10% of energy transfers between trophic levels; the rest is lost as heat.",
        difficulty: "Hard",
      },
    ],
  },

  english: {
    lessons: [
      {
        title: "Parts of Speech",
        description: "The grammatical building blocks of English",
        content:
          "English has eight parts of speech. Nouns name people, places, things, or ideas (student, Accra, pen, freedom). Pronouns replace nouns to avoid repetition (he, she, they, it). Verbs express actions (run, think) or states of being (is, seems, appears). Adjectives describe nouns (brilliant, ancient, three).\n\nAdverbs modify verbs, adjectives, or other adverbs and often answer how, when, where, or to what degree (quickly, yesterday, there, extremely). Prepositions show relationships between nouns and other words (in, on, under, before, despite). Conjunctions connect words, phrases, or clauses (and, but, because, although, however).\n\nIdentifying parts of speech in sentences helps you understand grammar rules and write more precisely. The same word can function as different parts of speech: 'The book is heavy' (noun) vs. 'Book the flight' (verb). Context determines function.",
        duration: "15 min",
        difficulty: "Beginner",
        order: 1,
      },
      {
        title: "Essay Writing Mastery",
        description: "Structure, argument, and persuasion",
        content:
          "A well-structured essay moves readers from a question to a well-reasoned conclusion. The introduction has three jobs: hook the reader (start with a striking fact, anecdote, or question), provide context (background information), and deliver the thesis — your central, debatable claim that the essay will prove.\n\nEach body paragraph develops one supporting point. The topic sentence states the paragraph's main idea and connects to the thesis. Evidence (quotations, statistics, examples) supports the claim. Analysis explains HOW and WHY the evidence supports your argument — this is where most students are weakest. Don't just present evidence; interpret it. Transitions guide readers between paragraphs smoothly.\n\nThe conclusion doesn't merely repeat the introduction. It synthesizes your argument's significance: given what you've proved, what should readers think or do? End with a broader implication — connect your specific argument to a larger truth about the world. A memorable final sentence leaves readers with something to think about.",
        duration: "20 min",
        difficulty: "Intermediate",
        order: 2,
      },
      {
        title: "Literary Analysis",
        description: "Reading beneath the surface of texts",
        content:
          "Literature rewards careful analysis. Theme is the central message or insight about life — not just a topic ('love') but a statement about it ('love requires sacrifice'). Motifs are recurring symbols, images, or ideas that reinforce theme throughout a work.\n\nCharacter analysis examines motivation, development, and relationships. Round characters are complex and contradictory — like real people. Flat characters serve a single function. Dynamic characters change fundamentally; static characters remain unchanged. The most interesting characters are usually dynamic and round, like Hamlet or Elizabeth Bennet.\n\nFigurative language creates meaning beyond literal words. Similes compare with 'like' or 'as' ('He fought like a lion'). Metaphors directly equate ('He was a lion in battle'). Personification gives human qualities to non-humans. Irony creates contrast between appearance and reality. Analyzing these choices reveals how authors craft meaning and manipulate reader response.",
        duration: "25 min",
        difficulty: "Intermediate",
        order: 3,
      },
      {
        title: "Punctuation and Sentence Mechanics",
        description: "Precision in writing",
        content:
          "Punctuation controls how readers hear your writing. Commas signal pauses: they separate items in lists ('red, white, and blue'), join independent clauses with coordinating conjunctions ('I studied, and I passed'), and set off introductory phrases ('After three hours, I finished'). Missing or misplaced commas change meaning dramatically.\n\nSemicolons connect closely related independent clauses without a conjunction ('She loved reading; her brother preferred sports'). Colons introduce explanations or lists ('He needed three things: patience, practice, and persistence'). Dashes create dramatic pauses or interruptions — like this — for emphasis. Parentheses add non-essential information (bonus material).\n\nApostrophes have two jobs: possession (the student's notebook — the notebook belonging to the student) and contractions (don't = do not, it's = it is). Note: 'its' without apostrophe is possessive ('the dog wagged its tail'); 'it's' with apostrophe means 'it is' or 'it has'. This distinction trips up even skilled writers.",
        duration: "15 min",
        difficulty: "Intermediate",
        order: 4,
      },
      {
        title: "Advanced Reading Strategies",
        description: "Engaging critically with texts",
        content:
          "Skilled readers are active participants, not passive consumers. Before reading, preview: scan titles, subheadings, first and last paragraphs to build a mental framework. Set a reading purpose — are you seeking information, pleasure, critical evaluation, or creative inspiration? Purpose shapes attention.\n\nDuring reading, annotate: underline key claims, circle unfamiliar vocabulary, write questions in margins. Ask constantly: What is the author's purpose? What assumptions does the author make? What evidence supports each claim? Is the reasoning logical? Identifying rhetorical strategies (pathos, logos, ethos) reveals how authors attempt to influence readers.\n\nAfter reading, consolidate understanding. Summarize the main argument in 2-3 sentences without looking at the text — this reveals what you truly understood. Evaluate the argument: is it well-supported, logically consistent, and persuasive? Connect the text to your own experience and other texts. Forming your own reasoned judgment, rather than accepting the author's, is the goal of critical reading.",
        duration: "20 min",
        difficulty: "Advanced",
        order: 5,
      },
    ],
    quizzes: [
      {
        type: "multiple_choice",
        text: "Which part of speech modifies a verb, adjective, or another adverb?",
        options: ["Adjective", "Preposition", "Adverb", "Conjunction"],
        correctAnswerIndex: 2,
        explanation: "Adverbs modify verbs ('ran quickly'), adjectives ('very tall'), or other adverbs ('quite slowly').",
        difficulty: "Easy",
      },
      {
        type: "multiple_choice",
        text: "A thesis statement in an essay should:",
        options: [
          "List every piece of evidence",
          "State your debatable central argument",
          "Begin with 'I think' or 'I believe'",
          "Summarize the entire essay",
        ],
        correctAnswerIndex: 1,
        explanation: "A thesis presents a specific, arguable claim that your essay will prove with evidence and analysis.",
        difficulty: "Easy",
      },
      {
        type: "true_false",
        text: "Similes compare two things directly without using 'like' or 'as'.",
        options: ["True", "False"],
        correctAnswerIndex: 1,
        explanation: "Similes use 'like' or 'as' ('brave as a lion'). Metaphors make direct comparisons ('he was a lion').",
        difficulty: "Medium",
      },
      {
        type: "multiple_choice",
        text: "In 'the team's victory,' what role does the apostrophe play?",
        options: ["Shows a contraction", "Shows plural", "Shows possession", "Shows omission"],
        correctAnswerIndex: 2,
        explanation: "Apostrophe + s after a singular noun shows possession — the victory belonging to the team.",
        difficulty: "Medium",
      },
      {
        type: "multiple_choice",
        text: "Which literary device gives human qualities to non-human things?",
        options: ["Metaphor", "Personification", "Alliteration", "Hyperbole"],
        correctAnswerIndex: 1,
        explanation: "Personification: 'The wind whispered secrets' gives the wind the human ability to whisper.",
        difficulty: "Easy",
      },
    ],
  },

  history: {
    lessons: [
      {
        title: "Ancient Civilizations",
        description: "The birth of human civilization",
        content:
          "Civilization emerged where reliable water supported agriculture — enabling surpluses, specialization, and cities. Mesopotamia ('land between the rivers' Tigris and Euphrates, modern Iraq) gave us the Sumerians around 3500 BCE. They invented cuneiform writing, the wheel, and organized city-states with complex laws. Hammurabi's Code (1754 BCE) is one of history's earliest legal systems.\n\nAncient Egypt unified around 3100 BCE under pharaohs who were considered divine. The pyramids, built as royal tombs, demonstrate extraordinary organizational ability. The Great Pyramid required roughly 20 years and an estimated 100,000 workers. Hieroglyphics recorded history, religious texts, and daily life in a writing system active for 3,500 years.\n\nOther great civilizations included: the Indus Valley (modern Pakistan/India) with planned cities and drainage systems; ancient China's Yellow River civilization, which developed silk, paper, and the world's oldest continuous writing system; and Mesoamerican cultures like the Olmec and Maya with sophisticated astronomy and mathematics.",
        duration: "20 min",
        difficulty: "Beginner",
        order: 1,
      },
      {
        title: "Classical Greece and Rome",
        description: "Foundations of Western civilization",
        content:
          "Ancient Greece (800–31 BCE) gave the world democracy, philosophy, drama, and the Olympic Games. Athens under Cleisthenes developed direct democracy (508 BCE) — citizens voted directly on laws. Philosophers Socrates, Plato, and Aristotle developed logical reasoning, ethics, and political philosophy still taught today. Alexander the Great (356–323 BCE) spread Greek culture across Persia, Egypt, and into India.\n\nRome began as a small city-state, developed the Republic (509 BCE) with its Senate, gradually conquered the Mediterranean world, and became an Empire under Augustus (27 BCE). Roman engineering — aqueducts, roads, concrete — transformed infrastructure across Europe, North Africa, and the Middle East. Roman law, especially the principle that all citizens are equal before the law, directly influenced modern legal systems.\n\nRome's greatest cultural export was Christianity. It spread rapidly through Roman infrastructure, became the official state religion under Constantine (313 CE), and shaped European culture for two millennia. Rome's eventual fall in 476 CE didn't end its influence — it transformed into the Catholic Church, the Byzantine Empire, and the Latin languages spoken by hundreds of millions today.",
        duration: "25 min",
        difficulty: "Intermediate",
        order: 2,
      },
      {
        title: "African Kingdoms and Empires",
        description: "The rich history of the African continent",
        content:
          "Africa is humanity's cradle — the oldest known human fossils (Homo sapiens) date to about 300,000 years ago in Morocco. Ancient African kingdoms matched any civilization in sophistication. The Kingdom of Kush (modern Sudan) conquered and ruled Egypt 744–656 BCE. Its pyramids still stand, more numerous than Egypt's though less well-known.\n\nThe Mali Empire (13th–14th century CE) controlled trans-Saharan gold and salt trade, making it arguably the world's wealthiest state. Mansa Musa, its most famous ruler, is considered the richest individual in recorded history. His 1324 pilgrimage to Mecca — travelling with 60,000 people and 12,000 kg of gold — famously crashed gold markets across the Middle East and North Africa.\n\nThe Swahili Coast cities (Kilwa, Mombasa, Zanzibar) integrated into Indian Ocean trade networks connecting Africa to Arabia, India, and China. Great Zimbabwe (12th–15th century) built massive stone enclosures without mortar — an engineering feat proving sophisticated civilization existed in southern Africa. European colonization in the 1880s–1960s fragmented and exploited the continent, but Africa's post-independence story is one of resilience and ongoing economic growth.",
        duration: "25 min",
        difficulty: "Intermediate",
        order: 3,
      },
      {
        title: "The World Wars",
        description: "Global conflicts that reshaped the 20th century",
        content:
          "World War I (1914–1918) began with Archduke Franz Ferdinand's assassination in Sarajevo — but underlying causes included imperial rivalries, nationalist tensions, interlocking alliances, and military buildups. Trench warfare created horrific stalemates on the Western Front. New weapons — machine guns, poison gas, tanks, aircraft, submarines — made this the first truly industrialized war. About 17 million people died.\n\nThe Treaty of Versailles (1919) punished Germany with territorial losses, disarmament, and crippling reparations. Economic depression (1929) and wounded national pride created fertile ground for Adolf Hitler's rise. Germany's 1939 invasion of Poland began World War II. The Holocaust systematically murdered 6 million Jews and millions of Roma, disabled people, and others. Allied forces — USA, UK, USSR, and dozens of others — fought across Europe, Africa, and the Pacific.\n\nGermany surrendered in May 1945; Japan surrendered after atomic bombs destroyed Hiroshima (August 6) and Nagasaki (August 9), killing roughly 200,000 people. Total WWII deaths reached 70–85 million — the deadliest conflict in human history. The United Nations was established in 1945 to prevent future world wars. The Cold War between the USA and USSR immediately followed.",
        duration: "25 min",
        difficulty: "Intermediate",
        order: 4,
      },
      {
        title: "Independence and Decolonization",
        description: "How colonized nations gained freedom",
        content:
          "By 1900, European powers controlled 84% of the Earth's surface. Independence movements grew throughout the 20th century, drawing strength from the contradictions exposed by the World Wars: nations fighting for freedom abroad while denying it to colonized peoples at home. Gandhi's nonviolent resistance movement in India demonstrated that moral authority could defeat military power — India gained independence in 1947.\n\nAfrica's decolonization wave swept from the late 1950s through the 1970s. Ghana (1957) under Kwame Nkrumah became the first sub-Saharan African nation to gain independence, inspiring dozens more. By 1975, nearly all African nations were independent. Jomo Kenyatta (Kenya), Julius Nyerere (Tanzania), and Nelson Mandela (South Africa) became iconic independence leaders.\n\nDecolonization created both opportunities and challenges. Artificial colonial borders grouped rival ethnicities and divided unified peoples. Many new nations inherited extractive economic structures, underdeveloped institutions, and Cold War interference. Yet the 60 years since decolonization have seen remarkable growth in literacy, life expectancy, democracy, and economic development across the formerly colonized world.",
        duration: "25 min",
        difficulty: "Advanced",
        order: 5,
      },
    ],
    quizzes: [
      {
        type: "multiple_choice",
        text: "Which ancient civilization is credited with inventing cuneiform writing?",
        options: ["Ancient Egyptians", "Sumerians", "Ancient Greeks", "Persians"],
        correctAnswerIndex: 1,
        explanation: "The Sumerians of Mesopotamia developed cuneiform around 3400–3100 BCE, one of humanity's earliest writing systems.",
        difficulty: "Easy",
      },
      {
        type: "multiple_choice",
        text: "World War II ended in which year?",
        options: ["1943", "1944", "1945", "1946"],
        correctAnswerIndex: 2,
        explanation: "WWII ended in 1945: V-E Day (May 8, Europe) and V-J Day (September 2, Japan).",
        difficulty: "Easy",
      },
      {
        type: "true_false",
        text: "The Roman Empire came before the Roman Republic.",
        options: ["True", "False"],
        correctAnswerIndex: 1,
        explanation: "Rome was first a Kingdom, then a Republic (509 BCE), and only became an Empire after 27 BCE under Augustus.",
        difficulty: "Medium",
      },
      {
        type: "multiple_choice",
        text: "Mansa Musa was the ruler of which medieval African empire?",
        options: ["Songhai Empire", "Kush Kingdom", "Mali Empire", "Great Zimbabwe"],
        correctAnswerIndex: 2,
        explanation: "Mansa Musa ruled the Mali Empire in the 14th century and is considered the wealthiest person in recorded history.",
        difficulty: "Medium",
      },
      {
        type: "multiple_choice",
        text: "Ghana became the first sub-Saharan African nation to gain independence in:",
        options: ["1945", "1951", "1957", "1963"],
        correctAnswerIndex: 2,
        explanation: "Ghana gained independence from Britain on March 6, 1957, under Prime Minister Kwame Nkrumah.",
        difficulty: "Hard",
      },
    ],
  },

  geography: {
    lessons: [
      {
        title: "Earth's Structure and Systems",
        description: "Understanding our planet",
        content:
          "Earth is approximately 4.5 billion years old and the only known planet with life. Its interior has four layers. The inner core (solid iron-nickel, ~5,400°C) is surrounded by the liquid outer core (which generates Earth's magnetic field, protecting us from deadly solar wind). The mantle (semi-solid rock) circulates slowly in convection currents, driving plate tectonics. The crust — oceanic (5–10 km thick, denser) and continental (30–50 km thick, lighter) — is Earth's thin outer skin.\n\nEarth's four major systems interact constantly. The atmosphere (layers: troposphere, stratosphere, mesosphere, thermosphere, exosphere) provides air, regulates temperature, and protects against UV radiation. The hydrosphere contains all water — oceans (97%), glaciers (~2%), and freshwater (<1%). The lithosphere is Earth's solid rock. The biosphere includes all living things from the deepest ocean trench to the highest mountain.\n\nThe water cycle links these systems: evaporation from oceans forms clouds, precipitation falls as rain or snow, water flows as rivers back to oceans or infiltrates soil. This cycle distributes fresh water globally and regulates climate. Understanding Earth's systems is essential for predicting natural disasters, managing resources, and addressing climate change.",
        duration: "20 min",
        difficulty: "Beginner",
        order: 1,
      },
      {
        title: "Continents, Oceans, and Landforms",
        description: "Earth's major physical features",
        content:
          "Earth has seven continents: Africa (largest by diverse cultures per km²), Antarctica (coldest, covered by ice sheet containing 70% of Earth's fresh water), Asia (largest and most populous, home to 60% of humanity), Australia/Oceania (smallest continental landmass), Europe, North America, and South America. The continents were once joined as Pangaea — plate tectonics have been separating them for 175 million years.\n\nFive oceans cover 71% of Earth's surface. The Pacific (largest — bigger than all land combined) reaches 11,034 m depth in the Mariana Trench. The Atlantic, Indian, Southern, and Arctic oceans complete the world ocean system. Oceans regulate global temperature, produce 50% of Earth's oxygen through phytoplankton, absorb 30% of human CO₂ emissions, and drive global weather patterns.\n\nMajor landforms include mountain ranges (Himalayas, Andes, Alps, Rockies), river systems (Nile, Amazon, Congo, Mississippi, Niger), deserts (Sahara, Arabian, Gobi, Kalahari), and plains (Eurasian steppes, African savannas, South American pampas). These physical features shaped human history — rivers enabled civilization, mountains provided protection, deserts created barriers, and plains allowed agriculture.",
        duration: "20 min",
        difficulty: "Beginner",
        order: 2,
      },
      {
        title: "Climate Zones and Weather",
        description: "Understanding Earth's climate systems",
        content:
          "Climate is long-term atmospheric patterns; weather is short-term conditions. The Sun's uneven heating of Earth drives everything: equatorial regions receive the most solar energy and are hottest; polar regions receive the least and are coldest. This temperature difference drives global air circulation, creating consistent wind patterns (trade winds, westerlies, polar easterlies).\n\nClimate zones depend on latitude, altitude, and distance from oceans. Tropical zones (near equator) are hot and humid year-round, supporting rainforests. Subtropical zones (20–35°) include hot deserts (Sahara, Arabian) where rainfall is minimal. Temperate zones (35–60°) have four distinct seasons. Polar zones experience extreme cold and darkness. Altitude creates micro-climates — mountains can have multiple climate zones from base to summit.\n\nEl Niño (periodic warming of Pacific) and La Niña (cooling) disrupt normal weather globally every 2–7 years. Monsoons are seasonal wind reversals bringing heavy rainfall to South Asia and West Africa. Climate change is intensifying weather extremes — more powerful hurricanes, longer droughts, heavier floods — by adding energy to weather systems through global warming.",
        duration: "20 min",
        difficulty: "Intermediate",
        order: 3,
      },
      {
        title: "Population and Human Geography",
        description: "Where people live and why",
        content:
          "Earth's 8 billion people are distributed very unevenly. Population clusters in a few key areas: South and East Asia (China and India alone hold 2.8 billion), Europe's river valleys, and coastal regions worldwide. Population density reflects climate, resources, and economic opportunity — people cluster where life is livable and livelihoods are possible.\n\nUrbanization — migration from rural to urban areas — is the defining demographic trend of our era. In 1900, 13% of people lived in cities. Today it's 56%; by 2050, 68%. Megacities (10 million+ people) like Tokyo (37 million), Delhi (33 million), and Lagos (15 million, growing rapidly) face enormous challenges: infrastructure, housing, water, sanitation, and employment.\n\nDemographic transition describes how societies move from high birth/death rates to low rates as they develop economically. Early development stage: high birth rate, high death rate, slow growth. Developing: death rate falls (medicine, sanitation), birth rate stays high, rapid population growth. Developed: both rates fall, slow growth or decline. Understanding demographics shapes education, healthcare, housing, and pension policy.",
        duration: "20 min",
        difficulty: "Intermediate",
        order: 4,
      },
      {
        title: "Environmental Geography and Sustainability",
        description: "Human impact on Earth's systems",
        content:
          "Human activities have become a geological force. Deforestation has removed 30% of Earth's forests since 1700. The Amazon — which generates its own rainfall through transpiration — has lost 20% of its cover since 1970. Deforestation releases stored carbon, reduces biodiversity, disrupts local and regional climate, and threatens indigenous communities.\n\nClimate change results primarily from burning fossil fuels (coal, oil, gas) releasing CO₂ stored over millions of years. Atmospheric CO₂ has risen from 280 ppm (pre-industrial) to 420 ppm today — the highest in 3 million years. Consequences: global average temperature +1.1°C and rising, sea levels rising at 3.3 mm/year (threatening coastal cities home to billions), more frequent extreme weather, ocean acidification threatening marine ecosystems, and shifting growing seasons disrupting food security.\n\nSustainability means meeting present needs without compromising future generations. The energy transition to renewables (solar costs fell 90% in a decade) offers a path to reduce emissions. Circular economy principles minimize waste. Nature-based solutions (reforestation, wetland restoration) simultaneously sequester carbon and restore biodiversity. Individual choices, corporate responsibility, and government policy all contribute to building a sustainable future.",
        duration: "25 min",
        difficulty: "Advanced",
        order: 5,
      },
    ],
    quizzes: [
      {
        type: "multiple_choice",
        text: "Which is the largest ocean on Earth?",
        options: ["Atlantic Ocean", "Indian Ocean", "Pacific Ocean", "Arctic Ocean"],
        correctAnswerIndex: 2,
        explanation: "The Pacific Ocean is the largest, covering about 165 million km² — larger than all the world's landmasses combined.",
        difficulty: "Easy",
      },
      {
        type: "multiple_choice",
        text: "What percentage of Earth's surface is covered by water?",
        options: ["51%", "61%", "71%", "81%"],
        correctAnswerIndex: 2,
        explanation: "About 71% of Earth's surface is covered by water, mostly in the world's oceans.",
        difficulty: "Easy",
      },
      {
        type: "true_false",
        text: "Antarctica contains approximately 70% of Earth's fresh water.",
        options: ["True", "False"],
        correctAnswerIndex: 0,
        explanation: "Antarctica's ice sheet contains about 70% of Earth's fresh water, mostly locked in glacial ice.",
        difficulty: "Medium",
      },
      {
        type: "multiple_choice",
        text: "What percentage of the world's population is projected to live in cities by 2050?",
        options: ["45%", "56%", "68%", "80%"],
        correctAnswerIndex: 2,
        explanation: "UN projections estimate 68% of humanity will live in urban areas by 2050, up from 56% today.",
        difficulty: "Hard",
      },
      {
        type: "multiple_choice",
        text: "Atmospheric CO₂ concentration has risen from 280 ppm (pre-industrial) to approximately:",
        options: ["320 ppm", "360 ppm", "420 ppm", "500 ppm"],
        correctAnswerIndex: 2,
        explanation: "Current atmospheric CO₂ is approximately 420 ppm, the highest in 3 million years.",
        difficulty: "Hard",
      },
    ],
  },

  physics: {
    lessons: [
      {
        title: "Motion and Kinematics",
        description: "Describing how and why objects move",
        content:
          "Kinematics describes motion mathematically. Position tells us where an object is. Displacement is the change in position — a vector (has direction). Velocity = displacement ÷ time (also a vector). Speed = distance ÷ time (a scalar, no direction). An object moving at constant velocity has zero acceleration.\n\nAcceleration is the rate of change of velocity (a = Δv/Δt). Near Earth's surface, gravity accelerates falling objects at g = 9.8 m/s² downward. Key kinematic equations for uniform (constant) acceleration: v = u + at; s = ut + ½at²; v² = u² + 2as. Here u is initial velocity, v is final velocity, a is acceleration, t is time, and s is displacement.\n\nProjectile motion combines independent horizontal (constant velocity, no acceleration) and vertical (downward acceleration g) components. The path is a parabola. A launch angle of 45° maximizes horizontal range for a given initial speed. This explains why skilled footballers and shot-putters optimize their throw angles — mathematics governs athletic performance.",
        duration: "20 min",
        difficulty: "Intermediate",
        order: 1,
      },
      {
        title: "Forces and Newton's Laws",
        description: "The cause of motion and Newton's three laws",
        content:
          "A force is a push or pull that can change an object's velocity (cause acceleration). Forces are vectors. The net force is the vector sum of all forces acting on an object. Newton's three laws of motion, published in 1687, govern all everyday mechanics.\n\nFirst Law (Inertia): An object remains at rest or moving in a straight line at constant speed unless acted on by a net external force. This is why passengers lurch forward when a bus brakes. Second Law: F = ma. Net force equals mass times acceleration. Double the force → double the acceleration. Double the mass → half the acceleration. This law lets engineers calculate forces needed for any design.\n\nThird Law: Every action has an equal and opposite reaction. When you push a wall, the wall pushes back equally on you. A rocket's exhaust pushes backward on hot gas — the gas pushes forward on the rocket. This is how rockets work in the vacuum of space where there's nothing to push against. Free body diagrams (showing all forces as arrows on an object) are essential tools for applying these laws.",
        duration: "25 min",
        difficulty: "Intermediate",
        order: 2,
      },
      {
        title: "Energy, Work, and Power",
        description: "The currency of physics",
        content:
          "Energy is the capacity to do work. Work = force × displacement × cos(θ), measured in joules (J). When a force is applied in the same direction as motion, positive work is done and energy is added to the system. When force opposes motion (friction), negative work removes energy. No work is done if force is perpendicular to displacement (gravity does no work on a satellite in circular orbit).\n\nKinetic energy (KE = ½mv²) is energy of motion. Doubling speed quadruples kinetic energy — this is why car crash severity increases sharply with speed. Gravitational potential energy (PE = mgh) depends on mass, gravity, and height above a reference point. Energy conservation: in a closed system, total energy is constant. A roller coaster converts PE at the top to KE at the bottom and back — energy swaps form but never disappears.\n\nPower (P = W/t) measures how quickly work is done, in watts (W = J/s). A 100 W light bulb uses 100 joules per second. Efficiency = (useful output ÷ total input) × 100%. Car engines are roughly 25–40% efficient; the rest is waste heat. Electric motors are 85–95% efficient, which is why electric vehicles are more energy-efficient than combustion engines.",
        duration: "20 min",
        difficulty: "Intermediate",
        order: 3,
      },
      {
        title: "Waves and Optics",
        description: "How energy propagates through space",
        content:
          "Waves transfer energy without permanently displacing matter. Transverse waves oscillate perpendicular to the direction of travel (light waves, water waves, seismic S-waves). Longitudinal waves oscillate parallel to travel (sound, seismic P-waves). Wave properties: wavelength (λ, distance between peaks), frequency (f, cycles per second, in hertz Hz), amplitude (height of wave), and wave speed v = fλ.\n\nSound is a longitudinal pressure wave requiring a medium. It travels at 343 m/s in air at 20°C, ~1500 m/s in water, ~5000 m/s in steel. Frequency determines pitch; amplitude determines loudness. The Doppler effect explains why a passing ambulance changes pitch: waves compress ahead of a moving source (higher frequency, higher pitch) and spread behind (lower frequency, lower pitch).\n\nLight is an electromagnetic wave traveling at 3 × 10⁸ m/s in vacuum. The electromagnetic spectrum from low to high frequency: radio waves, microwaves, infrared, visible light, ultraviolet, X-rays, gamma rays. Visible light (400–700 nm wavelength) is a tiny slice of this spectrum. Lenses refract (bend) light; mirrors reflect it. Optical instruments from eyeglasses to telescopes use these principles to manipulate light.",
        duration: "20 min",
        difficulty: "Intermediate",
        order: 4,
      },
      {
        title: "Electricity and Magnetism",
        description: "The physics powering modern life",
        content:
          "Electric charge exists in two types: positive (protons) and negative (electrons). Like charges repel; opposite charges attract. Coulomb's law: the electric force is proportional to the product of charges and inversely proportional to the square of distance. Electric fields point from positive to negative; a charge in a field experiences a force.\n\nVoltage (V, in volts) is electric potential difference — it drives current flow. Current (I, in amperes) is charge flow rate. Resistance (R, in ohms Ω) opposes flow. Ohm's Law: V = IR. In series circuits, current is constant; voltage divides across components. In parallel circuits, voltage is constant; current divides. Power P = VI = I²R. Your electricity bill measures kilowatt-hours (kWh): kilowatts × hours of use.\n\nMoving charges create magnetic fields — this is electromagnetism's deep unity, discovered by Faraday and Maxwell. Faraday's Law of Induction: a changing magnetic field induces a current in a conductor. This principle powers electrical generators (mechanical energy → electrical), electric motors (electrical → mechanical), and transformers (changing voltage). All modern power grids, electric vehicles, and countless devices exploit this electromagnetic induction.",
        duration: "25 min",
        difficulty: "Advanced",
        order: 5,
      },
    ],
    quizzes: [
      {
        type: "multiple_choice",
        text: "An object dropped from rest falls for 4 seconds. What is its speed? (g = 10 m/s²)",
        options: ["10 m/s", "20 m/s", "40 m/s", "80 m/s"],
        correctAnswerIndex: 2,
        explanation: "v = u + at = 0 + 10 × 4 = 40 m/s. The object accelerates at g = 10 m/s² downward.",
        difficulty: "Medium",
      },
      {
        type: "multiple_choice",
        text: "According to Newton's Second Law, if mass doubles and force stays constant, acceleration:",
        options: ["Doubles", "Quadruples", "Halves", "Stays the same"],
        correctAnswerIndex: 2,
        explanation: "a = F/m. If F is constant and m doubles, a = F/2m, so acceleration halves.",
        difficulty: "Medium",
      },
      {
        type: "true_false",
        text: "Sound can travel through a vacuum (empty space).",
        options: ["True", "False"],
        correctAnswerIndex: 1,
        explanation: "Sound requires a medium (air, water, solid) to travel. In a vacuum there are no particles to vibrate.",
        difficulty: "Easy",
      },
      {
        type: "multiple_choice",
        text: "A circuit has voltage 24V and resistance 8Ω. What is the current? (V = IR)",
        options: ["3A", "32A", "0.33A", "192A"],
        correctAnswerIndex: 0,
        explanation: "I = V/R = 24/8 = 3 amperes.",
        difficulty: "Medium",
      },
      {
        type: "multiple_choice",
        text: "A 3 kg object moves at 4 m/s. What is its kinetic energy?",
        options: ["12 J", "24 J", "36 J", "48 J"],
        correctAnswerIndex: 1,
        explanation: "KE = ½mv² = ½ × 3 × 4² = ½ × 3 × 16 = 24 joules.",
        difficulty: "Hard",
      },
    ],
  },
};

// ── Main service class ────────────────────────────────────────────────────────

const CONTENT_CACHE_KEY = "ai_subject_content_v3";
const CACHE_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export class AIContentService {
  /**
   * Get subject content — tries AI first, falls back to rich static content.
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

    // Try Claude API, fall back gracefully
    try {
      const aiContent = await this.callClaudeAPI(subjectId, subjectTitle);
      if (aiContent) {
        await this.writeCache(subjectId, aiContent);
        return aiContent;
      }
    } catch (e) {
      console.log("[AIContentService] AI generation failed, using static fallback:", e);
    }

    const fallback = this.buildStaticContent(subjectId, subjectTitle);
    await this.writeCache(subjectId, fallback);
    return fallback;
  }

  // ── Claude API call ────────────────────────────────────────────────────────

  private static async callClaudeAPI(
    subjectId: string,
    subjectTitle: string,
  ): Promise<AISubjectContent | null> {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [
          {
            role: "user",
            content: `Create 3 lessons and 4 quiz questions for ${subjectTitle} for a mobile learning app. Return ONLY valid JSON, no markdown, no explanation:
{"lessons":[{"id":"l1","title":"string","description":"string","content":"3 paragraphs about ${subjectTitle}","duration":"15 min","difficulty":"Beginner","order":1},{"id":"l2","title":"string","description":"string","content":"3 paragraphs about ${subjectTitle}","duration":"20 min","difficulty":"Intermediate","order":2},{"id":"l3","title":"string","description":"string","content":"3 paragraphs about ${subjectTitle}","duration":"25 min","difficulty":"Advanced","order":3}],"quizzes":[{"id":"q1","type":"multiple_choice","text":"question about ${subjectTitle}?","options":["A","B","C","D"],"correctAnswerIndex":0,"explanation":"why A","difficulty":"Easy"},{"id":"q2","type":"multiple_choice","text":"question?","options":["A","B","C","D"],"correctAnswerIndex":1,"explanation":"why B","difficulty":"Medium"},{"id":"q3","type":"true_false","text":"statement about ${subjectTitle}","options":["True","False"],"correctAnswerIndex":0,"explanation":"why true","difficulty":"Easy"},{"id":"q4","type":"multiple_choice","text":"harder question?","options":["A","B","C","D"],"correctAnswerIndex":2,"explanation":"why C","difficulty":"Hard"}]}`,
          },
        ],
      }),
    });

    if (!res.ok) return null;
    const data = await res.json();
    const text = data.content?.[0]?.text;
    if (!text) return null;

    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    return {
      subjectId,
      subjectTitle,
      lessons: (parsed.lessons || []) as AILesson[],
      quizzes: (parsed.quizzes || []) as AIQuizQuestion[],
      generatedAt: new Date().toISOString(),
    };
  }

  // ── Static fallback ────────────────────────────────────────────────────────

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

  // ── AsyncStorage cache ─────────────────────────────────────────────────────

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