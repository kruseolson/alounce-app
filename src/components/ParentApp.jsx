import { useState } from "react";
import {
  completedTodayCount,
  todayEarnedFromTasks,
  pendingApprovalCount,
  sortTasksForDisplay,
  sortCompletedTasks,
} from "../state/taskHelpers";
import StatCard from "./StatCard";
import ParentProposalCard from "./ParentProposalCard";
import ParentPendingCard from "./ParentPendingCard";
import ParentTaskCard from "./ParentTaskCard";
import CompletedTaskCard from "./CompletedTaskCard";

export default function ParentApp({
  kids,
  activeKid,
  onLogout,
  onSelectKid,
  onAddKid,
  onRemoveKid,
  onAddMoney,
  onAddTask,
  onDeleteTask,
  onApproveProposal,
  onRejectProposal,
  onApproveCompletion,
  onSendBack,
  onResetTask,
  onPatchTask,
  onSetUrgent,
}) {
  const [newKidName, setNewKidName] = useState("");
  const [moneyAmount, setMoneyAmount] = useState("");
  const [taskName, setTaskName] = useState("");
  const [taskReward, setTaskReward] = useState("");
  const [taskMinutes, setTaskMinutes] = useState("");

  const now = Date.now();

  function handleAddKid() {
    const name = newKidName.trim();
    if (!name) return;
    onAddKid(name);
    setNewKidName("");
  }

  function handleAddKidKeyDown(e) {
    if (e.key === "Enter") handleAddKid();
  }

  function handleAddMoney(e) {
    e.preventDefault();
    const amount = Number(moneyAmount);
    if (!amount || amount <= 0) return;
    onAddMoney(activeKid.id, amount);
    setMoneyAmount("");
  }

  function handleAddTask(e) {
    e.preventDefault();
    const name = taskName.trim();
    if (!name) return;
    onAddTask(activeKid.id, {
      name,
      reward: Number(taskReward) || 0,
      timerMinutes: Number(taskMinutes) || 5,
    });
    setTaskName("");
    setTaskReward("");
    setTaskMinutes("");
  }

  // Empty state — no kids at all
  if (kids.length === 0) {
    return (
      <div className="min-h-screen bg-slate-100">
        <div className="max-w-5xl mx-auto p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">StartNow</h1>
              <p className="text-slate-500 text-sm">Parent view</p>
            </div>
            <button
              onClick={onLogout}
              className="border border-slate-300 text-slate-700 rounded-xl px-4 py-2 text-sm font-medium transition hover:bg-slate-200"
            >
              Log out
            </button>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-6 space-y-3">
            <p className="text-slate-500 text-sm">No kids added yet. Add one to get started.</p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Kid's name…"
                value={newKidName}
                onChange={(e) => setNewKidName(e.target.value)}
                onKeyDown={handleAddKidKeyDown}
                className="flex-1 border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
              <button
                onClick={handleAddKid}
                className="bg-black text-white rounded-xl px-4 py-2 text-sm font-medium transition hover:bg-slate-800"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const allTasks = activeKid ? activeKid.tasks || [] : [];
  const proposedTasks = allTasks.filter((t) => t.status === "proposed");
  const pendingTasks = allTasks.filter((t) => t.status === "pending_approval");
  const activeTasks = sortTasksForDisplay(allTasks.filter((t) => t.status === "approved"));
  const completedTasks = sortCompletedTasks(allTasks.filter((t) => t.status === "paid"));

  const doneTodayCount = activeKid ? completedTodayCount(allTasks, now) : 0;
  const todayEarned = activeKid ? todayEarnedFromTasks(allTasks, now) : 0;
  const pendingCount = activeKid ? pendingApprovalCount(allTasks) : 0;
  const balance = activeKid ? Number(activeKid.balance) : 0;

  const hasAnyTasks = allTasks.length > 0;

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="max-w-5xl mx-auto p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">StartNow</h1>
            <p className="text-slate-500 text-sm">Parent view</p>
          </div>
          <button
            onClick={onLogout}
            className="border border-slate-300 text-slate-700 rounded-xl px-4 py-2 text-sm font-medium transition hover:bg-slate-200"
          >
            Log out
          </button>
        </div>

        {/* Kid tabs */}
        <div className="bg-white rounded-2xl p-3 flex flex-wrap items-center gap-2">
          {kids.map((kid) => (
            <div key={kid.id} className="flex items-center gap-1">
              <button
                onClick={() => onSelectKid(kid.id)}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                  activeKid && activeKid.id === kid.id
                    ? "bg-black text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {kid.name}
              </button>
              <button
                onClick={() => {
                  if (window.confirm(`Remove ${kid.name}?`)) {
                    onRemoveKid(kid.id);
                  }
                }}
                className="text-slate-400 hover:text-red-500 text-xs px-1 transition"
                aria-label={`Remove ${kid.name}`}
              >
                ✕
              </button>
            </div>
          ))}
          <div className="flex gap-2 ml-auto">
            <input
              type="text"
              placeholder="Add kid…"
              value={newKidName}
              onChange={(e) => setNewKidName(e.target.value)}
              onKeyDown={handleAddKidKeyDown}
              className="border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 w-32"
            />
            <button
              onClick={handleAddKid}
              className="bg-black text-white rounded-xl px-3 py-2 text-sm font-medium transition hover:bg-slate-800"
            >
              Add
            </button>
          </div>
        </div>

        {activeKid && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard label="Done Today" value={doneTodayCount} />
              <StatCard label="Wallet" value={`$${balance.toFixed(2)}`} />
              <StatCard label="Earned Today" value={`$${todayEarned.toFixed(2)}`} />
              <StatCard label="Pending" value={pendingCount} />
            </div>

            {/* Add Money */}
            <div className="bg-white rounded-2xl shadow-sm p-4">
              <h3 className="font-semibold text-slate-700 mb-3">Add Money</h3>
              <form onSubmit={handleAddMoney} className="flex gap-2">
                <input
                  type="number"
                  placeholder="0.00"
                  min="0.01"
                  step="0.25"
                  value={moneyAmount}
                  onChange={(e) => setMoneyAmount(e.target.value)}
                  className="flex-1 border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
                <button
                  type="submit"
                  className="bg-green-600 text-white rounded-xl px-4 py-2 text-sm font-medium transition hover:bg-green-700"
                >
                  Add
                </button>
              </form>
            </div>

            {/* Assign Task */}
            <div className="bg-white rounded-2xl shadow-sm p-4">
              <h3 className="font-semibold text-slate-700 mb-3">Assign Task</h3>
              <form onSubmit={handleAddTask} className="space-y-3">
                <input
                  type="text"
                  placeholder="Task name"
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-xs text-slate-500 mb-1 block">Reward ($)</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      min="0"
                      step="0.25"
                      value={taskReward}
                      onChange={(e) => setTaskReward(e.target.value)}
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-slate-500 mb-1 block">Timer (min)</label>
                    <input
                      type="number"
                      placeholder="5"
                      min="1"
                      max="60"
                      value={taskMinutes}
                      onChange={(e) => setTaskMinutes(e.target.value)}
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="bg-black text-white rounded-xl px-5 py-2 text-sm font-medium transition hover:bg-slate-800"
                >
                  Assign Task
                </button>
              </form>
            </div>

            {/* Kid Proposals */}
            {proposedTasks.length > 0 && (
              <div className="space-y-3">
                <h2 className="font-semibold text-slate-600 text-sm uppercase tracking-wide px-1">
                  Kid Proposals
                </h2>
                {proposedTasks.map((task) => (
                  <ParentProposalCard
                    key={task.id}
                    task={task}
                    onApprove={() => onApproveProposal(activeKid.id, task.id)}
                    onReject={() => onRejectProposal(activeKid.id, task.id)}
                  />
                ))}
              </div>
            )}

            {/* Completed — Pending Approval */}
            {pendingTasks.length > 0 && (
              <div className="space-y-3">
                <h2 className="font-semibold text-slate-600 text-sm uppercase tracking-wide px-1">
                  Completed — Pending Approval
                </h2>
                {pendingTasks.map((task) => (
                  <ParentPendingCard
                    key={task.id}
                    task={task}
                    onApprove={() => onApproveCompletion(activeKid.id, task.id)}
                    onSendBack={() => onSendBack(activeKid.id, task.id)}
                  />
                ))}
              </div>
            )}

            {/* Active Tasks */}
            {activeTasks.length > 0 && (
              <div className="space-y-3">
                <h2 className="font-semibold text-slate-600 text-sm uppercase tracking-wide px-1">
                  Active Tasks
                </h2>
                {activeTasks.map((task) => (
                  <ParentTaskCard
                    key={task.id}
                    task={task}
                    onDelete={() => onDeleteTask(activeKid.id, task.id)}
                    onReset={() => onResetTask(activeKid.id, task.id)}
                    onPatch={(changes) => onPatchTask(activeKid.id, task.id, changes)}
                    onSetUrgent={(urgent) => onSetUrgent(activeKid.id, task.id, urgent)}
                  />
                ))}
              </div>
            )}

            {/* Completed */}
            {completedTasks.length > 0 && (
              <div className="space-y-3">
                <h2 className="font-semibold text-slate-600 text-sm uppercase tracking-wide px-1">
                  Completed
                </h2>
                {completedTasks.map((task) => (
                  <CompletedTaskCard key={task.id} task={task} now={now} />
                ))}
              </div>
            )}

            {/* Empty state */}
            {!hasAnyTasks && (
              <div className="bg-white rounded-2xl shadow-sm p-8 text-center text-slate-400">
                <p className="text-lg">No tasks for {activeKid.name} yet.</p>
                <p className="text-sm mt-1">Use the form above to assign a task.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
