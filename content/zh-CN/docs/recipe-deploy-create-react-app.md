---
id: recipe-deploy-create-react-app
title: 静态 React 应用
sidebar_label: 静态 React 应用
---


## 示例应用

可以在 [sample apps directory](https://github.com/caprover/caprover/tree/master/captain-sample-apps) 中找到一个可直接部署的 React 应用。该目录中的示例很好用，但如果你的服务器内存不够，且 `package.json` 里的依赖过多，构建过程可能会因为内存耗尽而在服务器上崩溃。遇到这种情况时，可以按下面的步骤在自己的本地机器上构建应用（例如笔记本电脑），再把构建后的代码部署到服务器。


## 在本地机器上构建

下面是一份简短的分步指南，用于把 `create-react-app` 部署为静态站点。
常规的 `caprover deploy` 会把源文件部署到 `NodeJS` 容器中，然后构建应用并运行一个小型 node 服务器来提供文件服务；而本指南展示的是如何在本地构建，再把静态产物部署到一个简单的静态服务器容器中。

这种方式最大的优点是构建发生在你自己的机器上，那里已经有 `node_modules`，计算能力通常也比服务器更强。你只需要上传压缩后的文件，而不是整个代码库。因此部署会快得多，对服务器的计算压力也更小。

虽然本指南以 `create-react-app` 为例，但同样的方法也适用于任何静态项目（VueJS、Parcel、Angular 等）。

#### 构建应用

首先要做的是为生产环境构建应用。

```bash
npm run build
```

#### 创建 `captain-definition`

然后在项目根目录创建 `captain-definition`：

```json
{
  "schemaVersion": 2,
  "dockerfileLines": [
    "FROM socialengine/nginx-spa:latest", 
    "COPY ./build /app", 
    "RUN chmod -R 777 /app"
  ]
}
```

这个 `captain-definition` 使用 `socialengine/nginx-spa`，它是一个简单的静态 nginx 服务器，可以处理 `pushState`（每个请求都会路由到 `/index.html`，因此可以使用前端路由）。

**注意**：如果你的 `build` 输出目录不是 `build`，需要把 `COPY ./build /app` 改成 `COPY ./[my-output-folder] /app`

#### 创建 `tar` 文件

现在需要创建一个 `tar` 文件。通常你不需要手动做这一步，因为 `caprover deploy` 会根据你的 git 仓库生成一个；但这里我们不希望把整个仓库内容放进 `tar`，只需要静态文件和 `captain-definition` 文件。

```bash
tar -cvf ./deploy.tar --exclude='*.map' ./captain-definition ./build/*
```

**注意**：如果你的 `build` 输出目录不是 `build`，需要把 `./build/*` 替换为 `./[my-output-folder]/*`

**注意**：这里还排除了 `.map` 文件，因为它们通常很大，会让上传时间变长。如果你希望在生产环境中包含 `.map` 文件，只需移除 `--exclude='*.map'`。

**提示**：把 `deploy.tar` 加到 `.gitignore`，避免不小心提交它 😉

#### 使用 `caprover` 部署

现在只需要使用带 `-t` 参数的 `caprover` CLI，让它使用我们自己的 `tar` 文件，而不是从 git 仓库生成的文件。

```bash
caprover deploy -t ./deploy.tar
```

然后像平常一样回答问题，等待上传完成即可 🎉
