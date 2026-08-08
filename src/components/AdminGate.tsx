import { ReactNode, useState } from "react";
import SEO from "@/components/SEO";

export const ADMIN_TOKEN_KEY = "nk_admin_token";

export function getAdminToken(): string | null {
  try {
    return localStorage.getItem(ADMIN_TOKEN_KEY);
  } catch {
    return null;
  }
}

interface Props {
  title: string;
  description: string;
  path: string;
  children: ReactNode;
}

/** Token-gated shell shared by every /admin console page. */
export default function AdminGate({ title, description, path, children }: Props) {
  const [token, setToken] = useState(() => getAdminToken() ?? "");
  const [unlocked, setUnlocked] = useState(() => !!getAdminToken());

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-background font-body pt-14 flex items-center justify-center px-6">
        <SEO title={`${title} | HeroDossier`} description={description} path={path} noindex />
        <div className="w-full max-w-sm p-8 bg-card/60 border border-border rounded-lg">
          <h1 className="font-display text-2xl text-foreground mb-2">{title.toUpperCase()}</h1>
          <p className="text-sm text-muted-foreground mb-5">Enter the admin token to continue.</p>
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            aria-label="Admin token"
            placeholder="admin token"
            className="w-full mb-3 px-3 py-2 bg-background border border-border rounded-sm text-sm text-foreground"
          />
          <button
            type="button"
            onClick={() => {
              if (!token.trim()) return;
              localStorage.setItem(ADMIN_TOKEN_KEY, token.trim());
              setUnlocked(true);
            }}
            className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-sm font-display text-sm tracking-wide"
          >
            UNLOCK
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-body pt-20 pb-24 px-6">
      <SEO title={`${title} | HeroDossier`} description={description} path={path} noindex />
      <div className="max-w-6xl mx-auto">{children}</div>
    </div>
  );
}
