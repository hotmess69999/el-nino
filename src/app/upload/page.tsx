import { SignInForm } from "@/components/auth/SignInForm";
import { UploadForm } from "@/components/upload/UploadForm";
import { getCurrentSession } from "@/lib/auth/session";
import styles from "@/components/profile/Profile.module.css";

export default async function UploadPage() {
  const session = await getCurrentSession();

  if (!session) {
    return (
      <div className={styles.signInPrompt}>
        <SignInForm />
      </div>
    );
  }

  return <UploadForm />;
}
