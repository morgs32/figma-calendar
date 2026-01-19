export const eventColors = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-indigo-500",
  "bg-cyan-500",
  "bg-violet-500",
  "bg-fuchsia-500",
  "bg-pink-500",
  "bg-lime-500",
  "bg-teal-500",
  "bg-sky-500",
  "bg-orange-500",
  "bg-red-500",
  "bg-yellow-500",
  "bg-green-500",
  "bg-slate-500",
  "bg-stone-500",
  "bg-zinc-500",
  "bg-purple-500",
  "bg-blue-400",
  "bg-emerald-400",
]

const hashString = (value: string) => {
  let hash = 0
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + (value.codePointAt(i) ?? 0)
    hash = Math.trunc(hash)
  }
  return Math.abs(hash)
}

export const getEventColor = (seed: string) => {
  return eventColors[hashString(seed) % eventColors.length]
}
