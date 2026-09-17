---
id: deploy-from-gitlab
title: 从 GitLab 部署
sidebar_label: 从 GitLab 部署
---



本教程将介绍通过 GitLab 进行部署。话虽如此，GitHub 的操作非常相似。如果你在过程中遇到任何问题，请告诉我们！


### 1- 创建 GitLab Repository

如果你没有 GitLab 账号，请创建一个。
- 点击 “New Project” 创建新 repository
- 点击 “Create blank project”
- 为 project 命名并完成创建



### 2- 添加示例源代码

本教程使用非常简单的示例源代码，其中只包含一个文件。

`index.php`
```php
 <?php echo 'PHP output: Hello World!'; ?> 
```

将此文件添加、commit 并 push 到 GitLab 上的 repository。此时你应该可以在 GitLab 的 web UI 中看到这个文件。



### 3- Dockerfile

为了在 3rd party build system 上构建，你需要一个 Dockerfile。如果使用 CapRover templateId，可以使用 [CapRover repository 中现成的 Dockerfiles](https://github.com/caprover/caprover/tree/ff3d124f967ee06732c13774e9e633d33b0982c4/dockerfiles)。

本教程使用 PHP Dockerfile：

`Dockerfile`
```Dockerfile
FROM php:7.3-apache
COPY ./ /var/www/html/
```

**重要：** 确保你的 `Dockerfile` 拼写完全正确。

添加、commit 并 push 此文件。



### 4- 为 CapRover 创建 Access Token

CapRover 需要从 GitLab 拉取构建好的 images，因此我们需要创建 access token。前往 [User settings > Personal access tokens](https://gitlab.com/-/user_settings/personal_access_tokens) 并创建 token。

确保为此 token 分配 `read_registry` 和 `write_registry` 权限。

创建 token 后，进入下一步：



### 5- 将 Token 添加到 CapRover

登录 CapRover web dashboard，在 `Cluster` 下点击 `Add Remote Registry`。然后填写以下字段：

- Username：`your gitlab username`
- Password：`your gitlab Token [From the previous step]`
- Domain：`registry.gitlab.com`
- Image Prefix：`again, your gitlab username`

注意：Image Prefix 取决于你在 GitLab 中组织 project 的方式。如果 repository 使用了 group，image prefix 应该是你的 group。
通常，image prefix 是 domain 与 image name 之间的部分。例如，对于下面这个 project，Image Prefix 是 `my-group-project`：
```
registry.gitlab.com/my-group-project/test:latest
```

保存 registry。



### 6- 禁用 Default Push

现在你已经添加了 registry，CapRover 默认会尝试将构建产物推送到你的 registry。本教程不需要这样做，而且这可能导致部署失败。因此请禁用 `Default Push`。



### 7- 创建 CapRover App

在 CapRover dashboard 上创建一个 app，我们将它命名为 `my-test-gitlab-deploy`。



### 8- 创建 CI/CD Variables

接下来，进入 GitLab 上的 project 页面，前往 `Settings > CI/CD`。然后在 `Variables` 下添加以下 variables：
- `Key`：`CAPROVER_URL`，`Value`：`https://captain.root.domain.com [replace it with your domain]`
- `Key`：`CAPROVER_PASSWORD`，`Value`：`mYpAsSwOrD [replace it with your password]`
- `Key`：`CAPROVER_APP`，`Value`：`my-test-gitlab-deploy [replace it with your app name]`

添加以上 3 个 variables。为了获得最佳安全性，请确保它们是 protected。即使没有 masked 也没关系，它们不会出现在 logs 中。



### 9- GitLab CI File

到目前为止，directory 中有两个文件：`index.php` 和 `Dockerfile`。现在添加 GitLab 专用的构建 instructions：

**重要：** 确保你的 `.gitlab-ci.yml` 拼写完全正确。它以点号开头。


`.gitlab-ci.yml`
```yaml
build-docker-master:
  image: docker:19.03.1
  stage: build
  services:
    - docker:19.03.1-dind
  before_script:
    - export DOCKER_REGISTRY_USER=$CI_REGISTRY_USER # built-in GitLab Registry User
    - export DOCKER_REGISTRY_PASSWORD=$CI_REGISTRY_PASSWORD # built-in GitLab Registry Password
    - export DOCKER_REGISTRY_URL=$CI_REGISTRY # built-in GitLab Registry URL
    - export COMMIT_HASH=$CI_COMMIT_SHA # Your current commit sha
    - export IMAGE_NAME_WITH_REGISTRY_PREFIX=$CI_REGISTRY_IMAGE # Your repository prefixed with GitLab Registry URL
    - docker login -u "$DOCKER_REGISTRY_USER" -p "$DOCKER_REGISTRY_PASSWORD" $DOCKER_REGISTRY_URL # Instructs GitLab to login to its registry

  script:
    - echo "Building..." # MAKE SURE NO SPACE ON EITHER SIDE OF = IN THE FOLLOWING LINE
    - export CONTAINER_FULL_IMAGE_NAME_WITH_TAG=$IMAGE_NAME_WITH_REGISTRY_PREFIX/my-build-image:$COMMIT_HASH
    - docker build -f ./Dockerfile --pull -t built-image-name .
    - docker tag built-image-name "$CONTAINER_FULL_IMAGE_NAME_WITH_TAG"
    - docker push "$CONTAINER_FULL_IMAGE_NAME_WITH_TAG"
    - echo $CONTAINER_FULL_IMAGE_NAME_WITH_TAG
    - echo "Deploying on CapRover..."
    - docker run caprover/cli-caprover:v2.1.1 caprover deploy --caproverUrl $CAPROVER_URL --caproverPassword $CAPROVER_PASSWORD --caproverApp $CAPROVER_APP --imageName $CONTAINER_FULL_IMAGE_NAME_WITH_TAG
  only:
    - master
```

这份文件基本无需解释。**最棒的是，无论你的 repository 使用什么语言，或部署到哪里，都不需要修改这个文件！**

此文件中唯一不同的 3 个值，就是你在上一步设置的 3 个 `CAPROVER_***` 值。

将此文件 commit 并 push 到 GitLab repository。到现在为止，你的 GitLab repository 至少应包含以下 3 个文件：
```bash
index.php
Dockerfile
.gitlab-ci.yml
```

稍等片刻，构建就会完成并自动部署！几分钟后，你就能在 CapRover 上看到已部署的 app！

#### 使用 private registry 时关于 `--imageName` 的说明

如果运行 `caprover deploy --imageName` 时遇到以下错误，可能需要在 registry 中验证 Captain instance，因为本地登录并不意味着 CapRover 可以访问该 image。

```
Deploy failed!
Error: (HTTP code 404) unexpected - pull access denied for user_name/repo_name, repository does not exist or may require 'docker login': denied: requested access to the resource is denied
```

**在 CapRover 上登录你的 private Docker repository：**

- 前往 CLUSTER
- 点击 ADD REMOTE REGISTRY
- 输入你的数据并保存 registry
- 现在可以使用 `caprover deploy --imageName` 配合你的 private image registry。


#### App Tokens

使用 CI/CD 时，避免存储 password 可能更好。你可以创建 app 专用 token，用于部署每个 app。

```
caprover deploy --appToken <YOUR_APP_TOKEN_HERE> --caproverUrl https://captain.domain.com --imageName YOUR_IMAGE_NAME --appName YOUR_APP_NAME
```

通常，将 token 保存到 environment variable 中更安全；CLI 会从 `CAPROVER_APP_TOKEN` variable 加载它。

此功能从 CapRover 1.10 backend 和 CapRover CLI 2.2.0 版本开始提供！



#### 替代方式

另外，你可以使用 webhook 代替 `docker run caprover/cli-caprover:v2.1.1 caprover deploy....`。这种方式稍微复杂一些。

下面不是一个**可运行的**示例，只是提示 webhook 方式需要哪些步骤才能工作。

```bash
    - echo "Deploying on CapRover..."
    - export DEPLOY_BRANCH=deploy-caprover
    - cd ~
    - git clone your-repo
    - cd your-repo
    - git checkout $DEPLOY_BRANCH || git checkout -b $DEPLOY_BRANCH
    - git rm -rf .
    - git clean -fdx .
    - echo "{\"schemaVersion\":2,\"imageName\":\"$CONTAINER_FULL_IMAGE_NAME_WITH_TAG\"}" > captain-definition
    - git add .
    - git commit -m "Deploy $CONTAINER_FULL_IMAGE_NAME_WITH_TAG"
    - git push --set-upstream origin $DEPLOY_BRANCH
    - curl -X POST https://captain.rootdomain.com/your-webhook
```
