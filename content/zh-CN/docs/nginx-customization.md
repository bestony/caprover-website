---
id: nginx-customization
title: NGINX 配置
sidebar_label: NGINX 配置
---

## 配置自定义

虽然 CapRover 会自动管理将 HTTP 请求路由到应用的所有内容，但你可能仍然需要手动调整某些特殊配置值，例如特定文件类型或路由的缓存逻辑、超时设置、请求体大小，以及其他可以通过 nginx 手动调整的参数。

CapRover 允许你通过完全自定义的配置文件手动调整这些参数。可以调整参数的区域有三个：

- NGINX 基础配置文件（容器内的 `/etc/nginx/nginx.conf`）。这是 NGINX 首先读取的文件，它会指示 nginx 查找其他配置文件。你可以在 Web 控制面板的设置中手动调整此文件。
- CapRover 配置文件（容器内的 `/etc/nginx/conf.d/captain-root.conf`）。当你访问 `captain.root.domain.com` 时，开发者会与这个配置文件交互。通常不需要修改此文件，但如有需要，可以在 Web 控制面板 > 设置中修改。
- 应用专属配置文件（容器内的 `/etc/nginx/conf.d/captain.conf`）。这里可以修改应用专属设置。例如，你有一个视频上传应用，希望允许 1GB 的请求体大小，可以进入 Web 控制面板 > 应用 > 编辑应用，手动修改此参数。请注意，你所做的任何更改只会应用于这个特定应用，其他应用仍使用默认配置。此配置模板会应用于指向该应用的**所有域名**，也就是说，Captain 会为 `my-app-name.captainroot.domain.com` 创建一个 server block，还可能为 `www.myapp.com` 等创建另一个 server block。

修改模板后，可以从 `caprover/caprover` Docker 镜像内部（`docker exec -it docker_container_id /bin/sh`）的 `/captain/generated/nginx` 查看已编译的 nginx 配置，以便通过检查下面列出的文件来确认最终编译结果是否符合预期。请注意，你**不能手动修改**这些文件，因为它们会被 Captain 覆盖。如果要进行任何更改，应始终修改 CapRover 控制面板中的 Nginx 模板。

- `/captain/generated/nginx/nginx.conf` – 生成的 NGINX 基础配置文件
- `/captain/generated/nginx/conf.d/captain-root.conf` – 生成的 CapRover 配置文件
- `/captain/generated/nginx/conf.d/captain.conf` – 生成的应用专属配置文件

## 自定义文件和目录

除了自定义配置外，你可能还需要在 nginx 容器中使用一些文件，例如自定义 SSL 证书、特定的静态资源等。由于 CapRover 实例中的所有内容（包括 nginx）都位于独立容器中，你需要将主机上的目录映射到容器中。Captain 已经为你完成了映射。服务器上的 `/captain/data/nginx-shared` 目录在 nginx 容器中对应 `/nginx-shared`。例如，假设你将自定义 SSL 证书放在该目录中，文件路径为 `/captain/data/nginx-shared/custom-cert.pem`。要在 nginx 配置中引用该文件，应使用 `/nginx-shared/custom-cert.pem`。


## 为所有应用自定义和覆盖 NGINX 配置

注意：此功能从 1.11 版本开始提供。

要修改新创建应用的默认 NGINX 配置，可以添加 IP 白名单及其他 NGIX 配置。

1- 从 CapRover GitHub 仓库获取 `server-block-conf.ejs` 模板的副本。[**点击这里**](https://github.com/caprover/caprover/blob/master/template/server-block-conf.ejs)

2- 创建文件 `/captain/data/server-block-conf-override.ejs`，复制模板内容，并进行所需修改。
假设你使用 `-v /captain:/captain` 启动 CapRover Docker（默认设置）。

3- 重启 CapRover，使其读取覆盖文件内容：`docker service update --force captain-captain`
