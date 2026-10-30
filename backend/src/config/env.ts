export interface BackendEnv {
  trustProxy: string;
  contactFromEmail: string;
  inquiryDataDir: string;
  port: number;
  host: string;
  nodeEnv: string;
  corsAllowedOrigins: string;
  resendApiKey: string;
  contactNotificationEmail: string;
  contactWebhookUrl: string;
  supabaseUrl: string;
  supabaseServiceRoleKey: string;
}

export const env: BackendEnv = {
  trustProxy: process.env.TRUST_PROXY || "",
  contactFromEmail: process.env.CONTACT_FROM_EMAIL || "",
  inquiryDataDir: process.env.INQUIRY_DATA_DIR || "",
  port: Number(process.env.BACKEND_PORT || process.env.PORT || 4000),
  host: process.env.BACKEND_HOST || process.env.HOST || "0.0.0.0",
  nodeEnv: process.env.NODE_ENV || "development",
  corsAllowedOrigins: process.env.CORS_ALLOWED_ORIGINS || "https://axiomstudio.agency",
  resendApiKey: process.env.RESEND_API_KEY || "",
  contactNotificationEmail:
    process.env.CONTACT_NOTIFICATION_EMAIL || "contact@axiomstudio.agency",
  contactWebhookUrl: process.env.CONTACT_WEBHOOK_URL || "",
  supabaseUrl: process.env.SUPABASE_URL || "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
};
