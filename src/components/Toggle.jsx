export default function Toggle({ checked, onChange, label, description, disabled = false }) {
  return (
    <label
      className={`flex items-start gap-3 ${disabled ? "opacity-60" : "cursor-pointer"}`}
    >
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => {
          if (!disabled) onChange(!checked);
        }}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 ${
          checked
            ? "bg-green-500"
            : "bg-slate-200 dark:bg-slate-600"
        } ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
      <div className="flex-1 min-w-0">
        {label && (
          <div className="text-sm font-medium text-slate-700 dark:text-slate-200">
            {label}
          </div>
        )}
        {description && (
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {description}
          </div>
        )}
      </div>
    </label>
  );
}
