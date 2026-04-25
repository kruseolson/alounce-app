export default function StatCard({ label, value }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-col items-center">
      <span className="text-2xl font-bold">{value}</span>
      <span className="text-xs text-slate-500 mt-1">{label}</span>
    </div>
  );
}
