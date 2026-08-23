import { FolderKanban } from 'lucide-react'

const projects = [
  { title: 'Predict customer churn', level: 'Intermediate', tag: 'SQL + Python' },
  { title: 'Build a sales dashboard from raw data', level: 'Beginner', tag: 'Tableau' },
  { title: 'A/B test a pricing change', level: 'Intermediate', tag: 'Statistics' },
]

// Illustrative — no real project library exists yet. Same honesty
// standard as CareerPathPreview: framed in ProductFrame as "preview",
// generic sample titles, not presented as a real catalog.
export default function ProjectsPreview() {
  return (
    <div>
      <div className="flex items-center gap-2 mb-5">
        <FolderKanban size={16} className="text-accent" aria-hidden="true" />
        <span className="text-sm font-medium">Practice projects</span>
      </div>
      <div className="flex flex-col gap-2.5">
        {projects.map((p) => (
          <div key={p.title} className="flex items-center justify-between gap-3 bg-bg-elevated rounded-md px-4 py-3">
            <span className="text-sm text-text-primary">{p.title}</span>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="font-mono text-[10px] text-text-tertiary">{p.tag}</span>
              <span className="font-mono text-[10px] uppercase text-text-tertiary border border-border-default rounded-full px-2 py-0.5">{p.level}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
