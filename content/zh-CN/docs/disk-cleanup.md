---
id: disk-cleanup
title: 磁盘清理
sidebar_label: 磁盘清理
---

<br/>

Docker 会以不同方式使用磁盘：

## Docker 镜像
保存你的 images：images 是压缩文件，包含你部署到服务器上的已构建源代码。每次部署新版代码时，Docker 都会为新版本构建一个新的 image，并默认保留旧 image。如果你想清理服务器上所有“未使用”的 images，运行
```
docker container prune --force
docker image prune --all
```

重要提示：仅当你已经设置 Docker registry（本地或远程）时才使用这种方式。这是因为 Docker 中存在一个 bug，关于问题详情请见 [这里](https://github.com/caprover/caprover/issues/180)，以及相关的 [Docker Issue](https://github.com/moby/moby/issues/36295)

## Docker 卷
Volumes，也就是“Persistent Directories”。当你创建带有持久化数据的应用（例如数据库）时，会为它分配一个 persistent directory。当你修改 persistent directory，或删除应用后，这些 volumes 就不再需要了。清理孤立 volumes 比较麻烦。如果某个应用有一个有用的 volume，但该应用“当前”正在崩溃且未运行，Docker 会把这个 volume 视为“孤立” :( 因此，要安全清理孤立 volumes，先通过下面的命令检查所有 services 是否都在运行：
```
docker service ls
```
在 REPLICAS 下，你应该看到 `1/1`、`2/2` 等。如果看到某个 service 没有运行，不要继续！否则，可以继续清理孤立 volumes：
```
docker volume prune
```

另外，你也可以先列出所有 volumes，然后只删除不需要的那些：
```
docker volume ls                          # lists all volumes
docker volume rm volume-name-goes-here    # removes a specific volume
```
