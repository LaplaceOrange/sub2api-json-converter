# Sub2API JSON Converter

一个无需服务器的本地网页工具，用于批量合并和双向转换 Sub2API 账号 JSON：

- OAuth `access_token` -> Agent Identity `agent_runtime_id`
- OAuth `refresh_token` -> Agent Identity `agent_private_key`
- Agent Identity `agent_runtime_id` -> OAuth `access_token`
- Agent Identity `agent_private_key` -> OAuth `refresh_token`
- 支持一次选择或拖入多个 JSON 文件
- 支持按账号稳定标识和代理键去重，后添加的记录优先
- 支持保留扩展字段、格式化导出和无敏感值转换报告
- 所有内容仅在浏览器内存中处理，不会上传到服务器

## 使用

直接用浏览器打开 `index.html`，选择文件、目标格式后点击“合并并转换”。

## 测试

```powershell
node .\tests\converter.test.cjs
```
