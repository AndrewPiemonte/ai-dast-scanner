import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer"
import Configurations from "./configurations"
import * as conf from "@/utils/conf.json"
import {isString, isBoolean, isJsonObject, isJsonofJsons} from "@/utils/check"

export function NewTestCard() {
    const [confs, setConfs] = useState<Record<string, any>>(conf);
    const [testName, setTestName] = useState("");
    const router = useRouter()
    console.log("target URL", getTargetURL(confs))
    console.log("confs", confs)
    const goToDislayPage = () => {
        let tool = getTool(confs)
        let mode = getMode(confs)
        sessionStorage.setItem('targetURL', getTargetURL(confs))
        sessionStorage.setItem('confs', JSON.stringify(confs))
        if (tool && mode){
            sessionStorage.setItem('testType', `${tool}, ${mode}`)
        } else{
            sessionStorage.setItem('testType', "unknown")
        }
        if (testName !== "") {
            sessionStorage.setItem('testName', testName);
        } else {
            sessionStorage.setItem('testName', "My First Test");
        }

        router.push("/display");
    }

        const handleToolChange = (newValue: string) => {
            console.log(newValue);
            if (isString(confs?.run_scan?.scanMode?.tool)) {
                setConfs((prev) => ({
                    ...prev,
                    run_scan: {
                        scanMode: {
                            ...prev.run_scan.scanMode,
                            tool: newValue,
                        },
                    },
                }));
            }
    
            console.log("new confs", confs);
        };
    
        const handleModeChange = (newValue: string) => {
            console.log(newValue);
            if (isString(confs?.run_scan?.scanMode?.mode)) {
                setConfs((prev) => ({
                    ...prev,
                    run_scan: {
                        scanMode: {
                            ...prev.run_scan.scanMode,
                            mode: newValue,
                        },
                    },
                }));
            }
        };
    
        const handleConfigChange = (val: string, newVal: any) => {
            console.log(newVal);
            console.log(val);
            let scan = getConfigurations(confs);
            console.log(scan);
            if (isJsonObject(scan?.config[val])) {
                let param = scan.config[val];
                console.log("param", param);
                if (isBoolean(param?.enabled) && isString(param?.type)) {
                    let tool = getTool(confs);
                    let mode = getMode(confs);
                    console.log("setting tool and mode", tool);
                    console.log(mode);
                    if (tool != null && mode != null) {
                        console.log("setting confs");
                        setConfs((prev) => ({
                            ...prev,
                            tools: {
                                ...prev.tools,
                                [tool]: {
                                    ...prev.tools[tool],
                                    modes: {
                                        ...prev.tools[tool].modes,
                                        [mode]: {
                                            ...prev.tools[tool].modes[mode],
                                            config: {
                                                ...prev.tools[tool].modes[mode].config,
                                                [val]: {
                                                    ...prev.tools[tool].modes[mode].config[val],
                                                    enabled: true,
                                                    value: newVal,
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        }));
                    }
                }
            }
        };

        function getToolsConfigurations(conf: Record<string, any>): string[] {
            if (isJsonofJsons(conf?.tools)) {
                return Object.keys(conf.tools);
            }
            console.log(conf);
            return ["ERROR: Configurations not found"];
        }
        
        function getModesConfigurations(conf: Record<string, any>): string[] {
            if (isString(conf?.run_scan?.scanMode?.tool)) {
                let tool: string = conf.run_scan.scanMode.tool;
                if (isJsonofJsons(conf?.tools[tool]?.modes)) {
                    let modes = conf.tools[tool].modes;
                    return Object.keys(modes);
                }
            }
            return ["ERROR: Modes not found"];
        }
        
        function getTool(conf: Record<string, any>): string | null {
            if (isString(conf?.run_scan?.scanMode?.tool)) {
                return conf?.run_scan?.scanMode?.tool;
            }
            return null;
        }
        
        function getMode(conf: Record<string, any>): string | null {
            if (isString(conf?.run_scan?.scanMode?.mode)) {
                return conf?.run_scan?.scanMode?.mode;
            }
            return null;
        }

        function getTargetURL(conf: Record<string, any>): string {
            let configurations = getConfigurations(conf)
            if (configurations!=  null && isString(configurations?.config?.ENABLE_TARGET_URL?.value)){
                return configurations.config.ENABLE_TARGET_URL.value
            }
            return "unknown"
        }
        
        function getConfigurations(
            conf: Record<string, any>
        ): Record<string, any> | null {
            let tool = getTool(conf);
            let mode = getMode(conf);
            if (isString(tool) && isString(mode)) {
                console.log("tool", tool);
                console.log("mode", mode);
                if (isJsonObject(conf?.tools[tool]?.modes[mode])) {
                    console.log("entered core");
                    return conf.tools[tool].modes[mode];
                }
            }
        
            return null;
        }

    return (
        <Card className="w-[800px]">
            <CardHeader>
                <CardTitle className="text-3xl"> Start a New Scan</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label>Test Name</Label>
                        <Input
                            placeholder="Enter your Test Name Here"
                            value={testName}
                            className = "w-[300px]"
                            maxLength={20}
                            onChange={(e) => { setTestName(e.target.value) }}
                            required={true}
                        />
                        <Configurations confs={confs} handleConfigChange={handleConfigChange} handleToolChange={handleToolChange} handleModeChange={handleModeChange} />
                    </div>
                    <Dialog>
                        <DialogTrigger asChild>
                        <Button type="submit" className="w-full">
                                Submit
                        </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle> Please confirm your Target URL address </DialogTitle>
                                <DialogDescription>
                                    Confirm changes to your url address here
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="name" className="text-right">
                                        Target URL
                                    </Label>
                                    <Input
                                        value={getTargetURL(confs)}
                                        className="col-span-3"
                                        readOnly
                                    />
                                </div>
                            </div>
                            <div className="flex justify-center">
                                <Button variant="link">
                                    <a target="_blank"  href={getTargetURL(confs)}  rel="noopener noreferrer" >
                                        Link to the URL
                                    </a>
                                </Button>

                            </div>



                            <DialogFooter>
                                <Button type="submit" onClick={goToDislayPage}> Submit</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                </div>

            </CardContent>
        </Card>
        
    )
}
