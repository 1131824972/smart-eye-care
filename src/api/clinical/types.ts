// 对应后端 BooleanChoice
export enum BooleanChoice {
  YES = "是",
  NO = "否"
}

// 对应后端 EyeSide
export enum EyeSide {
  LEFT = "OS",
  RIGHT = "OD",
  BOTH = "OU"
}

// 生活习惯
export interface LifestyleInfo {
  occupation?: string;
  education_level?: string;
  smoking_history?: string;
  drinking_history?: string;
  diet_habit?: string;
  daily_outdoor_hours: number;
  daily_screen_hours: number;
  daily_sleep_hours: number;
}

// 全身病史
export interface SystemicHistory {
  hypertension: BooleanChoice;
  diabetes: BooleanChoice;
  cardiovascular_disease: BooleanChoice;
  rheumatoid_arthritis: BooleanChoice;
  thyroid_disease: BooleanChoice;
  skin_disease: BooleanChoice;
  long_term_medication?: string;
}

// 眼部症状 (OSDI 相关)
export interface OcularSymptoms {
  sensitivity_light: number;
  grittiness: number;
  pain_soreness: number;
  blurred_vision: number;
  poor_vision: number;
  reading_difficulty: number;
  driving_difficulty: number;
  computer_difficulty: number;
  wind_discomfort: number;
  dry_air_discomfort: number;
  ac_discomfort: number;
  osdi_total_score?: number;
}

// 眼科检查 (核心数据)
export interface EyeExamination {
  visual_acuity_od?: number;
  visual_acuity_os?: number;
  iop_od?: number; // 眼压
  iop_os?: number;

  // 裂隙灯
  conjunctival_congestion?: string;
  corneal_staining_score?: number;

  // 干眼专项
  but_od?: number;      // 泪膜破裂时间
  but_os?: number;
  schirmer_od?: number; // 泪液分泌
  schirmer_os?: number;

  // AI 模型相关数据
  meibomian_loss_rate?: number;
  meibomian_status?: string;
}

// 总表单结构
export interface ClinicalRecordForm {
  patient_id: string;
  doctor_id: string;
  record_date: string;
  lifestyle: LifestyleInfo;
  systemic_history: SystemicHistory;
  symptoms: OcularSymptoms;
  examination: EyeExamination;
}
