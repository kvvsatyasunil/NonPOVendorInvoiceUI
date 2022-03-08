/*global QUnit*/

sap.ui.define([
	"comsapcpdpainvwpo/StartUI/controller/Create.controller"
], function (Controller) {
	"use strict";

	QUnit.module("Create Controller");

	QUnit.test("I should test the Create controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
