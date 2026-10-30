export type Language = 'en' | 'te' | 'hi';

export type UserRole = 'citizen' | 'admin';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  createdAt: string;
}

export interface GovernmentService {
  serviceId: string;
  name: string;
  teluguName?: string;
  hindiName?: string;
  category: string;
  department: string;
  description: string;
  eligibility: string;
  requiredDocuments: string[];
  procedure: string;
  officialSource: string;
  lastReviewed: string;
  helpline: string;
  fee: string;
  turnaroundTime: string;
}

export type GrievancePriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export type GrievanceStatus = 'Submitted' | 'Acknowledged' | 'In Progress' | 'Resolved' | 'Closed';

export interface PotentialDuplicateMatch {
  referenceId: string;
  subject: string;
  score: number;
  reason: string;
}

export interface Grievance {
  id?: string;
  referenceId: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  subject: string;
  description: string;
  category: string;
  department: string;
  location: string;
  landmark?: string;
  pincode?: string;
  priority: GrievancePriority;
  status: GrievanceStatus;
  attachmentUrl?: string;
  resolutionNotes?: string;
  duplicateOf?: string;
  isDuplicateFlagged?: boolean;
  potentialDuplicates?: PotentialDuplicateMatch[];
  createdAt: string;
  updatedAt: string;
}

export interface StatusHistory {
  id?: string;
  grievanceId: string;
  referenceId?: string;
  status: GrievanceStatus | string;
  note: string;
  updatedBy: string;
  timestamp: string;
}

export interface Feedback {
  id?: string;
  userId: string;
  grievanceId: string;
  referenceId?: string;
  rating: number;
  comments: string;
  createdAt: string;
}

export interface SourceReference {
  name: string;
  url: string;
  department: string;
  lastReviewed: string;
}

export interface GrievanceSuggestion {
  category: string;
  department: string;
  title: string;
  priority: GrievancePriority;
  rationale: string;
  locationHint?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  language?: Language;
  sources?: SourceReference[];
  grievanceSuggestion?: GrievanceSuggestion;
}
