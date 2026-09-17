---
id: service-update-override
title: 服务更新覆盖配置
sidebar_label: 服务更新覆盖配置
---

**自 v1.8.0 起可用**

虽然[预部署脚本](pre-deploy-script.md)可以对服务进行强大的自定义，但有时它的权限超出了你的实际需求。

例如，Docker 允许你通过 [docker update 命令](https://docs.docker.com/engine/reference/commandline/service_update/)定义只读卷、仅 UDP 端口映射以及许多其他自定义标志。由于这些标志很少使用，并非全部都已移植到 CapRover。不过，在某些情况下你确实需要使用其中一些标志。这时，你可以定义服务覆盖配置的 JSON 或 YAML 内容。

每次部署新版本或更改应用中的配置参数时，你的服务都会经历更新流程：

1. CapRover 更新在 CapRover UI 中明确设置的字段（环境变量、实例数量等）。
2. 如果存在“服务更新覆盖配置”，CapRover 会使用覆盖内容覆盖上一步的结果。
3. 如果存在“预部署脚本”，CapRover 会运行预部署脚本。
4. 前面 3 步的结果会传递给 Docker API，由 Docker 在底层更新服务。

## Schema 结构

对于“服务更新覆盖配置”，你可以使用 YAML 或 JSON。Schema 必须匹配 Docker Engine API v1.44 中的 [Service Update 对象](https://docs.docker.com/reference/api/engine/version/v1.44/#tag/Service/operation/ServiceUpdate)。以下 YAML 是一个部分示例；API 支持其他参数。

```yaml
TaskTemplate:
  ContainerSpec:
    Labels:
      some.label: some.value
    Image: busybox
    Command:
      - ./mycommand.sh
    Hostname: my.domain.com
    CapabilityAdd:
      - CAP_NET_ADMIN
    DNSConfig:
      Nameservers:
         - 8.8.8.8 
         - 8.8.4.4 
    Mounts:
      - Type: bind
        Source: /host/directory
        Target: /some/path/in/container
        ReadOnly: true
    Args:
      - top
  Resources:
    Limits:
      MemoryBytes: 104857600
      NanoCPUs: 2000000000
    Reservations:
      MemoryBytes: 104857600
      NanoCPUs: 2000000000
  RestartPolicy:
    Condition: any
    MaxAttempts: 0
  Placement:
    Constraints:
      - node.id==2ivku8v2gvtg4
  Networks:
    - Target: captain-overlay-network
  LogDriver:
    Name: json-file
    Options:
      max-size: 512m
  ForceUpdate: 0
Mode:
  Replicated:
    Replicas: 1
UpdateConfig:
  Parallelism: 2
  Delay: 1000000000
  FailureAction: pause
  Monitor: 15000000000
  MaxFailureRatio: 0.15
  Order: start-first
RollbackConfig:
  Parallelism: 1
  Delay: 1000000000
  FailureAction: pause
  Monitor: 15000000000
  MaxFailureRatio: 0.15
  Order: start-first
EndpointSpec:
  Mode: vip
  Ports:
    - Name: something
      Protocol: tcp
      TargetPort: 80
      PublishedPort: 8080
      PublishMode: host
```


## 示例用例

一个常见用例是限制某个服务的资源使用。在这种情况下，你可以这样设置：

```
TaskTemplate:
  Resources:
    Limits:
      MemoryBytes:	104857600
      NanoCPUs: 2000000000
```

这会将服务的使用量限制为 2 个 CPU 和 100MB RAM。你可以运行以下命令确认：
```
docker service inspect your-app-name --pretty
```

使用 `docker service ls` 确认实际服务名称。由 1.15 之前的 CapRover 版本升级而来的应用可能仍会保留 `srv-captain--your-app-name` 形式。

另一个用例是自定义命令：
```yaml
TaskTemplate:
  ContainerSpec:
    Command: "./mycommand.sh"
```

如果需要向 Docker 服务添加某些 CAP_ADD，可以按如下方式操作：

```yaml
TaskTemplate:
  ContainerSpec:
    CapabilityAdd:
      - CAP_SYS_ADMIN
      - CAP_NET_ADMIN
```



## 恢复默认值

需要注意的一点是，CapRover 不会修改任何它不负责控制的现有标志。CapRover 控制的标志包括：环境变量、端口、镜像以及其他少数选项。

如果覆盖了 CapRover 不控制的属性，例如上面的 CPU 限制，那么即使删除覆盖配置，设置也不会恢复。这是因为该值已经在 Docker engine 中设置。

因此，不要直接移除覆盖配置，而应先将覆盖值改为另一个值，然后再删除。例如，如果想移除 CPU 和 RAM 限制：
- 首先将其设置为较高的值，例如 RAM 设置为 50GB、CPU 设置为 20 个
- 然后就可以移除覆盖配置。

当然，另一种方式是删除服务并创建一个新的服务。
