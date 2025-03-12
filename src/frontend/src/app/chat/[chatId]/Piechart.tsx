import React from "react";
import { EChartsOption } from "echarts";
import ReactECharts from "echarts-for-react";

export interface PieChartProps {
    high: number;
    medium: number;
    low: number;
    informational: number;
  }

const  PieChart: React.FC<PieChartProps> = ({ high, medium, low, informational }) => {
    let total = high + medium + low + informational
    const option: EChartsOption = {
        title: { text: "Vulnerability Severity", left: "center", top: 0},
        tooltip: {
            trigger: "item",
            formatter: "{b}: {c} ({d}%)", 
          },
    series: [
      {
        type: "pie",
        center: ["50%", "60%"],
        data: [
            { value: high, name: "High", itemStyle: { color: "#FF4D4D" } }, 
            { value: medium, name: "Medium", itemStyle: { color: "#FFD700" } }, 
            { value: low, name: "Low", itemStyle: { color: "#0FAF50" } },
            { value: informational, name: "Informational", itemStyle: { color: "#0A0FAF" } }, 
        ],
      },
    ],
    label: {
        show: true,
        formatter: "{b}: {d}%",
      }
  };
return <ReactECharts option={option} />;
}

export default PieChart;