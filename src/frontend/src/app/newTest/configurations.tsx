import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	isString,
	isJsonofJsons,
	isJsonObject,
	isBoolean,
} from "@/utils/check";
import {
	Drawer,
	DrawerContent,
	DrawerClose,
	DrawerFooter,
	DrawerHeader,
	DrawerTrigger,
} from "@/components/ui/drawer";
import CreateSelect from "./createSelect";
import ConfigTable from "./ConfigTable";

export default function Configurations({
	confs,
	handleConfigChange,
	handleModeChange,
	handleToolChange,
}: {
	confs: Record<string, any>;
	handleConfigChange: (val: string, newVal: any) => void;
	handleModeChange: (vnewValue: string) => void;
	handleToolChange: (newValue: string) => void;
}): JSX.Element {
	const [openDrawer, setOpenDrawer] = useState(false);

	const tools: string[] = getToolsConfigurations(confs);
	let modes = getModesConfigurations(confs);
	console.log("modes", modes);

	console.log("new confs", confs);

	return (
		<>
			<CreateSelect
				label={"Select a Tool"}
				values={tools}
				onChange={handleToolChange}
			/>
			<CreateSelect
				label={"Select a Scan Type"}
				values={modes}
				onChange={handleModeChange}
			/>
			{(() => {
				let scan = getConfigurations(confs);
				console.log("scan", scan);
				if (scan != null && isJsonObject(scan?.config)) {
					let manConfig: Record<string, any> = {};
					let optConfig: Record<string, any> = {};
					Object.entries(scan.config).map(([key, value]: [string, any]) => {
						if (value?.mandatory) {
							manConfig[key] = value;
						} else {
							optConfig[key] = value;
						}
					});
					return (
						<>
							<ConfigTable
								req={true}
								title={"Mandatory Configurations"}
								configs={manConfig}
								onChange={handleConfigChange}
							/>
							<div className="flex justify-center">
								<Drawer open={openDrawer}>
									<DrawerTrigger>
										<Button
											variant="link"
											onClick={() => {
												setOpenDrawer(true);
											}}
										>
											Optional Configurations
										</Button>
									</DrawerTrigger>
									<DrawerContent>
										<DrawerHeader>
											<ConfigTable
												req={false}
												title={"Optional Configurations"}
												configs={optConfig}
												onChange={handleConfigChange}
											/>
										</DrawerHeader>
										<DrawerFooter>
											<DrawerClose>
												<Button
													variant="outline"
													onClick={() => {
														setOpenDrawer(false);
													}}
												>
													Close
												</Button>
											</DrawerClose>
										</DrawerFooter>
									</DrawerContent>
								</Drawer>
							</div>
						</>
					);
				}
			})()}
		</>
	);
}

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
