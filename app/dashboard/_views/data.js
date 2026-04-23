export const AL_FIELDS = {
  contact: [
    { key: "FIRST_NAME", label: "First Name", type: "text" },
    { key: "LAST_NAME", label: "Last Name", type: "text" },
    { key: "PERSONAL_EMAIL", label: "Personal Email", type: "email" },
    { key: "BUSINESS_EMAIL", label: "Business Email", type: "email" },
    { key: "PERSONAL_EMAIL_VALIDATION_STATUS", label: "Email Validation", type: "status" },
    { key: "BUSINESS_EMAIL_VALIDATION_STATUS", label: "Biz Email Validation", type: "status" },
    { key: "PERSONAL_EMAIL_LAST_SEEN", label: "Email Last Seen", type: "date" },
  ],
  phone: [
    { key: "SKIPTRACE_WIRELESS_NUMBERS", label: "Mobile Phone", type: "phone" },
    { key: "SKIPTRACE_LANDLINE_NUMBERS", label: "Landline", type: "phone" },
    { key: "SKIPTRACE_B2B_WIRELESS", label: "B2B Mobile", type: "phone" },
    { key: "SKIPTRACE_B2B_LANDLINE", label: "B2B Landline", type: "phone" },
    { key: "DNC", label: "Do Not Call", type: "flag" },
  ],
  address: [
    { key: "SKIPTRACE_ADDRESS", label: "Mailing Address", type: "address" },
    { key: "CITY", label: "City", type: "text" },
    { key: "STATE", label: "State", type: "text" },
    { key: "ZIP", label: "ZIP Code", type: "text" },
  ],
  demographics: [
    { key: "AGE", label: "Age", type: "number" },
    { key: "GENDER", label: "Gender", type: "text" },
    { key: "INCOME", label: "Income Range", type: "range" },
    { key: "HOMEOWNER", label: "Homeowner", type: "boolean" },
    { key: "HOME_VALUE", label: "Home Value", type: "currency" },
    { key: "PROPERTY_TYPE", label: "Property Type", type: "text" },
  ],
  matching: [
    { key: "SKIPTRACE_MATCH_BY", label: "Match By", type: "select", options: ["NAME", "ADDRESS", "NAME,ADDRESS", "COMPANY_ADDRESS"] },
    { key: "SKIPTRACE_B2B_MATCH_BY", label: "B2B Match By", type: "select", options: ["COMPANY_ADDRESS"] },
  ],
  hashed: [
    { key: "SHA256_PERSONAL_EMAIL", label: "SHA256 Email (Ads)", type: "hash" },
    { key: "SHA256_MOBILE_PHONE", label: "SHA256 Phone (Ads)", type: "hash" },
  ],
};

export const INDUSTRIES = [
  { id: "home", label: "Home Services", icon: "🏠", desc: "HVAC, Plumbing, Roofing, Electrical" },
  { id: "legal", label: "PI Lawyers", icon: "⚖️", desc: "Personal Injury, Auto Accidents" },
  { id: "medspa", label: "Med Spas", icon: "💉", desc: "Botox, Fillers, Laser, Wellness" },
  { id: "insurance", label: "Insurance", icon: "🛡️", desc: "Auto, Home, Life, Health" },
  { id: "agency", label: "Agencies", icon: "📊", desc: "Digital Marketing, Lead Gen" },
];

export const NAV = [
  { id: "dashboard", icon: "⬡", label: "Dashboard" },
  { id: "audience", icon: "◎", label: "Audience Builder" },
  { id: "leads", icon: "◇", label: "Lead Data" },
  { id: "pixel", icon: "◈", label: "Visitor Tracking" },
  { id: "campaigns", icon: "△", label: "Campaigns" },
  { id: "crm", icon: "▤", label: "CRM Pipeline" },
  { id: "ads", icon: "⬢", label: "Ad Integration" },
  { id: "settings", icon: "⚙", label: "Settings" },
];
