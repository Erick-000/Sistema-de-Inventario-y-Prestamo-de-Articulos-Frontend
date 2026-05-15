type Option = {
  value: string;
  label: string;
};

export function FilterPills({
  options,
  value,
  onChange,
}: {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <select
      className="w-full rounded-xl border border-black/10 bg-white px-4 py-2 text-xs font-semibold text-black/70 sm:max-w-xs"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
