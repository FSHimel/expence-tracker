"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, LogOut, Settings, User as UserIcon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Spinner } from "./Loading";

function initials(name, email) {
  const source = (name || email || "?").trim();
  const parts = source.split(/[\s@.]+/).filter(Boolean);
  return ((parts[0]?.[0] || "?") + (parts[1]?.[0] || "")).toUpperCase();
}

export default function AccountMenu() {
  const { user, profile, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const containerRef = useRef(null);

  const name = profile?.name || user?.displayName || "Your account";
  const email = user?.email || "";
  const photoURL = user?.photoURL || profile?.photoURL;

  useEffect(() => {
    if (!open) return undefined;
    function onPointerDown(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) setOpen(false);
    }
    function onKeyDown(event) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  async function handleLogout() {
    setSigningOut(true);
    try {
      await logout();
      router.replace("/login");
    } catch {
      setSigningOut(false);
      setOpen(false);
    }
  }

  const avatar = photoURL && !avatarFailed ? (
    <img
      src={photoURL}
      alt=""
      className="h-full w-full object-cover"
      onError={() => setAvatarFailed(true)}
      referrerPolicy="no-referrer"
    />
  ) : (
    initials(name, email)
  );

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        className="key h-11 pl-1.5 pr-3"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="grid h-8 w-8 place-items-center overflow-hidden rounded-full bg-indigo text-[11px] font-bold tracking-wide text-[#fbfaf7]">
          {avatar}
        </span>
        <span className="hidden max-w-[9rem] truncate text-sm font-semibold sm:inline">{name}</span>
        <ChevronDown size={15} className="text-muted" aria-hidden="true" />
        <span className="sr-only">Account menu</span>
      </button>

      {open ? (
        <div
          role="menu"
          aria-label="Account"
          className="neu anim-rise absolute right-0 top-[calc(100%+0.75rem)] w-[17rem] p-4"
        >
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center overflow-hidden rounded-full bg-indigo text-xs font-bold text-[#fbfaf7]">
              {avatar}
            </span>
            <div className="min-w-0">
              <p className="truncate font-display text-base font-semibold">{name}</p>
              <p className="truncate text-sm text-muted">{email}</p>
            </div>
          </div>

          <div className="neu-hairline my-4" />

          <p className="label-caps mb-2 flex items-center gap-2">
            <UserIcon size={13} aria-hidden="true" /> Personal account
          </p>

          <button
            type="button"
            role="menuitem"
            disabled
            title="Settings arrive in a later version"
            className="key key-quiet mb-2 h-10 w-full justify-start px-3 text-sm text-muted"
          >
            <Settings size={15} aria-hidden="true" />
            Settings
            <span className="label-caps ml-auto">Soon</span>
          </button>

          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            disabled={signingOut}
            className="key h-10 w-full justify-start px-3 text-sm"
          >
            {signingOut ? (
              <Spinner label="Logging out…" />
            ) : (
              <>
                <LogOut size={15} aria-hidden="true" /> Logout
              </>
            )}
          </button>
        </div>
      ) : null}
    </div>
  );
}


