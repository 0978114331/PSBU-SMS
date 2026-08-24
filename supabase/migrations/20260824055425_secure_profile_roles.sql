/*
# Secure profile role changes

## Overview
Moves admin role assignment out of browser-writable profile updates.

## Security changes
- Authenticated users may update only their own full_name, not role.
- Adds `request_admin_role(p_code)` as a SECURITY DEFINER function.
- The function validates the secret on the database server and updates only the caller's profile.
- Anonymous users cannot execute the function.

## Important notes
1. Existing admin profiles keep their current role.
2. Normal users can still edit their own display name through the profile table.
3. Role authorization remains enforced by the existing `is_admin()` policies.
*/

REVOKE UPDATE ON profiles FROM authenticated;
GRANT UPDATE (full_name) ON profiles TO authenticated;

CREATE OR REPLACE FUNCTION request_admin_role(p_code text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_code <> 'KHOUVCHVEA-09781' THEN
    RETURN false;
  END IF;
  UPDATE profiles SET role = 'admin' WHERE id = auth.uid();
  RETURN FOUND;
END;
$$;

REVOKE EXECUTE ON FUNCTION request_admin_role(text) FROM anon;
GRANT EXECUTE ON FUNCTION request_admin_role(text) TO authenticated;