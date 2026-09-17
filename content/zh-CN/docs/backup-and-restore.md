---
id: backup-and-restore
title: 备份和恢复
sidebar_label: 备份和恢复
---

### 备份和恢复

_此功能在 v1.3.0 中加入。_

_备份/恢复功能仍处于实验阶段。未来还会有更多改动。_

备份/恢复是一个复杂的过程，需要理解 CapRover 实例中不同组件的工作方式。如果你计划使用此功能，请务必仔细阅读本文档，并在真正用于生产环境前使用测试服务器练习并熟悉整个过程。

**总结；** 普通备份/恢复适用于除 images 和 volumes 之外的所有内容。对于 images，你必须使用 Docker Registry（有优点也有缺点）；对于 volumes，你必须使用自定义方案（同样有优点也有缺点）。

### 备份过程

在正在运行的 CapRover 实例中打开 web dashboard，进入 settings 页面，然后点击 “Create Backup” 按钮。几秒钟后会开始下载。请保留 tar file，恢复 CapRover 实例时会用到它。

#### 自动化备份过程

你可以创建一个简单的 bash script 来自动备份：

```bash
    API_TOKEN=$(curl $CAPROVER_URL/api/v2/login \
        -H 'x-namespace: captain' \
        -H 'content-type: application/json;charset=UTF-8' \
        --data-raw "{\"password\":\"$CAPROVER_PASSWORD\"}" \
        --compressed --silent | jq -r ".data.token")

    DOWNLOAD_TOKEN=$(curl $CAPROVER_URL/api/v2/user/system/createbackup \
        -H "x-captain-auth: $API_TOKEN" \
        -H 'x-namespace: captain' \
        --data-raw '{"postDownloadFileName":"backup.tar"}' \
        --compressed --silent | jq -r ".data.downloadToken")

    if [ ${#DOWNLOAD_TOKEN} -le 10 ]; then
        echo "DOWNLOAD_TOKEN must be at least 10 char long"
        exit 1
    fi

    wget "$CAPROVER_URL/api/v2/downloads/?namespace=captain&downloadToken=$DOWNLOAD_TOKEN" -O backup.tar
```

### 恢复过程

这个过程与全新安装 CapRover 非常相似，但有几处不同。按照 [Get Started](get-started.md) 中的 Prerequisites 步骤操作，并确保服务器上已安装 Docker。

_不要_ 运行安装命令 `docker run -p 80:80 -p 443:443.....`。请改为执行以下步骤：

_（将以下说明中的 123.123.123.123 替换为你的服务器 IP）_

1. 在服务器上创建空的 `/captain` directory，运行 <br/> `ssh root@123.123.123.123 mkdir /captain`
2. 在 desktop 上将所需的 backup file 重命名为 `backup.tar`。
3. 将 `backup.tar` 复制到服务器：<br/> `scp ./backup.tar root@123.123.123.123:/captain/`
4. 安装 CapRover：

```bash
docker run -p 80:80 -p 443:443 -p 3000:3000 -e ACCEPTED_TERMS=true -v /var/run/docker.sock:/var/run/docker.sock -v /captain:/captain caprover/caprover
```

CapRover 会自动检测 `backup.tar`，将其解压，并恢复你的所有 configs 和 settings。

5. 你需要配置 DNS，使 `*.youroldroot.domain.com` 指向新服务器 IP。

### 保留旧服务器

有时旧服务器仍在运行，而你只是想创建一个服务器副本。既然你希望旧服务器继续运行，就不应修改旧 domain 的 DNS。相反，你需要分配一个新的 domain。在这种情况下：

1. 在 DNS 中创建一个新的 wildcard entry `*.yournewroot.domain.com`，并将其指向新服务器
2. 在 desktop machine 上，在 `etc/hosts` 文件中创建一个临时 entry，并添加以下行

```
NEW-SERVER-IP-ADDRESS   captain.oldroot.domain.com
```

注意，hosts file 中不能使用 wildcard；只需添加 dashboard 的 domain，以便临时访问它。

3. 在浏览器中访问 `captain.oldroot.domain.com` 并登录 dashboard。

注意，你可能会看到 SSL error，可以点击 advance 并忽略。这没问题，因为你的 SSL certification 可能已经过期。设置完成并重启 CapRover 后，它会续期。

4. 登录 dashboard 后，在 dashboard 中将 root domain 更改为 `yournewroot.domain.com`。

5. 如果需要，为 dashboard 和其他 apps 重新启用 SSL certifications 和 Force HTTPS。

6. 编辑 `etc/hosts`，删除你在第 2 步添加的行。

