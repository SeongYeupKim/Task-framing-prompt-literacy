/** Training text chunks: plain string, or { b: "bold" } */
export type TextChunk = string | { b: string };

export type TrainingSection = {
  title: string;
  /** Each item is a paragraph: plain string, or array of chunks for mixed bold */
  paragraphs: (string | TextChunk[])[];
  bullets?: string[];
  /** One illustrative example per domain (goal, content, task conditions, etc.) */
  numbered?: { title: string; detail: string; example: string }[];
  note?: string;
};

export const TRAINING_SECTIONS: TrainingSection[] = [
  {
    title: "What is task framing?",
    paragraphs: [
      "When you use AI for school work, it’s easy to focus only on the exact words you type. But helpful AI use starts earlier: you need a clear picture of what the assignment is asking.",
      ["We call that thinking ", { b: "task framing" }, "."],
      "Task framing means being clear about a few things:",
    ],
    bullets: [
      "What you want the AI to help you with",
      "What kind of answer you’re aiming for",
      "What would count as a good answer for your task",
    ],
    note: "If the task is fuzzy in your mind, the AI’s answer often feels vague or off-topic. If the task is clear, you usually get answers that are easier to use.",
  },
  {
    title: "What goes into a clear task?",
    paragraphs: [
      "Strong prompts usually make these pieces easy to see. Below, each domain has a short question plus one concrete example. The examples are only illustrations—you would swap in your real assignment.",
    ],
    numbered: [
      {
        title: "Goal",
        detail: "What are you trying to accomplish?",
        example:
          "e.g., Explain how exercise might affect focus or memory so a classmate can use the idea when studying for exams.",
      },
      {
        title: "Content",
        detail: "What topics or ideas must be included?",
        example:
          "e.g., Must connect something about the brain (e.g., consolidation) to something about school behavior (e.g., paying attention in class).",
      },
      {
        title: "Task requirements",
        detail:
          "Length, level, format, or other limits—what has to be true about the answer?",
        example:
          "e.g., About 250–300 words; plain language for 9th graders; include two real-life examples.",
      },
      {
        title: "Audience",
        detail: "Who is the answer for?",
        example:
          "e.g., Other students who have mixed reading levels, not experts in neuroscience.",
      },
      {
        title: "Format",
        detail: "Paragraph, list, essay, etc.?",
        example:
          "e.g., One coherent paragraph, not a bullet list of disconnected facts.",
      },
      {
        title: "Success",
        detail: "How will you judge if the answer is good enough?",
        example:
          "e.g., It uses evidence, links brain ideas to school life, and meets length and example requirements.",
      },
    ],
  },
];

/**
 * Six dimensions: keys stable for Firestore. Left column: two bullets + one concrete example each.
 */
export const INSTRUCTION_DIMENSIONS: {
  key: string;
  title: string;
  detail: string;
  instructionBullets: string[];
  /** Short illustration of that dimension stated clearly (for the instruction column). */
  example: string;
}[] = [
  {
    key: "goal",
    title: "Goal",
    detail: "What are you trying to accomplish?",
    instructionBullets: [
      "It names what you want the AI to help you produce, decide, or plan—not just fancy wording.",
      "A clear goal often names the outcome (e.g., outline, comparison) and what “done” should look like.",
    ],
    example:
      "e.g., Explain how exercise might affect focus or memory so a classmate can use the idea when studying for exams.",
  },
  {
    key: "content",
    title: "Content",
    detail: "What topics or ideas must be included?",
    instructionBullets: [
      "Content is what must show up in the answer: topics, ideas, evidence, or angles that belong in the response.",
      'It answers “what has to be in there?”—the substance, not the layout.',
    ],
    example:
      "e.g., Must connect something about the brain (e.g., consolidation) to something about school behavior (e.g., paying attention in class).",
  },
  {
    key: "task_conditions",
    title: "Task requirements",
    detail:
      "Length, level, format, or other limits—what has to be true about the answer?",
    instructionBullets: [
      "These are the rules the answer must follow: length limits, level, citations, tone, language, or what to avoid.",
      "They describe what the final product must satisfy, not only what it talks about.",
    ],
    example:
      "e.g., About 250–300 words; plain language for 9th graders; include two real-life examples.",
  },
  {
    key: "audience",
    title: "Audience",
    detail: "Who is the answer for?",
    instructionBullets: [
      "Audience is who will read or use the answer—classmates, instructors, novices, or specialists.",
      "It shapes how much jargon you use, how concrete examples need to be, and how ideas get explained.",
    ],
    example:
      "e.g., Other students who have mixed reading levels, not experts in neuroscience.",
  },
  {
    key: "format",
    title: "Format",
    detail: "Paragraph, list, essay, etc.?",
    instructionBullets: [
      "Format is how the answer is organized: one paragraph vs. sections, bullets vs. prose, outline vs. essay.",
      "It should match how you will paste or present the text (slides, paper, study notes).",
    ],
    example:
      "e.g., One coherent paragraph, not a bullet list of disconnected facts.",
  },
  {
    key: "success",
    title: "Success",
    detail: "How will you judge if the answer is good enough?",
    instructionBullets: [
      "Success criteria are the checks you will use: e.g., two examples, both sides named, matches a rubric.",
      "They turn “good enough” into something you can actually verify.",
    ],
    example:
      "e.g., It uses evidence, links brain ideas to school life, and meets length and example requirements.",
  },
];

