/** Training instruction (task framing) — editable copy. */
export const TRAINING_SECTIONS = [
  {
    title: "What is task framing and why does it matter?",
    body: `When using AI for academic tasks, many people focus on writing better prompts. However, effective use of AI begins before writing the prompt. It depends on how clearly you understand and define the task.

We call this process **task framing**.

Task framing means clearly thinking about:
- what you want the AI to do
- what kind of answer you expect
- what counts as a good response

If the task is not clearly framed, AI responses are often vague, unfocused, or not aligned with your goal. If the task is well framed, AI responses are more relevant, structured, and useful.`,
  },
  {
    title: "What is good task framing? (Key dimensions)",
    body: `A well-framed task usually includes:

1. **Goal** — What are you trying to do?
2. **Content scope** — What should be included?
3. **Context & constraints** — Under what conditions? (length, level, etc.)
4. **Audience** — For whom is the response?
5. **Output format** — What should the answer look like?
6. **Evaluation criteria** — What makes a good answer?

Weak prompts often miss several of these. Strong prompts coordinate them so the AI can help you meet your learning goal.`,
  },
  {
    title: "What will you do next?",
    body: `Depending on your assigned session, you may be asked to **evaluate example student prompts** for a learning task. Focus on how well each prompt defines the task using the elements above.

Later, you will **interact with ChatGPT** on a new explanation task and submit your own written response. Your prompts, AI replies, and final essay will be recorded for research purposes only.`,
  },
] as const;

export const EVAL1_SCENARIO = {
  title: "How Sleep Affects Learning",
  scenario: `Three students are developing a short explanation titled **"How Sleep Affects Learning"** for a school website section "Study Smart: Understanding How Learning Works." The audience is **9th-grade students with mixed reading abilities**. They may use ChatGPT and two source texts (Text A: sleep and the brain; Text B: sleep and everyday school performance).`,
  taskConditions: [
    "Avoid misinformation; base the explanation on evidence.",
    "Conceptual connection: link brain processes (e.g., memory, attention) to real-life learning outcomes.",
    "Purpose alignment: help students see why sleep matters for their learning.",
    "Audience: accessible for mixed reading levels—avoid overly technical language without oversimplifying.",
    "Include at least two concrete school-related examples.",
    "Length: approximately 250–300 words; one coherent paragraph.",
  ],
  cases: {
    studentA: {
      label: "Student A (medium task framing)",
      prompts: [
        "Explain how sleep affects learning, including brain processes like memory and attention and how it impacts school performance.",
        "Write it for students so it's clear and not too technical.",
        "Include two examples from school situations.",
        "Keep it around 250–300 words in one paragraph.",
        "Can you make the connection between sleep and performance a bit clearer?",
      ],
    },
    studentB: {
      label: "Student B (high task framing)",
      prompts: [
        "Using these two texts, explain how sleep affects learning for students with different reading levels.",
        "Focus on how sleep supports brain processes like memory and attention and how those lead to outcomes like focus and grades.",
        "Make sure the explanation shows how these ideas are connected, not just listed.",
        "Write it as a clear paragraph (about 250–300 words) using language that is easy to understand but still accurate.",
        "Include two examples from school situations that help explain why sleep matters for students' learning.",
      ],
    },
    studentC: {
      label: "Student C (low task framing)",
      prompts: [
        "Explain how sleep affects learning outcomes for students.",
        "Can you include something about how the brain works during sleep?",
        "Also add how it affects school performance like grades and focus.",
        "Your explanation is too hard. Make it easier to understand.",
        "Can you give two examples for this?",
      ],
    },
  },
};

export const EVAL2_SCENARIO = {
  title: "Should You Use Smartphones While Studying?",
  scenario: `Students are preparing a short explanation for a community center guide **"Smart Study Habits."** Topic: **"Should You Use Smartphones While Studying?"** Audience: **9th-grade students with mixed reading abilities** during orientation. They have Text A (costs/distraction) and Text B (potential benefits).`,
  taskConditions: [
    "Avoid misinformation; use evidence.",
    "Conceptual balance: benefits and drawbacks.",
    "Conditional reasoning: when phones help vs harm learning—not one-sided.",
    "Purpose alignment: help students make better decisions about study habits.",
    "Audience: clear and engaging; avoid overly technical language without oversimplifying.",
    "At least two concrete examples of help and interference.",
    "Length: approximately 250–300 words; one coherent paragraph.",
  ],
  cases: {
    studentA: {
      label: "Student A (high task framing)",
      prompts: [
        "Using the two texts, explain the effectiveness of smartphones in studying.",
        "Can you explain both negative effects (e.g., distraction, reduced attention) and positive uses (e.g., learning tools, organization)?",
        "Focus on explaining under what conditions smartphones help or harm learning, rather than simply saying they are good or bad.",
        "Write the explanation to help students make better decisions about their own study habits.",
        "Present it as one clear paragraph (about 250–300 words) using accessible language without oversimplifying key ideas.",
        "Include two concrete examples that show how smartphone use can both support and interfere with studying.",
      ],
    },
    studentB: {
      label: "Student B (low task framing)",
      prompts: [
        "Explain whether smartphones are positive or negative for studying.",
        "Can you include something about distractions and multitasking?",
        "Also add how smartphones can help with studying.",
        "Make it easier for students to understand.",
        "Include two examples.",
        "Keep it about 250–300 words.",
      ],
    },
    studentC: {
      label: "Student C (high task framing)",
      prompts: [
        "Explain how smartphones affect studying, including both negative effects like distraction and positive uses like helping with learning tools.",
        "Write it clearly for students and avoid difficult terms.",
        "Include two examples of how smartphones can help or hurt studying.",
        "Keep it in one paragraph with about 250–300 words.",
        "Can you explain more clearly when smartphones are helpful or harmful?",
      ],
    },
  },
};

export const GENAI_TASK = {
  title: "How Does Physical Exercise Influence Learning and Academic Performance?",
  scenario: `You are preparing for a science class assignment: a short **explanatory essay** on human learning and performance. You may use ChatGPT to develop and refine your explanation.`,
  taskConditions: [
    "Accuracy: scientifically valid ideas about exercise, brain, and learning.",
    "Conceptual integration: physiological processes and behavioral effects, and how they relate.",
    "Causal reasoning: how and why exercise influences learning and performance.",
    "Conditional understanding: e.g., type, intensity, or timing of exercise.",
    "Purpose alignment: help the reader use exercise to support their own learning.",
    "Audience: general students—clear but not oversimplified.",
    "At least two concrete real-life examples.",
    "Length: approximately 300 words.",
    "Organization: clear essay, not a bullet list.",
  ],
};
