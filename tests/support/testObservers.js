"use strict";
/* globals module, test, asyncTest, expect, checkExports, QUnit, equal, strictEqual, deepEqual, arrayEqual, ok */
/* globals throws, notThrows*/
module("support/observers.js");

test("exports", function() {
	checkExports("support/observers", ["add", "addExit", "remove", "removeExit", "topics", "notify", "notifyLocal"]);
});

test("plain", function() {
	var obs = require("support/observers");
	var i = 0;
	var o = function(s, t, d) {
		++i;
	};
	var topics = obs.topics;
	obs.add(o, "dtm-test-topic");
	topics.push("dtm-test-topic");
	arrayEqual(obs.topics, topics, topics);
	topics.length -= 1;

	obs.notify(null, "dtm-test-topic", null);

	obs.remove(o, "dtm-test-topic");
	arrayEqual(obs.topics, topics, topics);

	// must not be observed
	obs.notify(null, "dtm-test-topic", null);

	strictEqual(i, 1);
});

test("observer", function() {
	var obs = require("support/observers");
	var i = 0;
	var o = {
		observe: function(s, t, d) {
			++i;
		}
	};
	var o2 = {
			observe: function(s, t, d) {
				++i;
			}
	};
	var topics = obs.topics;
	obs.add(o, "dtm-test-topic");
	obs.add(o2, "dtm-test-topic");
	topics.push("dtm-test-topic");
	arrayEqual(obs.topics, topics, topics);
	topics.length -= 1;

	Services.obs.notifyObservers(null, "dtm-test-topic", null);
	obs.remove(o, "dtm-test-topic");
	topics.push("dtm-test-topic");
	arrayEqual(obs.topics, topics, topics);
	topics.length -= 1;
	obs.remove(o2, "dtm-test-topic");
	arrayEqual(obs.topics, topics, topics);

	// must not be observed
	Services.obs.notifyObservers(null, "dtm-test-topic", null);

	strictEqual(i, 2);
});

test("notify/Local", function() {
	var obs = require("support/observers");
	var i = 0;
	var og = {
			observe: function(s, t, d) {
				++i;
			}
	};
	var ol = {
			observe: function(s, t, d) {
				++i;
			}
	};

	obs.add(ol, "dtm-test-topic");
	Services.obs.addObserver(og, "dtm-test-topic", false);

	obs.notify(null, "dtm-test-topic", null);
	obs.notifyLocal(null, "dtm-test-topic", null);

	obs.remove(ol, "dtm-test-topic");
	Services.obs.removeObserver(og, "dtm-test-topic");

	obs.notify(null, "dtm-test-topic", null);
	obs.notifyLocal(null, "dtm-test-topic", null);

	strictEqual(i, 3);
});

test("errors", function() {
	var obs = require("support/observers");
	throws(() => obs.add());
	throws(() => obs.add(null));
	throws(() => obs.add(null, null));
	throws(() => obs.add(function() {}, null));
	throws(() => obs.remove());
	throws(() => obs.remove(null));
	throws(() => obs.remove(null, null));
	throws(() => obs.remove(function() {}, null));
	notThrows(() => obs.remove({}, "dtm-test-not-registered"));
});

test("exceptions", function() {
	function e() {
		throw new Error("test");
	}
	var i = 0;
	var r = function r() {
		++i;
	};
	var obs = require("support/observers");
	notThrows(function badobserver() {
		obs.add(e, "dtm-test-topic");
		obs.add(r, "dtm-test-topic");
		obs.notify(null, "dtm-test-topic", null);
		obs.remove(e, "dtm-test-topic");
		obs.remove(r, "dtm-test-topic");
		obs.notify(null, "dtm-test-topic", null);
	});
	strictEqual(i, 1, "observed");
});
