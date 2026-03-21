/** Training — plain language, no markdown asterisks in source. */

export type TrainingSection = {
  title: string;
  paragraphs: string[];
  bullets?: string[];
  numbered?: { title: string; detail: string }[];
  note?: string;
};

export const TRAINING_SECTIONS: TrainingSection[] = [
  {
    title: "What is task framing?",
    paragraphs: [
      "When you use AI for school work, it’s easy to focus only on the exact words you type. But helpful AI use starts earlier: you need a clear picture of what the assignment is asking.",
      "We call that thinking task framing.",
      "Task framing means being clear about a few things:",
    ],
    bullets: [
      "What you want the AI to help you with",
      "What kind of answer you’re aiming for",
      "What would count as a good answer for your class",
    ],
    note: "If the task is fuzzy in your mind, the AI’s answer often feels vague or off-topic. If the task is clear, you usually get answers that are easier to use.",
  },
  {
    title: "What goes into a clear task?",
    paragraphs: ["Strong prompts usually make these pieces easy to see:"],
    numbered: [
      { title: "Goal", detail: "What are you trying to accomplish?" },
      { title: "Content", detail: "What topics or ideas must be included?" },
      { title: "Limits", detail: "Length, level, format, or other constraints?" },
      { title: "Audience", detail: "Who is the answer for?" },
      { title: "Format", detail: "Paragraph, list, essay, etc.?" },
      { title: "Success", detail: "How will you judge if the answer is good enough?" },
    ],
    note: "You don’t need fancy wording. You do need enough detail that the AI knows what “done” looks like.",
  },
  {
    title: "What happens next in this session?",
    paragraphs: [
      "Depending on how your session is set up, you may rate example prompts from other students and explain why they are stronger or weaker.",
      "Later you will chat with the AI on a new topic and then write your own response. Your chat and your writing are saved only for this research study.",
    ],
  },
];

export const EVAL1_SCENARIO = {
  title: "How sleep affects learning",
  scenario:
    'Three students are writing a short piece called “How Sleep Affects Learning” for a school website (section: “Study Smart: Understanding How Learning Works”). Readers are 9th-grade students with mixed reading levels. The students can use the AI and two readings: one on sleep and the brain, one on sleep and everyday school life.',
  taskConditions: [
    "Use evidence; avoid made-up facts.",
    "Connect brain ideas (e.g. memory, attention) to real school outcomes.",
    "Help readers see why sleep matters for learning—not only random facts.",
    "Write so mixed reading levels can follow; don’t hide important ideas behind jargon.",
    "Include at least two concrete school-related examples.",
    "About 250–300 words, one connected paragraph (not a bullet list).",
  ],
  cases: {
    studentA: {
      label: "Student A",
      sublabel: "Moderate clarity",
      prompts: [
        "Explain how sleep affects learning, including brain processes like memory and attention and how it impacts school performance.",
        "Write it for students so it's clear and not too technical.",
        "Include two examples from school situations.",
        "Keep it around 250–300 words in one paragraph.",
        "Can you make the connection between sleep and performance a bit clearer?",
      ],
    },
    studentB: {
      label: "Student B",
      sublabel: "Strong clarity",
      prompts: [
        "Using these two texts, explain how sleep affects learning for students with different reading levels.",
        "Focus on how sleep supports brain processes like memory and attention and how those lead to outcomes like focus and grades.",
        "Make sure the explanation shows how these ideas are connected, not just listed.",
        "Write it as a clear paragraph (about 250–300 words) using language that is easy to understand but still accurate.",
        "Include two examples from school situations that help explain why sleep matters for students' learning.",
      ],
    },
    studentC: {
      label: "Student C",
      sublabel: "Weaker clarity",
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
  title: "Phones while studying",
  scenario:
    'Students are writing for a guide called “Smart Study Habits.” Topic: “Should you use smartphones while studying?” The audience is 9th-grade students with mixed reading levels at an orientation. They have one reading on downsides of phones and one on possible benefits.',
  taskConditions: [
    "Use evidence; avoid made-up claims.",
    "Include both benefits and drawbacks.",
    "Explain when phones might help or hurt—not only “phones are bad” or “phones are good.”",
    "Help readers make better choices about their own habits.",
    "Clear and engaging; not overly technical.",
    "At least two concrete examples of phones helping or hurting studying.",
    "About 250–300 words, one connected paragraph.",
  ],
  cases: {
    studentA: {
      label: "Student A",
      sublabel: "Strong clarity",
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
      label: "Student B",
      sublabel: "Weaker clarity",
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
      label: "Student C",
      sublabel: "Strong clarity",
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
  title: "Exercise, learning, and school performance",
  scenario:
    "You have a science assignment: a short explanatory essay on how physical exercise relates to learning and academic performance. You may use the AI to help you think it through, but your final essay should reflect your own understanding.",
  taskConditions: [
    "Use ideas that fit what science generally says about exercise, the brain, and learning.",
    "Connect body/brain processes with habits and behavior (not only one or the other).",
    "Explain how and why exercise might affect learning (not only that it does).",
    "Mention how type, intensity, or timing of exercise might matter.",
    "Help a student reader use the ideas for their own learning.",
    "Write for a general student audience; clear but not dumbed down.",
    "At least two real-life examples.",
    "About 300 words.",
    "Write as a short essay, not a bullet list.",
  ],
};
