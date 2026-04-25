import { isSameDay } from "../state/taskHelpers";

export default function CompletedTaskCard({ task, now }) {
  const isToday = isSameDay(task.approvedAt, now);

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 opacity-80 flex items-center gap-3">
      <span className="flex-1 font-medium text-slate-700">{task.name}</span>
      {isToday && (
        <span className="bg-green-100 text-green-700 text-xs font-medium px-2 py-0.5 rounded-full">
          Today
        </span>
      )}
      <span className="bg-green-100 text-green-700 text-sm font-bold px-3 py-1 rounded-xl">
        ${Number(task.reward).toFixed(2)}
      </span>
    </div>
  );
}
