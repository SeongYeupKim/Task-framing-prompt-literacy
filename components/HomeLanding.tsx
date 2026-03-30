import Link from "next/link";

export function HomeLanding() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-student-canvas px-6 py-16">
      <div className="w-full max-w-md rounded-2xl border border-student-border bg-student-card px-8 py-10 shadow-student">
        <h1 className="text-center text-2xl font-semibold tracking-tight text-student-ink">
          Learning session
        </h1>
        <p className="mt-3 text-center text-sm font-medium leading-relaxed text-student-muted">
          Sign in if you already have an account. New participants can create
          one below.
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <Link
            href="/login"
            className="rounded-2xl bg-teal-600 py-3.5 text-center text-base font-semibold text-white shadow-sm transition hover:bg-teal-700"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="rounded-2xl border-2 border-teal-200 bg-teal-50 py-3.5 text-center text-base font-semibold text-teal-900 transition hover:bg-teal-100"
          >
            Create an account
          </Link>
        </div>
      </div>
    </main>
  );
}
