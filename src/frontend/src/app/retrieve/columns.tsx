"use client";
import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useState } from "react";
import { DataTable } from "./data-table";

export type Test = {
    id: string
    testName: string
    testDate: string
    targetURL: string
    type: "base scan" | "api"
    status: "success" | "pending" | "failed" | "-"
}


export const TestTable = ({data} : { data : Test[]}) => {
    const [tableData, setTableData] = useState<Test[]>(data);
    console.log("testtable")
    const deleteItem = (id: string) => {
        console.log("deleteItem Invoked")
        setTableData((prevTable) => prevTable.filter((test) => test.id !== id));
    }


    const columns: ColumnDef<Test>[] = [
        {
            accessorKey: "testName",
            header: "Test Name",
            cell: ({row}) =>{
                const test = row.original;
                return (
                  <Link href="/" className="text-blue-500 hover:underline">
                    {test.testName}
                  </Link>
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
            header: "Status"
        },
        {
            accessorKey: "actions",
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

