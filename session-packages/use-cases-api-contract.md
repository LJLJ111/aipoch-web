# Open-Science Use Cases — 接口契约(mock 阶段)

> 前端已实现完成,后端按此契约提供接口即可。当前由 MSW mock 提供数据,
> mock 数据源文件在 `public/use-cases/`(由 `scripts/import-session-package.ts` 从 `.science` 导出包生成)。

## 接口列表

统一响应信封:`{ "code": 20000, "msg": "Success", "data": ... }`(非 20000 即失败)

| 方法 | 路径 | 说明 | data 类型 |
|---|---|---|---|
| GET | `/api/v1/open-science/use-cases` | 案例列表(首页/列表页) | `UseCaseIndexEntry[]` |
| GET | `/api/v1/open-science/use-cases/:slug/transcript` | 精简版对话(默认) | `UseCaseSession` |
| GET | `/api/v1/open-science/use-cases/:slug/transcript/full` | 完整版(点"View full version"时按需加载) | `UseCaseSession` |

资源文件(图片/PDF/CSV 等)不是接口返回的内容,而是 `assets` 里的 URL 直接引用;
当前指向站内静态文件 `/use-cases/<slug>/objects/…`。

**关于 S3**:后续接真实后端时,transcript JSON 由接口返回,`assets[].url` 换成
S3/CDN 地址(或预签名 URL)即可,前端不需要改动。

## 列表条目 `UseCaseIndexEntry`

```jsonc
{
  "slug": "glp1-microbiota-bile-acid",   // URL 段:/open-science/use-cases/<slug>
  "title": "基于肠道菌群–胆汁酸代谢轴的GLP-1受体激动剂…",
  "description": "研究GLP-1受体激动剂在减重过程中…",   // 可选
  "exportedAt": 1790140113259,           // 导出时间,毫秒时间戳
  "messageCount": 46,
  "activityCount": 72,
  "hasFull": true,                       // 是否有完整版;false 时前端隐藏切换按钮
  "fullSizeBytes": 53246876              // 完整层体积估计(按钮文案 + 进度条总量)
}
```

## 对话内容 `UseCaseSession`(精简版/完整版同一结构)

```jsonc
{
  "schemaVersion": 1,
  "slug": "…",
  "title": "…",
  "description": "…",              // 可选
  "projectName": "122",
  "exportedAt": 1790140113259,
  "sessionCreatedAt": 1790133043410,

  // 时间线:三种条目混排,按时间序
  "items": [
    // 1) 消息
    {
      "type": "message",
      "id": "message-1790133045295-1",
      "role": "user",               // "user" | "assistant"
      "content": "…(markdown 文本)",
      "status": "complete",         // complete | streaming | error
      "createdAt": 1790133045296,
      "completedAt": 1790134532162, // assistant 可选
      "parts": [ { "type": "text", "text": "…" } ],  // user 消息的结构化片段,可选
      "artifacts": [                // 该消息产出的文件(产物画廊),可选
        { "name": "glp1_prediction_prototype.png", "mimeType": "image/png",
          "size": 111392,
          "url": "/use-cases/glp1…/objects/99cf….png",  // 精简版大文件无 url
          "fullOnly": true }                           // fullOnly = 仅完整版可见
      ]
    },

    // 2) 提问卡(Agent 向用户提问,含已答状态)
    {
      "type": "elicitation",
      "id": "ask-user-question-…",
      "message": "您提供了研究主题…",
      "fields": [ { "id": "question_0", "label": "任务类型", "kind": "single-select",
                    "options": [ { "value": "…", "label": "…", "description": "…" } ] } ],
      "status": "completed",
      "createdAt": 1790133078207,
      "state": "answered",          // 可选:answered 时带答案
      "answers": [ { "fieldId": "question_0_custom", "value": "全都要" } ]
    },

    // 3) 工具调用组(折叠卡)
    {
      "type": "activity-group",
      "id": "call_04_…",
      "activities": [ {
        "id": "call_04_…",
        "title": "mcp__skills__load_skill",
        "providerToolName": "mcp__skills__load_skill",  // 前端按此分发渲染器
        "toolKind": "other",        // read | edit | execute | search | think | other…
        "status": "completed",      // pending | in_progress | completed | failed
        "toolDisposition": "declined",  // 可选:被拒绝/关闭
        "createdAt": 1790133157630,
        "updatedAt": 1790133160432,
        "input": { "skill": "mcp-literature" },   // 工具入参(已脱敏)
        "output": […],              // 工具结果(rawOutput)
        "contentBlocks": [ { "type": "content",
                             "content": { "type": "text", "text": "…" } } ],
        "locations": [ { "path": "…", "line": 1 } ],  // Read/Edit 类
        "run": {                    // notebook 执行类工具有:代码 + 输出
          "runId": "…", "status": "completed", "script": "…",
          "outputs": [ { "type": "stream", "name": "stdout", "text": "…" },
                       { "type": "display", "data": { "image/png": "/use-cases/…/figure-01.png" } } ]
        },
        "essentialTruncated": true  // 仅精简版:超长载荷被截断时存在
      } ]
    }
  ],

  // 资源表:storageKey → 可访问 URL;消息/工具里的文件引用都指向这里
  "assets": {
    "artifacts/<proj>/<sess>/…/content": {
      "url": "/use-cases/<slug>/objects/<sha256>.png",
      "filename": "content",
      "sizeBytes": 111392,
      "kind": "file"                // file | notebook | …
    }
  },

  "omissions": [ "Large tool payloads and files over 2 MiB are shortened…" ],
  "excludedFiles": []               // 导出时被用户剔除的文件
}
```

## 精简版 vs 完整版

两者**结构完全相同**,区别只在数据裁剪:

- 精简版:单字符串 >24KB 截断(带 `essentialTruncated` 标记);>2MiB 的文件不提供 `url`(标 `fullOnly`)
- 完整版:全部内容

前端渲染只认这一个结构,不区分来自哪一层。

## 附:样例文件

- `sample-index.json` — 列表接口真实样例(3 个案例)
- `sample-essential.json` — 一个小型会话的完整精简版样例(几 KB,可直接读)
