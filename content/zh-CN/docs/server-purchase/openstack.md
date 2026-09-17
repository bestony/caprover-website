---
id: openstack
title: 使用 OpenStack 设置 CapRover
sidebar_label: OpenStack
---

## 为什么选择 OpenStack？

OpenStack 是专有基础设施即服务（IaaS）云标准最流行的替代方案。
AWS 和 Azure 等大型 cloud provider，以及 Hetzner 等一些较小的 provider，都有各自不同的 API、配置和资源部署命名约定。
OpenStack 允许你以相同方式在任何实现 OpenStack 标准的 cloud 上部署资源（甚至可以自行搭建），从而摆脱 vendor lock-in。

## 设置 OpenStack provider

许多 cloud provider 支持 OpenStack，包括 Infomaniak、VEXXHOST、OVHcloud、SharkTech 等。

在我见过的 provider 中，Infomaniak 的 [documentation](https://docs.infomaniak.cloud/) 最好。

你应该按照 provider 的说明获取 cloud.yaml 文件，以便 OpenStack CLI 连接到 cloud project。

下面简要总结 Infomaniak 的步骤。
更多详情（包括截图）请参见他们的 [documentation](https://docs.infomaniak.cloud/documentation/00.getting-started/01.Create_new_project/)。
其他 provider 的步骤应该类似。

1.  在 public cloud dashboard 中创建一个新 project。可以将 project 命名为 `caprover-prod`。
2.  根据提示，为 OpenStack user 生成并设置 password。
3.  进入 project 的 “Manage users”。点击唯一 user（以 PCU-... 开头）旁边的下拉菜单，并下载 clouds.yaml file。
4.  将 `clouds.yaml` 移动到 [OpenStack client 能够找到它的位置](https://docs.openstack.org/python-openstackclient/latest/configuration/index.html)，也就是 home directory 中的 `.config/openstack/clouds.yaml`。
    如果你之前已经设置过该文件，请将配置复制并追加到现有文件中。
5.  打开 `clouds.yaml` 文件，将 cloud name 从 `PCP-...` 改为更易读的名称，例如 `infomaniak-prod`。这样，当你添加更多 environments 或其他 OpenStack providers 时，就可以继续向文件中添加配置。
6.  另外，将第 2 步生成的 password 插入文件中。

## 安装 OpenStack CLI 并验证连接
1.  安装 OpenStack command line client。
    [official OpenStack instructions](https://docs.openstack.org/newton/user-guide/common/cli-install-openstack-command-line-clients.html) 会要求你通过 `pip` 安装 client，但使用 [pipx](https://pipx.pypa.io/stable/) 更干净，可以避免污染 global Python package space：
    ```
    pip install pipx
    pipx install python-openstackclient
    pipx inject python-openstackclient python-heatclient
    ```
2.  使用以下命令验证连接：
    ```
    openstack --os-cloud mycloud project list
    ```
    （注意：在此命令及后续命令中，将 `mycloud` 替换为你在 clouds.yaml 中设置的实际名称，例如 `vexxhost-dev` 或 `infomaniak-prod`。）
    这应该会显示你的 default project name。

## 部署 OpenStack Heat template file

1.  你需要生成一个 key，以便需要时通过 SSH 登录 CapRover server。
    你可以创建 `~/.ssh/openstack` 文件夹，或将 key 存储在任意位置。
    ```
    openstack --os-cloud mycloud keypair create caprover > ~/.ssh/openstack/mycloud.priv
    chmod 600 ~/.ssh/openstack/mycloud.priv
    ```
2.  许多 OpenStack providers 会提供一组默认 VM images。
    使用以下命令检查可用 images：
    ```
    openstack --os-cloud mycloud image list
    ```
    建议使用最新版本的 Ubuntu LTS。
    你也可以按照[这里](https://docs.openstack.org/heat/latest/getting_started/create_a_stack.html#preparing-to-create-a-stack)的说明上传自己的 image。
3.  使用以下命令检查可用 flavors：
    ```
    openstack --os-cloud mycloud flavor list
    ```
3.  使用以下命令检查可用 networks：
    ```
    openstack --os-cloud mycloud network list
    ```
4.  最后，整合所有部分来部署 CapRover。请务必将占位值替换为你自己的值。
    ```
    openstack --os-cloud mycloud stack create -t https://raw.githubusercontent.com/caprover/caprover/master/dev-scripts/openstack/single-instance.yml --parameter image_id=<Ubuntu image ID> --parameter instance_type=<flavor> --parameter network=<network> caprover
    ```
    例如，以下命令可在 Infomaniak 上运行：
    ```
    openstack --os-cloud infomaniak-dev stack create -t https://raw.githubusercontent.com/caprover/caprover/master/se
tup/openstack/single-instance.yml --parameter image_id="Ubuntu 22.04 LTS Jammy Jellyfish" --parameter instance_type=a1-ram2-disk20-perf1 --parameter network=ext-net1 caprover
    ```

## 验证部署
1.  登录 OpenStack dashboard web UI。
2.  打开 Instances。你应该会看到实例 `caprover-caprover_manager-...`。复制它的 IP address。
3.  你应该可以在浏览器中通过 `<IP address>:3000` 看到 CapRover dashboard。
    从这里开始，你应该可以按照 [Getting Started](https://caprover.com/docs/get-started.html) 中的说明完成 CapRover 设置。
4.  你也可以使用以下命令 SSH 登录该实例：
    ```
    ssh -i ~/.ssh/openstack/mycloud-prod.priv -o StrictHostKeyChecking=accept-new ubuntu@CAPROVER_MANAGER_IP
    ```
    登录后，可以使用命令 `sudo less /var/log/cloud-init-output.log` 查看 Heat template 的安装过程输出。
