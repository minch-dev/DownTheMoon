DownThemAll! XUL Edition
==================
(The first and only download manager/accelerator built inside Firefox!)
This is a fork of the latest XUL (Non-WebExtension) pre-release version from 2017 that supports setting original file modified date of a downloaded file. The only change in this version is an added feature to support custom "x-archive-orig-last-modified" http header property of WebArchive.org as downloaded file's date modified value
You can run this extension in Firefox ESR 52, Firefox 56, Basilisk and PaleMoon up to 29.1.1
Also usable in Waterfox, but it "has been sold to System1, a U.S. pay-per-click ad company", so proceed with caution

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
