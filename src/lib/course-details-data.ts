import { courses as catalogCourses, findCatalogByTitle, toSlug, type CatalogCourse } from './course-catalog'

export interface CourseLesson {
  title: string
  duration: string
}

export interface CourseSection {
  title: string
  lessons: CourseLesson[]
}

export interface CourseReview {
  name: string
  avatar?: string
  rating: number
  date: string
  comment: string
}

export interface CourseInstructor {
  name: string
  title: string
  photo: string
  bio: string
}

export interface CourseDetails {
  slug: string
  title: string
  category: string
  thumbnail: string
  videoUrl?: string
  instructor: CourseInstructor
  rating: number
  reviewCount: number
  students: number
  price: number
  oldPrice?: number
  currency: string
  overview: string[]
  keyHighlights: string[]
  whatYouLearn: string[]
  curriculum: CourseSection[]
  reviews: CourseReview[]
  lessonsCount: number
  duration: string
  level: string
  language: string
  certificate: boolean
}

export const SAMPLE_VIDEO_URL =
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'

export const courseDetails: CourseDetails[] = [
  {
    slug: 'microsoft-excel',
    title: 'Microsoft Excel Masterclass: From Beginner to Advanced',
    category: 'Business & Marketing',
    thumbnail: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&h=675&fit=crop',
    videoUrl: SAMPLE_VIDEO_URL,
    instructor: {
      name: 'Alex Thompson',
      title: 'Senior Data & Business Analyst',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
      bio: 'Alex has spent over 12 years helping teams turn raw spreadsheets into decision-ready dashboards. He has trained more than 40,000 students in Excel, reporting automation and business analytics, and currently advises finance and operations teams on data workflows.',
    },
    rating: 4.7,
    reviewCount: 40,
    students: 21500,
    price: 30000,
    oldPrice: 50000,
    currency: 'BDT',
    overview: [
      'Microsoft Excel is still the most in-demand tool in offices around the world. In this complete masterclass you will start with the absolute basics — cells, sheets and simple formulas — and progress all the way to pivot tables, Power Query and professional dashboards.',
      'Every lesson is taught with real business examples: budget trackers, sales reports, inventory sheets and performance dashboards. You will practice along with downloadable exercise files, so by the end of the course you will have a portfolio of ready-to-use templates.',
      'Whether you are a student, a job seeker or a working professional who wants to save hours every week, this course gives you a clear, step-by-step path to Excel fluency.',
    ],
    keyHighlights: [
      '50+ hours of on-demand video with hands-on exercises',
      '50+ downloadable practice sheets and ready-made templates',
      'Learn formulas, pivot tables, charts, Power Query and dashboards',
      'Real-world projects: budget tracker, sales dashboard, inventory system',
      'Lifetime access with free future updates',
      'Certificate of completion',
    ],
    whatYouLearn: [
      'Navigate Excel with confidence and use keyboard shortcuts like a pro',
      'Build formulas with SUM, IF, VLOOKUP, XLOOKUP and INDEX/MATCH',
      'Clean, format and validate data for error-free reporting',
      'Create dynamic pivot tables and pivot charts in minutes',
      'Automate repetitive tasks with Power Query and macros',
      'Design professional dashboards that impress stakeholders',
      'Analyse sales, finance and inventory data end to end',
      'Export and share reports with your team cleanly',
    ],
    curriculum: [
      {
        title: 'Getting Started with Excel',
        lessons: [
          { title: 'Course introduction and how to use the exercises', duration: '06:40' },
          { title: 'The Excel interface, ribbons and views', duration: '12:15' },
          { title: 'Creating, saving and organising workbooks', duration: '09:30' },
          { title: 'Essential keyboard shortcuts you will use daily', duration: '11:05' },
        ],
      },
      {
        title: 'Formulas & Functions',
        lessons: [
          { title: 'Anatomy of a formula and cell referencing', duration: '14:20' },
          { title: 'Logical functions: IF, AND, OR and nested IFs', duration: '18:45' },
          { title: 'Lookup functions: VLOOKUP, XLOOKUP and INDEX/MATCH', duration: '22:10' },
          { title: 'Text, date and error-handling functions', duration: '16:35' },
          { title: 'Named ranges and structured references', duration: '10:50' },
        ],
      },
      {
        title: 'Data Visualisation',
        lessons: [
          { title: 'Chart types and when to use each one', duration: '13:25' },
          { title: 'Formatting charts for professional reports', duration: '15:40' },
          { title: 'Sparklines, conditional formatting and data bars', duration: '12:55' },
          { title: 'Building your first sales dashboard', duration: '25:10' },
        ],
      },
      {
        title: 'Pivot Tables & Power Query',
        lessons: [
          { title: 'Your first pivot table in 10 minutes', duration: '11:30' },
          { title: 'Grouping, slicers and pivot charts', duration: '17:20' },
          { title: 'Importing and transforming data with Power Query', duration: '21:45' },
          { title: 'Combining multiple workbooks automatically', duration: '18:05' },
        ],
      },
      {
        title: 'Real-World Projects',
        lessons: [
          { title: 'Project 1: Monthly budget & expense tracker', duration: '28:15' },
          { title: 'Project 2: Interactive sales dashboard', duration: '32:40' },
          { title: 'Project 3: Inventory & stock management system', duration: '26:50' },
          { title: 'Final tips, further learning and course wrap-up', duration: '08:20' },
        ],
      },
    ],
    reviews: [
      {
        name: 'Rachel M.',
        rating: 5,
        date: 'September 28, 2026',
        comment:
          'I went from barely knowing SUM to building a full sales dashboard for my team in three weeks. The practice files make every lesson click instantly.',
      },
      {
        name: 'David Okafor',
        rating: 5,
        date: 'September 14, 2026',
        comment:
          'The pivot table and Power Query sections alone are worth the price. I automated a report that used to take me half a day every Monday morning.',
      },
      {
        name: 'Sadia Rahman',
        rating: 4,
        date: 'August 30, 2026',
        comment:
          'Very clear explanations and a perfect pace for beginners. I only wish the macros section was a little longer, but everything else is excellent.',
      },
      {
        name: 'James Peterson',
        rating: 5,
        date: 'August 12, 2026',
        comment:
          'Best Excel course I have taken. The dashboard project at the end made my resume stand out — I actually got interviews because of the portfolio I built here.',
      },
    ],
    lessonsCount: 42,
    duration: '12h 30m',
    level: 'Beginner',
    language: 'English',
    certificate: true,
  },
  {
    slug: 'web-development-basics',
    title: 'Web Development Basics: HTML, CSS & JavaScript',
    category: 'Development & Tech',
    thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&h=675&fit=crop',
    videoUrl: SAMPLE_VIDEO_URL,
    instructor: {
      name: 'James Wilson',
      title: 'Full-Stack Web Developer & Instructor',
      photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop',
      bio: 'James is a full-stack developer with 10+ years of experience shipping products for startups and Fortune 500 companies. He has taught over 80,000 aspiring developers how to write clean code and land their first developer role.',
    },
    rating: 4.8,
    reviewCount: 64,
    students: 18320,
    price: 65000,
    oldPrice: 95000,
    currency: 'BDT',
    overview: [
      'This course takes you from zero to confidently building and publishing your own websites. You will learn the three core technologies of the web — HTML for structure, CSS for design and JavaScript for interactivity — through hands-on projects.',
      'Each concept is introduced with a short explanation followed immediately by a build exercise, so you never watch passively. By the final section you will have created a portfolio site, an interactive landing page and a small web app.',
      'No prior coding experience is required. All you need is a laptop and a browser.',
    ],
    keyHighlights: [
      '35+ hours of project-based video content',
      'Build 5 real websites and one JavaScript web app',
      'Modern CSS: flexbox, grid, animations and responsive design',
      'Git, GitHub and how to publish your site for free',
      'Career guidance: portfolio, CV and interview tips',
      'Certificate of completion',
    ],
    whatYouLearn: [
      'Write semantic, accessible HTML pages from scratch',
      'Style beautiful responsive layouts with modern CSS',
      'Master flexbox and grid for any design you can imagine',
      'Add interactivity with JavaScript variables, functions and events',
      'Work with arrays, objects and the DOM confidently',
      'Fetch data from APIs and handle it in your pages',
      'Use Git and GitHub to version your projects',
      'Deploy a live portfolio website recruiters can visit',
    ],
    curriculum: [
      {
        title: 'HTML Fundamentals',
        lessons: [
          { title: 'How the web works and what developers actually do', duration: '09:15' },
          { title: 'HTML structure, tags, attributes and semantic markup', duration: '18:30' },
          { title: 'Lists, links, images and media elements', duration: '15:45' },
          { title: 'Forms, inputs and accessibility basics', duration: '17:20' },
        ],
      },
      {
        title: 'CSS Styling & Layout',
        lessons: [
          { title: 'Selectors, the box model and units', duration: '16:10' },
          { title: 'Typography, colours and visual design fundamentals', duration: '14:55' },
          { title: 'Flexbox: one-dimensional layouts made simple', duration: '21:30' },
          { title: 'CSS Grid: two-dimensional page layouts', duration: '23:40' },
          { title: 'Responsive design and media queries', duration: '19:05' },
          { title: 'Transitions, transforms and keyframe animations', duration: '17:50' },
        ],
      },
      {
        title: 'JavaScript Essentials',
        lessons: [
          { title: 'Variables, data types and operators', duration: '15:25' },
          { title: 'Conditionals, loops and functions', duration: '20:15' },
          { title: 'Arrays, objects and array methods', duration: '22:35' },
          { title: 'DOM selection, events and manipulating pages', duration: '24:50' },
          { title: 'Fetching data from APIs with fetch and async/await', duration: '18:40' },
        ],
      },
      {
        title: 'Projects & Deployment',
        lessons: [
          { title: 'Project 1: Responsive multi-page portfolio site', duration: '35:20' },
          { title: 'Project 2: Interactive weather web app', duration: '29:10' },
          { title: 'Git, GitHub and collaborating on code', duration: '16:45' },
          { title: 'Deploying free with GitHub Pages and Netlify', duration: '13:30' },
          { title: 'Next steps: frameworks, roadmap and job hunting tips', duration: '11:55' },
        ],
      },
    ],
    reviews: [
      {
        name: 'Miguel Santos',
        rating: 5,
        date: 'October 2, 2026',
        comment:
          'I had tried free tutorials before and always got stuck. The project-first approach here finally made everything connect. My portfolio is live now!',
      },
      {
        name: 'Ayesha Khan',
        rating: 5,
        date: 'September 19, 2026',
        comment:
          'The CSS grid and flexbox modules are the best explanations I have seen anywhere. James answers questions in the Q&A within a day, which is amazing.',
      },
      {
        name: 'Tom Bradley',
        rating: 4,
        date: 'September 5, 2026',
        comment:
          'Great course for absolute beginners. The JavaScript section moves a bit fast in places, but the exercises helped me catch up quickly.',
      },
    ],
    lessonsCount: 38,
    duration: '15h 45m',
    level: 'Beginner',
    language: 'English',
    certificate: true,
  },
  {
    slug: 'python-for-data-analysis',
    title: 'Python for Data Analysis: NumPy, Pandas & Visualization',
    category: 'AI & Data Science',
    thumbnail: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=1200&h=675&fit=crop',
    videoUrl: SAMPLE_VIDEO_URL,
    instructor: {
      name: 'Dr. Sarah Chen',
      title: 'Data Scientist & Python Instructor',
      photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
      bio: 'Sarah holds a PhD in Computer Science and has worked as a data scientist at leading tech companies for 9 years. She specialises in making complex data concepts simple, and her courses have helped thousands of career-switchers break into data roles.',
    },
    rating: 4.9,
    reviewCount: 52,
    students: 15670,
    price: 55000,
    oldPrice: 85000,
    currency: 'BDT',
    overview: [
      'Data analysis is one of the fastest-growing career paths in the world, and Python is the language that powers it. This course teaches you to clean, transform, analyse and visualise real datasets using NumPy, Pandas and Matplotlib.',
      'You will work with genuine messy datasets — sales records, survey responses, financial reports — and learn the exact workflow professional analysts use every day, from loading data to presenting insights.',
      'By the end of the course you will complete a capstone project that ties every skill together and gives you a strong portfolio piece for job applications.',
    ],
    keyHighlights: [
      '40+ hours of hands-on data analysis training',
      'Work with 15+ real-world messy datasets',
      'Master Pandas, NumPy, Matplotlib and Jupyter notebooks',
      'Statistical analysis techniques used in industry',
      'Capstone project: end-to-end business analytics report',
      'Certificate of completion',
    ],
    whatYouLearn: [
      'Set up a professional Python data analysis environment',
      'Clean and handle missing or inconsistent data confidently',
      'Transform, group and reshape data with Pandas',
      'Perform statistical analysis and derive meaningful insights',
      'Create charts, graphs and visual stories with Matplotlib',
      'Build interactive summaries and pivot-style reports',
      'Automate repetitive analysis tasks with reusable scripts',
      'Present findings in a clear, business-ready format',
    ],
    curriculum: [
      {
        title: 'Python & Environment Setup',
        lessons: [
          { title: 'Installing Anaconda and launching Jupyter notebooks', duration: '08:50' },
          { title: 'Python essentials refresher for analysts', duration: '24:15' },
          { title: 'Understanding NumPy arrays and vectorised operations', duration: '19:40' },
        ],
      },
      {
        title: 'Data Wrangling with Pandas',
        lessons: [
          { title: 'Loading CSV, Excel and JSON datasets', duration: '15:20' },
          { title: 'Selecting, filtering and sorting data', duration: '18:35' },
          { title: 'Handling missing data and data types', duration: '16:50' },
          { title: 'GroupBy, pivot tables and merging datasets', duration: '23:25' },
          { title: 'String methods and datetime operations', duration: '17:10' },
        ],
      },
      {
        title: 'Analysis & Statistics',
        lessons: [
          { title: 'Descriptive statistics and distribution analysis', duration: '19:45' },
          { title: 'Correlation, outliers and anomaly detection', duration: '21:15' },
          { title: 'Building KPI summaries and metric reports', duration: '16:05' },
        ],
      },
      {
        title: 'Visualisation & Storytelling',
        lessons: [
          { title: 'Matplotlib fundamentals and chart types', duration: '20:30' },
          { title: 'Seaborn for statistical visualisation', duration: '18:25' },
          { title: 'Designing dashboards that communicate insights', duration: '22:10' },
        ],
      },
      {
        title: 'Capstone Project',
        lessons: [
          { title: 'Project brief: full retail sales analysis', duration: '12:40' },
          { title: 'Cleaning and preparing the retail dataset', duration: '28:15' },
          { title: 'Analysis, visualisation and final presentation', duration: '34:50' },
          { title: 'Career paths in data and recommended next steps', duration: '10:20' },
        ],
      },
    ],
    reviews: [
      {
        name: 'Nadia Islam',
        rating: 5,
        date: 'October 6, 2026',
        comment:
          'The messy datasets are what make this course special. Real data never looks like the tidy examples in other courses — here you learn to handle it properly.',
      },
      {
        name: 'Kevin Zhao',
        rating: 5,
        date: 'September 22, 2026',
        comment:
          'I switched from marketing to a junior analyst role three months after finishing. The capstone project was the centrepiece of my portfolio.',
      },
      {
        name: 'Fatima Noor',
        rating: 5,
        date: 'September 8, 2026',
        comment:
          'Dr. Sarah explains statistics without the heavy maths jargon. Finally understand what I am actually doing with my data and why.',
      },
    ],
    lessonsCount: 36,
    duration: '14h 20m',
    level: 'Intermediate',
    language: 'English',
    certificate: true,
  },
  {
    slug: 'digital-marketing',
    title: 'Digital Marketing Mastery: SEO, Ads & Social Media',
    category: 'Business & Marketing',
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=675&fit=crop',
    videoUrl: SAMPLE_VIDEO_URL,
    instructor: {
      name: 'Priya Patel',
      title: 'Digital Marketing Strategist',
      photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop',
      bio: 'Priya has led digital campaigns for e-commerce brands and SaaS companies for over 9 years, managing six-figure monthly ad budgets. She now trains marketers to build strategies that actually convert, not just chase vanity metrics.',
    },
    rating: 4.7,
    reviewCount: 48,
    students: 11230,
    price: 45000,
    oldPrice: 75000,
    currency: 'BDT',
    overview: [
      'Digital marketing is where businesses grow, and this course gives you the complete toolkit: search engine optimisation, paid advertising, email funnels and social media strategy.',
      'You will plan and launch real campaigns with a modest practice budget, learn how to read analytics dashboards, and understand how to turn traffic into paying customers.',
      'By the end you will be able to build a full marketing strategy for any brand and prove its impact with data.',
    ],
    keyHighlights: [
      '30+ hours of practical marketing training',
      'Plan and launch live Google Ads and Meta campaigns',
      'SEO playbook: keywords, technical audits and link building',
      'Email funnels, copywriting and conversion optimisation',
      'Real ad budget templates and campaign trackers',
      'Certificate of completion',
    ],
    whatYouLearn: [
      'Build a complete digital marketing strategy from scratch',
      'Research keywords and rank pages on Google',
      'Audit websites for technical SEO problems',
      'Create and optimise profitable Google Ads campaigns',
      'Run Meta (Facebook & Instagram) ads that convert',
      'Design email sequences that nurture leads into sales',
      'Read analytics and make data-driven decisions',
      'Measure ROI and report results to stakeholders',
    ],
    curriculum: [
      {
        title: 'Marketing Foundations',
        lessons: [
          { title: 'The digital marketing landscape in 2026', duration: '10:30' },
          { title: 'Defining audiences, positioning and goals', duration: '16:45' },
          { title: 'Building a marketing funnel that converts', duration: '14:20' },
        ],
      },
      {
        title: 'Search Engine Optimisation',
        lessons: [
          { title: 'Keyword research that drives real traffic', duration: '19:10' },
          { title: 'On-page SEO and content optimisation', duration: '21:35' },
          { title: 'Technical SEO audits step by step', duration: '18:05' },
          { title: 'Link building strategies that still work', duration: '15:50' },
        ],
      },
      {
        title: 'Paid Advertising',
        lessons: [
          { title: 'Google Ads structure and bidding strategies', duration: '22:40' },
          { title: 'Writing ad copy and choosing landing pages', duration: '16:15' },
          { title: 'Meta ads: audiences, creatives and testing', duration: '23:20' },
          { title: 'Retargeting and remarketing campaigns', duration: '14:55' },
        ],
      },
      {
        title: 'Social, Email & Analytics',
        lessons: [
          { title: 'Social media content strategy and calendars', duration: '17:30' },
          { title: 'Email marketing and automation flows', duration: '19:05' },
          { title: 'Google Analytics 4: reports that matter', duration: '21:50' },
          { title: 'Measuring ROI and presenting to clients', duration: '13:40' },
        ],
      },
    ],
    reviews: [
      {
        name: 'Chris Anderson',
        rating: 5,
        date: 'September 30, 2026',
        comment:
          'Launched my first Google Ads campaign during the course and got a 4x return in the first month. The templates saved me weeks of trial and error.',
      },
      {
        name: 'Hana Suzuki',
        rating: 5,
        date: 'September 16, 2026',
        comment:
          'Finally an SEO section that is up to date. Priya debunks a lot of outdated advice and shows what actually moves rankings today.',
      },
      {
        name: 'Omar Faruk',
        rating: 4,
        date: 'August 29, 2026',
        comment:
          'Extremely practical. I would have liked more depth on TikTok ads, but the Meta and Google modules are outstanding.',
      },
    ],
    lessonsCount: 34,
    duration: '11h 50m',
    level: 'Intermediate',
    language: 'English',
    certificate: true,
  },
  {
    slug: 'graphic-design',
    title: 'Graphic Design Fundamentals: Photoshop, Illustrator & Branding',
    category: 'Design & Media',
    thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=1200&h=675&fit=crop',
    videoUrl: SAMPLE_VIDEO_URL,
    instructor: {
      name: 'Maria Rodriguez',
      title: 'Creative Director & Brand Designer',
      photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop',
      bio: 'Maria is an award-winning designer and creative director with 11 years of experience building brands for startups and agencies. She has designed identities featured in design annuals and loves teaching the thinking behind great design, not just the tools.',
    },
    rating: 4.8,
    reviewCount: 45,
    students: 8920,
    price: 55000,
    oldPrice: 95000,
    currency: 'BDT',
    overview: [
      'Great design is a skill you can learn, and this course teaches both the creative principles and the industry tools. You will master Photoshop for photo editing, Illustrator for logos and layouts, and the branding fundamentals that tie everything together.',
      'Each module ends with a design brief modelled on real client work, so your portfolio grows with every section — from a poster and a logo to a complete brand identity.',
      'By graduation you will have the confidence and the pieces to start taking on freelance design work.',
    ],
    keyHighlights: [
      '32+ hours of guided design training',
      'Master Photoshop, Illustrator and core design theory',
      'Build a complete brand identity for a fictional client',
      'Colour theory, typography and composition deep dives',
      'Portfolio-ready projects with professional feedback guides',
      'Certificate of completion',
    ],
    whatYouLearn: [
      'Apply design principles: hierarchy, contrast, balance and alignment',
      'Edit and retouch photos professionally in Photoshop',
      'Create scalable logos and vector artwork in Illustrator',
      'Choose and pair typefaces with confidence',
      'Build cohesive brand systems: logo, palette, type and guidelines',
      'Design print and digital assets: posters, social posts and ads',
      'Prepare files correctly for print and web delivery',
      'Present and defend your design decisions like a professional',
    ],
    curriculum: [
      {
        title: 'Design Principles',
        lessons: [
          { title: 'How designers see: visual perception and hierarchy', duration: '14:25' },
          { title: 'Composition, grid systems and white space', duration: '16:50' },
          { title: 'Colour theory and building balanced palettes', duration: '18:15' },
          { title: 'Typography: pairing, scale and readability', duration: '20:40' },
        ],
      },
      {
        title: 'Adobe Photoshop',
        lessons: [
          { title: 'Workspace, layers and non-destructive editing', duration: '17:30' },
          { title: 'Selections, masks and compositing', duration: '21:10' },
          { title: 'Photo retouching and colour grading', duration: '19:55' },
          { title: 'Social media graphics and ad creatives', duration: '16:20' },
        ],
      },
      {
        title: 'Adobe Illustrator',
        lessons: [
          { title: 'Vector basics: shapes, pen tool and paths', duration: '22:35' },
          { title: 'Designing a professional logo from sketch to final', duration: '28:15' },
          { title: 'Typography in Illustrator and layout design', duration: '18:45' },
          { title: 'Exporting for print, web and client handoff', duration: '13:25' },
        ],
      },
      {
        title: 'Branding Project',
        lessons: [
          { title: 'Project brief: identity for a specialty coffee brand', duration: '09:50' },
          { title: 'Moodboards, references and concept development', duration: '18:30' },
          { title: 'Building the full brand guideline document', duration: '26:10' },
          { title: 'Portfolio presentation and freelance next steps', duration: '12:35' },
        ],
      },
    ],
    reviews: [
      {
        name: 'Lucas Meyer',
        rating: 5,
        date: 'October 1, 2026',
        comment:
          'Maria teaches the why behind every design decision. My logo work went from amateur to portfolio quality in a few weeks.',
      },
      {
        name: 'Amelia Foster',
        rating: 5,
        date: 'September 18, 2026',
        comment:
          'The brand identity project is fantastic. I used it as my main portfolio piece and it helped me land my first two freelance clients.',
      },
      {
        name: 'Rafi Ahmed',
        rating: 4,
        date: 'September 3, 2026',
        comment:
          'Really well structured course. The typography module alone changed how I look at every design I see.',
      },
    ],
    lessonsCount: 32,
    duration: '13h 10m',
    level: 'Beginner',
    language: 'English',
    certificate: true,
  },
  {
    slug: 'ui-ux-design',
    title: 'UI/UX Design with Figma: Research, Wireframes & Prototypes',
    category: 'Design & Media',
    thumbnail: 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=1200&h=675&fit=crop',
    videoUrl: SAMPLE_VIDEO_URL,
    instructor: {
      name: 'Daniel Lee',
      title: 'Senior Product Designer',
      photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop',
      bio: 'Daniel is a senior product designer who has shipped apps used by millions of people. He specialises in design systems and user research, and has mentored dozens of designers into their first product design roles.',
    },
    rating: 4.9,
    reviewCount: 57,
    students: 8920,
    price: 75000,
    oldPrice: 99000,
    currency: 'BDT',
    overview: [
      'Product design is one of the most rewarding creative careers, and Figma is the tool the entire industry uses. This course takes you through the complete design process: user research, wireframing, high-fidelity UI design, interactive prototyping and developer handoff.',
      'You will design three complete app projects — a mobile banking app, a booking platform and a SaaS dashboard — following the same process used by professional product teams.',
      'The course also covers how to build reusable design systems and how to present your work in a portfolio that gets interviews.',
    ],
    keyHighlights: [
      '38+ hours of project-based UI/UX training',
      'Master Figma: components, auto-layout, variables and prototyping',
      'Run user interviews and turn insights into designs',
      'Build a scalable design system from scratch',
      '3 complete app design projects for your portfolio',
      'Certificate of completion',
    ],
    whatYouLearn: [
      'Understand and apply the end-to-end UX design process',
      'Conduct user research and create accurate personas',
      'Build low-fidelity wireframes and user flows',
      'Design polished, accessible interfaces in Figma',
      'Create reusable components and design system libraries',
      'Build interactive prototypes that feel like real apps',
      'Test designs with users and iterate on feedback',
      'Prepare developer-ready handoff files and specifications',
    ],
    curriculum: [
      {
        title: 'UX Foundations',
        lessons: [
          { title: 'What product designers do and how teams work', duration: '10:15' },
          { title: 'User research methods and running interviews', duration: '22:40' },
          { title: 'Personas, journey maps and problem framing', duration: '18:25' },
          { title: 'Information architecture and user flows', duration: '19:50' },
        ],
      },
      {
        title: 'Wireframing',
        lessons: [
          { title: 'Sketching ideas quickly on paper and digital', duration: '13:35' },
          { title: 'Low-fidelity wireframes and layout patterns', duration: '17:20' },
          { title: 'Mobile-first vs desktop-first thinking', duration: '14:45' },
        ],
      },
      {
        title: 'UI Design in Figma',
        lessons: [
          { title: 'Figma essentials: frames, layers and the canvas', duration: '16:05' },
          { title: 'Typography, colour styles and spacing systems', duration: '19:30' },
          { title: 'Components, variants and auto-layout mastery', duration: '24:15' },
          { title: 'Designing the mobile banking app UI', duration: '32:20' },
        ],
      },
      {
        title: 'Prototyping & Handoff',
        lessons: [
          { title: 'Interactive prototypes, smart animate and transitions', duration: '18:55' },
          { title: 'Usability testing and iterating on feedback', duration: '16:40' },
          { title: 'Design systems and component libraries at scale', duration: '23:10' },
          { title: 'Developer handoff and inspect mode', duration: '14:25' },
        ],
      },
      {
        title: 'Portfolio & Career',
        lessons: [
          { title: 'Capstone: end-to-end SaaS dashboard design', duration: '36:15' },
          { title: 'Writing case studies that recruiters love', duration: '19:20' },
          { title: 'Interview prep and landing your first product role', duration: '15:35' },
        ],
      },
    ],
    reviews: [
      {
        name: 'Sophie Turner',
        rating: 5,
        date: 'October 4, 2026',
        comment:
          'The Figma components module is worth the whole course. I finally understand auto-layout and variants properly after struggling with tutorials for months.',
      },
      {
        name: 'Arjun Mehta',
        rating: 5,
        date: 'September 21, 2026',
        comment:
          'Switched from graphic design into product design using this course. Two months after finishing I started a junior product designer role.',
      },
      {
        name: 'Emily Clarke',
        rating: 5,
        date: 'September 7, 2026',
        comment:
          'Daniel is a brilliant teacher. The research-to-prototype workflow completely changed how I approach design challenges.',
      },
    ],
    lessonsCount: 40,
    duration: '16h 05m',
    level: 'Intermediate',
    language: 'English',
    certificate: true,
  },
]

