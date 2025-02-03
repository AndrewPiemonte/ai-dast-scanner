'use client';
import styles from "../page.module.css";
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useAuthenticator } from "@aws-amplify/ui-react";

export default function Home() {
  const { signOut } = useAuthenticator();

  return (
    <div className={styles.background4}>
      <div className={styles.page}>
        <main className={styles.main}>
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl"> 
          Welcome to the retrieve Page
          </h1>
          <button onClick={signOut}>Sign out</button>
        </main>
      </div >
    </div >
  );
}
