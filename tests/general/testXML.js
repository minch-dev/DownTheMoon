"use strict";
/* jshint browser:true */
/* global module, asyncTest, QUnit, ok */
module("XML");

asyncTest("verify that UI XML actually loads", function() {
	var files = [
								"about/about.xul",
								"common/bindings.xml",
								"dtm/addurl.xul",
								"dtm/manager-aero.xul",
								"dtm/manager.xul",
								"dtm/maskbutton.xml",
								"dtm/mirrors.xul",
								"dtm/select.xul",
								"dtm/manager/conflicts.xul",
								"dtm/manager/info.xul",
								"dtm/manager/manager.xul",
								"dtm/manager/metaselect.xul",
								"dtm/manager/tooltip.xul",
								"integration/elements.xul",
								"integration/saveas.xul",
								"integration/toolbarinstall.xul",
								"preferences/advPane.xul",
								"preferences/bindings.xml",
								"preferences/filtersPane.xul",
								"preferences/interfacePane.xul",
								"preferences/mainPane.xul",
								"preferences/prefs.xul",
								"preferences/privacyPane.xul",
								"preferences/schedulePane.xul",
								"preferences/serversPane.xul",
								"privacy/overlaySanitize191.xul",
								];
	const runNext = function runNext() {
		var file = files.pop();
		if (!file) {
			QUnit.start();
			return;
		}
		var req = new XMLHttpRequest();
		req.overrideMimeType("text/xml");
		req.open("GET", "chrome://dtm/content/" + file);
		req.onloadend = function() {
				runNext();
				ok(req.responseXML && req.responseXML.documentElement.localName !== "parsererror", file);
		};
		req.send();
	};
	runNext();
});
