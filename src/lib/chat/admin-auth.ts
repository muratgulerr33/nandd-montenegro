export function requireAdminSecret(request: Request): boolean {
  const secret = process.env.ADMIN_INBOX_SECRET;
  if (!secret) return false;
  const header = request.headers.get('x-admin-secret');
  return header === secret;
}
