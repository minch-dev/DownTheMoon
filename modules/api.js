/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/ */
"use strict";

const {MimeQuality} = require("utils");
const Preferences = require("preferences");
const {isWindowPrivate} = require("support/pbm");
const Mediator = require("support/mediator");
const Histories = require("support/historymanager");
const {SYSTEMSLASH,isString,addFinalSlash} = require("support/stringfuncs");

/* global FilterManager */
lazy(this, "FilterManager", () => require("support/filtermanager").FilterManager);

function _decodeCharset(text, charset) {
	let rv = text;
	try {
		if (!charset.length) {
			throw 'no charset';
		}
		rv = Services.ttsu.unEscapeURIForUI(charset || "UTF-8", text);
	}
	catch (oex) {
		try {
			rv = decodeURIComponent(text);
		}
		catch (ex) {
			log(LOG_INFO, "decodeCharset: failed to decode: " + text, oex);
		}
	}
	return rv;
}

class _URL {
	constructor(url, preference, _fast) {
		this.preference = preference || 100;

		if (!(url instanceof Ci.nsIURL)) {
			throw new Exception("You must pass a nsIURL");
		}
		if (!_fast && _URL.schemes.indexOf(url.scheme) === -1) {
			throw new Exception("Not a supported URL");
		}

		this._url = url.clone();
		if (!_fast) {
			let hash = exports.getLinkPrintHash(this._url);
			this._url.ref = '';
			if (hash) {
				this.hash = hash;
			}
		}
		lazy(this, "urlCharset", this._getCharset);
		lazy(this, "spec", this._getSpec);
		lazy(this, "usable", this._getUsable);
	}

	_getCharset() {
		return this._url.originCharset;
	}
	_getSpec() {
		return this._url.spec;
	}
	_getUsable() {
		return _decodeCharset(this.spec, this._urlCharset || '');
	}

	get url() {
		return this._url;
	}
	toJSON() {
		return {
			url: this.spec,
			charset: this.urlCharset,
			preference: this.preference
		};
	}

	toString() {
		return this.usable;
	}
};
_URL.schemes = ['http', 'https', 'ftp', 'data'];
exports.URL = Object.freeze(_URL);

/**
 * Checks if a provided strip has the correct hash format Supported are: md5,
 * sha1, sha256, sha384, sha512
 *
 * @param hash
 *          Hash to check
 * @return hash type or null
 */
const SUPPORTED_HASHES = Object.freeze({
	'MD5': {l: 32, q: 0.3 },
	'SHA1': {l: 40, q: 0.4 },
	'SHA256': {l: 64, q: 1 },
	'SHA384': {l: 96, q: 0.8 },
	'SHA512': {l: 128, q: 1 }
});
exports.SUPPORTED_HASHES = Object.freeze(SUPPORTED_HASHES);
const SUPPORTED_HASHES_ALIASES = Object.freeze({
	'MD5': 'MD5',
	'MD-5': 'MD5',
	'SHA1': 'SHA1',
	'SHA': 'SHA1',
	'SHA-1': 'SHA1',
	'SHA256': 'SHA256',
	'SHA-256': 'SHA256',
	'SHA384': 'SHA384',
	'SHA-384': 'SHA384',
	'SHA512': 'SHA512',
	'SHA-512': 'SHA512'
});
exports.SUPPORTED_HASHES_ALIASES = Object.freeze(SUPPORTED_HASHES_ALIASES);
exports.WANT_DIGEST_STRING = (function() {
	let rv = new MimeQuality();
	for (let h of ["MD5", "SHA", "SHA1", "SHA256", "SHA512"]) {
		let q = SUPPORTED_HASHES[SUPPORTED_HASHES_ALIASES[h]].q;
		rv.add(h, q);
	}
	return rv.toString();
})();

class Hash {
	constructor(hash, type) {
		if (typeof(hash) !== 'string' && !(hash instanceof String)) {
			throw new Error("hash is invalid");
		}
		if (typeof(type) !== 'string' && !(type instanceof String)) {
			throw new Error("hashtype is invalid");
		}

		type = type.toUpperCase().replace(/[\s-]/g, '');
		if (!(type in SUPPORTED_HASHES_ALIASES)) {
			throw new Error("hashtype is invalid: " + type);
		}
		this.type = SUPPORTED_HASHES_ALIASES[type];
		this.sum = hash.toLowerCase().replace(/\s/g, '');
		let h = SUPPORTED_HASHES[this.type];
		if (h.l !== this.sum.length || isNaN(parseInt(this.sum, 16))) {
			throw new Error("hash is invalid");
		}
		this._q = h.q;
	}

	get q() {
		return this._q;
	}

	toString() {
		return `[Hash(${this.type}, ${this.sum})]`;
	}

