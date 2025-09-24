// Theme template configurations for different business types

export interface ThemeTemplate {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  businessTypes: string[];
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  fonts: {
    primary: string;
    heading: string;
    size: string;
  };
  preview?: string;
}

export const THEME_TEMPLATES: ThemeTemplate[] = [
  // Modern Template - Default
  {
    id: 'modern',
    name: 'โมเดิร์น',
    nameEn: 'Modern',
    description: 'ธีมสไตล์โมเดิร์น เหมาะกับธุรกิจทุกประเภท',
    businessTypes: ['beauty', 'clinic', 'spa', 'restaurant', 'service'],
    colors: {
      primary: '#3b82f6',
      secondary: '#f3f4f6',
      accent: '#10b981',
      background: '#ffffff',
      text: '#1f2937'
    },
    fonts: {
      primary: 'Inter',
      heading: 'Inter',
      size: 'base'
    },
    preview: '/themes/modern-preview.png'
  },

  // Beauty & Spa Template
  {
    id: 'beauty',
    name: 'ความงาม',
    nameEn: 'Beauty',
    description: 'ธีมสำหรับร้านเสริมสวย สปา และคลินิกความงาม',
    businessTypes: ['beauty', 'spa', 'clinic'],
    colors: {
      primary: '#ec4899',
      secondary: '#fce7f3',
      accent: '#f59e0b',
      background: '#fefce8',
      text: '#92400e'
    },
    fonts: {
      primary: 'Prompt',
      heading: 'Playfair Display',
      size: 'base'
    },
    preview: '/themes/beauty-preview.png'
  },

  // Medical & Clinical Template
  {
    id: 'medical',
    name: 'การแพทย์',
    nameEn: 'Medical',
    description: 'ธีมสำหรับคลินิก โรงพยาบาล และธุรกิจด้านการแพทย์',
    businessTypes: ['clinic', 'hospital', 'dental'],
    colors: {
      primary: '#0ea5e9',
      secondary: '#e0f2fe',
      accent: '#06b6d4',
      background: '#ffffff',
      text: '#0f172a'
    },
    fonts: {
      primary: 'Inter',
      heading: 'Inter',
      size: 'base'
    },
    preview: '/themes/medical-preview.png'
  },

  // Restaurant & Food Template
  {
    id: 'restaurant',
    name: 'ร้านอาหาร',
    nameEn: 'Restaurant',
    description: 'ธีมสำหรับร้านอาหาร คาเฟ่ และธุรกิจอาหาร',
    businessTypes: ['restaurant', 'cafe', 'food'],
    colors: {
      primary: '#dc2626',
      secondary: '#fef2f2',
      accent: '#ea580c',
      background: '#fffbeb',
      text: '#92400e'
    },
    fonts: {
      primary: 'Kanit',
      heading: 'Kanit',
      size: 'base'
    },
    preview: '/themes/restaurant-preview.png'
  },

  // Luxury Template
  {
    id: 'luxury',
    name: 'หรูหรา',
    nameEn: 'Luxury',
    description: 'ธีมสำหรับธุรกิจระดับพรีเมียมและหรูหรา',
    businessTypes: ['beauty', 'spa', 'clinic', 'hotel', 'service'],
    colors: {
      primary: '#1f2937',
      secondary: '#f9fafb',
      accent: '#d97706',
      background: '#ffffff',
      text: '#374151'
    },
    fonts: {
      primary: 'Cormorant Garamond',
      heading: 'Cormorant Garamond',
      size: 'lg'
    },
    preview: '/themes/luxury-preview.png'
  },

  // Minimal Template
  {
    id: 'minimal',
    name: 'มินิมอล',
    nameEn: 'Minimal',
    description: 'ธีมเรียบง่าย สะอาดตา เหมาะกับธุรกิจที่ต้องการความเรียบหรู',
    businessTypes: ['service', 'clinic', 'beauty'],
    colors: {
      primary: '#6b7280',
      secondary: '#f9fafb',
      accent: '#374151',
      background: '#ffffff',
      text: '#1f2937'
    },
    fonts: {
      primary: 'Source Sans Pro',
      heading: 'Source Sans Pro',
      size: 'base'
    },
    preview: '/themes/minimal-preview.png'
  },

  // Colorful Template
  {
    id: 'colorful',
    name: 'สีสัน',
    nameEn: 'Colorful',
    description: 'ธีมสีสันสดใส เหมาะกับธุรกิจที่ต้องการดึงดูดความสนใจ',
    businessTypes: ['beauty', 'kids', 'entertainment', 'fitness'],
    colors: {
      primary: '#7c3aed',
      secondary: '#ede9fe',
      accent: '#f59e0b',
      background: '#fefce8',
      text: '#581c87'
    },
    fonts: {
      primary: 'Poppins',
      heading: 'Poppins',
      size: 'base'
    },
    preview: '/themes/colorful-preview.png'
  },

  // Classic Template
  {
    id: 'classic',
    name: 'คลาสสิก',
    nameEn: 'Classic',
    description: 'ธีมคลาสสิค เหนื่อนไป เหมาะกับธุรกิจที่มีประวัติยาวนาน',
    businessTypes: ['restaurant', 'hotel', 'service', 'clinic'],
    colors: {
      primary: '#92400e',
      secondary: '#fef3c7',
      accent: '#059669',
      background: '#fffbeb',
      text: '#78350f'
    },
    fonts: {
      primary: 'Times New Roman',
      heading: 'Georgia',
      size: 'base'
    },
    preview: '/themes/classic-preview.png'
  }
];

