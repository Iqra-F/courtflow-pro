import { UserRole } from '@/types/auth';

// RBAC permissions matrix
export const PERMISSIONS = {
  // User management
  'users:create': ['ADMIN'],
  'users:read': ['ADMIN', 'JUDGE', 'CLERK'],
  'users:update': ['ADMIN'],
  'users:delete': ['ADMIN'],
  'users:assign_roles': ['ADMIN'],

  // Case management
  'cases:create': ['ATTORNEY', 'PUBLIC'],
  'cases:read': ['ADMIN', 'JUDGE', 'CLERK', 'ATTORNEY', 'PUBLIC'],
  'cases:update': ['ADMIN', 'JUDGE', 'CLERK'],
  'cases:delete': ['ADMIN'],
  'cases:assign_judge': ['ADMIN', 'CLERK'],

  // Filing management
  'filings:create': ['ATTORNEY', 'PUBLIC', 'CLERK', 'JUDGE'],
  'filings:read': ['ADMIN', 'JUDGE', 'CLERK', 'ATTORNEY', 'PUBLIC'],
  'filings:review': ['CLERK'],
  'filings:approve': ['CLERK'],
  'filings:reject': ['CLERK'],

  // Document management
  'documents:upload': ['ATTORNEY', 'PUBLIC', 'CLERK', 'JUDGE'],
  'documents:read': ['ADMIN', 'JUDGE', 'CLERK', 'ATTORNEY', 'PUBLIC'],
  'documents:delete': ['ADMIN', 'JUDGE', 'CLERK'],

  // Hearing management
  'hearings:create': ['JUDGE', 'CLERK'],
  'hearings:read': ['ADMIN', 'JUDGE', 'CLERK', 'ATTORNEY', 'PUBLIC'],
  'hearings:update': ['JUDGE', 'CLERK'],
  'hearings:delete': ['JUDGE', 'CLERK'],

  // Calendar management
  'calendar:read': ['ADMIN', 'JUDGE', 'CLERK', 'ATTORNEY', 'PUBLIC'],
  'calendar:manage': ['ADMIN', 'JUDGE', 'CLERK'],

  // Search
  'search:all': ['ADMIN', 'JUDGE', 'CLERK'],
  'search:public': ['ATTORNEY', 'PUBLIC'],

  // Reports and analytics
  'reports:view': ['ADMIN'],
  'reports:export': ['ADMIN'],

  // System settings
  'settings:read': ['ADMIN'],
  'settings:update': ['ADMIN'],

  // Audit logs
  'audit:read': ['ADMIN'],

  // Admin panel
  'admin:access': ['ADMIN'],
} as const;

export type Permission = keyof typeof PERMISSIONS;

export function hasPermission(userRole: UserRole, permission: Permission): boolean {
  const allowedRoles = PERMISSIONS[permission];
  return (allowedRoles as readonly UserRole[]).includes(userRole);
}

export function checkPermissions(userRole: UserRole, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(userRole, permission));
}

// Special constraints based on business rules
export const CONSTRAINTS = {
  // Admin cannot file cases or upload case documents
  canFileCase: (role: UserRole) => !['ADMIN'].includes(role),
  canUploadCaseDocument: (role: UserRole) => !['ADMIN'].includes(role),
  
  // Only ATTORNEY and PUBLIC can register themselves
  canSelfRegister: (role: UserRole) => ['ATTORNEY', 'PUBLIC'].includes(role),
  
  // Only ADMIN can create JUDGE and CLERK accounts
  canCreateRole: (creatorRole: UserRole, targetRole: UserRole) => {
    if (['JUDGE', 'CLERK'].includes(targetRole)) {
      return creatorRole === 'ADMIN';
    }
    return ['ATTORNEY', 'PUBLIC'].includes(targetRole);
  },
};

// Object-level permission helpers
export function canAccessCase(userRole: UserRole, caseData: any, userId: string): boolean {
  // Admin and Clerk can access all cases
  if (['ADMIN', 'CLERK'].includes(userRole)) {
    return true;
  }

  // Judge can access assigned cases
  if (userRole === 'JUDGE' && caseData.assigned_judge_id === userId) {
    return true;
  }

  // Creator can access their own cases
  if (caseData.created_by_id === userId) {
    return true;
  }

  // Participants can access cases they're involved in
  if (caseData.participants?.some((p: any) => p.user_id === userId)) {
    return true;
  }

  return false;
}

export function canAccessDocument(userRole: UserRole, documentData: any, userId: string, caseData: any): boolean {
  // First check if user can access the case
  if (!canAccessCase(userRole, caseData, userId)) {
    return false;
  }

  // Check document visibility
  switch (documentData.visibility) {
    case 'PUBLIC':
      return true;
    case 'COURT_ONLY':
      return ['ADMIN', 'JUDGE', 'CLERK'].includes(userRole);
    case 'PARTIES_ONLY':
      return canAccessCase(userRole, caseData, userId);
    default:
      return false;
  }
}