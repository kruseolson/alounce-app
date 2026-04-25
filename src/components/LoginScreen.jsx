import { useState } from "react";

export default function LoginScreen({ kids, onLoginKid, onLoginParent, onAddKid }) {
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
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
        <h1 className="text-3xl font-bold text-center mb-1">StartNow</h1>
        <p className="text-slate-500 text-center mb-6">Who&apos;s using the app?</p>

        <div className="space-y-2 mb-4">
          {kids.map((kid) => (
            <button
              key={kid.id}
              onClick={() => onLoginKid(kid.id)}
              className="w-full bg-slate-100 hover:bg-slate-200 rounded-xl py-3 text-lg transition"
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
            className="flex-1 border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
          <button
            onClick={handleAddKid}
            className="bg-black text-white rounded-xl px-4 py-2 text-sm font-medium transition hover:bg-slate-800"
          >
            Add
          </button>
        </div>

        <hr className="my-4 border-slate-200" />

        <button
          onClick={onLoginParent}
          className="w-full border border-slate-300 text-slate-700 rounded-xl py-3 font-medium transition hover:bg-slate-50"
        >
          Parent
        </button>
      </div>
    </div>
  );
}
