'use client';
import styles from "../page.module.css";
// import {LoginForm} from  "@/components/LoginForm"
import { NewTestCard } from "./card"

export default function Home() {
  return (
    <div className={styles.background2}>
      <div className={styles.page}>
        <main className={styles.main}>
          <div>
            <h1 className="scroll-m-20 tracking-tight lg:text-5xl text-white">
            </h1>
            <br></br>
            <NewTestCard />
          </div>
        </main>

      </div >
    </div >
  );
}
