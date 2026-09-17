---
id: one-click-apps
title: 一键应用
sidebar_label: 一键应用
---

<br/>

CapRover 内置支持多种可以直接部署的常用应用，包括 WordPress、MySQL、MongoDB 以及更多应用。

[GitHub 上有一个一键应用仓库](https://github.com/caprover/one-click-apps)，并且仍在持续扩展。

![OneClickAppsCapRover](/img/docs/one-click.gif)

<br/><br/>

#### 数据库和数据库 GUI
- MongoDB
- MongoExpress
- MsSQL
- MySQL
- Redis
- PhpMyAdmin
- PostgreSQL
- Adminer
- Apache CouchDB
- Gitea 
- ElasticSearch 
- 以及更多……
#### 博客和内容
- WordPress
- Ghost
- Prisma 1
- Strapi
- Minio
- 以及更多……
#### 开发工具
- Jenkins
- Drone.io
- Hasura
- Nexus3
- 更多应用……
#### 其他应用
- Parse
- NextCloud
- Rainloop
- Thumbor
- OhMyForm
- 以及更多……



<br/>

感谢 [@8byr0](https://github.com/8byr0)，我们有一个由**社区维护**的[应用目录](https://wizardly-ptolemy-8fcac8.netlify.app/)。可以在[这里](https://github.com/8byr0/caprover-sampleapps-browser)查看源代码。


## 其他应用怎么办？
某个应用或数据库没有提供一键应用，并不意味着无法部署。你只需要搜索所需应用的 Docker 镜像即可。例如，在 NextCloud 成为一键应用之前，仍然可以像下面这样手动部署它：
![nextcloud](/img/docs/nextcloud-deploy-manually.png)


使用 CapRover v1 后，方法比上面介绍的更简单。由于 `captain-definition` 现在支持 `imageName`，可以将下面的内容复制并粘贴到所创建应用的部署部分。当只需要 `imageName` 时，无需再创建 `tar` 文件：

```
{
  "schemaVersion": 2,
  "imageName": "nextcloud:12-rc"
}
```
该应用可设置的所有环境变量都列在其 DockerHub 页面上：https://hub.docker.com/_/nextcloud/

<br/>

## 配置设置

这些应用都带有预配置设置，但你仍可以自定义设置。例如，MySQL 数据库使用 3306 端口，但如果需要，也可以将其更改为其他端口。

需要注意的是，部分配置参数可能会在应用部署后以环境变量的形式出现在应用设置中，但它们的值只会在安装阶段使用。例如，通过修改 PASSWORD 环境变量来更改 MySQL 密码不会生效。应使用 MySQL 命令修改密码。PASSWORD 环境变量用于在安装阶段设置初始密码。

## 升级一键应用

部署一键应用一段时间后，如果有新版本发布并希望更新应用，不同应用的流程可能不同：

#### 简单更新镜像
大多数质量较好的应用只需更新底层镜像即可！大多数应用通常都是如此。例如，如果使用 MySQL 5.5 并希望升级到 5.7，只需进入“Deployment”标签页，滚动到底部，在 **Method 6: Deploy via ImageName** 下输入 mysql:5.7，然后点击部署即可！

镜像名称通常采用 `imagename:version` 或 `account/image:version` 格式。可以在部署历史中查看 CapRover 已部署的镜像，也可以在 DockerHub 上查看新版本。例如：
- `mysql` 版本可在这里找到：https://hub.docker.com/_/mysql?tab=tags
- `portainer/portainer` 版本可在这里找到：https://hub.docker.com/r/portainer/portainer/tags

请注意，某些情况下 CapRover 会修改原始镜像以提供更多功能。例如，redis 容器经过修改以提供[身份验证选项](https://github.com/caprover/one-click-apps/blob/af172b6680583487bdeacf230d7abaf9b57f4811/public/v4/apps/redis.yml#L10-L12)。在这种情况下，直接删除应用并重新创建会更简单。如果应用有持久化数据，请确保删除应用时**不要删除卷**，并使用完全相同的名称重新创建应用，以便将完全相同的卷挂载到应用上。



#### 其他情况
某些应用有不同的升级方式，尤其是包含持久化代码数据的应用。WordPress 就是一个很好的例子。升级 WordPress 时，只需在 WordPress 网站面板中执行升级。有时还需要更新底层镜像，此时只需按照上面的指南操作。


## 连接数据库

### 在 CapRover 集群中连接

由于每个应用都作为 Docker 服务运行，多个 MySQL 应用可以在容器端口 3306 上监听而不会冲突。同一 CapRover 集群中的 PHP 应用可以通过 `mysqlappname1:3306` 和 `mysqlappname2:3306` 访问两个数据库应用。升级后的应用也可能保留旧的 `srv-captain--APP_NAME` 网络别名。


### 远程连接

如果希望从远程机器（例如笔记本电脑）连接数据库，则需要将容器端口映射到服务器端口。这种情况下，必须在服务器上映射两个不同的端口，例如：
- 服务器的 1001 端口映射到 mysql-1 的 3306 端口
- 服务器的 1002 端口映射到 mysql-2 的 3306 端口

如果要从远程机器连接数据库，就需要进行端口映射。更多信息请参阅 [Captain 配置 - 端口映射](app-configuration.md#端口映射)。

完成端口映射后，可以为数据库客户端填写以下值：
- Host：IP-ADDRESS-OF-SERVER
- Port：MAPPED-PORT-ON-HOST


例如，在上面的示例中，`MAPPED-PORT-ON-HOST` 对于 `mysql-1` 是 `1001`，对于 `mysql-2` 是 `1002`。

假设服务器 IP 为 `123.123.123.123`，映射端口为 `9999`：
- 对于 Mongo DB，使用 `mongodb://dbuser:dbpassword@123.123.123.123:9999/dbname`
- 对于 MySQL，使用 `HOST: 123.123.123.123`、`PORT: 9999`
- 等等……

**重要**：完成端口映射后，请确保打开服务器端口。例如，如果将主机（服务器）的 4444 端口映射到容器的 3306 端口，则需要运行以下命令：

```
ufw allow 4444
```
