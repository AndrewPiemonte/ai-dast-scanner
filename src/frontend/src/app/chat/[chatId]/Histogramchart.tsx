import React from "react";
import ReactECharts from "echarts-for-react";
import { EChartsOption } from "echarts";

export interface HistogramProps {
  data: { title: string; value: number }[];
}

const HistogramChart: React.FC<HistogramProps> = ({ data }) => {
  const option: EChartsOption = {
    title: { text: "Vulnerability Count", left: "center" },
    tooltip: { trigger: "axis" },
    grid: { right: "5rem", bottom: "5rem", containLabel: true },
    yAxis: {
      type: "category",
      data: data.map((item) => item.title), 
      axisLabel: {
        interval: 0, 
        fontSize: 10,
        align: "right", 
        width: 200,
        overflow: "break", 
        
      },
    },
    xAxis: { 
        type: "value"
     },
    series: [
      {
        type: "bar",
        data: data.map((item) => item.value), 
        itemStyle: { color: "#FF0A0A" }, 
      },
    ],
  };

  return <ReactECharts option={option} style={{ height: `${data.length * 60}px`, width: "100%"}} />;
};

export default HistogramChart;