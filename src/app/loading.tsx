export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
      <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
      <div className="mt-6 h-10 w-2/3 animate-pulse rounded bg-slate-200" />
      <div className="mt-4 h-5 w-1/2 animate-pulse rounded bg-slate-200" />
    </div>
  );
}
