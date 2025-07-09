-- 创建第一个管理员用户
-- 请将 YOUR_USER_ID 替换为从 Authentication > Users 中复制的用户ID
-- 请将 YOUR_EMAIL 替换为您注册的邮箱地址

INSERT INTO public.admin_users (user_id, email, name, is_admin, created_at, updated_at, last_login)
VALUES (
  'YOUR_USER_ID',                    -- 替换为实际的用户ID
  'YOUR_EMAIL',                      -- 替换为实际的邮箱地址  
  'Administrator',                   -- 管理员名称，可以修改
  true,                             -- 设置为管理员
  NOW(),                            -- 创建时间
  NOW(),                            -- 更新时间
  NOW()                             -- 最后登录时间
);

-- 验证管理员用户是否创建成功
SELECT * FROM public.admin_users WHERE is_admin = true; 