import { useState } from "react";
import {
  completedTodayCount,
  todayEarnedFromTasks,
  pendingApprovalCount,
  sortTasksForDisplay,
  sortCompletedTasks,
} from "../state/taskHelpers";
import StatCard from "./StatCard";
import KidTaskCard from "./KidTaskCard";
import CompletedTaskCard from "./CompletedTaskCard";

export default function KidApp({
  kid,
  settings,
  onLogout,
  onOpenSettings,
  onProposeTask,
  onStartTimer,
  onStopTimer,
  onSetPhoto,
  onClearPhoto,
  onMarkComplete,
}) {
  const currency = settings?.currency || "$";
  const defaultTimerMinutes = settings?.defaultTimerMinutes ?? 5;
  const defaultReward = settings?.defaultReward ?? 1;
  const showCompleted = settings?.showCompletedTasks !== false;

  const [proposing, setProposing] = useState(false);
  const [proposeName, setProposeName] = useState("");
  const [proposeReward, setProposeReward] = useState(String(defaultReward));
  const [proposeMinutes, setProposeMinutes] = useState(String(defaultTimerMinutes));

  const now = Date.now();
  const allTasks = kid.tasks || [];
  const activeTasks = sortTasksForDisplay(allTasks.filter((t) => t.status !== "paid"));
  const completedTasks = sortCompletedTasks(allTasks.filter((t) => t.status === "paid"));

  const doneTodayCount = completedTodayCount(allTasks, now);
  const todayEarned = todayEarnedFromTasks(allTasks, now);
  const pendingCount = pendingApprovalCount(allTasks);

  function handleProposeOpen() {
    setProposeReward(String(defaultReward));
    setProposeMinutes(String(defaultTimerMinutes));
    setProposing(true);
  }

  function handleProposeSubmit(e) {
    e.preventDefault();
    const name = proposeName.trim();
    if (!name) return;
    onProposeTask({
      name,
      reward: Number(proposeReward) || 0,
      timerMinutes: Number(proposeMinutes) || defaultTimerMinutes,
    });
    setProposeName("");
    setProposeReward(String(defaultReward));
    setProposeMinutes(String(defaultTimerMinutes));
    setProposing(false);
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900">
      <div className="max-w-5xl mx-auto p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">StartNow</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Hey, {kid.name}!</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenSettings}
              aria-label="Open settings"
              className="border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-xl px-3 py-2 text-sm font-medium transition hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              <span aria-hidden="true">⚙</span>
            </button>
            <button
              onClick={onLogout}
              className="border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-xl px-4 py-2 text-sm font-medium transition hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              Log out
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Done Today" value={doneTodayCount} />
          <StatCard label="Wallet" value={`${currency}${Number(kid.balance).toFixed(2)}`} />
          <StatCard label="Earned Today" value={`${currency}${todayEarned.toFixed(2)}`} />
          <StatCard label="Pending" value={pendingCount} />
        </div>

        {/* Propose a task */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-4">
          {!proposing ? (
            <button
              onClick={handleProposeOpen}
              className="text-slate-500 dark:text-slate-400 text-sm transition hover:text-slate-700 dark:hover:text-slate-200"
            >
              + Suggest a task for parent approval…
            </button>
          ) : (
            <form onSubmit={handleProposeSubmit} className="space-y-3">
              <h3 className="font-semibold text-slate-700 dark:text-slate-200">Propose a task</h3>
              <input
                type="text"
                placeholder="Task name"
                value={proposeName}
                onChange={(e) => setProposeName(e.target.value)}
                className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                autoFocus
              />
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">
                    Reward ({currency})
                  </label>
                  <input
                    type="number"
                    placeholder="0.00"
                    min="0"
                    step="0.25"
                    value={proposeReward}
                    onChange={(e) => setProposeReward(e.target.value)}
                    className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">
                    Timer (min)
                  </label>
                  <input
                    type="number"
                    placeholder="5"
                    min="1"
                    max="60"
                    value={proposeMinutes}
                    onChange={(e) => setProposeMinutes(e.target.value)}
                    className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-black text-white rounded-xl px-5 py-2 text-sm font-medium transition hover:bg-slate-800"
                >
                  Submit
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setProposing(false);
                    setProposeName("");
                    setProposeReward(String(defaultReward));
                    setProposeMinutes(String(defaultTimerMinutes));
                  }}
                  className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl px-5 py-2 text-sm font-medium transition hover:bg-slate-200 dark:hover:bg-slate-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Active tasks */}
        {activeTasks.length > 0 && (
          <div className="space-y-3">
            <h2 className="font-semibold text-slate-600 dark:text-slate-300 text-sm uppercase tracking-wide px-1">
              Tasks
            </h2>
            {activeTasks.map((task) => (
              <KidTaskCard
                key={task.id}
                task={task}
                currency={currency}
                onStart={() => onStartTimer(task.id)}
                onStop={() => onStopTimer(task.id)}
                onSetPhoto={(dataUrl) => onSetPhoto(task.id, dataUrl)}
                onClearPhoto={() => onClearPhoto(task.id)}
                onMarkComplete={() => onMarkComplete(task.id)}
              />
            ))}
          </div>
        )}

        {/* Completed tasks */}
        {showCompleted && completedTasks.length > 0 && (
          <div className="space-y-3">
            <h2 className="font-semibold text-slate-600 dark:text-slate-300 text-sm uppercase tracking-wide px-1">
              Completed
            </h2>
            {completedTasks.map((task) => (
              <CompletedTaskCard key={task.id} task={task} now={now} currency={currency} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {allTasks.length === 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-8 text-center text-slate-400 dark:text-slate-500">
            <p className="text-lg">No tasks yet!</p>
            <p className="text-sm mt-1">Ask your parent to assign tasks, or suggest one above.</p>
          </div>
        )}
      </div>
    </div>
  );
}
