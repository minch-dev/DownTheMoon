"use strict";
/* globals module, test, asyncTest, checkExports, equal, notEqual, strictEqual, deepEqual, arrayEqual, ok, throws */
module("support/textlinks.js");

test("exports", function() {
	checkExports("support/textlinks", ["getTextLinks", "FakeLink"]);
});

test("regular", function() {
	var {getTextLinks} = require("support/textlinks");
	deepEqual(getTextLinks("http://downthemoon.nope/"), ["http://downthemoon.nope/"]);
	deepEqual(getTextLinks("https://downthemoon.nope/"), ["https://downthemoon.nope/"]);
	deepEqual(getTextLinks("ftp://downthemoon.nope/"), ["ftp://downthemoon.nope/"]);
	deepEqual(getTextLinks("http://localhost/"), ["http://localhost/"]);
	deepEqual(getTextLinks("ftp://localhost/"), ["ftp://localhost/"]);
	deepEqual(getTextLinks("http://127.0.0.1/"), ["http://127.0.0.1/"]);
	deepEqual(getTextLinks("ftp://127.0.0.1/"), ["ftp://127.0.0.1/"]);
	deepEqual(getTextLinks("http://localhost/somefile.ext"), ["http://localhost/somefile.ext"]);
});

test("www", function() {
	var {getTextLinks} = require("support/textlinks");
	deepEqual(getTextLinks("www.downthemoon.nope"), ["http://www.downthemoon.nope/"]);
	deepEqual(getTextLinks("downthemoon.nope/"), []);
});

test("hxp", function() {
	var {getTextLinks} = require("support/textlinks");
	deepEqual(getTextLinks("hp://downthemoon.nope/"), ["http://downthemoon.nope/"]);
	deepEqual(getTextLinks("hxp://downthemoon.nope/"), ["http://downthemoon.nope/"]);
	deepEqual(getTextLinks("hxxp://downthemoon.nope/"), ["http://downthemoon.nope/"]);
	deepEqual(getTextLinks("hxxxps://downthemoon.nope/"), ["https://downthemoon.nope/"]);
	deepEqual(getTextLinks("fxp://downthemoon.nope/"), ["ftp://downthemoon.nope/"]);
});

test("$", function() {
	var {getTextLinks} = require("support/textlinks");
	deepEqual(
		getTextLinks("www.example.com/folder$file1\nwww.example.com/folder$file2"),
		["http://www.example.com/folder$file1", "http://www.example.com/folder$file2"]
	);
});

test("3dots", function() {
	var {getTextLinks} = require("support/textlinks");
	deepEqual(getTextLinks("http://downthemoon.nope/crop...ped"), []);
	deepEqual(getTextLinks("http://downthemoon.nope/crop.....ped"), []);
});

test("sanitize", function() {
	var {getTextLinks} = require("support/textlinks");
	deepEqual(getTextLinks("<http://downthemoon.nope/>"), ["http://downthemoon.nope/"]);
	deepEqual(getTextLinks("http://downthemoon.nope/#foo"), ["http://downthemoon.nope/"]);
	deepEqual(getTextLinks("<http://downthemoon.nope/#foo>"), ["http://downthemoon.nope/"]);
});

test("FakeLink", function() {
	var {FakeLink} = require("support/textlinks");
	var l = new FakeLink("http://downthemoon.nope/");
	equal(l.href, "http://downthemoon.nope/", "href");
	equal(l.toString(), "http://downthemoon.nope/", "toString");
	strictEqual(l.title, undefined, "title1");
	deepEqual(l.childNodes, [], "childNodes");
	equal(typeof l.hasAttribute, "function", "hasAttribute");
	equal(l.hasAttribute("foo"), false, "hasAttribute foo");
	equal(l.hasAttribute("href"), true, "hasAttribute href");
	equal(l.hasAttribute("title"), false, "hasAttribute title");

	equal(typeof l.getAttribute, "function", "hasAttribute");
	equal(l.getAttribute("href"), l.href, "getAttribute href");

	l = new FakeLink("http://downthemoon.nope/", "title");
	equal(l.hasAttribute("title"), true, "hasAttribute title2");
	equal(l.getAttribute("title"), l.title, "getAttribute title");
});
