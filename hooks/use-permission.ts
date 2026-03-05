import { useAuth } from "@/lib/contexts";
import { User } from "@/lib/auth";

export type PermissionKey = 'can_process_momo' | 'can_process_mobcash' | 'can_process_bulk_payment' | 'can_use_transfer' | 'can_process_ussd_transaction';

/**
 * Hook to check if a user has a specific permission.
 * Follows the "Fetch-and-Gate" pattern from the Comprehensive Guide.
 * Defaults to true if the permission key is missing or null.
 */
export const usePermission = (key: PermissionKey): boolean => {
  const { user } = useAuth();
  
  if (!user) return false;
  
  // Cast to any to access the key dynamically, as the interface might have optional properties
  const permissionValue = (user as any)[key];
  
  // Logic: treat null or undefined as true (Fall-back logic)
  return permissionValue ?? true;
};
