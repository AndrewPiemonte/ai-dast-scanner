
export function isArrayOfJsons(value: any): value is Record<string, any>[] {
    return (
      Array.isArray(value) && 
      value.every(item => typeof item === "object" && item !== null && !Array.isArray(item))
    );
}
  
export function isJsonObject(value: any): value is Record<string, any> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isJsonofJsons(value: any): value is Record<string, Record<string, any>> {
  return isJsonObject(value) && Object.values(value).every(item =>isJsonObject(item))
}

export function isString(value: any):  value is string {
    return typeof value === "string" && value != "" && value !== null;
}

export function isBoolean(value: any): value is boolean {
  return typeof value === "boolean"
}

export function isInt(value: any): value is number {
  return Number.isInteger(Number(value))
}