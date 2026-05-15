import { IconSearch } from "@/components/Icons";

export function SearchInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="flex h-12 w-full max-w-xl items-center gap-4 rounded-full border border-black/5 bg-black/[0.02] px-6 shadow-sm ring-1 ring-inset ring-white/50 backdrop-blur-md transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] focus-within:-translate-y-0.5 focus-within:bg-white focus-within:shadow-md hover:bg-black/[0.04]">
      <IconSearch className="h-5 w-5 text-black/40 transition-colors duration-300 group-focus-within:text-uniclaretiana-yellow" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="none"
        spellCheck={false}
        name={`search-${placeholder.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
        className="h-full w-full bg-transparent text-sm font-semibold tracking-wide text-black outline-none placeholder:font-medium placeholder:text-black/40"
      />
    </div>
  );
}
