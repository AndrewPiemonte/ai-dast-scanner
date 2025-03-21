import {config} from "@/utils/conf.json";
import { useEffect, useState } from "react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { isArrayOfJsons, isJsonofJsons } from "@/utils/check";
import CreateSelect from "./createSelect";

export default function Configurations() {
	let [confi, setConf] = useState<Record<string, any>>(config);
	let [values, setValues] = useState<Record<string, any>>({});
	function changeConfiguration(key: string, value: any) {
		setConf((curr) => ({ [key]: value, ...curr }));
	}
  const tools: string[] = getToolsConfigurations(config)
  
	useEffect(() => {}, []);

  return (
    <CreateSelect key={"Select a Tool"} values={tools} />
  )
}

function getToolsConfigurations(conf: Record<string, any>): string[]{
  if (isJsonofJsons(conf?.tools)){
    return Object.keys(conf.tools);
  } 
  console.log(conf)
  return ["ERROR: Configurations not found"]
}

