# 认知反应测试系统 API 接口文档

**版本**: v1.0
 **基础URL**: `http://localhost:8080`

------

## 📋 目录

1. [概述](https://claude.ai/chat/bdcac968-c9b3-4510-8c7a-a5bafb1a50f5#1-概述)
2. [认证接口](https://claude.ai/chat/bdcac968-c9b3-4510-8c7a-a5bafb1a50f5#2-认证接口-apiauth)
3. [测试接口](https://claude.ai/chat/bdcac968-c9b3-4510-8c7a-a5bafb1a50f5#3-测试接口-apitests)
4. [统计接口](https://claude.ai/chat/bdcac968-c9b3-4510-8c7a-a5bafb1a50f5#4-统计接口-apistatistics)
5. [分析接口](https://claude.ai/chat/bdcac968-c9b3-4510-8c7a-a5bafb1a50f5#5-分析接口-apianalytics)
6. [错误码说明](https://claude.ai/chat/bdcac968-c9b3-4510-8c7a-a5bafb1a50f5#6-错误码说明)

------

## 1. 概述

### 1.1 认证方式

除公开接口外，所有接口需要在请求头中携带JWT Token：

```
Authorization: Bearer <your_jwt_token>
```

### 1.2 请求/响应格式

- **Content-Type**: `application/json`
- **字符编码**: UTF-8

### 1.3 通用响应结构

**成功响应**:

```json
{
  "data": { ... },
  "message": "操作成功"
}
```

**错误响应**:

```json
{
  "message": "错误描述信息"
}
```

### 1.4 测试类型枚举

| 枚举值                 | 中文名称         | 描述                 |
| ---------------------- | ---------------- | -------------------- |
| `SIMPLE_REACTION`      | 简单反应时测试   | 看到绿色圆圈立即按键 |
| `CHOICE_REACTION`      | 选择反应时测试   | 根据箭头方向按对应键 |
| `CONTINUOUS_ATTENTION` | 连续性注意力测试 | 持续监测特定目标     |
| `WORKING_MEMORY`       | 工作记忆测试     | N-Back记忆任务       |

------

## 2. 认证接口 `/api/auth`

### 2.1 用户注册

**POST** `/api/auth/register`

**权限**: 🔓 公开

**请求体**:

```json
{
  "username": "testuser",
  "email": "user@example.com",
  "password": "password123"
}
```

| 字段     | 类型   | 必填 | 验证规则     |
| -------- | ------ | ---- | ------------ |
| username | string | ✅    | 3-50字符     |
| email    | string | ✅    | 有效邮箱格式 |
| password | string | ✅    | 6-100字符    |

**成功响应** `200 OK`:

```json
{
  "message": "注册成功！验证邮件已发送至 user@example.com，请查收并完成验证。"
}
```

**错误响应** `400 Bad Request`:

```json
{
  "message": "注册失败: 用户名已存在"
}
```

------

### 2.2 用户登录

**POST** `/api/auth/login`

**权限**: 🔓 公开

**请求体**:

```json
{
  "username": "testuser",
  "password": "password123"
}
```

**成功响应** `200 OK`:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "type": "Bearer",
  "id": 1,
  "username": "testuser",
  "email": "user@example.com",
  "role": "USER"
}
```

**错误响应** `400 Bad Request`:

```json
{
  "message": "请先验证您的邮箱后再登录"
}
```

------

### 2.3 验证邮箱

**GET** `/api/auth/verify-email?token={token}`

**权限**: 🔓 公开

| 参数  | 类型   | 必填 | 描述             |
| ----- | ------ | ---- | ---------------- |
| token | string | ✅    | 邮件中的验证令牌 |

**成功响应** `200 OK`:

```json
{
  "message": "邮箱验证成功！您现在可以登录了。"
}
```

------

### 2.4 重新发送验证邮件

**POST** `/api/auth/resend-verification`

**权限**: 🔓 公开

**请求体**:

```json
{
  "email": "user@example.com"
}
```

**成功响应** `200 OK`:

```json
{
  "message": "验证邮件已重新发送，请查收。"
}
```

------

### 2.5 忘记密码

**POST** `/api/auth/forgot-password`

**权限**: 🔓 公开

**请求体**:

```json
{
  "email": "user@example.com"
}
```

**成功响应** `200 OK`:

```json
{
  "message": "密码重置邮件已发送至 user@example.com，请在1小时内完成重置。"
}
```

------

### 2.6 验证重置令牌

**GET** `/api/auth/validate-reset-token?token={token}`

**权限**: 🔓 公开

**成功响应** `200 OK`:

```json
{
  "message": "Token有效"
}
```

**错误响应** `400 Bad Request`:

```json
{
  "message": "Token无效或已过期"
}
```

------

### 2.7 重置密码

**POST** `/api/auth/reset-password`

**权限**: 🔓 公开

**请求体**:

```json
{
  "token": "reset_token_from_email",
  "newPassword": "newpassword123",
  "confirmPassword": "newpassword123"
}
```

**成功响应** `200 OK`:

```json
{
  "message": "密码重置成功！请使用新密码登录。"
}
```

------

### 2.8 修改密码

**POST** `/api/auth/change-password`

**权限**: 🔒 需要登录

**请求头**:

```
Authorization: Bearer <token>
```

**请求体**:

```json
{
  "oldPassword": "currentpassword",
  "newPassword": "newpassword123",
  "confirmPassword": "newpassword123"
}
```

**成功响应** `200 OK`:

```json
{
  "message": "密码修改成功！"
}
```

------

### 2.9 获取当前用户信息

**GET** `/api/auth/me`

**权限**: 🔒 需要登录

**成功响应** `200 OK`:

```json
{
  "id": 1,
  "username": "testuser",
  "email": "user@example.com",
  "role": "USER",
  "createdAt": "2025-01-15T10:30:00",
  "lastLoginAt": "2025-12-02T08:00:00",
  "isActive": true,
  "emailVerified": true
}
```

------

## 3. 测试接口 `/api/tests`

### 3.1 获取测试类型列表

**GET** `/api/tests/types`

**权限**: 🔒 需要登录

**成功响应** `200 OK`:

```json
[
  {
    "type": "SIMPLE_REACTION",
    "name": "简单反应时测试"
  },
  {
    "type": "CHOICE_REACTION",
    "name": "选择反应时测试"
  },
  {
    "type": "GO_NO_GO",
    "name": "Go / No-Go测试"
  },
  {
    "type": "CONTINUOUS_ATTENTION",
    "name": "连续性注意力测试"
  },
  {
    "type": "WORKING_MEMORY",
    "name": "工作记忆测试"
  },
  {
    "type": "STROOP",
    "name": "Stroop测试"
  }
]
```

------

### 3.2 开始测试

**POST** `/api/tests/start`

**权限**: 🔒 需要登录

**请求体**:

```json
{
  "testType": "SIMPLE_REACTION"
}
```

**成功响应** `200 OK`:

```json
{
  "testId": 123,
  "testType": "SIMPLE_REACTION",
  "testName": "简单反应时测试",
  "message": "测试已创建，请开始测试"
}
```

------

### 3.3 完成测试

**POST** `/api/tests/{testId}/complete`

**权限**: 🔒 需要登录

**路径参数**:

| 参数   | 类型 | 描述   |
| ------ | ---- | ------ |
| testId | Long | 测试ID |

**请求体**:

```json
{
  "totalTimeMs": 45000,
  "totalTrials": 20,
  "correctTrials": 18,
  "rounds": [
    {
      "trialNumber": 1,
      "stimulus": "GREEN_CIRCLE",
      "response": "SPACE",
      "reactionTime": 245,
      "isCorrect": true
    },
    {
      "trialNumber": 2,
      "stimulus": "GREEN_CIRCLE",
      "response": "SPACE",
      "reactionTime": 312,
      "isCorrect": true
    }
  ]
}
```

**成功响应** `200 OK`:

```json
{
  "testId": 123,
  "testType": "SIMPLE_REACTION",
  "testName": "简单反应时测试",
  "status": "COMPLETED",
  "startTime": "2025-12-02T10:00:00",
  "endTime": "2025-12-02T10:00:45",
  "totalTimeMs": 45000,
  "statistics": {
    "totalTrials": 20,
    "correctTrials": 18,
    "accuracyRate": 0.9,
    "avgReactionTime": 285.5,
    "medianReactionTime": 278.0,
    "stdDeviation": 45.2,
    "fastestTime": 198,
    "slowestTime": 412
  },
  "brainRegions": [
    {
      "region": "PRIMARY_MOTOR_CORTEX",
      "regionName": "初级运动皮层",
      "abbreviation": "M1",
      "description": "负责执行运动指令，控制手指按键动作"
    },
    {
      "region": "THALAMUS",
      "regionName": "丘脑",
      "abbreviation": "THL",
      "description": "视觉信息的中继站，传递视觉刺激信号"
    }
  ],
  "rank": {
    "percentile": 75.5,
    "description": "良好！超过了 75.5% 的用户"
  },
  "rounds": [...]
}
```

------

### 3.4 获取测试结果详情

**GET** `/api/tests/{testId}`

**权限**: 🔒 需要登录

**成功响应**: 同 3.3 完成测试的响应格式

------

### 3.5 获取测试历史

**GET** `/api/tests/history`

**权限**: 🔒 需要登录

**查询参数**:

| 参数     | 类型   | 必填 | 描述             |
| -------- | ------ | ---- | ---------------- |
| testType | string | ❌    | 筛选特定测试类型 |

**成功响应** `200 OK`:

```json
[
  {
    "testId": 123,
    "testType": "SIMPLE_REACTION",
    "testName": "简单反应时测试",
    "status": "COMPLETED",
    "startTime": "2025-12-02T10:00:00",
    "endTime": "2025-12-02T10:00:45",
    "totalTimeMs": 45000,
    "totalTrials": 20,
    "correctTrials": 18,
    "accuracyRate": 0.9,
    "avgReactionTime": 285.5,
    "percentileRank": 75.5
  }
]
```

------

### 3.6 取消测试

**POST** `/api/tests/{testId}/cancel`

**权限**: 🔒 需要登录

**成功响应** `200 OK`:

```json
{
  "message": "测试已取消"
}
```

------

## 4. 统计接口 `/api/statistics`

### 4.1 获取全局统计

**GET** `/api/statistics/global`

**权限**: 🔓 公开

**成功响应** `200 OK`:

```json
{
  "totalUsers": 1250,
  "totalTests": 8540,
  "totalTestsToday": 156,
  "testTypeCounts": [
    {
      "testType": "SIMPLE_REACTION",
      "testName": "简单反应时测试",
      "count": 3200
    },
    {
      "testType": "CHOICE_REACTION",
      "testName": "选择反应时测试",
      "count": 2800
    }
  ]
}
```

------

### 4.2 获取排行榜

**GET** `/api/statistics/leaderboard`

**权限**: 🔓 公开（登录用户可看到自己排名）

**查询参数**:

| 参数  | 类型 | 默认值 | 描述     |
| ----- | ---- | ------ | -------- |
| limit | int  | 10     | 返回条数 |

**成功响应** `200 OK`:

```json
{
  "rankings": [
    {
      "rank": 1,
      "username": "champion",
      "testCount": 156,
      "avgAccuracy": null,
      "avgReactionTime": null
    },
    {
      "rank": 2,
      "username": "runner_up",
      "testCount": 142,
      "avgAccuracy": null,
      "avgReactionTime": null
    }
  ],
  "totalUsers": 1250,
  "currentUser": {
    "rank": 45,
    "testCount": 23
  }
}
```

------

### 4.3 获取测试类型统计

**GET** `/api/statistics/test-type/{testType}`

**权限**: 🔓 公开

**路径参数**:

| 参数     | 类型     | 描述         |
| -------- | -------- | ------------ |
| testType | TestType | 测试类型枚举 |

**成功响应** `200 OK`:

```json
{
  "testType": "SIMPLE_REACTION",
  "testName": "简单反应时测试",
  "totalTests": 3200,
  "avgReactionTime": 298.5,
  "minReactionTime": 145.0,
  "maxReactionTime": 850.0,
  "avgAccuracy": 0.92,
  "minAccuracy": 0.45,
  "maxAccuracy": 1.0,
  "reactionTimeDistribution": [
    {"range": "<200ms", "count": 120, "percentage": 3.8},
    {"range": "200-250ms", "count": 580, "percentage": 18.1},
    {"range": "250-300ms", "count": 1200, "percentage": 37.5},
    {"range": "300-350ms", "count": 800, "percentage": 25.0},
    {"range": "350-400ms", "count": 320, "percentage": 10.0},
    {"range": "400-500ms", "count": 140, "percentage": 4.4},
    {"range": ">500ms", "count": 40, "percentage": 1.2}
  ],
  "accuracyDistribution": [
    {"range": "<50%", "count": 15, "percentage": 0.5},
    {"range": "50-60%", "count": 45, "percentage": 1.4},
    {"range": "60-70%", "count": 120, "percentage": 3.8},
    {"range": "70-80%", "count": 380, "percentage": 11.9},
    {"range": "80-90%", "count": 1200, "percentage": 37.5},
    {"range": "90-100%", "count": 1440, "percentage": 45.0}
  ]
}
```

------

### 4.4 获取反应时间分布

**GET** `/api/statistics/distribution/reaction-time/{testType}`

**权限**: 🔓 公开

**成功响应** `200 OK`:

```json
{
  "testType": "SIMPLE_REACTION",
  "testName": "简单反应时测试",
  "totalTests": 3200,
  "buckets": [
    {"range": "<200ms", "count": 120, "percentage": 3.8},
    {"range": "200-250ms", "count": 580, "percentage": 18.1}
  ]
}
```

------

### 4.5 获取准确率分布

**GET** `/api/statistics/distribution/accuracy/{testType}`

**权限**: 🔓 公开

**成功响应**: 格式同 4.4

------

### 4.6 获取所有类型统计概览

**GET** `/api/statistics/overview`

**权限**: 🔓 公开

**成功响应** `200 OK`:

```json
[
  {
    "testType": "SIMPLE_REACTION",
    "testName": "简单反应时测试",
    "totalTests": 3200,
    "avgReactionTime": 298.5,
    "avgAccuracy": 0.92
  },
  {
    "testType": "CHOICE_REACTION",
    "testName": "选择反应时测试",
    "totalTests": 2800,
    "avgReactionTime": 412.3,
    "avgAccuracy": 0.85
  }
]
```

------

## 5. 分析接口 `/api/analytics`

### 5.1 获取所有测试类型及大脑区域

**GET** `/api/analytics/test-types`

**权限**: 🔓 公开

**成功响应** `200 OK`:

```json
[
  {
    "type": "SIMPLE_REACTION",
    "name": "简单反应时测试",
    "brainRegions": [
      {
        "region": "PRIMARY_MOTOR_CORTEX",
        "regionName": "初级运动皮层",
        "abbreviation": "M1",
        "description": "负责执行运动指令，控制手指按键动作"
      },
      {
        "region": "BRAINSTEM",
        "regionName": "脑干",
        "abbreviation": "BS",
        "description": "维持警觉状态，处理基本的感觉输入"
      }
    ]
  }
]
```

------

### 5.2 获取特定测试类型的大脑区域

**GET** `/api/analytics/brain-regions/{testType}`

**权限**: 🔓 公开

**成功响应** `200 OK`:

```json
{
  "testType": "SIMPLE_REACTION",
  "testName": "简单反应时测试",
  "brainRegions": [
    {
      "region": "PRIMARY_MOTOR_CORTEX",
      "regionName": "初级运动皮层",
      "abbreviation": "M1",
      "description": "负责执行运动指令，控制手指按键动作"
    }
  ]
}
```

------

### 5.3 获取所有大脑区域列表

**GET** `/api/analytics/brain-regions`

**权限**: 🔓 公开

**成功响应** `200 OK`:

```json
[
  {
    "region": "PRIMARY_MOTOR_CORTEX",
    "regionName": "初级运动皮层",
    "abbreviation": "M1"
  },
  {
    "region": "PREFRONTAL_CORTEX",
    "regionName": "前额叶皮层",
    "abbreviation": "PFC"
  },
  {
    "region": "DORSOLATERAL_PFC",
    "regionName": "背外侧前额叶皮层",
    "abbreviation": "DLPFC"
  },
  {
    "region": "ANTERIOR_CINGULATE",
    "regionName": "前扣带回皮层",
    "abbreviation": "ACC"
  },
  {
    "region": "PARIETAL_CORTEX",
    "regionName": "顶叶皮层",
    "abbreviation": "PC"
  },
  {
    "region": "HIPPOCAMPUS",
    "regionName": "海马体",
    "abbreviation": "HPC"
  },
  {
    "region": "BASAL_GANGLIA",
    "regionName": "基底神经节",
    "abbreviation": "BG"
  },
  {
    "region": "THALAMUS",
    "regionName": "丘脑",
    "abbreviation": "THL"
  },
  {
    "region": "BRAINSTEM",
    "regionName": "脑干",
    "abbreviation": "BS"
  },
  {
    "region": "PREMOTOR_CORTEX",
    "regionName": "运动前区",
    "abbreviation": "PMC"
  },
  {
    "region": "LOCUS_COERULEUS",
    "regionName": "蓝斑",
    "abbreviation": "LC"
  }
]
```

------

## 6. 错误码说明

### 6.1 HTTP 状态码

| 状态码 | 含义                  | 说明              |
| ------ | --------------------- | ----------------- |
| 200    | OK                    | 请求成功          |
| 400    | Bad Request           | 请求参数错误      |
| 401    | Unauthorized          | 未认证或Token失效 |
| 403    | Forbidden             | 无权限访问        |
| 404    | Not Found             | 资源不存在        |
| 500    | Internal Server Error | 服务器内部错误    |

### 6.2 业务错误信息

| 错误信息                 | 说明             | 解决方案               |
| ------------------------ | ---------------- | ---------------------- |
| 用户名已存在             | 注册时用户名重复 | 更换用户名             |
| 邮箱已被注册             | 注册时邮箱重复   | 使用其他邮箱或找回密码 |
| 请先验证您的邮箱后再登录 | 邮箱未验证       | 查收验证邮件           |
| 无效或已过期的验证链接   | Token失效        | 重新发送验证邮件       |
| 测试不存在               | 测试ID无效       | 检查测试ID             |
| 无权操作此测试           | 非本人测试       | 确认登录账号           |
| 测试已完成，不能重复提交 | 重复提交         | 无需再次提交           |

------

## 附录 A: 接口权限总览

| 接口                             | 方法 | 权限     |
| -------------------------------- | ---- | -------- |
| `/api/auth/register`             | POST | 🔓 公开   |
| `/api/auth/login`                | POST | 🔓 公开   |
| `/api/auth/verify-email`         | GET  | 🔓 公开   |
| `/api/auth/resend-verification`  | POST | 🔓 公开   |
| `/api/auth/forgot-password`      | POST | 🔓 公开   |
| `/api/auth/validate-reset-token` | GET  | 🔓 公开   |
| `/api/auth/reset-password`       | POST | 🔓 公开   |
| `/api/auth/change-password`      | POST | 🔒 登录   |
| `/api/auth/me`                   | GET  | 🔒 登录   |
| `/api/tests/*`                   | ALL  | 🔒 登录   |
| `/api/statistics/*`              | GET  | 🔓 公开   |
| `/api/analytics/*`               | GET  | 🔓 公开   |
| `/api/admin/*`                   | ALL  | 🔒 管理员 |

------

**文档维护**: 认知反应测试系统开发组
 **联系方式**: dev@example.com