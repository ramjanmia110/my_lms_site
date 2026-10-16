export interface CatalogCourse {
  id: number
  title: string
  instructor: string
  rating: number
  students: number
  price: number
  originalPrice: number
  hours: number
  lessons: number
  duration: string
  category: string
  image: string
  skills: string[]
  level: string
  updated: string
  feature: string
}

export const courses: CatalogCourse[] = [
  { id: 1, title: 'Digital Marketing', instructor: 'Priya Patel', rating: 4.7, students: 11230, price: 45000, originalPrice: 75000, hours: 28, lessons: 180, duration: '3 Months', category: 'Business & Marketing', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=340&fit=crop', skills: ['SEO', 'Content Strategy', 'Analytics'], level: 'Intermediate', updated: 'Mar 2026', feature: 'Live Ad Campaigns' },
  { id: 2, title: 'Graphic Design', instructor: 'Maria Rodriguez', rating: 4.8, students: 8920, price: 55000, originalPrice: 95000, hours: 32, lessons: 220, duration: '3 Months', category: 'Design & Media', image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&h=340&fit=crop', skills: ['Photoshop', 'Layout', 'Color Theory'], level: 'Beginner', updated: 'Jan 2026', feature: 'Design Assets Pack' },
  { id: 3, title: 'Web Development', instructor: 'James Wilson', rating: 4.9, students: 18320, price: 85000, originalPrice: 99000, hours: 42, lessons: 340, duration: '6 Months', category: 'Development & Tech', image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&h=340&fit=crop', skills: ['HTML', 'CSS', 'JavaScript'], level: 'Beginner', updated: 'Feb 2026', feature: 'Deployment Guide' },
  { id: 4, title: 'Data Analytics', instructor: 'Alex Thompson', rating: 4.6, students: 15670, price: 65000, originalPrice: 95000, hours: 36, lessons: 260, duration: '6 Months', category: 'Development & Tech', image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=340&fit=crop', skills: ['SQL', 'Tableau', 'Dashboards'], level: 'Intermediate', updated: 'Mar 2026', feature: 'Real Datasets' },
  { id: 5, title: 'Project Management', instructor: 'David Kim', rating: 4.5, students: 9870, price: 40000, originalPrice: 70000, hours: 24, lessons: 160, duration: '3 Months', category: 'Business & Marketing', image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=340&fit=crop', skills: ['Agile', 'Scrum', 'Jira'], level: 'Intermediate', updated: 'Apr 2026', feature: 'Agile Templates' },
  { id: 6, title: 'Content Writing', instructor: 'Sarah Chen', rating: 4.7, students: 7650, price: 30000, originalPrice: 55000, hours: 20, lessons: 140, duration: '3 Months', category: 'Design & Media', image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&h=340&fit=crop', skills: ['Blogging', 'Copywriting', 'Editing'], level: 'Beginner', updated: 'Mar 2026', feature: 'Editing Checklists' },
  { id: 7, title: 'Social Media Marketing', instructor: 'Priya Patel', rating: 4.6, students: 13450, price: 42000, originalPrice: 72000, hours: 26, lessons: 180, duration: '3 Months', category: 'Business & Marketing', image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600&h=340&fit=crop', skills: ['Instagram', 'TikTok', 'Reels'], level: 'Beginner', updated: 'Feb 2026', feature: 'Content Calendar Kit' },
  { id: 8, title: 'UI/UX Design', instructor: 'Maria Rodriguez', rating: 4.9, students: 8920, price: 75000, originalPrice: 99000, hours: 38, lessons: 280, duration: '6 Months', category: 'Design & Media', image: 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=600&h=340&fit=crop', skills: ['Figma', 'Wireframes', 'Prototyping'], level: 'Intermediate', updated: 'Feb 2026', feature: 'Design System Kit' },
  { id: 9, title: 'Cyber Security', instructor: 'Alex Thompson', rating: 4.8, students: 11200, price: 95000, originalPrice: 99000, hours: 40, lessons: 300, duration: '8 Months', category: 'Development & Tech', image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&h=340&fit=crop', skills: ['Pen Testing', 'Network Security', 'Linux'], level: 'Advanced', updated: 'Jun 2026', feature: 'CTF Labs' },
  { id: 10, title: 'Search Engine Optimization (SEO)', instructor: 'Priya Patel', rating: 4.5, students: 10230, price: 35000, originalPrice: 60000, hours: 22, lessons: 150, duration: '3 Months', category: 'Business & Marketing', image: 'https://images.unsplash.com/photo-1512295767273-ac109ac3acfa?w=600&h=340&fit=crop', skills: ['Keyword Research', 'Backlinks', 'SERP'], level: 'Intermediate', updated: 'May 2026', feature: 'Rank Tracker Tool' },
  { id: 11, title: 'Business Communication', instructor: 'David Kim', rating: 4.4, students: 8900, price: 32000, originalPrice: 58000, hours: 18, lessons: 120, duration: '3 Months', category: 'Business & Marketing', image: 'https://images.unsplash.com/photo-1552581234-26160f608093?w=600&h=340&fit=crop', skills: ['Email Writing', 'Presentations', 'Negotiation'], level: 'Beginner', updated: 'Jan 2026', feature: 'Template Library' },
  { id: 12, title: 'Financial Accounting', instructor: 'Sarah Chen', rating: 4.6, students: 7800, price: 48000, originalPrice: 85000, hours: 30, lessons: 200, duration: '3 Months', category: 'Business & Marketing', image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&h=340&fit=crop', skills: ['Bookkeeping', 'Reports', 'Tax Basics'], level: 'Beginner', updated: 'Mar 2026', feature: 'Excel Workbook Pack' },
  { id: 13, title: 'Microsoft Excel', instructor: 'Alex Thompson', rating: 4.7, students: 21500, price: 30000, originalPrice: 50000, hours: 16, lessons: 100, duration: '3 Months', category: 'Business & Marketing', image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=340&fit=crop', skills: ['Pivot Tables', 'Formulas', 'Dashboards'], level: 'Beginner', updated: 'Feb 2026', feature: '50 Practice Sheets' },
  { id: 14, title: 'Artificial Intelligence', instructor: 'Dr. Sarah Chen', rating: 4.9, students: 12450, price: 99000, originalPrice: 99000, hours: 45, lessons: 360, duration: '12 Months', category: 'Development & Tech', image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=340&fit=crop', skills: ['Neural Nets', 'LLMs', 'Prompting'], level: 'Advanced', updated: 'May 2026', feature: 'GPU Lab Access' },
  { id: 15, title: 'Machine Learning', instructor: 'Dr. Sarah Chen', rating: 4.8, students: 9800, price: 95000, originalPrice: 99000, hours: 48, lessons: 380, duration: '12 Months', category: 'Development & Tech', image: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=600&h=340&fit=crop', skills: ['Python', 'Scikit-Learn', 'Deep Learning'], level: 'Advanced', updated: 'Apr 2026', feature: 'ML Project Kit' },
  { id: 16, title: 'Python Programming', instructor: 'James Wilson', rating: 4.8, students: 16700, price: 55000, originalPrice: 85000, hours: 34, lessons: 250, duration: '6 Months', category: 'Development & Tech', image: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=600&h=340&fit=crop', skills: ['Python', 'Automation', 'Flask'], level: 'Beginner', updated: 'Jan 2026', feature: 'Automation Scripts' },
  { id: 17, title: 'Public Speaking', instructor: 'David Kim', rating: 4.5, students: 6700, price: 35000, originalPrice: 60000, hours: 14, lessons: 90, duration: '3 Months', category: 'Business & Marketing', image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=600&h=340&fit=crop', skills: ['Storytelling', 'Voice Control', 'Stage Presence'], level: 'Intermediate', updated: 'Jun 2026', feature: 'Speech Coaching' },
  { id: 18, title: 'Video Editing', instructor: 'Maria Rodriguez', rating: 4.7, students: 8900, price: 58000, originalPrice: 90000, hours: 28, lessons: 190, duration: '3 Months', category: 'Design & Media', image: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=600&h=340&fit=crop', skills: ['Premiere Pro', 'Cuts', 'Color Grading'], level: 'Beginner', updated: 'Apr 2026', feature: 'Stock Footage Pack' },
  { id: 19, title: 'Customer Service', instructor: 'Sarah Chen', rating: 4.4, students: 5600, price: 30000, originalPrice: 42000, hours: 12, lessons: 80, duration: '3 Months', category: 'Business & Marketing', image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=340&fit=crop', skills: ['Support Tools', 'De-escalation', 'Empathy'], level: 'Beginner', updated: 'Jan 2026', feature: 'Live Roleplay' },
  { id: 20, title: 'E-Commerce Management', instructor: 'Priya Patel', rating: 4.6, students: 10200, price: 62000, originalPrice: 90000, hours: 32, lessons: 220, duration: '6 Months', category: 'Business & Marketing', image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=340&fit=crop', skills: ['Store Setup', 'Inventory', 'Payments'], level: 'Advanced', updated: 'Jun 2026', feature: 'Store Launch Kit' },
  { id: 21, title: 'Cloud Computing & DevOps', instructor: 'James Wilson', rating: 4.7, students: 6400, price: 88000, originalPrice: 99000, hours: 36, lessons: 240, duration: '8 Months', category: 'Development & Tech', image: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=600&h=340&fit=crop', skills: ['AWS', 'Docker', 'CI/CD'], level: 'Intermediate', updated: 'May 2026', feature: 'Cloud Credits' },
  { id: 22, title: 'Flutter Mobile Development', instructor: 'James Wilson', rating: 4.8, students: 7200, price: 82000, originalPrice: 99000, hours: 30, lessons: 210, duration: '6 Months', category: 'Development & Tech', image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&h=340&fit=crop', skills: ['Dart', 'Widgets', 'REST APIs'], level: 'Intermediate', updated: 'Jun 2026', feature: 'App Store Kit' },
  { id: 23, title: 'Motion Graphics & Animation', instructor: 'Maria Rodriguez', rating: 4.6, students: 4300, price: 68000, originalPrice: 95000, hours: 26, lessons: 170, duration: '6 Months', category: 'Design & Media', image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&h=340&fit=crop', skills: ['After Effects', 'Keyframes', 'Transitions'], level: 'Advanced', updated: 'May 2026', feature: 'Motion Presets' },
  { id: 24, title: 'Brand Strategy & Identity', instructor: 'Maria Rodriguez', rating: 4.8, students: 3900, price: 65000, originalPrice: 92000, hours: 24, lessons: 150, duration: '6 Months', category: 'Design & Media', image: 'https://images.unsplash.com/photo-1559028012-481c04fa702d?w=600&h=340&fit=crop', skills: ['Positioning', 'Naming', 'Brand Voice'], level: 'Advanced', updated: 'Jun 2026', feature: 'Brand Deck' },
  { id: 25, title: 'Sales Funnel & Conversion', instructor: 'David Kim', rating: 4.5, students: 5800, price: 48000, originalPrice: 80000, hours: 22, lessons: 140, duration: '3 Months', category: 'Business & Marketing', image: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=600&h=340&fit=crop', skills: ['Funnels', 'A/B Testing', 'CRO'], level: 'Advanced', updated: 'May 2026', feature: 'Funnel Builder' },
  { id: 26, title: 'Deep Learning Specialization', instructor: 'Dr. Sarah Chen', rating: 4.9, students: 8300, price: 99000, originalPrice: 99000, hours: 50, lessons: 400, duration: '12 Months', category: 'AI & Data Science', image: 'https://images.unsplash.com/photo-1555255707-c07966088b7b?w=600&h=340&fit=crop', skills: ['CNNs', 'Transformers', 'PyTorch'], level: 'Advanced', updated: 'Jun 2026', feature: 'Cloud GPU Access' },
  { id: 27, title: 'Data Visualization with Python', instructor: 'Alex Thompson', rating: 4.6, students: 6100, price: 45000, originalPrice: 78000, hours: 22, lessons: 160, duration: '3 Months', category: 'AI & Data Science', image: 'https://images.unsplash.com/photo-1543286386-713bdd548da4?w=600&h=340&fit=crop', skills: ['Matplotlib', 'Seaborn', 'Plotly'], level: 'Beginner', updated: 'Feb 2026', feature: 'Dashboard Starter' },
  { id: 28, title: 'Natural Language Processing', instructor: 'Dr. Sarah Chen', rating: 4.8, students: 5400, price: 92000, originalPrice: 99000, hours: 40, lessons: 300, duration: '8 Months', category: 'AI & Data Science', image: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=600&h=340&fit=crop', skills: ['NLTK', 'spaCy', 'LLMs'], level: 'Advanced', updated: 'May 2026', feature: 'Dataset Packs' },
  { id: 29, title: 'Time Management & Productivity', instructor: 'David Kim', rating: 4.7, students: 7300, price: 30000, originalPrice: 42000, hours: 12, lessons: 90, duration: '3 Months', category: 'Personal Growth', image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600&h=340&fit=crop', skills: ['Deep Work', 'Planning', 'Focus'], level: 'Beginner', updated: 'Mar 2026', feature: 'Productivity Templates' },
  { id: 30, title: 'Leadership Essentials', instructor: 'David Kim', rating: 4.8, students: 6600, price: 68000, originalPrice: 95000, hours: 24, lessons: 150, duration: '6 Months', category: 'Personal Growth', image: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=600&h=340&fit=crop', skills: ['Team Management', 'Coaching', 'Strategy'], level: 'Intermediate', updated: 'Jun 2026', feature: 'Leadership Toolkit' },
  { id: 31, title: 'Emotional Intelligence at Work', instructor: 'Sarah Chen', rating: 4.6, students: 4900, price: 38000, originalPrice: 65000, hours: 16, lessons: 110, duration: '3 Months', category: 'Personal Growth', image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&h=340&fit=crop', skills: ['EQ', 'Empathy', 'Communication'], level: 'Beginner', updated: 'Apr 2026', feature: 'EQ Exercises' },
  { id: 32, title: 'Resume & LinkedIn Mastery', instructor: 'David Kim', rating: 4.7, students: 5200, price: 30000, originalPrice: 45000, hours: 12, lessons: 80, duration: '1 Month', category: 'Career Development', image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&h=340&fit=crop', skills: ['Resume Writing', 'ATS', 'LinkedIn'], level: 'Beginner', updated: 'Mar 2026', feature: 'ATS Resume Templates' },
  { id: 33, title: 'Interview Preparation & Skills', instructor: 'Priya Patel', rating: 4.6, students: 6800, price: 35000, originalPrice: 62000, hours: 18, lessons: 120, duration: '2 Months', category: 'Career Development', image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=340&fit=crop', skills: ['Mock Interviews', 'Behavioral', 'Negotiation'], level: 'Intermediate', updated: 'Apr 2026', feature: 'Mock Interview Sessions' },
  { id: 34, title: 'Personal Branding Online', instructor: 'Maria Rodriguez', rating: 4.7, students: 4700, price: 32000, originalPrice: 58000, hours: 14, lessons: 100, duration: '1 Month', category: 'Career Development', image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=600&h=340&fit=crop', skills: ['Personal Brand', 'Portfolio', 'Networking'], level: 'Beginner', updated: 'May 2026', feature: 'Brand Voice Kit' },
  { id: 35, title: 'English for Professionals', instructor: 'Sarah Chen', rating: 4.6, students: 7400, price: 35000, originalPrice: 60000, hours: 16, lessons: 110, duration: '3 Months', category: 'Language & Communication', image: 'https://images.unsplash.com/photo-1552581234-26160f608093?w=600&h=340&fit=crop', skills: ['Business English', 'Emails', 'Meetings'], level: 'Beginner', updated: 'Feb 2026', feature: 'Speaking Labs' },
  { id: 36, title: 'Public Relations & Media', instructor: 'Priya Patel', rating: 4.5, students: 3600, price: 42000, originalPrice: 78000, hours: 20, lessons: 130, duration: '2 Months', category: 'Language & Communication', image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&h=340&fit=crop', skills: ['Press Releases', 'Media Kits', 'Crisis Comms'], level: 'Intermediate', updated: 'Jun 2026', feature: 'Media Kit Templates' },
  { id: 37, title: 'Storytelling & Brand Voice', instructor: 'Maria Rodriguez', rating: 4.8, students: 5100, price: 48000, originalPrice: 82000, hours: 18, lessons: 120, duration: '2 Months', category: 'Language & Communication', image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600&h=340&fit=crop', skills: ['Story Arcs', 'Copy Voice', 'Pitching'], level: 'Intermediate', updated: 'May 2026', feature: 'Story Canvas' },
  { id: 38, title: 'Full Stack Web Development', instructor: 'James Wilson', rating: 4.9, students: 14200, price: 95000, originalPrice: 99000, hours: 48, lessons: 380, duration: '8 Months', category: 'Development & Tech', image: 'https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=600&h=340&fit=crop', skills: ['React', 'Node.js', 'MongoDB'], level: 'Intermediate', updated: 'Jun 2026', feature: 'Full-Stack Capstone' },
]

/** Client-safe slugify used only for navigation to the course details page. */
export function toSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Find the local catalog course by title (case-insensitive). */
export function findCatalogByTitle(title?: string | null): CatalogCourse | undefined {
  if (!title) return undefined
  const t = title.toLowerCase()
  return courses.find(c => c.title.toLowerCase() === t)
}

/** Find the local catalog course by URL slug. */
export function findCatalogBySlug(slug?: string | null): CatalogCourse | undefined {
  if (!slug) return undefined
  const s = String(slug).toLowerCase()
  return courses.find(c => toSlug(c.title) === s)
}

/** Normalize any API duration value into a "X Months" label. */
export const hoursToMonths = (raw: unknown, title: string): string => {
  const local = findCatalogByTitle(title)
  if (local?.duration) return local.duration
  if (typeof raw === 'string' && /month/i.test(raw)) {
    const m = raw.match(/\d+(\.\d+)?/)
    return m ? `${Math.round(Number(m[0]))} Months` : '6 Months'
  }
  const n = typeof raw === 'number' && Number.isFinite(raw) ? raw : parseInt(String(raw ?? '').replace(/[^\d]/g, ''), 10)
  if (!n || Number.isNaN(n)) return '6 Months'
  if (n <= 26) return '3 Months'
  if (n <= 34) return '6 Months'
  if (n <= 42) return '8 Months'
  return '12 Months'
}