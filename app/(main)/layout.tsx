import React from "react";

import { initialProfile } from "@/lib/initial-profile";
import { NavigationSidebar } from "@/components/navigation/navigation-sidebar";

export default async function MainLayout({
  children
}: {
  children: React.ReactNode;
}) {
  // Ensure the user has a profile; redirects to sign-in or creates one if needed.
  await initialProfile();

  return (
    <div className="h-full">
      <div className="flex h-full w-[72px] z-30 flex-col fixed inset-y-0">
        <NavigationSidebar />
      </div>
      <main className="pl-[72px] h-full">{children}</main>
    </div>
  );
}
