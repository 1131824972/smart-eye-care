<script setup>
import axios from "axios"
import * as echarts from "echarts"
import "echarts-gl"
import { onBeforeUnmount, onMounted, ref } from "vue"
import { Close, Location } from "@element-plus/icons-vue"

const chartRef = ref(null)
let myChart = null

// 控制悬浮窗状态
const showModal = ref(false)
const currentCity = ref({})

// 详细城市数据（模拟数据库）
const cityDetails = {
  "昆明市": {
    desc: "省会城市，医疗资源丰富，但干燥多风，干眼症发病率较高。",
    population: "860万",
    hospitals: 12,
    weather: "干燥"
  },
  "丽江市": {
    desc: "高海拔强紫外线地区，游客与居民均为高发人群，需加强防护。",
    population: "130万",
    hospitals: 3,
    weather: "强UV"
  },
  "西双版纳傣族自治州": {
    desc: "热带雨林气候，空气湿度大，自然缓解干眼症状，风险全省最低。",
    population: "130万",
    hospitals: 4,
    weather: "湿润"
  },
  "迪庆藏族自治州": {
    desc: "极高海拔寒冷缺氧，睑板腺功能障碍频发，属于重点预警区域。",
    population: "38万",
    hospitals: 2,
    weather: "高寒"
  },
  // ... 其他城市默认文案
}

// 基础数据：高度和风险值
const mockData = [
  { name: "昆明市", value: 88, height: 6 },
  { name: "曲靖市", value: 65, height: 4 },
  { name: "玉溪市", value: 30, height: 3 },
  { name: "保山市", value: 50, height: 4 },
  { name: "昭通市", value: 55, height: 5 },
  { name: "丽江市", value: 75, height: 7 }, // 高海拔，红色预警
  { name: "普洱市", value: 25, height: 2 },
  { name: "临沧市", value: 30, height: 3 },
  { name: "楚雄彝族自治州", value: 45, height: 4 },
  { name: "红河哈尼族彝族自治州", value: 35, height: 2 },
  { name: "文山壮族苗族自治州", value: 28, height: 2 },
  { name: "西双版纳傣族自治州", value: 20, height: 1 }, // 低风险，绿色/蓝色
  { name: "大理白族自治州", value: 60, height: 5 },
  { name: "德宏傣族景颇族自治州", value: 35, height: 2 },
  { name: "怒江傈僳族自治州", value: 82, height: 8 },
  { name: "迪庆藏族自治州", value: 95, height: 9 } // 极高风险
]

const initChart = async () => {
  if (!chartRef.value) return
  myChart = echarts.init(chartRef.value)

  myChart.showLoading({
    text: '地形数据加载中...',
    color: '#00eaff',
    textColor: '#00eaff',
    maskColor: 'rgba(0,0,0,0.1)'
  })

  try {
    const res = await axios.get("https://geo.datav.aliyun.com/areas_v3/bound/530000_full.json")
    echarts.registerMap("yunnan", res.data)
    myChart.hideLoading()

    myChart.setOption({
      backgroundColor: 'transparent', // 保持透明背景

      // 1. 悬停 Tooltip：只显示关键指标，保持简洁
      tooltip: {
        show: true,
        trigger: 'item',
        backgroundColor: 'rgba(0,0,0,0.7)',
        borderColor: '#00eaff',
        textStyle: { color: '#fff' },
        formatter: params => {
          return `${params.name}<br/>风险指数：<b style="color:${params.value > 60 ? '#f56c6c' : '#00eaff'}">${params.value}</b>`
        }
      },

      // 2. 视觉映射 (核心修复)：根据 value 值决定颜色
      visualMap: {
        show: true,
        min: 0,
        max: 100,
        right: 20,
        bottom: 20,
        text: ['高风险', '低风险'],
        textStyle: { color: '#fff' },
        inRange: {
          // 颜色渐变：深蓝(低) -> 青色 -> 黄色 -> 红色(高)
          // 这样既保留科技感，又能一眼看出哪里严重
          color: ['#10284d', '#0072ff', '#00eaff', '#e6a23c', '#f56c6c']
        },
        calculable: true
      },

      series: [{
        type: 'map3D',
        map: 'yunnan',
        name: '云南',
        regionHeight: 3.5, // 适当的厚度

        // 材质：使用 lambert 模式，相比 realistic 这种模式对颜色的还原更准确，不会因为光照变得黑乎乎的
        shading: 'lambert',

        // 灯光：增强环境光，确保颜色鲜艳
        light: {
          main: {
            intensity: 1.2,
            shadow: true,
            shadowQuality: 'medium',
            alpha: 50,
            beta: -10
          },
          ambient: {
            intensity: 0.6 // 提高环境光，防止阴影面太黑
          }
        },

        // 3. 标签美化：无背景 + 描边
        label: {
          show: true,
          distance: 12,
          textStyle: {
            color: '#fff',        // 白色文字
            fontSize: 12,
            fontWeight: 'bold',
            fontFamily: 'Microsoft YaHei',
            backgroundColor: 'transparent', // 🚫 去掉白色背景框
            textBorderColor: '#000',        // ✅ 加上黑色描边，保证看清
            textBorderWidth: 3              // 描边宽度
          }
        },

        // 样式：去掉 color 属性，让 visualMap 生效
        itemStyle: {
          // color: '#xxx', // ⚠️ 这里千万不能写死颜色，否则 visualMap 会失效
          opacity: 1,
          borderWidth: 0.8,
          borderColor: '#a3d3ff' // 浅蓝边框，勾勒轮廓
        },

        // 鼠标悬停高亮
        emphasis: {
          label: { show: true, color: '#fdd835' },
          itemStyle: { color: '#fdd835' } // 亮黄色高亮
        },

        // 视角
        viewControl: {
          projection: 'perspective',
          autoRotate: true,
          autoRotateSpeed: 5,
          distance: 120,
          alpha: 40,
          beta: 5,
          minAlpha: 20,
          maxAlpha: 80
        },

        data: mockData
      }]
    })

    // 点击事件监听
    myChart.on('click', params => {
      // 停止旋转
      myChart.setOption({ series: [{ viewControl: { autoRotate: false } }] })

      // 组装数据
      const detail = cityDetails[params.name] || {
        desc: "暂无详细环境与病理分析数据。",
        population: "未知",
        hospitals: "-",
        weather: "-"
      }

      currentCity.value = {
        name: params.name,
        risk: params.value,
        ...detail
      }
      showModal.value = true
    })

    // 点击空白处关闭弹窗（需要监听 zr）
    myChart.getZr().on('click', (params) => {
      if (!params.target) {
        showModal.value = false
        myChart.setOption({ series: [{ viewControl: { autoRotate: true } }] })
      }
    })

  } catch (e) {
    console.error(e)
    myChart.hideLoading()
  }

  window.addEventListener("resize", () => myChart && myChart.resize())
}

const closeModal = () => {
  showModal.value = false
  if(myChart) {
    myChart.setOption({ series: [{ viewControl: { autoRotate: true } }] })
  }
}

onBeforeUnmount(() => {
  myChart?.dispose()
})

onMounted(() => {
  initChart()
})
</script>

<template>
  <div class="map-wrapper">
    <div ref="chartRef" style="width: 100%; height: 100%;"></div>

    <!-- 科技感悬浮窗 -->
    <transition name="el-zoom-in-top">
      <div v-if="showModal" class="city-modal">
        <!-- 弹窗头部 -->
        <div class="modal-head">
          <div class="title-group">
            <el-icon class="icon"><Location /></el-icon>
            <span class="city">{{ currentCity.name }}</span>
          </div>
          <el-icon class="close" @click="closeModal"><Close /></el-icon>
        </div>

        <!-- 弹窗内容 -->
        <div class="modal-content">
          <div class="risk-row">
            <span>综合风险指数</span>
            <span class="score" :class="currentCity.risk > 60 ? 'high' : 'low'">
              {{ currentCity.risk }}
            </span>
          </div>

          <div class="metrics">
            <div class="m-item">
              <span class="label">人口</span>
              <span class="val">{{ currentCity.population }}</span>
            </div>
            <div class="m-item">
              <span class="label">三甲医院</span>
              <span class="val">{{ currentCity.hospitals }}</span>
            </div>
            <div class="m-item">
              <span class="label">气候特征</span>
              <span class="val">{{ currentCity.weather }}</span>
            </div>
          </div>

          <div class="desc">
            <p>{{ currentCity.desc }}</p>
          </div>
        </div>

        <!-- 装饰线条 -->
        <div class="line-deco"></div>
      </div>
    </transition>
  </div>
</template>

<style scoped lang="scss">
.map-wrapper {
  width: 100%;
  height: 600px;
  position: relative;
  background: transparent;
}

/* 悬浮窗样式：深色玻璃拟态 + 科技蓝 */
.city-modal {
  position: absolute;
  top: 15%;
  right: 5%; /* 靠右显示，不遮挡地图主体 */
  width: 320px;
  background: rgba(13, 24, 46, 0.85); /* 深蓝半透明 */
  backdrop-filter: blur(12px);
  border: 1px solid #1e4f8a;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  color: #fff;
  z-index: 999;
  overflow: hidden;

  .modal-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 20px;
    background: linear-gradient(90deg, rgba(0, 234, 255, 0.1), transparent);
    border-bottom: 1px solid rgba(255,255,255,0.05);

    .title-group {
      display: flex;
      align-items: center;
      gap: 8px;
      .icon { color: #00eaff; font-size: 18px; }
      .city { font-size: 18px; font-weight: bold; letter-spacing: 1px; }
    }
    .close {
      cursor: pointer;
      color: #909399;
      transition: color 0.3s;
      &:hover { color: #fff; }
    }
  }

  .modal-content {
    padding: 20px;

    .risk-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      font-size: 14px;
      color: #ccc;

      .score {
        font-size: 28px;
        font-weight: bold;
        font-family: 'Impact', sans-serif;
        &.high { color: #f56c6c; text-shadow: 0 0 10px rgba(245, 108, 108, 0.4); }
        &.low { color: #00eaff; text-shadow: 0 0 10px rgba(0, 234, 255, 0.4); }
      }
    }

    .metrics {
      display: flex;
      justify-content: space-between;
      margin-bottom: 20px;
      background: rgba(0,0,0,0.2);
      padding: 10px;
      border-radius: 4px;

      .m-item {
        text-align: center;
        display: flex;
        flex-direction: column;
        .label { font-size: 12px; color: #8faecf; margin-bottom: 4px; }
        .val { font-size: 14px; font-weight: bold; color: #fff; }
      }
    }

    .desc {
      font-size: 13px;
      line-height: 1.6;
      color: #b9d3ee;
      text-align: justify;
      background: rgba(64, 158, 255, 0.1);
      padding: 10px;
      border-radius: 4px;
      border-left: 3px solid #409EFF;
    }
  }

  .line-deco {
    height: 2px;
    width: 100%;
    background: linear-gradient(90deg, #00eaff, transparent);
  }
}
</style>
