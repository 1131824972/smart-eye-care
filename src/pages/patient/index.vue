<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { UploadFilled, Camera, User, LocationInformation, Document } from '@element-plus/icons-vue'

const router = useRouter()
const loading = ref(false)

// 表单数据模型
const form = reactive({
  name: '',
  age: 35,
  gender: '男',
  region: '昆明市',
  occupation: '',
  history: '',
  symptoms: [] as string[],
  osdiScore: 0 // 干眼症状评分
})

// 云南地区选项
const regions = [
  { label: '昆明市', value: '昆明市' },
  { label: '大理白族自治州', value: '大理白族自治州' },
  { label: '丽江市', value: '丽江市' },
  { label: '西双版纳', value: '西双版纳傣族自治州' },
  { label: '迪庆(香格里拉)', value: '迪庆藏族自治州' },
  { label: '昭通市', value: '昭通市' },
  { label: '曲靖市', value: '曲靖市' }
]

const fileList = ref<any[]>([])

const handleUploadChange = (file: any) => {
  fileList.value = [file]
  ElMessage.success('影像上传成功')
}

// 模拟提交并跳转
const submitForm = () => {
  if (!form.name || !form.region) {
    ElMessage.warning('请完善患者基本信息')
    return
  }

  if (fileList.value.length === 0) {
    ElMessage.warning('请上传眼表影像以进行AI分析')
    return
  }

  loading.value = true

  // 模拟网络请求耗时
  setTimeout(() => {
    loading.value = false

    // 构造传递给诊断页面的数据
    const patientData = {
      ...form,
      // 如果有上传图片，生成预览URL，否则为空
      image: fileList.value.length ? URL.createObjectURL(fileList.value[0].raw) : null
    }

    // 存入本地存储，供诊断页面读取
    localStorage.setItem('currentPatient', JSON.stringify(patientData))

    ElMessage.success('数据录入成功，正在调用 KAN 模型分析...')
    router.push('/diagnosis/index')
  }, 1000)
}
</script>

<template>
  <div class="collect-container">
    <!-- 顶部引导 -->
    <div class="page-header">
      <div class="header-content">
        <h2>多模态数据采集工作台</h2>
        <p>Multimodal Data Collection: Structured Text + Ocular Surface Imaging</p>
      </div>
      <el-steps :active="1" simple style="width: 400px; background: transparent;">
        <el-step title="信息采集" icon="Edit" />
        <el-step title="智能诊断" icon="MagicStick" />
        <el-step title="生成报告" icon="DocumentChecked" />
      </el-steps>
    </div>

    <el-row :gutter="24">
      <!-- 左侧：结构化信息录入 -->
      <el-col :span="14">
        <el-card shadow="hover" class="form-card">
          <template #header>
            <div class="card-title">
              <el-icon><User /></el-icon>
              <span>患者基本档案 (Structured Data)</span>
            </div>
          </template>

          <el-form :model="form" label-position="top" size="large">
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="姓名" required>
                  <el-input v-model="form.name" placeholder="输入姓名" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="年龄">
                  <el-input-number v-model="form.age" :min="1" :max="120" style="width: 100%" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="性别">
                  <el-select v-model="form.gender">
                    <el-option label="男" value="男" />
                    <el-option label="女" value="女" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="居住地区 (关联环境因子)" required>
                  <el-select v-model="form.region" placeholder="请选择云南州市" style="width: 100%">
                    <template #prefix><el-icon><LocationInformation /></el-icon></template>
                    <el-option v-for="item in regions" :key="item.value" :label="item.label" :value="item.value" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="职业 (选填)">
                  <el-input v-model="form.occupation" placeholder="如：IT工程师、教师" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-divider border-style="dashed" content-position="left">症状评估 (OSDI 简化版)</el-divider>

            <el-form-item label="主诉症状 (多选)">
              <el-checkbox-group v-model="form.symptoms">
                <el-checkbox-button label="眼干涩" name="symptoms" />
                <el-checkbox-button label="异物感" name="symptoms" />
                <el-checkbox-button label="畏光" name="symptoms" />
                <el-checkbox-button label="视力波动" name="symptoms" />
                <el-checkbox-button label="眼红/充血" name="symptoms" />
                <el-checkbox-button label="分泌物多" name="symptoms" />
              </el-checkbox-group>
            </el-form-item>

            <el-form-item label="既往病史/用药史">
              <el-input
                v-model="form.history"
                type="textarea"
                :rows="2"
                placeholder="例如：有长期佩戴隐形眼镜史，或近期进行过眼部手术..."
              />
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <!-- 右侧：影像采集区域 -->
      <el-col :span="10">
        <el-card shadow="hover" class="upload-card">
          <template #header>
            <div class="card-title">
              <el-icon><Camera /></el-icon>
              <span>眼表影像采集 (Image Data)</span>
            </div>
          </template>

          <div class="upload-container">
            <el-upload
              class="upload-box"
              drag
              action="#"
              :auto-upload="false"
              :on-change="handleUploadChange"
              :show-file-list="false"
            >
              <div v-if="fileList.length > 0" class="preview-area">
                <img :src="URL.createObjectURL(fileList[0].raw)" class="preview-img" />
                <div class="mask">
                  <el-icon><Camera /></el-icon>
                  <span>点击重新上传</span>
                </div>
              </div>
              <div v-else class="upload-placeholder">
                <el-icon class="el-icon--upload"><upload-filled /></el-icon>
                <div class="el-upload__text">
                  将 <strong>眼线板/裂隙灯照片</strong> 拖拽至此<br />或 <em>点击上传</em>
                </div>
                <div class="upload-tip">支持 JPG/PNG 格式，建议分辨率 > 1080P</div>
              </div>
            </el-upload>

            <div class="device-connect">
              <div class="status-dot success"></div>
              <span>设备状态：模拟连接正常 (Device OK)</span>
            </div>
          </div>

          <div class="action-area">
            <el-button type="primary" size="large" class="submit-btn" :loading="loading" @click="submitForm">
              开始 AI 智能辅助诊断 <el-icon class="el-icon--right"><MagicStick /></el-icon>
            </el-button>
            <p class="terms">点击将自动调用 KAN 网络进行推理与 UNet 图像分割</p>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped lang="scss">
