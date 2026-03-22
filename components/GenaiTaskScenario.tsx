/** Scenario copy for the GenAI + essay task (indented paragraphs; bold key phrase). */
export function GenaiTaskScenario() {
  return (
    <div className="space-y-3 text-sm leading-relaxed text-student-ink">
      <p className="indent-8">
        You are preparing for a science class assignment where you are asked to
        write an explanatory essay on a topic related to human learning and
        performance. Your instructor has assigned the following topic:{" "}
        <span className="font-medium">
          “How Does Physical Exercise Influence Learning and Academic
          Performance?”
        </span>
      </p>
      <p className="indent-8">
        You are expected to{" "}
        <strong className="font-semibold text-student-ink">
          write a short explanatory essay
        </strong>{" "}
        that demonstrates your understanding of how exercise affects the brain,
        behavior, and learning outcomes.
      </p>
      <p className="indent-8">
        You may already have some prior knowledge from class, but you are
        encouraged to use the chatbot here as a tool to help you develop and
        refine your explanation.
      </p>
    </div>
  );
}
