/*
# Restrict role helper functions

## Security changes
- Removes default PUBLIC execution on both role-checking functions.
- Allows only authenticated callers to invoke admin role helpers.
- Prevents anonymous callers from probing or invoking role logic.
*/

REVOKE ALL ON FUNCTION is_admin() FROM PUBLIC;
REVOKE ALL ON FUNCTION is_admin() FROM anon;
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;

REVOKE ALL ON FUNCTION request_admin_role(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION request_admin_role(text) FROM anon;
GRANT EXECUTE ON FUNCTION request_admin_role(text) TO authenticated;