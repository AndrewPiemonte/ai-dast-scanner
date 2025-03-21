import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useState } from "react";

export default function CreateSelect({values, label, onChange }: {values: string[], label: string, onChange: (value: string) => void}): JSX.Element {
    const defaultValue = values.length > 0 ? values[0] : "ERROR"; // Prevent undefined value
    console.log(label)
    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <Select defaultValue={defaultValue} onValueChange={(newValue: string) => onChange(newValue)}>
          <SelectTrigger className="w-[180px]">
          <SelectValue />
          </SelectTrigger>
            
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