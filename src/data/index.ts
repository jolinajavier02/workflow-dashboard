export const STAGES = [
  { number: 0, name: 'Lead Received', owner: 'SALES_MANAGER', sla_hours: -1 },
  { number: 1, name: 'R&D Preparation (In Progress)', owner: 'RND_MANAGER', sla_hours: -1 },
  { number: 2, name: 'Packing Manager Preparing (In Progress)', owner: 'PACKAGING_MANAGER', sla_hours: -1 },
  { number: 3, name: 'Sales Preparing to Dispatch', owner: 'SALES_MANAGER', sla_hours: -1 },
  { number: 4, name: 'Project Manager Closing the Lead', owner: 'PROJECT_MANAGER', sla_hours: -1 },
] as const;

export const STAGE_COLUMNS = [
  { id: 'new', name: 'New', stages: [0], color: 'slate' },
  { id: 'rnd', name: 'R&D', stages: [1], color: 'amber' },
  { id: 'packaging', name: 'Packaging', stages: [2], color: 'purple' },
  { id: 'dispatch', name: 'Dispatch', stages: [3], color: 'teal' },
  { id: 'closing', name: 'Closing', stages: [4], color: 'blue' },
];
