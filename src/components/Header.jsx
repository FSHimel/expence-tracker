"use client";

import Link from "next/link";
import Logo from "./Logo";
import AccountMenu from "./AccountMenu";
import { useAuth } from "@/context/AuthContext";

export default function Header() {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 border-b border-[rgba(196,192,184,0.55)] bg-[rgba(233,231,225,0.86)] backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-3.5">
        <Link href="/" aria-label="CostLog home" className="shrink-0">
          <Logo />
        </Link>
        <div className="flex items-center gap-3">{user ? <AccountMenu /> : null}</div>
      </div>
    </header>
  );
}