	toJSON() {
		return {
			type: this.type,
			sum: this.sum
		};
	}
}
exports.Hash = Object.freeze(Hash);

/**
 * Collection of hashes (checksums) about a single download
 * @param fullHash Full hash covering the whole download
 */
class HashCollection {
	constructor(fullHash) {
		if (!(fullHash instanceof Hash)) {
			throw new Error("Cannot init empty HashCollection");
		}
		this.full = fullHash;
		this.parLength = 0;
		this.partials = [];
		this._serialize();
	}

	/**
	 * Load HashCollection from a serialized object
	 * @see serialize
	 * @param obj (object) Serialized object
	 */
	static load(obj) {
		let rv = new HashCollection(new Hash(obj.full.sum, obj.full.type));
		rv.parLength = obj.parLength || 0;
		for (let e of obj.partials) {
			rv.add(new Hash(e.sum, e.type));
		}
		rv._serialize();
		return rv;
	}

	/**
	 * HashCollection has parital hashes
	 */
	get hasPartials() {
		return !!this.partials.length;
	}

	add(hash) {
		if (!(hash instanceof Hash)) {
			throw new Exception("Must supply hash");
		}
		this.partials.push(hash);
		this._serialize();
	}

	/**
	 * Serializes HashCollection
	 * @return (object) Serialized HashCollection
	 */
	toJSON() {
		return this._serialized;
	}
	_serialize() {
		this._serialized = {
			full: this.full,
			parLength: this.parLength,
			partials: this.partials
		};
	}

	toString() {
		return `[HashCollection(${this.toJSON()})]`;
	}
}
exports.HashCollection = Object.freeze(HashCollection);

const _rglph = /^hash\((md5|sha(?:-?(?:1|256|384|512))?):([\da-f]+)\)$/i;
/**
 * Get a link-fingerprint hash from an url (or just the hash component)
 *
 * @param url.
 *          Either String or nsIURI
 * @return Valid hash string or null
 */
exports.getLinkPrintHash = function getLinkPrintHash(url) {
	if (!(url instanceof Ci.nsIURL)) {
		return null;
	}
	var lp = url.ref.match(_rglph);
	if (lp) {
		try {
			return new Hash(lp[2], lp[1]);
		}
		catch (ex) {
			// pass down
		}
	}
	return null;
};

/**
 * Get a link-fingerprint metalink from an url (or just the hash component
 *
 * @param url.
 *          Either String or nsIURI
 * @param charset.
 *          Optional. Charset of the orgin link and link to be created
 * @return Valid hash string or null
 */
exports.getLinkPrintMetalink = function getLinkPrintMetalink(url) {
	if (!(url instanceof Components.interfaces.nsIURL)) {
		return null;
	}
	let lp = url.ref.match(/^!meta(?:link)?(?:3|4)!(.+)$/);
	if (lp) {
		let rv = lp[1];
		try {
			return new _URL(Services.io.newURI(rv, url.originCharset, url)).url;
		}
		catch (ex) {
			// not a valid link, ignore it.
		}
	}
	return null;
};

exports.getProfileFile = (function() {
	let _profile = Services.dirsvc.get("ProfD", Ci.nsIFile);
	_profile.append("downthemoon.nope");
	return function getProfileFile(fileName, createDir) {
		var file = _profile.clone();
		file.append(fileName);
		if (createDir) {
			if (!file.parent.exists()) {
				file.parent.create(file.DIRECTORY_TYPE, 0o755);
			}
			else {
				try {
					// make sure the data directory has the correct permissions
					file.parent.permissions = 0o755;
				}
				catch (ex) {
				}
			}
		}
		return file;
	};
})();

/*
 * Get all folder params and compose local save path accordingly
 * 
 * This is a previous take on remote structure replication
 * it's mostly obsolete now
 * DirSaveMeta should still work though
 * 
*/
//dirSaveDefault,dirSaveMeta,ignoreDirSaveMeta

exports.getDirSavePath = function getDirSavePath(_){
	let dirSaveDefault  = addFinalSlash(_.dirSaveDefault);
	let dirSaveMeta = isString(_.dirSaveMeta) ? _.dirSaveMeta.trim() : '';
	let ignoreDirSaveMeta = !!_.ignoreDirSaveMeta;
	
	let dirSave = '';
	if(ignoreDirSaveMeta || !dirSaveMeta){
		dirSave = dirSaveDefault;
	} else {
		dirSaveMeta = addFinalSlash(dirSaveMeta);
		if(dirSaveMeta.indexOf('.')==0 || dirSaveMeta.indexOf('..')==0){
			//it's subfolder
			dirSave = dirSaveDefault+dirSaveMeta;
		} else {
			dirSave = dirSaveMeta;
		}
	}
	return dirSave;
};

