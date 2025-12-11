<script setup>
import axios from "axios"
import * as echarts from "echarts"
import "echarts-gl"
import { onBeforeUnmount, onMounted, ref } from "vue"

const chartRef = ref(null)
let myChart = null

// 模拟数据：稍微打乱一下高度，让起伏更明显，更有山脉的感觉
const mockData = [
  { name: "昆明市", value: 88, height: 6 },
  { name: "大理白族自治州", value: 45, height: 3.5 },
  { name: "丽江市", value: 70, height: 4.5 },
  { name: "西双版纳傣族自治州", value: 30, height: 2 },
  { name: "迪庆藏族自治州", value: 95, height: 8 }, // 海拔高，设高一点
  { name: "曲靖市", value: 65, height: 4 },
  { name: "怒江傈僳族自治州", value: 80, height: 7 },
  { name: "昭通市", value: 55, height: 5 },
  { name: "文山壮族苗族自治州", value: 40, height: 2.5 }
]

onMounted(async () => {
  if (!chartRef.value) return
  myChart = echarts.init(chartRef.value)
  myChart.showLoading({ text: "正在加载数字孪生模型...", color: "#00eaff", maskColor: "rgba(0,0,0,0.8)", textColor: "#fff" })

  try {
    const res = await axios.get("https://geo.datav.aliyun.com/areas_v2/bound/530000_full.json")
    echarts.registerMap("yunnan", res.data)
    myChart.hideLoading()

    myChart.setOption({
      // 背景设为透明，依靠父级背景
      backgroundColor: 'transparent',
      tooltip: {
        show: true,
        backgroundColor: "rgba(0,18,36,0.9)",
        borderColor: "#00eaff",
        borderWidth: 1,
        padding: [10, 15],
        textStyle: { color: "#fff", fontSize: 14 },
        formatter: (params) => {
          if (!params.name) return ''
          return `
            <div style="display:flex;align-items:center;margin-bottom:5px">
              <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#00eaff;margin-right:8px"></span>
              <span style="font-weight:bold;font-size:16px">${params.name}</span>
            </div>
            <div style="color:#aaa;font-size:12px">干眼症风险指数：<b style="color:#f56c6c;font-size:16px">${params.value || '未知'}</b></div>
          `
        }
      },
      // 视觉映射：调整为更有层次的蓝紫色
      visualMap: {
        show: false,
        min: 0,
        max: 100,
        inRange: {
          color: [
            '#0f1c3a', // 低海拔/低风险：深邃蓝
            '#1b3a69',
            '#235c96',
            '#00eaff'  // 高风险：亮青色
          ]
        }
      },
      series: [{
        type: 'map3D',
        map: 'yunnan',
        name: '云南干眼症分布',

        // === 核心：高度与体积 ===
        regionHeight: 5, // 拉高厚度，增加体积感
        boxDepth: 100, // 场景深度

        // === 核心：真实感材质 ===
        shading: 'realistic',
        realisticMaterial: {
          roughness: 0.3, // 粗糙度：调低一点，让它有点像磨砂金属
          metalness: 0.5, // 金属度：调高一点，增加反光质感
        },

        // === 核心：后期特效 (好不好看全靠这个) ===
        postEffect: {
          enable: true,
          // 1. 环境光遮蔽 (SSAO)：增加积木缝隙的阴影，极大地增强立体感
          SSAO: {
            enable: true,
            radius: 3, // 阴影半径
            intensity: 1.2, // 阴影强度
            quality: 'high'
          },
          // 2. 泛光 (Bloom)：让高亮边缘发出辉光
          bloom: {
            enable: true,
            strength: 0.2,
            radius: 0.5,
            threshold: 0.8
          },
          // 3. 景深 (Depth of Field)：让远处稍微模糊，增加摄影感 (可选，不需要可关掉)
          // depthOfField: {
          //   enable: true,
          //   focalDistance: 100,
          //   focalRange: 20
          // }
        },

        // === 核心：灯光系统 (告别死白光) ===
        light: {
          main: {
            intensity: 0.8, // 降低主光源，避免过曝
            shadow: true,   // 开启主光阴影
            shadowQuality: 'high',
            alpha: 40,      // 光照角度：从侧上方打下来
            beta: -30
          },
          ambient: {
            intensity: 0.4  // 提高环境光，让暗部也能看清颜色
          }
        },

        // 数据
        data: mockData,

        // 样式细节
        itemStyle: {
          // 默认颜色 (如果没有数据覆盖)
          color: '#0f1c3a',
          borderColor: '#409EFF', // 边框颜色
          borderWidth: 0.5
        },

        // 鼠标悬停高亮
        emphasis: {
          label: {
            show: true,
            color: '#fff',
            fontSize: 16,
            fontWeight: 'bold',
            backgroundColor: 'rgba(0,0,0,0.5)',
            padding: [3, 5],
            borderRadius: 3
          },
          itemStyle: {
            color: '#ffbd59', // 金色高亮
            borderColor: '#fff',
            borderWidth: 1
          }
        },

        // 视角控制
        viewControl: {
          projection: 'perspective',
          autoRotate: true, // 开启自动旋转，增加动感！
          autoRotateSpeed: 5, // 旋转速度慢一点
          autoRotateAfterStill: 3, // 鼠标静止3秒后自动旋转
          damping: 0.8,
          alpha: 45, // 最佳俯视角度
          beta: 10,
          distance: 120, // 视距
          minAlpha: 20,
          maxAlpha: 80
        }
      }]
    })
  } catch (e) { console.error(e) }

  window.addEventListener("resize", () => myChart && myChart.resize())
})

onBeforeUnmount(() => {
  if (myChart) {
    window.removeEventListener("resize", () => myChart.resize())
    myChart.dispose()
  }
})
</script>

<template>
  <div ref="chartRef" style="width: 100%; height: 100%; min-height: 600px;"></div>
</template>
