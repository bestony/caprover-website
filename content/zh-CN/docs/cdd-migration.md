---
id: cdd-migration
title: CaptainDuckDuck 升级
sidebar_label: CaptainDuckDuck 升级
---

注意：本节仅适用于你想把 CaptainDuckDuck 服务器升级到 CapRover 的情况。

### 迁移脚本

只需运行 [this script](https://raw.githubusercontent.com/caprover/caprover/master/dev-scripts/migrate-from-cdd.sh)，即可将 CaptainDuckDuck 服务器升级到 CapRover。它会自动备份你的 config directory `/captain`，以防出现问题。


要迁移，可以直接运行以下几行：

```bash
wget https://raw.githubusercontent.com/caprover/caprover/master/dev-scripts/migrate-from-cdd.sh

chmod +x migrate-from-cdd.sh

./migrate-from-cdd.sh
```


### 迁移提示：

确保你有足够的磁盘空间。CapRover image 大约 400MB，并且脚本会自动备份 config directory。

#### 没有 Self-hosted Registry
如果你的服务器上有大约 1.5GB 可用空间，基本上就没问题。

#### 有 Self-hosted Registry
Self-hosted Registry 可能消耗很多 GB 的磁盘空间。由于 Migration Script 会自动为你的 config directory 创建备份，升级期间你可能会遇到问题。

为了节省空间，如果你启用了 Self-hosted Registry，有两个选择：
- 你可以手动编辑 migration script，并删除 backup line（`tar -cvf /captain-bk-$(date +%Y_%m_%d_%H_%M_%S).tar /captain`），
- 或者，可以运行 `rm -rf /captain/registry/*` 删除 registry 的所有内容，因为它会占用大量磁盘空间。注意，如果你执行此操作，必须重新部署你的 apps，其他节点才能访问它。如果你只有一个节点，则不需要额外操作。


### 从 CaptainDuckDuck 到 CapRover 的 Breaking Changes：
- captain-definition file 的 `schemaVersion` 已更改为 `2`。
- 如果你以前必须为某个特定 app 把 custom port 改成 80 以外的端口，现在不再需要编辑 NGINX config，你可以直接从 UI 将 container port 设置为任意端口。
- 如果你以前使用自定义 dockerfileLines，则已为所有 `ADD` 和 `COPY` 语句添加 `./src` 前缀。CapRover 不再需要这样。例如，你以前有
```bash
COPY ./src/package.json /usr/app/
```

使用 CapRover 时应改为

```bash
COPY ./package.json /usr/app/
```