.collect-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 84px);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 0 10px;

  .header-content {
    h2 { font-size: 24px; color: #303133; margin: 0 0 5px 0; }
    p { font-size: 13px; color: #909399; margin: 0; }
  }
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: bold;
  font-size: 16px;
  color: #303133;
}

/* 左侧表单样式 */
.form-card {
  min-height: 600px;
  border-radius: 8px;
  border: none;
}

/* 右侧上传样式 */
.upload-card {
  min-height: 600px;
  border-radius: 8px;
  border: none;
  display: flex;
  flex-direction: column;

  :deep(.el-card__body) {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
}

.upload-container {
  flex: 1;
  background-color: #f9fafc;
  border-radius: 8px;
  padding: 15px;
  border: 1px dashed #dcdfe6;
  display: flex;
  flex-direction: column;
}

.upload-box {
  flex: 1;
  display: flex;
  flex-direction: column;

  :deep(.el-upload) {
    width: 100%;
    height: 100%;
  }

  :deep(.el-upload-dragger) {
    width: 100%;
    height: 100%;
    min-height: 300px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    border: none;
    background: transparent;
    &:hover { border: none; background: rgba(64,158,255,0.05); }
  }
}

.upload-placeholder {
  color: #606266;
  .upload-tip {
    margin-top: 10px;
    font-size: 12px;
    color: #909399;
  }
}

.preview-area {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  border-radius: 6px;

  .preview-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .mask {
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.5);
    color: #fff;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    opacity: 0;
    transition: opacity 0.3s;
    gap: 5px;
    cursor: pointer;
  }

  &:hover .mask { opacity: 1; }
}

.device-connect {
  margin-top: 15px;
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #67c23a;
  background: #f0f9eb;
  padding: 8px 12px;
  border-radius: 4px;

  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: #67c23a;
    margin-right: 8px;
    box-shadow: 0 0 0 2px rgba(103,194,58,0.3);
  }
}

.action-area {
  margin-top: 20px;
  text-align: center;

  .submit-btn {
    width: 100%;
    font-weight: bold;
    letter-spacing: 1px;
    height: 50px;
  }

  .terms {
    margin-top: 10px;
    font-size: 12px;
    color: #909399;
  }
}
</style>
