import { useRef } from "react";
import { formatSeconds } from "../state/taskHelpers";

export default function KidTaskCard({ task, onStart, onStop, onSetPhoto, onClearPhoto, onMarkComplete }) {
  const fileInputRef = useRef(null);

  const isApproved = task.status === "approved";
  const isProposed = task.status === "proposed";
  const isPending = task.status === "pending_approval";

  const canStart = isApproved && !task.timerRunning && !task.expired;
  const canMarkComplete = isApproved && task.photo && !task.timerRunning;

  let cardBorder = "border border-slate-200";
  if (task.urgent) cardBorder = "border-2 border-red-500";
  if (isPending) cardBorder = "border-2 border-blue-400";

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      onSetPhoto(ev.target.result);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  let timerColor = "text-slate-600";
  if (task.expired) timerColor = "text-red-600";
  else if (task.timerRunning) timerColor = "text-green-600";

  return (
    <div className={`bg-white rounded-2xl shadow-sm overflow-hidden ${cardBorder}`}>
      {task.expired && (
        <div className="bg-red-100 px-4 py-2 text-red-700 font-medium text-sm">
          ⏰ Time&apos;s up!
        </div>
      )}

      <div className="p-4 space-y-3">
        {/* Header row */}
        <div className="flex items-center gap-2">
          <span className="font-semibold flex-1">{task.name}</span>
          {task.urgent && (
            <span className="bg-red-100 text-red-600 text-xs font-medium px-2 py-0.5 rounded-full">
              Urgent
            </span>
          )}
          {isProposed && (
            <span className="bg-yellow-100 text-yellow-700 text-xs font-medium px-2 py-0.5 rounded-full">
              Waiting approval
            </span>
          )}
          {isPending && (
            <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-0.5 rounded-full">
              Awaiting parent
            </span>
          )}
          <span className="bg-green-100 text-green-700 text-sm font-bold px-3 py-1 rounded-xl ml-auto shrink-0">
            ${Number(task.reward).toFixed(2)}
          </span>
        </div>

        {/* Timer row — only for approved tasks */}
        {isApproved && (
          <div className="bg-slate-100 rounded-xl px-4 py-3 flex items-center gap-3">
            <span className={`font-mono text-xl font-bold flex-1 ${timerColor}`}>
              {formatSeconds(task.timerSeconds)}
            </span>
            {canStart && (
              <button
                onClick={onStart}
                className="bg-black text-white text-sm font-medium px-4 py-1.5 rounded-xl transition hover:bg-slate-800"
              >
                Start
              </button>
            )}
            {task.timerRunning && (
              <button
                onClick={onStop}
                className="bg-slate-200 text-slate-700 text-sm font-medium px-4 py-1.5 rounded-xl transition hover:bg-slate-300"
              >
                Pause
              </button>
            )}
          </div>
        )}

        {/* Photo section — only for approved tasks */}
        {isApproved && (
          <div>
            {task.photo ? (
              <div className="relative">
                <img
                  src={task.photo}
                  alt="Task proof"
                  className="w-full max-h-48 object-cover rounded-xl"
                />
                <button
                  onClick={onClearPhoto}
                  className="absolute top-2 right-2 bg-white text-slate-700 text-xs font-medium px-2 py-1 rounded-lg shadow transition hover:bg-slate-100"
                >
                  Clear
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-slate-300 rounded-xl py-4 text-slate-500 text-sm transition hover:border-slate-400 hover:bg-slate-50"
              >
                📷 Upload proof photo
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        )}

        {/* Mark complete button */}
        {canMarkComplete && (
          <button
            onClick={onMarkComplete}
            className="w-full bg-green-600 text-white font-medium py-2.5 rounded-xl transition hover:bg-green-700"
          >
            Mark Complete
          </button>
        )}
      </div>
    </div>
  );
}
