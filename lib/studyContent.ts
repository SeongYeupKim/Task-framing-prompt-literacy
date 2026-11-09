/**
 * CARE instruction (identical for `instruction` and `instruction_se`)
 * and the four self-explanation prompts (`instruction_se` only).
 * Practice materials use feedback, so they do not overlap the exercise essay.
 */

export type CareLetter = "C" | "A" | "R" | "E";

export type CareDimension = {
  letter: CareLetter;
  title: string;
  definition: string;
  weak: string;
  stronger: string;
  /** AI reply the student has already seen. Set for R and E. */
  priorAi?: string;
  note?: string;
};

export const CARE_INSTRUCTION = {
  title: "How to prompt and interact with AI",
  definition:
    "Prompting literacy is how you formulate a request, direct what the AI should do with it, and adapt your next message after the AI answers.",
  why:
    "It matters because a high-quality answer depends on both parts. If the AI does not know your purpose, or a later message does not respond to what it just said, the answer stays generic and hard to use.",
  guide:
    "Four dimensions support high-quality prompting. Unfold a dimension and its explanation stays on the right until you fold it, so you can look across them. Contextualization and articulation shape the request you send. Responsive interaction and evaluative refinement are what you do after you see the AI’s response.",
  dimensions: [
    {
      letter: "C",
      title: "Contextualization",
      definition:
        "The extent to which you provide task-relevant contextual information that enables GenAI to understand the purpose, background, and circumstances of your request.",
      weak: "Tell me about feedback.",
      stronger:
        "I’m writing a short explanation for first-year students. The goal is to show how feedback helps learning, especially what a student does on the next draft.",
    },
    {
      letter: "A",
      title: "Articulation",
      definition:
        "The extent to which you formulate a clear, specific, and actionable request that communicates what you expect GenAI to do or produce.",
      weak: "Write something good.",
      stronger:
        "Explain how feedback changes what a student does on the next draft. Use plain language, about 200 words, one paragraph, and one classroom example.",
    },
    {
      letter: "R",
      title: "Responsive interaction",
      definition:
        "The extent to which you purposefully develop and sustain the interaction through follow-up prompts that build on the preceding exchange to extend, clarify, or explore task-relevant information.",
      priorAi:
        "Feedback tells you what you did well and what to change. It can point out a mistake, suggest a next step, or show an example of a stronger answer.",
      weak: "Say more.",
      stronger:
        "That explains what feedback is. Build on it: how does that information change what a student actually does when they revise a draft?",
    },
    {
      letter: "E",
      title: "Evaluative refinement",
      definition:
        "The extent to which you recognize and explicitly address limitations or mismatches in a previous AI response, or in your own prompt, by modifying the next instruction so it better achieves your goal.",
      priorAi:
        "Feedback is specific, timely, and focused on the task rather than the person. Researchers distinguish feedback about the task, the process, and self-regulation.",
      weak: "Make it better.",
      stronger:
        "I asked how feedback changes the next draft, for first-year students, in one short paragraph with one classroom example. Your reply never mentions a draft. Redo it that way.",
      note:
        "Responsive interaction builds on an answer you can already use. Evaluative refinement changes the next instruction because the answer missed the request. Checking whether a fact is true is not part of this lesson.",
    },
  ] satisfies CareDimension[],
} as const;

/** Collapsible reminder during the main chat and essay. Same ideas as the reading. */
export const INSTRUCTION_RECAP_BULLETS: string[] = [
  "C — Contextualization: give the purpose, background, and circumstances of the request.",
  "A — Articulation: make the request clear, specific, and actionable.",
  "R — Responsive interaction: after an answer, follow up to extend, clarify, or explore it.",
  "E — Evaluative refinement: if an answer misses the request, change the next instruction.",
];

export const CARE_MIN_CHARS = {
  definition: 80,
  distinction: 80,
  judgment: 80,
  advice: 50,
} as const;

/** Which follow-up is shown as Message 1. Stored with the answer. */
export type CareDistinctionOrder = "extend_first" | "repair_first";

export const CARE_DISTINCTION = {
  prompt:
    "Read this AI answer and the two messages a student might send next. In your own words, what is each message doing? Why does one develop the exchange while the other changes the request?",
  aiAnswer:
    "Feedback is information about your work. Teachers, classmates, or a computer can tell you what you did well and what to change. Feedback can point out a mistake, suggest a next step, or show an example of a stronger answer.",
  extend:
    "How does that information change what a student actually does when they revise?",
  repair:
    "I needed this for first-year students, in one short paragraph, with one classroom example of revising a draft. Please redo it that way.",
} as const;

export const CARE_CASE = {
  assignment:
    "Write a short explanation for first-year students about how feedback helps learning. About 200 words, one paragraph, include one concrete classroom example, and connect the example to why feedback changes what a student does next.",
  turns: [
    { role: "student" as const, content: "Tell me about feedback." },
    {
      role: "ai" as const,
      content:
        "Feedback is information about performance. It can come from teachers, peers, or automated systems. Effective feedback is specific, timely, and focused on the task rather than the person. Researchers often distinguish feedback about the task, the process, and self-regulation.",
    },
    { role: "student" as const, content: "Can you say more?" },
    {
      role: "ai" as const,
      content:
        "Feedback supports learning when it helps students see a gap between their current work and a goal. Types include corrective feedback, suggestive feedback, and evaluative feedback. The timing of feedback and who gives it both matter.",
    },
    { role: "student" as const, content: "Make it better." },
  ],
};

export const CARE_QUESTIONS = {
  definition:
    "In your own words, what does a student have to do to prompt and interact well? Include both how the first request is built and what the student does after the AI answers.",
  articulation:
    "Articulation is one of the four moves. In your own words, what does articulation require in the request itself? Name what a student has to make specific.",
  judgment:
    "What does the opening leave out? What do the later messages fail to do?",
  advice:
    "Tell this student how to improve the interaction. Rewrite the opening so the task, goal, and background are there and the request is specific. Then write the single next message they should send now, and say what that message is trying to change.",
} as const;

/**
 * Exercise / learning scenario and task constraints — main GenAI + essay task (all conditions).
 * Requirements are plain sentences only (no rubric labels like “Accuracy:”) so students read criteria, not jargon.
 */
export const EXERCISE_LEARNING_SCENARIO_PARAGRAPHS: string[] = [
  "You are preparing for a science class assignment where you are asked to write an explanatory essay on a topic related to human learning and performance. Your instructor has assigned the following topic: “How Does Physical Exercise Influence Learning and Academic Performance?”",
  "You are expected to write a short explanatory essay that demonstrates your understanding of how exercise affects the brain, behavior, and learning outcomes. You may already have some prior knowledge from class, but you are encouraged to use the AI chatbot below as a tool to help you develop and refine your explanation.",
];

export const EXERCISE_LEARNING_TASK_REQUIREMENTS: string[] = [
  "Clearly explain how and why exercise influences learning and academic performance.",
  "Write for a general student audience—avoid overly technical language; do not oversimplify key ideas.",
  "Include at least two concrete examples that illustrate how exercise affects learning in real situations.",
  "Write approximately 250–300 words.",
  "Present the explanation as a clear, well-organized essay (not a list of points).",
];

/** Main chat + essay task (exercise). CARE practice uses feedback, not this topic. */
export const GENAI_TASK = {
  title: "How Does Physical Exercise Influence Learning and Academic Performance?",
  scenarioParagraphs: EXERCISE_LEARNING_SCENARIO_PARAGRAPHS,
  taskConditions: EXERCISE_LEARNING_TASK_REQUIREMENTS,
};
