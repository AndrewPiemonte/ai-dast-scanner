"use client";
import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useEffect, useState } from "react";
import { DataTable } from "./data-table";
import type { Schema } from "../../../amplify/data/resource";
import { ClipLoader } from "react-spinners"


export const TestTable = ({data, deleteItem} : { 
    data : Array<Schema["reportInfo"]["type"]>;
    deleteItem: (id: any) => Promise<void>;
     } ) => {
    const [tableData, setTableData] = useState<Array<Schema["reportInfo"]["type"]>>(data);

    useEffect(()=>{
        try{
            setTableData(data)
        }
        catch(error){
            console.log(error)
        }
    }, [data])


    const columns: ColumnDef<Schema["reportInfo"]["type"]>[] = [
        {
            accessorKey: "testName",
            header: "Test Name",
            cell: ({row}) =>{
                const test = row.original;
                 let path = `/chat/${test.id}`
                return (
                    test.status == "completed" ?
                  <Link href={path} className="text-blue-500 hover:underline">
                    {test.testName}
                  </Link>
                  :
                <p>{test.testName}</p>
                );
            }
        },
        {
            accessorKey: "testDate",
            header: "Test Date"
        },
        {
            accessorKey: "targetURL",
            header: "Target URL"
        },
        {
            accessorKey: "type",
            header: "Type"
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({row}) =>{
                const test = row.original;
                if (["initiated", "running", "processing"].includes(test.status ?? "")){
                    return (
                    <div className="flex flex-row flex-wrap items-center">
                    <div className="mx-2 text-yellow-600">{test.status}</div>
                    <ClipLoader color="#ca8a04" size={20} />
                    </div>
                    );
                }
                return(
                    test.status == "completed" ?
                    <div className="mx-2 text-green-600">{test.status}</div>
                    :
                    <div className="mx-2 text-red-600">{test.status}</div>
                )


                
            }
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => {
              const test = row.original;
              return (
                <Button variant="destructive" onClick={() => deleteItem(test.id)}>
                  Delete
                </Button>
              );
            },
        }
    ]

    return(
        <DataTable data={tableData} columns={columns} />
    )

}

