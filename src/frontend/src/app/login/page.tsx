import styles from "@/app/page.module.css";
import LoginCard from "./loginCard"


export default function Login(){
    return(
        <div className={styles.background5}>
         <div className="flex justify-center flex-center h-full w-full">
         <LoginCard />
         </div>
         
        </div>
    );
}