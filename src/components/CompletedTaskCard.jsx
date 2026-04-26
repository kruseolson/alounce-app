import { isSameDay } from "../state/taskHelpers";

export default function CompletedTaskCard({ task, now, currency = "$" }) {
  const isToday = isSameDay(task.approvedAt, now);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-4 opacity-80 flex items-center gap-3">
      <span className="flex-1 font-medium text-slate-700 dark:text-slate-200">{task.name}</span>
      {isToday && (
        <span className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs font-medium px-2 py-0.5 rounded-full">
          Today
        </span>
      )}
      <span className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-sm font-bold px-3 py-1 rounded-xl">
        {currency}{Number(task.reward).toFixed(2)}
      </span>
    </div>
  );
}
