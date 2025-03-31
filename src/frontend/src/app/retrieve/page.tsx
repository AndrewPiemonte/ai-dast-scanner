'use client';
import styles from "../page.module.css";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button"
import { useAuthenticator } from "@aws-amplify/ui-react";
import type { Schema } from "../../../amplify/data/resource";
import { generateClient } from "aws-amplify/api";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TestTable } from "./columns"
import { useRouter } from "next/navigation";
import { remove } from 'aws-amplify/storage';
import { uploadData } from "aws-amplify/storage";

interface ResponseFormat {
    success: boolean,
    report: string,
    status: "initiated" | "running" | "failed" | "processing" | "completed",
    message: string
}

export default function Home() {
  const client = generateClient<Schema>();
  const router = useRouter();
  const [reports, setReports] = useState<Array<Schema["reportInfo"]["type"]>>([]);
  const reportsRef = useRef(reports)
  const { signOut } = useAuthenticator();
  const handleSignOut = async () => {
    await signOut();      
    router.push('/');      
  };
  const [runTask, setRunTask] = useState<Boolean>(true)
  const newTest = async () => {
    let res = await fetch(`/api/getConfigUpdates`, {method: "POST"})
    if (res.ok){
      router.push("/newTest")
    }
  }

  async function deleteReport(reportId: string){
    try{
      remove({
        path: ({identityId}) => `reports/${identityId}/${reportId}.json`
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
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
      }
    });
  }

  async function updateReports(){
    try{

      reportsRef.current.filter((report) => (report.status == "initiated" || report.status == "running" 
        ||  report.status == "processing")).forEach(
        async (report) => {
          const res = await fetch(`/api/getEnhancedReport?scan_id=${report.scan_id}`);
          const response: ResponseFormat = await res.json()
          if (response.success){
            if (response.status != report.status){
              console.log(response)
              let name: string = report.id?? ""
              if (response.status == "completed"){
                console.log("uploading report")
                uploadTest(response.report, name)
              } 

              await client.models.reportInfo.update({
                id: name,
                scan_id: report.scan_id,
                status: response.status,
                targetURL: report.targetURL,
                testDate: report.testDate,
                type: report.type
              })
            }
          }
      }
    );
    } catch(error){
      console.log(error)
    }
  }

  async function updateResultsTask() {
    console.log("Executing task at", new Date().toISOString());

    try {
      let nreportsToUpdate = reportsRef.current.filter((report) => (["initiated", "running", "processing"].includes(report.status ?? ""))).length
      console.log(nreportsToUpdate)
      console.log("reports: ", reportsRef.current)
       if (nreportsToUpdate > 0){
        console.log("getting updates")
        updateReports()
       }
    } catch (error) {
        console.error("Task failed:", error);
    }
  }

  // Start task to update results

  async function uploadTest(report: string, reportName: string){
    let {result} = uploadData({
      path: ({ identityId }) => {
          return `reports/${identityId}/${reportName}.json`;
        },
      data: report
    })
    console.log(result)
  }

  useEffect(() => {
    reportsRef.current = reports;
  }, [reports]);

  useEffect(()=>{
    getTests()
    if (runTask){
      setTimeout(updateResultsTask, 2000);
      setInterval(updateResultsTask, 15000);
      setRunTask(false)
    }
  }, []);

  console.log("retrive page called");



  return (
    <div className={styles.background4}>
      <div className="flex flex-col w-full h-full">
       <div className = "w-full flex flex-row justify-between items-center h-100px bg-black text-white">
        <div className="px-5">
          <div className="flex flex-row items-center">
          <div className="flex flex-row items-center">
          <img src="/DAEST_MD.png" className="h-[80px] mr-3 py-[5px]" />
          <h3 className="text-4xl font-extrabold tracking-tight lg:text-5xl mx-4"> 
            Dashboard
          </h3>
          </div>
          </div>
          </div>
          <div className="px-5 text-lg">
            <button onClick={handleSignOut}>Sign out</button>
          </div>
        </div>
        <div className="overflow-hidden h-full w-full border md:shadow-xl bg-white bg-opacity-30">
          <div className="m-8 bg-white bg-opacity-60 rounded-md">
          <Button className="bg-green-500 hover:bg-green-600 text-white m-4 text-lg" onClick={newTest}>
            New Test
          </Button>
          <ScrollArea className=" h-[500px] w-full">
          <TestTable data={reports} deleteItem={deleteReport} />
          </ScrollArea>
          </div>
        </div>
        </div>
    </div>
  );
}
