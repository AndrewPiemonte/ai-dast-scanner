import { constants } from "buffer";
import { config } from "process";
import { isArrayOfJsons, isJsonObject, isString } from "./check";

export function formatReport(report: Record<string, any>) : string{
  let markdown: String = "";
  console.log(report)
  let {ai_analysis, ...zap_report} = report
  if(typeof ai_analysis?.response === "string"){
    console.log("has ai analysis")
    markdown += "## AI Summary: \n\n"
    markdown += report.ai_analysis.response.replaceAll("**Vulnerability Name:**", "####")
  }
  console.log(typeof ai_analysis?.response)
  markdown += `\n\n ## Report \n\n`;
  console.log("zap report", zap_report)
  let configurations = extractconfigurations(report)
  if (Object.keys(configurations).length > 0){
    markdown +=` 
| DAST Test Configurations | 
|---| \n`;
    
    for(const [key, value] of Object.entries(configurations)){
      markdown += `| **${key}:** \`${value}\` | \n`
    }
    markdown += "\n\n <br/> \n\n"
  }
 
  // Create a table of the alerts of each site
  if(isArrayOfJsons(zap_report?.site)){
    let  sites = zap_report.site
    for( let i=0; i < sites.length; i++){
      let site =  sites[i]
      let configurations: Record<string, any> = extractconfigurations(site)
      if (Object.keys(configurations).length > 0){
        markdown +=` 
| Site General Information | 
|---| \n`;
        for(const [key, value] of Object.entries(configurations)){
          markdown += `| **${key}:** \`${value}\` | \n`
        }
        markdown += "\n\n <br/> \n\n"
      }
      let alerts = site?.alerts
      if (!isArrayOfJsons(alerts)){
        continue;
      }
      markdown +=`
| Name | Impact |
|---|---| \n`;
      for(const [key, value] of Object.entries(alerts)){
        if (isJsonObject(value)){
        if(isString(value?.name) && isString(value?.desc)){
          if (isString(value?.solution) && isString(value?.riskdesc) && isString(value?.reference)){
            // markdown += ` | **${value.name}** <br/> Risk: ${value.riskdesc}  | ${formatPara(value.desc)}  **Possible Solution:** ${formatPara(value.solution)} **References:** ${formatPara(value.reference)} | \n`
            markdown += ` | **${value.name}** <br/> Risk: ${value.riskdesc}  | ${formatPara(value.desc)}  **Possible Solution:** ${formatPara(value.solution)} **References:** ${formatPara(value.reference)}`
            markdown += `<br/> **Information Regarding the Instances**`
            markdown += `<br/>`
            for(const [key1, value1] of Object.entries(value.instances)){
              let instanceID = Number(key1) + 1
              markdown += `<details> <summary>`
              markdown += `Instance ${instanceID}`
              markdown += `</summary>`
              markdown += `<ul>`
              if(value1.id != "") {
                markdown += `<li> Risk id - ${value1.id} </li>`
              }
              if(value1.method != "") {
                markdown += `<li> method - ${value1.method} </li>`
              }
              if(value1.uri != "") {
                markdown += ` <li> uri - ${value1.uri} </li>`
              }
              if(value1.param != "") {
                markdown += `<li> Risk param - ${value1.param} </li>`
              }
              if(value1.attack != "") {
                markdown += `<li> Attack - ${value1.attack} </li>`
              }
              if(value1.evidence != "") {
                markdown += `<li> Risk evidence - ${value1.evidence} </li>`
              }
              // if(value1.otherinfo != "") {
              //   markdown += `<li> Other Info - ${value1.otherinfo} </li>`
              // }
              markdown += `</ul>`
              markdown += `</details>`
             


            }
  

            markdown += ` | \n`

          }else{
            markdown += ` | **${value.name}** | \`${formatPara(value.desc)}\` | \n`
          }

          // markdown += `"
          // <details>
          //   <summary>
          //     Wandb
          //   </summary>
          //   Wandb is a tool that helps you monitor the training process. You can see the loss, accuracy, and other metrics in real time. You can also see the generated images and the model structure. You can find how to use wandb in the following link: https://docs.wandb.ai/quickstart
          // </details>"`

        }
        }
      }
      markdown += ` <br>\n\n `
    }
   } else{
      let sections = {
        text: " "
      }
      formatChildren(3, sections, zap_report)
      markdown += sections.text
    }
    
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

function getHeading(level: number): string {
  return "#".repeat(Math.min(level, 6)); // Repeat "#" but cap at 6
}

function formatPara(value: string): string {
  return value.replaceAll("<p>","<p>\`").replaceAll("</p>","\`</p>")
}


function formatChildren(level: number, sections:{text: String}, child: Record<string, any>){
  let configurations: Record<string, any> = extractconfigurations(child)
  if (Object.keys(configurations).length > 0){
     sections.text +=`
|  General Information |
|---| \n`;
    for(const [key, value] of Object.entries(configurations)){
       sections.text += ` | **${key}:** \`${value}\` | \n`
    }
    formatChildren(level, sections, valueWithoutConfigurations(child));
  } else{
  for (const [key, value] of Object.entries(child)) {
    if (Array.isArray(value)){
      sections.text += `${getHeading(level)} \`${key}\` \n\n`
      for( let i=0; i < value.length; i++){
        if (isJsonObject(value[i])){
          formatChildren(level + 1, sections, value[i])
        }
        sections.text += ` <br>\n\n `
      }
    } else if (isJsonObject(value)) {
        sections.text += `${getHeading(level)} ${key}\n\n `;
        formatChildren(level + 1, sections, value)
      }  else if (value != null) {
        if (typeof value === "string" && value !== ""){
          sections.text += `**${key}:** \`${value.replaceAll("<p>", "").replaceAll("</p>", "")}\` \n\n `;
        } 
      }
  }
}
}