const detailsBySlug = new Map(courseDetails.map(c => [c.slug, c]))

const FALLBACK_INSTRUCTOR_PHOTOS = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop',
]

function buildFallbackFromCatalog(c: CatalogCourse): CourseDetails {
  const slug = toSlug(c.title)
  const photo = FALLBACK_INSTRUCTOR_PHOTOS[c.id % FALLBACK_INSTRUCTOR_PHOTOS.length]
  const lessonsPerSection = Math.max(3, Math.ceil(c.lessons / 4))
  const hoursPerSection = Math.max(1, Math.round((c.hours / 4) * 10) / 10)
  const sectionTitles = [
    `${c.title} Foundations`,
    `Core Skills & Practice`,
    `Advanced Techniques`,
    `Real-World Projects`,
  ]

  return {
    slug,
    title: c.title,
    category: c.category,
    thumbnail: c.image,
    videoUrl: SAMPLE_VIDEO_URL,
    instructor: {
      name: c.instructor,
      title: `${c.level} Level Instructor`,
      photo,
      bio: `${c.instructor} is an experienced ${c.category} instructor who has helped thousands of students build practical, job-ready skills. In this course you will learn ${c.skills.join(', ')} through hands-on projects and guided exercises.`,
    },
    rating: c.rating,
    reviewCount: Math.max(12, Math.round(c.students / 180)),
    students: c.students,
    price: c.price,
    oldPrice: c.originalPrice || undefined,
    currency: 'BDT',
    overview: [
      `${c.title} is one of the most sought-after skills for today's job market. This course takes you from the fundamentals through to professional-level work with clear, project-based lessons.`,
      `You will focus on ${c.skills.join(', ')} — the exact skills employers ask for — while building real projects for your portfolio.`,
      `Join ${c.students.toLocaleString()} students already learning with ${c.instructor} and start building career-ready confidence today.`,
    ],
    keyHighlights: [
      `${c.hours} hours of on-demand video content`,
      `${c.lessons} lessons with hands-on exercises`,
      `Master ${c.skills.join(', ')}`,
      `${c.feature} included`,
      `Lifetime access with free updates`,
      'Certificate of completion',
    ],
    whatYouLearn: [
      `Build a strong ${c.title.toLowerCase()} foundation from day one`,
      `Apply ${c.skills[0]} to real projects with confidence`,
      `Follow professional workflows used by industry experts`,
      `Complete practical assignments and assessments`,
      `Add a portfolio-ready project to your resume`,
      `Stay current with modern tools and best practices`,
    ],
    curriculum: sectionTitles.map((title, i) => ({
      title,
      lessons: Array.from({ length: lessonsPerSection }, (_, j) => ({
        title: `${title} — Lesson ${j + 1}`,
        duration: `${Math.max(5, Math.round((hoursPerSection * 60) / lessonsPerSection))}:00`,
      })),
    })),
    reviews: [
      {
        name: 'Verified Student',
        rating: Math.min(5, Math.round(c.rating)),
        date: 'Recent',
        comment: `Great course on ${c.title}. The lessons are clear and easy to follow along with.`,
      },
      {
        name: 'Happy Learner',
        rating: Math.min(5, Math.round(c.rating)),
        date: 'Recent',
        comment: `${c.instructor} explains everything step by step. Definitely worth the investment.`,
      },
    ],
    lessonsCount: c.lessons,
    duration: c.duration,
    level: c.level,
    language: 'English',
    certificate: true,
  }
}

