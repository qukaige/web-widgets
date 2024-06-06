# Web widgets

The repository of platform-supported widgets and modules for Mendix.

**For issues and bugs related to CSS, Widgets, Atlas, JS Actions, or this repository, please contact** [Mendix Support](https://support.mendix.com)

## Prerequisites

-   ![Current node engine](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Fmendix%2Fweb-widgets%2Fmain%2Fpackage.json&query=%24.engines.node&label=node&color=%23339933) version of [Node.js](https://nodejs.org/en/download)

-   ![Current pnpm version](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Fmendix%2Fweb-widgets%2Fmain%2Fpackage.json&query=%24.engines.pnpm&label=pnpm&color=%23f69220) version of [pnpm](https://pnpm.io/installation)

## Development

1. Clone the repo.

```sh
$ git clone https://github.com/mendix/web-widgets.git
```

2. Install the dependencies.

```sh
$ cd web-widgets
$ pnpm install
```

3. Go to the widget (package) you want to work on, set `MX_PROJECT_PATH`, and run `pnpm start`.

```sh
$ cd packages/pluggableWidgets/datagrid-web/

# Mac and Linux:
$ export MX_PROJECT_PATH="$HOME/Documents/Mendix/DataBoardApp"

# For Windows (PowerShell):
# $env:MX_PROJECT_PATH = 'C:\Users\Tom\Documents\Mendix\DataBoardApp'

$ pnpm start
```

4. Go to Mendix Studio Pro and run `App>Synchronize App Directory` to update the widget code in the project. If your app is already running, restart it.

5. Keep code clean: run `pnpm test` and `pnpm lint`.

```sh
$ pnpm lint
...
$ pnpm test
```

Note: run `pnpm test --watch` to start unit tests in watch mode.

## Contributing

See [CONTRIBUTING.md](https://github.com/mendix/web-widgets/blob/main/CONTRIBUTING.md).

## Raising problems/issues

-   We encourage everyone to open a support ticket through [Mendix Support](https://support.mendix.com) in case of problems with widgets or scaffolding tools (Pluggable Widgets Generator or Pluggable Widgets Tools).


## 自定义配置

```json
{
  "customobj": {
    "toFixed": "1",
    "y": "true"
  }
}
```
<table>
<tr>
<td>参数</td>
<td>说明</td>
</tr>
<tr>
<td>customobj</td>
<td>扩展对象</td>
</tr>
<tr>
<td>toFixed</td>
<td>保留小数位数</td>
</tr>
<tr>
<td>x or y</td>
<td>处理y轴, 或x轴数据</td>
</tr>
</table>