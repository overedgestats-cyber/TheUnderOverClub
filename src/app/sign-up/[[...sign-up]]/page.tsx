import {
  SignUp,
} from "@clerk/nextjs";

import styles from "../../auth.module.css";

export default function SignUpPage() {
  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <div className={styles.brand}>
          THE UNDER OVER CLUB
        </div>

        <SignUp
          path="/sign-up"
          routing="path"
          signInUrl="/sign-in"
          fallbackRedirectUrl="/account"
        />
      </div>
    </main>
  );
}
