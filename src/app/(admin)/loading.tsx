export default function AdminLoading() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="h-8 w-48 animate-pulse rounded-lg bg-line" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-28 animate-pulse rounded-[20px] bg-line/70" />
        ))}
      </div>
      <div className="h-72 animate-pulse rounded-[20px] bg-line/70" />
    </div>
  );
}