// Font options
export const FONT_OPTIONS = [
  { value: 'Inter', label: 'Inter (โมเดิร์น)', category: 'sans-serif' },
  { value: 'Kanit', label: 'Kanit (ไทย)', category: 'sans-serif' },
  { value: 'Prompt', label: 'Prompt (ไทย)', category: 'sans-serif' },
  { value: 'Sarabun', label: 'Sarabun (ไทย)', category: 'sans-serif' },
  { value: 'Poppins', label: 'Poppins (อ่านง่าย)', category: 'sans-serif' },
  { value: 'Source Sans Pro', label: 'Source Sans Pro', category: 'sans-serif' },
  { value: 'Playfair Display', label: 'Playfair Display (หรูหรา)', category: 'serif' },
  { value: 'Cormorant Garamond', label: 'Cormorant Garamond (คลาสสิก)', category: 'serif' },
  { value: 'Georgia', label: 'Georgia (อ่านง่าย)', category: 'serif' },
  { value: 'Times New Roman', label: 'Times New Roman', category: 'serif' }
];

// Font size options
export const FONT_SIZE_OPTIONS = [
  { value: 'sm', label: 'เล็ก', description: 'เหมาะกับเนื้อหาเยอะ' },
  { value: 'base', label: 'ปกติ', description: 'ขนาดมาตรฐาน (แนะนำ)' },
  { value: 'lg', label: 'ใหญ่', description: 'อ่านง่าย เหมาะกับผู้สูงอายุ' },
  { value: 'xl', label: 'ใหญ่มาก', description: 'เน้นการอ่าน' }
];

// Business type options
export const BUSINESS_TYPES = [
  { value: 'beauty', label: 'ร้านเสริมสวย', icon: '💄' },
  { value: 'spa', label: 'สปา', icon: '🧘‍♀️' },
  { value: 'clinic', label: 'คลินิก', icon: '🏥' },
  { value: 'dental', label: 'ทันตกรรม', icon: '🦷' },
  { value: 'hospital', label: 'โรงพยาบาล', icon: '🏥' },
  { value: 'restaurant', label: 'ร้านอาหาร', icon: '🍽️' },
  { value: 'cafe', label: 'คาเฟ่', icon: '☕' },
  { value: 'food', label: 'อาหาร', icon: '🍕' },
  { value: 'hotel', label: 'โรงแรม', icon: '🏨' },
  { value: 'fitness', label: 'ฟิตเนส', icon: '💪' },
  { value: 'kids', label: 'เด็ก', icon: '👶' },
  { value: 'entertainment', label: 'บันเทิง', icon: '🎉' },
  { value: 'service', label: 'บริการทั่วไป', icon: '🔧' }
];

// Get templates by business type
export function getTemplatesByBusinessType(businessType: string): ThemeTemplate[] {
  return THEME_TEMPLATES.filter(template => 
    template.businessTypes.includes(businessType)
  );
}

// Get template by ID
export function getTemplateById(id: string): ThemeTemplate | undefined {
  return THEME_TEMPLATES.find(template => template.id === id);
}

// Generate CSS variables from theme
export function generateThemeCSS(business: any): string {
  const template = getTemplateById(business.themeTemplate) || THEME_TEMPLATES[0];
  
  return `
    :root {
      /* Colors */
      --primary-color: ${business.primaryColor || template.colors.primary};
      --secondary-color: ${business.secondaryColor || template.colors.secondary};
      --accent-color: ${business.accentColor || template.colors.accent};
      --background-color: ${business.backgroundColor || template.colors.background};
      --text-color: ${business.textColor || template.colors.text};
      
      /* Typography */
      --font-family: '${business.fontFamily || template.fonts.primary}', system-ui, sans-serif;
      --font-heading: '${business.fontHeading || template.fonts.heading}', system-ui, sans-serif;
      --font-size: ${business.fontSize || template.fonts.size};
    }
    
    /* Custom CSS */
    ${business.customCSS || ''}
  `;
}

// Validate hex color
export function isValidHexColor(color: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
}

// Convert hex to RGB
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

// Get contrasting text color
export function getContrastingTextColor(backgroundColor: string): string {
  const rgb = hexToRgb(backgroundColor);
  if (!rgb) return '#1f2937';
  
  // Calculate luminance
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.5 ? '#1f2937' : '#ffffff';
}
