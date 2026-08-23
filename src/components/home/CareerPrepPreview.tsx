import { FileText, ClipboardList, Award } from 'lucide-react'

const items = [
  { icon: FileText, label: 'Resume', status: 'Reviewed' },
  { icon: ClipboardList, label: 'Portfolio', status: 'In progress' },
  { icon: Award, label: 'Interview readiness', status: 'Not started' },
]

// Illustrative — no real resume/interview-prep tooling exists yet.
export default function CareerPrepPreview() {
  return (
    <div>
      <div className="flex items-center gap-2 mb-5">
        <ClipboardList size={16} className="text-accent" aria-hidden="true" />
        <span className="text-sm font-medium">Career readiness</span>
      </div>
      <div className="flex flex-col gap-2.5">
        {items.map(({ icon: Icon, label, status }) => (
          <div key={label} className="flex items-center justify-between gap-3 bg-bg-elevated rounded-md px-4 py-3">
            <div className="flex items-center gap-2.5">
              <Icon size={15} className="text-text-tertiary" aria-hidden="true" />
              <span className="text-sm text-text-primary">{label}</span>
            </div>
            <span className="font-mono text-[10px] uppercase text-text-tertiary">{status}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
