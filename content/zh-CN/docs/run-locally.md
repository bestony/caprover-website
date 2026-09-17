---
id: run-locally
title: 本地运行
sidebar_label: 本地运行
---

<br/>
请注意，这是一个**高级过程**。本节使用的一些概念对初学者来说并不容易。要在本地机器上运行 CapRover（仅用于测试和开发），机器上必须安装 Docker。

<br/>

> 注意：如果你更喜欢视频教程，请参阅社区制作的 YouTube 教程：https://www.youtube.com/watch?v=J_6H11DrzXY

对于根域名，CapRover 默认使用 `http://captain.captain.localhost`。在大多数系统中，`captain.captain.localhost` 会自动解析到本机的本地 IP 地址，即 127.0.0.1，因此无需额外操作。

> 但是，如果它没有自动完成解析，则需要手动将 `*.captain.localhost` 指向 `127.0.0.1` 或 `192.168.1.2`（你的本地 IP）。**注意**，`etc/hosts` 不够用，因为 Captain 需要通配符条目，而 `etc/hosts` 不允许使用通配符，即 `*.something`。在 Ubuntu 16 中，`dnsmasq`（本地 DNS 服务器）是内置的。因此，只需编辑文件 `/etc/NetworkManager/dnsmasq.d/dnsmasq-localhost.conf`（如果不存在则创建），并在其中添加这一行：`address=/captain.localhost/192.168.1.2`，其中 `192.168.1.2` 是你的本地 IP 地址。要确认是否有 `dnsmasq`，可以在终端运行 `which dnsmasq`。如果可用，终端会打印其路径；否则终端不会打印任何内容。
> 注意：对于 Ubuntu 18，请阅读 https://askubuntu.com/questions/1029882/how-can-i-set-up-local-wildcard-127-0-0-1-domain-resolution-on-18-04

要验证上面提到的两个前置条件是否都满足：

