---
id: troubleshooting
title: 故障排除
sidebar_label: 故障排除
---

<br/>

本节涵盖用户可能遇到的大多数常见问题。

## 无法连接到 `ip_server`:3000？

造成这种情况的原因有很多。

#### 第一）

你需要确保 CapRover 正在服务器上运行。要检查这一点，请 SSH 到服务器并运行

```bash
docker service ps captain-captain --no-trunc
```

你可能会看到 Captain 因错误而不断重启。修复问题后重试。例如，可以参考 [创建 vxlan interface 时出错](https://github.com/caprover/caprover/issues/14#issuecomment-345447689) 或 [创建 mount source path 时出错](https://github.com/caprover/caprover/issues/352)。例如，Linode 有许多问题，例如 [subnet sandbox join failed](https://github.com/docker/machine/issues/2753#issuecomment-171822791) 和 [vxlan interface](https://github.com/docker/machine/issues/2753#issuecomment-188353704)。在 [CapRover Github issues](https://github.com/caprover/caprover/issues) 中搜索你的问题；如果找不到解决方案，请在 Github 上创建一个新 issue。

#### 第二）

如果运行 `docker service ps captain-captain --no-trunc` 时没有看到任何错误，请尝试

```bash
docker service logs captain-captain --since 60m

## you should also get the logs from nginx

docker service logs captain-nginx --since 60m
```

你可能会看到 CapRover 因错误而不断重启。在 [CapRover Github issues](https://github.com/caprover/caprover/issues) 中搜索你的问题；如果找不到解决方案，请在 Github 上创建一个新 issue。

#### 第三）

如果上面说明的“第一”和“第二”步调试都正常完成，并且日志中没有错误，请在服务器上运行：

```bash
 curl localhost:3000 -v
```

如果成功，很可能是防火墙阻止了连接。请参见 [Firewall Docs](firewall.md)。

## 部署成功但出现 502 bad gateway 错误！

以下情况适用于你：

- 你已经完成服务器设置，并能通过 `captain.rootdomain.example.com` 访问它。
- 你已经成功部署了某个 sample app（参见[这里](https://github.com/caprover/caprover/tree/master/captain-sample-apps)），并且它可以正常工作。
- 你尝试部署自己的应用，部署成功，但通过 `yourappname.root.example.com` 访问时收到 502 错误。

如果以上各点都符合，排查方法如下：

- SSH 到服务器并查看应用日志。确保应用没有崩溃且正在运行。查看日志的方法请参见本页末尾的 “[如何查看应用日志](#如何查看应用日志)” 部分。
- 如果应用日志显示应用正在运行，最常见的情况是应用绑定了自定义端口，而不是端口 80。例如，CouchDB 运行在端口 5984。此时进入 CapRover 中应用的设置，进入 HTTP Settings，然后将 “Container Port” 选择为 5984。
- 如果应用将绑定 IP address 定义为 127.0.0.1，请将其改为 `0.0.0.0`；详情参见[此 issue](https://github.com/caprover/caprover/issues/76#issuecomment-481053496)。

## 域名验证失败 - 错误 1107！

当 CapRover 无法验证 yourcustomdomain.com 指向 CapRover 的 IP address 时，就会发生此问题。可能有以下几个原因：

- DNS 更改最多需要 24 小时才能传播，尤其是服务器之前缓存过这些更改时。因此请等待 24 小时后重试。如果仍然无效，继续下一步：
- 要确认这一点，请前往 https://mxtoolbox.com/DNSLookup.aspx 并输入 `yourcustomdomain.com`。确保它指向服务器 IP。如果你使用了 CloudFlare 等 proxy service，可能会造成问题。请在 CloudFlare 的 DNS 中禁用 proxy，并让 A record 直接指向 CapRover server 的 IP address。
- 如果你已经测试了以上所有内容，并且访问 `something.domain.com` 时能看到 CapRover 页面，那么可以确定 domain 工作正常，但 CapRover 无法验证它，因为 loopback test 无法工作。此时可以跳过 CapRover 执行的 domain verification：

```
echo  "{\"skipVerifyingDomains\":\"true\"}" >  /captain/data/config-override.json
docker service update captain-captain --force
```

- 如果以上方法都无效，请在 Github 上提交 issue。
- **AWS EC2 Users** - 检查 VPC 的 CIDR Block 是否大于 172.0.0.0/16（不是常见的 0.0.0.0/16）。

## 连接超时

有时，当 database connection pool 处于非活动状态时，Docker 会在一段时间后断开连接。要修复此问题，可以采取以下任一种方式：

- 实现自动重试策略
- 每隔几分钟自动 ping 一次，确保连接不会变为非活动状态
- 修改应用中的 Keepalive config（以 knex 为例，请参见[这里](https://github.com/caprover/caprover/issues/873#issuecomment-715328966)）
- 修改 Docker configs（更高级）

[根本原因](https://github.com/moby/moby/issues/31208) 与 CapRover 无关，而是底层 Docker issue。

## 发生了某些问题

当 UI 中出现此错误时，表示发生了某些“意外”问题，例如连接丢失、服务器崩溃（由于内存不足）等。查看发生了什么的最佳方式是获取服务器日志：

```
docker service logs captain-captain --since 5m --follow
```

## 如何查看应用日志？

你的应用作为 Docker service 部署。例如，如果你的 app name 在 captain 中是 `my-app`，可以通过 SSH 连接服务器并运行以下命令查看日志：

```
docker service logs my-app --since 60m --follow
```

使用 `docker service ls` 确认 physical service name。新应用使用 app name；从 1.15 之前的 CapRover 版本升级的应用可能仍然使用 `srv-captain--my-app` 形式。将 `60m` 替换为 `10m`，即可查看最近 10 分钟的日志。

## 如何重启应用？

如果应用运行不正常，可以在 web dashboard 中选择应用，然后点击 “Save Configuration & Update” 按钮，尝试强制重启应用。

## 如何在应用内运行 shell（在 container 内）

只需运行以下命令：

```
docker exec -it "$(docker ps --filter label=com.docker.swarm.service.name=myappname -q | head -n1)" /bin/sh
```

在运行该 task 的 node 上执行此命令，并使用 `docker service ls` 报告的 physical service name。

当然，需要将 `myappname` 替换为你自己的 app name。

## 我修改 Nginx config 后破坏了 admin UI！

这种情况下，重启无法解决问题。[请执行此操作](https://github.com/caprover/caprover/issues/412#issuecomment-484077130)：

运行 nginx fixer，恢复**所有你手动进行的 nginx 更改**：

```bash
docker service scale captain-captain=0 && \
docker run -it --rm -v /captain:/captain  caprover/caprover /bin/sh -c "wget https://raw.githubusercontent.com/caprover/caprover/master/dev-scripts/clear-custom-nginx.js ; node clear-custom-nginx.js ;" && \
docker service scale captain-captain=1 && \
echo "OKAY"

```

希望这样就能解决你的问题。

## 如何重启 CapRover

如果 CapRover 运行不正常，可以使用以下命令强制重启 CapRover：

```
docker service update captain-captain --force
```

## 如何使用 Edge 版本

Edge version 会在 master 上每次 push 时自动构建。如果你的版本存在一个刚刚在 master branch 修复的 bug，可以暂时将 CapRover 更新为 Edge version。注意，切换到 edge 后，你将不会收到更新。CapRover 发布下一版本后，你必须手动切换回 CapRover。还要注意，这是高级操作。一般来说，切换到 Edge 后，在新版本发布前不要切回 regular version。

切换到 edge：

```
docker pull caprover/caprover-edge:latest
docker service update captain-captain --image caprover/caprover-edge:latest
```

切回 main image：

```
docker service update captain-captain --image caprover/caprover:latest
```

## 自定义配置项

你可以通过在 `/captain/data/config-override.json` 添加 JSON file，自定义 [CaptainConstants](https://github.com/caprover/caprover/blob/master/src/utils/CaptainConstants.ts) 中 configs 下定义的任意常量。例如，要修改 `defaultMaxLogSize`，`/captain/data/config-override.json` 的内容应为：

```
{
 "defaultMaxLogSize":"128m"
}
```

编辑此文件后，如果更改影响 CapRover、nginx 或 certbot，请[重启 CapRover](https://caprover.com/docs/troubleshooting.html#how-to-restart-caprover)；否则，在 UI 中关闭再重新打开 NetData。

## 使用现有 swarm

首次安装 CapRover 时，它会尝试自动为你设置 swarm cluster。但在少数情况下，你可能已经有一个 swarm cluster，并希望使用该 cluster。此时，只需将 `useExistingSwarm` 设置为 true 覆盖默认行为。在尝试安装 CapRover 之前运行以下 script。

```
mkdir -p  /captain/data
echo  "{\"useExistingSwarm\":\"true\"}" >  /captain/data/config-override.json
```

## AWS 设置

AWS 对端口处理等方面有自己的定制方式，可能需要进行一些自定义设置，例如请参见[这篇 blog post](https://fuzzyblog.io/blog/caprover/2019/11/10/using-caprover-on-aws.html)。

## CloudFlare SSL 设置

使用 CloudFlare free plan 时，请注意其 [Universal SSL 只支持一级子域名以内的 SSL](https://developers.cloudflare.com/ssl/edge-certificates/universal-ssl/limitations/#full-setup)。因此，如果启用 CloudFlare 的 Universal SSL，并将一级 subdomain 设置为 CapRover 的 root domain，访问 CapRover 部署的 apps 时会出现以下错误：

```
This site can’t provide a secure connection
app.root.example.com uses an unsupported protocol.
ERR_SSL_VERSION_OR_CIPHER_MISMATCH
```

如果想将 CapRover 与 CloudFlare 的 Universal SSL 结合使用，请避免将 subdomain 用作 root domain。

## ARM 处理器

从 1.8.1 版本开始，CapRover 支持 arm processor，例如 “raspberry pi” 等。注意，一些 one click apps 可能无法在 rasberry pi 上运行。One click apps 是并非由 CapRover 维护的 external apps。

## 重置密码

如果忘记密码，但可以通过 SSH 访问服务器：

- SSH 到服务器
- 运行 `jq -V`，确保已安装 jq
- 运行

```bash
docker service scale captain-captain=0

# backup config
cp /captain/data/config-captain.json /captain/data/config-captain.json.backup

# delete old password
jq 'del(.hashedPassword)' /captain/data/config-captain.json > /captain/data/config-captain.json.new
cat /captain/data/config-captain.json.new > /captain/data/config-captain.json
rm /captain/data/config-captain.json.new

# set a temporary password
docker service update --env-add DEFAULT_PASSWORD=mytemppassword captain-captain
docker service scale captain-captain=1
```

- 使用临时密码登录 CapRover，然后在 settings 中修改密码。

## 如何停止并移除 Captain？

CapRover 使用 docker swarm 来支持集群，并在容器停止时重启容器。要从系统中彻底卸载 CapRover，请运行：

```
docker service rm $(docker service ls -q)
## remove CapRover settings directory
rm -rf /captain
## leave swarm if you don't want it
docker swarm leave --force
## full cleanup of docker
docker system prune --all --force
```

## 我收到 Let's Encrypt 发来的邮件，说我的 domain 的 SSL certificate 即将过期，但它不应该过期。

如果你曾在之前的 project 中使用过相同的 domain name，后来又删除了该 project，就可能发生这种情况。
Let's Encrypt 会记录旧 certificate，并在它即将过期时通知你，但这不会影响新 certificate。
要确认这一点，只需使用以下在线工具检查 SSL expiry date：
https://www.sslshopper.com/ssl-checker.html#hostname=captain.server.demo.caprover.com
