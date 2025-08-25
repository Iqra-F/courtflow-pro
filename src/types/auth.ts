export enum UserRole {
  ADMIN = 'ADMIN',
  JUDGE = 'JUDGE',
  ATTORNEY = 'ATTORNEY',
  CLERK = 'CLERK',
  PUBLIC = 'PUBLIC'
}

export enum CaseStatus {
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  CLOSED = 'CLOSED'
}

export enum FilingStatus {
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED'
}

export enum ParticipantRole {
  PLAINTIFF = 'PLAINTIFF',
  DEFENDANT = 'DEFENDANT',
  ATTORNEY = 'ATTORNEY',
  JUDGE = 'JUDGE',
  CLERK = 'CLERK',
  OBSERVER = 'OBSERVER'
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  active: boolean;
  createdAt: Date;
}

export interface Case {
  id: string;
  caseNumber: string;
  title: string;
  type: string;
  status: CaseStatus;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  createdById: string;
  assignedJudgeId?: string;
  filedAt: Date;
  closedAt?: Date;
  participants?: CaseParticipant[];
  filings?: Filing[];
}

export interface CaseParticipant {
  id: string;
  caseId: string;
  userId: string;
  roleInCase: ParticipantRole;
  createdAt: Date;
  user?: User;
}

export interface Filing {
  id: string;
  caseId: string;
  submittedById: string;
  filingType: string;
  description: string;
  submittedAt: Date;
  status: FilingStatus;
  reviewedById?: string;
  reviewNotes?: string;
  documents?: Document[];
}

export interface Document {
  id: string;
  caseId: string;
  uploadedById: string;
  originalName: string;
  mimeType: string;
  size: number;
  storageKey: string;
  visibility: 'PARTIES_ONLY' | 'COURT_ONLY' | 'PUBLIC';
  uploadedAt: Date;
}

export interface Hearing {
  id: string;
  caseId: string;
  startAt: Date;
  endAt: Date;
  courtroom: string;
  status: 'SCHEDULED' | 'RESCHEDULED' | 'CANCELLED' | 'HELD';
  createdById: string;
  case?: Case;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}