export type ReportStatus = 'Submitted' | 'Under Review' | 'In Progress' | 'Resolved';

export type ReportPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export type IssueCategory =
  | 'Potholes & Road Damage'
  | 'Streetlights & Electrical'
  | 'Sanitation & Illegal Dumping'
  | 'Water, Sewer & Drainage'
  | 'Parks & Public Facilities'
  | 'Traffic & Pedestrian Safety'
  | 'Graffiti & Vandalism'
  | 'Other Community Issues';

export interface AIRecommendation {
  suggestedCategory: IssueCategory;
  suggestedPriority: ReportPriority;
  confidence: number;
  explanation: string;
  recommendedAction: string;
  detectedUrgencyFlags?: string[];
  isLiveAi?: boolean;
}

export interface StatusHistoryItem {
  id: string;
  status: ReportStatus;
  timestamp: string;
  updatedBy: string;
  updatedByEmail?: string;
  notes: string;
}

export interface Report {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  location: string;
  latitude?: number;
  longitude?: number;
  imageUrl?: string;
  priority: ReportPriority;
  status: ReportStatus;
  userId: string;
  userEmail: string;
  userName: string;
  isPublic: boolean;
  aiRecommendation?: AIRecommendation;
  statusHistory: StatusHistoryItem[];
  createdAt: string;
  updatedAt: string;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export interface AIAnalysisRequest {
  title?: string;
  description: string;
  location?: string;
  category?: string;
  imageBase64?: string;
  mimeType?: string;
}

export interface AIAnalysisResponse {
  category: IssueCategory;
  priority: ReportPriority;
  confidence: number;
  explanation: string;
  recommendedAction: string;
  detectedUrgencyFlags: string[];
  isLiveAi: boolean;
  error?: string;
}

export interface AICommunitySummaryResponse {
  summary: string;
  keyThemes: {
    theme: string;
    affectedAreas: string;
    recommendedCivicAction: string;
  }[];
  isLiveAi: boolean;
}

export interface EmailNotification {
  id: string;
  recipientEmail: string;
  recipientName: string;
  recipientUserId: string;
  reportId: string;
  reportTitle: string;
  previousStatus: ReportStatus;
  newStatus: ReportStatus;
  subject: string;
  message: string;
  dispatcherName: string;
  read: boolean;
  sentAt: string;
}

