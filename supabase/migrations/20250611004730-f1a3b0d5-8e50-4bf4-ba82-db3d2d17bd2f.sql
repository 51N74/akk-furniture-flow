
-- เพิ่มคอลัมน์ username ในตาราง profiles
ALTER TABLE public.profiles 
ADD COLUMN username TEXT UNIQUE;

-- เพิ่มคอลัมน์อื่นๆ สำหรับข้อมูลพนักงาน
ALTER TABLE public.profiles 
ADD COLUMN position TEXT,
ADD COLUMN department TEXT,
ADD COLUMN hire_date DATE,
ADD COLUMN salary DECIMAL(10,2),
ADD COLUMN status TEXT DEFAULT 'active';

-- สร้าง index สำหรับ username เพื่อเพิ่มประสิทธิภาพการค้นหา
CREATE INDEX idx_profiles_username ON public.profiles(username);

-- อัพเดต RLS policies เพื่อรองรับการจัดการพนักงาน
CREATE POLICY "Admins can manage all profiles" ON public.profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- สร้างฟังก์ชันสำหรับค้นหาผู้ใช้ด้วย username
CREATE OR REPLACE FUNCTION public.get_user_by_username(input_username TEXT)
RETURNS TABLE(
  id UUID,
  email TEXT,
  username TEXT,
  first_name TEXT,
  last_name TEXT,
  role TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.email,
    p.username,
    p.first_name,
    p.last_name,
    p.role
  FROM public.profiles p
  WHERE p.username = input_username;
END;
$$;
