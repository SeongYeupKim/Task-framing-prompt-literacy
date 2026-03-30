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
          "e.g., Explain how sleep affects memory so a classmate can use the idea when studying for exams.",
      },
      {
        title: "Content",
        detail: "What topics or ideas must be included?",
        example:
          "e.g., Must connect something about the brain (e.g., consolidation) to something about school behavior (e.g., paying attention in class).",
      },
      {
        title: "Task conditions",
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
      "e.g., Explain how sleep affects memory so a classmate can use the idea when studying for exams.",
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
    title: "Task conditions",
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
  "Task conditions — length, level, format, and other limits.",
  "Audience — who will read or use the answer.",
  "Format — paragraph, list, essay, etc.",
  "Success — how you’ll tell if the answer is good enough.",
];

/** Sleep task — task requirements match study materials (no category labels). */
export const EVAL1_SCENARIO = {
  title: "How Sleep Affects Learning",
  /** Paragraphs for the scenario (no source-text details). */
  scenario: [
    "Three students are working as student assistants to help their school develop content for an online learning support website. The school is creating a section called “Study Smart: Understanding How Learning Works,” which aims to help students improve their academic performance by understanding how their bodies and minds influence learning.",
    "As part of this project, the students have been asked to develop a short explanation titled: “How Sleep Affects Learning.” This explanation will be published on the school website and will be read by 9th-grade students with mixed reading abilities. Some students are strong readers, while others may struggle with complex or technical explanations.",
    "Therefore, the explanation must be accessible and easy to understand, while still being accurate, meaningful, and informative. To complete this task, the students are provided with ChatGPT.",
  ],
  taskConditions: [
    "Make sure the explanation is based on the evidence.",
    "Clearly explain how brain processes (e.g., memory, attention) are connected to real-life learning outcomes (e.g., focus, grades).",
    "Help students understand why sleep matters for their own learning, not just present factual information.",
    "Write for 9th-grade students with mixed reading levels — avoid overly technical language; do not oversimplify important ideas.",
    "Include at least two concrete examples that illustrate how sleep affects learning in a real-life situation.",
    "Approximately 250–300 words.",
    "Present the explanation as a clear, coherent paragraph rather than a list of disconnected points.",
  ],
  cases: {
    studentA: {
      label: "Student A",
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
      prompts: [
        "Explain how sleep affects learning for students with different reading levels.",
        "Focus on how sleep supports brain processes like memory and attention and how those lead to outcomes like focus and grades.",
        "Make sure the explanation shows how these ideas are connected, not just listed.",
        "Write it as a clear paragraph (about 250–300 words) using language that is easy to understand but still accurate.",
        "Include two examples from school situations that help explain why sleep matters for students' learning.",
      ],
    },
    studentC: {
      label: "Student C",
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

export const GENAI_TASK = {
  title: "How Does Physical Exercise Influence Learning and Academic Performance?",
  taskConditions: [
    "Accuracy: The explanation should reflect scientifically valid ideas about how exercise affects the brain and learning.",
    "Conceptual integration: Explain both physiological processes (e.g., brain function, attention, memory) and behavioral effects (e.g., motivation, focus), and how they are related.",
    "Causal reasoning: Clearly explain how and why exercise influences learning and academic performance.",
    "Purpose alignment: Help the reader understand how exercise can be used to support their own learning.",
    "Audience awareness: Write for 12th-grade students.",
    "Use of examples: Include at least two concrete examples to illustrate how exercise affects learning in real situations.",
    "Length requirement: Approximately 300 words.",
    "Organization: Present the explanation as a clear, well-organized essay (not a list of points).",
  ],
};
