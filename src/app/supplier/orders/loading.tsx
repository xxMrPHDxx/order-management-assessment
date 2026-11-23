export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <div className="h-7 w-64 animate-pulse rounded bg-slate-200" />
      <div className="mt-3 h-4 w-80 animate-pulse rounded bg-slate-200" />
      <div className="mt-6 h-28 animate-pulse rounded-xl bg-slate-200" />
      <div className="mt-6 h-96 animate-pulse rounded-xl bg-slate-200" />
    </div>
  );
}
