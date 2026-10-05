import type { Metadata } from "next";
import type { ReactNode } from "react";

// Keep the sign-in page and dashboard out of search results.
export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return children;
}
