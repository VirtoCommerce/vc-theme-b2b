# Default theme for VirtoCommerce Storefront

_Default theme_ for VirtoCommerce Storefront used by _Electronics_ sample store. It includes the largest number of features and support latest updates of Storefront so it always stay actual.

![Default theme UI](https://user-images.githubusercontent.com/6369252/29491392-ef411564-8573-11e7-813c-7c56394ac19e.png)

## Getting started

1. Install [prerequisites](#prerequisites).
2. Clone repo.
    1. In Visual Studio, go to `Team Explorer` → `Clone` → Enter https://github.com/VirtoCommerce/vc-default-theme.git as URL and `D:\vc-default-theme` (for example) as path.
    2. Or execute command `git clone https://github.com/VirtoCommerce/vc-default-theme.git "D:\vc-default-theme"` (where `D:\vc-default-theme` is path to folder where you want to clone repo).
3. Link you theme repo to store. Execute `mklink /d "C:\vc-platform-master\VirtoCommerce.Platform.Web\App_Data\cms-content\Electronics\default" "D:\vc-default-theme"` (where `C:\vc-platform-master\VirtoCommerce.Platform.Web\App_Data\cms-content` is path to cms-content folder, which you configured on storefront installation in prerequisites step, `Electronics` is your store name and `D:\vc-default-theme` is path to your theme repo). Restart IIS or storefront IIS application pool after that.
4. Open theme folder in your IDE
    1. In Visual Studio 2017 or Visual Studio Code, go to `File` → `Open` → `Folder`
    2. In Visual Studio 2013 and 2015 go to  `File` → `Open` → `Website`
    3. Select `D:\vc-default-theme` (where `D:\vc-default-theme` is path to folder where you want to clone repo) and open it.
 5. Install node.js dependencies.
    1. Visual Studio 2017 has [a bug](https://developercommunity.visualstudio.com/content/problem/100645/visual-studio-2017-does-not-restore-nodejs-modules.html), which prevent it from correctly restoring Node.js packages on project open. To fix that, you may make any changes in `package.json` (write  a whitespace) and save it, after that node.js dependencies will be installed in a few minutes. Or you may execute `cd "D:\vc-default-theme"` and then `C:\Program Files (x86)\nodejs\node.exe install` (on Windows 64-bit) or `C:\Program Files\nodejs\node.exe install` (on 32-bit Windows).
    2. In Visual Studio 2013, 2015 all dependencies will be installed automatically. Just wait a few minutes.
    3. In Visual Studio Code and other editors, you need to run `npm install`to install Node.js dependencies.

## Prerequisites

### Storefront

You need to have local installation of storefront. Follow [this article](https://virtocommerce.com/docs/vc2devguide/deployment/storefront-deployment/storefront-source-code-getting-started) step-by-step to install storefront from binaries or source code.

**Note:** Currently we're in process of moving default theme to separate repository and bundles updating. So you need to install storefront from `dev` branch. Follow the article above to learn how.

### Visual Studio 2015.3 and above (up to Visual Studio 2017.3 at least)

If you have Visual Studio 2015 with Update 3 and above, you don't need install any prerequisites. Latest versions of Node.js and Gulp already included in your Visual Studio installation and supported in built-in Task Runner Explorer.

### Visual Studio from 2015 up to 2015.2

Task Runner Explorer, Node.js and Gulp already included in your Visual Studio installation. However, you need update your Node.js to at least 4.0.0.
1. Update Node.js to v4.0.0 at least (we recommend [latest LTS version](https://nodejs.org/en/)). Use `C:\Program Files\nodejs` installation path (change `Program Files` to `Program Files (x86)` on 64-bit machine).
2. Add Node.js installation path to External Web Tools or move $(PATH) to top: ![External Web Tools](https://user-images.githubusercontent.com/6369252/29498917-038ce010-861f-11e7-9a23-3c4f9e96d6b7.png)

### Visual Studio from 2013.3 up to 2013.5

You need install:
1. [Task Runner Explorer](https://marketplace.visualstudio.com/items?itemName=MadsKristensen.TaskRunnerExplorer) Visual Studio extension
2. Install Node.js v4.0.0 or above (we recommend [latest LTS version](https://nodejs.org/en/))
3. `npm install gulp -g`

### Visual Studio Code and other editors

1. Install Node.js v4.0.0 or above (we recommend [latest LTS version](https://nodejs.org/en/))
2. `npm install gulp -g`

## Bundling & minification


**Attention:** while theme including `bundlesconfig.json` file, you *must not* use [Bundler & Minifier](https://marketplace.visualstudio.com/items?itemName=MadsKristensen.BundlerMinifier) Visual Studio extension with theme. See `Appendix: bundling & minification process workflow` for details about why.

### Visual Studio (any version)

Bundling & minification will work automatically when you save file and on build.

Tip: if bundling & minification failed, you, probably, need to run gulp `watch` task manually after that. Go to `Task Runner Explorer` (in Visual Studio) and click `Run` on task `watch`.

### Visual Studio Code

Bundling & minification will work automatically on build. If you want to automatically bundle & minify files on save, please, install & configure [Blade Runnner](https://marketplace.visualstudio.com/items?itemName=yukidoi.blade-runner) Visual Studio Code extension.

Tip: if bundling & minification failed, you, probably, need to run gulp `watch` task manually after that. Go to `Command Palette (Ctrl+Shift+P)` and type `task watch` then press Enter.

### Other editors

Run `gulp watch` on command line if you want to bundle & minify files on save or run `gulp default` manually when you need to bundle & minify theme files.

### How to add bundle to layout

Just include bundle as static content using `static_asset_url` and `script_tag` or `stylesheet_tag`. To correctly invalidate browser cache for bundles, use `append_version` tag after `static_content_url`.

## Appendix: List of available tasks

1. `default`: default task. Bundles and minifies theme files.
2. `clean`: removes bundled & minified files.
3. `lint`: runs `eslint` to check for warnings & errors in javascript files. Look at [eslint site](https://eslint.org/) for details.
4. `min` and `min:js`, `min:css`, `min:html`: minify all or specified types of files.
6. `watch`: watching to any changes on bundled & configuration files and update bundles when any change occurs.
7. `compress`: creates zip package with all needed files to deploy theme on storefront.

## Appendix: Bundling & minification process workflow

We're using gulp to bundle & minify files on theme, because it support a lot of possible customizations and has a plugins for css minification and correct source maps generation. Wrong source map generation and lack of css minification is a primary reason why we do not use Bundler & Minifier extension in Visual Studio.

When you run the `default` task to bundle & minify theme, the following happens:
1. ESLint runs and output warnings and errors in javascript code.
2. Javascript minifies and source maps generates.
3. CSS processes by [Autoprefixer](https://github.com/postcss/autoprefixer) with [the following browsers support](https://virtocommerce.com/docs/vc2userguide/what-is-commerce-manager/minimum-requirements) (documentation may be sometimes outdated; browser versions specified in gulpfile then specified in docs, not vice versa).
4. CSS minifies and source maps generates.

# License
Copyright (c) Virtosoftware Ltd.  All rights reserved.

Licensed under the Virto Commerce Open Software License (the "License"); you
may not use this file except in compliance with the License. You may
obtain a copy of the License at

http://virtocommerce.com/opensourcelicense

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
implied.
