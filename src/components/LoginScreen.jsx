import { useState } from "react";

export default function LoginScreen({ kids, onLoginKid, onLoginParent, onAddKid, onOpenSettings }) {
  const [newKidName, setNewKidName] = useState("");

  function handleAddKid() {
    const name = newKidName.trim();
    if (!name) return;
    onAddKid(name);
    setNewKidName("");
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") handleAddKid();
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 w-full max-w-sm relative">
        {onOpenSettings && (
          <button
            onClick={onOpenSettings}
            aria-label="Open settings"
            className="absolute top-3 right-3 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 text-xl leading-none w-9 h-9 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition flex items-center justify-center"
          >
            <span aria-hidden="true">⚙</span>
          </button>
        )}
        <h1 className="text-3xl font-bold text-center mb-1 text-slate-800 dark:text-slate-100">StartNow</h1>
        <p className="text-slate-500 dark:text-slate-400 text-center mb-6">Who&apos;s using the app?</p>

        <div className="space-y-2 mb-4">
          {kids.map((kid) => (
            <button
              key={kid.id}
              onClick={() => onLoginKid(kid.id)}
              className="w-full bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl py-3 text-lg transition"
            >
              {kid.name}
            </button>
          ))}
        </div>

        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Add a kid…"
            value={newKidName}
            onChange={(e) => setNewKidName(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
          <button
            onClick={handleAddKid}
            className="bg-black text-white rounded-xl px-4 py-2 text-sm font-medium transition hover:bg-slate-800"
          >
            Add
          </button>
        </div>

        <hr className="my-4 border-slate-200 dark:border-slate-700" />

        <button
          onClick={onLoginParent}
          className="w-full border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-xl py-3 font-medium transition hover:bg-slate-50 dark:hover:bg-slate-700"
        >
          Parent
        </button>
      </div>
    </div>
  );
}
