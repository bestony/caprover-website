---
id: stateless-with-persistent-data
title: 带持久化数据的无状态应用
sidebar_label: 带持久化数据的无状态应用
---


**开始前，请先阅读：**

* [持久化应用](persistent-apps.md)


本文档将帮助你设置一个带持久化数据的无状态应用。例如，使用“**php:7.4-apache**”托管网站，并从 AWS、Wasabi S3 或其他[由 rclone 支持的存储系统](https://rclone.org/overview/)提供“**uploads**”（`/var/www/html/uploads`）文件夹，或你定义的其他文件夹。这样一来，原本固定在节点 X 上的应用就可以在同一个 Docker Swarm 内故障转移到其他节点。

有多个 Docker volume 插件可以实现此设置。我 [@Daniël](https://caprover.slack.com/archives/DLR2Q4TC1) 和我的同事 Floris 最初使用“**rexray/s3fs**”，但后来改用“**sapk/plugin-rclone**”，因为它更稳定，并且能够更好地处理从节点 X 到节点 Y 的故障转移。

---

**重要提示：**以下步骤面向中级和高级（*linux*）用户。

---

#### 占位变量

* `$volumename` 例如可以是 `captain--yourappname-rclone`
* `$remotename` 例如可以是 `captain--yourappname`
* `$remotename/path` 例如可以是 `captain--yourappname/_data`
* `$rcloneremotename` 例如可以是 `wasabi-s3`

---

### 1) 准备 rclone

首先创建 `rclone.conf` 文件。可以在任何安装了 rclone 的（*本地*）计算机上完成。
为方便说明，本文假设你已在 Docker Swarm 的主节点上[安装 rclone](https://rclone.org/install/)。

在主节点上运行“**[rclone config](https://rclone.org/commands/rclone_config/)**”来创建配置文件，完成后运行 `rclone config file`，以确认配置文件的存储位置。
如果你使用的是“root”用户，文件会存储在 `/root/.config/rclone/rclone.conf`，本文后续将以此路径为参考。

`rclone.conf` 文件大致如下：

```
[$rcloneremotename]
type = s3
provider = Wasabi
access_key_id = YourAccessKey
secret_access_key = YourSecretAccessKey
region = eu-central-1
endpoint = s3.eu-central-1.wasabisys.com
env_auth = false
upload_cutoff = 25M
chunk_size = 5M
disable_checksum = false
upload_concurrency = 3
```

确保每个 Swarm 节点都有 `/root/.config/rclone/rclone.conf` 文件，且内容完全相同。可以使用 `md5sum /root/.config/rclone/rclone.conf` 检查并比较校验和。
*或者至少确保在存在多个配置文件的情况下，你要使用的那个配置文件相同。*

### 2) 准备存储系统

确保你的 S3 bucket（或通过 `rclone config` 配置的存储系统中的文件夹）确实存在，并且 bucket / 文件夹的名称与 `$remotename` 一致。

### 3) 准备 Docker rclone 插件

在每个 Swarm 节点上运行以下命令，安装 Docker volume 插件：`docker plugin install sapk/plugin-rclone`

然后在每个节点上执行以下命令。下面的命令专门针对“**php:N.N-apache**”容器（_例如 php:7.4-apache_）：

```
docker volume create --driver sapk/plugin-rclone --opt config="$(base64 /root/.config/rclone/rclone.conf)" --opt args="--uid 33 --gid 33 --allow-root --allow-other" --opt remote=$rcloneremotename:$remotename/path --name $volumename
```

如果 S3 bucket 中的文件是通过 AWS / Wasabi Web 界面，或通过挂载到 S3 bucket 的 SFTPGo 等其他方式上传的，则需要告诉 rclone 刷新目录缓存：

```
docker volume create --driver sapk/plugin-rclone --opt config="$(base64 /root/.config/rclone/rclone.conf)" --opt args="--uid 33 --gid 33 --allow-root --allow-other --dir-cache-time 5s" --opt remote=$rcloneremotename:$remotename/path --name $volumename
```

实际发生的事情是，“**[rclone mount](https://rclone.org/commands/rclone_mount/)**”会在 Docker Swarm 节点上挂载该卷。不过请注意，其他标志/参数可能会改善或降低应用体验，因此请充分测试。

**上面的 UID 和 GID 与 Apache2 匹配，其他应用可能需要使用不同的值。**

### 4) 准备应用

然后部署一个空白应用，取消勾选“**具有持久化数据**”，并在“**HTTP 设置**”、“**应用配置**”和“**部署**”选项卡下按需配置其参数。

在“**应用配置**”的“**服务更新覆盖**”部分中，放入以下内容。
请注意，`/var/www/html/uploads` 是应由你自行定义的路径 / 文件夹，本文仅将其作为参考。

根据应用需求，将“**ReadOnly**”值设置为 `true` 或 `false`。
如果你的 PHP 应用允许用户上传文件，请将其设置为 `false`。

```
TaskTemplate:
  ContainerSpec:
    Mounts: [
      {
        "Type": "volume",
        "Source": "$volumename",
        "Target": "/var/www/html/uploads",
        "ReadOnly": false
      }
    ]
```

这样，运行在“*php:7.4-apache*”上的应用就可以从 node1 移动到其他正确配置的节点。

如果你有问题或遇到故障，请通过 Slack 的 General 频道联系我们；如有需要，请提及我 [@Daniël](https://caprover.slack.com/archives/DLR2Q4TC1)，我或其他人会尽力帮助你。
