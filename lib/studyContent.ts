/** Training text chunks: plain string, or { b: "bold" } */
export type TextChunk = string | { b: string };

export type TrainingSection = {
  title: string;
  /** Each item is a paragraph: plain string, or array of chunks for mixed bold */
  paragraphs: (string | TextChunk[])[];
  bullets?: string[];
  numbered?: { title: string; detail: string }[];
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
      "Strong prompts usually make these pieces easy to see. Provide one example per domain below (you can use your own subject or the examples in your head).",
    ],
    numbered: [
      { title: "Goal", detail: "What are you trying to accomplish?" },
      { title: "Content", detail: "What topics or ideas must be included?" },
      {
        title: "Task conditions",
        detail:
          "Length, level, format, or other limits (what has to be true about the answer?)",
      },
      { title: "Audience", detail: "Who is the answer for?" },
      { title: "Format", detail: "Paragraph, list, essay, etc.?" },
      { title: "Success", detail: "How will you judge if the answer is good enough?" },
    ],
    note: "You don’t need fancy wording. You do need enough detail that the AI knows what “done” looks like.",
  },
];

/** Part 3 depends on whether the participant will see evaluation activities. */
export function getTrainingClosingParagraphs(isControl: boolean): (string | TextChunk[])[] {
  if (isControl) {
    return [
      "In your session, you will go straight from this introduction to a new explanation task where you chat with the AI and then write your own response.",
      "You will not be asked to rate other students’ prompts. Focus on using what you read here when you plan your own messages to the AI.",
      "Your chat and your writing are saved only for this research study.",
    ];
  }
  return [
    [
      "Depending on your session, you may be asked to ",
      { b: "evaluate example prompts" },
      " from other students and explain why they are stronger or weaker.",
    ],
    "Later you will chat with the AI on a new topic and then write your own response. Your chat and your writing are saved only for this research study.",
  ];
}

/** Sleep task — task conditions match study materials. */
export const EVAL1_SCENARIO = {
  title: "How Sleep Affects Learning",
  scenario:
    "Three students are working as student assistants to help their school develop content for an online learning support website. The school is creating a section called “Study Smart: Understanding How Learning Works,” which aims to help students improve their academic performance by understanding how their bodies and minds influence learning. As part of this project, the students have been asked to develop a short explanation titled: “How Sleep Affects Learning.” This explanation will be published on the school website and will be read by 9th-grade students with mixed reading abilities. Some students are strong readers, while others may struggle with complex or technical explanations. Therefore, the explanation must be accessible and easy to understand, while still being accurate, meaningful, and informative. To complete this task, the students are provided with ChatGPT and two source texts: Text A focuses on the scientific explanation of sleep, including how sleep supports brain functions such as memory consolidation, attention, and information processing. It includes some technical ideas about how the brain works during sleep. Text B focuses on practical learning outcomes, explaining how sleep affects students’ daily academic experiences, such as concentration in class, completing assignments, and overall academic performance.",
  taskConditions: [
    "Avoid misinformation: Make sure the explanation is based on the evidence.",
    "Conceptual connection: Clearly explain how brain processes (e.g., memory, attention) are connected to real-life learning outcomes (e.g., focus, grades).",
    "Purpose alignment: Help students understand why sleep matters for their own learning, not just present factual information.",
    "Audience awareness: Write for 9th-grade students with mixed reading levels — avoid overly technical language; do not oversimplify important ideas.",
    "Use of example: Include at least two concrete examples that illustrate how sleep affects learning in a real-life situation.",
    "Length constraint: Approximately 250–300 words.",
    "Organization: Present the explanation as a clear, coherent paragraph rather than a list of disconnected points.",
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
        "Using these two texts, explain how sleep affects learning for students with different reading levels.",
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
  scenario:
    "Three students are working as youth advisors for a local community center that runs after-school study programs. The center is preparing a short guide for students called “Smart Study Habits,” which will be shared during orientation sessions to help students improve how they study. As part of this guide, the students have been asked to develop a short explanation titled: “Should You Use Smartphones While Studying?” This explanation will be presented to 9th-grade students with mixed reading abilities during an orientation session. Some students are confident readers, while others may find complex or abstract explanations difficult to follow. Therefore, the explanation needs to be clear, engaging, and easy to understand, while still being accurate and thoughtful. To complete this task, the students are provided with ChatGPT and two source texts: Text A explains how smartphones can negatively affect learning, focusing on distraction, multitasking, and reduced attention. It also includes some cognitive explanations about how attention and working memory are disrupted. Text B explains how smartphones can support learning when used effectively, such as accessing educational resources, organizing tasks, and supporting self-regulated learning.",
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
  scenario:
    "You are preparing for a science class assignment where you are asked to write an explanatory essay on a topic related to human learning and performance. Your instructor has assigned the following topic: “How Does Physical Exercise Influence Learning and Academic Performance?” You are expected to write a short explanatory essay that demonstrates your understanding of how exercise affects the brain, behavior, and learning outcomes. You may already have some prior knowledge from class, but you are encouraged to use ChatGPT as a tool to help you develop and refine your explanation.",
  taskConditions: [
    "Accuracy: The explanation should reflect scientifically valid ideas about how exercise affects the brain and learning.",
    "Conceptual integration: Explain both physiological processes (e.g., brain function, attention, memory) and behavioral effects (e.g., motivation, focus), and how they are related.",
    "Causal reasoning: Clearly explain how and why exercise influences learning and academic performance.",
    "Conditional understanding: Address how different factors (e.g., type, intensity, or timing of exercise) may influence its effects.",
    "Purpose alignment: Help the reader understand how exercise can be used to support their own learning.",
    "Audience awareness: Write for a general student audience — avoid overly technical language; do not oversimplify key ideas.",
    "Use of examples: Include at least two concrete examples to illustrate how exercise affects learning in real situations.",
    "Length requirement: Approximately 300 words.",
    "Organization: Present the explanation as a clear, well-organized essay (not a list of points).",
  ],
};
