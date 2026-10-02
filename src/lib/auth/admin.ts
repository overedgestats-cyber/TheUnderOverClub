import "server-only";

function configuredAdminUserIds() {
  return new Set(
    (process.env.ADMIN_CLERK_USER_IDS ?? "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
  );
}

export function isAdminUser(clerkUserId: string) {
  return configuredAdminUserIds().has(clerkUserId);
}
