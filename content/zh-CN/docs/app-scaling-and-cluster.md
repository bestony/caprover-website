---
id: app-scaling-and-cluster
title: 应用扩展与集群
sidebar_label: 应用扩展与集群
---

<br/>

CapRover 提供了多种扩展应用的方式，可以让应用运行在多个进程上，从而充分利用服务器上的所有资源。

## 运行应用的多个实例：

你的 Pizza 应用运行得非常好，网站每天获得数千次访问。一个应用实例已经不够用了，延迟也开始升高。接下来可以考虑在 Captain 上运行应用的多个实例。你可以在 Captain Web 的“应用”部分完成此操作。假设你将实例数量改为 3，Captain 会同时创建 3 个应用实例。如果其中任何一个实例停止运行（崩溃），Captain 会自动启动一个新的实例！你的 Pizza 应用始终会有 3 个实例在运行！更重要的是，Captain 会自动在不同的应用实例之间分配请求。

## 运行多个服务器：

哇！你的 Pizza 应用真的很受欢迎！应用的 3 个实例都运行在同一台服务器上，RAM 和 CPU 几乎已经达到上限。你需要再添加一台服务器。如何连接这些服务器？Captain 会为你完成这件事 ;-) 你只需准备一台安装了 Docker 的服务器，步骤与准备第一台 Captain 服务器时类似。请确保新服务器可以通过 SSH 从原始 Captain 服务器访问（例如，将 Captain 的 SSH 公钥复制到第二台服务器）。

CapRover 底层使用 [Docker Swarm](https://docs.docker.com/engine/swarm/)。你可以使用 CapRover UI 设置节点集群，也可以使用普通的 Docker Swarm 命令（`docker swarm join...` 命令）设置集群。这两种方式完全没有区别：第一种使用 UI，第二种使用命令行。

此时，你需要输入以下信息：

- CapRover IP 地址（远程端看到的地址）：这是原始服务器的 IP 地址
- 新节点 IP 地址（Captain 看到的地址）：这是第二台服务器的 IP 地址
- `root` 用户的私有 SSH 密钥：这是 CapRover 服务器上的 SSH 密钥，Captain 将使用它通过 SSH 连接第二台服务器。在 Linux 上，它位于 `/home/yourusername/.ssh/id_rsa`
- 节点类型：用于描述新服务器的角色。如果你刚开始使用 Docker，请选择 `worker`；详情请参阅 https://docs.docker.com/engine/swarm/how-swarm-mode-works/nodes/

现在，进入 Captain 的“集群”部分，将这些值填入“节点”区域的字段，然后点击加入集群。完成！你现在拥有了自己的真实集群！你可以将实例数量改为 6，Captain 会自动在另一台服务器上为你启动一些实例，同时自动对请求进行负载均衡，并在某台机器停止运行时创建新的实例。

Leader 节点是被选为 Leader 的 manager。Captain 以及 nginx 和 Certbot（Let's Encrypt）等主要服务会在此节点上运行。Docker Swarm 会自动将你的所有应用分配到各个节点。

请注意，只有未启用“持久化数据”的应用才能跨节点扩展。启用了“持久化数据”的应用只能运行在 1 个节点上。

### 默认推送 Registry：

默认推送 Docker Registry 是一个 Docker Registry，你的应用部署到服务器后会立即存储在其中。

对于集群模式（多于一台服务器），你需要设置默认推送 Docker Registry。

### 设置 Docker Registry：

Docker Registry 本质上是一个仓库，集群中的不同节点可以从中下载并运行你的应用。如果只有一台服务器（没有集群），设置 Docker Registry 基本没有任何好处。

另一方面，集群必须设置并准备好 Docker Registry。要设置 Registry，只需进入 Captain Web 控制面板，从菜单中选择集群，然后按照说明操作。你将看到两个选项：

- 由 Captain 管理的 Docker Registry。
- 由第三方提供商管理的 Docker Registry。

在大多数情况下，由 Captain 管理的 Registry 就足够了。请注意，从单节点切换到集群之前，如果已有应用，则必须设置 Registry，并重新部署所有现有应用，以确保它们已推送到 Registry，并且所有节点都能访问，而不只是主 Leader 节点。

### 多个 Registry：

你可以同时连接到多个 Registry。例如，你可能同时连接到 AWS 上的私有 Docker Registry 和 DockerHub 上的私有 Docker Registry，因为某些应用（镜像）存储在 AWS 私有 Registry 中，另一些存储在 DockerHub 中。

不过，你只能有一个默认推送 Registry。应用在服务器上构建完成后，镜像会被推送到这个 Registry。

### 禁用 Registry：

你可以随时选择：

- 禁用 Registry
- 删除 Registry 身份验证详情

但是请注意，如果你拥有集群（多于一台服务器），移除 Docker Registry 后，你的应用可能会出现异常。

### 添加私有 Docker Registry：

如果需要从 ghcr.io 或 dockerhub 等私有 Docker Registry 拉取镜像，则需要向 CapRover 提供凭据，以便它能够拉取镜像。例如，对于 ghcr.io，你需要提供以下信息：

- 用户名：`<your github username>`
- 密码：[创建的个人令牌](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token) - 请确保它至少具有读取软件包的权限。
- 域名：`ghcr.io`
- 镜像前缀：`<your github username>`（必须为小写）

如果 Docker 镜像存储为 `your-username/your-image`，则使用你的 GitHub 用户名作为镜像前缀。否则，如果你的镜像存储在 GitHub 的组织中，例如 `my-org/my-image`，则使用 `my-org` 作为镜像前缀。

你可以在**集群**菜单下设置凭据。如果只打算拉取镜像，请确保禁用**推送新镜像**。