exports.formatFilter = function formatFilter(_){
	let filter = _.filter;
	let copyDirTree = !!_.copyDirTree;
	let ignoreProxyPath = !!_.ignoreProxyPath;
	let ignoreWWW = !!_.ignoreWWW;
	let addURLparams = !!_.addURLparams;
	let formatFilter = !!_.formatFilter;
	
	let hasSite = filter.indexOf('*site') == -1 ? false : true;
	let hasDirs = filter.indexOf('*subdirs') == -1 ? false : true;
	let needSite = hasSite || (!hasSite && !hasDirs);
	let needDirs = hasDirs || (!hasSite && !hasDirs);
	
	filter = filter
		.replace(/\*site[a-z]*\*/gi,'')
		.replace(/\*subdirs[a-z]*\*/gi,'')
		.replace(/\*url\*/gi,'');
	if(filter.indexOf('*curl*')!=-1){
		filter = filter.replace(/\*curl\*/gi,'*filename*');
	}
	
	if(copyDirTree){
		let prepend = '';
		if(ignoreProxyPath){
			if(needSite){
				if(ignoreWWW){
					prepend = '*sitenoproxynowww*';
				} else {
					prepend = '*sitenoproxy*';
				}
			}
			if(needDirs){
				prepend += '*subdirsnoproxy*';
			}
		} else {
			if(needSite){
				if(ignoreWWW){
					prepend = '*sitenowww*';
				} else {
					prepend = '*site*';
				}
			}
			if(needDirs){
				prepend += '*subdirs*';
			}
		}

		filter = prepend + filter;
		
	}
    if(addURLparams){
		let append = '';
		if(filter.indexOf('*qstring*')==-1){
			if(filter.indexOf('*qmark*')==-1){
				append = '*qmark*';
			}
			append += '*qstring*';
		}
        filter = filter + append;
    } else {
        filter = filter
		.replace(/\*qmark*\*/gi,'')
		.replace(/\*qstring*\*/gi,'');
    }
	return filter;
}

exports.composeURL = function composeURL(doc, rel) {
	// find <base href>
	let base = doc.location.href;
	let bases = doc.getElementsByTagName('base');
	for (var i = 0; i < bases.length; ++i) {
		if (bases[i].hasAttribute('href')) {
			base = bases[i].getAttribute('href');
			break;
		}
	}
	return Services.io.newURI(rel, doc.characterSet, Services.io.newURI(base, doc.characterSet, null));
};

exports.getRef = function getRef(doc) {
	try {
		log(LOG_DEBUG, "getting ref for" + doc.URL);
		return (new _URL(Services.io.newURI(doc.URL, doc.characterSet, null))).url.spec;
	}
	catch (ex) {
		let b = doc.getElementsByTagName('base');
		for (let i = 0; i < b.length; ++i) {
			if (!b[i].hasAttribute('href')) {
				continue;
			}
			try {
				return exports.composeURL(doc, b[i].getAttribute('href')).spec;
			}
			catch (e) {
				continue;
			}
		}
	}
};

exports.getDropDownValue = function getDropDownValue(name, isPrivate) {
	let values = Histories.getHistory(name, isPrivate).values;
	return values.length ? values[0] : '';
};

exports.setPrivateMode = function setPrivateMode(window, items) {
	const ip = isWindowPrivate(window);
	for (let i of items) {
		i.isPrivate = ip;
	}
	return items;
};

exports.saveSingleItem = function saveSingleItem(window, turbo, item) {
	if (turbo) {
		exports.turboSendLinksToManager(window, [item]);
		return;
	}

	// else open addurl.xul
	window = window || Mediator.getMostRecent();
	window.openDialog(
		"chrome://dtm/content/dtm/addurl.xul",
		"_blank",
		"chrome, centerscreen, resizable=yes, dialog=no, all, modal=no, dependent=no",
		item
	);
};

exports.sendLinksToManager = function sendLinksToManager(window, start, links) {
	exports.openManager(window, false, function(win) {
		win.startDownloads(start, links);
	});
};

function somePrivate(e) {
	return e.isPrivate;
}

exports.turboSendLinksToManager = function turboSendLinksToManager(window, urlsArray) {
	let isPrivate = urlsArray.some(somePrivate);
	let dir = exports.getDropDownValue('directory', isPrivate);
	let mask = exports.getDropDownValue('renaming', isPrivate);

	if (!mask || !dir) {
		throw new Exception("missing required information");
	}

	let num = null;

	for (let u of urlsArray) {
		u.mask = mask;
		u.dirSave = dir;
		u.numIstance = u.numIstance || (num === null ? num = exports.incrementSeries() : num);
	}

	exports.sendLinksToManager(window, !Preferences.getExt("lastqueued", false), urlsArray);
};

