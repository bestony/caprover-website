---
id: app-configuration
title: 应用配置
sidebar_label: 应用配置
---

<br/>

## HTTP 设置

这里包含所有与 HTTP 相关的内容。如果你的应用不是 HTTP 应用，可以直接勾选“不要作为 Web 应用公开”。这适用于所有非 Web 应用，例如 MongoDB 或 MySQL 等数据库。

![httpsettings](/img/docs/app-http.png)

默认情况下，你部署的任何 Web 应用都会获得一个 Captain 域名，格式为：`appname.root.domain.com`。不过，你可以为此应用添加任意数量的域名。例如，你可以添加 `www.myawesomeapp.com` 和 `myawesomeapp.com`。

还有一些高级选项，例如编辑默认 Nginx 配置和容器 HTTP 端口，通常不需要修改。

#### 启用 HTTPS

CapRover 内置了对 Let's Encrypt 的支持，让你可以轻松地通过安全的 HTTPS 访问网站，无需担心 SSL 证书的费用（Let's Encrypt 免费提供），也无需繁琐地配置和续期证书。

要为任何域名启用 HTTPS，只需点击启用 HTTPS！几秒钟即可完成！

启用 HTTPS 后，你还可以选择强制所有请求使用 HTTPS（强烈建议这样做），也就是拒绝不安全的普通 HTTP 连接，并将其重定向到 HTTPS。


## 应用配置

这里可以设置运行时配置和选项。

![appconfig](/img/docs/app-vars.png)

### 环境变量

你可以为应用设置的最基本配置之一就是环境变量。这些变量通常用于传入不存储在代码中的数据，例如第三方服务的 API 密钥、数据库连接 URI 等。

你可以直接在控制面板中设置环境变量，并在代码中动态使用它们，例如，NodeJS 中使用 `process.env.VAR_NAME_HERE`，PHP 中使用 `$_ENV["VAR_NAME_HERE"]`。

如果希望在构建时访问这些变量，可以在 Dockerfile 中使用 ARG 命令。

```
FROM imagename....
ARG VAR_NAME_HERE=${VAR_NAME_HERE}
ENV VAR_NAME_HERE=${VAR_NAME_HERE}

## At this point, "VAR_NAME_HERE" is available as an env var during your build,
## you can do something like this:
## RUN echo $VAR_NAME_HERE
```

除了你自行设置的变量外，CapRover 还会设置一个 `CAPROVER_GIT_COMMIT_SHA` 环境变量，其值为正在部署的完整 git 提交 SHA。该变量仅在 Docker 构建期间可用，默认情况下在应用内部不可用。如果希望在应用内部使用它，可以参考以下示例：

```
FROM imagename....
ARG CAPROVER_GIT_COMMIT_SHA=${CAPROVER_GIT_COMMIT_SHA}
ENV CAPROVER_GIT_COMMIT_SHA=${CAPROVER_GIT_COMMIT_SHA}
```

### 端口映射

CapRover 允许你将容器端口映射到主机。如果希望让应用或容器的某个特定端口可以公开访问，就应使用此功能。最常见的场景是**从本地计算机连接到数据库容器**。

请注意，即使没有设置任何端口映射，同一 Captain 集群中的其他容器也可以访问所有端口。因此，只有在希望某个端口公开访问时才需要使用此选项。请确保已开放该端口，参见[防火墙设置](firewall.md)。

例如，没有端口映射时，Node.js 应用可以通过 `mongodb-app-name` 访问名为 `mongodb-app-name` 的应用。由 1.15 之前的 CapRover 版本升级而来的应用可能仍会保留带有 `srv-captain--` 前缀的 Docker 服务名称；带此前缀的网络别名仍会保留以兼容这些应用。

### 持久化目录

仅用于[持久化应用](persistent-apps.md)。

### 节点 ID

仅用于[持久化应用](persistent-apps.md)。持久化应用需要固定到某个特定节点（如果你有服务器集群）。NodeId 定义了该应用应固定到哪个节点。

### 服务标签

_自 1.11 版本起可用_

你可以为 caprover 服务添加特殊标签，以便更好地对应用进行分组，并在表格中查看它们。

### 实例数量

应用应同时运行多少个实例。你可以运行任意数量的实例，但会受到硬件资源的限制。如果增加此数量后没有足够的 RAM 或磁盘空间，系统可能会崩溃。建议在增加实例数量前考虑其性能影响。

### 预部署函数

这是一个[非常危险且高级的选项](pre-deploy-script.md)。除非你确实清楚自己在做什么，否则不要使用它。
