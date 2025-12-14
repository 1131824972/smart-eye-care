<script setup>
import * as echarts from "echarts"
import { onBeforeUnmount, onMounted, ref } from "vue"

const graphRef = ref(null)
let myChart = null

onMounted(() => {
  if (!graphRef.value) return

  myChart = echarts.init(graphRef.value)

  const option = {
    backgroundColor: 'transparent', // 关键：移除白色背景
    title: {
      text: "干眼症病因多模态知识图谱",
      subtext: "点击节点查看关联",
      top: 10,
      left: "center",
      textStyle: { color: "#fff" }, // 标题改为白色
      subtextStyle: { color: "#ccc" }
    },
    tooltip: { backgroundColor: "rgba(0,0,0,0.7)", textStyle: { color: "#fff" } },
    legend: [{
      bottom: 10,
      data: ["核心疾病", "环境因素", "行为因素", "并发症"],
      textStyle: { color: "#fff" } // 图例文字改为白色
    }],
    series: [
      {
        type: "graph",
        layout: "force",
        draggable: true,
        label: {
          show: true,
          position: "right",
          formatter: "{b}",
          color: "#fff" // 节点文字改为白色
        },
        roam: true,
        categories: [
          { name: "核心疾病", itemStyle: { color: "#E6A23C" } },
          { name: "环境因素", itemStyle: { color: "#409EFF" } },
          { name: "行为因素", itemStyle: { color: "#67C23A" } },
          { name: "并发症", itemStyle: { color: "#F56C6C" } }
        ],
        force: {
          repulsion: 400,
          edgeLength: 120
        },
        data: [
          { name: "干眼症", symbolSize: 90, category: 0 },
          { name: "高海拔", symbolSize: 50, category: 1 },
          { name: "强紫外线", symbolSize: 50, category: 1 },
          { name: "低湿度", symbolSize: 50, category: 1 },
          { name: "屏幕时间过长", symbolSize: 45, category: 2 },
          { name: "隐形眼镜佩戴", symbolSize: 45, category: 2 },
          { name: "睑板腺萎缩", symbolSize: 60, category: 3 },
          { name: "角膜炎", symbolSize: 45, category: 3 },
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
          color: "#999", // 连线颜色
          curveness: 0.3,
          width: 1.5
        },
        edgeLabel: {
          show: true,
          formatter: "{c}",
          fontSize: 10,
          color: "#ccc" // 连线文字颜色
        }
      }
    ]
  }

  myChart.setOption(option)
  window.addEventListener("resize", () => myChart.resize())
})

onBeforeUnmount(() => {
  if (myChart) {
    myChart.dispose()
  }
})
</script>

<template>
  <div class="graph-container">
    <div ref="graphRef" style="width: 100%; height: 100%; min-height: 400px;" />
  </div>
</template>

<style scoped>
/* 容器本身不需要背景色，因为它将放在半透明的卡片中 */
.graph-container {
  width: 100%;
  height: 100%;
}
</style>
