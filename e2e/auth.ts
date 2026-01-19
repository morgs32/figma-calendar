import type { Page } from "@playwright/test";

export async function signInWithClerkTestSession(page: Page, email: string) {
  const url = `/api/e2e/session?email=${encodeURIComponent(email)}`;
  const response = await page.goto(url);
  if (!response?.ok()) {
    throw new Error(`Failed to create test session: ${response?.status()}`);
  }
}
