import type { Metadata } from "next";
import StaffDashboard from "@/components/StaffDashboard";

export const metadata: Metadata = {
  title: "Staff — Axioms Lab",
  robots: { index: false, follow: false },
};

/**
 * Private staff dashboard. The page itself is only a shell: every inquiry
 * read/write is enforced server-side by the backend (Supabase Auth JWT +
 * STAFF_EMAILS allowlist), so an unauthorized visitor gets nothing even with
 * the URL.
 */
export default function StaffPage() {
  return <StaffDashboard />;
}
