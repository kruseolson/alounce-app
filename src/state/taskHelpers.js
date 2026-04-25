export function formatSeconds(totalSeconds) {
  const safe = Math.max(0, Math.floor(totalSeconds || 0));
  const mm = Math.floor(safe / 60)
    .toString()
    .padStart(2, "0");
  const ss = (safe % 60).toString().padStart(2, "0");
  return `${mm}:${ss}`;
}

export function isSameDay(aMs, bMs) {
  if (!aMs || !bMs) return false;
  const a = new Date(aMs);
  const b = new Date(bMs);
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

const STATUS_RANK = {
  pending_approval: 0,
  proposed: 2,
  approved: 3,
};

export function sortTasksForDisplay(tasks) {
  return [...tasks].sort((a, b) => {
    const aUrgent = a.urgent ? 1 : 0;
    const bUrgent = b.urgent ? 1 : 0;
    const aRank = STATUS_RANK[a.status] ?? 4;
    const bRank = STATUS_RANK[b.status] ?? 4;

    if (aRank !== bRank) {
      if (aRank === 0 || bRank === 0) return aRank - bRank;
    }
    if (aUrgent !== bUrgent) return bUrgent - aUrgent;
    if (aRank !== bRank) return aRank - bRank;
    return (b.createdAt || 0) - (a.createdAt || 0);
  });
}

export function sortCompletedTasks(tasks) {
  return [...tasks].sort(
    (a, b) => (b.approvedAt || 0) - (a.approvedAt || 0)
  );
}

export function getStatusText(task) {
  switch (task.status) {
    case "proposed":
      return "Waiting for parent approval";
    case "approved":
      return "Ready to start";
    case "pending_approval":
      return "Waiting for parent to approve completion";
    case "paid":
      return "Paid";
    default:
      return "";
  }
}

export function buildTask({ id, name, reward, timerMinutes, status, createdAt }) {
  const minutes = Math.max(1, Number(timerMinutes) || 5);
  return {
    id,
    name: String(name || "").trim(),
    reward: Math.max(0, Number(reward) || 0),
    timerMinutes: minutes,
    timerSeconds: minutes * 60,
    timerRunning: false,
    expired: false,
    photo: null,
    status: status || "approved",
    urgent: false,
    createdAt: createdAt || Date.now(),
    approvedAt: null,
  };
}

export function todayEarnedFromTasks(tasks, nowMs = Date.now()) {
  return tasks
    .filter((t) => t.status === "paid" && isSameDay(t.approvedAt, nowMs))
    .reduce((sum, t) => sum + (Number(t.reward) || 0), 0);
}

export function completedTodayCount(tasks, nowMs = Date.now()) {
  return tasks.filter(
    (t) => t.status === "paid" && isSameDay(t.approvedAt, nowMs)
  ).length;
}

export function pendingApprovalCount(tasks) {
  return tasks.filter((t) => t.status === "pending_approval").length;
}
