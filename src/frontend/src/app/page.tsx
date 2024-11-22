import Image from "next/image";
import styles from "./page.module.css";
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"


export default function Home() {
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
                  <Button variant="secondary">
                   
                    Make a new test using the tool
                  </Button>
                </div>
                <Separator orientation="vertical" />
                <div>
                  <Button variant="secondary">
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
