---
id: ci-cd-integration
title: CI/CD 集成
sidebar_label: 简介
---

虽然 CapRover 能够非常轻松地构建你的源代码并将其转换为 Docker image，但你经常会发现构建过程非常重。事实上，很多时候它比应用本身的负载还重。当你尝试在自己的服务器上构建源代码时，这可能导致服务器崩溃。避免这些高负载的最佳方式，是在别处构建 Docker image，然后只把构建好的产物部署到你的 CapRover 服务器。

有许多易用的 CI/CD 平台会为构建提供慷慨的免费分钟数，例如 GitHub 和 GitLab 都为私有仓库提供免费分钟数，并为公共仓库提供无限免费分钟数。

接下来阅读更多关于 [Github integration](ci-cd-integration/deploy-from-github.md) 和 [Gitlab integration](ci-cd-integration/deploy-from-gitlab.md) 的内容！
