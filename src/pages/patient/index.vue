<script setup>
import * as echarts from "echarts"
import { onBeforeUnmount, onMounted, ref } from "vue"

const graphRef = ref(null)
let myChart = null

const initChart = () => {
  if (!graphRef.value) return

  myChart = echarts.init(graphRef.value)

  const option = {
    backgroundColor: '#fff',
    title: {
      text: "干眼症病因多模态知识图谱",
      subtext: "点击节点查看关联 / 滚轮缩放",
      top: 20,
      left: "center"
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}'
    },
    legend: [{
      bottom: 20,
      data: ["核心疾病", "环境因素", "行为因素", "并发症", "病理改变"]
    }],
    series: [
      {
        type: "graph",
        layout: "force",
        animation: true,
        draggable: true,
        label: {
          show: true,
          position: "right",
          formatter: "{b}"
        },
        roam: true, // 允许缩放和平移
        categories: [
          { name: "核心疾病", itemStyle: { color: "#E6A23C" } },
          { name: "环境因素", itemStyle: { color: "#409EFF" } },
          { name: "行为因素", itemStyle: { color: "#67C23A" } },
          { name: "并发症", itemStyle: { color: "#F56C6C" } },
          { name: "病理改变", itemStyle: { color: "#909399" } }
        ],
        force: {
          repulsion: 400, // 增大斥力，让节点散开
          edgeLength: [100, 200],
          layoutAnimation: true
        },
        data: [
          { name: "干眼症", symbolSize: 100, category: 0, value: "核心节点" },
          // 环境因素
          { name: "高海拔", symbolSize: 60, category: 1, value: "气压低，泪液沸点降低" },
          { name: "强紫外线", symbolSize: 60, category: 1, value: "氧化应激损伤" },
          { name: "低湿度", symbolSize: 60, category: 1, value: "加速泪液蒸发" },
          // 行为因素
          { name: "屏幕时间过长", symbolSize: 50, category: 2, value: "瞬目减少" },
          { name: "隐形眼镜佩戴", symbolSize: 50, category: 2, value: "机械摩擦" },
          // 病理
          { name: "睑板腺萎缩", symbolSize: 70, category: 4, value: "脂质层缺乏" },
          // 并发症
          { name: "角膜炎", symbolSize: 50, category: 3, value: "感染风险" },
          { name: "视疲劳", symbolSize: 40, category: 3, value: "常见伴随症状" }
        ],
        links: [
          { source: "高海拔", target: "干眼症", value: "诱发" },
          { source: "强紫外线", target: "干眼症", value: "加重" },
          { source: "低湿度", target: "干眼症", value: "直接原因" },
          { source: "屏幕时间过长", target: "干眼症", value: "诱发" },
          { source: "隐形眼镜佩戴", target: "干眼症", value: "高风险" },
          { source: "干眼症", target: "睑板腺萎缩", value: "互为因果" },
          { source: "干眼症", target: "角膜炎", value: "并发症" },
          { source: "干眼症", target: "视疲劳", value: "典型症状" },
          { source: "强紫外线", target: "睑板腺萎缩", value: "长期损伤" },
          { source: "高海拔", target: "低湿度", value: "伴随" }
        ],
        lineStyle: {
          color: "source",
          curveness: 0.3,
          width: 2
        },
        edgeLabel: {
          show: true,
          formatter: "{c}", // 显示连线上的文字
          fontSize: 10,
          color: "#666"
        },
        emphasis: {
          focus: 'adjacency',
          lineStyle: {
            width: 4
          }
        }
      }
    ]
  }

  myChart.setOption(option)
}

const resizeHandler = () => myChart && myChart.resize()

onMounted(() => {
  initChart()
  window.addEventListener("resize", resizeHandler)
})

onBeforeUnmount(() => {
  window.removeEventListener("resize", resizeHandler)
  if (myChart) myChart.dispose()
})
</script>

<template>
  <div class="knowledge-graph-box">
    <div ref="graphRef" class="graph-chart"></div>
  </div>
</template>

<style scoped>
.knowledge-graph-box {
  width: 100%;
  height: 100%;
  min-height: 500px;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
}
.graph-chart {
  width: 100%;
  height: 100%;
  min-height: 500px;
}
</style>
