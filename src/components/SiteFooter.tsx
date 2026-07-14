import { Link } from "react-router-dom";
import { Twitter, Instagram, Music2, Youtube } from "lucide-react";

export default function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background/80 backdrop-blur-sm mt-20">
      <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <p className="font-display text-xl tracking-wider text-primary">NAKEKNIGHT™</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-md">
            The Peacemaker's serialized saga. Built solo + AI. 100% founder-owned.
          </p>
        </div>

        <nav className="flex flex-wrap gap-4 text-xs font-display tracking-widest text-muted-foreground">
          <Link to="/chronicles" className="hover:text-primary">CHRONICLES</Link>
          <Link to="/store" className="hover:text-primary">STORE</Link>
          <Link to="/universe" className="hover:text-primary">UNIVERSE</Link>
          <Link to="/referrals" className="hover:text-primary">REFER</Link>
          <Link to="/share" className="hover:text-primary">SHARE</Link>
          <Link to="/about" className="hover:text-primary">ABOUT</Link>
          <Link to="/press" className="hover:text-primary">PRESS</Link>
        </nav>

        <div className="flex items-center gap-3">
          <a aria-label="X" href="https://x.com/NakeKnightIP" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary"><Twitter className="w-4 h-4" /></a>
          <a aria-label="Instagram" href="https://instagram.com/nakeknight" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary"><Instagram className="w-4 h-4" /></a>
          <a aria-label="TikTok" href="https://tiktok.com/@nakeknight" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary"><Music2 className="w-4 h-4" /></a>
          <a aria-label="YouTube" href="https://youtube.com/@nakeknight" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary"><Youtube className="w-4 h-4" /></a>
        </div>
      </div>
      <div className="text-center text-[10px] tracking-[0.25em] text-muted-foreground pb-6">
        © {new Date().getFullYear()} NAKEKNIGHT™ · ALL RIGHTS RESERVED
      </div>
    </footer>
  );
}
