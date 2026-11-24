import Link from "next/link";
import { SignOutButton } from "@/components/SignOutButton";
import { HOME_PATH } from "@/lib/auth-routes";
import { requireUser } from "@/lib/supabase/require-user";
import { signOut } from "../(auth)/actions";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-line">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2 sm:px-6">
          <Link
            href={HOME_PATH}
            className="inline-flex min-h-11 items-center font-display text-title text-fg no-underline"
          >
            Repertorio Vocal
          </Link>
          <p className="order-last w-full truncate text-caption text-fg-muted sm:order-none sm:ml-auto sm:w-auto sm:max-w-xs">
            <span className="sr-only">Sesión iniciada como </span>
            {user.email}
          </p>
          <div className="ml-auto sm:ml-0">
            <SignOutButton action={signOut} />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
