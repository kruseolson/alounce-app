import { useCallback, useEffect, useRef } from "react";
import { usePersistedState } from "./state/usePersistedState";
import { buildTask } from "./state/taskHelpers";
import { playBeep } from "./lib/sound";
import LoginScreen from "./components/LoginScreen";
import KidApp from "./components/KidApp";
import ParentApp from "./components/ParentApp";

const DEFAULT_STATE = {
  version: 1,
  kids: [],
  selectedKidId: null,
  session: { role: null, kidId: null },
  nextId: 1,
  beepCounter: 0,
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
  const [state, setState] = usePersistedState("startnow.v1", 1, DEFAULT_STATE);

  // Timer interval — ticks every second and counts down running tasks
  useEffect(() => {
    const id = setInterval(() => {
      setState((prev) => {
        let beeped = false;
        const kids = prev.kids.map((kid) => ({
          ...kid,
          tasks: kid.tasks.map((task) => {
            if (!task.timerRunning || task.timerSeconds <= 0) return task;
            if (task.timerSeconds === 1) {
              beeped = true;
              return { ...task, timerSeconds: 0, timerRunning: false, expired: true };
            }
            return { ...task, timerSeconds: task.timerSeconds - 1 };
          }),
        }));
        return {
          ...prev,
          kids,
          beepCounter: beeped ? prev.beepCounter + 1 : prev.beepCounter,
        };
      });
    }, 1000);
    return () => clearInterval(id);
  }, [setState]);

  // Beep effect — fire only when beepCounter actually increments (not on first render)
  const prevBeepCounter = useRef(null);
  useEffect(() => {
    if (prevBeepCounter.current === null) {
      prevBeepCounter.current = state.beepCounter;
      return;
    }
    if (state.beepCounter !== prevBeepCounter.current) {
      prevBeepCounter.current = state.beepCounter;
      playBeep();
    }
  }, [state.beepCounter]);

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

  if (session.role === null) {
    return (
      <LoginScreen
        kids={kids}
        onLoginKid={(kidId) => login("kid", kidId)}
        onLoginParent={() => login("parent")}
        onAddKid={addKid}
      />
    );
  }

  if (session.role === "kid") {
    const kid = kids.find((k) => k.id === session.kidId);
    if (!kid) {
      logout();
      return null;
    }
    return (
      <KidApp
        kid={kid}
        onLogout={logout}
        onProposeTask={(taskData) => proposeTask(session.kidId, taskData)}
        onStartTimer={(taskId) => startTimer(session.kidId, taskId)}
        onStopTimer={(taskId) => stopTimer(session.kidId, taskId)}
        onSetPhoto={(taskId, dataUrl) => setPhoto(session.kidId, taskId, dataUrl)}
        onClearPhoto={(taskId) => clearPhoto(session.kidId, taskId)}
        onMarkComplete={(taskId) => markComplete(session.kidId, taskId)}
      />
    );
  }

  if (session.role === "parent") {
    const activeKid =
      kids.find((k) => k.id === selectedKidId) || kids[0] || null;
    return (
      <ParentApp
        kids={kids}
        activeKid={activeKid}
        onLogout={logout}
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
    );
  }

  return null;
}
