<script setup>
import * as echarts from "echarts"
import { onBeforeUnmount, onMounted, ref } from "vue"

const graphRef = ref(null)
let myChart = null

onMounted(() => {
  if (!graphRef.value)
    return

  myChart = echarts.init(graphRef.value)

  const option = {
    title: {
      text: "干眼症病因多模态知识图谱",
      subtext: "点击节点查看关联",
      top: 20,
      left: "center"
    },
    tooltip: {},
    legend: [{
      data: ["核心疾病", "环境因素", "行为因素", "并发症"]
    }],
    series: [
      {
        type: "graph",
        layout: "force",
        animation: false,
        draggable: true,
        label: {
          show: true,
          position: "right",
          formatter: "{b}"
        },
        roam: true,
        categories: [
          { name: "核心疾病" },
          { name: "环境因素" },
          { name: "行为因素" },
          { name: "并发症" }
        ],
        force: {
          repulsion: 300,
          edgeLength: 120
        },
        data: [
          { name: "干眼症", symbolSize: 100, category: 0, itemStyle: { color: "#E6A23C" } },
          { name: "高海拔", symbolSize: 60, category: 1 },
          { name: "强紫外线", symbolSize: 60, category: 1 },
          { name: "低湿度", symbolSize: 60, category: 1 },
          { name: "屏幕时间过长", symbolSize: 50, category: 2 },
          { name: "隐形眼镜佩戴", symbolSize: 50, category: 2 },
          { name: "睑板腺萎缩", symbolSize: 70, category: 3, itemStyle: { color: "#F56C6C" } },
          { name: "角膜炎", symbolSize: 50, category: 3 },
          { name: "视疲劳", symbolSize: 40, category: 3 }
        ],
        links: [
          { source: "高海拔", target: "干眼症", value: "诱发" },
          { source: "强紫外线", target: "干眼症", value: "加重" },
          { source: "低湿度", target: "干眼症", value: "直接原因" },
          { source: "屏幕时间过长", target: "干眼症", value: "诱发" },
          { source: "隐形眼镜佩戴", target: "干眼症", value: "高风险" },
          { source: "干眼症", target: "睑板腺萎缩", value: "病理改变" },
          { source: "干眼症", target: "角膜炎", value: "并发症" },
          { source: "干眼症", target: "视疲劳", value: "典型症状" },
          { source: "睑板腺萎缩", target: "强紫外线", value: "关联性强" }
        ],
        lineStyle: {
          color: "source",
          curveness: 0.3
        },
        edgeLabel: {
          show: true,
          formatter: "{c}",
          fontSize: 10
        }
      }
    ]
  }

  myChart.setOption(option)
  window.addEventListener("resize", () => myChart.resize())
})

onBeforeUnmount(() => {
  if (myChart) {
    window.removeEventListener("resize", () => myChart.resize())
    myChart.dispose()
  }
})
</script>

<template>
  <div class="graph-container">
    <div ref="graphRef" style="width: 100%; height: 600px;" />
  </div>
</template>

<style scoped>
.graph-container {
  background: rgba(16, 12, 42, 0.4);
  border: 1px solid #2c58a6;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin-top: 20px;
}
</style>
