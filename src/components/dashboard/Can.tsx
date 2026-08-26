import type { ReactNode } from "react";
import { can, type Permission, type Role } from "@/lib/permissions";

interface CanProps {
  role: Role | undefined | null;
  permission: Permission;
  children: ReactNode;
  fallback?: ReactNode;
}

// Frontend-only gate for UX (hiding nav/actions a role shouldn't see).
// Supabase RLS is the real security boundary - see supabase_schema.sql.
export function Can({ role, permission, children, fallback = null }: CanProps) {
  return can(role, permission) ? <>{children}</> : <>{fallback}</>;
}
