"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "../../lib/supabase-browser";

type PublicNavProps = { current?: "home" | "amenities" };

export default function PublicNav({ current = "home" }: PublicNavProps) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));
    return () => listener.subscription.unsubscribe();
  }, []);

  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split("@")[0];

  return (
    <nav className="nav wrap" aria-label="Main navigation">
      <Link className="brand" href="/"><span className="brand-mark" aria-hidden="true"><i /><i /><i /></span><span>Teel Mountain<br /><em>Homeowners Association</em></span></Link>
      <div className="nav-links"><Link href="/#welcome">Our community</Link><Link className={current === "amenities" ? "nav-current" : ""} href="/amenities">Amenities</Link><Link href="/#rules">Community rules</Link><Link href="/#contact">Contact</Link></div>
      <Link className="nav-button" href={user ? "/members" : "/login"}>{user ? <><span className="nav-user">{displayName}</span> Resident portal</> : "Resident portal"} <span aria-hidden="true">↗</span></Link>
    </nav>
  );
}