<script setup>
import axios from "axios"
import * as echarts from "echarts"
import "echarts-gl"
import { onBeforeUnmount, onMounted, ref } from "vue"
import { ElMessage } from "element-plus"

const chartRef = ref(null)
let myChart = null

// 模拟数据：给不同城市设置明显的“高度差异”，制造沟壑感
const mockData = [
  { name: "昆明市", value: 88, height: 5.5, info: "省会城市，医疗资源集中" },
  { name: "大理白族自治州", value: 45, height: 3.0, info: "紫外线较强，需注意防护" },
  { name: "丽江市", value: 70, height: 4.5, info: "高海拔旅游区，干眼症高发" },
  { name: "西双版纳傣族自治州", value: 30, height: 1.5, info: "湿度大，发病率较低" },
  { name: "迪庆藏族自治州", value: 95, height: 8.0, info: "极高海拔，缺氧环境影响泪膜" },
  { name: "曲靖市", value: 65, height: 3.5, info: "工业城市，空气质量影响" },
  { name: "怒江傈僳族自治州", value: 80, height: 6.5, info: "峡谷地形，风速影响" },
  { name: "昭通市", value: 55, height: 4.0, info: "高原季风气候" },
  { name: "红河哈尼族彝族自治州", value: 50, height: 2.5, info: "梯田农业区" },
  { name: "文山壮族苗族自治州", value: 40, height: 2.0, info: "喀斯特地貌" },
  { name: "玉溪市", value: 60, height: 3.2, info: "抚仙湖周边湿度适宜" },
  { name: "楚雄彝族自治州", value: 58, height: 3.8, info: "干热河谷气候" },
  { name: "普洱市", value: 35, height: 1.8, info: "森林覆盖率高" },
  { name: "临沧市", value: 38, height: 2.2, info: "亚热带季风气候" },
  { name: "德宏傣族景颇族自治州", value: 32, height: 1.2, info: "雨量充沛" },
  { name: "保山市", value: 42, height: 2.8, info: "干湿季节分明" }
]

onMounted(async () => {
  if (!chartRef.value) return
  myChart = echarts.init(chartRef.value)
  myChart.showLoading({ text: "正在构建 3D 地形...", color: "#00eaff", maskColor: "rgba(0,0,0,0.5)", textColor: "#fff" })

  try {
    const res = await axios.get("https://geo.datav.aliyun.com/areas_v2/bound/530000_full.json")
    echarts.registerMap("yunnan", res.data)
    myChart.hideLoading()

    myChart.setOption({
      backgroundColor: 'transparent',
      tooltip: { show: false }, // 关闭默认 tooltip，用点击事件代替，防止遮挡

      // 视觉映射：颜色更深邃，对比度更高
      visualMap: {
        show: false,
        min: 0,
        max: 100,
        inRange: {
          color: ['#0B1B32', '#14365D', '#1D5A8C', '#2882C0', '#30A5F2', '#6DD5FA']
        }
      },
      series: [{
        type: 'map3D',
        map: 'yunnan',
        name: '云南干眼症分布',

        // === ⛰️ 地形起伏核心配置 ===
        regionHeight: 4, // 基础厚度
        data: mockData,  // 数据中包含 height 属性，echarts-gl 会自动识别并叠加高度

        // === 🎬 电影级光影 ===
        shading: 'realistic',
        realisticMaterial: {
          detailTexture: '',
          roughness: 0.4, // 稍微粗糙一点，像岩石/磨砂
          metalness: 0.3, // 一点点金属感
        },

        // 后期特效：增加阴影缝隙
        postEffect: {
          enable: true,
          SSAO: {
            enable: true,
            radius: 4, // 阴影范围变大
            intensity: 1.8, // 阴影变黑，立体感剧增
            quality: 'high'
          }
        },

        // 灯光：消除奇怪亮斑，使用柔和的侧顶光
        light: {
          main: {
            intensity: 1.0,
            shadow: true,
            shadowQuality: 'high',
            alpha: 45, // 垂直角度
            beta: -20  // 水平角度
          },
          ambient: {
            intensity: 0.3 // 环境光暗一点，对比更强
          }
        },

        // 样式细节
        itemStyle: {
          color: '#14365D',
          borderColor: '#409EFF',
          borderWidth: 0.5
        },
        emphasis: {
          label: { show: true, color: '#fff', fontSize: 18, fontWeight: 'bold' },
          itemStyle: { color: '#ffbd59' }
        },

        // 视角：稍微拉近一点
        viewControl: {
          projection: 'perspective',
          autoRotate: true,
          autoRotateSpeed: 4,
          damping: 0.8,
          alpha: 50,
          beta: 5,
          distance: 105,
          minAlpha: 20,
          maxAlpha: 80
        }
      }]
    })

    // === 🖱️ 添加点击交互 ===
    myChart.on('click', (params) => {
      // 停止自动旋转，方便查看
      myChart.setOption({ series: [{ viewControl: { autoRotate: false } }] })

      // 查找详细信息
      const cityData = mockData.find(item => item.name === params.name)
      const info = cityData ? cityData.info : "暂无详细数据"
      const value = params.value || "未知"

      // 弹出提示 (这里用 Element Plus 的 Notification，显得高级)
      ElMessage({
        message: `已选中【${params.name}】\n发病率：${value}%\n分析：${info}`,
        type: 'success',
        duration: 5000,
        showClose: true,
        grouping: true,
      })

      // 3秒后恢复旋转
      setTimeout(() => {
        myChart.setOption({ series: [{ viewControl: { autoRotate: true } }] })
      }, 3000)
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
