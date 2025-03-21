import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "@/components/ui/drawer";
import styles from "../page.module.css";
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Info } from "lucide-react";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatName } from "@/utils/format";
import { isString, isBoolean } from "@/utils/check";
import AnyCell from "./CellTypes";

export default function ConfigTable({title, req, configs, onChange}: { req: boolean,  title: string, configs: Record<string, any>, onChange: (val: string, newVal: any) => void}): JSX.Element {
	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead className="w-[700px]">{title}</TableHead>
					<TableHead className="text-right">Value</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
            { Object.entries(configs).map( ([key, value]: [key: string, value: any]) => {
                if (isString(value?.description) && isString(value?.type)) 
                    return(
                        <AnyCell req={req} name={key} desc={value.description} valueType={value.type} initialValue={value?.value} onChange={onChange}/>
                    );
            })}
            </TableBody>
		</Table>
	);
}


