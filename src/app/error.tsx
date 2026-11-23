"use client";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col items-start px-4 py-24 sm:px-6">
      <p className="text-sm font-semibold text-red-600">Error</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
        Something went wrong
      </h1>
      <p className="mt-3 max-w-xl text-slate-600">
        An unexpected error occurred while rendering this page. Try again, or return to the
        overview.
      </p>
      {error.digest ? (
        <p className="mt-4 font-mono text-xs text-slate-500">Error digest: {error.digest}</p>
      ) : null}
      <button
        type="button"
        onClick={reset}
        className="mt-8 inline-flex rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-700"
      >
        Try again
      </button>
    </div>
  );
}