exports.saveLinkArray = function saveLinkArray(window, urls, images, error) {
	if (!urls.length && !images.length) {
		throw new Exception("no links");
	}
	window = window || Mediator.getMostRecent();
	window.openDialog(
		"chrome://dtm/content/dtm/select.xul",
		"_blank",
		"chrome, centerscreen, resizable=yes, dialog=no, all, modal=no, dependent=no",
		urls,
		images,
		error
	);
};

exports.turboSaveLinkArray = function turboSaveLinkArray(window, urls, images, callback) {
	FilterManager.ready(function() {
		try {
			if (!urls.length && !images.length) {
				throw new Exception("no links");
			}
			log(LOG_INFO, "turboSaveLinkArray(): DtmOneClick filtering started");

			let links;
			let type;
			if (Preferences.getExt("seltab", 0)) {
				links = images;
				type = 2;
			}
			else {
				links = urls;
				type = 1;
			}

			let fast = null;
			let isPrivate = urls.some(somePrivate) || images.some(somePrivate);
			try {
				fast = FilterManager.getTmpFromString(exports.getDropDownValue('filter', isPrivate));
			}
			catch (ex) {
				// fall-through
			}
			links = links.filter(function(link) {
				if (fast && (fast.match(link.url.usable) || fast.match(link.description))) {
					return true;
				}
				return FilterManager.matchActive(link.url.usable, type);
			});

			log(LOG_INFO, "turboSaveLinkArray(): DtmOneClick has filtered " + links.length + " URLs");

			if (!links.length) {
				throw new Exception('no links remaining');
			}
			exports.turboSendLinksToManager(window, links);
			if (callback) {
				callback(links.length > 1 ? links.length : links[0]);
			}
		}
		catch (ex) {
			log(LOG_DEBUG, "turboSaveLinkArray", ex);
			if (callback) {
				callback();
			}
		}
	});
};

var isManagerPending = false;
var managerRequests = [];

// jshint -W003
function openManagerCallback(event) {
	log(LOG_DEBUG, "manager ready; pushing queued items");
	event.target.removeEventListener("DTM:dieEarly", openManagerDiedCallback, true);
	event.target.removeEventListener("DTM:ready", openManagerCallback, true);
	for (let cb of managerRequests) {
		cb(event.target);
	}
	managerRequests.length = 0;
	isManagerPending = false;
}

function openManagerDiedCallback(event) {
	event.target.removeEventListener("DTM:dieEarly", openManagerDiedCallback, true);
	event.target.removeEventListener("DTM:ready", openManagerCallback, true);
	log(LOG_ERROR, "manager died early");
	isManagerPending = false;
	if (managerRequests.length) {
		log(LOG_ERROR, "manager died early, but pending requests; reopen");
		exports.openManager();
	}
}
// jshint +W003

exports.openManager = function openManager(window, quiet, cb) {
	try {
		if (isManagerPending) {
			if (cb) {
				managerRequests.push(cb);
			}
			log(LOG_DEBUG, "manager already pending; queuing");
			return;
		}

		let win = Mediator.getMostRecent('DTM:Manager');
		if (win) {
			log(LOG_DEBUG, "manager already open; direct");
			if (!cb && !quiet) {
				win.focus();
			}
			else if (cb) {
				cb(win);
			}
			return;
		}

		log(LOG_DEBUG, "manager not open yet; queueing");
		window = window || Mediator.getMostRecent();
		win = window.openDialog(
			"chrome://dtm/content/dtm/manager.xul",
			"_blank",
			"chrome, centerscreen, resizable=yes, dialog=no, all, modal=no, dependent=no",
			!!cb
		);
		if (cb) {
			managerRequests.push(cb);
		}
		isManagerPending = true;
		win.addEventListener("DTM:diedEarly", openManagerDiedCallback, true);
		win.addEventListener("DTM:ready", openManagerCallback, true);
	}
	catch(ex) {
		log(LOG_ERROR, "openManager():", ex);
	}
	return null;
};

const Series = {
	_session: 1,
	_persist: true,
	get value() {
		return this._persist ? Preferences.getExt("counter", 1) : this._session;
	},
	set value(nv) {
		if (this._persist) {
			Preferences.setExt("counter", nv);
		}
		else {
			this._session = nv;
		}
	},
	increment: function() {
		let rv = this.value;
		let store = rv;
		if (++store > this._max) {
			store = 1;
		}
		this.value = store;
		return rv;
	},
	observe: function(s, t, d) {
		this._digits = Preferences.getExt("seriesdigits", 3);
		this._max = Math.pow(10, this._digits) - 1;
	}
};
Preferences.addObserver("extensions.dtm.seriesdigits", Series);
Series.observe();

exports.currentSeries = function currentSeries() {
	return Series.value;
};
exports.incrementSeries = function incrementSeries() {
	return Series.increment();
};
