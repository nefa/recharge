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