/**
 * Example prompts for the matching task only (not the same wording as Part 2 examples).
 * Each maps to exactly one dimension key for answer key.
 */
export const INSTRUCTION_MATCHING_POOL: {
  id: string;
  dimensionKey: string;
  prompt: string;
}[] = [
  {
    id: "mx1",
    dimensionKey: "goal",
    prompt:
      "I need a short explanation my teammates can use during lab—tell the model the outcome should help us prep our poster, not write the poster for us.",
  },
  {
    id: "mx2",
    dimensionKey: "content",
    prompt:
      "Be sure to tie executive function to both working memory and inhibition when you answer—don’t focus on only one of those.",
  },
  {
    id: "mx3",
    dimensionKey: "task_conditions",
    prompt:
      "Keep it under 200 words, cite one source in MLA, and don’t use bullet points.",
  },
  {
    id: "mx4",
    dimensionKey: "audience",
    prompt:
      "Assume the reader is a first-year college athlete who hasn’t taken cognitive psychology—skip abbreviations like PFC.",
  },
  {
    id: "mx5",
    dimensionKey: "format",
    prompt:
      "Structure the reply as: (1) definition, (2) why it matters for studying, (3) one limitation—use those exact headings.",
  },
  {
    id: "mx6",
    dimensionKey: "success",
    prompt:
      "I’ll only use the answer if it compares two study strategies and names one trade-off for each.",
  },
];

/** Short bullets for the collapsible recap (intervention conditions only). */
export const INSTRUCTION_RECAP_BULLETS: string[] = [
  "Goal — what you want the AI to help you accomplish.",
  "Content — topics and ideas that must appear in the answer.",
  "Task requirements — length, level, format, and other limits.",
  "Audience — who will read or use the answer.",
  "Format — paragraph, list, essay, etc.",
  "Success — how you’ll tell if the answer is good enough.",
];

/**
 * Exercise / learning scenario and requirements — shared by eval practice (Step 4)
 * and the main GenAI + essay task. Requirements are plain sentences only (no rubric
 * labels like “Accuracy:” or “Conceptual connection”) so students read criteria, not jargon.
 */
export const EXERCISE_LEARNING_SCENARIO_PARAGRAPHS: string[] = [
  "You are preparing for a science class assignment where you are asked to write an explanatory essay on a topic related to human learning and performance. Your instructor has assigned the following topic: “How Does Physical Exercise Influence Learning and Academic Performance?”",
  "You are expected to write a short explanatory essay that demonstrates your understanding of how exercise affects the brain, behavior, and learning outcomes. You may already have some prior knowledge from class, but you are encouraged to use ChatGPT as a tool to help you develop and refine your explanation.",
];

/** Single source for eval practice (Step 4) and the main GenAI essay task — all conditions. */
export const EXERCISE_LEARNING_TASK_REQUIREMENTS: string[] = [
  "Clearly explain how and why exercise influences learning and academic performance.",
  "Help the reader understand how exercise can be used to support their own learning.",
  "Write for a general student audience—avoid overly technical language; do not oversimplify key ideas.",
  "Include at least two concrete examples that illustrate how exercise affects learning in real situations.",
  "Write approximately 250–300 words.",
  "Present the explanation as a clear, well-organized essay (not a list of points).",
];

