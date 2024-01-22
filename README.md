DownTheMoon! XUL Edition
==================
Probably the first and only download manager/accelerator built inside Pale Moon!
-------------------

`Logo is not ready yet, so there are generic empty arrows in place for now. I can't use the original branded graphics according to the license, so I have to come up with my own before release.`

This fork is a direct continuation of the original XUL-based DownThemAll! extension. It's an update of the last upstream pre-release 3.1.1pre version from 2017. Until recently XUL version was unique in it's ability to preserve original `date modified` timestamps of downloaded files. I've changed extension ID and all settings' names, so it works without conflicts alongside other forks. A few features were added in this version:
- preserves original timestamps on any files from WebArchive.org by taking 'em from "x-archive-orig-last-modified" http header property (or "x-archive-orig-date" / "memento-datetime" when not available)
- allows to export/import relative local save paths from/to a download list
- allows to copy a remote website's directory structure (easier and with more options)
- allows to ignore the 'proxy' part and "www." part of the url while replicating
- differentiates between files without extension `\example` and folder indexes `\example\`, providing the correct `index.htm` name and local path.
- replaces illegal symbols with their full-width counterparts: 	：＊？＂＜＞｜
- checks if file exists before downloading it if conflict resolution is set to "skip"
- all of the above works in DTM OneClick mode via the most recent filter used (as expected)
- some UI/UX improvements been made like those ultra small non resizable dialogue windows are now less small and more resizable


You can run this extension in Pale Moon, Waterfox *Classic*, Basilisk, Firefox ESR 52.x & Firefox Developer Edition 56.x. Relevant version of Waterfox doesn't support XPCOM, so won't work. SeaMonkey needs some fixes, so maybe later.

Installation
==================
Pale Moon, Waterfox Classic, Basilisk
-------------------

Simply download (https://github.com/minch-dev/DownTheMoon/releases/download/latest/down-the-moon.xpi) and install .xpi file. As with any other extension these methods should work:
- right click .xpi file and choose `open with` -> [your browser]
- drag and drop .xpi file into a browser window
- at the `about:addons` page click ⚙️ -> `install from file`

Firefox ESR 52.x, Firefox Developer Edition 56.x
-------------------

Open `about:config`, find `xpinstall.signatures.required` and switch it to `false`. Now you can install an .xpi file using one of the aforementioned methods.

Firefox 56.x
-------------------

If `xpinstall.signatures.required` is not available, one can install an unpacked extension via `about:debugging#addons`, but only `for 1 session`. Download the source code as zip, unzip it somewhere, press `Load Temporary Add-on` button, locate your unpacked extension and choose `install.rdf` file.

SeaMonkey
-------------------

Not supported.

Waterfox
-------------------

Not supported. Only `Waterfox Classic` works.

Updates
==================

Updates are provided by an .xpi file hosted under `latest` release tag at github. You can conveniently smack that `Find updates` menu option or even turn on an autoupdate if you have enough courage :3.

The legacy text below might still be relevant, although it's not maintaned by me.
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
- `modules/loaders/` - "overlay" scripts. Different to traditional Firefox add-ons, DownTheMoon! does not use real overlays and overlay scripts, but kind of simulates overlays via modules.
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
