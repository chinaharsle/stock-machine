# MediaLibrary 调试指南

## 问题：后台编辑机器信息窗口中图片从资料库选择不显示图片

### 调试步骤

#### 1. 确认开发服务器正在运行
```bash
npm run dev
```
确保看到类似输出：
```
▲ Next.js 15.3.5 (Turbopack)
- Local:        http://localhost:3000
✓ Ready in 905ms
```

#### 2. 登录后台管理系统
1. 打开浏览器访问 `http://localhost:3000/dashboard`
2. 如果跳转到登录页面，请先登录
3. 确保能够看到后台管理仪表板

#### 3. 导航到机器管理页面
1. 在侧边栏点击 "机器管理"
2. 应该能看到机器列表（目前有3台机器）

#### 4. 测试图片选择功能
1. 点击任意机器的 "编辑" 按钮
2. 滚动到 "机器图片" 部分
3. 点击 "从资料库选择" 按钮
4. 应该弹出图片选择窗口

#### 5. 打开浏览器开发者工具
1. 按 F12 打开开发者工具
2. 切换到 "Console" 标签
3. 切换到 "Network" 标签

#### 6. 查看控制台日志
当点击 "从资料库选择" 按钮后，在Console中应该看到：

**正常情况：**
```
🔍 MediaLibrary: 开始获取文件列表，类型: image
🔍 MediaLibrary: 当前URL: http://localhost:3000/dashboard/machines
🔍 MediaLibrary: 检查cookies: [cookie信息]
📡 MediaLibrary: API响应状态: 200 OK
📡 MediaLibrary: API响应头: {...}
✅ MediaLibrary: 获取到数据: {...}
📊 MediaLibrary: 文件数量: 3
🖼️ MediaLibrary: 第一个文件示例: {...}
🖼️ MediaLibrary: 所有文件: [...]
```

**认证错误：**
```
🔍 MediaLibrary: 开始获取文件列表，类型: image
📡 MediaLibrary: API响应状态: 401 Unauthorized
❌ MediaLibrary: API响应错误: {success: false, error: "未授权访问", message: "请先登录"}
❌ MediaLibrary: 获取文件失败: Error: 用户未登录或认证已过期，请重新登录后台管理系统
```

#### 7. 查看网络请求
在 Network 标签中：
1. 刷新页面或重新点击 "从资料库选择"
2. 查找 `/api/admin/media` 请求
3. 点击该请求查看详细信息

**检查项目：**
- 请求状态应该是 200 OK
- 请求头应该包含正确的 cookies
- 响应应该包含 `files` 数组

#### 8. 常见问题排查

**问题1：401 未授权错误**
- 症状：弹窗显示 "用户未登录或认证已过期"
- 解决：
  1. 确保已经登录后台管理系统
  2. 刷新页面重新登录
  3. 检查浏览器cookies是否被清除

**问题2：图片不显示**
- 症状：弹窗打开但显示 "暂无已上传的图片"
- 解决：
  1. 检查控制台是否有错误
  2. 确认数据库中有机器数据
  3. 检查图片URL是否有效

**问题3：网络请求失败**
- 症状：控制台显示网络错误
- 解决：
  1. 确认开发服务器正在运行
  2. 检查防火墙设置
  3. 重启开发服务器

#### 9. 手动验证数据库数据
如果问题仍存在，可以使用以下脚本检查数据库：

```javascript
// 在浏览器控制台中运行
fetch('/api/admin/media?type=image&limit=100')
  .then(response => response.json())
  .then(data => {
    console.log('API响应:', data);
    if (data.files) {
      console.log('图片数量:', data.files.length);
      data.files.forEach((file, index) => {
        console.log(`图片 ${index + 1}:`, file.name, file.url);
      });
    }
  })
  .catch(error => {
    console.error('请求失败:', error);
  });
```

#### 10. 预期结果
- 图片选择弹窗应该显示3张图片
- 每张图片应该有预览图和名称
- 点击图片应该能够选择并关闭弹窗
- 选择的图片应该添加到机器的图片列表中

### 如果问题仍然存在
请提供以下信息：
1. 浏览器控制台的完整错误日志
2. Network标签中的API请求详情
3. 是否能够正常登录后台管理系统
4. 其他后台管理功能是否正常工作

### 联系信息
如果按照以上步骤仍无法解决问题，请提供详细的错误信息和调试日志。 