export const EVAL1_SCENARIO = {
  title: "How Does Physical Exercise Influence Learning and Academic Performance?",
  scenario: EXERCISE_LEARNING_SCENARIO_PARAGRAPHS,
  taskConditions: EXERCISE_LEARNING_TASK_REQUIREMENTS,
  cases: {
    studentA: {
      label: "Student A",
      prompts: [
        "Explain how physical exercise influences learning and academic performance.",
        "Write it for a general student audience so it’s clear and not too technical.",
        "Include two concrete real-life examples.",
        "Keep it around 250–300 words as a well-organized essay (not a bullet list).",
        "Can you make the how-and-why links between exercise and performance a bit clearer?",
      ],
    },
    studentB: {
      label: "Student B",
      prompts: [
        "Explain how exercise affects learning for students with different schedules or activity levels.",
        "Make sure the explanation shows how these ideas connect, not just listed separately.",
        "Write it as a clear essay (about 250–300 words) using language that is easy to understand but still accurate.",
        "Include two examples from school or daily life that help explain why exercise matters for students’ learning.",
        "Can you stress why this matters for students’ own study habits?",
      ],
    },
    studentC: {
      label: "Student C",
      prompts: [
        "Explain how exercise influences learning and school performance.",
        "Can you include something about how exercise might relate to the brain?",
        "Also add how it might show up in behavior—like attention or energy in class.",
        "Your explanation is too hard. Make it easier to understand.",
        "Can you give two examples for this?",
      ],
    },
  },
};

export const EVAL2_SCENARIO = {
  title: "Should You Use Smartphones While Studying?",
  scenario: [
    "Three students are working as youth advisors for a local community center that runs after-school study programs. The center is preparing a short guide for students called “Smart Study Habits,” which will be shared during orientation sessions to help students improve how they study.",
    "As part of this guide, the students have been asked to develop a short explanation titled: “Should You Use Smartphones While Studying?” This explanation will be presented to 9th-grade students with mixed reading abilities during an orientation session. Some students are confident readers, while others may find complex or abstract explanations difficult to follow.",
    "Therefore, the explanation needs to be clear, engaging, and easy to understand, while still being accurate and thoughtful. To complete this task, the students are provided with ChatGPT.",
  ],
  taskConditions: [
    "Avoid misinformation: Ensure the explanation is based on evidence.",
    "Conceptual balance: Present both the benefits and drawbacks of smartphone use for studying.",
    "Conditional reasoning: Clearly explain under what conditions smartphones help or harm learning, rather than presenting a one-sided claim.",
    "Purpose alignment: Help students make better decisions about their own study habits.",
    "Audience awareness: Write for 9th-grade students with mixed reading levels — avoid overly technical language; do not oversimplify important ideas.",
    "Use of example: Include at least two concrete examples showing how smartphone use can help or interfere with studying in real situations.",
    "Length constraint: Approximately 250–300 words.",
    "Organization: Present the explanation as a clear, coherent paragraph.",
  ],
  cases: {
    studentA: {
      label: "Student A",
      prompts: [
        "Explain the effectiveness of smartphones in studying.",
        "Can you explain both negative effects (e.g., distraction, reduced attention) and positive uses (e.g., learning tools, organization)?",
        "Focus on explaining under what conditions smartphones help or harm learning, rather than simply saying they are good or bad.",
        "Write the explanation to help students make better decisions about their own study habits.",
        "Present it as one clear paragraph (about 250–300 words) using accessible language without oversimplifying key ideas.",
        "Include two concrete examples that show how smartphone use can both support and interfere with studying.",
      ],
    },
    studentB: {
      label: "Student B",
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

/** Main chat + essay task — same topic and task requirements as EVAL1 practice. */
export const GENAI_TASK = {
  title: "How Does Physical Exercise Influence Learning and Academic Performance?",
  scenarioParagraphs: EXERCISE_LEARNING_SCENARIO_PARAGRAPHS,
  taskConditions: EXERCISE_LEARNING_TASK_REQUIREMENTS,
};
