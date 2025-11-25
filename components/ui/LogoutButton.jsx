"use client";

import { signOut } from "next-auth/react";
import { useTransition } from "react";

export default function LogoutButton({
  children = "Logout",
  pendingText = "Logging out...",
  className = "",
  callbackUrl = "/login",
}) {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(() => {
      signOut({ callbackUrl });
    });
  };

  return (
    <button
      type="button"
      className={className}
      onClick={handleClick}
      disabled={isPending}
    >
      {isPending ? pendingText : children}
    </button>
  );
}
