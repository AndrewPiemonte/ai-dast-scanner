
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
import {isString, isBoolean, isInt} from "@/utils/check";

export default function AnyCell({
	req,
	name,
	desc,
	initialValue,
	valueType,
	onChange,
}: {
	req: boolean,
	name: string,
	desc: string,
	initialValue: any,
	valueType: string
	onChange: (value: string, newval: any) => void
}): JSX.Element {
	return (
		<TableRow>
			<TableCell className="font-medium flex items-center gap-2">
				{formatName(name)}
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger>
							{" "}
							<Info className="w-5 h-5 cursor-pointer text-gray-500" />
						</TooltipTrigger>
						<TooltipContent>
							<p>{desc}</p>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			</TableCell>
			<TableCell className="text-right">
				{(() => {
					if(valueType === "boolean" && isBoolean(initialValue)){
						return(<Switch required={req} checked={initialValue} onCheckedChange={(newValue: boolean) => onChange(name, newValue)} />);
					}
					if(valueType === "text" && isString(initialValue)){
						return(<Input placeholder={initialValue} required={req} 
							className="w-[200px] inline-grid"
							onChange={(e) => {
							let newValue = e.target.value;
							if (newValue !== ""){
								onChange(name, newValue);
							}
						}}/>)
					}
					if(valueType == "number" && isInt(initialValue)){
						return(<Input value={initialValue} type="number" required={req} 
							className="w-[200px] inline-grid"
							onChange={(e) => {
							let newValue = e.target.value;
							if (newValue !== ""){
								onChange(name, newValue);
							}
						}}/>)
					}
				})()}

			</TableCell>
		</TableRow>
	);
}