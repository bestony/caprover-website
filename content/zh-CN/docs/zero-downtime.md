---
id: zero-downtime
title: 零停机部署
sidebar_label: 零停机
---

#### 示例：

如果你更喜欢通过示例学习，请参阅[此 GitHub 仓库](https://github.com/caprover/zero-downtime-example)。

该仓库包含一个启动需要 15 秒的示例应用。但是，在任何 CapRover 实例上部署此应用时，你都不会看到 502 错误。

请注意，创建应用时必须确保**不要**勾选“持久化数据”复选框。

### 了解挑战

部署过程中推出新的 Docker 镜像时，可能会出现暂时的服务中断（部署期间出现 502 错误）。这通常是因为新容器需要一些时间（例如 30 秒）才能完全运行。在此期间，如果服务收到流量，Nginx 可能会返回 502 Bad Gateway 错误，表示它无法从后端服务收到响应。

### Docker 健康检查的作用

Docker 健康检查是一项重要功能，有助于缓解部署导致的停机。你可以在 Dockerfile 中指定一个命令，定期检查容器的健康状态。Docker 随后会根据该状态信息管理容器的生命周期。

### 在 CapRover 中实现健康检查

要将健康检查集成到 CapRover 部署流程中，请按以下步骤操作：

**步骤 1：**在 Dockerfile 中定义健康检查
修改 Dockerfile，加入 `HEALTHCHECK` 指令。该指令告诉 Docker 如何测试容器是否仍在正常工作。可以使用检查容器内部状态的命令，也可以请求 HTTP 端点。

```dockerfile
HEALTHCHECK --interval=30s --timeout=30s --retries=3 \
 CMD curl -f http://127.0.0.1:3000/ || exit 1
```

在此示例中，curl 每 30 秒请求一次容器的根 URL。如果 curl 连续超过三次以非零状态退出（由 `--retries` 定义），容器就会被视为不健康。

**步骤 2：**在 CapRover 中部署并配置
更新 Dockerfile 后，通过 CapRover 部署应用。CapRover 使用 Docker Swarm，会识别健康检查指令并据此管理部署。

使用 Docker Swarm 时，CapRover 的默认行为是在新容器通过健康检查后，再将流量路由到该容器。这样可以有效避免将请求路由到尚未准备好处理请求的容器，从而防止 502 错误。

### 什么时候不起作用？

如果应用不使用 volume，CapRover 在更新容器时会使用 `start-first` 策略。这意味着新版本容器会先启动并运行，然后旧容器才会被终止，因此停机时间几乎为零。

对于挂载了 volume 的应用，CapRover 有意不使用此策略。这是因为同一服务的多个实例如果尝试访问同一个文件，会导致数据损坏和故障。对于带有 volume（**持久化数据**）的应用，CapRover 使用 `stop-first` 策略，即先停止旧容器，再启动新容器，因此会产生一定程度的停机。

如果应用有持久化数据，你仍然可以强制使用 `start-first` 策略，但请注意，这可能导致数据损坏，因为旧容器和新容器可能会同时尝试写入同一个文件。如果仍要这样做，只需在[服务覆盖配置](service-update-override.md)中输入以下内容：

```yaml
UpdateConfig:
  Parallelism: 2
  Delay: 1000000000
  FailureAction: pause
  Monitor: 15000000000
  MaxFailureRatio: 0.15
  Order: start-first
```