### 哪些内容会被恢复？

CapRover 备份过程会备份 `/captain/data/` directory 中的所有内容，包括 app settings、configurations、SSL certificates 等。不包括的内容是：**Container Images** 和 **Persistent Directories**。

1. **Container Images：** 恢复 CapRover 实例后，你会发现 app configurations 已设置好，但所有 apps 都恢复为默认状态 “Your App Will Be Here!”。你确实需要重新部署所有 apps。这种方式的优点是 `backup.tar` file 非常小且易于管理。当然，缺点是必须为所有 apps 执行重新部署。如果你确实想把 images 保存到 backup 中，需要使用 [Docker Registry](#docker-registry-说明)。
2. **Persistent Directories：** 一些 apps（例如 databases）有 persistent directory。由于每种 database 都有自己的 backup mechanism，因此建议针对你的具体 database 使用正确的备份方式，例如 MongoDB 使用 `mongodump`，MySQL 使用 `mysqldump` 等。对于 databases，这是最佳方式，因为它不会导致 downtime。另一种方式是创建 volumes 的 snapshot。这种方式通用，基本适用于所有情况。例如，你可以使用这个 [3rd Party Project](https://github.com/loomchild/volume-backup)。不过，为避免 data corruption，运行该项目之前，需要确保 containers 已停止：`docker service ls --format {{.Name}} | while read in; do docker service scale "$in"=0; done`；然后创建 snapshot，最后恢复所有 services：`docker service ls --format {{.Name}} | while read in; do docker service scale "$in"=1; done`。不久的将来，CapRover 会提供类似的内置方案。
   其他可用于备份 persistent directories 的工具：

- https://github.com/futurice/docker-volume-backup
- https://github.com/loomchild/volume-backup
- https://github.com/blacklabelops/volumerize
- https://github.com/schickling/dockerfiles/tree/master/postgres-backup-s3
- https://github.com/schickling/dockerfiles/tree/master/mysql-backup-s3

<details>
  <summary>Docker Registry</summary>


### Docker Registry 说明

如上所述，container images 不属于 backup。要确保恢复过程后无需重新部署 apps，必须确保你正在使用 Docker Registry。Docker Registry 是一个用于存储 apps images 的位置。

#### 第三方 Registry

如果你在 CapRover dashboard 的 Cluster 区域设置了 “default push registry”，每个 image 在服务器上构建完成后都会被推送到 registry。这是最佳选项，因为 registry 是独立实体，你不需要负责维护 images。恢复 CapRover 实例后，一切都会正常运行！

#### 自托管 Registry

如果你将 “default push registry” 设置为 CapRover self-hosted registry，恢复过程后你的 app 将开箱即用。不过，缺点是你的 `backup.tar` 会非常大。这个 file 会包含服务器上构建的所有 images。

如果你之前设置过 self-hosted registry，但后来改变想法，禁用了 self-hosted registry，改用 3rd party registry，那么 backup files 仍然会很大，因为 files 仍存放在 host system 上。如果要清除 registry 中存储的所有 images，请删除 registry directory：`rm -rf /captain/data/registry`

</details>

<details>
  <summary>多节点设置</summary>


### 多节点

当你有一个 cluster 时会发生什么？备份和恢复过程与单节点基本相同，但在恢复期间，第一次运行会检测到你正在恢复 cluster，然后退出。系统会要求你编辑一个 file，并添加新 nodes 的 IP addresses。

例如，你之前有 2 个 nodes：

- 222.222.222.10（主节点）
- 222.222.222.11

恢复时，你准备了 2 个 nodes：

- 222.222.222.20（主节点）
- 222.222.222.21

你在 `222.222.222.20` 上运行恢复 script，script 会退出并要求你输入第二个 node 的信息。编辑恢复 instructions file，将 `222.222.222.21` 作为旧 IP `222.222.222.11` 对应的新 IP。

接下来，需要将 private key（通常名为 `id_rsa`）复制到服务器。例如，在 linux 上：

```bash
scp /home/myuser/.ssh/id_rsa root@123.123.123.123:/captain/
```

_恢复过程完成后，请务必从服务器删除此 file。_

现在重新运行恢复 script（就是之前退出并要求更多信息的那个）。这次过程会继续完成，nodes 会被恢复，apps 也会调整为迁移到新 nodes。例如，如果之前有一个 persistent app 被锁定在第二个 node 上，恢复后的实例中它也会被锁定在第二个 node 上。

cluster 的 volume 恢复稍微复杂一些。不过，如果你在使用 cluster，想必知道自己在做什么 :-)

</details>
