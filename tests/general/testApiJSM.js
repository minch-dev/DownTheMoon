"use strict";
/* globals module, test, arrayEqual */
module("api.jsm");

test("exports", function() {
	arrayEqual(
			Object.keys(require("api")),
			Object.keys(requireJSM("chrome://dtm-modules/content/api.jsm"))
			);
});
