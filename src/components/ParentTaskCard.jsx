import { useState } from "react";
import { formatSeconds } from "../state/taskHelpers";

export default function ParentTaskCard({ task, onDelete, onReset, onPatch, onSetUrgent }) {
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(task.name);
  const [editReward, setEditReward] = useState(String(task.reward));
  const [editMinutes, setEditMinutes] = useState(String(task.timerMinutes));

  let cardBorder = "border border-slate-200";
  if (task.urgent) cardBorder = "border-2 border-red-500";

  function handleEditOpen() {
    setEditName(task.name);
    setEditReward(String(task.reward));
    setEditMinutes(String(task.timerMinutes));
    setEditing(true);
  }

  function handleSave() {
    const name = editName.trim();
    if (!name) return;
    const reward = Math.max(0, Number(editReward) || 0);
    const newMinutes = Math.max(1, Number(editMinutes) || 1);
    const changes = { name, reward, timerMinutes: newMinutes };
    if (!task.timerRunning) {
      changes.timerSeconds = newMinutes * 60;
    }
    onPatch(changes);
    setEditing(false);
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
        {editing ? (
          /* Edit mode */
          <div className="space-y-3">
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
              placeholder="Task name"
              autoFocus
            />
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-xs text-slate-500 mb-1 block">Reward ($)</label>
                <input
                  type="number"
                  value={editReward}
                  onChange={(e) => setEditReward(e.target.value)}
                  min="0"
                  step="0.25"
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-slate-500 mb-1 block">Timer (min)</label>
                <input
                  type="number"
                  value={editMinutes}
                  onChange={(e) => setEditMinutes(e.target.value)}
                  min="1"
                  max="60"
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="bg-black text-white rounded-xl px-5 py-2 text-sm font-medium transition hover:bg-slate-800"
              >
                Save
              </button>
              <button
                onClick={() => setEditing(false)}
                className="bg-slate-100 text-slate-700 rounded-xl px-5 py-2 text-sm font-medium transition hover:bg-slate-200"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          /* View mode */
          <>
            {/* Header row */}
            <div className="flex items-center gap-2">
              <span className="font-semibold flex-1">{task.name}</span>
              {task.urgent && (
                <span className="bg-red-100 text-red-600 text-xs font-medium px-2 py-0.5 rounded-full">
                  Urgent
                </span>
              )}
              <span className="bg-green-100 text-green-700 text-sm font-bold px-3 py-1 rounded-xl ml-auto shrink-0">
                ${Number(task.reward).toFixed(2)}
              </span>
            </div>

            {/* Timer display */}
            <div className="bg-slate-100 rounded-xl px-4 py-3">
              <span className={`font-mono text-xl font-bold ${timerColor}`}>
                {formatSeconds(task.timerSeconds)}
              </span>
            </div>

            {/* Photo */}
            {task.photo && (
              <img
                src={task.photo}
                alt="Task proof"
                className="w-full max-h-40 object-cover rounded-xl"
              />
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleEditOpen}
                className="bg-slate-100 text-slate-700 text-sm font-medium px-3 py-1.5 rounded-xl transition hover:bg-slate-200"
              >
                Edit
              </button>
              <button
                onClick={onReset}
                className="bg-slate-100 text-slate-700 text-sm font-medium px-3 py-1.5 rounded-xl transition hover:bg-slate-200"
              >
                Reset
              </button>
              <button
                onClick={() => onSetUrgent(!task.urgent)}
                className={`text-sm font-medium px-3 py-1.5 rounded-xl transition ${
                  task.urgent
                    ? "bg-red-100 text-red-700 hover:bg-red-200"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {task.urgent ? "Unmark Urgent" : "Mark Urgent"}
              </button>
              <button
                onClick={onDelete}
                className="bg-red-100 text-red-700 text-sm font-medium px-3 py-1.5 rounded-xl transition hover:bg-red-200 ml-auto"
              >
                Delete
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
