import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function CreateSelect({values, key }: {values: string[], key: string}): JSX.Element {
    const defaultValue = values.length > 0 ? values[0] : ""; // Prevent undefined values
  
    return (
      <div className="space-y-2">
        <Label>{key}</Label>
        <Select defaultValue={defaultValue}>
          <SelectTrigger className="w-[180px]">{defaultValue || "Select an option"}</SelectTrigger>
          <SelectContent>
            {values.map((value, index) => (
              <SelectItem key={index} value={value}>
                {value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }