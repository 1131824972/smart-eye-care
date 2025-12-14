<script setup>
import KnowledgeGraph from "@/components/KnowledgeGraph.vue"
import YunnanMap from "@/components/YunnanMap.vue"
import { ref } from "vue"

// 模拟顶部关键指标数据
const stats = ref([
  { title: "今日确诊病例", value: 128, unit: "例" },
  { title: "高风险地区", value: 5, unit: "个" },
  { title: "AI诊断准确率", value: 98.2, unit: "%" },
  { title: "覆盖云南州市", value: 16, unit: "个" }
])
</script>

<template>
  <div class="datav-container">
    <div class="datav-header">
      <div class="header-decoration left" />
      <div class="header-title">
        多模态干眼症智慧诊疗监管平台
        <div class="subtitle">
          Multimodal Smart Dry Eye Care System
        </div>
      </div>
      <div class="header-decoration right" />
    </div>

    <div class="datav-content">
      <div class="stats-row">
        <div v-for="(item, index) in stats" :key="index" class="stat-card">
          <div class="stat-title">
            {{ item.title }}
          </div>
          <div class="stat-value">
            {{ item.value }}<span class="unit">{{ item.unit }}</span>
          </div>
          <!-- 装饰角标 -->
          <div class="card-corner corner-tl" />
          <div class="card-corner corner-tr" />
          <div class="card-corner corner-bl" />
          <div class="card-corner corner-br" />
        </div>
      </div>

      <el-row :gutter="20" style="margin-top: 20px;">
        <!-- 左侧：地图区域 -->
        <el-col :span="14">
          <div class="panel-box" style="min-height: 820px;">
            <div class="panel-title">
              📍 云南省环境因素态势感知
            </div>
            <div class="panel-body">
              <YunnanMap />
            </div>
            <!-- 面板角标 -->
            <div class="panel-corner corner-1" />
            <div class="panel-corner corner-2" />
            <div class="panel-corner corner-3" />
            <div class="panel-corner corner-4" />
          </div>
        </el-col>

        <!-- 右侧：图谱与日志 -->
        <el-col :span="10">
          <div class="panel-box mb-20" style="height: 500px;">
            <div class="panel-title">
              🕸️ 病因多模态关联图谱
            </div>
            <div class="panel-body">
              <!-- 这里需要你的知识图谱组件也是透明或深色背景 -->
              <KnowledgeGraph />
            </div>
            <div class="panel-corner corner-1" />
            <div class="panel-corner corner-2" />
            <div class="panel-corner corner-3" />
            <div class="panel-corner corner-4" />
          </div>

          <div class="panel-box" style="height: 300px;">
            <div class="panel-title">
              ⚠️ 实时AI预警日志
            </div>
            <div class="panel-body scrollable">
              <div v-for="i in 8" :key="i" class="log-item">
                <span class="time">10:{{ 20 + i }}</span>
                <span class="tag warning">高风险</span>
                <span class="content">检测到昆明市盘龙区新增一例重度睑板腺萎缩...</span>
              </div>
            </div>
            <div class="panel-corner corner-1" />
            <div class="panel-corner corner-2" />
            <div class="panel-corner corner-3" />
            <div class="panel-corner corner-4" />
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<style scoped>
/* 全屏深色背景 */
.datav-container {
  width: 100%;
  min-height: 100vh;
  overflow-y: auto;
  /* 深蓝偏黑的背景 */
  background-color: #03081b;
  /* 加一点网格纹理，增加科技感 */
  background-image:
    linear-gradient(rgba(18, 52, 86, 0.3) 1px, transparent 1px),
    linear-gradient(90deg, rgba(18, 52, 86, 0.3) 1px, transparent 1px);
  background-size: 30px 30px;
  color: #fff;
  padding: 0 20px 20px 20px;
  box-sizing: border-box;
}

/* 顶部标题栏 */
.datav-header {
  height: 80px;
  display: flex;
  justify-content: center;
  align-items: center;
  /* 可以在这里加一个标题底图 */
  border-bottom: 1px solid rgba(0, 110, 255, 0.2);
  margin-bottom: 20px;
  position: relative;
}
.header-title {
  font-size: 32px;
  font-weight: bold;
  letter-spacing: 4px;
  text-shadow: 0 0 10px #00eaff;
  text-align: center;
  /* 文字渐变 */
  background: linear-gradient(to bottom, #fff, #70aaff);
  -webkit-background-clip: text;
  color: transparent;
}
.subtitle {
  font-size: 12px;
  letter-spacing: 1px;
  color: #558abb;
  margin-top: 5px;
}

/* 指标卡片 */
.stats-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}
.stat-card {
  width: 24%;
  height: 80px;
  background: rgba(14, 34, 69, 0.6);
  border: 1px solid #1c3e72;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
}
.stat-title { font-size: 14px; color: #9aa8d4; }
.stat-value { font-size: 28px; color: #00eaff; font-weight: bold; }
.unit { font-size: 14px; margin-left: 5px; color: #fff; }

/* 面板通用样式 */
.panel-box {
  background: rgba(14, 34, 69, 0.4);
  border: 1px solid #10284d;
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 15px;
}
.panel-title {
  font-size: 18px;
  color: #fff;
  border-left: 4px solid #00eaff;
  padding-left: 10px;
  margin-bottom: 15px;
  background: linear-gradient(90deg, rgba(0, 234, 255, 0.1) 0%, transparent 100%);
}
.panel-body { flex: 1; overflow: hidden; position: relative; }

/* 装饰角标 */
.card-corner, .panel-corner {
  position: absolute; width: 10px; height: 10px; border: 2px solid #00eaff;
}
.corner-tl, .corner-1 { top: 0; left: 0; border-right: 0; border-bottom: 0; }
.corner-tr, .corner-2 { top: 0; right: 0; border-left: 0; border-bottom: 0; }
.corner-bl, .corner-3 { bottom: 0; left: 0; border-right: 0; border-top: 0; }
.corner-br, .corner-4 { bottom: 0; right: 0; border-left: 0; border-top: 0; }

.log-item {
  display: flex; align-items: center; padding: 10px 0; border-bottom: 1px dashed #1c3e72; color: #ccc; font-size: 13px;
}
.log-item .tag { background: rgba(245, 108, 108, 0.2); color: #f56c6c; padding: 2px 5px; border-radius: 2px; margin-right: 10px; }
.mb-20 { margin-bottom: 20px; }
</style>
