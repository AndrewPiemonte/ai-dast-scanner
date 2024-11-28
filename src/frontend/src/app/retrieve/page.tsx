import styles from "../page.module.css";
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"


export default function Home() {
  return (
    <div className={styles.background4}>
      <div className={styles.page}>
        <main className={styles.main}>
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl"> 
          Welcome to the retrieve Page
          </h1>
        </main>
      </div >
    </div >
  );
}
