'use client';
import styles from "../page.module.css";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button"
import { useAuthenticator } from "@aws-amplify/ui-react";
import type { Schema } from "../../../amplify/data/resource";
import { generateClient } from "aws-amplify/api";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TestTable } from "./columns"
import { useRouter } from "next/navigation";
import { remove } from 'aws-amplify/storage';




export default function Home() {
  const client = generateClient<Schema>();
  const router = useRouter();
  const [reports, setReports] = useState<Array<Schema["reportInfo"]["type"]>>([]);
  const { signOut } = useAuthenticator();
  const newTest = () => {
    router.push("/newTest")
  }

  async function deleteReport(reportId: string){
    try{
      await console.log(reportId)
      remove({
        path: ({identityId}) => `reports/${identityId}/${reportId}.txt`
      });
      await client.models.reportInfo.delete({
        id: reportId
      });

    }catch(error){
      console.log(error)
    }
  }



  function getTests(){
    client.models.reportInfo.observeQuery().subscribe({
      next: (data) => {
        setReports([...data.items].sort((a, b) => 
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()))
      }
    });
  }

  useEffect(()=>{
    getTests()
  }, []);

  console.log("retrive page called");


  return (
    <div className={styles.background4}>
      <div className="flex flex-col w-full h-full">
       <div className = "w-full flex flex-row justify-between items-center h-100px bg-black text-white">
        <div className="px-5">
          <h3 className="text-4xl font-extrabold tracking-tight lg:text-5xl"> 
            Dashboard
          </h3>
          </div>
          <div className="px-5 text-lg">
            <button onClick={signOut}>Sign out</button>
          </div>
        </div>
        <div className="overflow-hidden h-full w-full border md:shadow-xl bg-white bg-opacity-30">
          <div className="m-8 bg-white bg-opacity-60 rounded-md">
          <Button className="bg-green-500 hover:bg-green-600 text-white m-4 text-lg" onClick={newTest}>
            New Test
          </Button>  
          <ScrollArea className=" w-700px ">
            <TestTable data={reports} deleteItem={deleteReport} />
          </ScrollArea>
          </div>
        </div>
        </div>
    </div>
  );
}
