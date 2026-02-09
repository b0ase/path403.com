"use client";

import React, { useEffect, useState } from "react";
import { portfolioData } from "@/lib/data";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@b0ase.com";

interface ProjectLogin {
  id: string;
  project_slug: string;
  created_at: string;
}

export default function AdminProjectLoginsPage() {
  return <div>Admin Project Logins Page (placeholder)</div>;
} 