import { useCallback, useEffect, useRef, useState } from "react";
import { usePersistedState } from "./state/usePersistedState";
import { buildTask } from "./state/taskHelpers";
import { playBeep } from "./lib/sound";
import LoginScreen from "./components/LoginScreen";
import KidApp from "./components/KidApp";
import ParentApp from "./components/ParentApp";
import SettingsModal from "./components/SettingsModal";

const DEFAULT_SETTINGS = {
  theme: "system",
  soundEnabled: true,
  vibrationEnabled: true,
  notificationsEnabled: false,
  tabTitleFlash: true,
  alarmLoop: true,
  alarmLoopSeconds: 30,
  defaultTimerMinutes: 5,
  defaultReward: 1,
  currency: "$",
  showCompletedTasks: true,
  expiredPenalty: 0,
};

const DEFAULT_STATE = {
  version: 2,
  kids: [],
  selectedKidId: null,
  session: { role: null, kidId: null },
  nextId: 1,
  beepCounter: 0,
  settings: { ...DEFAULT_SETTINGS },
};

function updateKidTask(kids, kidId, taskId, updater) {
  return kids.map((kid) => {
    if (kid.id !== kidId) return kid;
    return {
      ...kid,
      tasks: kid.tasks.map((task) => {
        if (task.id !== taskId) return task;
        return updater(task);
      }),
    };
  });
}

function removeKidTask(kids, kidId, taskId) {
  return kids.map((kid) => {
    if (kid.id !== kidId) return kid;
    return { ...kid, tasks: kid.tasks.filter((t) => t.id !== taskId) };
  });
}

