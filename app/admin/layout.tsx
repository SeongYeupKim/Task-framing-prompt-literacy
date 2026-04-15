import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Researcher export — Task framing study",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
