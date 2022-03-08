/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require(["com/sap/cp/dpa/invwpo/StartUI/test/integration/AllJourneys"
	], function () {
		QUnit.start();
	});
});
