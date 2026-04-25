export default function ParentPendingCard({ task, onApprove, onSendBack }) {
  return (
    <div className="bg-white rounded-2xl p-4 border-2 border-blue-400 space-y-3">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-semibold truncate">{task.name}</p>
          <p className="text-xs text-slate-500 mt-0.5">Kid marked this complete</p>
        </div>
        <span className="bg-green-100 text-green-700 text-sm font-bold px-3 py-1 rounded-xl shrink-0">
          ${Number(task.reward).toFixed(2)}
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
          className="flex-1 bg-yellow-100 text-yellow-700 text-sm font-medium py-2 rounded-xl transition hover:bg-yellow-200"
        >
          Send Back
        </button>
      </div>
    </div>
  );
}
