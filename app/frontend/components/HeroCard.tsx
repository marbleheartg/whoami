import clsx from "clsx"
import { ReactNode } from "react"

type HeroCardProps = {
  icon: string
  title: string
  value?: ReactNode
  subtitle?: ReactNode
  children?: ReactNode
  isLoading?: boolean
  mono?: boolean
}

export default function HeroCard({ icon, title, value, subtitle, children, isLoading, mono }: HeroCardProps) {
  return (
    <div className={clsx("p-5", "bg-white/10 glass rounded-2xl", "overflow-hidden relative")}>
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">{icon}</span>
          <span className="text-xs uppercase tracking-widest opacity-60">{title}</span>
        </div>
        {isLoading ? (
          <div className="h-8 bg-white/10 rounded animate-pulse w-48" />
        ) : value ? (
          <div className={clsx("text-2xl font-black text-(--heading) tracking-tight", mono && "font-mono")}>{value}</div>
        ) : null}
        {subtitle && <div className="mt-2 text-sm opacity-70">{subtitle}</div>}
        {children && <div className="mt-3">{children}</div>}
      </div>
    </div>
  )
}

export function InfoRow({ label, value, mono }: { label: string; value?: ReactNode; mono?: boolean }) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-white/5 last:border-0">
      <span className="text-xs opacity-50">{label}</span>
      <span className={clsx("text-sm text-(--heading)", mono && "font-mono")}>{value || "—"}</span>
    </div>
  )
}

export function StatGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-2 gap-3">{children}</div>
}

export function StatBox({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex flex-col items-center p-3 bg-white/5 rounded-xl">
      <span className="text-xl font-black text-(--heading)">{value}</span>
      <span className="text-[10px] opacity-50 uppercase tracking-wider">{label}</span>
    </div>
  )
}
