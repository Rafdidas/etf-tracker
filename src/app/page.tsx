import SummaryCards from "./_components/summary-cards";

export default function DashboardPage() {
  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">대시보드</h1>
      <SummaryCards />
      <section className="rounded-xl border p-4">
        <div className="mb-2 text-sm text-neutral-500">계좌 게이지</div>
        <div className="h-3 w-full rounded-full bg-neutral-200">
          <div className="h-3 w-[35%] rounded-full bg-blue-600" />
        </div>
      </section>
    </main>
  );
}
