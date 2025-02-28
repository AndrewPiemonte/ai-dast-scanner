'use client';
import styles from "./page.module.css";
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useRouter } from "next/navigation";
import "@aws-amplify/ui-react/styles.css";


export default function Home() {
  const router = useRouter()
  const gotoRetirevePage = () => {
    router.push("/retrieve")
  }
  const goToNewTest = () => {
    router.push("/newTest")
  }
  return (
    <div className={styles.background}>
      <div className={styles.page}>
        <main className={styles.main}>
          <div>
            <h1 className="scroll-m-20 tracking-tight lg:text-5xl text-white">
              AI Enhanced Security Testing Platform
            </h1>
            <br></br>
            <div className="flex items-center justify-center">
              <div className="flex h-5 items-center space-x-4 text-sm">
                <div>
                  <Button variant="secondary" className="text-lg" onClick={goToNewTest}>
                    Make a New test Using the Tool
                  </Button>
                </div>
                <Separator orientation="vertical" />
                <div>
                  <Button variant="secondary" className="text-lg" onClick={gotoRetirevePage}>
                    Retrive the test Results
                  </Button>
                </div>
              </div>

            </div>

          </div>
        </main>

      </div >
    </div >
  );
}
