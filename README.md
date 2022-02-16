DownThemAll! XUL Edition
==================
(The first and only download manager/accelerator built inside Firefox!)

This is a fork of the latest XUL (Non-WebExtension) pre-release version from 2017 that supports setting original file modified date of a downloaded file. A few features are added in this version, it supports custom "x-archive-orig-last-modified" http header property of WebArchive.org as date modified, also it extends import/export functionality for download lists (allows to specify/export/import local download path), and finally allows to replicate remote website's directory structure (not yet in every dialogue window, they are so many, jeez).

You can run this extension in Firefox ESR 52.x, Firefox up to 56.x, Basilisk, SeaMonkey and PaleMoon up to 29.1.1, also Waterfox.

Installation
-------------------
Since the extension cannot be possibly signed at this point of XUL deprecation process, we need to allow a browser(e.g. FF ESR 52) to load unsigned extensions.
Open `about:config`, find `xpinstall.signatures.required` and switch it to `false`. Now you can download the .xpi from `releases` section and install it.

The other method is to install unpacked extension via `about:debugging#addons`. Download the source code as zip, unzip it somewhere, press `Load Temporary Add-on` button, locate your unpacked extension and choose `install.rdf` file.
The only downside to this is that it only lasts one session, so you have to manually load it each time browser starts.

The legacy text below is still relevant, but not maintaned.
==================

Developing
-------------------

https://developer.mozilla.org/en-US/docs/Setting_up_extension_development_environment
Just clone the repository and use an extension proxy file. No additional build step required.

- Pull requests welcome. By submitting code you agree to license it under MPL v2 unless explicitly specified otherwise. 
- Please stick to the general coding style.
- Please also always add unit tests for all new js modules and new module functions.
- Unit tests for UI (overlays) aren't required at the moment, but welcome. There is currently no infrastructure to run those, though.

Building an XPI
-------------------

See `make.py`.

Important bits of code
-------------------

- `modules/glue.jsm` - This is basically the main module, also specifying the general environment for all modules and window scopes.
- `modules/main.js` - General setup.
- `modules/loaders/` - "overlay" scripts. Different to traditional Firefox add-ons, DownThemAll! does not use real overlays and overlay scripts, but kind of simulates overlays via modules.
- `chrome/content/` - UI. Right now, due to historical reasons and some too-tight coupling the UI JS also contains some of the important data structures such as `QueueItem` (representing a single queued download)

- Please note that being restartless requires code to clean up after itself, i.e. if you modify something global you need to reverse the modifications when the add-on is unloaded. See `unload()`and `unloadWindow()` (in glue.jsm and/or support/overlays.js)
- Please make use of the niceties Firefox JS (ES6) and of the global helpers from glue.jsm, in particular:
  - `for of` loops
  - Sets and (weak) maps
  - generators
  - comprehensions and destructoring assignment
  - `Object.freeze()`, `Object.defineProperties()`, etc.
  - `log()`
  - `lazy()`/`lazyProto()`
  - `Services` and `Instances`
