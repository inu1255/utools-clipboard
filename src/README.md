## 功能

记录剪贴板历史，可以通过关键词搜索，支持图片和文本，无多余的交互操作更快捷。支持snippet代码片段管理，可以快捷搜索、粘贴、增加、删除代码片段

## 配置文件

用户目录/.utools-clipboard.yaml

配置项目
``` yaml
# 历史列表最大长度
limit: 5000
# 文本超过多长被标记为 large
large_text: 512
# 图片自动标记为 large
# 标记为large的资源在历史列表中下标超过多少被清理
large_limit: 100
# 代码片段路径
snippet_path: C:\Users\Administrator\OneDrive\.snippets.yaml
```

## 代码片段

使用方法：先唤出剪贴板
1. 输入`s `可以搜索代码片段
2. 输入`s add 代码片段名称`可以将当前剪贴板内容添加到代码片段
3. 输入`s add 代码片段名称 代码片段内容`可以添加代码片段
4. 输入`s del 代码片段名称`可以删除代码片段