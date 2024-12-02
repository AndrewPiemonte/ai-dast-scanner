import styles from "@/app/page.module.css";
import LoginCard from "./loginCard"
import { Button } from "@/components/ui/button"
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { SiFacebook } from "react-icons/si";
import { Label } from  "@/components/ui/label";


export default function Login(){
    return(
        <div className={styles.background5}>
         <div className="flex justify-center flex-center h-full w-full">
         <LoginCard />
         </div>
         
        </div>
    );
}