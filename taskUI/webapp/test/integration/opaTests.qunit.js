/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require(["com/sap/cp/dpa/invwpo/taskUI/test/integration/AllJourneys"
	], function () {
		QUnit.start();
	});
});
