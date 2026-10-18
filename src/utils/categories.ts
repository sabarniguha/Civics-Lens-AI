import { IssueCategory, ReportPriority, ReportStatus } from '../types';

export interface CategoryInfo {
  name: IssueCategory;
  iconName: string;
  color: string;
  bgLight: string;
  borderColor: string;
  department: string;
}

export const CATEGORIES_CONFIG: Record<IssueCategory, CategoryInfo> = {
  'Potholes & Road Damage': {
    name: 'Potholes & Road Damage',
    iconName: 'Construction',
    color: 'text-amber-700',
    bgLight: 'bg-amber-50',
    borderColor: 'border-amber-200',
    department: 'Department of Public Works — Streets Division',
  },
  'Streetlights & Electrical': {
    name: 'Streetlights & Electrical',
    iconName: 'Zap',
    color: 'text-yellow-700',
    bgLight: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    department: 'Municipal Electrical & Lighting Authority',
  },
  'Sanitation & Illegal Dumping': {
    name: 'Sanitation & Illegal Dumping',
    iconName: 'Trash2',
    color: 'text-orange-700',
    bgLight: 'bg-orange-50',
    borderColor: 'border-orange-200',
    department: 'Bureau of Sanitation & Waste Management',
  },
  'Water, Sewer & Drainage': {
    name: 'Water, Sewer & Drainage',
    iconName: 'Droplets',
    color: 'text-blue-700',
    bgLight: 'bg-blue-50',
    borderColor: 'border-blue-200',
    department: 'City Water Resources & Stormwater Agency',
  },
  'Parks & Public Facilities': {
    name: 'Parks & Public Facilities',
    iconName: 'Trees',
    color: 'text-emerald-700',
    bgLight: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    department: 'Parks, Recreation & Civic Amenities',
  },
  'Traffic & Pedestrian Safety': {
    name: 'Traffic & Pedestrian Safety',
    iconName: 'AlertTriangle',
    color: 'text-rose-700',
    bgLight: 'bg-rose-50',
    borderColor: 'border-rose-200',
    department: 'Department of Transportation (DOT)',
  },
  'Graffiti & Vandalism': {
    name: 'Graffiti & Vandalism',
    iconName: 'Paintbrush',
    color: 'text-purple-700',
    bgLight: 'bg-purple-50',
    borderColor: 'border-purple-200',
    department: 'Community Blight Abatement Program',
  },
  'Other Community Issues': {
    name: 'Other Community Issues',
    iconName: 'HelpCircle',
    color: 'text-slate-700',
    bgLight: 'bg-slate-50',
    borderColor: 'border-slate-200',
    department: 'City 311 Citizen Services Triage',
  },
};

export const PRIORITY_CONFIG: Record<ReportPriority, { label: string; badge: string; dot: string; text: string }> = {
  Low: {
    label: 'Low Priority',
    badge: 'bg-slate-100 text-slate-700 border-slate-200',
    dot: 'bg-slate-400',
    text: 'Scheduled routine maintenance',
  },
  Medium: {
    label: 'Medium Priority',
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
    dot: 'bg-blue-500',
    text: 'Assigned within 3-5 business days',
  },
  High: {
    label: 'High Priority',
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
    text: 'Active hazard — 24 to 48 hr dispatch',
  },
  Critical: {
    label: 'Critical Urgent',
    badge: 'bg-rose-50 text-rose-700 border-rose-200',
    dot: 'bg-rose-500 animate-pulse',
    text: 'Immediate emergency dispatch',
  },
};

export const STATUS_CONFIG: Record<ReportStatus, { label: string; step: number; color: string; bg: string; border: string }> = {
  Submitted: {
    label: 'Submitted',
    step: 1,
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
  },
  'Under Review': {
    label: 'Under Review',
    step: 2,
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
  },
  'In Progress': {
    label: 'In Progress',
    step: 3,
    color: 'text-indigo-700',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
  },
  Resolved: {
    label: 'Resolved',
    step: 4,
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
  },
};
