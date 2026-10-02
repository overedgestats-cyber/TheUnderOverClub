"use client";

import {
  useClerk,
} from "@clerk/nextjs";

import styles from "./RetroShell.module.css";

export default function RetroLogoutButton() {
  const {
    signOut,
  } = useClerk();

  return (
    <button
      type="button"
      className={styles.logoutButton}
      onClick={() => {
        void signOut({
          redirectUrl: "/",
        });
      }}
    >
      LOG OUT
    </button>
  );
}
