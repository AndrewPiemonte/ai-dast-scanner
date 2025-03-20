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

export function DrawerForNewTest() {
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
                                        <Switch />
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
                                    <TableCell className="text-right"><Switch /></TableCell>
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
                                    <TableCell className="text-right"><Switch /></TableCell>
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
                                    <TableCell className="text-right"><Switch /></TableCell>
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
                                    <TableCell className="text-right"><Switch /></TableCell>
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
                                    <TableCell className="text-right"><Switch /></TableCell>
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
                                    <TableCell className="text-right"><Switch /></TableCell>
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
                                    <TableCell className="text-right"><Input className="w-[200px] inline-grid" type="email" placeholder="URL" /></TableCell>
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
                                    <TableCell className="text-right"><Input className="w-[200px] inline-grid" placeholder="Enter text Here" /></TableCell>
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
                                    <TableCell className="text-right"><Input className="w-[200px] inline-grid" type="number" placeholder="Enter the duration Here" /></TableCell>
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
                                    <TableCell className="text-right"><Input className="w-[200px] inline-grid" type="text" placeholder="Enter text Here" /></TableCell>
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
                                    <TableCell className="text-right"><Input className="w-[200px] inline-grid" type="number" placeholder="Enter the number Here" /></TableCell>
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
                                    <TableCell className="text-right"><Input className="w-[200px] inline-grid" type="number" placeholder="Enter the number Here" /></TableCell>
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
                                    <TableCell className="text-right"><Input className="w-[200px] inline-grid" type="number" placeholder="Enter the number Here" /></TableCell>
                                </TableRow>

                            </TableBody>
                        </Table>






                    </CardContent>
                    <CardFooter>
                        <p>Card Footer</p>
                    </CardFooter>
                </Card>

            </DrawerHeader>
            <DrawerFooter>
                <Button>Submit</Button>
                <DrawerClose>
                    <Button variant="outline">Cancel</Button>
                </DrawerClose>
            </DrawerFooter>
        </div>
    )
}