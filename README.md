DownTheMoon! XUL Edition
==================
Probably the first and only download manager/accelerator built inside Pale Moon!
-------------------

This is a continuation of the original XUL-based DownThemAll! extension. It's an update of the last upstream pre-release 3.1.1pre version from 2017. XUL version is unique as it supports setting original file modified dates of downloaded files. I've changed extension id and all settings, so it should work alongside other forks. A few features were added in this version:
- takes "x-archive-orig-last-modified" http header property of WebArchive.org as file's modification date (or "x-archive-orig-date" / "memento-datetime" when not available)
- allows to export/import relative local save paths in a download list
- allows to copy a remote website's directory structure (easier and with more options)
- allows to ignore the 'proxy' part and "www." part of the url while replicating
- differentiates between files without extension `\example` and folder indexes `\example\`, providing the correct `index.htm` name and local path.
- replaces illegal symbols with their full-width counterparts: 	：＊？＂＜＞｜
- all of the above works in DTM OneClick mode via the most recent filter used (as expected)

You can run this extension in Pale Moon, Waterfox *Classic*, Basilisk, Firefox ESR 52.x & Firefox Developer Edition 56.x. _Live_ version of Waterfox kinda supports XUL, but not  XPCOM, so of no use for us. SeaMonkey needs some fixes, so maybe [later].
(Note that WebArchive's search results pages might not work in those Firefox versions though, that's a reoccuring issue with some of the webarchive's libraries, sometimes one of the components breaks the show for the older browsers)

Installation
==================
Pale Moon, Waterfox Classic, Basilisk
-------------------

Simply install .xpi from releases section of this page.

Firefox ESR 52.x, Firefox Developer Edition 56.x
-------------------

Open `about:config`, find `xpinstall.signatures.required` and switch it to `false`. Now you can download the .xpi from `releases` section and install it.

Firefox 56.x
-------------------

If `xpinstall.signatures.required` is not available, one can install an unpacked extension via `about:debugging#addons`, but only `for 1 session`. Download the source code as zip, unzip it somewhere, press `Load Temporary Add-on` button, locate your unpacked extension and choose `install.rdf` file.

SeaMonkey
-------------------

Not supported (yet).

Waterfox
-------------------

Live version is incompatible, use Waterfox Classic.



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
