---
id: troubleshooting-pro
title: CapRover Pro 故障排除
sidebar_label: 故障排除（Pro）
---

<br/>

本节仅适用于 CapRover Pro 订阅者（付费计划）。你可以订阅付费计划，并获得额外功能，例如构建状态通知，以及登录提醒和双因素身份验证等安全升级。

## 重置 OTP（双因素身份验证）

在少数情况下，你可能需要重置双因素身份验证，例如：

- https://pro.caprover.com 停止运行，并且你无法访问自己的实例
- 你失去了身份验证器 app 的访问权限

在这些情况下，你只需清除 pro configs，并暂时将服务器降级为非付费版本。删除 `/captain/data/config-captain.json` 中的 `pro` content 即可完成此操作。

下面的 helper script 会准确执行这些操作：

```bash
docker service scale captain-captain=0 && \
docker run -it --rm -v /captain:/captain  caprover/caprover /bin/sh -c "wget https://raw.githubusercontent.com/caprover/caprover/master/dev-scripts/clear-pro-config.js ; node clear-pro-config.js ;" && \
docker service scale captain-captain=1 && \
echo "OKAY"

```

**更新：**

从 v1.12.0 开始，你可以运行以下脚本：

```bash
docker exec -it $(docker ps --filter name=captain-captain -q) npm run disable-otp
```

## 在启用 OTP 的情况下部署

启用 OTP 后，你无法使用常规的 `caprover deploy` 进行部署，因为它需要 2FA token（`enter OTP token as well`）。你应该改用 App Tokens：

```bash
caprover deploy --caproverUrl https://captain.domain.com --appToken 123456123456123456 --appName my-app -b main
```

你可以在 Deployment tab 中启用 App Token。或者，也可以使用以下格式（不推荐）：

```bash
CAPROVER_OTP_TOKEN=123456; caprover login

## or

CAPROVER_OTP_TOKEN=123456; caprover deploy
```

## 为提醒设置特定 email address

目前还没有内置的 notification emails 修改功能。不过，选择 Google 作为 auth provider 的众多原因之一，就是你可以在 Gmail 中轻松设置 filters，将特定 email 转发到其他 email address。

只需搜索 `from: alerts@mail.pro.caprover.com` 并创建一个 filter，然后将搜索结果转发到另一个 email address。

![gmail-instruction-1](/img/docs/gmail-1.png)
![gmail-instruction-2](/img/docs/gmail-2.png)

## Email 支持

我们的付费 Pro plan 包含 24 小时 SLA email support。你可以发送 email 到 `pro.support at/caprover/dot/com` 获取支持。请务必使用购买时使用的同一个 email。
