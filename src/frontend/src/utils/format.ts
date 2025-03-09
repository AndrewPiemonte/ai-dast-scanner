import { constants } from "buffer";

export function formatReport(report: Record<string, any>) : string{
  let markdown = "";

  for (const [key, value] of Object.entries(report)) {
    if (key === "ai_summary"){
      markdown += `# ${key}\n\n`;
      markdown += `${value}`;
    }
    if (typeof value === "object" && value !== null) {
      markdown += `## ${key}\n\n`;
      markdown += formatReport(value); // Recursively format nested objects
    } else {
      markdown += `**${key}:** ${value}\n\n`;
    }
  }

  return markdown;
};