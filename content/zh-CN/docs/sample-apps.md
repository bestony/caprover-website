---
id: sample-apps
title: 示例应用
sidebar_label: 示例应用
---

<br/>
CapRover 构建于 Docker 容器之上。因此，几乎所有应用都可以部署到 CapRover。如 `captain-definition` 文档中所述，NodeJS、PHP、python 和 ruby 等常见 Web 语言都有几种简单的 `captain-definition` 配置。

不过，CapRover 并不局限于这些语言。例如，它也可以部署 go 应用，只需为其准备一个 Dockerfile 即可。


### 可以部署的应用！

在 CapRover 仓库中，可以找到一系列已准备好部署的不同示例应用！请参阅：
https://github.com/caprover/caprover/tree/master/captain-sample-apps

其中包括：
- ASP .NET
- Go 应用
- 高级 nginx 应用
- Python
- Ruby
- Elixir/Phoenix/LiveView
- NodeJS
- React 应用
- 以及其他应用……


要部署示例应用，只需：
- 下载所需的 tar 文件。
- 前往 CapRover Web 控制面板并创建一个测试应用。
- 转到“Deployment”标签页并上传 tar 文件！
- 完成！

现在可以解压 tar 内容并查看其中的文件。这能帮助你了解如何使用 CapRover（Docker）部署不同的应用。


### 社区应用

来自社区的一组示例应用。

#### CapRover Django

此项目模板旨在提供更贴近真实场景的 Django 模板，包括：
- PostgreSQL
- CapRover 设置说明
- Django 设置处理

请在 [GitLab](https://gitlab.com/kamneros/caprover-django) 上查看代码和文档。

此外，还可以在[这里](https://blog.kenshuri.com/posts/006_from_heroku_to_capRover.md)找到将 Django 应用部署到 CapRover 的分步教程。

#### CapRover Laravel

- [jackbrycesmith/laravel-caprover-template](https://github.com/jackbrycesmith/laravel-caprover-template)

#### Elixir/Phoenix 应用部署

部署完整的 Elixir/Phoenix LiveView Web 应用，并附带诊断控制面板。

- [拖放 tarball](https://github.com/TehSnappy/phoenix_sample/releases/download/v1.0/phoenix_sample.tar)
- [应用代码链接](https://github.com/TehSnappy/phoenix_sample)



