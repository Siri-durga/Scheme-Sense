export interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  preferred_language: string;
  created_at: string;
  profile?: UserProfile;
}

export interface UserProfile {
  id: string;
  user_id: string;
  age?: number;
  gender?: string;
  state?: string;
  district?: string;
  occupation?: string;
  income_annual?: number;
  education_level?: string;
  category?: string;
  has_disability: boolean;
  marital_status?: string;
  is_student: boolean;
  is_farmer: boolean;
  is_bpl: boolean;
  extra_fields: Record<string, any>;
  updated_at: string;
}

export interface Department {
  id: string;
  name: string;
  ministry?: string;
}

export interface SchemeListItem {
  id: string;
  name: string;
  name_te?: string;
  description: string;
  status: string;
  app_end_date?: string;
  benefit_value_inr: number;
  category_tags: string[];
  department?: Department;
  state_specific?: string;
}

export interface EligibilityRule {
  id: string;
  field_name: string;
  operator: string;
  value: string;
  rule_type: string;
  weight: number;
  label?: string;
}

export interface Scheme extends SchemeListItem {
  name_te?: string;
  description_te?: string;
  objective?: string;
  launch_date?: string;
  app_start_date?: string;
  official_url?: string;
  benefits: Record<string, string>;
  benefits_te: Record<string, string>;
  required_docs: string[];
  required_docs_te: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  eligibility_rules: EligibilityRule[];
  department?: Department;
}

export interface MatchedScheme {
  scheme: SchemeListItem;
  match_score: number;
  matched_rules: Array<{ field: string; label: string; weight: number }>;
  failed_rules: Array<{ field: string; label: string; weight: number }>;
  ai_explanation?: string;
}

export interface BenefitsCalculation {
  total_schemes: number;
  total_benefit_inr: number;
  top_schemes: MatchedScheme[];
}

export interface DashboardStats {
  total_eligible: number;
  total_benefit_inr: number;
  newly_launched: number;
  closing_soon: number;
  saved_count: number;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  body?: string;
  is_read: boolean;
  sent_at: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface SavedScheme {
  id: string;
  scheme: SchemeListItem;
  saved_at: string;
}
