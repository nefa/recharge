// Roles
export enum Role {
  Admin = 'admin',
  Manager = 'manager',
  Employee = 'employee',
}

// Leave request lifecycle
export enum LeaveStatus {
  Pending = 'pending',
  Approved = 'approved',
  Declined = 'declined',
  Cancelled = 'cancelled',
}

// Leave type categories (Romanian defaults)
export enum LeaveCategory {
  Annual = 'annual',          // Concediu de odihnă
  Sick = 'sick',             // Concediu medical
  Unpaid = 'unpaid',         // Concediu fără plată
  Personal = 'personal',     // Învoire / Zi liberă
  Maternity = 'maternity',   // Concediu de maternitate
  Paternity = 'paternity',   // Concediu de paternitate
}

// --- API Request DTOs ---

export interface RegisterDto {
  companyName: string;
  name: string;
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface CreateLeaveRequestDto {
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  note?: string;
}

export interface UpdateLeaveRequestDto {
  status: LeaveStatus.Approved | LeaveStatus.Declined;
}

export interface CreateDepartmentDto {
  name: string;
  managerId?: string;
}

export interface UpdateDepartmentDto {
  name?: string;
  managerId?: string | null;
}

export interface CreateInviteDto {
  email: string;
  role?: Role;
}

export interface AcceptInviteDto {
  name: string;
  password: string;
}

export interface CreateLeaveTypeDto {
  name: string;
  color?: string;
  requiresApproval?: boolean;
  isPaid?: boolean;
  defaultDays?: number;
}

export interface UpdateLeaveTypeDto {
  name?: string;
  color?: string;
  requiresApproval?: boolean;
  isPaid?: boolean;
  defaultDays?: number;
}

// --- API Response Types ---

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: Role;
  companyId: string;
  departmentId: string | null;
  companyName: string;
}

export interface LeaveBalanceResponse {
  id: string;
  leaveTypeId: string;
  leaveTypeName: string;
  leaveTypeColor: string;
  year: number;
  allowanceDays: number;
  usedDays: number;
  remainingDays: number;
}

export interface LeaveRequestResponse {
  id: string;
  userId: string;
  userName: string;
  leaveTypeId: string;
  leaveTypeName: string;
  leaveTypeColor: string;
  startDate: string;
  endDate: string;
  workingDays: number;
  status: LeaveStatus;
  note: string | null;
  approverId: string | null;
  approverName: string | null;
  decidedAt: string | null;
  createdAt: string;
}

export interface LeaveTypeResponse {
  id: string;
  name: string;
  color: string;
  requiresApproval: boolean;
  isPaid: boolean;
  defaultDays: number;
}

export interface DepartmentResponse {
  id: string;
  name: string;
  managerId: string | null;
  managerName: string | null;
  memberCount: number;
}

export interface DashboardMyResponse {
  user: UserProfile;
  balances: LeaveBalanceResponse[];
  upcomingRequests: LeaveRequestResponse[];
  recentRequests: LeaveRequestResponse[];
}

export interface DashboardTeamResponse {
  pendingRequests: LeaveRequestResponse[];
  teamOnLeaveToday: {
    userId: string;
    userName: string;
    leaveType: string;
    leaveColor: string;
  }[];
  departmentSummary: {
    departmentName: string;
    memberCount: number;
    onLeaveCount: number;
  }[];
}

export interface PublicHolidayResponse {
  id: string;
  date: string;
  name: string;
  year: number;
}

export interface WallchartDay {
  date: string;
  type: 'leave' | 'holiday' | 'weekend' | null;
  leaveType?: string;
  leaveColor?: string;
  holidayName?: string;
}

export interface WallchartEntry {
  userId: string;
  userName: string;
  departmentName: string | null;
  days: WallchartDay[];
}

export interface AuthResponse {
  accessToken: string;
  user: UserProfile;
}

export interface InviteValidationResponse {
  email: string;
  companyName: string;
  role: Role;
}
