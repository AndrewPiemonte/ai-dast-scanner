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
  return (
    <div className={styles.background}>
        <main className={styles.main}>
          <div className="flex flex-col items-center">
          <img src="/UBC_logo.png" className="z-10 absolute top-0 left-0 m-8" />
          <img className = "m-7" src="/DAEST.svg" width={450} height="auto" />
            <h1 className="tracking-tight lg:text-5xl text-white">
            Identify and Resolve Security Flaws in the Blink of an Eye
            </h1>
            <h2 className="m-2 tracking-tight lg:text-3xl text-white">
            Get Started Today and Experience the Power of DAST with AI-Assisted Insights
            </h2>
            <br></br>
            <div className="flex items-center justify-center">
              <div className="flex h-5 items-center space-x-4 text-sm">
                <div>
                  <Button variant="secondary" className="text-lg" onClick={gotoRetirevePage}>
                    Login / Create an Account
                  </Button>
                </div>
              </div>

            </div>

          </div>
        </main>
    </div >
  );
}
