import React from 'react';

export default function MinimalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This layout is a pass-through and does not add any global components
  // like AppNavbar or SubNavigation.
  // It will inherit the MyCtxProvider from the root layout if needed,
  // or pages within it (like SkillsPage) can manage their own context providers.
  return <>{children}</>;
} 