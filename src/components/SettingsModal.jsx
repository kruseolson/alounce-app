import { useRef, useState } from "react";
import Toggle from "./Toggle";

const CURRENCIES = ["$", "£", "€", "¥", "kr"];
const THEMES = [
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
  { id: "system", label: "System" },
];

function SectionHeading({ children }) {
  return (
    <h3 className="uppercase tracking-wide text-xs text-slate-500 dark:text-slate-400 font-semibold">
      {children}
    </h3>
  );
}

function Segmented({ options, value, onChange }) {
  return (
    <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-700 p-1 gap-1">
      {options.map((opt) => {
        const id = typeof opt === "object" ? opt.id : opt;
        const label = typeof opt === "object" ? opt.label : opt;
        const active = id === value;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              active
                ? "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-sm"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

export default function SettingsModal({
  open,
  onClose,
  settings,
  onUpdateSettings,
  onExportData,
  onImportData,
  onClearData,
}) {
  const fileInputRef = useRef(null);
  const [notifDenied, setNotifDenied] = useState(
    typeof Notification !== "undefined" && Notification.permission === "denied"
  );

  if (!open) return null;

  function handleNotificationsToggle(next) {
    if (!next) {
      onUpdateSettings({ notificationsEnabled: false });
      return;
    }
    if (typeof Notification === "undefined") {
      onUpdateSettings({ notificationsEnabled: false });
      return;
    }
    if (Notification.permission === "granted") {
      onUpdateSettings({ notificationsEnabled: true });
      return;
    }
    if (Notification.permission === "denied") {
      setNotifDenied(true);
      onUpdateSettings({ notificationsEnabled: false });
      return;
    }
    Notification.requestPermission().then((perm) => {
      if (perm === "granted") {
        setNotifDenied(false);
        onUpdateSettings({ notificationsEnabled: true });
      } else {
        if (perm === "denied") setNotifDenied(true);
        onUpdateSettings({ notificationsEnabled: false });
      }
    });
  }

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  function handleImportChange(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        if (!parsed || typeof parsed !== "object" || typeof parsed.version === "undefined") {
          window.alert("Invalid backup file: missing version field.");
          return;
        }
        if (!window.confirm("Replace ALL current data with the imported file? This cannot be undone.")) {
          return;
        }
        onImportData(parsed);
      } catch (err) {
        window.alert("Could not read backup file: " + (err?.message || "Invalid JSON"));
      }
    };
    reader.readAsText(file);
  }

  function handleClearClick() {
    if (!window.confirm("Are you sure you want to clear ALL data? This cannot be undone.")) {
      return;
    }
    const typed = window.prompt('To confirm, type "DELETE" (uppercase) to wipe all data:');
    if (typed !== "DELETE") {
      window.alert("Cancelled — you did not type DELETE.");
      return;
    }
    onClearData();
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-800 w-full sm:max-w-lg sm:rounded-2xl shadow-xl max-h-[100vh] sm:max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-800 flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Settings</h2>
          <button
            onClick={onClose}
            aria-label="Close settings"
            className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 text-xl leading-none px-2"
          >
            ✕
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Appearance */}
          <section className="space-y-3">
            <SectionHeading>Appearance</SectionHeading>
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Theme</span>
              <Segmented
                options={THEMES}
                value={settings.theme}
                onChange={(v) => onUpdateSettings({ theme: v })}
              />
            </div>
          </section>

          <hr className="border-slate-200 dark:border-slate-700" />

          {/* Sound & Alerts */}
          <section className="space-y-3">
            <SectionHeading>Sound &amp; Alerts</SectionHeading>
            <Toggle
              checked={settings.soundEnabled}
              onChange={(v) => onUpdateSettings({ soundEnabled: v })}
              label="Sound enabled"
              description="Play a beep when a timer expires"
            />
            <Toggle
              checked={settings.vibrationEnabled}
              onChange={(v) => onUpdateSettings({ vibrationEnabled: v })}
              label="Vibration enabled"
              description="Mobile only"
            />
            <Toggle
              checked={settings.tabTitleFlash}
              onChange={(v) => onUpdateSettings({ tabTitleFlash: v })}
              label="Tab title flashes when timer expires"
              description="Updates document title to alert you"
            />
            <Toggle
              checked={settings.alarmLoop}
              onChange={(v) => onUpdateSettings({ alarmLoop: v })}
              label="Alarm loops until acknowledged"
              description="Repeat the beep until the kid acts"
            />
            {settings.alarmLoop && (
              <div className="pl-14">
                <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">
                  Alarm loop duration: {settings.alarmLoopSeconds}s
                </label>
                <input
                  type="range"
                  min="5"
                  max="60"
                  step="1"
                  value={settings.alarmLoopSeconds}
                  onChange={(e) =>
                    onUpdateSettings({ alarmLoopSeconds: Number(e.target.value) })
                  }
                  className="w-full"
                />
              </div>
            )}
            <Toggle
              checked={settings.notificationsEnabled}
              onChange={handleNotificationsToggle}
              label="Browser notifications"
              description="Show a system notification when a timer expires"
            />
            {notifDenied && (
              <div className="text-xs text-yellow-700 dark:text-yellow-300 bg-yellow-100 dark:bg-yellow-900 rounded-xl px-3 py-2">
                Notifications are blocked. To enable, open your browser&apos;s site settings for
                this page and allow notifications, then toggle this on again.
              </div>
            )}
          </section>

          <hr className="border-slate-200 dark:border-slate-700" />

          {/* Defaults */}
          <section className="space-y-3">
            <SectionHeading>Defaults</SectionHeading>
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Default timer (min)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={settings.defaultTimerMinutes}
                onChange={(e) =>
                  onUpdateSettings({
                    defaultTimerMinutes: Math.max(1, Math.min(60, Number(e.target.value) || 1)),
                  })
                }
                className="w-24 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Default reward
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.25"
                value={settings.defaultReward}
                onChange={(e) =>
                  onUpdateSettings({
                    defaultReward: Math.max(0, Math.min(100, Number(e.target.value) || 0)),
                  })
                }
                className="w-24 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Currency</span>
              <Segmented
                options={CURRENCIES}
                value={settings.currency}
                onChange={(v) => onUpdateSettings({ currency: v })}
              />
            </div>
          </section>

          <hr className="border-slate-200 dark:border-slate-700" />

          {/* Behavior */}
          <section className="space-y-3">
            <SectionHeading>Behavior</SectionHeading>
            <Toggle
              checked={settings.showCompletedTasks}
              onChange={(v) => onUpdateSettings({ showCompletedTasks: v })}
              label="Show completed tasks"
              description="Toggle off to hide the Completed section"
            />
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex-1 min-w-0">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-200 block">
                  Penalty for expired tasks
                </label>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Stored only — deduction not yet applied
                </p>
              </div>
              <input
                type="number"
                min="0"
                max="10"
                step="0.25"
                value={settings.expiredPenalty}
                onChange={(e) =>
                  onUpdateSettings({
                    expiredPenalty: Math.max(0, Math.min(10, Number(e.target.value) || 0)),
                  })
                }
                className="w-24 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>
          </section>

          <hr className="border-slate-200 dark:border-slate-700" />

          {/* Data */}
          <section className="space-y-3">
            <SectionHeading>Data</SectionHeading>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={onExportData}
                className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl px-4 py-2 text-sm font-medium transition hover:bg-slate-200 dark:hover:bg-slate-600"
              >
                Export Data
              </button>
              <button
                onClick={handleImportClick}
                className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl px-4 py-2 text-sm font-medium transition hover:bg-slate-200 dark:hover:bg-slate-600"
              >
                Import Data
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json,.json"
                className="hidden"
                onChange={handleImportChange}
              />
              <button
                onClick={handleClearClick}
                className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-xl px-4 py-2 text-sm font-medium transition hover:bg-red-200 dark:hover:bg-red-800"
              >
                Clear All Data
              </button>
            </div>
          </section>

          <hr className="border-slate-200 dark:border-slate-700" />

          {/* About */}
          <section className="space-y-1">
            <SectionHeading>About</SectionHeading>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">StartNow</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Version 0.1.0</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              An anti-procrastination chore &amp; allowance app for families.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-4 flex justify-end">
          <button
            onClick={onClose}
            className="bg-black text-white rounded-xl px-5 py-2 text-sm font-medium transition hover:bg-slate-800"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
