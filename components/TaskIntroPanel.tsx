"use client";

type IntroVariant = "final_control" | "final_instruction";

type Props = {
  variant: IntroVariant;
  onContinue: () => void | Promise<void>;
};

export function TaskIntroPanel({ variant, onContinue }: Props) {
  return (
    <div className="mx-auto max-w-2xl space-y-8 pb-16">
      <div className="rounded-2xl border border-student-border bg-student-card px-6 py-8 shadow-student sm:px-10">
        <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
          What you’ll do next
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-student-ink">
          {variant === "final_control" && "Main task: chat, then write"}
          {variant === "final_instruction" && "Main task: chat, then write"}
        </h2>

        {variant === "final_control" && (
          <div className="mt-5 space-y-4 text-base leading-relaxed text-student-ink">
            <p>
              You are a <strong className="font-semibold">student</strong>{" "}
              working on a science assignment. Next, you’ll use an AI chat to
              help you think through the topic, then{" "}
              <strong className="font-semibold">
                write your own short explanatory essay
              </strong>{" "}
              in your words.
            </p>
            <p>
              The screen has three parts: the assignment scenario and criteria,
              the chat, and the essay space. You can move between chat and essay
              when you’re ready.
            </p>
            <p className="font-medium text-student-ink">
              Now you will open the chat and essay task.
            </p>
          </div>
        )}

        {variant === "final_instruction" && (
          <div className="mt-5 space-y-4 text-base leading-relaxed text-student-ink">
            <p>
              You are a <strong className="font-semibold">student</strong>{" "}
              working on a science assignment. Next, you’ll use an AI chat to
              help you think through the topic, then{" "}
              <strong className="font-semibold">
                write your own short explanatory essay
              </strong>{" "}
              in your words.
            </p>
            <p>
              The screen has three parts: the assignment scenario and criteria,
              the chat, and the essay space. You can use the{" "}
              <strong className="font-semibold">brief instruction reminder</strong>{" "}
              to retrieve the CARE moves when you plan your messages to the AI.
            </p>
            <p className="font-medium text-student-ink">
              Now you will open the chat and essay task.
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={() => void onContinue()}
          className="mt-8 w-full rounded-2xl bg-teal-600 py-3.5 text-base font-semibold text-white shadow-sm transition hover:bg-teal-700 sm:w-auto sm:px-10"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
