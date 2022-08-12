## 功能

1. 记录剪贴板历史，可以通过关键词搜索，支持图片和文本，无多余的交互操作更快捷。
2. 支持snippet代码片段管理，可以快捷搜索、粘贴、增加、删除代码片段。代码片段用文件管理,可以通过OneDrive等工具实现多设备同步。

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

## 注意事项

只有在剪贴板插件唤醒之后才能记录剪贴板历史, 建议配置【插件应用设置】-【跟随主程序启动】, 再配置utool开机自启, 这样就不遗漏剪贴历史了。

## 代码片段

使用方法：先唤出剪贴板
1. 输入`s `可以搜索代码片段
2. 输入`s add 代码片段名称`可以将当前剪贴板内容添加到代码片段
3. 输入`s add 代码片段名称 代码片段内容`可以添加代码片段
4. 输入`s del 代码片段名称`可以删除代码片段


## donate

如果觉得对你有帮助，可以考虑给我买杯☕

<table>
  <tr>
    <th width="50%">支付宝</th>
    <th width="50%">微信</th>
  </tr>
  <tr></tr>
  <tr align="center">
    <td><img width="70%" src="http://cos.inu1255.cn/images/alipay.jpg"></td>
    <td><img width="70%" src="http://cos.inu1255.cn/images/wx.png"></td>
  </tr>
</table>