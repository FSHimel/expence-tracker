"use client";

import { useState } from "react";
import Logo from "./Logo";

/**
 * Shared shell for /login and /register: a photograph of the desk object this
 * interface descends from on the left, the working sheet on the right.
 */
export default function AuthShell({ note, children }) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <main className="relative z-10 grid min-h-screen lg:grid-cols-[1.05fr_minmax(0,1fr)]">
      <aside className="relative hidden overflow-hidden bg-sheet-lo lg:block">
        {!imageFailed ? (
          <img
            src="/assets/desk-object.png"
            alt="A soft off-white desk calculator resting on a paper expense ledger"
            className="absolute inset-0 h-full w-full object-cover"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_20%_10%,#f5f3ed_0%,#dcd8d0_60%,#c9c4bc_100%)]" />
        )}
        <div className="absolute inset-0 bg-[linear-gradient(155deg,rgba(245,243,237,0.86)_0%,rgba(233,231,225,0.5)_38%,rgba(58,54,46,0.42)_100%)]" />
        <div className="absolute inset-0 flex flex-col justify-between p-10">
          <Logo size={32} />
          <div className="max-w-[22rem]">
            <p className="label-caps">Personal cost notebook</p>
            <p className="mt-3 font-display text-[2.1rem] font-semibold leading-[1.08] text-ink">
              A quiet page for every cost you need to remember.
            </p>
          </div>
        </div>
      </aside>

      <section className="flex items-center justify-center px-5 py-12 sm:px-10">
        <div className="w-full max-w-[26rem]">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          {children}
          {note ? <p className="mt-8 text-xs text-muted">{note}</p> : null}
        </div>
      </section>
    </main>
  );
}
