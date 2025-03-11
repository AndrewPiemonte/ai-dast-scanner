import { constants } from "buffer";
import { config } from "process";

export function formatReport(report: Record<string, any>) : string{
  let markdown: String = "# Security Test Report \n\n";
  console.log(report)
  let {ai_analysis, ...zap_report} = report
  if(typeof ai_analysis?.response === "string"){
  markdown += "## AI Summary: \n\n"
  markdown += report.ai_analysis.response.replaceAll("**Vulnerability Name:**", "####")
  }
  let reportContent = `
## Report:
|  DAST Test Information |
|---| \n`;

  let configurations: Record<string, any> = extractconfigurations(report)
  console.log(configurations)
  for (const [key, value] of Object.entries(configurations)){
    reportContent += ` | **${key}:** \`${value}\` | \n`
  }
  markdown += reportContent;
  console.log("zap report", zap_report)
  let sections = {
    text: " "
  }
  formatChildren(sections, zap_report)
  markdown += sections.text
  return markdown.toString();
};

function extractconfigurations(report: Record<string, any>) {
  return Object.keys(report)
    .filter(key => key.startsWith("@")) 
    .reduce((acc: Record<string, any>, key: string) => {
      let formattedKey = key.replace(/^@/, "")
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .toLowerCase();
      acc[formattedKey] = report[key]; 

      return acc;
    }, {});
}

function valueWithoutConfigurations(report: Record<string, any>): Record<string, any> {
  return Object.keys(report)
    .filter(key => !key.startsWith("@")) 
    .reduce((acc: Record<string, any>, key: string) => {
      acc[key] = report[key]; 
      return acc;
    }, {});
}

function isArrayOfJsons(value: any): value is Record<string, any>[] {
  return (
    Array.isArray(value) && 
    value.every(item => typeof item === "object" && item !== null && !Array.isArray(item))
  );
}

function isJsonObject(value: any): value is Record<string, any> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}


function formatChildren(sections:{text: String}, child: Record<string, any>){
  let configurations: Record<string, any> = extractconfigurations(child)
  if (Object.keys(configurations).length > 0){
     sections.text +=`
|  General Information |
|---| \n`;
    for(const [key, value] of Object.entries(configurations)){
       sections.text += ` | **${key}:** \`${value}\` | \n`
    }
    formatChildren(sections, valueWithoutConfigurations(child));
  } else{
  for (const [key, value] of Object.entries(child)) {
    if (Array.isArray(value)){
      sections.text += `### \`${key}\` \n\n`
      for( let i=0; i < value.length; i++){
        if (isJsonObject(value[i])){
          formatChildren(sections, value[i])
        }
        sections.text += ` <br>\n\n `
      }
    } else if (isJsonObject(value)) {
        sections.text += `### ${key}\n\n `;
        formatChildren(sections, value)
      }  else if (value != null) {
        if (typeof value === "string" && value !== ""){
          sections.text += `- **${key}:** \`${value.replaceAll("<p>", "").replaceAll("</p>", "")}\` \n\n `;
        } 
      }
  }
}
}