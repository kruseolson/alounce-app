export default function ParentPendingCard({ task, currency = "$", onApprove, onSendBack }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border-2 border-blue-400 space-y-3">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-semibold truncate text-slate-800 dark:text-slate-100">{task.name}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Kid marked this complete</p>
        </div>
        <span className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-sm font-bold px-3 py-1 rounded-xl shrink-0">
          {currency}{Number(task.reward).toFixed(2)}
        </span>
      </div>

      {task.photo && (
        <img
          src={task.photo}
          alt="Completion proof"
          className="w-full max-h-56 object-cover rounded-xl"
        />
      )}

      <div className="flex gap-2">
        <button
          onClick={onApprove}
          className="flex-1 bg-green-600 text-white text-sm font-medium py-2 rounded-xl transition hover:bg-green-700"
        >
          Approve &amp; Pay
        </button>
        <button
          onClick={onSendBack}
          className="flex-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 text-sm font-medium py-2 rounded-xl transition hover:bg-yellow-200 dark:hover:bg-yellow-800"
        >
          Send Back
        </button>
      </div>
    </div>
  );
}
