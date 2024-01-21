"use strict";

/* global pref */
pref("extensions.dtm.ctxmenu", "1,1,0");
pref("extensions.dtm.ctxcompact", false);
pref("extensions.dtm.toolsmenu", "0,0,0");
pref("extensions.dtm.toolshidden", false);
pref("extensions.dtm.closedtm", false);
pref("extensions.dtm.saveTemp", false);
pref("extensions.dtm.downloadWin", true);
pref("extensions.dtm.conflictresolution", 3);
pref("extensions.dtm.ntask", 8);
pref("extensions.dtm.timeout", 300);
pref("extensions.dtm.maxchunks", 4);
pref("extensions.dtm.history", 5);
pref("extensions.dtm.alertbox", 2);
pref("extensions.dtm.removecompleted", false);
pref("extensions.dtm.removecanceled", false);
pref("extensions.dtm.removeaborted", false);
pref("extensions.dtm.infophrases", true);
pref("extensions.dtm.statistics", false); // later use!
pref("extensions.dtm.logging", false);
pref("extensions.dtm.showonlyfilenames", true);
pref("extensions.dtm.sounds.done", true);
pref("extensions.dtm.sounds.error", false);
pref("extensions.dtm.settime", true);
pref("extensions.dtm.showtooltip", true);
pref("extensions.dtm.renaming.default", JSON.stringify([
	"*name*.*ext*", "*num*_*name*.*ext*", "*url*-*name*.*ext*",
	"*name* (*text*).*ext*", "*name* (*hh*-*mm*).*ext*"
	]));
pref("extensions.dtm.filter.default", JSON.stringify([
	"", "/\\.mp3$/", "/\\.(html|htm|rtf|doc|pdf)$/",
	"http://www.website.com/subdir/*.*",
	"http://www.website.com/subdir/pre*.???",
	"*.z??, *.css, *.html"
	]));
pref("extensions.dtm.lastqueued", false);
pref("extensions.dtm.lastalltabs", false);
pref("extensions.dtm.rememberoneclick", false);
pref("extensions.dtm.autoretryinterval", 300);
pref("extensions.dtm.maxautoretries", 5);
pref("extensions.dtm.autoclearcomplete", false);
pref("extensions.dtm.confirmcancel", true);
pref("extensions.dtm.confirmremove", true);
pref("extensions.dtm.confirmremovecompleted", true);
pref("extensions.dtm.permissions", 416);
pref("extensions.dtm.loadendfirst", 0);
pref("extensions.dtm.loadendfirst", 0);
pref("extensions.dtm.startminimized", false);
pref("extensions.dtm.flatreplacementchar", "-");
pref("extensions.dtm.recoverallhttperrors", false);
pref("extensions.dtm.selectbgimages", false);
pref("extensions.dtm.nagnever", false);
pref("extensions.dtm.nagnext", 500);
pref("extensions.dtm.speedlimit", -1);
pref("extensions.dtm.listsniffedvideos", false);
pref("extensions.dtm.nokeepalive", true);
pref("extensions.dtm.resumeonerror", false);
pref("extensions.dtm.textlinks", true);
pref("extensions.dtm.serverlimit.perserver", 4);
pref("extensions.dtm.serverlimit.connectionscheduler", 'fast');
pref("extensions.dtm.exposeInUA", false);
pref("extensions.dtm.sparsefiles", false);
pref("extensions.dtm.autosegments", true);
pref("extensions.dtm.notification2", 2);
pref("extensions.dtm.usesysalerts", true);
pref("extensions.dtm.seriesdigits", 3);
pref("extensions.dtm.usecleanrequests", false);
pref("extensions.dtm.showactions", true);

// Non-customizable-toolbar specific
pref("extensions.dtm.tb.buttons", "1,1,0");

/**
 * Schedule
 */
pref("extensions.dtm.schedule.enabled", false);
pref("extensions.dtm.schedule.start", 0);
pref("extensions.dtm.schedule.end", 1380); // 23:00
pref("extensions.dtm.schedule.open", true);

/**
 * Privacy Controls
 */
pref("privacy.cpd.extensions-dtm", false);
pref("privacy.clearOnShutdown.extensions-dtm", false);

pref("extensions.mintrayr.downthemoon.watchmanager", false);
