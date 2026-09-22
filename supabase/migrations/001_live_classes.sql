-- Create live_classes table with duration_minutes (NOT static end_time)
CREATE TABLE live_classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subject TEXT NOT NULL DEFAULT 'General',
  instructor_name TEXT NOT NULL,
  instructor_avatar_url TEXT,
  instructor_bio TEXT,
  description TEXT,
  thumbnail TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  meeting_url TEXT,
  max_seats INTEGER NOT NULL DEFAULT 100,
  enrolled_count INTEGER NOT NULL DEFAULT 0,
  recording_url TEXT,
  materials_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE live_classes ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view live_classes"
  ON live_classes FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert"
  ON live_classes FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update"
  ON live_classes FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete"
  ON live_classes FOR DELETE USING (auth.role() = 'authenticated');

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE live_classes;

-- Indexes
CREATE INDEX idx_live_classes_start_time ON live_classes (start_time);
CREATE INDEX idx_live_classes_subject ON live_classes (subject);

-- ──────────────────────────────────────
-- class_attendance: log when a student joins a live class
-- ──────────────────────────────────────
CREATE TABLE class_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES live_classes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT now(),
  points_earned INTEGER NOT NULL DEFAULT 10,
  UNIQUE(class_id, user_id)
);

ALTER TABLE class_attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own attendance"
  ON class_attendance FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own attendance"
  ON class_attendance FOR INSERT
  WITH CHECK (auth.uid() = user_id);

ALTER PUBLICATION supabase_realtime ADD TABLE class_attendance;

CREATE INDEX idx_class_attendance_user ON class_attendance (user_id);
