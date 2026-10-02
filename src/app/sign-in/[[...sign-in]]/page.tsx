import {
  SignIn,
} from "@clerk/nextjs";

import styles from "../../auth.module.css";

export default function SignInPage() {
  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <div className={styles.brand}>
          THE UNDER OVER CLUB
        </div>

        <SignIn
          path="/sign-in"
          routing="path"
          signUpUrl="/sign-up"
          fallbackRedirectUrl="/account"
        />
      </div>
    </main>
  );
}
