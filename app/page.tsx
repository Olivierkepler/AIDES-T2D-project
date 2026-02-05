export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Study Portal
          </p>

          <h1 className="mt-2 text-2xl font-semibold">
            Welcome to the AIDES-T2D Study Portal
          </h1>

          <p className="mt-4 leading-relaxed text-slate-700">
            Thank you for joining the Artificial Intelligence–Driven Emotional Support
            for Type 2 Diabetes (AIDES-T2D) study. This secure website is where you’ll
            share your daily reflections, receive personalized support, and track your
            progress.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="/login"
              className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800"
            >
              Next
            </a>
          </div>

          <div className="mt-8 border-t border-slate-200 pt-6">
            <p className="text-sm text-slate-600">
              Need Help? Email{" "}
              <span className="font-medium text-slate-900">pcrg@umb.edu</span> or call{" "}
              <span className="font-medium text-slate-900">617 287 4067</span>.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
