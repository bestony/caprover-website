---
id: get-started
title: 开始使用
sidebar_label: 开始使用
---

## 简单设置

推荐通过 DigitalOcean 一键应用安装 CapRover。CapRover 已作为一键应用发布在 DigitalOcean Marketplace 中。

请注意，如果你是 DigitalOcean 新用户，注册后前两个月可获得 **100 美元免费额度**。这足够支付多台服务器两个月的费用！

使用此方法时，可以跳过下面的 **前置条件** 部分以及 **CapRover 设置** 中的第 1 步！

<br/>

<a href="https://marketplace.digitalocean.com/apps/caprover?action=deploy&refcode=6410aa23d3f3" target="_blank" rel="noreferrer noopener">
<img src="/img/do-btn-blue.svg" alt="CreateDroplet" width="300" />
</a>

<br/>

## 前置条件

### A) 域名

安装过程中，系统会要求你将通配符 DNS 条目指向 CapRover IP 地址。每年最低只需 2 美元（或[更低](https://www.reddit.com/r/selfhosted/comments/sp8etq/comment/hwdgztx/?utm_source=reddit&utm_medium=web2x&context=3)）！

请注意，即使没有域名也可以使用 CapRover。但你将无法设置 HTTPS。

### B) 服务器

#### B1) 公网 IP

_补充说明：你可以在位于 NAT（你的路由器）之后的私有网络中的笔记本电脑上[本地安装 CapRover](run-locally.md)。但如果你希望启用 HTTPS 和/或从私有网络外访问应用，则需要进行一些特殊设置，例如端口转发。_

标准安装要求将 CapRover 安装在具有公网 IP 地址的机器上。如果需要公网 IP 的帮助，请参阅[服务器和公网 IP 地址](server-purchase/digitalocean.md)。每月最低只需 5 美元。如果使用 DigitalOcean 推荐码，还可获得 100 美元额度，相当于两个月的免费服务器：https://m.do.co/c/6410aa23d3f3

#### B2) 服务器规格

_**CPU 架构**：_ 已发布的 CapRover 镜像面向 AMD64 (x86-64) 和 ARM64。32 位 ARMv7 镜像已不再发布。

_**推荐配置**：_ CapRover 已在 Ubuntu 24.04 和 Docker 25+ 上测试。如果在其他操作系统上使用 CapRover，可以参考 [Docker 文档](https://docs.docker.com/engine/userguide/storagedriver/selectadriver/#supported-storage-drivers-per-linux-distribution)。

_**最低内存**：_ 请注意，构建过程有时会消耗过多内存，512MB 内存可能不够（请参阅[此 issue](https://github.com/caprover/caprover/issues/28)）。包括 DigitalOcean、Vultr、Scaleway、Linode、SSD Nodes 等在内的大多数服务商，都为 5 美元实例提供至少 1GB 内存。

#### B3) Docker

服务器上必须安装 Docker。如果服务器来自 DigitalOcean，可以选择带 CapRover 一键应用的服务器，系统会自动为你完成全部安装。否则，可以按照[此说明](https://docs.docker.com/engine/installation)安装 Docker CE。请注意，Docker 版本至少需要 25.x+。

**避免使用 snap 安装**：[通过 snap 安装 Docker 存在问题](https://github.com/caprover/caprover/issues/501#issuecomment-554764942)。请使用 Docker 官方安装说明。

#### B4) 配置防火墙

某些服务器服务商的防火墙设置较为严格。对于单节点 Ubuntu 服务器，请放行 CapRover 公共端口：

```bash
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 443/udp
ufw allow 3000/tcp
```

有关多节点 Swarm 端口和 registry 访问，请参阅[防火墙设置](firewall.md)。

<br/>
<br/>

# CapRover 设置

## 第 1 步：安装 CapRover

只需运行下面这一行，然后稍作等待即可！

```bash
docker run -p 80:80 -p 443:443 -p 3000:3000 -e ACCEPTED_TERMS=true -v /var/run/docker.sock:/var/run/docker.sock -v /captain:/captain caprover/caprover
```

上面的命令使用推荐的默认端口。高级安装可以设置 `CAPTAIN_HOST_HTTP_PORT`、`CAPTAIN_HOST_HTTPS_PORT` 和 `CAPTAIN_HOST_ADMIN_PORT`，使发布端口与每个 `-p` 映射的主机端一致。请保持容器端口为 `80`、`443` 和 `3000`。

屏幕上会显示一系列输出。CapRover 初始化完成后，在浏览器中访问 `http://[IP_OF_YOUR_SERVER]:3000`，并使用默认密码 `captain42` 登录 CapRover。之后可以修改密码。**不过，不要在控制面板中进行任何更改**。我们将使用命令行工具设置服务器（这是推荐方式）。

## 第 2 步：连接根域名

假设你拥有 `mydomain.com`。可以在 DNS 设置中将 `*.something.mydomain.com` 设置为 `A-record`，使其指向安装 CapRover 的服务器 IP 地址。请注意，此更改可能需要数小时才能生效。DNS 配置看起来应如下：

- **TYPE**：A record
- **HOST**：`*.something`
- **POINTS TO**：（服务器的 IP 地址）
- **TTL**：（实际无关紧要）

前往 [mxtoolbox DNS Lookup](https://mxtoolbox.com/DNSLookup.aspx)，输入 `randomthing123.something.mydomain.com`，检查 IP 地址是否解析为你在 DNS 中设置的 IP。请注意，需要使用 `randomthing123`，因为你在 DNS 中将 `*.something` 设置为通配符主机名，而不是 `something`。

> **注意**：CapRover 要求 A Record 指向 CapRover 的 IP 地址。如果使用 Cloudflare 等代理服务，可能会遇到困难。CapRover 不正式支持此类使用场景。

## 第 3 步：配置并初始化 CapRover

### 使用 CLI（推荐）

假设本地机器（例如笔记本电脑）已安装 npm，只需运行以下命令（如有需要请添加 `sudo`）：

```bash
 npm install -g caprover
```

然后运行：

```bash
 caprover serversetup
```

按照步骤登录 CapRover 实例。当提示输入根域名时，假设你已在第 2 步将 `*.something.mydomain.com` 指向 IP 地址，此处请输入 `something.mydomain.com`。现在可以通过 `captain.something.mydomain.com` 访问 CapRover。有关隐藏根域名的更多信息，请参阅[这里](./best-practices.md#隐藏根域名)。

> **注意**：如果你已经在 CapRover 实例上强制启用 HTTPS，则**无法继续执行 `caprover serversetup`**。
> 此时应直接使用 `caprover login` 命令登录。要修改密码，请前往应用中的设置菜单。

### 使用 Web 界面（不需要 npm）

1. 登录 `http://[IP_OF_YOUR_SERVER]:3000`
2. 配置根域名
3. 启用 HTTPS，然后强制使用 HTTPS
4. 通过 HTTPS 连接后，修改默认密码（`captain42`）

## 第 4 步：（可选）设置 Swap 文件

某些情况下，物理内存不足可能会导致问题。
例如，构建 Docker 镜像时，如果内存占用开始过高，构建将会失败。
要解决这些问题（无需购买更多内存），可以按照[如何创建 Linux Swap 文件](https://linuxize.com/post/create-a-linux-swap-file/)中的说明设置 Swap 文件（将其用作虚拟内存）。

## 第 5 步：部署测试应用

在浏览器中打开 CapRover，从左侧菜单选择 Apps 并创建一个新应用。将其命名为 `my-first-app`。然后从<a href="https://github.com/caprover/caprover/tree/master/captain-sample-apps">这里</a>下载任意测试应用，解压内容。在测试应用目录中运行：

```bash
/home/Desktop/captain-examples/captain-node$  caprover deploy
```

按照提示操作，在询问应用名称时输入 `my-first-app`。首次构建大约需要两分钟。构建完成后，访问 `my-first-app.something.mydomain.com`，其中 `something.mydomain.com` 是你的根域名。
恭喜！你的应用已上线！

你可以将多个自定义域名（例如 `www.my-app.com`）连接到一个应用，启用 HTTPS，并在应用设置页面中执行更多操作。

请注意，运行 `caprover deploy` 时，当前 Git commit 会发送到服务器。

> **重要**：未提交的文件以及 `gitignore` 中的文件**不会**发送到服务器。

你可以在浏览器中访问 CapRover，为应用设置环境变量等自定义参数，并执行更多操作！有关部署的更多详情，请参阅 [CLI 文档](cli-commands.md)。有关 `captain-definition` 文件的详情，请参阅 [Captain Definition File](captain-definition-file.md)。
