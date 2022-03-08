sap.ui.define(["sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    'sap/m/MessageItem',
    'sap/m/MessagePopover',
    "sap/m/MessageToast",
    "sap/ui/core/routing/History",
    "com/sap/cp/dpa/invwpo/StartUI/Util/Util",
    "sap/ui/model/json/JSONModel",
    "sap/ui/layout/HorizontalLayout",
    "sap/ui/model/FilterOperator",
    "sap/ui/commons/FileUploaderParameter",
    "sap/m/UploadCollectionParameter",
    "sap/ui/core/format/DateFormat",
    "sap/ui/comp/filterbar/FilterBar",
    "sap/ui/comp/filterbar/FilterGroupItem",
    "sap/m/Input",

], function (BaseController, MessageBox, MessageItem, MessagePopover, MessageToast, History, Util, JSONModel, HorizontalLayout,
    FilterOperator, FileUploaderParameter, UploadCollectionParameter, DateFormat, FilterBar, FilterGroupItem, Input) {
    "use strict";
    
    return BaseController.extend("com.sap.cp.dpa.invwpo.StartUI.controller.Create", {
        str: "",
        onInit: function () {
            // Refreshing the models on Initial load of the app 
            this.getView().setModel(new JSONModel({ F4HelpList: [], visible: false, error: "None" }), "companyListModel");
            this.getView().setModel(new JSONModel({ F4HelpList: [], error: "None" }), "vendorListModel");
            this.getView().setModel(new JSONModel({ F4HelpList: [], error: "None" }), "oneTimeVendorCityModel");
            this.getView().setModel(new JSONModel({ F4HelpList: [], error: "None" }), "oneTimeVendorCountryModel");
            this.getView().setModel(new JSONModel({ F4HelpList: [], enable: true }), "currencyListModel");
            this.getView().setModel(new JSONModel({ F4HelpList: [] }), "paymentTermListModel");
            this.getView().setModel(new JSONModel({ F4HelpList: [] }), "paymentMethodListModel");
            this.getView().setModel(new JSONModel({ F4HelpList: [] }), "requesterModel");
            this.getView().setModel(new JSONModel({ enable: true }), "createFormModel");
            this.getView().setModel(new JSONModel({
                "oneTimeVendorName": "",
                "invoiceDate": "",
                "amount": "",
                "days1": "",
                "days2": "",
                "days3": "",
                "reference": "",
                "text": "",
                "requesterName": "",
                "discount1": "",
                "discount2": "",
                "oneTimeVendorCity": "",
                "oneTimeVendorCountry": "",
                "requester": "",
                "exchangeRate": "",
                "currency": "",
                "paymentMethod": "",
                "paymentTerms": "",
                "oneTimeVendor": false,
                "errorName": "None",
                "errorAmount": "None",
                "errorReference": "None",
                "popOverBtn": false
            }), "createModel");
            // Setting the Exchange rate field to non-editable
            this.getView().getModel("createModel").setProperty("/exchangeRateEnable", false);

            var oModel = new JSONModel({
                visible: false
            });
            this.getView().setModel(oModel, "vendorFieldsVisibility");

            // document service interaction

            this.getView().setModel(new JSONModel({
                objects: [],
                enable: true
            }), "oAttachmentsModel");

            this.getView().setModel(new JSONModel({
                data: []
            }), "ItemDetails");
            // Duplicate invoice model
            this.getView().setModel(new JSONModel(), "duplicateDetails");
            
            this.getView().byId("idInvoiceDate").addEventDelegate({
                onAfterRendering: function (oEvent) {
                    var that = this;
                    $("#" + oEvent.srcControl.sId).keyup(function (e) {
                        this.getView().byId("idInvoiceDate").fireChange();
                    }.bind(that))
                }.bind(this)
            });
            // Storing View
            Util.storeCreateView(this.getView());
            // Store Component Path
            Util.setComponentPath(this._getComponentPath());
            // // Temporary folder creation for Attachments
            // var sTempUser = sap.ushell.Container.getService("UserInfo").getUser().getEmail();           
            // this.sTempFolderName = sTempUser + new Date().getTime();
            this.sTempFolderName = "kvv.satyasunil@gmail.com";
            // Resetting the models and controls in initial load
            this.resetParams();

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

        _getComponentPath: function () {
            var componentName = this.getOwnerComponent().getManifestEntry("/sap.app/id").replaceAll(".", "/");
            var componentPath= jQuery.sap.getModulePath(componentName);
            return componentPath;
        },
		
		_getCPIBaseURL: function () {
            var componentName = this.getOwnerComponent().getManifestEntry("/sap.app/id").replaceAll(".", "/");
            var componentPath = jQuery.sap.getModulePath(componentName);
            return componentPath + "/CPI/http/";
        },

               
        // Downloading the uploaded document
        formatDownloadUrl: function (objectId) {
            return this._getDocumentServiceBaseURL() + "workflowmanagement/NonPOVendorInvoiceDocuments/"
                + this.sTempFolderName + "?objectId=" + objectId + "&cmisselector=content";           
        },

        //Opening Document Service application
        onOpenDocXSaaS: function (oEvent) {
            var url;
            if (this._getInputVal("docXJobID")) {
                url = this._getDocXAppURL() + this._getInputVal("docXJobID") + "/ThreeColumnsMidExpanded";
            }
            sap.m.URLHelper.redirect(url, true);
        },

        _getInputVal: function (controlID) {
            return this.getView().byId(controlID).getValue();
        },

        
        onAfterRendering: function () {
            
            Util.storeCreateView(this.getView());
            // Getting User details form IDP
            //var user = sap.ushell.Container.getService("UserInfo");
            Util.oParamObject.invoiceDetails.headerDetail.initiator = "kvv.satyasunil@gmail.com";//user.getUser().getFullName();
            Util.oParamObject.invoiceDetails.headerDetail.initiatorMailId = "kvv.satyasunil@gmail.com";//user.getUser().getEmail();

            //  check if 'workflowmanagement' folder exists
            this.checkIfFolderExists("workflowmanagement");
        },
        onExit: function () {            
            var tempFolderName = this.getView().getModel('createModel').getProperty("/requesterName") +
                this.getView().getModel('createModel').getProperty("/amount");
            // delete temporary folder if it exists
            this.checkIfFolderExists(tempFolderName);
        },

        // check if folder with a given name exists
        checkIfFolderExists: function (folderName) {

            // var oUploadCollection = this.byId("UploadCollection");
            // oUploadCollection.setBusy(false);

            // if (folderName == "workflowmanagement") {
            //     var sUrl = this._getDocumentServiceBaseURL();
            // } else if (folderName == "NonPOVendorInvoiceDocuments") {
            //     var sUrl = this._getDocumentServiceBaseURL() + "workflowmanagement/";
            // } else {
            //     var sUrl = this._getDocumentServiceBaseURL() + "workflowmanagement/NonPOVendorInvoiceDocuments";
            // }
            // var oSettings = {
            //     "url": sUrl,
            //     "method": "GET",
            //     "async": false,
            //     "headers": {
            //         "ContentType": 'application/json',
            //         "Accept": 'application/json',
            //         "cache": false,
            //         'X-CSRF-Token': 'Fetch'
            //     }
            // };

            // var folderExists = false;

            // $.ajax(oSettings)
            //     .done(function (results, textStatus, request) {
                    
            //         for (var i = 0; i < results.objects.length; i++) {
            //             if (results.objects[i].object.properties["cmis:objectTypeId"].value == "cmis:folder") {
            //                 if (results.objects[i].object.properties["cmis:name"].value == folderName) {

            //                     folderExists = true;
            //                 }
            //             }
            //         }
            //     })
            //     .fail(function (err) {
            //         if (err !== undefined) {
            //             var oErrorResponse = $.parseJSON(err.responseText);                        
            //             console.log(oErrorResponse);
            //         } else {
            //             MessageToast.show("Unknown error!");
            //         }
            //     });

            // if (folderName == "workflowmanagement") {
            //     if (!folderExists) {
            //         this.createFolder(folderName);
            //     } else {
            //         console.log("folder 'root/workflowmanagement' already exisits");
            //         this.checkIfFolderExists("NonPOVendorInvoiceDocuments");
            //     }
            // } else if (folderName == "NonPOVendorInvoiceDocuments") {
            //     if (!folderExists) {
            //         this.createFolder(folderName);
            //     } else {
            //         console.log("folder with a name 'NonPOVendorInvoiceDocuments' already exisits");                    
            //     }
            // } else {
            //     if (folderExists) {
            //         this.deleteTempFolder();
            //     }
            // }
        },
        // create folder with a given name
        createFolder: function (folderName) {

            if (folderName == "workflowmanagement") {
                console.log("creating a folder 'root/workflowmanagement'");
                var sUrl = this._getDocumentServiceBaseURL();
            } else if (folderName == "NonPOVendorInvoiceDocuments") {
                console.log("creating a folder 'root/workflowmanagement/NonPOVendorInvoiceDocuments'");
                var sUrl = this._getDocumentServiceBaseURL() + "workflowmanagement/";
            } else {
                var oUploadCollection = this.getView().byId("UploadCollection");
                oUploadCollection.setUploadUrl("/docservice/workflowmanagement/NonPOVendorInvoiceDocuments/" + folderName);
                console.log("creating temporary folder with a name '" + folderName + "'");
                var sUrl = this._getDocumentServiceBaseURL() + "workflowmanagement/NonPOVendorInvoiceDocuments/";
            }

            var oFormData = new window.FormData();
            oFormData.append("cmisAction", "createFolder");
            oFormData.append("succinct", "true");
            oFormData.append("propertyId[0]", "cmis:name");
            oFormData.append("propertyValue[0]", folderName);
            oFormData.append("propertyId[1]", "cmis:objectTypeId");
            oFormData.append("propertyValue[1]", "cmis:folder");

            var sToken = Util._fetchToken();

            var oSettings = {
                "url": sUrl,
                "method": "POST",
                "async": false,
                "data": oFormData,
                "cache": false,
                "contentType": false,
                "processData": false,
                "headers": {
                    'X-CSRF-Token': sToken
                }
            };

            var oController = this;

            $.ajax(oSettings)
                .done(function (results) {
                    if (folderName === "workflowmanagement") {
                        oController.checkIfFolderExists("NonPOVendorInvoiceDocuments");
                    } else if (folderName === "NonPOVendorInvoiceDocuments") {
                        console.log("creating temporary folder with a name '" + folderName + "'");
                    } else {
                        oController.tempFolderObjId = results.succinctProperties["cmis:objectId"];
                        oController.loadAttachments(oController.tempFolderObjId);
                    }
                })
                .fail(function (err) {
                    if (err !== undefined) {
                        var oErrorResponse = $.parseJSON(err.responseText);                        
                        console.log(oErrorResponse);
                    } else {
                        MessageToast.show("Unknown error!");
                    }
                });
        },

        // Function to set Visibility of the fields
        handleTimeVendorCheckbox: function (oEvent) {
            var oModel = this.getView().getModel("vendorFieldsVisibility"),
                bSelected = oEvent.getParameters().selected;

            if (bSelected) {
                oModel.setProperty('/visible', true);
            } else {
                oModel.setProperty('/visible', false);
            }

        },
        //  For triggering F4 Value help
        onValueHelpRequest: function (oEvent) {
            Util.storeCreateView(this.getView());

            if (oEvent.getSource().getName() === "Payment Methods") {


                Util.triggerCallToGetparameterData(this.getView(), oEvent.getSource().getName());


            } else {

                Util.getValueHelpDialog(this.getView(), oEvent.getSource().getName());

            }
        },


        // On click of save button 
        handleSaveOnCreate: function () {
            var oCreateModel = this.getView().getModel("createModel");

            var bMandatoryValuesPresent, bMandatoryCheckValuesPresent;

            if (oCreateModel && oCreateModel.getProperty("/amount") && oCreateModel.getProperty("/reference") && oCreateModel.getProperty("/invoiceDate")
                && this.getView().getModel("companyListModel").getProperty("/value") && this.getView().getModel("vendorListModel").getProperty("/value")) {
                bMandatoryValuesPresent = true;
            } else {
                bMandatoryValuesPresent = false;
            }

            if (oCreateModel.getProperty("/oneTimeVendor") && oCreateModel.getProperty("/oneTimeVendorCity")
                && this.getView().getModel("oneTimeVendorCountryModel").getProperty("/value") && oCreateModel.getProperty("/oneTimeVendorName")) {

                bMandatoryCheckValuesPresent = true;
            } else {
                bMandatoryCheckValuesPresent = false;
            }

            if (bMandatoryValuesPresent && !oCreateModel.getProperty("/oneTimeVendor")) {
                // Checking the Items in the table is present or not 
                var aItemData = this.getView().getModel('ItemDetails').getProperty("/data");
                if (aItemData && !aItemData.length) {

                    MessageToast.show("No Item Details");
                    return;
                }

                var oCreateModel = this.getView().getModel("createModel");
                this.checkInvoiceDetails(oCreateModel);                                

            } else if (bMandatoryCheckValuesPresent && bMandatoryValuesPresent) {
                // Checking the Items in the table is present or not 
                var aItemData = this.getView().getModel('ItemDetails').getProperty("/data");
                if (aItemData && !aItemData.length) {

                    MessageToast.show("No Item Details");
                    return;
                }

                var oCreateModel = this.getView().getModel("createModel");
                this.checkInvoiceDetails(oCreateModel);


            } else {
                // Setting the fields to Error state when no mandatory value is given 
                if (!oCreateModel.getProperty("/oneTimeVendorName") && oCreateModel.getProperty("/oneTimeVendor")) {
                    oCreateModel.setProperty("/errorName", "Error");
                }
                if (!oCreateModel.getProperty("/amount")) {
                    oCreateModel.setProperty("/errorAmount", "Error");
                }
                if (!oCreateModel.getProperty("/reference")) {
                    oCreateModel.setProperty("/errorReference", "Error");
                }
                if (!this.getView().getModel("companyListModel").getProperty("/value")) {
                    this.getView().getModel("companyListModel").setProperty("/error", "Error");
                }
                if (!this.getView().getModel("vendorListModel").getProperty("/value")) {
                    this.getView().getModel("vendorListModel").setProperty("/error", "Error");
                }
                if (!this.getView().getModel("oneTimeVendorCityModel").getProperty("/value") && oCreateModel.getProperty("/oneTimeVendor")) {
                    this.getView().getModel("oneTimeVendorCityModel").setProperty("/error", "Error");
                }
                if (!this.getView().getModel("oneTimeVendorCountryModel").getProperty("/value") && oCreateModel.getProperty("/oneTimeVendor")) {
                    this.getView().getModel("oneTimeVendorCountryModel").setProperty("/error", "Error");
                }

                MessageToast.show("Please fill mandatory fields");

                var aItemData = this.getView().getModel('ItemDetails').getProperty("/data");
                if (aItemData && !aItemData.length) {

                    MessageToast.show("No Item Details");
                }
            }            
        },
        // Resetting the One time vendor and Dox model
        _resetModel: function () {
            var oModel = this.getView().getModel("vendorFieldsVisibility");
            oModel.setProperty('/visible', false);
            this.getView().getModel("duplicateDetails").setProperty("/data", []);
        },       
        // Request parameters for Check Invoice CPI
        checkInvoiceDetails: function (oCreateModel) {

            var taxCalculation = {
                "headerData": {},
                "accountGL": [],
                "currencyAmount": [],
                "countryCode": Util.sCountry
            };

            Util.checkInvoice = {
                "headerData": {},
                "customerCD": [],
                "accountPayable": [{

                    "itemAccountNumber": "",

                    "vendorNo": "",

                    "itemText": "",

                    "paymentTerm": "",

                    "paymentMethod": "",

                    "dueDay1": "",

                    "dueDay2": "",

                    "netTerms": "",

                    "discount1": "",

                    "dicsount2": ""

                }],
                "currencyAmount": [],
                "accountGL": []

            };
            // Header details in Check Invoice details
            Util.checkInvoice.headerData = {

                "userName": "kvv.satyasunil@gmail.com",//sap.ushell.Container.getService("UserInfo").getUser().getFullName(),

                "postingDate": oCreateModel.getProperty("/invoiceDate"),

                "documentDate": oCreateModel.getProperty("/invoiceDate"),

                "companyCode": this.getView().getModel("companyListModel").getProperty("/value"),

                "docType": "KR",

                "reference": oCreateModel.getProperty("/reference")

            }
            // Tax calculation header details
            taxCalculation.headerData = Util.checkInvoice.headerData;

            Util.checkInvoice.customerCD.push({

                "name": oCreateModel.getProperty("/oneTimeVendorName"),

                "city": oCreateModel.getProperty("/oneTimeVendorCity"),

                "country": this.getView().getModel("oneTimeVendorCountryModel").getProperty("/value") ? this.getView().getModel("oneTimeVendorCountryModel").getProperty("/value") : ""

            });
            Util.checkInvoice.accountPayable[0].itemAccountNumber = 1,
            Util.checkInvoice.accountPayable[0].vendorNo = this.getView().getModel("vendorListModel").getProperty("/value");
            Util.checkInvoice.accountPayable[0].itemText = oCreateModel.getProperty("/text");
            Util.checkInvoice.accountPayable[0].paymentTerm = this.getView().getModel("paymentTermListModel").getProperty("/value");
            Util.checkInvoice.accountPayable[0].paymentMethod = this.getView().getModel("paymentMethodListModel").getProperty("/value");
            Util.checkInvoice.accountPayable[0].dueDay1 = oCreateModel.getProperty("/days1");
            Util.checkInvoice.accountPayable[0].dueDay2 = oCreateModel.getProperty("/days2");
            Util.checkInvoice.accountPayable[0].netTerms = oCreateModel.getProperty("/days3");
            Util.checkInvoice.accountPayable[0].discount1 = oCreateModel.getProperty("/discount1");
            Util.checkInvoice.accountPayable[0].dicsount2 = oCreateModel.getProperty("/discount2");
           
            var aData = this.getView().getModel('ItemDetails').getProperty("/data");
            this.totalAmount = 0;
           // Tax Calculation request parameters header data 
            taxCalculation.headerData = {

                "userName": "kvv.satyasunil@gmail.com",//sap.ushell.Container.getService("UserInfo").getUser().getFullName(),

                "postingDate": this.getView().getModel('createModel').getProperty("/invoiceDate"),

                "documentDate": this.getView().getModel('createModel').getProperty("/invoiceDate"),

                "companyCode": this.getView().getModel("companyListModel").getProperty("/value"),

                "docType": "KR",

                "reference": this.getView().getModel('createModel').getProperty("/reference")

            };


            if (aData && aData.length) {
                for (var i = 0; i < aData.length; i++) {

                    this.totalAmount = this.totalAmount + parseFloat(aData[i].amount);

                    Util.checkInvoice.currencyAmount.push({

                        "itemAccountNumber": i + 2,

                        "currency": this.getView().getModel("currencyListModel").getProperty("/value"),

                        "amount": aData[i].amount,

                        "baseAmount": "",

                        "exchangeRate": oCreateModel.getProperty("/exchangeRate")

                    });
                    taxCalculation.currencyAmount.push({

                        "itemAccountNumber": i + 2,

                        "currency": this.getView().getModel("currencyListModel").getProperty("/value"),

                        "amount": aData[i].amount

                    });


                    Util.checkInvoice.accountGL.push({

                        "itemAccountNumber": i + 2,

                        "glAccountNo": aData[i].glAccount,

                        "itemText": aData[i].itemText,

                        "acctType": "S",

                        "companyCode": this.getView().getModel("companyListModel").getProperty("/value"),

                        "taxCode": "",

                        "vendorNo": this.getView().getModel("vendorListModel").getProperty("/value"),

                        "profitCenter": aData[i].profitCenter,

                        "costCenter": aData[i].costCenter,

                        "businessArea": aData[i].businessArea,

                        "plant": aData[i].plant,

                        "internalOrder": aData[i].internalOrder

                    });

                    taxCalculation.accountGL.push({

                        "itemAccountNumber": i + 2,

                        "glAccountNo": aData[i].glAccount,

                        "itemText": aData[i].itemText,

                        "acctType": "S",

                        "companyCode": this.getView().getModel("companyListModel").getProperty("/value"),

                        "taxCode": aData[i].taxCode,

                        "vendorNo": this.getView().getModel("vendorListModel").getProperty("/value"),

                        "profitCenter": aData[i].profitCenter,

                        "costCenter": aData[i].costCenter,

                        "businessArea": aData[i].businessArea,

                        "plant": aData[i].plant,

                        "internalOrder": aData[i].internalOrder

                    });
                }
            }


            Util.checkInvoice.currencyAmount.unshift({

                "itemAccountNumber": 1,

                "currency": this.getView().getModel("currencyListModel").getProperty("/value"),

                "amount": -oCreateModel.getProperty("/amount"),

                "baseAmount": "",

                "exchangeRate": oCreateModel.getProperty("/exchangeRate")
            });
            this.triggerTaxCalculation(taxCalculation);

        },
        // Tac calculation CPI triggering
        triggerTaxCalculation: function (oTax) {

            var oData = JSON.stringify(oTax);

            jQuery.ajax({
                url: this._getCPIBaseURL() + "fetchTaxcalculation",
                type: "POST",
                data: oData,
                contentType: "application/json",
                success: this.handleTaxData.bind(this),
                error: this.handleICFCallbackError.bind(this)
            });
        },
        // Tax Amount calculation 
        handleTaxData: function (sJson) {

            if (sJson !== "") {
                if (sJson !== "") {

                    if (sJson.currencyAmount && !sJson.currencyAmount.length) {
                        if (parseFloat(sJson.currencyAmount.baseAmount) > 0) {
                            this.getView().getModel('createModel').setProperty("/taxAmount", parseFloat(sJson.currencyAmount.amount));
                        }

                    } else if (sJson.currencyAmount.length) {

                        var iAmount = 0;
                        for (var i = 0; i < sJson.currencyAmount.length; i++) {

                            if (parseFloat(sJson.currencyAmount[i].baseAmount) > 0) {

                                iAmount = parseFloat(sJson.currencyAmount[i].amount) + iAmount;
                            }
                        }

                        if (iAmount) {
                            this.getView().getModel('createModel').setProperty("/taxAmount", iAmount);
                        }
                    }
                }

                var iTaxAmount =  this.getView().getModel('createModel').getProperty("/taxAmount"), iTotalAmount;

                if(iTaxAmount) {
                    iTotalAmount = parseFloat(iTaxAmount) + parseFloat(this.getView().getModel('createModel').getProperty("/amount"));
                }

                var iFinalValue;

                if (parseFloat(iTotalAmount) % 1) {
                    iFinalValue = parseFloat(iTotalAmount).toFixed(2);
                } else {
                    iFinalValue = iTotalAmount;
                }

                this.getView().getModel('createModel').setProperty("/invoiceTotalAmount", iFinalValue);

                var oCreateModel = this.getView().getModel('createModel');
                this.getView().getModel('createModel').setProperty("/Errors", []);

                var aMessages = sJson.return ? sJson.return : sJson.errorList, aMsg = [];

                if (aMessages && aMessages.length) {
                    for (var i = 0; i < aMessages.length; i++) {
                        if (aMessages[i].type === "E") {
                            aMessages[i].type = "Error";
                            aMsg.push(aMessages[i]);
                        }
                    }
                }

                aMsg.splice(0, 1);

                if (aMsg && aMsg.length) {                   
                    this.getView().getModel('createModel').setProperty("/popOverBtn", true);
                    this.getView().getModel('createModel').setProperty("/Errors", aMsg);
                    this.getView().getModel('createModel').updateBindings(true);
                    jQuery.sap.delayedCall(0,this, function(){
                     this.handleMessagePopoverPress();
                    });

                } else {
                    // Setting message pop-over to false
                    this.getView().getModel('createModel').setProperty("/popOverBtn", false);                   

                    // Triggering Check Invoice
                    var data = JSON.stringify(Util.checkInvoice);

                    jQuery.ajax({
                        url: this._getCPIBaseURL() + "CheckInvoice",
                        type: "POST",
                        data: data,
                        contentType: "application/json",
                        success: this.handleIvoiceCheckData.bind(this),
                        error: this.handleICFCallbackError.bind(this)
                    });
                }
            }
        },
        //Function to check Invoice details and handle errors by pushing them into Message Pop-Over 
        handleIvoiceCheckData: function (sJson) {
            if (sJson && typeof sJson.return === "object" && !Array.isArray(sJson.return)) {
                sJson = "";
            }
            if (sJson !== "") {
                var oCreateModel = this.getView().getModel('createModel');
                this.getView().getModel('createModel').setProperty("/Errors", []);
                var aMessages = sJson.return, aMsg = [];

                if (aMessages && aMessages.length) {
                    for (var i = 0; i < aMessages.length; i++) {
                        if (aMessages[i].type === "E") {
                            aMessages[i].type = "Error";
                            aMsg.push(aMessages[i]);      
                        }
                    }
                }

                aMsg.splice(0, 1);

                if (this.totalAmount !== parseFloat(oCreateModel.getProperty("/amount"))) {
                   this.getView().getModel('createModel').setProperty("/popOverBtn", true);
                    aMsg.push({ message: "Header and Item amount should be same", type: "Error" });
                    this.getView().getModel("createModel").setProperty("/errorAmount", "Error");                    
                } else {
                    this.getView().getModel("createModel").setProperty("/errorAmount", "None");
                }
                this.getView().getModel('createModel').updateBindings(true);

                this.getView().getModel('createModel').setProperty("/Errors", aMsg);

                this.resetCheckInvoice();

                if (aMsg.length) {
                    this.getView().getModel('createModel').setProperty("/popOverBtn", true);
                    this.getView().getModel('createModel').updateBindings(true);
                    jQuery.sap.delayedCall(0,this, function(){
                     this.handleMessagePopoverPress();
                    });
                } else {

                    this.handleSaveAction();

                }
            } else {
                this.handleSaveAction();
            }

        },
        // On Save button Action to save the entire form  
        handleSaveAction: function () {
            this.resetCheckInvoice();
            this.getView().getModel('createModel').setProperty("/Errors", []);
            var iAmount = this.getView().getModel("createModel").getProperty("/amount"),
                oItemDetailModel = this.getView().getModel('ItemDetails'),
                aItemData = oItemDetailModel.getProperty('/data'),
                iTotalAmount = 0, iItemAmount,
                oCreateModel = this.getView().getModel("createModel");
            // Checking Header and Item Amount matching or not
            if (iAmount) {
                iAmount = parseFloat(iAmount);
            }

            for (var i = 0; i < aItemData.length; i++) {

                if (aItemData[i].amount) {
                    iItemAmount = parseFloat(aItemData[i].amount);

                    iTotalAmount = iTotalAmount + iItemAmount;
                }
            }

            var bMandatoryValuesPresent, bMandatoryCheckValuesPresent;
            if (oCreateModel && oCreateModel.getProperty("/amount") && oCreateModel.getProperty("/reference") && oCreateModel.getProperty("/invoiceDate")
                && this.getView().getModel("companyListModel").getProperty("/value") && this.getView().getModel("vendorListModel").getProperty("/value")) {
                bMandatoryValuesPresent = true;
            } else {
                bMandatoryValuesPresent = false;
            }

            if (oCreateModel.getProperty("/oneTimeVendor") && oCreateModel.getProperty("/oneTimeVendorCity")
                && this.getView().getModel("oneTimeVendorCountryModel").getProperty("/value") && oCreateModel.getProperty("/oneTimeVendorName")) {

                bMandatoryCheckValuesPresent = true;
            } else {
                bMandatoryCheckValuesPresent = false;
            }

            if (iAmount !== iTotalAmount) {

                MessageToast.show("Header amount and Item Details amount should be same");
                this.getView().getModel("createModel").setProperty("/errorAmount", "Error");

            } else if (!bMandatoryValuesPresent && !oCreateModel.getProperty("/oneTimeVendorName") || !bMandatoryValuesPresent && !bMandatoryCheckValuesPresent) {

                MessageToast.show("Please fill the mandatory fields to save");
                this.getView().getModel("createModel").setProperty("/errorAmount", "None");

            } else {

                this.getView().getModel("createModel").setProperty("/errorAmount", "None");
                // Opening Dialog when clicking on Save button 
                var oDialog = new sap.m.Dialog({
                    title: 'Confirm',
                    type: 'Message',
                    content: [
                        new HorizontalLayout({
                            content: [
                                new sap.m.Text({ text: 'Are you sure you want to submit?' })
                            ]
                        }),
                        new sap.m.TextArea('confirmDialogTextarea', {
                            width: '100%',
                            placeholder: 'Add note (optional)'
                        })
                    ],
                    beginButton: new sap.m.Button({
                        type: sap.m.ButtonType.Emphasized,
                        text: 'Yes',
                        press: function () {
                            var eToken = Util._fetchToken();
                            this._triggerBackendCallToSaveChanges(eToken, oDialog);
                            oDialog.close();
                        }.bind(this)
                    }),
                    endButton: new sap.m.Button({
                        text: 'No',
                        press: function () {
                            oDialog.close();
                        }
                    }),
                    afterClose: function () {
                        oDialog.destroy();
                    }
                })
                oDialog.open();

            }

        },
        // Function on Cancel button click (Footer Button)
        handleCancelAction: function () {
            var oController = this;
            var oDialog = new sap.m.Dialog({
                title: 'Confirm',
                type: 'Message',
                content: [
                    new HorizontalLayout({
                        content: [
                            new sap.m.Text({ text: 'Are you sure you want to Cancel? Changes will get discarded' })
                        ]
                    })
                ],
                beginButton: new sap.m.Button({
                    type: sap.m.ButtonType.Ghost,
                    text: 'Ok',
                    press: function () {
                        oController.resetCheckInvoice();
                        this._resetModel();
                        oController.resetParams();
                        oController.getView().getModel("ItemDetails").setProperty("/data", []);
                        oDialog.close();
                    }.bind(this)
                }),
                endButton: new sap.m.Button({
                    text: 'Cancel',
                    press: function () {
                        oDialog.close();
                    }
                }),
                afterClose: function () {
                    oDialog.destroy();
                }
            })
            oDialog.open();

        },
        // Resetting the check Invoice to avoid duplicates in request parameters
        resetCheckInvoice: function () {
            Util.checkInvoice = {

                "headerData": {},

                "customerCD": [],

                "accountGL": [],

                "accountPayable": [

                    {

                        "itemAccountNumber": "",

                        "vendorNo": "",

                        "itemText": "",

                        "paymentTerm": "",

                        "paymentMethod": "",

                        "dueDay1": "",

                        "dueDay2": "",

                        "netTerms": "",

                        "discount1": "",

                        "dicsount2": ""

                    }

                ],

                "currencyAmount": []

            }

        },
        /*
        * DOCUMENT SERVICE INTERACTIONS
        */
        // check if folder with a given name exists
        checkIfFolderExists: function (folderName) {

            // var oUploadCollection = this.byId("UploadCollection");
            // oUploadCollection.setBusy(false);

            // if (folderName == "workflowmanagement") {
            //     var sUrl = this._getDocumentServiceBaseURL();
            // } else if (folderName == "NonPOVendorInvoiceDocuments") {
            //     var sUrl = this._getDocumentServiceBaseURL() + "workflowmanagement/";
            // } else {
            //     var sUrl = this._getDocumentServiceBaseURL() + "workflowmanagement/NonPOVendorInvoiceDocuments";
            // }
            // var oSettings = {
            //     "url": sUrl,
            //     "method": "GET",
            //     "async": false,
            //     "headers": {
            //         "ContentType": 'application/json',
            //         "Accept": 'application/json',
            //         "cache": false,
            //         'X-CSRF-Token': 'Fetch'
            //     }
            // };

            // var folderExists = false;

            // $.ajax(oSettings)
            //     .done(function (results, textStatus, request) {
            //         // token = request.getResponseHeader('X-CSRF-Token');
            //         for (var i = 0; i < results.objects.length; i++) {
            //             if (results.objects[i].object.properties["cmis:objectTypeId"].value == "cmis:folder") {
            //                 if (results.objects[i].object.properties["cmis:name"].value == folderName) {
            //                     folderExists = true;
            //                 }
            //             }
            //         }
            //     })
            //     .fail(function (err) {
            //         if (err !== undefined) {
            //             var oErrorResponse = $.parseJSON(err.responseText);
            //             MessageToast.show(oErrorResponse.message, {
            //                 duration: 6000
            //             });
            //         } else {
            //             MessageToast.show("Unknown error!");
            //         }
            //     });

            // if (folderName == "workflowmanagement") {
            //     if (!folderExists) {
            //         this.createFolder(folderName);
            //     } else {
            //         console.log("folder 'root/workflowmanagement' already exisits");
            //         this.checkIfFolderExists("NonPOVendorInvoiceDocuments");
            //     }
            // } else if (folderName == "NonPOVendorInvoiceDocuments") {
            //     if (!folderExists) {
            //         this.createFolder(folderName);
            //     }
            // } else {
            //     if (folderExists) {
            //         this.deleteTempFolder();
            //     }
            // }
        },

        // create folder with a given name
        createFolder: function (folderName) {
            var sToken = Util._fetchToken();


            if (folderName == "workflowmanagement") {
                console.log("creating a folder 'root/workflowmanagement'");
                var sUrl = this._getDocumentServiceBaseURL();
            } else if (folderName == "NonPOVendorInvoiceDocuments") {
                console.log("creating a folder 'root/workflowmanagement/NonPOVendorInvoiceDocuments'");
                var sUrl = this._getDocumentServiceBaseURL() + "workflowmanagement/";
            } else {
                var oUploadCollection = this.getView().byId("UploadCollection");
                oUploadCollection.setUploadUrl(this._getDocumentServiceBaseURL() + "workflowmanagement/NonPOVendorInvoiceDocuments/" + folderName);
                console.log("creating temporary folder with a name '" + folderName + "'");
                var sUrl = this._getDocumentServiceBaseURL() + "workflowmanagement/NonPOVendorInvoiceDocuments/";
            }

            var oFormData = new window.FormData();
            oFormData.append("cmisAction", "createFolder");
            oFormData.append("succinct", "true");
            oFormData.append("propertyId[0]", "cmis:name");
            oFormData.append("propertyValue[0]", folderName);
            oFormData.append("propertyId[1]", "cmis:objectTypeId");
            oFormData.append("propertyValue[1]", "cmis:folder");

            var oSettings = {
                "url": sUrl,
                "method": "POST",
                "async": false,
                "data": oFormData,
                "cache": false,
                "contentType": false,
                "processData": false,
                "headers": {
                    'X-CSRF-Token': sToken
                }
            };

            var oController = this;

            $.ajax(oSettings)
                .done(function (results) {
                    if (folderName == "workflowmanagement") {
                        oController.checkIfFolderExists("NonPOVendorInvoiceDocuments");
                    } else if (folderName == "NonPOVendorInvoiceDocuments") {
                    } else {
                        oController.tempFolderObjId = results.succinctProperties["cmis:objectId"];
                        oController.loadAttachments(oController.tempFolderObjId);
                    }
                })
                .fail(function (err) {
                    if (err !== undefined) {
                        var oErrorResponse = $.parseJSON(err.responseText);                       
                    } else {
                        MessageToast.show("Unknown error!");
                    }
                });
        },

        loadAttachments: function (sTempFolderId, bFinalUplaod) {
            var oUploadCollection = this.getView().byId("UploadCollection");
            var sUrl = oUploadCollection.getUploadUrl() + "?succinct=true";
            console.log("Upload URL: " + sUrl);
            var oSettings = {
                "url": sUrl,
                "method": "GET",
            };

            var oController = this;
            $.ajax(oSettings)
                .done(function (results) {
                    if (bFinalUplaod) {
                        oController.moveFiles(sTempFolderId);
                    } else {
                        oController._mapAttachmentsModel(results, sTempFolderId);
                        oUploadCollection.setBusy(false);
                    }
                })
                .fail(function (err) {
                    if (err !== undefined) {
                        var oErrorResponse = $.parseJSON(err.responseText);
                        MessageToast.show(oErrorResponse.message, {
                            duration: 6000
                        });
                    } else {
                        MessageToast.show("Unknown error!");
                    }
                });
        },

        // assign data to attachments model
        _mapAttachmentsModel: function (data, sTempFolderId) {
            this.getView().getModel('oAttachmentsModel').setProperty('/objects', data);
            this.getView().getModel('oAttachmentsModel').refresh();
            var oUploadCollection = this.getView().byId("UploadCollection"),
                aItems = oUploadCollection.getItems();
            if (aItems && aItems.length) {
                this.getView().getModel('oAttachmentsModel').setProperty('/attachmentCount', aItems.length);
            } else {
                this.getView().getModel('oAttachmentsModel').setProperty('/attachmentCount', 0);
            }
            this.moveFilesToTempFolder(sTempFolderId);
        },

        moveFilesToTempFolder: function (sTempFolderId) {

            var aObjects = this.getView().getModel("oAttachmentsModel").getProperty('/objects');
            var countMoves = 0;
            for (var i = 0; i < aObjects.objects.length; i++) {
                var oFormData = new window.FormData();
                oFormData.append("cmisAction", "move");
                oFormData.append("objectId", aObjects.objects[i].object.succinctProperties["cmis:objectId"]);
                oFormData.append("sourceFolderId", this.sTempFolderName);
                oFormData.append("targetFolderId", sTempFolderId);

            }
        },
        // set parameters that are rendered as a hidden input field and used in ajax requests
        onAttachmentsChange: function (oEvent) {
            var oUploadCollection = oEvent.getSource();
            this.createFolder(this.sTempFolderName);
            var cmisActionHiddenFormParam = new UploadCollectionParameter({
                name: "cmisAction",
                value: "createDocument" // create file
            });
            oUploadCollection.addParameter(cmisActionHiddenFormParam);

            var objectTypeIdHiddenFormParam1 = new UploadCollectionParameter({
                name: "propertyId[0]",
                value: "cmis:objectTypeId"
            });
            oUploadCollection.addParameter(objectTypeIdHiddenFormParam1);

            var propertyValueHiddenFormParam1 = new UploadCollectionParameter({
                name: "propertyValue[0]",
                value: "cmis:document"
            });
            oUploadCollection.addParameter(propertyValueHiddenFormParam1);

            var objectTypeIdHiddenFormParam2 = new UploadCollectionParameter({
                name: "propertyId[1]",
                value: "cmis:name"
            });
            oUploadCollection.addParameter(objectTypeIdHiddenFormParam2);

            var propertyValueHiddenFormParam2 = new UploadCollectionParameter({
                name: "propertyValue[1]",
                value: oEvent.getParameter("files")[0].name
            });
            oUploadCollection.addParameter(propertyValueHiddenFormParam2);

        },

        // show message when user attempts to attach file with size more than 10 MB
        onFileSizeExceed: function (oEvent) {
            var maxSize = oEvent.getSource().getMaximumFileSize();
            MessageToast.show("File size limit is exceeded. Please note that max file size length is " + maxSize + " MB");
        },

        // set parameters and headers before upload
        onBeforeUploadStarts: function (oEvent) {
            var oUploadCollection = this.getView().byId("UploadCollection"),
                oFileUploader = oUploadCollection._getFileUploader();

            // use multipart content (multipart/form-data) for posting files
            oFileUploader.setUseMultipart(true);

            console.log("Before Upload starts");
            
            var oFileNameHeaderSlug = new UploadCollectionParameter({
                name: "slug",
                value: oEvent.getParameter("fileName")
            });
            oEvent.getParameters().addHeaderParameter(oFileNameHeaderSlug);

            var sToken = Util._fetchToken();

            // ad csrf Token to header of request
            var oTokenHeader = new UploadCollectionParameter({
                name: "X-CSRF-Token",
                value: sToken
            });
            oEvent.getParameters().addHeaderParameter(oTokenHeader);

        },

        // refresh attachments collection after file was uploaded
        onUploadComplete: function (oEvent) {

            // workaround to remove busy indicator
            var oUploadCollection = this.byId("UploadCollection"),
                cItems = oUploadCollection.aItems.length,
                i;

            for (i = 0; i < cItems; i++) {
                if (oUploadCollection.aItems[i]._status === "uploading") {
                    oUploadCollection.aItems[i]._percentUploaded = 100;
                    oUploadCollection.aItems[i]._status = oUploadCollection._displayStatus;
                    oUploadCollection._oItemToUpdate = null;
                    break;
                }
            }

            if (oEvent.getParameter("files")[0].status != 201) {
                var response = JSON.parse(oEvent.getParameter("files")[0].responseRaw);
                console.log(response);
            }
            this.loadAttachments(this.tempFolderObjId);
        },

        // attributes formatting functions
        formatTimestampToDate: function (timestamp) {
            var oFormat = DateFormat.getDateTimeInstance();
            return oFormat.format(new Date(timestamp));
        },

        formatFileLength: function (fileSizeInBytes) {
            var i = -1;
            var byteUnits = [' kB', ' MB', ' GB', ' TB', 'PB', 'EB', 'ZB', 'YB'];
            do {
                fileSizeInBytes = fileSizeInBytes / 1024;
                i++;
            } while (fileSizeInBytes > 1024);

            return Math.max(fileSizeInBytes, 0.1).toFixed(1) + byteUnits[i];
        },

        // delete document from temp folder based on users' input
        onDeleteAttachment: function (oEvent) {
            var sUrl = this.getView().byId("UploadCollection").getUploadUrl();
            var item = oEvent.getSource().getBindingContext("oAttachmentsModel").getProperty(oEvent.getSource().getBindingContext("oAttachmentsModel").getPath());
            var objectId = item.object.succinctProperties["cmis:objectId"];
            var fileName = item.object.succinctProperties["cmis:name"];
            var oFormData = new window.FormData();
            oFormData.append("cmisAction", "delete");
            oFormData.append("objectId", objectId);

            var sToken = Util._fetchToken();

            var oSettings = {
                "url": sUrl,
                "method": "POST",
                "async": false,
                "data": oFormData,
                "cache": false,
                "contentType": false,
                "processData": false,
                "headers": {
                    'X-CSRF-Token': sToken
                }
            };

            $.ajax(oSettings)
                .done(function (results) {
                    MessageToast.show("File '" + fileName + "' is deleted");
                })
                .fail(function (err) {
                    if (err !== undefined) {
                        var oErrorResponse = $.parseJSON(err.responseText);
                        MessageToast.show(oErrorResponse.message, {
                            duration: 6000
                        });
                    } else {
                        MessageToast.show("Unknown error!");
                    }
                });

            this.loadAttachments();

        },

        // delete temp folder (cleanup)
        deleteTempFolder: function (tempFolderObjId) {
            console.log("deleting temporary folder with a objId '" + tempFolderObjId + "'");

            var sUrl = this._getDocumentServiceBaseURL() + "workflowmanagement/NonPOVendorInvoiceDocuments/";


            var oFormData = new window.FormData();
            oFormData.append("cmisAction", "deleteTree");
            oFormData.append("objectId", tempFolderObjId);

            var sToken = Util._fetchToken();

            var oSettings = {
                "url": sUrl,
                "method": "POST",
                "async": false,
                "data": oFormData,
                "cache": false,
                "contentType": false,
                "processData": false,
                "headers": {
                    'X-CSRF-Token': sToken
                }
            };

            $.ajax(oSettings)
                .done(function (results) {
                })
                .fail(function (err) {
                    if (err !== undefined) {
                        var oErrorResponse = $.parseJSON(err.responseText);
                        MessageToast.show(oErrorResponse.message, {
                            duration: 6000
                        });
                    } else {
                        MessageToast.show("Unknown error!");
                    }
                });
        },

        // create permanent folder
        createTargetFolder: function (targetFolderName) {
            var oUploadCollection = this.getView().byId("UploadCollection");
            oUploadCollection.setUploadUrl("/docservice/workflowmanagement/NonPOVendorInvoiceDocuments/" + targetFolderName);
            console.log("creating a permanent folder 'workflowmanagement/NonPOVendorInvoiceDocuments/" + targetFolderName + "/");

            var sUrl = this._getDocumentServiceBaseURL() + "workflowmanagement/NonPOVendorInvoiceDocuments/";

            var oFormData = new window.FormData();
            oFormData.append("cmisAction", "createFolder");
            oFormData.append("succinct", "true");
            oFormData.append("propertyId[0]", "cmis:name");
            oFormData.append("propertyValue[0]", targetFolderName);
            oFormData.append("propertyId[1]", "cmis:objectTypeId");
            oFormData.append("propertyValue[1]", "cmis:folder");

            var sToken = Util._fetchToken();

            var oSettings = {
                "url": sUrl,
                "method": "POST",
                "async": false,
                "data": oFormData,
                "cache": false,
                "contentType": false,
                "processData": false,
                "headers": {
                    'X-CSRF-Token': sToken
                }
            };

            var oController = this;
            $.ajax(oSettings)
                .done(function (results) {
                    var targetFolderId = results.succinctProperties["cmis:objectId"];
                    oController.moveFiles(targetFolderId);

                })
                .fail(function (err) {
                    if (err !== undefined) {
                        var oErrorResponse = $.parseJSON(err.responseText);
                        MessageToast.show(oErrorResponse.message, {
                            duration: 6000
                        });
                    } else {
                        MessageToast.show("Unknown error!");
                    }
                });
        },

        // move files from temporary folder to permanent
        moveFiles: function (targetFolderId) {
            var oCreateModel = this.getView().getModel("createModel");
            var sUrl = this._getDocumentServiceBaseURL() + "workflowmanagement/NonPOVendorInvoiceDocuments/";

            var aObjects = this.getView().getModel("oAttachmentsModel").getProperty("/objects"),
                iLen = aObjects && aObjects.objects && aObjects.objects.length;
            var countMoves = 0;

            for (var i = 0; i < iLen; i++) {
                var oFormData = new window.FormData();
                oFormData.append("cmisAction", "move");
                oFormData.append("objectId", aObjects.objects[i].object.succinctProperties["cmis:objectId"]);
                oFormData.append("sourceFolderId", this.tempFolderObjId);
                oFormData.append("targetFolderId", targetFolderId);

                var sToken = Util._fetchToken();

                var oSettings = {
                    "url": sUrl,
                    "method": "POST",
                    "async": false,
                    "data": oFormData,
                    "cache": false,
                    "contentType": false,
                    "processData": false,
                    "headers": {
                        'X-CSRF-Token': sToken
                    }
                };



                $.ajax(oSettings)
                    .done(function (results) {
                        console.log("file with id '" + aObjects.objects[i].object.succinctProperties["cmis:objectId"] +
                            "' is moved to permanent folder")
                    })
                    .fail(function (err) {
                        if (err !== undefined) {
                            var oErrorResponse = $.parseJSON(err.responseText);
                            MessageToast.show(oErrorResponse.message, {
                                duration: 6000
                            });
                        } else {
                            MessageToast.show("Unknown error!");
                        }
                    });

                countMoves++;
            }

            if (countMoves === iLen) {
                this.deleteTempFolder(this.tempFolderObjId);
            }
        },


        // Triggering Work Flow Instance 
        _triggerBackendCallToSaveChanges: function (sToken, oDialog) {
            // set parameters
            this.setParameters(oDialog);

            var oBusyIndicator = Util.getBusyLoader();
            oBusyIndicator.open();
            var aData = {
                definitionId: "invoiceheaderprocess",
                context: Util.oParamObject

            };
            var iData = JSON.stringify(aData);

            var oController = this;
            $.ajax({
                url: this._getWorkflowRuntimeBaseURL() + "/workflow-instances",
                method: "POST",
                async: false,
                contentType: "application/json",
                headers: {
                    "X-CSRF-Token": sToken
                },
                data: iData,

                success: $.proxy(function (tRes) {
                    oBusyIndicator.close();
                    oController.createTargetFolder(tRes.id);
                    if (tRes.id) {
                        var oDialog = new sap.m.Dialog({
                            title: "Success",
                            type: 'Message',
                            content: [
                                new HorizontalLayout({
                                    content: [
                                        new sap.m.Text({ text: "Non-PO Vendor Invoice Submitted for Approval" })
                                    ]
                                })
                            ],
                            beginButton: new sap.m.Button({
                                type: sap.m.ButtonType.Emphasized,
                                text: 'Create Invoice',
                                press: function () {
                                    oController.getView().getModel("ItemDetails").setProperty("/data", []);
                                    this._resetModel();
                                    oController.resetParams();
                                    this.getView().byId("UploadCollection").setUploadEnabled(true);
                                    this.getView().byId("UploadCollection").setUploadEnabled(false);
                                    this.getView().byId("UploadCollection").setUploadEnabled(true);
                                    oDialog.close();
                                }.bind(this)
                            }),
                            endButton: new sap.m.Button({
                                text: 'Display',
                                press: function () {
                                    oController.getView().getModel("createFormModel").setProperty("/enable", false);
                                    oController.getView().getModel("currencyListModel").setProperty("/enable", false);
                                    oController.getView().getModel("oAttachmentsModel").setProperty("/enable", false);
                                    oController.getView().getModel("createModel").setProperty("/exchangeRateEnable", false);
                                    oDialog.close();
                                }
                            }),
                            afterClose: function () {
                                oDialog.destroy();
                            }
                        })
                        oDialog.open();


                    } else {
                        MessageBox.information(tRes.id);
                    }
                }).bind(this),
                error: function (res) {
                    MessageBox.error("An error occured. Please try again");
                    oBusyIndicator.close();
                }.bind(this)
            })


        },
        // Resetting the parameters of Work Flow instance after Save/Cancel actions
        resetParams: function () {
            Util.oParamObject = {
                "invoiceDetails": {
                    "attachments": {

                    },
                    "items": [
                    ],
                    "paymentTerms": [                       
                    ],
                    "headerDetail": {
                        "requester": "",
                        "invoiceTotalAmount": "",
                        "taxAmount": "",
                        "oneTimeVendorCountry": "",
                        "initiator": "",
                        "initiatorMailId": "",
                        "invoiceDate": "",
                        "reference": "",
                        "oneTimeVendorCity": "",
                        "exchangeRate": "",
                        "requesterName": "",
                        "currency": "",
                        "text": "",
                        "vendorNumber": "",
                        "oneTimeVendorName": "",
                        "paymentTerm": "",
                        "paymentMethod": "",

                    }
                }
            }

            var oCreateModel = this.getView().getModel('createModel'),
                oCompanyModel = this.getView().getModel('companyListModel'),
                oVendorModel = this.getView().getModel('vendorListModel');
            oCreateModel.setProperty('/oneTimeVendorName', "");
            oCreateModel.setProperty('/amount', "");
            oCreateModel.setProperty('/invoiceTotalAmount', "");
            oCreateModel.setProperty('/taxAmount', "");
            oCreateModel.setProperty('/exchangeRate', "");
            oCreateModel.setProperty('/invoiceDate', "");
            oCreateModel.setProperty('/reference', "");
            oCreateModel.setProperty('/requesterName', "");
            this.getView().getModel('requesterModel').setProperty('/value', "");
            this.getView().getModel('requesterModel').setProperty('/desc', "");
            oCreateModel.setProperty('/oneTimeVendor', false);
            this.getView().getModel('currencyListModel').setProperty('/enable', true);
            oCreateModel.setProperty('/text', "");
            oCreateModel.setProperty('/dueDate', "");
            oCreateModel.setProperty('/oneTimeVendorCity', "");
            this.getView().getModel('oneTimeVendorCountryModel').setProperty('/value', "");
            this.getView().getModel('oneTimeVendorCountryModel').setProperty('/desc', "");
            this.getView().getModel('paymentMethodListModel').setProperty('/value', "");
            this.getView().getModel('paymentTermListModel').setProperty('/value', "");
            this.getView().getModel('paymentMethodListModel').setProperty('/desc', "");
            this.getView().getModel('paymentTermListModel').setProperty('/desc', "");
            oVendorModel.setProperty('/value', "");
            oVendorModel.setProperty('/desc', "");
            oCreateModel.setProperty('/days1', "")
            oCreateModel.setProperty('/discount1', "");
            oCreateModel.setProperty('/days2', ""),
            oCreateModel.setProperty('/discount2', "");
            oCreateModel.setProperty('/days3', "");

            if (this.byId("UploadCollection")) {
                this.byId("UploadCollection").getModel("oAttachmentsModel").setData({});
            }



        },

        handleICFCallbackError: function (sError) {
            this.getView().getModel('createModel').setProperty("/Errors", []);
        },

       // Success handler for Duplicate Invoice check      
        _handleSuccess: function (oResponse, sMsg, data) {
            if (oResponse.root && oResponse.root.documentList.length) {

                for (var j = 0; j < oResponse.root.documentList.length; j++) {
                    oResponse.root.documentList[j].status = "Completed";
                    oResponse.root.documentList[j].startedBy = "";
                    oResponse.root.documentList[j].startedAt = "";
                    this.stagingInvoice.push(oResponse.root.documentList[j]);
                }
            } else if (oResponse.root) {
                oResponse.root.documentList.status = "Completed";
                oResponse.root.documentList.startedBy = "";
                oResponse.root.documentList.startedAt = "";
                this.stagingInvoice.push(oResponse.root.documentList);
            }
            this.erpcompleteflag = this.erpcompleteflag + 1;
            if (this.erpcompleteflag === 2) {
                this._deleteDuplicate();
                this.erpcompleteflag = 0;
            }
        },


        // Deleting duplicate Invoice
        _deleteDuplicate: function () {
            var i,
                len = this.stagingInvoice.length;
            if(len){
                this.stagingInvoice.sort();
                if(this.stagingInvoice[0].accountingDocumentNo){
                    this.duplicateOut.push(this.stagingInvoice[0]);
                }
                for (i = 1; i < len; i++) {
                    if (this.stagingInvoice[i].accountingDocumentNo != this.stagingInvoice[i - 1].accountingDocumentNo && this.stagingInvoice[i].accountingDocumentNo) {
                        this.duplicateOut.push(this.stagingInvoice[i]);
                    }
                }
                this.getView().getModel("duplicateDetails").setProperty("/data", this.duplicateOut);
            
            }
        },
        // Duplicate Invoices on Cloud 
        _handleCloudSuccess: function (oResponse, sMsg, data) {
            this.stagingInvoice = [];
            
            if (oResponse) {
                for (var j = 0; j < oResponse.length; j++) {
                    this.stagingInvoice[j] = {};
                    this.stagingInvoice[j].status = "In Approval";
                    this.stagingInvoice[j].accountingDocumentNo = "";
                    this.stagingInvoice[j].fishcalYear = "";
                    this.stagingInvoice[j].companyCode = this.getView().getModel("companyListModel").getProperty("/value"),
                    this.stagingInvoice[j].vendorNumber = this.getView().getModel("vendorListModel").getProperty("/value"),
                    this.stagingInvoice[j].invoiceDate = this.getView().getModel("createModel").getProperty("/invoiceDate"),
                    this.stagingInvoice[j].reference = this.getView().byId("idReferenceInput").getValue().toUpperCase(),
                    this.stagingInvoice[j].startedBy = oResponse[j].startedBy;
                    this.stagingInvoice[j].startedAt = oResponse[j].startedAt;
                    this.duplicateOut.push(this.stagingInvoice[j]);
                }
            }

            this.getView().getModel("duplicateDetails").setProperty("/data", this.duplicateOut);
            this.stagingInvoice = [];
        },

        _handleError: function (sError) {
            sap.m.MessageToast.show(sError);
        },
        // Fetch Duplciate Invoice
        _handleDuplicateInvoiceFetch: function () {
            var that = this;
            this.duplicateOut = [];
            this.erpcompleteflag = 0;
            var oData1 = {
                "companyCode": this.getView().getModel("companyListModel").getProperty("/value"),
                "vendorNumber": this.getView().getModel("vendorListModel").getProperty("/value"),
                "invoiceDate": this.getView().getModel("createModel").getProperty("/invoiceDate"),
                "reference": this.getView().byId("idReferenceInput").getValue().toUpperCase(),
                "table": "BSAK"
            };
            oData1 = JSON.stringify(oData1);
            var oData2 = {
                "companyCode": this.getView().getModel("companyListModel").getProperty("/value"),
                "vendorNumber": this.getView().getModel("vendorListModel").getProperty("/value"),
                "invoiceDate": this.getView().getModel("createModel").getProperty("/invoiceDate"),
                "reference": this.getView().byId("idReferenceInput").getValue().toUpperCase(),
                "table": "BSIK"
            };
            oData2 = JSON.stringify(oData2);
            that.stagingInvoice = [];
            that.duplicateOut = [];
            jQuery.ajax({
                url: this._getCPIBaseURL() + "getBSIK",
                type: "POST",
                data: oData1,
                contentType: "application/json",
                success: jQuery.proxy(this._handleSuccess, this),
                error: jQuery.proxy(this._handleError, this)
            });
            jQuery.ajax({
                url: this._getCPIBaseURL() + "getBSIK",
                type: "POST",
                data: oData2,
                contentType: "application/json",
                success: jQuery.proxy(this._handleSuccess, this),
                error: jQuery.proxy(this._handleError, this)
            });
            var eToken = Util._fetchToken();
            
            var oUrl = this._getWorkflowRuntimeBaseURL() + "/workflow-instances?definitionId=invoiceheaderprocess&status=RUNNING&attributes.companyCode=" + this.getView().getModel("companyListModel").getProperty("/value") + "&attributes.vendorNumber=" + this.getView().getModel("vendorListModel").getProperty("/value") + "&attributes.invoiceDate=" + this.getView().getModel("createModel").getProperty("/invoiceDate") + "&attributes.reference=" + this.getView().byId("idReferenceInput").getValue();
            var oController = this;
            $.ajax({
                url: oUrl,
                method: "GET",
                async: false,
                contentType: "application/json",
                headers: {
                    "X-CSRF-Token": eToken
                },
                success: jQuery.proxy(this._handleCloudSuccess, this),
                error: jQuery.proxy(this._handleError, this)
            });


        },
        // On click of Duplcate invocie check button
        _handleDuplicateInvoice: function () {
            if (this.getView().getModel("companyListModel").getProperty("/value") &&
                this.getView().getModel("vendorListModel").getProperty("/value") &&
                this.getView().getModel("createModel").getProperty("/invoiceDate") &&
                this.getView().byId("idReferenceInput").getValue()) {

                this.getView().getModel("duplicateDetails").setProperty("/data", []);
                this._handleDuplicateInvoiceFetch();

            } else {
                this.getView().getModel("duplicateDetails").setProperty("/data", []);
                MessageToast.show("Please fill mandatory fields");
            }
        },

        //Navigate to AddItem Page
        navToAddItemPage: function () {
            Util.storeCreateView(this.getView());            
            if (Util.addItemView) {
                var oItemModel = Util.addItemView.getModel("AddItemModel");
                oItemModel.setProperty('/amount', "");
                if (this.getView().getModel("currencyListModel").getProperty("/value")) {
                    oItemModel.setProperty('/currencyKey', this.getView().getModel("currencyListModel").getProperty("/value"));
                } else {
                    oItemModel.setProperty('/currencyKey', "");
                }

                oItemModel.setProperty('/itemText', "");
                Util.addItemView.getModel("GLAccountModel").setProperty("/value", "");
                Util.addItemView.getModel("costCenterModel").setProperty("/value", "");
                Util.addItemView.getModel("taxCodeModel").setProperty("/value", "");
                Util.addItemView.getModel("businessAreaModel").setProperty("/value", "");
                Util.addItemView.getModel("profitCenterModel").setProperty("/value", "");
                Util.addItemView.getModel("plantModel").setProperty("/value", "");
                Util.addItemView.getModel("internalOrderModel").setProperty("/value", "");
                Util.addItemView.getModel("GLAccountModel").setProperty("/desc", "");
                Util.addItemView.getModel("costCenterModel").setProperty("/desc", "");
                Util.addItemView.getModel("taxCodeModel").setProperty("/desc", "");
                Util.addItemView.getModel("businessAreaModel").setProperty("/desc", "");
                Util.addItemView.getModel("profitCenterModel").setProperty("/desc", "");
                Util.addItemView.getModel("plantModel").setProperty("/desc", "");
                Util.addItemView.getModel("internalOrderModel").setProperty("/desc", "");
                Util.sPath = "";
            }

            var oCreateModel = this.getView().getModel("createModel");

            var bMandatoryValuesPresent, bMandatoryCheckValuesPresent;

            if (oCreateModel && oCreateModel.getProperty("/amount") && oCreateModel.getProperty("/reference") && oCreateModel.getProperty("/invoiceDate")
                && this.getView().getModel("companyListModel").getProperty("/value") && this.getView().getModel("vendorListModel").getProperty("/value")) {
                bMandatoryValuesPresent = true;
            } else {
                bMandatoryValuesPresent = false;
            }

            if (oCreateModel.getProperty("/oneTimeVendor") && oCreateModel.getProperty("/oneTimeVendorCity")
                && this.getView().getModel("oneTimeVendorCountryModel").getProperty("/value") && oCreateModel.getProperty("/oneTimeVendorName")) {

                bMandatoryCheckValuesPresent = true;
            } else {
                bMandatoryCheckValuesPresent = false;
            }

            if (bMandatoryValuesPresent && !oCreateModel.getProperty("/oneTimeVendor")) {
                this.getOwnerComponent().getRouter().navTo("AddItem", {}, true);

            } else if (bMandatoryCheckValuesPresent && bMandatoryValuesPresent) {
                this.getOwnerComponent().getRouter().navTo("AddItem", {}, true);

            } else {

                if (!oCreateModel.getProperty("/oneTimeVendorName") && oCreateModel.getProperty("/oneTimeVendor")) {
                    oCreateModel.setProperty("/errorName", "Error");
                }
                if (!oCreateModel.getProperty("/amount")) {
                    oCreateModel.setProperty("/errorAmount", "Error");
                }
                if (!oCreateModel.getProperty("/reference")) {
                    oCreateModel.setProperty("/errorReference", "Error");
                }
                if (!this.getView().getModel("companyListModel").getProperty("/value")) {
                    this.getView().getModel("companyListModel").setProperty("/error", "Error");
                }
                if (!this.getView().getModel("vendorListModel").getProperty("/value")) {
                    this.getView().getModel("vendorListModel").setProperty("/error", "Error");
                }
                if (!this.getView().getModel("oneTimeVendorCityModel").getProperty("/value") && oCreateModel.getProperty("/oneTimeVendor")) {
                    this.getView().getModel("oneTimeVendorCityModel").setProperty("/error", "Error");
                }
                if (!this.getView().getModel("oneTimeVendorCountryModel").getProperty("/value") && oCreateModel.getProperty("/oneTimeVendor")) {
                    this.getView().getModel("oneTimeVendorCountryModel").setProperty("/error", "Error");
                }

                MessageToast.show("Please fill mandatory fields");

            }
        },

        // set the parameters
        setParameters: function (oDialog) {
            var oParam = Util.oParamObject,
                oCreateModel = this.getView().getModel('createModel'),
                oCompanyModel = this.getView().getModel('companyListModel'),
                oVendorModel = this.getView().getModel('vendorListModel'),
                oCurrencyModel = this.getView().getModel('currencyListModel'),
                oCountryModel = this.getView().getModel('oneTimeVendorCountryModel'),
                oRequesterModel = this.getView().getModel('requesterModel'),
                oPaymentMethodModel = this.getView().getModel('paymentMethodListModel'),
                oPaymentListModel = this.getView().getModel('paymentTermListModel'),
                oItemDetailModel = this.getView().getModel('ItemDetails'),
                aItemData = oItemDetailModel.getProperty('/data');
            var sExchange, sCurrency;

            if (oCurrencyModel.getProperty("/value")) {
                sCurrency = oCurrencyModel.getProperty("/value");
            } else {
                sCurrency = "";
            }
            //var user = sap.ushell.Container.getService("UserInfo");
            oParam.invoiceDetails.headerDetail.companyCodeCurrency = Util.currency;
            oParam.invoiceDetails.headerDetail.invoiceTotalAmount = oCreateModel.getProperty('/invoiceTotalAmount');
            oParam.invoiceDetails.headerDetail.taxAmount = oCreateModel.getProperty('/taxAmount');
            oParam.invoiceDetails.headerDetail.initiator = "Satya Sunil";//user.getUser().getFullName();
            oParam.invoiceDetails.headerDetail.initiatorMailId = "kvv.satyasunil@gmail.com";//"user.getUser().getEmail();
            oParam.invoiceDetails.headerDetail.initiatorComments = oDialog.getContent()[1].getValue();
            oParam.invoiceDetails.headerDetail.countryCode = Util.sCountry;
            oParam.invoiceDetails.headerDetail.oneTimeVendorName = oCreateModel.getProperty('/oneTimeVendorName') ? oCreateModel.getProperty('/oneTimeVendorName') : "";
            oParam.invoiceDetails.headerDetail.invoiceAmount = parseFloat(oCreateModel.getProperty('/amount')) ? parseFloat(oCreateModel.getProperty('/amount')) : 0;
            oParam.invoiceDetails.headerDetail.invoiceDate = oCreateModel.getProperty('/invoiceDate');
            oParam.invoiceDetails.headerDetail.reference = oCreateModel.getProperty('/reference') ? oCreateModel.getProperty('/reference') : "";
            oParam.invoiceDetails.headerDetail.requesterName = oCreateModel.getProperty('/requesterName') ? oCreateModel.getProperty('/requesterName') : "";
            oParam.invoiceDetails.headerDetail.oneTimeVendor = oCreateModel.getProperty('/oneTimeVendor');
            oParam.invoiceDetails.headerDetail.currency = sCurrency;
            oParam.invoiceDetails.headerDetail.text = oCreateModel.getProperty('/text') ? oCreateModel.getProperty('/text') : "";
            oParam.invoiceDetails.headerDetail.invoiceDueDate = oCreateModel.getProperty('/dueDate');
            oParam.invoiceDetails.headerDetail.exchangeRate = oCreateModel.getProperty('/exchangeRate') ? parseFloat(oCreateModel.getProperty('/exchangeRate')) : 0;
            oParam.invoiceDetails.headerDetail.oneTimeVendorCity = oCreateModel.getProperty('/oneTimeVendorCity') ? oCreateModel.getProperty('/oneTimeVendorCity') : "";
            oParam.invoiceDetails.headerDetail.oneTimeVendorCountry = oCountryModel.getProperty('/value') ? oCountryModel.getProperty('/value') : "";
            oParam.invoiceDetails.headerDetail.oneTimeVendorCountryDesc = oCountryModel.getProperty('/desc') ? oCountryModel.getProperty('/desc') : "";
            oParam.invoiceDetails.headerDetail.requester = oRequesterModel.getProperty('/value') ? oRequesterModel.getProperty('/value') : "";
            oParam.invoiceDetails.headerDetail.paymentMethod = oPaymentMethodModel.getProperty('/value') ? oPaymentMethodModel.getProperty('/value') : "";
            oParam.invoiceDetails.headerDetail.paymentTerm = oPaymentListModel.getProperty('/value') ? oPaymentListModel.getProperty('/value') : "";
            oParam.invoiceDetails.headerDetail.companyCode = oCompanyModel.getProperty("/value") ? oCompanyModel.getProperty("/value") : "";
            oParam.invoiceDetails.headerDetail.vendorNumber = oVendorModel.getProperty('/value') ? oVendorModel.getProperty('/value') : "";
            oParam.invoiceDetails.headerDetail.paymentMethodDesc = oPaymentMethodModel.getProperty('/desc') ? oPaymentMethodModel.getProperty('/desc') : "";
            oParam.invoiceDetails.headerDetail.paymentTermDesc = oPaymentListModel.getProperty('/desc') ? oPaymentListModel.getProperty('/desc') : "";
            oParam.invoiceDetails.headerDetail.companyCodeDesc = oCompanyModel.getProperty("/desc") ? oCompanyModel.getProperty("/desc") : "";
            oParam.invoiceDetails.headerDetail.vendorNumberDesc = oVendorModel.getProperty('/desc') ? oVendorModel.getProperty('/desc') : "";
            oParam.invoiceDetails.paymentTerms.push({ "days": parseInt(oCreateModel.getProperty('/days1')) ? parseInt(oCreateModel.getProperty('/days1')) : 0, "percentageAmount": parseInt(oCreateModel.getProperty('/discount1')) ? parseInt(oCreateModel.getProperty('/discount1')) : 0 });
            oParam.invoiceDetails.paymentTerms.push({ "days": parseInt(oCreateModel.getProperty('/days2')) ? parseInt(oCreateModel.getProperty('/days2')) : 0, "percentageAmount": parseInt(oCreateModel.getProperty('/discount2')) ? parseInt(oCreateModel.getProperty('/discount2')) : 0 });
            oParam.invoiceDetails.paymentTerms.push({ "days": parseInt(oCreateModel.getProperty('/days3')) ? parseInt(oCreateModel.getProperty('/days3')) : 0, "percentageAmount": 0 });

            if (aItemData.length) {
                for (var i = 0; i < aItemData.length; i++) {
                    oParam.invoiceDetails.items.push(aItemData[i]);
                }
            } else {
                oParam.invoiceDetails.items.push({
                    "glAccount": "",
                    "costCenter": "",
                    "amount": 0,
                    "currencykey": "",
                    "taxCode": "",
                    "businessArea": "",
                    "profitCenter": "",
                    "plant": "",
                    "itemText": "",
                    "internalOrder": "",
                    "glAccountDesc": "",
                    "costCenterDesc": "",
                    "taxCodeDesc": "",
                    "countryCode": Util.sCountry,
                    "businessAreaDesc": "",
                    "profitCenterDesc": "",
                    "plantDesc": "",
                    "internalOrderDesc": ""

                })
            }
        },
        // To set the Count of the Attachments uploaded
        setAttachmentCount: function (iCount) {
            if (!iCount || iCount === 0) {
                iCount = 0;
            }
            return "Attachments(" + iCount + ")";
        },
        // Function to handle Delete button in item table
        onDeleteDetailItem: function (oEvent) {

            var sPath = oEvent.getSource().getBindingContext("ItemDetails").sPath,
                iIndex = sPath && sPath.split("/")[2];
            oEvent.getSource().getBindingContext("ItemDetails").getProperty("/data").splice(iIndex, 1);
            this.getView().getModel("ItemDetails").updateBindings(true);

            var aData = oEvent.getSource().getBindingContext("ItemDetails").getProperty("/data");

            if (!aData.length) {
                this.getView().getModel('currencyListModel').setProperty('/enable', true);
                this.getView().getModel('createModel').setProperty("/invoiceTotalAmount", "");
                this.getView().getModel('createModel').setProperty("/taxAmount", "");
            } else {
                Util.triggerTaxCalculationICf();
            }
        },
        // Function to handle Edit button in Item Details Table
        onEditItemDetails: function (oEvent) {
            var sPath = oEvent.getSource().getBindingContext("ItemDetails").sPath,
            oProperty = oEvent.getSource().getBindingContext("ItemDetails").getProperty(sPath),
            oItemModel = Util.addItemView.getModel("AddItemModel");
            oItemModel.setProperty('/amount', oProperty.amount);
            Util.addItemView.getModel("businessAreaModel").setProperty("/value", oProperty.businessArea);
            Util.addItemView.getModel("businessAreaModel").setProperty("/desc", oProperty.businessAreaDesc);
            Util.addItemView.getModel("costCenterModel").setProperty("/value", oProperty.costCenter);
            Util.addItemView.getModel("costCenterModel").setProperty("/desc", oProperty.costCenterDesc);
            Util.addItemView.getModel("plantModel").setProperty("/value", oProperty.plant);
            Util.addItemView.getModel("plantModel").setProperty("/desc", oProperty.plantDesc);
            oItemModel.setProperty('/currencyKey', oProperty.currencyKey);
            Util.addItemView.getModel("GLAccountModel").setProperty("/value", oProperty.glAccount);
            Util.addItemView.getModel("GLAccountModel").setProperty("/desc", oProperty.glAccountDesc);
            Util.addItemView.getModel("profitCenterModel").setProperty("/value", oProperty.profitCenter);
            Util.addItemView.getModel("profitCenterModel").setProperty("/desc", oProperty.profitCenterDesc);
            Util.addItemView.getModel("taxCodeModel").setProperty("/value", oProperty.taxCode);
            Util.addItemView.getModel("taxCodeModel").setProperty("/desc", oProperty.taxCodeDesc);
            Util.addItemView.getModel("internalOrderModel").setProperty("/value", oProperty.internalOrder);
            Util.addItemView.getModel("internalOrderModel").setProperty("/desc", oProperty.internalOrderDesc);
            oItemModel.setProperty('/itemText', oProperty.itemText);
            this.getOwnerComponent().getRouter().navTo("AddItem", {}, true);
            Util.sPath = sPath;

        },
        // Function to handle Message Pop-Over 
        handleMessagePopoverPress: function (oEvent) {
            if (!this.oMessagePopover) {
                this.createMessagePopover();
            }
            if (oEvent) {
                this.oMessagePopover.toggle(oEvent.getSource());
            } else {
                this.oMessagePopover.toggle(this.getView().byId("messagePopoverBtn"));
            }
        },
        // Function to create Message Pop-Over
        createMessagePopover: function () {
            var oMessageTemplate = new MessageItem({
                type: '{type}',
                title: '{message}'
            });

            this.oMessagePopover = new MessagePopover({
                items: {
                    path: '/Errors',
                    template: oMessageTemplate
                }
            });
            this.getView().byId("messagePopoverBtn").addDependent(this.oMessagePopover);
            this.oMessagePopover.setModel(this.getView().getModel("createModel"));
        },

        // Function to handle both Submit and Live change of value help fields
        onsubmitValue: function (oEvent) {
            console.log(oEvent.getSource().getValue());
            var sName = oEvent.getSource().getName(),
                sValue = oEvent.getSource().getValue(),
                oModel = this.getView().getModel("createModel"),
                bDontTriggerCall = false;

            if (!sValue || sValue === " ") {
                bDontTriggerCall = true;
            } else {
                sValue = sValue.toUpperCase();
            }

            if (sName === "oneTimeVendorName" && oModel.getProperty("/oneTimeVendorName")) {
                oModel.setProperty("/errorName", "None");
            } else if (sName === "amount" && oModel.getProperty("/amount")) {

                if (Util.addItemView) {
                    var iAmount = Util.ItemAmount;
                    if (iAmount) {
                        if (parseInt(oModel.getProperty("/amount")) === iAmount) {
                            oModel.setProperty("/errorAmount", "None");
                        } else {
                            oModel.setProperty("/errorAmount", "Error");
                        }
                    } else {
                        oModel.setProperty("/errorAmount", "None");
                    }
                } else {
                    oModel.setProperty("/errorAmount", "None");
                }

                if (this.getView().getModel('createModel').getProperty("/taxAmount")) {

                    oModel.setProperty("/invoiceTotalAmount", (parseFloat(this.getView().getModel('createModel').getProperty("/taxAmount")) + parseFloat(sValue)).toFixed(2));
                }
            } else if (sName === "reference" && oModel.getProperty("/reference")) {
                oModel.setProperty("/errorReference", "None");
            } else if (sName === "Company Code") {
                this.companycodeflag = 1;
                this.deadlockflag = 1;
                this.getView().getModel("companyListModel").setProperty("/value", sValue);
                this.getOwnerComponent().getModel("universalModel").setProperty("/companyCodeValue", sValue);
                if (!bDontTriggerCall) {
                    Util.getValueHelpDialog(this.getView(), sName, true, sValue);
                } else {
                    this.getView().getModel("companyListModel").setProperty("/desc", "");
                    this.getView().getModel("companyListModel").setProperty("/error", "None");
                    this.getView().getModel("companyListModel").updateBindings(true);
                }

            } else if (sName === "Vendor") {
                this.vendorflag = 1;
                this.deadlockflag = 1;
                this.getView().getModel("vendorListModel").setProperty("/value", sValue);
                if (!bDontTriggerCall) {
                    Util.getValueHelpDialog(this.getView(), sName, true, sValue);
                } else {
                    this.getView().getModel("vendorListModel").setProperty("/desc", "");
                    this.getView().getModel("vendorListModel").setProperty("/error", "None");
                    this.getView().getModel("vendorListModel").updateBindings(true);
                }
            } else if (sName === "Requester") {
                this.getView().getModel("requesterModel").setProperty("/value", sValue);
                if (!bDontTriggerCall) {
                    Util.getValueHelpDialog(this.getView(), sName, true, sValue, "SecondCall");
                } else {
                    this.getView().getModel("requesterModel").setProperty("/desc", "");
                    this.getView().getModel("requesterModel").setProperty("/error", "None");
                    this.getView().getModel("requesterModel").updateBindings(true);
                }
            } else if (sName === "Currency") {
                this.getView().getModel("currencyListModel").setProperty("/value", sValue);
                if (!bDontTriggerCall) {
                    Util.getValueHelpDialog(this.getView(), sName, true, sValue);
                } else {
                    this.getView().getModel("currencyListModel").setProperty("/desc", "");
                    this.getView().getModel("currencyListModel").setProperty("/error", "None");
                }
            } else if (sName === "One-time Vendor Country") {
                this.getView().getModel("oneTimeVendorCountryModel").setProperty("/value", sValue);
                if (!bDontTriggerCall) {
                    Util.getValueHelpDialog(this.getView(), sName, true, sValue);
                } else {
                    this.getView().getModel("oneTimeVendorCountryModel").setProperty("/desc", "");
                    this.getView().getModel("oneTimeVendorCountryModel").setProperty("/error", "None");
                }
            } else if (sName === "Payment Methods") {
                this.getView().getModel("paymentMethodListModel").setProperty("/value", sValue);
                if (!bDontTriggerCall) {

                    Util.triggerCallToGetparameterData(this.getView(), sName, true, sValue);
                } else {
                    this.getView().getModel("paymentMethodListModel").setProperty("/desc", "");
                    this.getView().getModel("paymentMethodListModel").setProperty("/error", "None");
                }
            } else if (sName === "Payment Terms") {
                this.getView().getModel("paymentTermListModel").setProperty("/value", sValue);
                if (!bDontTriggerCall) {
                    Util.getValueHelpDialog(this.getView(), sName, true, sValue);
                } else {
                    this.getView().getModel("paymentTermListModel").setProperty("/desc", "");
                    this.getView().getModel("paymentTermListModel").setProperty("/error", "None");
                }
            } else if (sName === "days3" && parseInt(oModel.getProperty("/days3"))) {
                var sInvoiceDate = Util.invoiceDatePicker.getDateValue() && Util.invoiceDatePicker.getDateValue().getTime(),
            // Due Date Calcution based on Invoice date and Days fields    
                oNewTime;

                if (sInvoiceDate) {
                    this.getView().byId("dueDatePicker").setValue(undefined);
                    if (this.getView().byId("dueDatePicker")) {
                        oNewTime = new Date(sInvoiceDate);
                        oNewTime.setDate(oNewTime.getDate() + parseInt(oModel.getProperty("/days3")));                     
                        this.getView().byId("dueDatePicker").setDateValue(new Date(oNewTime))
                    }
                } else {
                    MessageToast.show("Please enter invoice date");
                }
            } else if (sName === "days2" && parseInt(oModel.getProperty("/days2")) && !parseInt(oModel.getProperty("/days3"))) {
                var sInvoiceDate = Util.invoiceDatePicker.getDateValue() && Util.invoiceDatePicker.getDateValue().getTime(),
                    oNewTime;

                if (sInvoiceDate) {
                    this.getView().byId("dueDatePicker").setValue(undefined);
                    if (this.getView().byId("dueDatePicker")) {
                        oNewTime = new Date(sInvoiceDate);
                        oNewTime.setDate(oNewTime.getDate() + parseInt(oModel.getProperty("/days2")));
                        this.getView().byId("dueDatePicker").setDateValue(new Date(oNewTime))
                    }
                } else {
                    MessageToast.show("Please enter invoice date");
                }

            } else if (sName === "days1" && !parseInt(oModel.getProperty("/days2")) && !parseInt(oModel.getProperty("/days3")) && parseInt(oModel.getProperty("/days1"))) {
                var sInvoiceDate = Util.invoiceDatePicker.getDateValue() && Util.invoiceDatePicker.getDateValue().getTime(),
                    oNewTime;

                if (sInvoiceDate) {
                    this.getView().byId("dueDatePicker").setValue(undefined);
                    if (this.getView().byId("dueDatePicker")) {
                        oNewTime = new Date(sInvoiceDate);
                        oNewTime.setDate(oNewTime.getDate() + parseInt(oModel.getProperty("/days1")));                        
                        this.getView().byId("dueDatePicker").setDateValue(new Date(oNewTime))
                    }
                } else {
                    MessageToast.show("Please enter invoice date");
                }
            }
            
            if (sName !== "Vendor") {
                this._populatePaymentTerm();
            }

        },
        // Function to automatic population of Payment Terms
        _populatePaymentTerm: function () {
            if (this.vendorflag && this.deadlockflag || this.companycodeflag && this.deadlockflag || this.invoicedateflag && this.deadlockflag) {
                this.deadlockflag = 0;
                var sCC = this.getView().getModel("companyListModel").getProperty("/value"),
                    sVendor = this.getView().getModel("vendorListModel").getProperty("/value");
                var oData = {
                    "vendorNo": sVendor,
                    "companyCode": sCC
                };
                oData = JSON.stringify(oData);
                if (sCC && sVendor) {
                    jQuery.ajax({
                        url: this._getCPIBaseURL() + "getVendorDetails",
                        type: "POST",
                        data: oData,
                        contentType: "application/json",
                        success: jQuery.proxy(this._handlePTSuccess, this),
                        error: jQuery.proxy(this._handleError, this)
                    });
                }
            }
        },
        // Success handle of Payment terms auto population
        _handlePTSuccess: function (oResponse, sMsg, data) {
            if (oResponse.root) {
                this.getView().getModel("paymentTermListModel").setProperty("/value", oResponse.root.paymentTerm);
                this.getView().byId("idPaymentTermInput").fireEvent("liveChange");
            }
        },        
        triggerBackendCallToValidate: function () {

        },
        // Payment terms auto population
        onDateSelection: function (oEvent) {
            this.invoicedateflag = 1;
            this.deadlockflag = 1;
            this._populatePaymentTerm();  
            Util.invoiceDatePicker = oEvent.getSource();
        },
        // Exchange rate field validation for negative values
        onExchangeValidate: function (oEvnt) {

            var oSource = oEvnt.getSource(),
                sValue = oEvnt.getParameters().value, sFinalValue;

            if (!sValue) {
                oSource.setValueState("None");
                oSource.setValueStateText("");
            } else {
                // check overall string for valid input
                var oRegExpFull = new RegExp("^[0-9]", "g");
                if (!sValue.match(oRegExpFull)) {
                    oSource.setValueState("Error");
                    oSource.setValueStateText("Please enter only Positive Numbers");
                    this.getView().getModel('createModel').setProperty("/exchangeRate", sValue);
                    return sValue;
                } else {
                    oSource.setValueState("None");
                    oSource.setValueStateText("");
                    this.getView().getModel('createModel').setProperty("/exchangeRate", sValue);
                    return sValue;
                }
            }
        } 		
    });
}, /* bExport= */ true);