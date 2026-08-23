import { ArrowRight } from 'lucide-react'

export default function AITransition() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="border border-border-subtle rounded-md p-6">
        <div className="font-mono text-[10px] uppercase tracking-wide text-text-tertiary mb-4">Old analytics</div>
        <div className="flex flex-wrap items-center gap-2 text-text-secondary">
          <Step>SQL</Step>
          <ArrowRight size={14} className="text-text-tertiary" aria-hidden="true" />
          <Step>Dashboard</Step>
          <ArrowRight size={14} className="text-text-tertiary" aria-hidden="true" />
          <Step>Report</Step>
        </div>
      </div>
      <div className="border border-accent-border rounded-md p-6 bg-accent-soft">
        <div className="font-mono text-[10px] uppercase tracking-wide text-accent mb-4">Evolving analytics</div>
        <div className="flex flex-wrap items-center gap-2 text-text-primary">
          <Step accent>Problem framing</Step>
          <ArrowRight size={14} className="text-accent" aria-hidden="true" />
          <Step accent>Data</Step>
          <ArrowRight size={14} className="text-accent" aria-hidden="true" />
          <Step accent>AI-assisted analysis</Step>
          <ArrowRight size={14} className="text-accent" aria-hidden="true" />
          <Step accent>Judgment</Step>
          <ArrowRight size={14} className="text-accent" aria-hidden="true" />
          <Step accent>Business impact</Step>
        </div>
      </div>
    </div>
  )
}

function Step({ children, accent = false }: { children: string; accent?: boolean }) {
  return (
    <span className={`text-sm px-3 py-1.5 rounded-full border ${accent ? 'border-accent-border bg-bg-surface text-text-primary' : 'border-border-default bg-bg-surface'}`}>
      {children}
    </span>
  )
}
