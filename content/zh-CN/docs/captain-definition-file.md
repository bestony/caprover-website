---
id: captain-definition-file
title: Captain Definition 文件
sidebar_label: Captain Definition 文件
---

## 基础知识

项目根目录中的 `captain-definition` 文件会告诉 CapRover 如何构建或部署项目。该文件使用 JSON，并要求 `schemaVersion: 2`。

Node.js 应用示例：

```json
{
  "schemaVersion": 2,
  "templateId": "node/24"
}
```

`templateId` 使用 `LANGUAGE/VERSION` 格式。内置模板包括 `node`、`php`、`python-django` 和 `ruby-rack`。CapRover 会在构建时从对应的官方容器镜像解析版本。

对于新的生产应用，通常由仓库维护的 Dockerfile 能提供最清晰、最可复现的构建方式。它还支持任何语言或运行时。

## 使用 Dockerfile

引用仓库中的 Dockerfile：

```json
{
  "schemaVersion": 2,
  "dockerfilePath": "./Dockerfile"
}
```

即使 Dockerfile 位于子目录中，Docker 构建上下文仍然是上传项目的根目录。

也可以直接内联定义 Dockerfile：

```json
{
  "schemaVersion": 2,
  "dockerfileLines": [
    "FROM node:24-alpine",
    "WORKDIR /usr/src/app",
    "COPY package*.json ./",
    "RUN npm install --omit=dev && npm cache clean --force",
    "COPY . .",
    "ENV NODE_ENV=production",
    "ENV PORT=80",
    "EXPOSE 80",
    "CMD [\"npm\", \"start\"]"
  ]
}
```

更多选项请参阅 Docker 的 [Dockerfile 参考](https://docs.docker.com/reference/dockerfile/)和[构建最佳实践](https://docs.docker.com/build/building/best-practices/)。

## 使用镜像名称

从 registry 部署预构建镜像：

```json
{
  "schemaVersion": 2,
  "imageName": "nginxdemos/hello"
}
```

可以将仅包含镜像的定义粘贴到应用的 **Deployment** 标签页。CLI 也接受通过 `caprover deploy --imageName IMAGE` 传入的预构建镜像。

## Monorepo（单仓库）

一个仓库可以为每个应用包含单独的定义文件：

```text
/project
  /frontend
    package.json
  /backend
    package.json
  captain-definition-backend
  captain-definition-frontend
```

在每个应用的 **Deployment** 标签页中，将 Captain Definition Path 设置为相关文件，例如 `./captain-definition-backend`。由于根目录是构建上下文，Dockerfile 的 `COPY` 路径仍相对于项目根目录。

## 选择运行时版本

使用仍处于积极支持期的运行时版本，并根据应用对可复现性的要求进行固定。可用的模板版本遵循官方镜像发布的标签：

- [Node.js 镜像标签](https://hub.docker.com/_/node)
- [PHP 镜像标签](https://hub.docker.com/_/php)
- [Python 镜像标签](https://hub.docker.com/_/python)
- [Ruby 镜像标签](https://hub.docker.com/_/ruby)

更改浮动标签可能会改变后续构建使用的运行时。需要可重复构建时，请固定确切标签或 digest。
