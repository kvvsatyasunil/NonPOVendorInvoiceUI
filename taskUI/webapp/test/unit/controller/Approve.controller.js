/*global QUnit*/

sap.ui.define([
	"comsapcpdpainvwpo/taskUI/controller/Approve.controller"
], function (Controller) {
	"use strict";

	QUnit.module("Approve Controller");

	QUnit.test("I should test the Approve controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
