import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import styles from "../page.module.css"
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Info } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { useEffect, useState } from "react";

export function DrawerForNewTest({ data, setData, targetURL, setOpenDrawer }: { data: any, setData: React.Dispatch<React.SetStateAction<number[]>>, targetURL: string, setOpenDrawer: React.Dispatch<React.SetStateAction<boolean>>}) {

    const [enableAplha, setEnableAplha] = useState(false);
    const [enableIgnoreWarning, setEnableIgnoreWarning] = useState(false);
    const [enableAjaxSpider, setEnableAjaxSpider] = useState(false);
    const [enableShortOutput, setEnableShortOutput] = useState(false);
    const [enablePassiveScan, setEnablePassiveScan] = useState(false);
    const [enableDebug, setEnableDebug] = useState(false);
    const [enableOutputFileJson, setEnableOutputFileJson] = useState(false);
    const [enableTargetURL, setEnableTargetURL] = useState("");
    const [enableScanConfig, setEnableScanConfig] = useState("");
    const [enableScanTimeout, setEnableScanTimeout] = useState("");
    const [enableRemove, setEnableRemove] = useState("");
    const [enableSpiderMaxDuration, setSpiderMaxDuration] = useState("");
    const [enablePortNumber, setPortNumber] = useState("");
    const [enableDelay, setEnableDelay] = useState("");

    useEffect(() => {

        console.log("This runs only once!");

        if (data.length == 1) {
            setEnableTargetURL(targetURL);
        } else {
            for (const [index, value] of data.entries()) {
                if (index == 0) {
                    setEnableAplha(value);
                }
                if (index == 1) {
                    setEnableIgnoreWarning(value);
                }
                if (index == 2) {
                    setEnableAjaxSpider(value);
                }
                if (index == 3) {
                    setEnableShortOutput(value);
                }
                if (index == 4) {
                    setEnablePassiveScan(value);
                }
                if (index == 5) {
                    setEnableDebug(value);
                }
                if (index == 6) {
                    setEnableOutputFileJson(value);
                }
                if (index == 7) {
                    setEnableTargetURL(targetURL);
                }
                if (index == 8) {
                    setEnableScanConfig(value);
                }
                if (index == 9) {
                    setEnableScanTimeout(value);
                }
                if (index == 10) {
                    setEnableRemove(value);
                }
                if (index == 11) {
                    setSpiderMaxDuration(value);
                }
                if (index == 12) {
                    setPortNumber(value);
                }
                if (index == 13) {
                    setEnableDelay(value);
                }

            }
        }
    }, []);

    const SubmitButton = () => {
        // Lets gather the data
        const data = [
            enableAplha,
            enableIgnoreWarning,
            enableAjaxSpider,
            enableShortOutput,
            enablePassiveScan,
            enableDebug,
            enableOutputFileJson,
            enableTargetURL,
            enableScanConfig,
            enableScanTimeout,
            enableRemove,
            enableSpiderMaxDuration,
            enablePortNumber,
            enableDelay
        ];
        console.log(data)
        setData(data);
        setOpenDrawer(false);

    }

    return (
        <div className={styles.center}>
            <DrawerHeader>
                <Card>
                    <CardHeader>
                        <CardTitle>
                            <div className="flex justify-center items-center gap-4">
                                Configurations for Zap Test
                            </div>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="max-h-[500px] overflow-auto">

                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[700px]">Configurations</TableHead>
                                    <TableHead className="text-right">Value</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell className="font-medium flex items-center gap-2">
                                        Enable Alpha
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger> <Info className="w-5 h-5 cursor-pointer text-gray-500" /></TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Enables experimental scan features (not recommended for production)</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>


                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Switch checked={enableAplha} onCheckedChange={(value) => { setEnableAplha(value) }} />
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium flex items-center gap-2">
                                        Enable Ignore Warning
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger> <Info className="w-5 h-5 cursor-pointer text-gray-500" /></TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Ignores non-critical warnings in the scan report</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Switch checked={enableIgnoreWarning} onCheckedChange={(value) => setEnableIgnoreWarning(value)} />
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium flex items-center gap-2">Enable AJAX Spider

                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger> <Info className="w-5 h-5 cursor-pointer text-gray-500" /></TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Uses AJAX Spider to crawl JavaScript-heavy applications</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>

                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Switch checked={enableAjaxSpider} onCheckedChange={(value) => setEnableAjaxSpider(value)} />
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium flex items-center gap-2">Enable Short Output
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger> <Info className="w-5 h-5 cursor-pointer text-gray-500" /></TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Generates a concise output instead of a full scan report</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Switch checked={enableShortOutput} onCheckedChange={(value) => setEnableShortOutput(value)} />
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium flex items-center gap-2">Enable Passive Scan

                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger> <Info className="w-5 h-5 cursor-pointer text-gray-500" /></TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Enables passive scanning (does not send malicious requests)</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Switch checked={enablePassiveScan} onCheckedChange={(value) => setEnablePassiveScan(value)} />
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium flex items-center gap-2">Enable Debug

                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger> <Info className="w-5 h-5 cursor-pointer text-gray-500" /></TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Enables debug logging for troubleshooting</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Switch checked={enableDebug} onCheckedChange={(value) => setEnableDebug(value)} />
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium flex items-center gap-2">Enable Output File Json

                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger> <Info className="w-5 h-5 cursor-pointer text-gray-500" /></TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Saves the scan output in JSON format</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>


                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Switch checked={enableOutputFileJson} onCheckedChange={(value) => setEnableOutputFileJson(value)} />
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium flex items-center gap-2">Enable target URL

                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger> <Info className="w-5 h-5 cursor-pointer text-gray-500" /></TooltipTrigger>
                                                <TooltipContent>
                                                    <p>The target website for the scan</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>

                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Input className="w-[200px] inline-grid" type="email" placeholder="URL"
                                            value={enableTargetURL}
                                            onChange={(e) => setEnableTargetURL(e.target.value)}
                                            disabled={true}
                                        />
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium flex items-center gap-2">Enable Scan Config

                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger> <Info className="w-5 h-5 cursor-pointer text-gray-500" /></TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Configuration file for the scan rules</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>

                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Input className="w-[200px] inline-grid" placeholder="Enter text Here"
                                            value={enableScanConfig}
                                            onChange={(e) => setEnableScanConfig(e.target.value)}

                                        /></TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium flex items-center gap-2">Enable Scan Timeout

                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger> <Info className="w-5 h-5 cursor-pointer text-gray-500" /></TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Timeout (in minutes) before the scan is stopped</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>

                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Input className="w-[200px] inline-grid" type="number" placeholder="Enter the duration Here"
                                            value={enableScanTimeout}
                                            onChange={(e) => setEnableScanTimeout(e.target.value)}
                                        /></TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium flex items-center gap-2">Enable Remove

                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger> <Info className="w-5 h-5 cursor-pointer text-gray-500" /></TooltipTrigger>
                                                <TooltipContent>
                                                    <p>List of specific scan rules to disable</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>

                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Input className="w-[200px] inline-grid" type="text" placeholder="Enter text Here"
                                            value={enableRemove}
                                            onChange={(e) => setEnableRemove(e.target.value)}
                                        /></TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium flex items-center gap-2">Enable Spider Max Duration

                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger> <Info className="w-5 h-5 cursor-pointer text-gray-500" /></TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Maximum spider duration in seconds</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>

                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Input className="w-[200px] inline-grid" type="number" placeholder="Enter the number Here"
                                            value={enableSpiderMaxDuration}
                                            onChange={(e) => setSpiderMaxDuration(e.target.value)}
                                        /></TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium flex items-center gap-2">Enable Port Number

                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger> <Info className="w-5 h-5 cursor-pointer text-gray-500" /></TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Port number to use for the scan</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>

                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Input className="w-[200px] inline-grid" type="number" placeholder="Enter the number Here"
                                            value={enablePortNumber}
                                            onChange={(e) => setPortNumber(e.target.value)}

                                        /></TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium flex items-center gap-2">Enable Delay

                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger> <Info className="w-5 h-5 cursor-pointer text-gray-500" /></TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Time (in seconds) between requests to avoid detection</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>

                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Input className="w-[200px] inline-grid" type="number" placeholder="Enter the number Here"
                                            value={enableDelay}
                                            onChange={(e) => setEnableDelay(e.target.value)}
                                        /></TableCell>
                                </TableRow>

                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

            </DrawerHeader>
            <DrawerFooter>
            {/* <DrawerClose> */}
                <Button onClick={SubmitButton}>Submit</Button>
                {/* </DrawerClose> */}
                <DrawerClose>
                    <Button variant="outline" onClick={() => {  setOpenDrawer(false);}}>Cancel</Button>
                </DrawerClose>
            </DrawerFooter>
        </div>
    )
}