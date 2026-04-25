export default function ParentProposalCard({ task, onApprove, onReject }) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-yellow-300 flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <p className="font-semibold truncate">{task.name}</p>
        <p className="text-xs text-slate-500 mt-0.5">
          {task.timerMinutes} min · ${Number(task.reward).toFixed(2)} reward
        </p>
      </div>
      <span className="bg-green-100 text-green-700 text-sm font-bold px-3 py-1 rounded-xl shrink-0">
        ${Number(task.reward).toFixed(2)}
      </span>
      <div className="flex gap-2 shrink-0">
        <button
          onClick={onApprove}
          className="bg-green-600 text-white text-sm font-medium px-3 py-1.5 rounded-xl transition hover:bg-green-700"
        >
          Approve
        </button>
        <button
          onClick={onReject}
          className="bg-red-100 text-red-700 text-sm font-medium px-3 py-1.5 rounded-xl transition hover:bg-red-200"
        >
          Reject
        </button>
      </div>
    </div>
  );
}
