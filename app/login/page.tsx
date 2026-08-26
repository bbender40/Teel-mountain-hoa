"use client";

import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowserClient } from "../../lib/supabase-browser";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    const { error: signInError } = await createSupabaseBrowserClient().auth.signInWithPassword({ email, password });

    if (signInError) {
      setError("We couldn't sign you in. Please check your email and password.");
      setIsLoading(false);
      return;
    }

    const destination = searchParams.get("redirectedFrom") || "/members";
    router.replace(destination.startsWith("/") ? destination : "/members");
    router.refresh();
  }

  return (
    <main className="auth-page">
      <div className="auth-photo" aria-hidden="true" />
      <section className="auth-panel">
        <Link className="auth-brand" href="/">Teel Mountain <span>HOA</span></Link>
        <div className="auth-content">
          <p className="eyebrow">Resident portal</p>
          <h1>Welcome<br /><i>home.</i></h1>
          <p className="auth-intro">Sign in to access neighborhood updates, documents, and resident resources.</p>
          <form onSubmit={handleSubmit} className="auth-form">
            <label htmlFor="email">Email address</label>
            <input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required />
            <label htmlFor="password">Password</label>
            <input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required />
            {error && <p className="form-error" role="alert">{error}</p>}
            <button type="submit" disabled={isLoading}>{isLoading ? "Signing in..." : "Sign in to the portal"}<span aria-hidden="true">↗</span></button>
          </form>
          <Link className="back-link" href="/">← Back to public site</Link>
        </div>
      </section>
    </main>
  );
}

export default function LoginPage() {
  return <Suspense fallback={<main className="members-loading"><p>Opening the resident portal...</p></main>}><LoginForm /></Suspense>;
}