export default function StatCard({ label, value }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-4 flex flex-col items-center">
      <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">{value}</span>
      <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">{label}</span>
    </div>
  );
}