- 运行 `docker version`，确保版本至少达到[文档](get-started#b3-docker)中提到的版本
- 运行 `nslookup randomstring123.captain.localhost`，确保它解析到 `127.0.0.1` 或你的本地 IP（类似 `192.168.1.2`）：

```
Server:		127.0.1.1
Address:	127.0.1.1#53

Name:	randomstring123.captain.localhost
Address: 192.168.1.2
```

## 安装

确认前置条件已经准备好后，就可以像在服务器上一样在本地机器上安装 Captain。请确保使用具有足够权限的用户运行，即在基于 Linux 的系统上使用 `sudo`。按照这里列出的步骤操作：[Captain 安装](get-started#第-1-步安装-caprover)，但需要注意下面提到的几个差异。

### 差异：

#### 主 IP

首先，本地安装命令需要额外的参数（`MAIN_NODE_IP_ADDRESS`）

```bash
echo  "{\"skipVerifyingDomains\":\"true\"}" >  /captain/data/config-override.json
docker run -e ACCEPTED_TERMS=true -e MAIN_NODE_IP_ADDRESS=127.0.0.1 -p 80:80 -p 443:443 -p 3000:3000 -v /var/run/docker.sock:/var/run/docker.sock -v /captain:/captain caprover/caprover
```
**注意：**如果当前 80 和 443 端口已被占用，并且你希望在反向代理后运行 CapRover，[请参阅这里](https://github.com/caprover/caprover/issues/1166#issuecomment-2430704491)。

#### 设置

不要运行 `caprover serversetup`。请改为访问 [http://captain.captain.localhost:3000](http://captain.captain.localhost:3000)，并手动将根域名设置为 `captain.localhost`。不要启用或强制使用 HTTPS。显然，无法在本地域名（captain.localhost）上启用 HTTPS。

将根域名设置为 `captain.localhost` 后，使用 `caprover login`，并将 `http://captain.captain.localhost` 作为 captain URL，将 `captain42` 作为默认密码输入。

> 但是，如果希望从 LAN 上的其他设备访问 CapRover 实例，可以将根域名设置为 `captain.LOCAL_IP.sslip.io`（例如 `captain.192.168.1.2.sslip.io`）。

**非 Linux 用户**
你需要将 `/captain` 添加到共享路径。
操作方法：点击 Docker 图标 -> Setting -> File Sharing，然后添加 `/captain`

现在已经设置完成！

## 在私有[本地]网络中安装 CapRover

当你想在家庭网络中安装 CapRover（例如安装在 Raspberry pi 上）时，这很有用。

假设你的网络如下：

```
┌───────────────────────┐
│    Your Router        │
│                       │
│     public IP         │
│    11.22.33.44        │           your private network
├───────────────────────┴─────────────────────────────────────────────────────────────────────┐
│                                                                                             │
│ ┌────────────────┐      ┌──────────────────┐        ┌──────────────────┐                    │
│ │                │      │                  │        │                  │                    │
│ │    PC1         │      │     PC2          │        │       PC3        │                    │
│ │                │      │                  │        │                  │                    │
│ │  192.168.1.10  │      │    192.168.1.11  │        │    192.168.1.12  │                    │
│ │                │      │                  │        │                  │                    │
│ └────────────────┘      └──────────────────┘        └──────────────────┘                    │
│                                                                                             │
│                                                                                             │
│                                                                                             │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

只需运行以下命令，即可在 PC3 上安装 CapRover：

```bash
echo  "{\"skipVerifyingDomains\":\"true\"}" >  /captain/data/config-override.json
docker run -e ACCEPTED_TERMS=true -e MAIN_NODE_IP_ADDRESS=192.168.1.12 -p 80:80 -p 443:443 -p 3000:3000 -v /var/run/docker.sock:/var/run/docker.sock -v /captain:/captain caprover/caprover
```

唯一额外的部分是：` -e MAIN_NODE_IP_ADDRESS=192.168.1.12`，以及在 CapRover 中禁用域名验证。

此时，你应该可以在浏览器中通过 `http://192.168.1.12:3000` 从 PC1 和 PC2 访问 CapRover 控制面板。

此时仍然无法部署应用，但控制面板应该可以访问。
如果控制面板无法访问，说明内部防火墙阻止了 PC1 访问 PC3。

如果控制面板可以访问，请继续后面的步骤。

### 选项 1 - 仅供内部使用：

可以在内部网络中安装 CapRover，使其只能从私有网络访问。为此，需要在本地 DNS 服务器中将 `*.caproverinstance.local` 或类似域名指向 `192.168.1.12`。如果没有本地 DNS 服务器，则无法完成此操作。

某些本地 DNS 服务器（如 PiHole）不允许在本地 DNS 条目中使用通配符，这种情况下必须添加 `captain.caproverinstance.local` 并将其指向该 IP。之后还需要逐一添加应用名称。虽然繁琐，但可以完成。

现在，通过 `http://192.168.1.12:3000` 访问控制面板，并将根域名更新为 `caproverinstance.local`。

此时，应该可以在浏览器中通过 `http://captain.caproverinstance.local` 访问控制面板。
如果这里遇到问题，说明本地 DNS 服务器未按预期工作，需要修复它。

请注意，不应（也无法）为内部域名启用 HTTPS。

### 选项 2 - 让实例可从外部访问

要求：公网 IP 地址必须是静态 IP 地址。

这与在公开可用的 VPS 上安装 CapRover 非常相似。只需在路由器上启用端口转发：

```
port 80 of router => port 80 of 192.168.1.12
port 443 of router => port 80 of 192.168.1.12
```

现在使用常规 DNS 服务商，将 `*.domain.com` 映射到网络的公网 IP 地址。

然后像普通安装一样，登录 `http://192.168.1.12:3000`，并将根域名更新为 `domain.com`

此时，可以通过 `http://captain.domain.com` 访问实例。你可以启用 HTTPS 并部署应用。

## 故障排查：

如上所述，在本地机器上运行是一个高级任务，可能因不同原因失败；具体解决方案取决于错误类型。例如，如果出现以下错误：

```
Captain Starting ...
Installing Captain Service ...
December 18th 2017, 11:51:11.295 pm    Starting swarm at 34.232.18.13:2377
Installation failed.
{ Error: (HTTP code 400) bad parameter - must specify a listening address because the address to advertise is not recognized as a system address, and a system's IP address to use could not be uniquely identified
    at /usr/src/app/node_modules/docker-modem/lib/modem.js:254:17
    at process._tickCallback (internal/process/next_tick.js:180:9)
  reason: 'bad parameter',
  statusCode: 400,
  json:
   { message: 'must specify a listening address because the address to advertise is not recognized as a system address, and a system\'s IP address to use could not be uniquely identified' } }
```

可以尝试：

```bash
docker run -e ACCEPTED_TERMS=true -e "MAIN_NODE_IP_ADDRESS=192.168.1.2" -v /var/run/docker.sock:/var/run/docker.sock caprover/caprover
```

并将 `192.168.1.2` 替换为你自己的本地 IP。
