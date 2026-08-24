// Friendly labels for the raw crawler `fn` values, shared across JobCard,
// JobFilters, the Companies-hiring discovery module, and the Companies
// page — was previously defined only inside JobFilters.tsx, now needed
// in several places. NOTE: "Analytics" and "Data science" cannot be
// split — crawler.js's detectFn() maps both to the same fn: 'data'
// bucket. See design doc for the full reasoning.
export const FN_LABELS: Record<string, string> = {
  data: 'Analytics',
  product: 'Product',
  engineering: 'Engineering',
  bizops: 'Business',
  finance: 'Finance',
  design: 'Design',
}

export function fnLabel(fn: string): string {
  return FN_LABELS[fn] || fn
}
