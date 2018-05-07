# B2B theme for VirtoCommerce Storefront

_B2B theme_ for VirtoCommerce Storefront used by _B2B-Store_ sample store. It is a showcase for b2b features support of VirtoCommerce.

![B2B theme UI](https://user-images.githubusercontent.com/6369252/29848754-2b16fa0c-8d3c-11e7-8839-2e335e518838.png)

*Main article: [theme development on virtocommerce.com/docs](https://virtocommerce.com/docs/vc2devguide/working-with-storefront/theme-development)*

## CMS Content folder structure
<a href="https://user-images.githubusercontent.com/6369252/29847174-c7bff8c6-8d33-11e7-901a-c3a04789959e.png"><img src="https://user-images.githubusercontent.com/6369252/29847175-c7c03f16-8d33-11e7-92f2-384228f6202e.png" alt="CMS Content folder structure" width="768"></a>

## Getting started

1. Install [prerequisites](#prerequisites).
2. Clone repo.
    1. In Visual Studio, go to **Team Explorer** → **Clone** → Enter https://github.com/VirtoCommerce/vc-theme-b2b.git as URL and **C:\vc-theme-b2b** (for example) as path.
    2. Or execute command
        ```
        git clone https://github.com/VirtoCommerce/vc-theme-b2b.git "C:\vc-theme-b2b"
        ```
        (where **C:\vc-theme-b2b** is path to folder where you want to clone repo).
3. Link you theme repo to store. Execute:
    ```
    mklink /d "C:\vc-platform\VirtoCommerce.Platform.Web\App_Data\cms-content\Themes\B2B-Store\default" "C:\vc-theme-b2b"
    ```
    (where **C:\vc-platform\VirtoCommerce.Platform.Web\App_Data\cms-content** is path to CMS content storage configured at platform & storefront deployment steps, **'B2B-Store'** is your store name and **'C:\vc-theme-b2b'** is path to your theme repo).
4. Open theme folder in your IDE
    1. In Visual Studio (including 2017) go to  **File** → **Open** → **Website**
    2. In Visual Studio Code, go to **File** → **Open** → **Folder**
    3. Select **C:\vc-theme-b2b** (where **C:\vc-theme-b2b** is path to folder where you want to clone repo) and open it.
5. Install Node.js dependencies.
    1. In Visual Studio all dependencies will be installed automatically. Just wait a few minutes.
    2. In Visual Studio Code and other editors, you need to run
    ```
    npm install
    ```
    to install Node.js dependencies.

## Prerequisites

### Storefront

You need to have local installation of storefront. Follow [this article](https://virtocommerce.com/docs/vc2devguide/deployment/storefront-deployment) step-by-step to install storefront from binaries or source code.

Add app setting **VirtoCommerce:B2B:ApiEndpoint** and set its value to URL of B2B module API endpoint (usually the same url as for admin site) with slash as last symbol.

### Platform

[B2B Extensions module](https://github.com/VirtoCommerce/vc-module-b2b-extensions) must be installed.

### Visual Studio 2015.3 and above (up to Visual Studio 2017.3 at least)

If you have Visual Studio 2015 with Update 3 and above, you don't need install any prerequisites. Latest versions of Node.js and Gulp already included in your Visual Studio installation and supported in built-in Task Runner Explorer.

### Visual Studio from 2015 up to 2015.2

Task Runner Explorer, Node.js and Gulp already included in your Visual Studio installation. However, you need update your Node.js to at least 4.0.0.
1. Update Node.js to v4.0.0 at least (we recommend [latest LTS version](https://nodejs.org/en/)). Use **C:\Program Files\nodejs** installation path (change **Program Files** to **Program Files (x86)** on 64-bit machine).
2. Add Node.js installation path to External Web Tools or move **$(PATH)** to top: ![External Web Tools](https://user-images.githubusercontent.com/6369252/30007184-a14aefe6-9122-11e7-81e2-c1ba792991cf.png)

### Visual Studio from 2013.3 up to 2013.5

You need install:
1. [Task Runner Explorer](https://marketplace.visualstudio.com/items?itemName=MadsKristensen.TaskRunnerExplorer) Visual Studio extension
2. Install Node.js v4.0.0 or above (we recommend [latest LTS version](https://nodejs.org/en/))
3.
    ```
    npm install gulp -g
    ```

### Visual Studio Code and other editors

1. Install Node.js v4.0.0 or above (we recommend [latest LTS version](https://nodejs.org/en/))
2.
    ```
    npm install gulp -g
    ```

### Node.js starting from 8.0
Execute the following command: `npm install --global --production windows-build-tools`

## Liquid reference

Liquid is the templating engine that powers Virto Commerce templates. Go to [Liquid documentation](https://virtocommerce.com/docs/vc2devguide/working-with-storefront/theme-development/liquid-reference).


## Bundling & minification

*Main article: [bundling & minification on virtocommerce.com/docs](https://virtocommerce.com/docs/vc2devguide/working-with-storefront/theme-development/bundling-and-minification)*

Bundling is a technique you can use to improve request load time. Bundling improves load time by reducing the number of requests to the server (assets such as CSS and JavaScript will be combined to single file per file format).

### How bundling and minification works

#### How to add bundle to layout

```
{% raw %}{{ 'bundle/scripts.js' | static_asset_url | append_version | script_tag }}{% endraw %}
```
  * **static_asset_url** means that this file is static content of site
  * **script_tag** or **stylesheet_tag** will generate
    ```
    <script ... >
    ```
    or
    ```
    <link rel="stylesheet" ... >
    ```
  * **append_version** is used to correctly invalidate browser cache for bundles. It calculate hash of file and append it as part of query string in url. Make sure that it's added after **static_content_url** (or other url filter), not after **script_tag**, **stylesheet_tag** (or other html tags).

#### Bundling and minification process workflow

When you run the **default** task to bundle & minify theme, the following happens:
1. ESLint runs and output warnings and errors in javascript code.
2. Javascript minifies and source maps generates.
3. CSS processes by [Autoprefixer](https://github.com/postcss/autoprefixer) with [the following browsers support](https://virtocommerce.com/docs/vc2userguide/what-is-commerce-manager/minimum-requirements) (documentation may be sometimes outdated; browser versions specified in gulpfile then specified in docs, not vice versa).
4. CSS minifies and source maps generates.

![Bundling and minification flowchart](https://user-images.githubusercontent.com/6369252/29952970-3b946cba-8ee6-11e7-8f15-55e4123c0da7.png "Bundling and minification flowchart")

### IDE configuration

#### Visual Studio (any version)

Bundling & minification will work automatically when you save file and on build.

#### Visual Studio Code

Bundling & minification will work automatically on build. If you want to automatically bundle & minify files on save, please, install & configure [Blade Runnner](https://marketplace.visualstudio.com/items?itemName=yukidoi.blade-runner) Visual Studio Code extension.

#### Other editors

Run
```
gulp watch
```
on command line if you want to bundle & minify files on save or run
```
gulp default
```
manually when you need to bundle & minify theme files.

### Tips & tricks

**Attention:** while theme including **bundlesconfig.json** file, you *must not* use [Bundler & Minifier](https://marketplace.visualstudio.com/items?itemName=MadsKristensen.BundlerMinifier) Visual Studio extension with theme. We're using gulp to bundle & minify files on theme, because it support a lot of possible customizations and has a plugins for css minification and correct source maps generation. Wrong source map generation and lack of css minification is a primary reason why we do not use Bundler & Minifier extension in Visual Studio.

**Tip:** if bundling & minification failed, you, probably, need to run gulp **watch** task manually after that. In Visual Studio, go to **Task Runner Explorer** and click **Run** on task **watch**. In Visual Studio Code go to **Command Palette (Ctrl+Shift+P)** and type
```
task watch
```
then press **Enter**.

The following gulp tasks available to you: 
1. **default**: default task. Bundles and minifies theme files.
2. **clean**: removes bundled & minified files.
3. **lint**: runs **eslint** to check for warnings & errors in javascript files. Look at [eslint site](https://eslint.org/) for details.
4. **min** and **min:js**, **min:css**, **min:html**: minify all or specified types of files.
6. **watch**: watching to any changes on bundled & configuration files and update bundles when any change occurs.
7. **compress**: creates zip package with all needed files to deploy theme on storefront.

## How to localize theme

*Main article: [how to localize theme on virtocommerce.com/docs](https://virtocommerce.com/docs/vc2devguide/working-with-storefront/theme-development/bundling-and-minification)*

### Adding new translation to theme

Storefront theme localization is very similar to [VirtoCommerce Platform localization](https://virtocommerce.com/docs/vc2devguide/working-with-platform-manager/localization-implementation). Check it for details on working with translation files.

1. Make a copy of &lt;*theme repository location*&gt;\locales\en.default.json file 
2. Rename the copied file to begin with your needed language 2 letter code (e.g., "es.default.json"). 
3. Translate the file content.

### Adding new language to store
1. Open your store in VirtoCommerce Platform ( **More → Browse → Stores → &lt;*your store*&gt;** ).
2. Check whether your language exists in the "Additional languages" available values list or add it in case it's missing:
![How to add language to store](https://user-images.githubusercontent.com/6369252/30009896-332f7838-9145-11e7-92c1-2c0c19b61bc6.gif "How to add language to store")


# License
Copyright (c) Virto Solutions LTD.  All rights reserved.

Licensed under the Virto Commerce Open Software License (the "License"); you
may not use this file except in compliance with the License. You may
obtain a copy of the License at

http://virtocommerce.com/opensourcelicense

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
implied.