export default function App() {
  const [state, setState] = usePersistedState("startnow.v1", 2, DEFAULT_STATE);

  // Defensive: ensure settings always present and merged with new defaults
  const settings = { ...DEFAULT_SETTINGS, ...(state.settings || {}) };

  const [settingsOpen, setSettingsOpen] = useState(false);

  // --- Theme effect — apply .dark class on <html> based on settings.theme ---
  useEffect(() => {
    const root = document.documentElement;
    function apply(theme) {
      let isDark;
      if (theme === "dark") isDark = true;
      else if (theme === "light") isDark = false;
      else {
        isDark = window.matchMedia
          ? window.matchMedia("(prefers-color-scheme: dark)").matches
          : false;
      }
      if (isDark) root.classList.add("dark");
      else root.classList.remove("dark");
    }
    apply(settings.theme);

    if (settings.theme === "system" && window.matchMedia) {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const listener = () => apply("system");
      if (mq.addEventListener) mq.addEventListener("change", listener);
      else mq.addListener(listener);
      return () => {
        if (mq.removeEventListener) mq.removeEventListener("change", listener);
        else mq.removeListener(listener);
      };
    }
  }, [settings.theme]);

  // Timer interval — ticks every second and counts down running tasks
  useEffect(() => {
    const id = setInterval(() => {
      setState((prev) => {
        let beeped = false;
        let expiredTaskName = null;
        const kids = prev.kids.map((kid) => ({
          ...kid,
          tasks: kid.tasks.map((task) => {
            if (!task.timerRunning || task.timerSeconds <= 0) return task;
            if (task.timerSeconds === 1) {
              beeped = true;
              expiredTaskName = task.name;
              return { ...task, timerSeconds: 0, timerRunning: false, expired: true };
            }
            return { ...task, timerSeconds: task.timerSeconds - 1 };
          }),
        }));
        if (beeped) {
          // schedule side-effects after state update — vibration, notification
          queueMicrotask(() => {
            try {
              if ((prev.settings || DEFAULT_SETTINGS).vibrationEnabled && navigator.vibrate) {
                navigator.vibrate([200, 100, 200, 100, 200]);
              }
            } catch (_) {}
            try {
              if (
                (prev.settings || DEFAULT_SETTINGS).notificationsEnabled &&
                typeof Notification !== "undefined" &&
                Notification.permission === "granted"
              ) {
                new Notification("Time's up!", {
                  body: expiredTaskName || "A task timer has expired.",
                });
              }
            } catch (_) {}
          });
        }
        return {
          ...prev,
          kids,
          beepCounter: beeped ? prev.beepCounter + 1 : prev.beepCounter,
        };
      });
    }, 1000);
    return () => clearInterval(id);
  }, [setState]);

  // Beep effect — fire only when beepCounter actually increments
  const prevBeepCounter = useRef(null);
  const alarmLoopRef = useRef({ intervalId: null, timeoutId: null });
  useEffect(() => {
    if (prevBeepCounter.current === null) {
      prevBeepCounter.current = state.beepCounter;
      return;
    }
    if (state.beepCounter !== prevBeepCounter.current) {
      prevBeepCounter.current = state.beepCounter;
      if (settings.soundEnabled) {
        playBeep();
        // alarm loop
        if (settings.alarmLoop) {
          // clear any prior loop
          if (alarmLoopRef.current.intervalId) clearInterval(alarmLoopRef.current.intervalId);
          if (alarmLoopRef.current.timeoutId) clearTimeout(alarmLoopRef.current.timeoutId);
          const intervalId = setInterval(() => {
            if (settings.soundEnabled) playBeep();
          }, 2000);
          const timeoutId = setTimeout(() => {
            clearInterval(intervalId);
            alarmLoopRef.current.intervalId = null;
            alarmLoopRef.current.timeoutId = null;
          }, Math.max(5, Math.min(60, settings.alarmLoopSeconds)) * 1000);
          alarmLoopRef.current = { intervalId, timeoutId };
        }
      }
    }
  }, [state.beepCounter, settings.soundEnabled, settings.alarmLoop, settings.alarmLoopSeconds]);

  // Tab title flash when any task is expired
  const originalTitleRef = useRef(null);
  const titleTimeoutRef = useRef(null);
  useEffect(() => {
    if (originalTitleRef.current === null) {
      originalTitleRef.current = document.title || "StartNow";
    }
    const anyExpired = state.kids.some((k) => k.tasks.some((t) => t.expired));
    if (settings.tabTitleFlash && anyExpired) {
      document.title = "TIME'S UP!";
      if (titleTimeoutRef.current) clearTimeout(titleTimeoutRef.current);
      titleTimeoutRef.current = setTimeout(() => {
        document.title = originalTitleRef.current;
      }, 30000);
    } else {
      if (titleTimeoutRef.current) {
        clearTimeout(titleTimeoutRef.current);
        titleTimeoutRef.current = null;
      }
      document.title = originalTitleRef.current;
    }
  }, [state.kids, settings.tabTitleFlash]);

  // --- Settings ---
  const updateSettings = useCallback((partial) => {
    setState((prev) => ({
      ...prev,
      settings: { ...DEFAULT_SETTINGS, ...(prev.settings || {}), ...partial },
    }));
  }, [setState]);

  // --- Data: export / import / clear ---
  const exportData = useCallback(() => {
    try {
      const payload = JSON.stringify({ ...state, version: 2 }, null, 2);
      const blob = new Blob([payload], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const d = new Date();
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      a.href = url;
      a.download = `startnow-backup-${yyyy}-${mm}-${dd}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      window.alert("Export failed: " + (err?.message || "unknown"));
    }
  }, [state]);

  const importData = useCallback((parsed) => {
    setState(() => {
      const merged = {
        ...DEFAULT_STATE,
        ...parsed,
        settings: { ...DEFAULT_SETTINGS, ...((parsed && parsed.settings) || {}) },
        session: { role: null, kidId: null },
      };
      return merged;
    });
  }, [setState]);

  const clearAllData = useCallback(() => {
    try {
      localStorage.removeItem("startnow.v1");
    } catch (_) {}
    window.location.reload();
  }, []);

  // --- Session ---
  const login = useCallback((role, kidId = null) => {
    setState((prev) => ({ ...prev, session: { role, kidId } }));
  }, [setState]);

  const logout = useCallback(() => {
    setState((prev) => ({
      ...prev,
      session: { role: null, kidId: null },
      // Stop all timers on logout
      kids: prev.kids.map((kid) => ({
        ...kid,
        tasks: kid.tasks.map((task) =>
          task.timerRunning ? { ...task, timerRunning: false } : task
        ),
      })),
    }));
  }, [setState]);

  // --- Kids management ---
  const addKid = useCallback((name) => {
    setState((prev) => {
      const id = prev.nextId;
      const newKid = { id, name: name.trim(), balance: 0, tasks: [] };
      return {
        ...prev,
        kids: [...prev.kids, newKid],
        nextId: prev.nextId + 1,
        selectedKidId: id,
      };
    });
  }, [setState]);

  const removeKid = useCallback((kidId) => {
    setState((prev) => {
      const remaining = prev.kids.filter((k) => k.id !== kidId);
      let selectedKidId = prev.selectedKidId;
      if (selectedKidId === kidId) {
        selectedKidId = remaining.length > 0 ? remaining[0].id : null;
      }
      return { ...prev, kids: remaining, selectedKidId };
    });
  }, [setState]);

  const selectKid = useCallback((kidId) => {
    setState((prev) => ({ ...prev, selectedKidId: kidId }));
  }, [setState]);

  // --- Money ---
  const addMoney = useCallback((kidId, amount) => {
    setState((prev) => ({
      ...prev,
      kids: prev.kids.map((kid) =>
        kid.id === kidId ? { ...kid, balance: Number(kid.balance) + Number(amount) } : kid
      ),
    }));
  }, [setState]);

  // --- Tasks ---
  const addTask = useCallback((kidId, taskData) => {
    setState((prev) => {
      const task = buildTask({
        id: prev.nextId,
        status: "approved",
        createdAt: Date.now(),
        ...taskData,
      });
      return {
        ...prev,
        nextId: prev.nextId + 1,
        kids: prev.kids.map((kid) =>
          kid.id === kidId ? { ...kid, tasks: [...kid.tasks, task] } : kid
        ),
      };
    });
  }, [setState]);

  const proposeTask = useCallback((kidId, taskData) => {
    setState((prev) => {
      const task = buildTask({
        id: prev.nextId,
        status: "proposed",
        createdAt: Date.now(),
        ...taskData,
      });
      return {
        ...prev,
        nextId: prev.nextId + 1,
        kids: prev.kids.map((kid) =>
          kid.id === kidId ? { ...kid, tasks: [...kid.tasks, task] } : kid
        ),
      };
    });
  }, [setState]);

  const deleteTask = useCallback((kidId, taskId) => {
    setState((prev) => ({
      ...prev,
      kids: removeKidTask(prev.kids, kidId, taskId),
    }));
  }, [setState]);

  const patchTask = useCallback((kidId, taskId, changes) => {
    setState((prev) => ({
      ...prev,
      kids: updateKidTask(prev.kids, kidId, taskId, (task) => ({ ...task, ...changes })),
    }));
  }, [setState]);

  const approveProposal = useCallback((kidId, taskId) => {
    setState((prev) => ({
      ...prev,
      kids: updateKidTask(prev.kids, kidId, taskId, (task) => ({
        ...task,
        status: "approved",
      })),
    }));
  }, [setState]);

  const rejectProposal = useCallback((kidId, taskId) => {
    setState((prev) => ({
      ...prev,
      kids: removeKidTask(prev.kids, kidId, taskId),
    }));
  }, [setState]);

  const startTimer = useCallback((kidId, taskId) => {
    setState((prev) => ({
      ...prev,
      kids: updateKidTask(prev.kids, kidId, taskId, (task) => ({
        ...task,
        timerRunning: true,
      })),
    }));
  }, [setState]);

  const stopTimer = useCallback((kidId, taskId) => {
    setState((prev) => ({
      ...prev,
      kids: updateKidTask(prev.kids, kidId, taskId, (task) => ({
        ...task,
        timerRunning: false,
      })),
    }));
  }, [setState]);

  const resetTask = useCallback((kidId, taskId) => {
    setState((prev) => ({
      ...prev,
      kids: updateKidTask(prev.kids, kidId, taskId, (task) => ({
        ...task,
        status: "approved",
        timerRunning: false,
        timerSeconds: task.timerMinutes * 60,
        expired: false,
        photo: null,
      })),
    }));
  }, [setState]);

  const setPhoto = useCallback((kidId, taskId, dataUrl) => {
    setState((prev) => ({
      ...prev,
      kids: updateKidTask(prev.kids, kidId, taskId, (task) => ({
        ...task,
        photo: dataUrl,
      })),
    }));
  }, [setState]);

  const clearPhoto = useCallback((kidId, taskId) => {
    setState((prev) => ({
      ...prev,
      kids: updateKidTask(prev.kids, kidId, taskId, (task) => ({
        ...task,
        photo: null,
      })),
    }));
  }, [setState]);

  const markComplete = useCallback((kidId, taskId) => {
    setState((prev) => ({
      ...prev,
      kids: updateKidTask(prev.kids, kidId, taskId, (task) => ({
        ...task,
        status: "pending_approval",
        timerRunning: false,
      })),
    }));
  }, [setState]);

  const approveCompletion = useCallback((kidId, taskId) => {
    setState((prev) => {
      const kid = prev.kids.find((k) => k.id === kidId);
      if (!kid) return prev;
      const task = kid.tasks.find((t) => t.id === taskId);
      if (!task) return prev;
      const reward = Number(task.reward) || 0;

      return {
        ...prev,
        kids: prev.kids.map((k) => {
          if (k.id !== kidId) return k;
          return {
            ...k,
            balance: Number(k.balance) + reward,
            tasks: k.tasks.map((t) => {
              if (t.id !== taskId) return t;
              return {
                ...t,
                status: "paid",
                expired: false,
                timerRunning: false,
                approvedAt: Date.now(),
              };
            }),
          };
        }),
      };
    });
  }, [setState]);

  const sendBack = useCallback((kidId, taskId) => {
    setState((prev) => ({
      ...prev,
      kids: updateKidTask(prev.kids, kidId, taskId, (task) => ({
        ...task,
        status: "approved",
        timerRunning: false,
      })),
    }));
  }, [setState]);

  const setUrgent = useCallback((kidId, taskId, urgent) => {
    setState((prev) => ({
      ...prev,
      kids: updateKidTask(prev.kids, kidId, taskId, (task) => ({
        ...task,
        urgent,
        ...(urgent ? { createdAt: Date.now() } : {}),
      })),
    }));
  }, [setState]);

  // --- Routing ---
  const { session, kids, selectedKidId } = state;

  const openSettings = useCallback(() => setSettingsOpen(true), []);
  const closeSettings = useCallback(() => setSettingsOpen(false), []);

  const settingsModal = (
    <SettingsModal
      open={settingsOpen}
      onClose={closeSettings}
      settings={settings}
      onUpdateSettings={updateSettings}
      onExportData={exportData}
      onImportData={importData}
      onClearData={clearAllData}
    />
  );

  if (session.role === null) {
    return (
      <>
        <LoginScreen
          kids={kids}
          onLoginKid={(kidId) => login("kid", kidId)}
          onLoginParent={() => login("parent")}
          onAddKid={addKid}
        />
        {settingsModal}
      </>
    );
  }

  if (session.role === "kid") {
    const kid = kids.find((k) => k.id === session.kidId);
    if (!kid) {
      logout();
      return null;
    }
    return (
      <>
        <KidApp
          kid={kid}
          settings={settings}
          onLogout={logout}
          onOpenSettings={openSettings}
          onProposeTask={(taskData) => proposeTask(session.kidId, taskData)}
          onStartTimer={(taskId) => startTimer(session.kidId, taskId)}
          onStopTimer={(taskId) => stopTimer(session.kidId, taskId)}
          onSetPhoto={(taskId, dataUrl) => setPhoto(session.kidId, taskId, dataUrl)}
          onClearPhoto={(taskId) => clearPhoto(session.kidId, taskId)}
          onMarkComplete={(taskId) => markComplete(session.kidId, taskId)}
        />
        {settingsModal}
      </>
    );
  }

  if (session.role === "parent") {
    const activeKid =
      kids.find((k) => k.id === selectedKidId) || kids[0] || null;
    return (
      <>
        <ParentApp
          kids={kids}
          activeKid={activeKid}
          settings={settings}
          onLogout={logout}
          onOpenSettings={openSettings}
          onSelectKid={selectKid}
          onAddKid={addKid}
          onRemoveKid={removeKid}
          onAddMoney={addMoney}
          onAddTask={addTask}
          onDeleteTask={deleteTask}
          onApproveProposal={approveProposal}
          onRejectProposal={rejectProposal}
          onApproveCompletion={approveCompletion}
          onSendBack={sendBack}
          onResetTask={resetTask}
          onPatchTask={patchTask}
          onSetUrgent={setUrgent}
        />
        {settingsModal}
      </>
    );
  }

  return null;
}
