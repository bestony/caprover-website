---
id: docker-compose
title: Docker Compose
sidebar_label: Docker Compose
---

CapRover 可以直接从控制面板部署受支持的 Docker Compose 子集。此功能适合一起创建多个相关应用，但仍处于实验阶段，并未实现完整的 Compose 规范。

## 部署 Compose 文件

1. 在 CapRover 控制面板中打开 **Apps**。
2. 选择 **Docker Compose**。
3. 将 Compose YAML 粘贴到编辑器中。
4. 检查生成的应用，然后部署。

例如：

```yaml
services:
  db:
    image: mysql:8.4
    volumes:
      - db-data:/var/lib/mysql
    environment:
      MYSQL_ROOT_PASSWORD: change-this-password
      MYSQL_DATABASE: wordpress
      MYSQL_USER: wordpress
      MYSQL_PASSWORD: change-this-password

  wordpress:
    depends_on:
      - db
    image: wordpress:latest
    environment:
      WORDPRESS_DB_HOST: db:3306
      WORDPRESS_DB_USER: wordpress
      WORDPRESS_DB_PASSWORD: change-this-password
      WORDPRESS_DB_NAME: wordpress
```

同一部署中的服务可以通过服务名称互相访问，例如本例中的 `db:3306`。当前 CapRover 版本创建的应用使用应用名称作为 Docker 服务名称。从 1.15 之前的版本升级的应用可能仍保留类似 `srv-captain--db` 的实际服务名称；CapRover 会保留带前缀的网络别名以确保兼容性。

## 支持的字段

当前解析器支持以下服务字段：

- `image`
- `environment`
- `ports`
- `volumes`
- `depends_on`
- `hostname`
- `cap_add`
- `command`

其他 Compose 字段会被忽略。尤其要检查依赖 `build`、`container_name`、自定义 `networks`、`secrets`、`configs`、`deploy` 或 `restart` 的文件。在生成的应用中，使用 CapRover 设置（如果可用）配置等效行为。

服务引用的命名卷由 CapRover 创建和管理。Compose 的 `ports` 条目必须使用 `HOST:CONTAINER` 格式。部署后检查每个生成的应用，确认其 HTTP 端口、持久化目录、端口映射、环境变量和依赖关系。

## 在 CapRover 外运行 Compose

如果你的技术栈需要不受支持的 Compose 功能，可以直接使用 `docker compose` 管理。要让 CapRover 应用能够访问其中一个服务，请将它连接到外部 `captain-overlay-network`：

```yaml
services:
  web-app:
    image: your-image:latest
    networks:
      - captain-overlay-network

networks:
  captain-overlay-network:
    external: true
```

然后可以创建一个带有类似 `http://web-app` 上游地址的 CapRover **Nginx Reverse Proxy** 应用。直接使用 Docker Compose 启动的服务不受 CapRover 的部署、扩展、备份和生命周期管理。
