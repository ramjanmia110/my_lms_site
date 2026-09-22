-- 003: Rebuild Live Classes with categories, student points, and revised schema

-- ──────────────────────────────────────
-- class_categories
-- ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS class_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  color_hex TEXT NOT NULL
);

ALTER TABLE class_categories ENABLE ROW LEVEL LEVEL;

CREATE POLICY "Anyone can view class_categories" ON class_categories FOR SELECT USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE class_categories;

-- ──────────────────────────────────────
-- student_points
-- ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS student_points (
  student_id TEXT PRIMARY KEY,
  total_points INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE student_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own points" ON student_points FOR SELECT USING (auth.uid()::text = student_id);

CREATE POLICY "System can upsert points" ON student_points FOR INSERT WITH CHECK (true);
CREATE POLICY "System can update points" ON student_points FOR UPDATE USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE student_points;

-- ──────────────────────────────────────
-- Add category_id + status to live_classes
-- ──────────────────────────────────────
ALTER TABLE live_classes ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES class_categories(id) ON DELETE SET NULL;
ALTER TABLE live_classes ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published'));

CREATE INDEX IF NOT EXISTS idx_live_classes_category ON live_classes (category_id);

-- ──────────────────────────────────────
-- Seed categories (6 — matching spec color tokens)
-- ──────────────────────────────────────
INSERT INTO class_categories (name, color_hex) VALUES
  ('Web Development',   '#34d399'),
  ('Computer Science',  '#60a5fa'),
  ('English',           '#f472b6'),
  ('Design',            '#fbbf24'),
  ('Programming',       '#a78bfa'),
  ('Marketing',         '#fb923c')
ON CONFLICT (name) DO NOTHING;

-- ──────────────────────────────────────
-- Seed 8 sample live classes spanning live / upcoming / past
-- ──────────────────────────────────────
WITH cats AS (SELECT id, name FROM class_categories)
INSERT INTO live_classes (title, category_id, instructor_name, instructor_avatar_url, instructor_bio, description, start_time, duration_minutes, meeting_url, max_seats, enrolled_count, recording_url, materials_url, status)
SELECT * FROM (VALUES
  (
    'Advanced React Patterns',
    (SELECT id FROM cats WHERE name = 'Web Development'),
    'Farhan Ahmed', NULL,
    'Senior frontend engineer with 8+ years in React ecosystem.',
    'Compound components, render props, hooks, and context API patterns.',
    NOW() - INTERVAL '8 minutes', 60,
    'https://meet.jit.si/lms-react-patterns',
    40, 34, NULL, NULL, 'published'
  ),
  (
    'Intro to Data Structures',
    (SELECT id FROM cats WHERE name = 'Computer Science'),
    'Nabila Rahman', NULL,
    'Data structures & algorithms instructor at top universities.',
    'Arrays, linked lists, stacks, queues, and trees with live coding.',
    NOW() + INTERVAL '35 minutes', 45,
    'https://meet.jit.si/lms-ds-intro',
    60, 58, NULL, NULL, 'published'
  ),
  (
    'IELTS Speaking Masterclass',
    (SELECT id FROM cats WHERE name = 'English'),
    'Tanvir Islam', NULL,
    'IELTS examiner with 10 years of experience.',
    'Practice Part 1, 2, and 3 with real-time feedback.',
    NOW() + INTERVAL '3 hours', 90,
    'https://meet.jit.si/lms-ielts-speaking',
    30, 12, NULL, NULL, 'published'
  ),
  (
    'UI/UX Design Fundamentals',
    (SELECT id FROM cats WHERE name = 'Design'),
    'Shaila Sabrin Rina', NULL,
    'Product designer specialising in user research and prototyping.',
    'Wireframing, prototyping, and user research with Figma.',
    NOW() - INTERVAL '2 days', 60,
    'https://meet.jit.si/lms-uiux-fundamentals',
    50, 50, 'https://example.com/recordings/uiux-design', 'https://example.com/materials/uiux-design.pdf', 'published'
  ),
  (
    'Python for Beginners: Loops & Functions',
    (SELECT id FROM cats WHERE name = 'Programming'),
    'Rafiq Hasan', NULL,
    'Full-stack developer and Python enthusiast.',
    'Master for/while loops, functions, scoping, and lambda expressions.',
    NOW() - INTERVAL '3 days', 75,
    'https://meet.jit.si/lms-python-loops',
    45, 45, 'https://example.com/recordings/python-loops', 'https://example.com/materials/python-loops.pdf', 'published'
  ),
  (
    'Digital Marketing Strategy 101',
    (SELECT id FROM cats WHERE name = 'Marketing'),
    'Nabila Rahman', NULL,
    'Digital marketing strategist with award-winning campaigns.',
    'SEO, SEM, social media, email marketing, and analytics tracking.',
    NOW() + INTERVAL '1 day', 60,
    'https://meet.jit.si/lms-marketing-101',
    80, 21, NULL, NULL, 'published'
  ),
  (
    'Machine Learning: Linear Regression',
    (SELECT id FROM cats WHERE name = 'Computer Science'),
    'Farhan Ahmed', NULL,
    'ML engineer building production models at scale.',
    'Cost functions, gradient descent, and R-squared evaluation.',
    NOW() - INTERVAL '5 days', 120,
    'https://meet.jit.si/lms-ml-linreg',
    50, 42, 'https://example.com/recordings/ml-linreg', 'https://example.com/materials/ml-linreg.pdf', 'published'
  ),
  (
    'Business English: Negotiation Skills',
    (SELECT id FROM cats WHERE name = 'English'),
    'Tanvir Islam', NULL,
    'Business communication coach for professionals.',
    'Key phrases, tone management, and cultural considerations.',
    NOW() + INTERVAL '6 hours', 90,
    'https://meet.jit.si/lms-biz-english',
    25, 20, NULL, NULL, 'published'
  )
) AS v
WHERE EXISTS (SELECT 1 FROM cats);  -- only insert if categories exist

-- ──────────────────────────────────────
-- Seed demo attendance + points
-- ──────────────────────────────────────
INSERT INTO class_attendance (class_id, user_id, points_earned)
SELECT id, 'demo-user-001', 10 FROM live_classes WHERE start_time < NOW()
ON CONFLICT (class_id, user_id) DO NOTHING;

INSERT INTO student_points (student_id, total_points)
VALUES ('demo-user-001', (SELECT COUNT(*) * 10 FROM class_attendance WHERE user_id = 'demo-user-001'))
ON CONFLICT (student_id) DO UPDATE SET total_points = (SELECT COUNT(*) * 10 FROM class_attendance WHERE user_id = 'demo-user-001');
