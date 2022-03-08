sap.ui.define(["sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/ui/core/routing/History",
    "com/sap/cp/dpa/invwpo/StartUI/Util/Util",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"

], function (BaseController, MessageBox, History, Util, JSONModel, MessageToast) {
    "use strict";

    return BaseController.extend("com.sap.cp.dpa.invwpo.StartUI.controller.AddItem", {

        onInit: function () {
            // Setting the model to empty on initail load
            this.getView().setModel(new JSONModel({ F4HelpList: [] }), "taxCodeModel");
            this.getView().setModel(new JSONModel({ F4HelpList: [] }), "businessAreaModel");
            this.getView().setModel(new JSONModel({ F4HelpList: [], error: "None" }), "GLAccountModel");
            this.getView().setModel(new JSONModel({ F4HelpList: [] }), "costCenterModel");
            this.getView().setModel(new JSONModel({ F4HelpList: [] }), "profitCenterModel");
            this.getView().setModel(new JSONModel({ F4HelpList: [] }), "plantModel");
            this.getView().setModel(new JSONModel({ F4HelpList: [] }), "internalOrderModel");
            this.getView().setModel(new JSONModel({
                "amount": "",
                "currencyKey": "",
                "itemText": "",
                "errorAmount": "None"
            }), "AddItemModel");

            if (Util.createView && Util.createView.getModel("currencyListModel").getProperty("/value")) {
                this.getView().getModel("AddItemModel").setProperty("/currencyKey", Util.createView.getModel("currencyListModel").getProperty("/value"));
            }


        },

        onAfterRendering: function () {
            // To set the Values to Item Page when clicked on Edit Items button
            var oItemModel = this.getView().getModel("AddItemModel");
            Util.storeAddItemView(this.getView());
            if (Util.storeEditItemProperty) {
                oItemModel.setProperty('/amount', Util.storeEditItemProperty.amount);
                Util.addItemView.getModel("businessAreaModel").setProperty("/value", Util.storeEditItemProperty.businessArea);
                Util.addItemView.getModel("businessAreaModel").setProperty("/desc", Util.storeEditItemProperty.businessAreaDesc);
                Util.addItemView.getModel("costCenterModel").setProperty("/value", Util.storeEditItemProperty.costCenter);
                Util.addItemView.getModel("costCenterModel").setProperty("/desc", Util.storeEditItemProperty.costCenterDesc);
                Util.addItemView.getModel("plantModel").setProperty("/value", Util.storeEditItemProperty.plant);
                Util.addItemView.getModel("plantModel").setProperty("/desc", Util.storeEditItemProperty.plantDesc);
                oItemModel.setProperty('/currencyKey', Util.storeEditItemProperty.currencyKey);
                Util.addItemView.getModel("GLAccountModel").setProperty("/value", Util.storeEditItemProperty.glAccount);
                Util.addItemView.getModel("GLAccountModel").setProperty("/desc", Util.storeEditItemProperty.glAccountDesc);
                Util.addItemView.getModel("profitCenterModel").setProperty("/value", Util.storeEditItemProperty.profitCenter);
                Util.addItemView.getModel("profitCenterModel").setProperty("/desc", Util.storeEditItemProperty.profitCenterDesc);
                Util.addItemView.getModel("taxCodeModel").setProperty("/value", Util.storeEditItemProperty.taxCode);
                Util.addItemView.getModel("taxCodeModel").setProperty("/desc", Util.storeEditItemProperty.taxCodeDesc);
                Util.addItemView.getModel("internalOrderModel").setProperty("/value", Util.storeEditItemProperty.internalOrder);
                Util.addItemView.getModel("internalOrderModel").setProperty("/desc", Util.storeEditItemProperty.internalOrderDesc);
                oItemModel.setProperty('/itemText', Util.storeEditItemProperty.itemText);
            }
        },

        getRouter: function () {
            return sap.ui.core.UIComponent.getRouterFor(this)
        },
        // Handle Value help request in Items Page
        onValueHelpRequest: function (oEvent) {
            if (oEvent.getSource().getName() === "taxCode") {
                Util.triggerCallToGetparameterData(this.getView(), oEvent.getSource().getName());
            } else {
                Util.getValueHelpDialog(this.getView(), oEvent.getSource().getName());
            }
        },
        // Function to handle Add button action
        handleAddItemDetails: function (oEvent) {
            Util.storeAddItemView(this.getView());
            var oAddItemModel = this.getView().getModel('AddItemModel'),
                oData = oAddItemModel.getData(),
                sAmount = "";
            if (oData.amount) {
                sAmount = parseFloat(oData.amount);
            } else {
                sAmount = 0;
            }
            if (this.getView().getModel("GLAccountModel").getProperty("/value") && sAmount) {
                var oDataObject = {
                    "glAccount": this.getView().getModel("GLAccountModel").getProperty("/value") ? this.getView().getModel("GLAccountModel").getProperty("/value") : "",
                    "costCenter": this.getView().getModel("costCenterModel").getProperty("/value") ? this.getView().getModel("costCenterModel").getProperty("/value") : "",
                    "amount": sAmount,
                    "currencyKey": oData.currencyKey ? oData.currencyKey : "",
                    "taxCode": this.getView().getModel("taxCodeModel").getProperty("/value") ? this.getView().getModel("taxCodeModel").getProperty("/value") : "",
                    "businessArea": this.getView().getModel("businessAreaModel").getProperty("/value") ? this.getView().getModel("businessAreaModel").getProperty("/value") : "",
                    "profitCenter": this.getView().getModel("profitCenterModel").getProperty("/value") ? this.getView().getModel("profitCenterModel").getProperty("/value") : "",
                    "plant": this.getView().getModel("plantModel").getProperty("/value") ? this.getView().getModel("plantModel").getProperty("/value") : "",
                    "itemText": oData.itemText,
                    "internalOrder": this.getView().getModel("internalOrderModel").getProperty("/value") ? this.getView().getModel("internalOrderModel").getProperty("/value") : "",
                    "glAccountDesc": this.getView().getModel("GLAccountModel").getProperty("/desc") ? this.getView().getModel("GLAccountModel").getProperty("/desc") : "",
                    "costCenterDesc": this.getView().getModel("costCenterModel").getProperty("/desc") ? this.getView().getModel("costCenterModel").getProperty("/desc") : "",
                    "taxCodeDesc": this.getView().getModel("taxCodeModel").getProperty("/desc") ? this.getView().getModel("taxCodeModel").getProperty("/desc") : "",
                    "businessAreaDesc": this.getView().getModel("businessAreaModel").getProperty("/desc") ? this.getView().getModel("businessAreaModel").getProperty("/desc") : "",
                    "profitCenterDesc": this.getView().getModel("profitCenterModel").getProperty("/desc") ? this.getView().getModel("profitCenterModel").getProperty("/desc") : "",
                    "plantDesc": this.getView().getModel("plantModel").getProperty("/desc") ? this.getView().getModel("plantModel").getProperty("/desc") : "",
                    "internalOrderDesc": this.getView().getModel("internalOrderModel").getProperty("/desc") ? this.getView().getModel("internalOrderModel").getProperty("/desc") : ""

                };

                if (Util.sPath && Util.createView.getModel('ItemDetails')) {
                    Util.createView.getModel('ItemDetails').setProperty(Util.sPath, oDataObject);
                } else {
                    var aData = Util.createView.getModel('ItemDetails').getProperty('/data');
                    aData.push(oDataObject);
                    Util.createView.getModel('ItemDetails').setProperty('/data', aData);
                    oAddItemModel.setData({});
                    oAddItemModel.updateBindings(true);                  

                }
                // To calculate Header and Item amount is matching or not
                var aItems = Util.createView.getModel('ItemDetails').getProperty('/data'),
                    iTotalAmount = 0;
                for(var i=0; i < aItems.length; i++) {

                    iTotalAmount = aItems[i].amount + iTotalAmount;

                }

                Util.ItemAmount = iTotalAmount;

                if (oData.currencyKey && Util.createView.getModel('ItemDetails')) {

                    var aData = Util.createView.getModel('ItemDetails').getProperty('/data');
                    if (aData.length) {
                        Util.createView.getModel('currencyListModel').setProperty("/enable", false);
                    } else {
                        Util.createView.getModel('currencyListModel').setProperty("/enable", true);
                    }
                    Util.createView.getModel('currencyListModel').updateBindings(true);
                }

                if (parseFloat(Util.createView.getModel('createModel').getProperty('/amount')) !== iTotalAmount) {
                    Util.createView.getModel('createModel').setProperty('/errorAmount', "Error");
                } else {
                    Util.createView.getModel('createModel').setProperty('/errorAmount', "None");
                }
                // Triggering Tax Calucation CPI to calculate tax and set the value in Tax Amount field
                Util.triggerTaxCalculationICf(true); 
             } else {

                if (!this.getView().getModel("GLAccountModel").getProperty("/value")) {
                    this.getView().getModel("GLAccountModel").setProperty("/error", "Error");
                }
                if (!sAmount) {
                    oAddItemModel.setProperty("/errorAmount", "Error");
                }
                MessageToast.show("Please fill mandatory fields to navigate");
            }



        },
        _getDocumentServiceBaseURL: function() {
			var componentName = this.getOwnerComponent().getManifestEntry("/sap.app/id").replaceAll(".", "/");
			var componentPath= jQuery.sap.getModulePath(componentName);
			return componentPath + "/docservice/";
		},
		
        _getWorkflowRuntimeBaseURL: function () {
            var componentName = this.getOwnerComponent().getManifestEntry("/sap.app/id").replaceAll(".", "/");
            var componentPath= jQuery.sap.getModulePath(componentName);
            return componentPath + "/workflowruntime/v1";
        },
		
		_getCPIBaseURL: function () {
            var componentName = this.getOwnerComponent().getManifestEntry("/sap.app/id").replaceAll(".", "/");
            var componentPath = jQuery.sap.getModulePath(componentName);
            return componentPath + "/CPI/http/";
        },
        // Function to validate fields
        onFieldValidation: function (oEvent) {
            var sUrl = _getCPIBaseURL() + "getInternalOrder";
            this.sInputValue = oEvent.getSource().getValue();
            var sSearchString = "%" + this.sInputValue + "%";
            var sCompanyCode = this.getOwnerComponent().getModel("universalModel").getProperty("/companyCodeValue");
            var oData = {
                "internalOrder": sSearchString.toUpperCase(),
                "companyCode": sCompanyCode,
                "description": "",
                "maxRows": 100
            };
            var data = JSON.stringify(oData);

            jQuery.ajax({
                url: sUrl,
                type: "POST",
                data: data,
                contentType: "application/json",
                success: this.handleFieldValidationSuccess.bind(this),
                error: this.handleFieldValidationError.bind(this)
            });
        },
        // Function to handle setting the field to error state when data miss matches 
        handleFieldValidationSuccess: function (oResponse, data) {
            if(oResponse){
                if(oResponse.internalOrderList){
                    if(oResponse.internalOrderList.internalOrder !== "" && oResponse.internalOrderList.internalOrder){
                        if(oResponse.internalOrderList.internalOrder.trim() === this.sInputValue){
                            this.getView().getModel("internalOrderModel").setProperty("/desc", oResponse.internalOrderList.description);
                            this.getView().getModel("internalOrderModel").setProperty("/error", "None");
                        } else {
                            this.getView().getModel("internalOrderModel").setProperty("/desc", "");
                            this.getView().getModel("internalOrderModel").setProperty("/error", "Error");                
                        }
                    } else {
                        this.getView().getModel("internalOrderModel").setProperty("/desc", "");
                        this.getView().getModel("internalOrderModel").setProperty("/error", "Error");                
                    }
                } else {
                    this.getView().getModel("internalOrderModel").setProperty("/desc", "");
                    this.getView().getModel("internalOrderModel").setProperty("/error", "Error");                
                }
            } else {
                this.getView().getModel("internalOrderModel").setProperty("/desc", "");
                this.getView().getModel("internalOrderModel").setProperty("/error", "Error");                
            }
        }, 

        // Function to handle both Submit and Live change of value help fields
        onSubmitValue: function (oEvent) {
            var sName = oEvent.getSource().getName(),
                oModel = this.getView().getModel("AddItemModel"),
                sValue = oEvent.getSource().getValue(),
                sDontTriggerBackendCall = false;

            if (!sValue) {
                sDontTriggerBackendCall = true;
            } else {
                sValue = sValue.toUpperCase();
            }


            if (sName === "amount" && oModel.getProperty("/amount")) {
                oModel.setProperty("/errorAmount", "None");
            } else if (sName === "GLAccount") {
                this.getView().getModel("GLAccountModel").setProperty("/value", sValue);
                if (!sDontTriggerBackendCall) {
                    Util.getValueHelpDialog(this.getView(), sName, true, sValue);
                } else {
                    this.getView().getModel("GLAccountModel").setProperty("/desc", "");
                    this.getView().getModel("GLAccountModel").setProperty("/error", "None");
                }
            } else if (sName === "costCenter") {
                this.getView().getModel("costCenterModel").setProperty("/value", sValue);
                if (!sDontTriggerBackendCall) {
                    Util.getValueHelpDialog(this.getView(), sName, true, sValue);
                } else {
                    this.getView().getModel("costCenterModel").setProperty("/desc", "");
                    this.getView().getModel("costCenterModel").setProperty("/error", "None");
                }
            } else if (sName === "taxCode") {
                this.getView().getModel("taxCodeModel").setProperty("/value", sValue);
                if (!sDontTriggerBackendCall) {
                    Util.triggerCallToGetparameterData(this.getView(), sName, true, sValue);
                } else {
                    this.getView().getModel("taxCodeModel").setProperty("/desc", "");
                    this.getView().getModel("taxCodeModel").setProperty("/error", "None");
                }
            } else if (sName === "businessArea") {
                this.getView().getModel("businessAreaModel").setProperty("/value", sValue);
                if (!sDontTriggerBackendCall) {
                    Util.getValueHelpDialog(this.getView(), sName, true, sValue);
                } else {
                    this.getView().getModel("businessAreaModel").setProperty("/desc", "");
                    this.getView().getModel("businessAreaModel").setProperty("/error", "None");

                }
            } else if (sName === "profitCenter") {
                this.getView().getModel("profitCenterModel").setProperty("/value", sValue);
                if (!sDontTriggerBackendCall) {
                    Util.getValueHelpDialog(this.getView(), sName, true, sValue);
                } else {
                    this.getView().getModel("profitCenterModel").setProperty("/desc", "");
                    this.getView().getModel("profitCenterModel").setProperty("/error", "None");
                }
            } else if (sName === "plant") {
                this.getView().getModel("plantModel").setProperty("/value", sValue);
                if (!sDontTriggerBackendCall) {
                    Util.getValueHelpDialog(this.getView(), sName, true, sValue);
                } else {
                    this.getView().getModel("plantModel").setProperty("/desc", "");
                    this.getView().getModel("plantModel").setProperty("/error", "None");
                }
            } else if (sName === "internalOrder") {
                this.getView().getModel("internalOrderModel").setProperty("/value", sValue);
                if (!sDontTriggerBackendCall) {
                    Util.getValueHelpDialog(this.getView(), sName, true, sValue);
                } else {
                    this.getView().getModel("internalOrderModel").setProperty("/desc", "");
                    this.getView().getModel("internalOrderModel").setProperty("/error", "None");
                }
            }

        },
        // Function to handle Cancle button Action
        handleCancelAction: function () {
            var oAddItemModel = this.getView().getModel('AddItemModel');
            oAddItemModel.setProperty('/itemText', "");
            oAddItemModel.setProperty('/amount', "");
            oAddItemModel.setProperty('/currencyKey', "");
            this.getView().getModel("GLAccountModel").setProperty("/value", "");
            this.getView().getModel("costCenterModel").setProperty("/value", "");
            this.getView().getModel("taxCodeModel").setProperty("/value", "");
            this.getView().getModel("businessAreaModel").setProperty("/value", "");
            this.getView().getModel("profitCenterModel").setProperty("/value", "");
            this.getView().getModel("plantModel").setProperty("/value", "");
            this.getView().getModel("internalOrderModel").setProperty("/value", "");
            this.getView().getModel("GLAccountModel").setProperty("/desc", "");
            this.getView().getModel("costCenterModel").setProperty("/desc", "");
            this.getView().getModel("taxCodeModel").setProperty("/desc", "");
            this.getView().getModel("businessAreaModel").setProperty("/desc", "");
            this.getView().getModel("profitCenterModel").setProperty("/desc", "");
            this.getView().getModel("plantModel").setProperty("/desc", "");
            this.getView().getModel("internalOrderModel").setProperty("/desc", "");
            Util.sPath = "";
            this.getOwnerComponent().getRouter().navTo("Create", {}, true);
        }        		
    });
}, /* bExport= */ true);
