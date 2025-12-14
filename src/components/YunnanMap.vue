<script setup>
import axios from "axios"
import * as echarts from "echarts"
import "echarts-gl"
import { onBeforeUnmount, onMounted, ref } from "vue"
import { ElMessage } from "element-plus"

const chartRef = ref(null)
let myChart = null

// 模拟一张噪点纹理图，用于给地图表面增加“山脉/岩石”的质感
// 这是一个很小的 Base64 图片，重复铺贴可以产生纹理效果
const noiseTexture = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAIAAAFSDNZaAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2ZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczpTtRefAAAALElEQVRYce3MwQkAMAgYsP3/3+2zV4iC5Baw700l1fP5fD6fz+fz+Xw+n/8rTwE7ywV4+b6tAAAAAElFTkSuQmCC'

const mockData = [
  { name: "昆明市", value: 88, height: 6 },
  { name: "大理白族自治州", value: 45, height: 3.5 },
  { name: "丽江市", value: 70, height: 5.5 }, // 丽江海拔高
  { name: "西双版纳傣族自治州", value: 30, height: 1.5 }, // 版纳低
  { name: "迪庆藏族自治州", value: 95, height: 8 }, // 香格里拉最高
  { name: "曲靖市", value: 65, height: 4 },
  { name: "怒江傈僳族自治州", value: 80, height: 7 },
  { name: "昭通市", value: 55, height: 5 },
  { name: "文山壮族苗族自治州", value: 40, height: 2.5 },
  { name: "红河哈尼族彝族自治州", value: 42, height: 2.0 },
  { name: "普洱市", value: 36, height: 2.2 },
  { name: "楚雄彝族自治州", value: 52, height: 3.8 },
  { name: "玉溪市", value: 48, height: 3.2 },
  { name: "保山市", value: 45, height: 3.0 },
  { name: "德宏傣族景颇族自治州", value: 35, height: 1.8 },
  { name: "临沧市", value: 38, height: 2.4 }
]

onMounted(async () => {
  if (!chartRef.value) return
  myChart = echarts.init(chartRef.value)

  try {
    const res = await axios.get("https://geo.datav.aliyun.com/areas_v3/bound/530000_full.json")
    echarts.registerMap("yunnan", res.data)

    myChart.setOption({
      backgroundColor: 'transparent', // 1. 去除白色背景
      tooltip: {
        show: true,
        backgroundColor: "rgba(0,0,0,0.7)",
        borderColor: "#00eaff",
        textStyle: { color: "#fff" }
      },
      visualMap: {
        show: false,
        min: 0,
        max: 100,
        inRange: {
          // 使用更有质感的青蓝渐变
          color: ['#0E2A47', '#1D4E89', '#009688', '#00E5FF']
        }
      },
      series: [{
        type: 'map3D',
        map: 'yunnan',
        name: '云南',
        regionHeight: 4,

        // 2. 增加表面纹理和真实感材质
        shading: 'realistic',
        realisticMaterial: {
          detailTexture: noiseTexture, // 贴上噪点纹理
          textureTiling: 8, // 纹理重复次数
          roughness: 0.8, // 粗糙度，类似岩石
          metalness: 0,   // 非金属
        },

        itemStyle: {
          color: '#1D4E89',
          borderColor: '#4DE3F6',
          borderWidth: 0.8
        },

        emphasis: {
          label: { show: true, color: '#fff', fontSize: 16 },
          itemStyle: { color: '#FFD700' }
        },

        // 光照系统
        light: {
          main: {
            intensity: 1.5,
            shadow: true,
            shadowQuality: 'high',
            alpha: 45,
            beta: -10
          },
          ambient: {
            intensity: 0.5
          }
        },

        viewControl: {
          distance: 110,
          alpha: 40,
          beta: 10,
          autoRotate: true,
          autoRotateSpeed: 5
        },

        data: mockData
      }]
    })

    myChart.on('click', (params) => {
       ElMessage.info(`选中区域：${params.name} (风险指数: ${params.value || 'N/A'})`)
    })

  } catch (e) { console.error(e) }

  window.addEventListener("resize", () => myChart && myChart.resize())
})

onBeforeUnmount(() => {
  myChart?.dispose()
})
</script>

<template>
  <div ref="chartRef" style="width: 100%; height: 100%; min-height: 600px;"></div>
</template>