/**
 * Loose key used to match slugs/titles across data sources. Handles the common
 * differences between our local catalog and the backend slugs, e.g.
 * "UI/UX Design" (ui-ux-design) vs "uiux-design", and "&" vs "and"
 * ("cloud-computing-and-devops" vs "cloud-computing-devops").
 */
function normKey(value?: string | null): string {
  return String(value || '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/and/g, '')
    .replace(/[^a-z0-9]+/g, '')
}

export function getCourseBySlug(slug?: string | null): CourseDetails | null {
  if (!slug) return null
  const s = String(slug).toLowerCase().trim()
  if (!s) return null

  const detailed = detailsBySlug.get(s)
  if (detailed) return detailed

  const catalog = catalogCourses.find(c => toSlug(c.title) === s)
  if (catalog) return buildFallbackFromCatalog(catalog)

  // Normalized match so backend slugs still resolve to local (rich) content.
  const key = normKey(s)
  if (!key) return null
  const detailedNorm = courseDetails.find(c => normKey(c.slug) === key || normKey(c.title) === key)
  if (detailedNorm) return detailedNorm
  const catalogNorm = catalogCourses.find(c => normKey(c.title) === key)
  if (catalogNorm) return buildFallbackFromCatalog(catalogNorm)

  return null
}

export function getCourseByTitle(title?: string | null): CourseDetails | null {
  if (!title) return null
  const key = normKey(title)
  if (!key) return null
  const detailed = courseDetails.find(c => normKey(c.title) === key)
  if (detailed) return detailed
  const catalog = catalogCourses.find(c => normKey(c.title) === key)
  if (catalog) return buildFallbackFromCatalog(catalog)
  return null
}

export function getAllCourseSlugs(): string[] {
  const catalogSlugs = catalogCourses.map(c => toSlug(c.title))
  return Array.from(new Set([...courseDetails.map(c => c.slug), ...catalogSlugs]))
}

export function getRelatedCourses(slug: string, limit = 4): CourseDetails[] {
  return courseDetails.filter(c => c.slug !== slug).slice(0, limit)
}

export function formatCoursePrice(price: number, currency = 'USD'): string {
  const value = Number(price) || 0
  if (currency === 'BDT') return `৳${value.toLocaleString('en-US')}`
  if (currency === 'EUR') return `€${value.toFixed(2)}`
  if (currency === 'GBP') return `£${value.toFixed(2)}`
  if (currency === 'INR') return `₹${value.toLocaleString('en-US')}`
  return `$${value.toFixed(2)}`
}

const CATEGORY_FALLBACK_IMAGE: Record<string, string> = {
  'Design & Media': 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=1200&h=675&fit=crop',
  'Development & Tech': 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&h=675&fit=crop',
  'AI & Data Science': 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=1200&h=675&fit=crop',
  'Business & Marketing': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=675&fit=crop',
  'Personal Growth': 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&h=675&fit=crop',
  'Career Development': 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&h=675&fit=crop',
  'Language & Communication': 'https://images.unsplash.com/photo-1552581234-26160f608093?w=1200&h=675&fit=crop',
}
const DEFAULT_COURSE_IMAGE =
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&h=675&fit=crop'

export interface ApiCourseInput {
  id?: number
  title?: string
  slug?: string
  thumbnail?: string | null
  description?: string
  category?: string
  price?: number | string
  level?: string
  duration?: string
  students_count?: number
  rating?: number | string
  instructor?: { name?: string; avatar?: string | null } | null
  modules?: { title?: string; lessons?: { title?: string; duration?: string }[] }[]
  lessons?: { title?: string; duration?: string }[]
}

function capitalize(value?: string | null): string {
  if (!value) return 'All Levels'
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
}

/**
 * Build a full course-detail model from a backend course payload, enriching it
 * with local catalog metadata (image, skills, original price) when available so
 * every course page has rich, non-empty content.
 */
export function buildCourseFromApi(api: ApiCourseInput): CourseDetails {
  const catalog = findCatalogByTitle(api.title)
  const id = api.id ?? 0
  const title = api.title || catalog?.title || 'Course'
  const category = api.category || catalog?.category || 'Development & Tech'
  const thumbnail =
    api.thumbnail || catalog?.image || CATEGORY_FALLBACK_IMAGE[category] || DEFAULT_COURSE_IMAGE
  const instructorName = api.instructor?.name || catalog?.instructor || 'Learn2Earn Instructor'
  const photo =
    api.instructor?.avatar || FALLBACK_INSTRUCTOR_PHOTOS[id % FALLBACK_INSTRUCTOR_PHOTOS.length]
  const skills = catalog?.skills ?? []
  const rating = Number(api.rating) || catalog?.rating || 4.6
  const students = Number(api.students_count) || catalog?.students || 0
  const price = Number(api.price) || catalog?.price || 0
  const level = capitalize(api.level) || catalog?.level || 'All Levels'
  const duration = api.duration || catalog?.duration || '3 Months'
  const lessonsCount = api.lessons?.length || catalog?.lessons || 20

  const apiModules = (api.modules || []).filter(m => (m.lessons?.length || 0) > 0)
  const curriculum: CourseSection[] =
    apiModules.length > 0
      ? apiModules.map(m => ({
          title: m.title || 'Section',
          lessons: (m.lessons || []).map(l => ({
            title: l.title || 'Lesson',
            duration: l.duration || '10:00',
          })),
        }))
      : buildFallbackFromCatalog(
          catalog ?? {
            id,
            title,
            instructor: instructorName,
            rating,
            students,
            price,
            originalPrice: price,
            hours: Math.max(6, lessonsCount),
            lessons: lessonsCount,
            duration,
            category,
            image: thumbnail,
            skills,
            level,
            updated: '',
            feature: 'Hands-on projects',
          },
        ).curriculum

  const overviewParts = (api.description || '')
    .split(/\n+/)
    .map(line => line.trim())
    .filter(Boolean)
  const overview =
    overviewParts.length > 0
      ? overviewParts
      : [
          `${title} brings together everything you need to go from fundamentals to job-ready, with clear lessons and hands-on projects.`,
          `Join ${students.toLocaleString()} learners and build practical, portfolio-ready skills with ${instructorName}.`,
        ]

  const skillHighlights = skills.length > 0 ? skills : ['Core concepts', 'Hands-on practice', 'Real projects']

  return {
    slug: api.slug || toSlug(title),
    title,
    category,
    thumbnail,
    videoUrl: SAMPLE_VIDEO_URL,
    instructor: {
      name: instructorName,
      title: 'Course Instructor',
      photo,
      bio: `${instructorName} is an experienced ${category} instructor who has helped thousands of students build practical, job-ready skills. This course covers ${skillHighlights.join(', ')} through guided lessons and real projects.`,
    },
    rating,
    reviewCount: Math.max(12, Math.round(students / 180)),
    students,
    price,
    oldPrice: catalog?.originalPrice && catalog.originalPrice > price ? catalog.originalPrice : undefined,
    currency: 'BDT',
    overview,
    keyHighlights: [
      `${duration} of on-demand video content`,
      `${lessonsCount} lessons with hands-on exercises`,
      `Master ${skillHighlights.join(', ')}`,
      'Lifetime access with free updates',
      'Certificate of completion',
    ],
    whatYouLearn: [
      `Build a strong ${title.toLowerCase()} foundation from day one`,
      `Apply ${skillHighlights[0]} to real projects with confidence`,
      'Follow professional workflows used by industry experts',
      'Complete practical assignments and build a portfolio project',
      'Stay current with modern tools and best practices',
    ],
    curriculum,
    reviews: [
      {
        name: 'Verified Student',
        rating: Math.min(5, Math.round(rating)),
        date: 'Recent',
        comment: `Great course on ${title}. The lessons are clear and easy to follow along with.`,
      },
      {
        name: 'Happy Learner',
        rating: Math.min(5, Math.round(rating)),
        date: 'Recent',
        comment: `${instructorName} explains everything step by step. Definitely worth the investment.`,
      },
    ],
    lessonsCount,
    duration,
    level,
    language: 'English',
    certificate: true,
  }
}
