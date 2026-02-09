import React from 'react';
// import { ThemeProvider } from "../context/ThemeContext"; // Removed custom ThemeProvider import

// This layout applies only to routes within the projects group
// It overrides the root layout to remove the main site navigation for client project pages
export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  return (
    // <ThemeProvider> // Removed custom ThemeProvider wrapper
      <div className="flex flex-col min-h-screen">
        <main className="flex-grow">
          {children}
        </main>
      </div>
    // </ThemeProvider> // Removed custom ThemeProvider wrapper
  );
} 