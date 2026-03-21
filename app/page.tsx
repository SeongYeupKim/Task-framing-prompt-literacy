import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6 py-16">
      <h1 className="text-2xl font-semibold text-slate-900">
        Task framing &amp; GenAI study
      </h1>
      <p className="mt-3 text-slate-600">
        Sign in to continue your session. New participants can create an
        account.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/login"
          className="rounded-lg bg-brand-600 px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-brand-700"
        >
          Log in
        </Link>
        <Link
          href="/register"
          className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-center text-sm font-medium text-slate-800 hover:bg-slate-50"
        >
          Register
        </Link>
      </div>
    </main>
  );
}
