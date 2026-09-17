---
id: firewall
title: 防火墙和端口转发
sidebar_label: 防火墙和端口转发
---

## 公共端口

向用户开放这些端口：

- `80/tcp` 用于 HTTP
- `443/tcp` 用于 HTTPS
- `443/udp` 用于 HTTP/3
- `3000/tcp` 用于初始设置。CapRover 绑定到域名后可以关闭它。

对于使用 UFW 的单节点 Ubuntu 服务器：

```bash
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 443/udp
ufw allow 3000/tcp
```

端口 `996/tcp` 由 CapRover 的 Docker registry 使用。仅当外部客户端必须连接到 self-hosted registry 时才开放它。

## 集群端口

在多节点集群中，只允许受信任的 Swarm 节点之间使用以下端口：

- `2377/tcp` 用于 Swarm 管理流量
- `7946/tcp` 和 `7946/udp` 用于节点通信
- `4789/udp` 用于 overlay network 流量

将 `4789/udp` 限制为仅受信任节点可访问。公开暴露 VXLAN 端口可能使 overlay network 变得脆弱。

如果你为某个应用添加了端口映射，请按需在你的 provider firewall 中允许该应用端口。Docker 发布的端口可能绕过 UFW 规则，因此当必须限制访问时，请配置 Docker-aware firewall 规则。参见 Docker 关于 [packet filtering and firewalls](https://docs.docker.com/engine/network/packet-filtering-firewalls/) 的文档。
