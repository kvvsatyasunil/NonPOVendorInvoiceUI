sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/comp/filterbar/FilterBar",
    "sap/ui/comp/filterbar/FilterGroupItem",
    "sap/m/MessageToast"
], function (JSONModel, Filter, FilterOperator, FilterBar, FilterGroupItem, MessageToast) {
    "use strict";
    return {
        componentPath: "",
        busyLoader: new sap.m.BusyDialog(),
        // Creating "nonPOVendorInvoiceModel" model
        getModel: new JSONModel({
            stitle: "",
            sDialogKey: "",
            sDialogDes: ""
        }, "nonPOVendorInvoiceModel"),

        addItemView: "",
        // Request parameters for Work Flow Instance
        oParamObject: {
            "invoiceDetails": {
                "attachments": {

                },
                "items": [
                ],
                "paymentTerms": [
                ],
                "headerDetail": {
                    "companyCode": "",
                    "requester": "",
                    "oneTimeVendorCountry": "",
                    "initiator": "",
                    "initiatorMailId": "",
                    "invoiceAmount": "",
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
        },
        // Request Parameters for Check Invoice CPI
        checkInvoice: {

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

        },

        // Storing componentPath for reference
        setComponentPath: function (oComponentPath) {
            this.componentPath = oComponentPath;
        },
        //Retrieve component path and CPI destination
        _getCPIBaseURL: function () {

            return this.componentPath + "/CPI/http/";
        },
        _getRuleServiceBaseURL: function () {

            return this.componentPath + "/bpmrulesruntime/rules-service/rest/v2";
        },
        // Value helps dialog for Header and Item Value helps
        getValueHelpDialog: function (oView, sName, bValidate, sInputValue, sCall, sParameter) {
            var sUrl, sTitle, oData, sCode, bTrigger, sValue = undefined;

            this.sName = sName;
            this.sInputValue = sInputValue;
            var sLang = sap.ui.getCore().getConfiguration().getLanguage();
            var sLanguage = sLang && sLang.split("-") && sLang.split("-")[0] && sLang.split("-")[0].toUpperCase() && sLang.split("-")[0].toUpperCase().substring(0,1);
            this.oView = oView;
            this.bValidate = bValidate;

            if (sName === "One-time Vendor Country" || sName === "Currency") {
                var sRequestId;
                if (sName === "One-time Vendor Country") {
                    sTitle = "Select Vendor Country";
                    this.sModelName = "oneTimeVendorCountryModel";
                    sRequestId = "0ed11fb1ae33491c97e5a14f3814c835";
                } else if (sName === "Currency") {
                    sTitle = "Select Currency";
                    this.sModelName = "currencyListModel";
                    sRequestId = "3ddde47f1ad24284b3a641686f9ad15e";
                }

                sUrl = this._getRuleServiceBaseURL() + "/workingset-rule-services";

                oData = JSON.stringify({
                    RuleServiceId: sRequestId,
                    Vocabulary: [{ Language: { LanguageKey: sLanguage } }]
                });

                var sToken = this._fetchToken();

                this.oSelectedModel = this.oView.getModel(this.sModelName);

                $.ajax({
                    url: sUrl,
                    method: "POST",
                    async: false,
                    contentType: "application/json",
                    headers: {
                        "X-CSRF-Token": sToken
                    },
                    data: oData,
                    success: $.proxy(function (response) {
                        if (this.sModelName === "oneTimeVendorCountryModel") {
                            if (response.Result[0] && Array.isArray(response.Result[0].CountryList) && response.Result[0].CountryList.length) {
                                this.oView.getModel(this.sModelName).setProperty("/List", response.Result[0].CountryList);

                            } else if (typeof sResult.root.CountryList === "object") {
                                this.oView.getModel(this.sModelName).setProperty("/List", [sResult.root.CountryList]);

                            }
                            if (this.bValidate) {
                                this.validateInputValue(this.oView.getModel(this.sModelName), "oneTimeVendorCountry");
                            }

                        } else if (this.sModelName === "currencyListModel") {
                            if (response.Result[0] && Array.isArray(response.Result[0].CurrencyList) && response.Result[0].CurrencyList.length) {


                                this.oView.getModel(this.sModelName).setProperty("/List", response.Result[0].CurrencyList);

                            } else if (typeof sResult.root.CurrencyList === "object") {

                                this.oView.getModel(this.sModelName).setProperty("/List", [sResult.root.CurrencyList]);

                            }
                            if (this.bValidate) {
                                this.validateInputValue(this.oView.getModel(this.sModelName), "Currency");
                            }

                        }
                    }.bind(this)),
                    error: function (res) {
                    }.bind(this)
                })
            } else {

                if (this.sName === "Company Code") {
                    sUrl = this._getCPIBaseURL() + "getCompanyCode";
                    sTitle = "Select Company Code";
                    this.sModelName = "companyListModel";
                    oData = {
                        companyCode: "**"
                    };
                    sCode = "companyCode";
                } else if (this.sName === "Vendor") {
                    sTitle = "Select Vendor";
                    this.sModelName = "vendorListModel";
                    sCode = "vendorCode";
                    bTrigger = true;
                    if (bValidate) {
                        this.sUrl = sUrl = this._getCPIBaseURL() + "getVendorcode";
                        oData = {
                            "vendorNumber": sInputValue,
                            "vendorName": ""
                        };
                        sValue = sInputValue;
                    }
                } else if (this.sName === "costCenter") {
                    sUrl = this._getCPIBaseURL() + "getCostcentre";
                    sTitle = "Select Cost Center";
                    this.sModelName = "costCenterModel";
                    oData = {
                        "companyCode": this.createView.getModel('companyListModel').getProperty('/value'),
                        "costCenter": "**"
                    };
                    if (bValidate) {
                        sValue = sInputValue;
                    }
                } else if (this.sName === "plant") {
                    sTitle = "Select Plant";
                    this.sModelName = "plantModel";
                    sUrl = this._getCPIBaseURL() + "getPlantInfo";
                    this.sModelName = "plantModel";
                    oData = {
                        "plant": "*" + "*"
                    };
                    if (bValidate) {
                        sValue = sInputValue;
                    }

                } else if (sName === "Payment Terms") {
                    if (this.invoiceDatePicker && this.invoiceDatePicker.getDateValue() || this.oView.byId("invoiceDate").getDateValue()) {
                        sUrl = this._getCPIBaseURL() + "getPaymentTerm";
                        sTitle = "Select Payment Terms";
                        this.sModelName = "paymentTermListModel";
                        oData = {
                            "language": sLanguage
                        };
                        sCode = "paymentTerm";
                    } else {
                        // MessageToast.show("Please select the invoice date");
                        return;
                    }
                } else if (sName === "Payment Methods") {
                    if (oView.getModel('companyListModel').getProperty('/value')) {
                        sUrl = this._getCPIBaseURL() + "getPaymentMethodDescription";
                        sTitle = "Select Payment Method";
                        this.sModelName = "paymentMethodListModel";
                        oData = {
                            "country": sParameter
                        };
                        sCode = "paymentMethod";
                    } else {
                        MessageToast.show("Please select Company code before selecting Payment Method");
                        return;
                    }
                } else if (sName === "GLAccount") {
                    sUrl = this._getCPIBaseURL() + "getGLAccount";
                    sTitle = "Select Account";
                    this.sModelName = "GLAccountModel";
                    oData = {
                        "language": sLanguage,
                        "companyCode": this.createView.getModel('companyListModel').getProperty('/value')
                    };
                    if (bValidate) {
                        sValue = sInputValue;
                    }
                } else if (sName === "taxCode") {
                    sUrl = this._getCPIBaseURL() + "getTaxcode";
                    sTitle = "Select Tax Code";
                    this.sModelName = "taxCodeModel";
                    oData = {
                        "language": sLanguage,
                        "taxProcedure": sParameter
                    };
                    if (bValidate) {
                        sValue = sInputValue;
                    }
                } else if (sName === "businessArea") {
                    sUrl = this._getCPIBaseURL() + "getBusinessArea";
                    sTitle = "Select Business Area";
                    this.sModelName = "businessAreaModel";
                    oData = {
                        "language": sLanguage,
                        "businessArea": ""
                    };
                    if (bValidate) {
                        sValue = sInputValue;
                    }
                } else if (sName === "profitCenter") {
                    sUrl = this._getCPIBaseURL() + "getProfitCentre";
                    sTitle = "Select Profit Center";
                    this.sModelName = "profitCenterModel";
                    oData = {
                        "controllingArea": this.createView.getModel('companyListModel').getProperty('/value')
                    };
                    if (bValidate) {
                        sValue = sInputValue;
                    }
                } else if (this.sName === "internalOrder") {
                    sTitle = "Select Internal Order";
                    this.sModelName = "internalOrderModel";
                    sCode = "internalOrder";
                    sValue = this.createView.getModel(this.sModelName).getProperty('/value');
                    sUrl = this._getCPIBaseURL() + "getInternalOrder";
                    if (bValidate) {
                        var sSearchString = "%" + sInputValue + "%";
                        oData = {
                            "internalOrder": sSearchString.toUpperCase(),
                            "companyCode": this.createView.getModel('companyListModel').getProperty('/value'),
                            "description": "",
                            "maxRows": 100
                        };
                        var sCall;
                        sCall = "SecondCall";
                    }
                    bTrigger = true;
                } else if (this.sName === "Requester") {
                    sTitle = "Select User";
                    this.sModelName = "requesterModel";
                    this.sUrl = sUrl = this._getCPIBaseURL() + "getUserList";
                    bTrigger = true;
                    if (bValidate) {
                        oData = {
                            "userId": "*" + sInputValue + "*",
                            "maxRow": 100,
                            "fname": "",
                            "lname": "",
                            "parameter": "USERNAME",
                            "field": ""

                        };
                        var sCall;
                        sValue = sInputValue;
                        if (sInputValue) {
                            sCall = "SecondCall";
                        } else {
                            sCall = undefined;
                        }
                    }
                }

                this.oView = oView;
                if (bValidate) {
                    bTrigger = false;
                }

                this.oSelectedModel = oView.getModel(this.sModelName);

                if (!bTrigger) {

                    this.triggerBackendService(oData, oView, sUrl, sValue, bValidate, sCall);

                }

            }

            if (!bValidate) {
                this.oF4HelpDialog = sap.ui.xmlfragment("com.sap.cp.dpa.invwpo.ReworkUI.fragment.valueHelpDialog", this);
                this.setDialogContent(oView.getModel(this.sModelName), sTitle);
                oView.addDependent(this.oF4HelpDialog);

                this.oF4HelpDialog.setTitle(sTitle);
                this.oF4HelpDialog.open();
            }
        },
        // Function to trigger the CPI based on Input field selected
        triggerBackendService: function (oData, oView, sUrl, sValue, bValidate, sCall) {
            var data = JSON.stringify(oData);

            jQuery.ajax({
                url: sUrl,
                type: "POST",
                data: data,
                contentType: "application/json",
                success: this.handleFetchData.bind(this, oView, sValue, bValidate, sCall),
                error: this.handleICFCallbackError.bind(this, oView)
            });

        },
        // Setting the content to the Value Help Dialog
        setDialogContent: function (oModel, sTitle) {
            this._oBasicSearchField = new sap.m.SearchField({
                showSearchButton: false
            });


            var oFilterBar = new FilterBar({
                search: this.onFilterBarSearch.bind(this, oModel)
            });

            oFilterBar.setFilterBarExpanded(false);
            oFilterBar.setBasicSearch(this._oBasicSearchField);
            oFilterBar.setAdvancedMode(true);
            this.getModel.setProperty("/sDialogDes", "text");
            this.getModel.setProperty("/sDialogKey", "code");
            this.getModel.setProperty("/sTitle", sTitle);

            if (this.sModelName === "companyListModel") {

                var label1 = "Company Code",
                    label2 = "Description",
                    sLabel1 = "CompanyCode",
                    sLabel2 = "Company Description";
            } else if (this.sModelName === "oneTimeVendorCountryModel") {

                var label1 = "Country Code",
                    label2 = "Description",
                    sLabel1 = "CountryCode",
                    sLabel2 = "CountryDescription";

            } else if (this.sModelName === "currencyListModel") {

                var label1 = "Currency Code",
                    label2 = "Currency Description",
                    sLabel1 = "CurrencyCode",
                    sLabel2 = "CurrencyDescription";

            } else if (this.sModelName === "vendorListModel") {

                var label1 = "Vendor",
                    label2 = "Name",
                    sLabel1 = "Vendor Number",
                    sLabel2 = "Vendor Description";

            } else if (this.sModelName === "profitCenterModel") {

                var label1 = "Vendor",
                    label2 = "Name",
                    sLabel1 = "Vendor Number",
                    sLabel2 = "Vendor Description";

                var oCompanyGroupItemCode = new FilterGroupItem({
                    groupName: "companyCode",
                    name: "Profit1",
                    label: sLabel1,
                    visibleInFilterBar: true,
                    control: new sap.m.Input({
                        name: "Profit1"
                    })
                });
                oFilterBar.addFilterGroupItem(oCompanyGroupItemCode);

            } else if (this.sModelName === "plantModel") {

                var label1 = "Vendor",
                    label2 = "Name",
                    sLabel1 = "Vendor Number",
                    sLabel2 = "Vendor Description";

                var oCompanyGroupItemCode = new FilterGroupItem({
                    groupName: "companyCode",
                    name: "Plant1",
                    label: sLabel1,
                    visibleInFilterBar: true,
                    control: new sap.m.Input({
                        name: "Plant1"
                    })
                });
                oFilterBar.addFilterGroupItem(oCompanyGroupItemCode);

            } else if (this.sModelName === "paymentTermListModel") {

                var label1 = "Vendor",
                    label2 = "Name",
                    sLabel1 = "Vendor Number",
                    sLabel2 = "Vendor Description";

            } else if (this.sModelName === "paymentMethodListModel") {

                var label1 = "Vendor",
                    label2 = "Name",
                    sLabel1 = "Vendor Number",
                    sLabel2 = "Vendor Description";

            } else if (this.sModelName === "vendorListModel") {

                var label1 = "Vendor",
                    label2 = "Name",
                    sLabel1 = "Vendor Number",
                    sLabel2 = "Vendor Description";

            } else if (this.sModelName === "costCenterModel") {

                var label1 = "costCenter",
                    label2 = "description",
                    sLabel1 = "Cost Center",
                    sLabel2 = "Description";

                var oCompanyGroupItemCode = new FilterGroupItem({
                    groupName: "companyCode",
                    name: "Cost1",
                    label: sLabel1,
                    visibleInFilterBar: true,
                    control: new sap.m.Input({
                        name: "Cost2"
                    })
                });
                oFilterBar.addFilterGroupItem(oCompanyGroupItemCode);

            } else if (this.sModelName === "GLAccountModel") {

                var label1 = "GLAccount",
                    label2 = "Name",
                    sLabel1 = "Vendor Number",
                    sLabel2 = "Vendor Description";

                var oCompanyGroupItemAccount = new FilterGroupItem({
                    groupName: "companyCode",
                    name: "GLA1",
                    label: sLabel1,
                    visibleInFilterBar: true,
                    control: new sap.m.Input({
                        name: "GLA1"
                    })
                });
                oFilterBar.addFilterGroupItem(oCompanyGroupItemAccount);

                var oCompanyGroupItemDesc = new FilterGroupItem({
                    groupName: "companyCode",
                    name: "GLA2",
                    label: sLabel2,
                    visibleInFilterBar: true,
                    control: new sap.m.Input({
                        name: "GLA2"
                    })
                });
                oFilterBar.addFilterGroupItem(oCompanyGroupItemDesc);

            } else if (this.sModelName === "requesterModel") {

                var label1 = "GLAccount",
                    label2 = "Name",
                    sLabel1 = "First Name",
                    sLabel2 = "Last Name";

                var oCompanyGroupItemAccount = new FilterGroupItem({
                    groupName: "UserList",
                    name: "User1",
                    label: sLabel1,
                    visibleInFilterBar: false,
                    control: new sap.m.Input({
                        name: "User1"
                    })
                });
                oFilterBar.addFilterGroupItem(oCompanyGroupItemAccount);

                var oCompanyGroupItemDesc = new FilterGroupItem({
                    groupName: "UserList",
                    name: "User2",
                    label: sLabel2,
                    visibleInFilterBar: false,
                    control: new sap.m.Input({
                        name: "User2"
                    })
                });
                oFilterBar.addFilterGroupItem(oCompanyGroupItemDesc);

            } else {
                label1 = "Dialog1",
                    label2 = "Dialog2"
            }

            var oCompanyGroupItemCode = new FilterGroupItem({
                groupName: "companyCode",
                name: label1,
                label: sLabel1,
                visibleInFilterBar: true,
                control: new sap.m.Input({
                    name: label1
                })
            });
            oFilterBar.addFilterGroupItem(oCompanyGroupItemCode);

            var oCompanyGroupItemName = new FilterGroupItem({
                groupName: "companyCode",
                name: label2,
                label: sLabel2,
                visibleInFilterBar: true,
                control: new sap.m.Input({
                    name: label2
                })
            });
            oFilterBar.addFilterGroupItem(oCompanyGroupItemName);
            this.oF4HelpDialog.setFilterBar(oFilterBar);

            // Binding  Data to the Table 
            this.oF4HelpDialog.getTableAsync().then(function (oTable) {
                oTable.setModel(oModel);

                var aCol = [];

                if (this.sModelName === "companyListModel") {
                    var temp1 = "companyCode",
                        temp2 = "description",
                        label1 = "Company Code",
                        label2 = "Description";
                } else if (this.sModelName === "vendorListModel") {
                    var temp1 = "Vendor",
                        temp2 = "Name1",
                        label1 = "Vendor Number",
                        label2 = "Vendor Name";
                } else if (this.sModelName === "taxCodeModel") {
                    var temp1 = "taxCode",
                        temp2 = "description",
                        label1 = "Tax Code",
                        label2 = "Description";
                } else if (this.sModelName === "businessAreaModel") {
                    var temp1 = "businessArea",
                        temp2 = "description",
                        label1 = "Business Area",
                        label2 = "Description";
                } else if (this.sModelName === "GLAccountModel") {
                    var temp4 = "companyCode",
                        temp1 = "glAccount",
                        temp3 = "longText",
                        temp2 = "shortText",
                        label1 = "GL Account",
                        label2 = "Short Text",
                        label3 = "Long Text",
                        label4 = "Company Code";
                    aCol.push({ "label": label3, "template": temp3 });
                    aCol.push({ "label": label4, "template": temp4 });
                } else if (this.sModelName === "requesterModel") {
                    var temp4 = "firstName",
                        temp1 = "userName",
                        temp3 = "lastname",
                        temp2 = "fullname",
                        label1 = "User Name",
                        label2 = "Full Name",
                        label3 = "Last Name",
                        label4 = "First Name";
                    aCol.push({ "label": label3, "template": temp3 });
                    aCol.push({ "label": label4, "template": temp4 });
                } else if (this.sModelName === "costCenterModel") {
                    var temp1 = "costCenter",
                        temp2 = "description",
                        label1 = "Cost Center",
                        label2 = "Description";
                } else if (this.sModelName === "profitCenterModel") {
                    var temp1 = "profitCenter",
                        temp2 = "pctrName",
                        label1 = "Profit Center",
                        label2 = "Name";
                } else if (this.sModelName === "plantModel") {
                    var temp1 = "plant",
                        temp2 = "description",
                        label1 = "Plant",
                        label2 = "Description";
                } else if (this.sModelName === "paymentTermListModel") {
                    var temp1 = "paymentTerm",
                        temp2 = "description",
                        label1 = "Payment Term",
                        label2 = "Description";
                } else if (this.sModelName === "paymentMethodListModel") {
                    var temp2 = "description",
                        temp1 = "paymentMethod",
                        label2 = "Description",
                        label1 = "Payment Method";
                } else if (this.sModelName === "oneTimeVendorCountryModel") {
                    var temp1 = "CountryCode",
                        temp2 = "Description",
                        label2 = "Country Code",
                        label1 = "Country Description";
                } else if (this.sModelName === "currencyListModel") {
                    var temp1 = "CurrencyCode",
                        temp2 = "CurrencyDescription",
                        label2 = "Currency Description",
                        label1 = "Currency Code";
                } else if (this.sModelName === "internalOrderModel") {
                    var temp1 = "internalOrder",
                        temp2 = "description",
                        label2 = "Description",
                        label1 = "Internal Order";
                }
                var oNewModel = new JSONModel();
                aCol.unshift({ "label": label2, "template": temp2 });
                aCol.unshift({ "label": label1, "template": temp1 });
                oNewModel.setData({
                    cols: aCol
                });
                oTable.setModel(oNewModel, "columns");

                if (oTable.bindRows) {
                    oTable.bindAggregation("rows", "/F4HelpList");
                }

                if (oTable.bindItems) {

                    oTable.bindAggregation("items", "/F4HelpList", function () {
                        return new ColumnListItem({
                            cells: oColumns.map(function (column) {
                                return new Label({
                                    text: "{" + column.template + "}"
                                });
                            })
                        });
                    });
                }
                this.oF4HelpDialog.update();
            }.bind(this));
        },
        // Setting data to the Value help Dialog based on selection
        handleFetchData: function (oView, sValue, bValidate, sCall, sResult) {
            var oModel = oView.getModel(this.sModelName);
            oModel.setProperty("/F4HelpList", []);
            if (sResult && sResult.root != "") {

                if (sValue === "singleCurrency") {

                    if (sResult.currency) {
                        oView.getModel("currencyListModel").setProperty("/value", sResult.currency);
                        oView.getModel("currencyListModel").setProperty("/desc", sResult.country);
                    }

                } else {

                    if (this.sModelName === "companyListModel") {
                        if (sResult.root && sResult.root.companyList && Array.isArray(sResult.root.companyList) && sResult.root.companyList.length) {

                            oModel.setProperty("/List", sResult.root.companyList);

                        } else if (typeof sResult.root.companyList === "object") {

                            oModel.setProperty("/List", [sResult.root.companyList]);

                        }
                        if (bValidate) {
                            this.validateInputValue(oModel, "companyCode");
                        }
                    } else if (this.sModelName === "vendorListModel") {
                        var aListAll, aResult;
                        oModel.setProperty("/ListAll", []);
                        if (sCall) {
                            if (typeof sResult.root.Result === "object" && !Array.isArray(sResult.root.Result)) {
                                aResult = [sResult.root.Result];
                            } else {
                                aResult = sResult.root.Result;
                            }
                            aListAll = oModel.getProperty("/ListAll").concat(aResult);
                            oModel.setProperty("/ListAll", aListAll);

                        }
                        if (sResult.root && sResult.root.Result && Array.isArray(sResult.root.Result) && sResult.root.Result.length && !sCall) {
                            if (oModel.getProperty("/ListAll") && oModel.getProperty("/ListAll").length) {

                                aListAll = oModel.getProperty("/ListAll").concat(sResult.root.Result);
                                oModel.setProperty("/List", aListAll);

                            } else {
                                oModel.setProperty("/List", sResult.root.Result);
                            }
                            oModel.updateBindings(true);
                        } else if (typeof sResult.root.Result === "object" && !sCall) {
                            aListAll = oModel.getProperty("/ListAll").concat([sResult.root.Result]);
                            oModel.setProperty("/List", aListAll);

                        }
                        if (bValidate && !sCall) {
                            oView.getController().vendorflag = 1;
                            oView.getController().deadlockflag = 1;
                            oView.getController()._populatePaymentTerm();
                            this.validateInputValue(oModel, "vendorNumber");
                        } else if (!sCall) {
                            oView.getController().vendorflag = 1;
                            oView.getController().deadlockflag = 1;
                            oView.getController()._populatePaymentTerm();
                            this.fnFilterFunc(this.oModel, undefined, this.aSelectionSet);
                        }

                    } else if (this.sModelName === "paymentTermListModel") {
                        if (sResult && sResult.paymentTermList && Array.isArray(sResult.paymentTermList) && sResult.paymentTermList.length) {

                            oModel.setProperty("/List", sResult.paymentTermList);
                        } else if (typeof sResult.paymentTermList === "object") {
                            oModel.setProperty("/List", [sResult.paymentTermList]);



                        } else if (sResult.paymentTermDetails) {
                            var oCreateModel = oView.getModel("createModel");
                            oCreateModel.setProperty("/days1", sResult.paymentTermDetails.dueDate1);
                            oCreateModel.setProperty("/days2", sResult.paymentTermDetails.dueDate2);
                            oCreateModel.setProperty("/days3", sResult.paymentTermDetails.dueDate3);
                            oCreateModel.setProperty("/discount1", sResult.paymentTermDetails.amount1);
                            oCreateModel.setProperty("/discount2", sResult.paymentTermDetails.amount2);
                            this.oView.byId("dueDatePicker").setDateValue(undefined);
                            if (this.invoiceDatePicker) {
                                var oInvoiceDate = this.invoiceDatePicker.getDateValue() && this.invoiceDatePicker.getDateValue().getTime(),
                                    // Due Date Calcution based on Invoice date and Days fields                                   
                                    oNewTime;
                                if (sResult.paymentTermDetails.dueDate3 && parseInt(sResult.paymentTermDetails.dueDate3)) {
                                    if (this.oView.byId("dueDatePicker")) {
                                        oNewTime = oInvoiceDate + (parseInt(sResult.paymentTermDetails.dueDate3) * 24 * 60 * 60 * 1000);
                                        this.oView.byId("dueDatePicker").setDateValue(new Date(oNewTime));
                                    }

                                } else if (sResult.paymentTermDetails.dueDate2 && parseInt(sResult.paymentTermDetails.dueDate2)) {
                                    if (this.oView.byId("dueDatePicker")) {
                                        oNewTime = oInvoiceDate + (parseInt(sResult.paymentTermDetails.dueDate2) * 24 * 60 * 60 * 1000);
                                        this.oView.byId("dueDatePicker").setDateValue(new Date(oNewTime));
                                    }
                                } else if (sResult.paymentTermDetails.dueDate1 && parseInt(sResult.paymentTermDetails.dueDate1)) {
                                    if (this.oView.byId("dueDatePicker")) {
                                        oNewTime = oInvoiceDate + (parseInt(sResult.paymentTermDetails.dueDate1) * 24 * 60 * 60 * 1000);
                                        this.oView.byId("dueDatePicker").setDateValue(new Date(oNewTime));
                                    }
                                } else {
                                    this.oView.byId("dueDatePicker").setDateValue(new Date(oInvoiceDate));
                                }

                            } else if (this.oView.byId("invoiceDate")) {
                                var oInvoiceDate = this.oView.byId("invoiceDate") && new Date(this.oView.byId("invoiceDate").getDateValue()).getTime(),
                                    oNewTime;
                                if (sResult.paymentTermDetails.dueDate3 && parseInt(sResult.paymentTermDetails.dueDate3)) {
                                    if (this.oView.byId("dueDatePicker")) {
                                        oNewTime = oInvoiceDate + (parseInt(sResult.paymentTermDetails.dueDate3) * 24 * 60 * 60 * 1000);
                                        this.oView.byId("dueDatePicker").setDateValue(new Date(oNewTime));
                                    }

                                } else if (sResult.paymentTermDetails.dueDate2 && parseInt(sResult.paymentTermDetails.dueDate2)) {
                                    if (this.oView.byId("dueDatePicker")) {
                                        oNewTime = oInvoiceDate + (parseInt(sResult.paymentTermDetails.dueDate2) * 24 * 60 * 60 * 1000);
                                        this.oView.byId("dueDatePicker").setDateValue(new Date(oNewTime));
                                    }
                                } else if (sResult.paymentTermDetails.dueDate1 && parseInt(sResult.paymentTermDetails.dueDate1)) {
                                    if (this.oView.byId("dueDatePicker")) {
                                        oNewTime = oInvoiceDate + (parseInt(sResult.paymentTermDetails.dueDate1) * 24 * 60 * 60 * 1000);
                                        this.oView.byId("dueDatePicker").setDateValue(new Date(oNewTime));
                                    }
                                } else {
                                    this.oView.byId("dueDatePicker").setDateValue(new Date(oInvoiceDate));
                                }
                            }
                        }
                        if (bValidate) {
                            this.validateInputValue(oModel, "PaymentTerm");
                        }
                    } else if (this.sModelName === "paymentMethodListModel") {
                        if (sResult && sResult.paymentMethodDescList && Array.isArray(sResult.paymentMethodDescList) && sResult.paymentMethodDescList.length) {
                            oModel.setProperty("/F4HelpList", []);
                            oModel.setProperty("/List", sResult.paymentMethodDescList);
                        } else if (typeof sResult.paymentMethodDescList === "object") {
                            oModel.setProperty("/List", [sResult.paymentMethodDescList]);
                        }
                        if (bValidate) {
                            this.validateInputValue(oModel, "PaymentMethod");
                        }
                    } else if (this.sModelName === "GLAccountModel") {
                        if (sResult.root && sResult.root.accountList && sResult.root.accountList.length) {
                            oModel.setProperty("/F4HelpList", []);
                            oModel.setProperty("/List", sResult.root.accountList);
                        } else if (typeof sResult.root.accountList === "object") {

                            oModel.setProperty("/List", [sResult.root.accountList]);

                        }
                        if (bValidate) {
                            this.validateInputValue(oModel, "GLAccount");
                        }
                    } else if (this.sModelName === "costCenterModel") {
                        if (sResult.root && sResult.root.costCenerList && sResult.root.costCenerList.length) {
                            oModel.setProperty("/F4HelpList", []);
                            oModel.setProperty("/List", sResult.root.costCenerList);

                        } else if (typeof sResult.root.costCenerList === "object") {

                            oModel.setProperty("/List", [sResult.root.costCenerList]);

                        }
                        if (bValidate) {
                            this.validateInputValue(oModel, "CostCenter");
                        };
                    } else if (this.sModelName === "taxCodeModel") {
                        if (sResult.taxCodeList && sResult.taxCodeList.length) {
                            oModel.setProperty("/F4HelpList", []);
                            oModel.setProperty("/List", sResult.taxCodeList);
                        } else if (typeof sResult.taxCodeList === "object") {

                            oModel.setProperty("/List", [sResult.taxCodeList]);

                        }
                        if (bValidate) {
                            this.validateInputValue(oModel, "taxCode");
                        }
                    } else if (this.sModelName === "businessAreaModel") {
                        if (sResult.root && sResult.root.businessAreaList && sResult.root.businessAreaList.length) {
                            oModel.setProperty("/F4HelpList", []);
                            oModel.setProperty("/List", sResult.root.businessAreaList);
                        } else if (typeof sResult.root.businessAreaList === "object") {

                            oModel.setProperty("/List", [sResult.root.businessAreaList]);

                        }
                        if (bValidate) {
                            this.validateInputValue(oModel, "BusinessArea");
                        }
                    } else if (this.sModelName === "profitCenterModel") {
                        if (sResult.root && sResult.root.profitCenterList && sResult.root.profitCenterList.length) {
                            oModel.setProperty("/F4HelpList", []);
                            oModel.setProperty("/List", sResult.root.profitCenterList);
                        } else if (typeof sResult.root.profitCenterList === "object") {

                            oModel.setProperty("/List", [sResult.root.profitCenterList]);

                        }
                        if (bValidate) {
                            this.validateInputValue(oModel, "ProfitCenter");
                        }
                    } else if (this.sModelName === "plantModel") {
                        if (sResult.Result && sResult.Result && sResult.Result.length) {
                            oModel.setProperty("/F4HelpList", []);
                            oModel.setProperty("/List", sResult.Result);

                            oModel.updateBindings(true);

                        } else if (typeof sResult.Result === "object") {


                            oModel.setProperty("/List", [sResult.Result]);

                        }
                        if (bValidate) {
                            this.validateInputValue(oModel, "Plant");
                        }
                    } else if (this.sModelName === "internalOrderModel") {
                        var aResult, aListAll;
                        oModel.setProperty("/ListAll", []);
                        if (sCall) {
                            if (typeof sResult.internalOrderList === "object" && !Array.isArray(sResult.internalOrderList)) {
                                aResult = [sResult.internalOrderList];
                            } else {
                                aResult = sResult.internalOrderList;
                            }
                            aListAll = oModel.getProperty("/ListAll").concat(aResult);
                            oModel.setProperty("/ListAll", aListAll);

                        }
                        oModel.setProperty("/F4HelpList", []);
                        if (!sCall) {
                            if (sResult.internalOrderList && sResult.internalOrderList.length) {

                                if (oModel.getProperty("/ListAll") && oModel.getProperty("/ListAll").length) {
                                    aListAll = oModel.getProperty("/ListAll").concat(sResult.internalOrderList);
                                    oModel.setProperty("/List", aListAll);
                                } else {
                                    this.oF4HelpDialog.getTable().unbindRows();
                                    this.oF4HelpDialog.getTable().bindAggregation("rows", "/F4HelpList");
                                    oModel.setProperty("/List", sResult.internalOrderList);
                                }


                            } else if (typeof sResult.internalOrderList === "object") {
                                aListAll = oModel.getProperty("/ListAll").concat([sResult.internalOrderList]);
                                oModel.setProperty("/List", aListAll);
                            }

                        }
                        if (bValidate && !sCall) {
                            this.validateInputValue(oModel, "internalOrder");
                        } else if (!sCall) {
                            this.fnFilterFunc(oModel, undefined, this.aSelectionSet);
                        }
                        //Changes by Kunj
                    } else if (this.sModelName === "requesterModel") {
                        var aResult, aListAll;
                        oModel.setProperty("/ListAll", []);
                        if (sCall) {
                            if (typeof sResult.userList === "object" && !Array.isArray(sResult.userList)) {
                                aResult = [sResult.userList];
                            } else {
                                aResult = sResult.userList;
                            }
                            aListAll = oModel.getProperty("/ListAll").concat(aResult);
                            oModel.setProperty("/ListAll", aListAll);
                        }
                        oModel.setProperty("/F4HelpList", []);
                        if (!sCall) {
                            if (sResult.userList && sResult.userList.length) {

                                if (oModel.getProperty("/ListAll") && oModel.getProperty("/ListAll").length) {
                                    aListAll = oModel.getProperty("/ListAll").concat(sResult.userList);
                                    oModel.setProperty("/List", aListAll);
                                } else {

                                    if (!bValidate && this.oF4HelpDialog) {
                                        this.oF4HelpDialog.getTable().unbindRows();
                                        this.oF4HelpDialog.getTable().bindAggregation("rows", "/F4HelpList");
                                    }
                                    oModel.setProperty("/List", sResult.userList);
                                }

                            } else if (typeof sResult.userList === "object") {
                                aListAll = oModel.getProperty("/ListAll").concat([sResult.userList]);
                                oModel.setProperty("/List", aListAll);
                            }
                            this.fnFilterFunc(oModel, undefined, this.aSelectionSet);
                        }
                        if (bValidate && !sCall) {
                            this.validateInputValue(oModel, "Requester");
                        }
                    }
                }
                oModel.updateBindings(true);
            } else {
                var sSingleCall = false;

                if (this.sModelName === "vendorListModel") {

                    sSingleCall = true;

                } else if (this.sModelName === "internalOrderModel") {

                    sSingleCall = true;


                }

                if (this.sModelName === "requesterModel" && sCall === undefined) {

                    if (oModel.getProperty("/ListAll") && oModel.getProperty("/ListAll").length) {

                        oModel.setProperty("/List", oModel.getProperty("/ListAll"));
                        if (bValidate) {
                            this.validateInputValue(oModel, "Requester");
                        } else {
                            this.fnFilterFunc(oModel, undefined, this.aSelectionSet);
                        }

                    } else {
                        if (bValidate && oModel.getProperty("/List") && oModel.getProperty("/List").length) {
                            this.validateInputValue(oModel, "Requester");
                        } else if (bValidate && !oModel.getProperty("/List") && this.sInputValue) {
                            oModel.setProperty("/error", "Error");
                            oModel.setProperty("/desc", "");
                        }

                    }
                } else if (sResult && sResult.root === "" && !sCall && !sSingleCall && !bValidate) {
                }
            }
            var oParam;

            if (this.sModelName === "vendorListModel") {
                if (sCall === "SecondCall") {

                    oParam = {
                        vendorNumber: "",
                        vendorName: "*" + sValue + "*"
                    }
                    this.triggerBackendService(oParam, oView, this.sUrl, undefined, bValidate);
                } else {
                    if (!sCall && sResult && sResult.root === "" && oModel.getProperty("/ListAll") && oModel.getProperty("/ListAll").length) {
                        oModel.setProperty("/List", oModel.getProperty("/ListAll"));
                        if (bValidate) {
                            this.validateInputValue(oModel, "vendorNumber");
                        } else {
                            this.fnFilterFunc(oModel, undefined, this.aSelectionSet);
                        }

                    } else if (!oModel.getProperty("/List") && !sCall && !bValidate) {
                        this.oF4HelpDialog.getTable().setNoData("No matching record exists with search criteria");
                    } else if (oModel.getProperty("/List") && !oModel.getProperty("/List").length && !sCall && !bValidate) {
                        this.oF4HelpDialog.getTable().setNoData("No matching record exists with search criteria");
                    } else if (bValidate && !oModel.getProperty("/List") && !sCall) {
                        if (this.sInputValue && sResult && sResult.root === "") {
                            oModel.setProperty("/error", "Error");
                            oModel.setProperty("/desc", "");
                        } else if (this.sInputValue === "" && sResult && sResult.root === "") {
                            oModel.setProperty("/error", "None");
                            oModel.setProperty("/desc", "");
                        }

                    } else if (bValidate && oModel.getProperty("/List") && !sCall) {
                        this.validateInputValue(oModel, "vendorNumber");
                    }
                }
            }
            if (this.sModelName === "internalOrderModel") {
                if (sCall === "SecondCall") {

                    oParam = {
                        "internalOrder": "",
                        "companyCode": this.createView.getModel('companyListModel').getProperty('/value'),
                        "description": sValue,
                        "maxRows": 100
                    }
                    this.triggerBackendService(oParam, oView, this._getCPIBaseURL() + "getInternalOrder", undefined, bValidate);
                } else {
                    if (oModel.getProperty("/ListAll") && oModel.getProperty("/ListAll").length) {

                        oModel.setProperty("/List", oModel.getProperty("/ListAll"));
                        if (bValidate) {
                            this.validateInputValue(oModel, "internalOrder");
                        } else {
                            this.fnFilterFunc(oModel, undefined, this.aSelectionSet);
                        }

                    } else if (!oModel.getProperty("/List") && !sCall) {
                        this.oF4HelpDialog.getTable().setNoData("No matching record exists with search criteria");
                    } else if (oModel.getProperty("/List") && !oModel.getProperty("/List").length && !sCall) {
                        this.oF4HelpDialog.getTable().setNoData("No matching record exists with search criteria");
                    }
                }
            }

            if (this.sModelName === "requesterModel" && sValue !== "") {
                if (sCall === "SecondCall") {

                    oParam = {
                        "userId": "",
                        "maxRow": 100,
                        "fname": "*" + sValue + "*",
                        "lname": "",
                        "parameter": "ADDRESS",
                        "field": "FIRSTNAME"
                    }

                    this.triggerBackendService(oParam, oView, this.sUrl, sValue, bValidate, "ThirdCall");

                } else if (sCall === "ThirdCall") {

                    oParam = {
                        "userId": "",
                        "maxRow": 100,
                        "fname": "",
                        "lname": "*" + sValue + "*",
                        "parameter": "ADDRESS",
                        "field": "LASTNAME"
                    }
                    this.triggerBackendService(oParam, oView, this.sUrl, undefined, bValidate, undefined);
                }

            }
        },
        // Function to Validate the Value help field and set it to error state when no data matches
        validateInputValue: function (oModel, sFieldName) {

            if (oModel && oModel.getProperty("/List")) {

                var aList = oModel.getProperty("/List"),
                    bSetError = true;

                if (sFieldName === "companyCode") {
                    if (this.sInputValue === "") {
                        this.oSelectedModel.setProperty("/error", "None");
                        this.oSelectedModel.setProperty("/desc", "");
                    } else {
                        if (!Array.isArray(aList) && !aList.length) {

                            if (this.sInputValue === aList.companyCode) {
                                this.oSelectedModel.setProperty("/error", "None");
                                this.oSelectedModel.setProperty("/desc", aList.description);
                                this.triggerBackendService({ "companyCode": this.sInputValue }, this.oView, this._getCPIBaseURL() + "getCurrency", "singleCurrency");
                            } else {
                                this.oSelectedModel.setProperty("/error", "Error");
                                this.oSelectedModel.setProperty("/desc", "");
                            }

                        } else {

                            for (var i = 0; i < aList.length; i++) {
                                if (this.sInputValue === aList[i].companyCode) {
                                    this.oSelectedModel.setProperty("/error", "None");
                                    this.oSelectedModel.setProperty("/desc", aList[i].description);
                                    bSetError = false;
                                    this.triggerBackendService({ "companyCode": this.sInputValue }, this.oView, this._getCPIBaseURL() + "getCurrency", "singleCurrency");

                                    break;
                                }
                            }

                            if (bSetError) {
                                if (!this.sInputValue) {
                                    this.oSelectedModel.setProperty("/error", "None");
                                } else {
                                    this.oSelectedModel.setProperty("/error", "Error");
                                }
                                this.oSelectedModel.setProperty("/desc", "");
                            }

                        }
                    }
                } else if (sFieldName === "vendorNumber") {
                    if (this.sInputValue === "") {
                        this.oSelectedModel.setProperty("/error", "None");
                        this.oSelectedModel.setProperty("/desc", "");
                    } else {
                        if (!Array.isArray(aList) && !aList.length) {

                            if (this.sInputValue === aList.Vendor) {
                                this.oSelectedModel.setProperty("/error", "None");
                                this.oSelectedModel.setProperty("/desc", aList.Name1);
                            } else {
                                this.oSelectedModel.setProperty("/error", "Error");
                                this.oSelectedModel.setProperty("/desc", "");
                            }

                        } else {

                            for (var i = 0; i < aList.length; i++) {


                                if (this.sInputValue === aList[i].Vendor) {
                                    this.oSelectedModel.setProperty("/error", "None");
                                    this.oSelectedModel.setProperty("/desc", aList[i].Name1);
                                    bSetError = false;
                                    break;
                                }
                            }

                            if (bSetError) {
                                this.oSelectedModel.setProperty("/error", "Error");
                                this.oSelectedModel.setProperty("/desc", "");
                            }
                        }
                    }

                } else if (sFieldName === "Currency") {
                    if (this.sInputValue === "") {
                        this.oSelectedModel.setProperty("/error", "None");
                        this.oSelectedModel.setProperty("/desc", "");
                    } else {
                        if (!Array.isArray(aList) && !aList.length) {

                            if (this.sInputValue === aList.CurrencyCode) {
                                this.oSelectedModel.setProperty("/error", "None");
                                this.oSelectedModel.setProperty("/desc", aList.description);
                            } else {
                                this.oSelectedModel.setProperty("/error", "Error");
                                this.oSelectedModel.setProperty("/desc", "");
                            }

                        } else {

                            for (var i = 0; i < aList.length; i++) {
                                if (this.sInputValue === aList[i].CurrencyCode) {
                                    this.oSelectedModel.setProperty("/error", "None");
                                    this.oSelectedModel.setProperty("/desc", aList[i].CurrencyDescription);
                                    bSetError = false;
                                    break;
                                }

                            }

                            if (bSetError) {
                                this.oSelectedModel.setProperty("/error", "Error");
                                this.oSelectedModel.setProperty("/desc", "");
                            }
                        }
                    }

                    if (this.currency === this.sInputValue) {
                        this.oView.getModel("createModel").setProperty("/exchangeRateEnable", false);
                    } else {
                        this.oView.getModel("createModel").setProperty("/exchangeRateEnable", true);
                    }

                } else if (sFieldName === "oneTimeVendorCountry") {
                    if (this.sInputValue === "") {
                        this.oSelectedModel.setProperty("/error", "None");
                        this.oSelectedModel.setProperty("/desc", "");
                    } else {
                        if (!Array.isArray(aList) && !aList.length) {

                            if (this.sInputValue === aList.CountryCode) {
                                this.oSelectedModel.setProperty("/error", "None");
                                this.oSelectedModel.setProperty("/desc", aList.Description);

                            } else {
                                this.oSelectedModel.setProperty("/error", "Error");
                                this.oSelectedModel.setProperty("/desc", "");
                            }

                        } else {

                            for (var i = 0; i < aList.length; i++) {
                                if (this.sInputValue === aList[i].CountryCode) {
                                    this.oSelectedModel.setProperty("/error", "None");
                                    this.oSelectedModel.setProperty("/desc", aList[i].Description);
                                    bSetError = false;
                                    break;
                                }
                            }

                            if (bSetError) {
                                this.oSelectedModel.setProperty("/error", "Error");
                                this.oSelectedModel.setProperty("/desc", "");
                            }
                        }

                    }

                } else if (sFieldName === "PaymentMethod") {
                    if (this.sInputValue === "") {
                        this.oSelectedModel.setProperty("/error", "None");
                        this.oSelectedModel.setProperty("/desc", "");
                    } else {
                        if (!Array.isArray(aList) && !aList.length) {

                            if (this.sInputValue === aList.paymentMethod) {
                                this.oSelectedModel.setProperty("/error", "None");
                                this.oSelectedModel.setProperty("/desc", aList.description);

                            } else {
                                this.oSelectedModel.setProperty("/error", "Error");
                                this.oSelectedModel.setProperty("/desc", "");
                            }

                        } else {

                            for (var i = 0; i < aList.length; i++) {
                                if (this.sInputValue === aList[i].paymentMethod) {
                                    this.oSelectedModel.setProperty("/error", "None");
                                    this.oSelectedModel.setProperty("/desc", aList[i].description);
                                    bSetError = false;
                                    break;
                                }
                            }

                            if (bSetError) {
                                this.oSelectedModel.setProperty("/error", "Error");
                                this.oSelectedModel.setProperty("/desc", "");
                            }
                        }

                    }

                } else if (sFieldName === "PaymentTerm") {
                    if (this.sInputValue === "") {
                        this.oSelectedModel.setProperty("/error", "None");
                        this.oSelectedModel.setProperty("/desc", "");
                    } else {
                        if (!Array.isArray(aList) && !aList.length) {

                            if (this.sInputValue === aList.paymentTerm) {
                                this.oSelectedModel.setProperty("/error", "None");
                                this.oSelectedModel.setProperty("/desc", aList.description);
                                this.triggerBackendService({ "paymentTermKey": this.sInputValue }, this.oView, this._getCPIBaseURL() + "getPaymentkeyDuedetails");

                            } else {
                                this.oSelectedModel.setProperty("/error", "Error");
                                this.oSelectedModel.setProperty("/desc", "");
                            }

                        } else {

                            for (var i = 0; i < aList.length; i++) {
                                if (this.sInputValue === aList[i].paymentTerm) {
                                    this.oSelectedModel.setProperty("/error", "None");
                                    this.oSelectedModel.setProperty("/desc", aList[i].description);
                                    this.triggerBackendService({ "paymentTermKey": this.sInputValue }, this.oView, this._getCPIBaseURL() + "getPaymentkeyDuedetails");
                                    bSetError = false;
                                    break;
                                }
                            }

                            if (bSetError) {
                                this.oSelectedModel.setProperty("/error", "Error");
                                this.oSelectedModel.setProperty("/desc", "");
                            }
                        }

                    }

                } else if (sFieldName === "Requester") {
                    if (this.sInputValue === "") {
                        this.oSelectedModel.setProperty("/error", "None");
                        this.oSelectedModel.setProperty("/desc", "");
                    } else {
                        if (!Array.isArray(aList) && !aList.length) {

                            if (this.sInputValue === aList.userName) {
                                this.oSelectedModel.setProperty("/error", "None");
                                this.oView.getModel("createModel").setProperty("/requesterName", aList.fullname);

                            } else {
                                this.oSelectedModel.setProperty("/error", "Error");
                                this.oView.getModel("createModel").setProperty("/requesterName", "");
                            }

                        } else {

                            for (var i = 0; i < aList.length; i++) {
                                if (this.sInputValue === aList[i].userName) {
                                    this.oSelectedModel.setProperty("/error", "None");
                                    this.oView.getModel("createModel").setProperty("/requesterName", aList[i].fullname);
                                    bSetError = false;
                                    break;
                                }
                            }

                            if (bSetError) {
                                this.oSelectedModel.setProperty("/error", "Error");
                                this.oView.getModel("createModel").setProperty("/requesterName", "");
                            }
                        }

                    }

                } else if (sFieldName === "GLAccount") {
                    if (this.sInputValue === "") {
                        this.oSelectedModel.setProperty("/error", "None");
                        this.oSelectedModel.setProperty("/desc", "");
                    } else {
                        if (!Array.isArray(aList) && !aList.length) {

                            if (this.sInputValue === aList.glAccount) {
                                this.oSelectedModel.setProperty("/error", "None");
                                this.oSelectedModel.setProperty("/desc", aList.shortText);

                            } else {
                                this.oSelectedModel.setProperty("/error", "Error");
                                this.oSelectedModel.setProperty("/desc", "");
                            }

                        } else {

                            for (var i = 0; i < aList.length; i++) {
                                if (this.sInputValue === aList[i].glAccount) {
                                    this.oSelectedModel.setProperty("/error", "None");
                                    this.oSelectedModel.setProperty("/desc", aList[i].shortText);
                                    bSetError = false;
                                    break;
                                }
                            }

                            if (bSetError) {
                                this.oSelectedModel.setProperty("/error", "Error");
                                this.oSelectedModel.setProperty("/desc", "");
                            }
                        }

                    }

                } else if (sFieldName === "taxCode") {
                    if (this.sInputValue === "") {
                        this.oSelectedModel.setProperty("/error", "None");
                        this.oSelectedModel.setProperty("/desc", "");
                    } else {
                        if (!Array.isArray(aList) && !aList.length) {

                            if (this.sInputValue === aList.taxCode) {
                                this.oSelectedModel.setProperty("/error", "None");
                                this.oSelectedModel.setProperty("/desc", aList.description);

                            } else {
                                this.oSelectedModel.setProperty("/error", "Error");
                                this.oSelectedModel.setProperty("/desc", "");
                            }

                        } else {

                            for (var i = 0; i < aList.length; i++) {
                                if (this.sInputValue === aList[i].taxCode) {
                                    this.oSelectedModel.setProperty("/error", "None");
                                    this.oSelectedModel.setProperty("/desc", aList[i].description);
                                    bSetError = false;
                                    break;
                                }
                            }

                            if (bSetError) {
                                this.oSelectedModel.setProperty("/error", "Error");
                                this.oSelectedModel.setProperty("/desc", "");
                            }
                        }

                    }

                } else if (sFieldName === "BusinessArea") {
                    if (this.sInputValue === "") {
                        this.oSelectedModel.setProperty("/error", "None");
                        this.oSelectedModel.setProperty("/desc", "");
                    } else {
                        if (!Array.isArray(aList) && !aList.length) {

                            if (this.sInputValue === aList.businessArea) {
                                this.oSelectedModel.setProperty("/error", "None");
                                this.oSelectedModel.setProperty("/desc", aList.description);

                            } else {
                                this.oSelectedModel.setProperty("/error", "Error");
                                this.oSelectedModel.setProperty("/desc", "");
                            }

                        } else {

                            for (var i = 0; i < aList.length; i++) {
                                if (this.sInputValue === aList[i].businessArea) {
                                    this.oSelectedModel.setProperty("/error", "None");
                                    this.oSelectedModel.setProperty("/desc", aList[i].description);
                                    bSetError = false;
                                    break;
                                }
                            }

                            if (bSetError) {
                                this.oSelectedModel.setProperty("/error", "Error");
                                this.oSelectedModel.setProperty("/desc", "");
                            }
                        }

                    }

                } else if (sFieldName === "Plant") {
                    if (this.sInputValue === "") {
                        this.oSelectedModel.setProperty("/error", "None");
                        this.oSelectedModel.setProperty("/desc", "");
                    } else {
                        if (!Array.isArray(aList) && !aList.length) {

                            if (this.sInputValue === aList.plant) {
                                this.oSelectedModel.setProperty("/error", "None");
                                this.oSelectedModel.setProperty("/desc", aList.description);

                            } else {
                                this.oSelectedModel.setProperty("/error", "Error");
                                this.oSelectedModel.setProperty("/desc", "");
                            }

                        } else {

                            for (var i = 0; i < aList.length; i++) {
                                if (this.sInputValue === aList[i].plant) {
                                    this.oSelectedModel.setProperty("/error", "None");
                                    this.oSelectedModel.setProperty("/desc", aList[i].description);
                                    bSetError = false;
                                    break;
                                }
                            }

                            if (bSetError) {
                                this.oSelectedModel.setProperty("/error", "Error");
                                this.oSelectedModel.setProperty("/desc", "");
                            }
                        }

                    }

                } else if (sFieldName === "CostCenter") {
                    if (this.sInputValue === "") {
                        this.oSelectedModel.setProperty("/error", "None");
                        this.oSelectedModel.setProperty("/desc", "");
                    } else {
                        if (!Array.isArray(aList) && !aList.length) {

                            if (this.sInputValue === aList.costCenter) {
                                this.oSelectedModel.setProperty("/error", "None");
                                this.oSelectedModel.setProperty("/desc", aList.description);

                            } else {
                                this.oSelectedModel.setProperty("/error", "Error");
                                this.oSelectedModel.setProperty("/desc", "");
                            }

                        } else {

                            for (var i = 0; i < aList.length; i++) {
                                if (this.sInputValue === aList[i].costCenter) {
                                    this.oSelectedModel.setProperty("/error", "None");
                                    this.oSelectedModel.setProperty("/desc", aList[i].description);
                                    bSetError = false;
                                    break;
                                }
                            }

                            if (bSetError) {
                                this.oSelectedModel.setProperty("/error", "Error");
                                this.oSelectedModel.setProperty("/desc", "");
                            }
                        }

                    }

                } else if (sFieldName === "ProfitCenter") {
                    if (this.sInputValue === "") {
                        this.oSelectedModel.setProperty("/error", "None");
                        this.oSelectedModel.setProperty("/desc", "");
                    } else {
                        if (!Array.isArray(aList) && !aList.length) {

                            if (this.sInputValue === aList.profitCenter) {
                                this.oSelectedModel.setProperty("/error", "None");
                                this.oSelectedModel.setProperty("/desc", aList.pctrName);

                            } else {
                                this.oSelectedModel.setProperty("/error", "Error");
                                this.oSelectedModel.setProperty("/desc", "");
                            }

                        } else {

                            for (var i = 0; i < aList.length; i++) {
                                if (this.sInputValue === aList[i].profitCenter) {
                                    this.oSelectedModel.setProperty("/error", "None");
                                    this.oSelectedModel.setProperty("/desc", aList[i].pctrName);
                                    bSetError = false;
                                    break;
                                }
                            }

                            if (bSetError) {
                                this.oSelectedModel.setProperty("/error", "Error");
                                this.oSelectedModel.setProperty("/desc", "");
                            }
                        }

                    }

                } else if (sFieldName === "internalOrder") {
                    if (this.sInputValue === "") {
                        this.oSelectedModel.setProperty("/error", "None");
                        this.oSelectedModel.setProperty("/desc", "");
                    } else {
                        if (!Array.isArray(aList) && !aList.length) {

                            if (this.sInputValue === aList.internalOrder) {
                                this.oSelectedModel.setProperty("/error", "None");
                                this.oSelectedModel.setProperty("/desc", aList.description);

                            } else {
                                this.oSelectedModel.setProperty("/error", "Error");
                                this.oSelectedModel.setProperty("/desc", "");
                            }

                        } else {

                            for (var i = 0; i < aList.length; i++) {
                                if (this.sInputValue === aList[i].internalOrder) {
                                    this.oSelectedModel.setProperty("/error", "None");
                                    this.oSelectedModel.setProperty("/desc", aList[i].description);
                                    bSetError = false;
                                    break;
                                }
                            }

                            if (bSetError) {
                                this.oSelectedModel.setProperty("/error", "Error");
                                this.oSelectedModel.setProperty("/desc", "");
                            }
                        }

                    }

                }
            }

        },

        // Function to handle Go button in Value Help Dialog
        onFilterBarSearch: function (oModel, oEvent, aSet) {
            var aSelectionSet;

            if (oEvent) {

                aSelectionSet = oEvent.getParameter("selectionSet");

            } else {

                aSelectionSet = aSet;

            }
            if (this.sName === "Vendor" && oEvent || this.sName === "Requester" && oEvent || this.sName === "internalOrder" && oEvent) {
                this.sendBackendRequest(this.onFilterBarSearch.bind(this), oModel, aSelectionSet);

            } else {

                var aData;
                this.oF4HelpDialog.getTable().unbindRows();
                this.oF4HelpDialog.getTable().bindAggregation("rows", "/F4HelpList");
                if (this.sModelName === "companyListModel") {
                    oModel.setProperty("/F4HelpList", oModel.getProperty("/List"));
                    oModel.updateBindings(true);
                    aData = ["companyCode", "description"];

                } else if (this.sModelName === "vendorListModel") {
                    oModel.setProperty("/F4HelpList", oModel.getProperty("/List"));
                    aData = ["Vendor", "Name1"];
                    oModel.updateBindings(true);
                } else if (this.sModelName === "taxCodeModel") {
                    oModel.setProperty("/F4HelpList", oModel.getProperty("/List"));
                    aData = ["taxCode", "description"];
                } else if (this.sModelName === "businessAreaModel") {
                    oModel.setProperty("/F4HelpList", oModel.getProperty("/List"));
                    aData = ["businessArea", "description"];
                } else if (this.sModelName === "GLAccountModel") {
                    oModel.setProperty("/F4HelpList", oModel.getProperty("/List"));
                    aData = ["companyCode", "glAccount", "longText", "shortText"];
                } else if (this.sModelName === "requesterModel") {
                    oModel.setProperty("/F4HelpList", oModel.getProperty("/List"));
                    aData = ["firstName", "fullname", "lastname", "userName"];
                } else if (this.sModelName === "costCenterModel") {
                    oModel.setProperty("/F4HelpList", oModel.getProperty("/List"));
                    aData = ["costCenter", "description"];
                } else if (this.sModelName === "profitCenterModel") {
                    oModel.setProperty("/F4HelpList", oModel.getProperty("/List"));
                    aData = ["profitCenter", "pctrName"];
                } else if (this.sModelName === "plantModel") {
                    oModel.setProperty("/F4HelpList", oModel.getProperty("/List"));
                    aData = ["plant", "description"];
                } else if (this.sModelName === "paymentTermListModel") {
                    oModel.setProperty("/F4HelpList", oModel.getProperty("/List"));
                    aData = ["paymentTerm", "description"];
                } else if (this.sModelName === "internalOrderModel") {
                    oModel.setProperty("/F4HelpList", oModel.getProperty("/List"));
                    //Start of Change: Kunj
                    aData = ["internalOrder", "description"];
                    //End of Change: Kunj
                } else if (this.sModelName === "paymentMethodListModel") {
                    oModel.setProperty("/F4HelpList", oModel.getProperty("/List"));
                    aData = ["paymentMethod", "description"];
                } else if (this.sModelName === "oneTimeVendorCountryModel") {
                    oModel.setProperty("/F4HelpList", oModel.getProperty("/List"));
                    aData = ["CountryCode", "Description"];
                } else if (this.sModelName === "currencyListModel") {
                    oModel.setProperty("/F4HelpList", oModel.getProperty("/List"));
                    aData = ["CurrencyCode", "CurrencyDescription"];
                }
                oModel.updateBindings(true)


                var sSearchQuery = this._oBasicSearchField.getValue();
                if (sSearchQuery && sSearchQuery !== "" && sSearchQuery !== "*") {
                    var aFilters = aSelectionSet.reduce(function (aResult, oControl) {
                        if (oControl.getValue()) {
                            aResult.push(new Filter({
                                path: oControl.getName(),
                                operator: FilterOperator.Contains,
                                value1: oControl.getValue()
                            }));
                        }

                        return aResult;
                    }, []);

                    if (aData && aData.length) {
                        var aFilterItems = [];
                        for (var i = 0; i < aData.length; i++) {

                            aFilterItems.push(new Filter({ path: aData[i], operator: FilterOperator.Contains, value1: sSearchQuery }));

                        }

                    }

                    aFilters.push(new Filter({
                        filters: aFilterItems,
                        and: false
                    }));

                    this._filterTable(new Filter({
                        filters: aFilters,
                        and: true
                    }));

                } else if (sSearchQuery === "*") {

                    var oValueHelpDialog = this.oF4HelpDialog;



                    oValueHelpDialog.update();



                }

                this.oF4HelpDialog.rerender();
            }

        },
        // Second call to CPI for Vendor, Requester and Internal order fields to fetch data
        sendBackendRequest: function (fnFilterSearch, oModel, aSelectionSet) {

            var sUrl, sTitle, oData, sCode;

            this.fnFilterFunc = fnFilterSearch;
            this.oModel = oModel;
            this.aSelectionSet = aSelectionSet;
            if (this.sName === "Vendor") {
                sUrl = this._getCPIBaseURL() + "getVendorcode";
                this.sUrl = this._getCPIBaseURL() + "getVendorcode";
                sTitle = "Select Vendor";
                this.sModelName = "vendorListModel";
                oData = {
                    vendorNumber: "*" + this._oBasicSearchField.getValue() + "*",
                    vendorName: ""
                };
                sCall = "SecondCall";
            } else if (this.sName === "Requester") {
                sTitle = "Select User";
                this.sModelName = "requesterModel";
                sCode = "requester";
                this.sUrl = sUrl = this._getCPIBaseURL() + "getUserList";
                oData = {
                    "userId": "*" + this._oBasicSearchField.getValue() + "*",
                    "maxRow": 100,
                    "fname": "",
                    "lname": "",
                    "parameter": "USERNAME",
                    "field": ""

                };
                var sCall;
                if (this._oBasicSearchField.getValue()) {
                    sCall = "SecondCall";
                } else {
                    sCall = undefined;
                }
                //Change by Kunj
            } else if (this.sName === "internalOrder") {
                sTitle = "Select Internal Order";
                this.sModelName = "internalOrderModel";
                sCode = "internalOrder";
                sUrl = this._getCPIBaseURL() + "getInternalOrder";
                var sSearchString = "%" + this._oBasicSearchField.getValue() + "%";
                oData = {
                    "internalOrder": sSearchString.toUpperCase(),
                    "companyCode": this.createView.getModel('companyListModel').getProperty('/value'),
                    "description": "",
                    "maxRows": 100
                };
                var sCall;
                sCall = "SecondCall";
            }


            this.triggerBackendService(oData, this.oView, sUrl, this._oBasicSearchField.getValue(), undefined, sCall);
        },
        // Handle filtered data to Value help if data not matches setting Table Data to "No matching record exists with search criteria"
        _filterTable: function (oFilter) {

            var oValueHelpDialog = this.oF4HelpDialog;

            oValueHelpDialog.getTableAsync().then(function (oTable) {
                if (oTable.bindRows) {
                    oTable.getBinding("rows").filter(oFilter);
                }

                if (oTable.bindItems) {
                    oTable.getBinding("items").filter(oFilter);
                }

                oValueHelpDialog.update();
                oTable.setNoData("No matching record exists with search criteria");
            });

        },
        // Updating view Binding 
        updateViewBinding: function (oView, oEvent) {
            var oItem = oEvent.getParameter("selectedItem");
            if (oItem) {
                var oModel = oView.getModel(this.sModelName);
                oModel.setProperty("/value", oItem.getDescription());
                oModel.setProperty("/desc", oItem.getTitle());

                this.oParamObject.invoiceDetails.headerDetail.companyCode = oItem.getDescription();
            }
        },
        // Fetching the Token of Business rules
        _fetchToken: function () {
            var eToken;
            $.ajax({
                url: this._getRuleServiceBaseURL() + "/xsrf-token",
                method: "GET",
                async: false,
                headers: {
                    "X-CSRF-Token": "Fetch"
                },
                success: function (t, a, i) {
                    eToken = i.getResponseHeader("X-CSRF-Token")
                }
            });
            return eToken
        },

        getBusyLoader: function () {
            return this.busyLoader;
        },
        // On cancle button over Value Help Dialog
        onValueHelpCancelPress: function () {

            if (this.oF4HelpDialog && this.oF4HelpDialog.getTable()) {
                this.oF4HelpDialog.getTable().getModel().setProperty("/F4HelpList", []);
                this.oF4HelpDialog.getTable().getModel().setProperty("/List", []);
                this.oF4HelpDialog.getTable().getModel().updateBindings(true);

            }

            this.oF4HelpDialog.close();

            this.oF4HelpDialog = undefined;
        },
        // Function to handle Ok in Value Help Dialog
        onValueHelpOkPress: function (oEvent) {
            var oSelectedIndex = oEvent.getSource().getTable().getSelectedIndex(),
                oTable = oEvent.getSource().getTable(),
                oRow = oTable && oTable.getRows(),
                sValue = oRow[oSelectedIndex] && oRow[oSelectedIndex].getCells()[0] && oRow[oSelectedIndex].getCells()[0].getText(),
                sDesc = oRow[oSelectedIndex] && oRow[oSelectedIndex].getCells()[1] && oRow[oSelectedIndex].getCells()[1].getText();


            this.oSelectedModel.setProperty('/value', sValue);
            this.oSelectedModel.setProperty('/desc', sDesc);
            if (this.sModelName === "companyListModel") {
                if (!sValue && !sDesc) {
                    var aDataList = this.oSelectedModel.getProperty('/F4HelpList');
                    if (aDataList) {
                        var oData = aDataList[oSelectedIndex];
                        if (oData) {
                            this.oSelectedModel.setProperty('/value', oData.companyCode);
                            this.oSelectedModel.setProperty('/desc', oData.description);
                        }
                    }
                }
                this.oView.getModel("companyListModel").setProperty("/error", "None");

                // Get Currency based on company code selected
                if (!sValue) {
                    sValue = oData.companyCode;
                }
                this.triggerBackendService({ "companyCode": sValue }, this.oView, this._getCPIBaseURL() + "getCurrency", "singleCurrency");


            } else if (this.sModelName === "vendorListModel") {
                if (!sValue && !sDesc) {
                    var aDataList = this.oSelectedModel.getProperty('/F4HelpList');
                    if (aDataList) {
                        var oData = aDataList[oSelectedIndex];
                        if (oData) {
                            this.oSelectedModel.setProperty('/value', oData.Vendor);
                            this.oSelectedModel.setProperty('/desc', oData.Name1);
                        }
                    }
                }
                this.oView.getModel("vendorListModel").setProperty("/error", "None");
            } else if (this.sModelName === "oneTimeVendorCityModel") {
                this.oView.getModel("oneTimeVendorCityModel").setProperty("/error", "None");
            } else if (this.sModelName === "oneTimeVendorCountryModel") {
                if (!sValue && !sDesc) {
                    var aDataList = this.oSelectedModel.getProperty('/F4HelpList');
                    if (aDataList) {
                        var oData = aDataList[oSelectedIndex];
                        if (oData) {
                            this.oSelectedModel.setProperty('/value', oData.oneTimeVendorCountry);
                            this.oSelectedModel.setProperty('/desc', oData.oneTimeVendorDec);
                        }
                    }
                }
                this.oView.getModel("oneTimeVendorCountryModel").setProperty("/error", "None");
            } else if (this.sModelName === "GLAccountModel") {
                if (!sValue && !sDesc) {
                    var aDataList = this.oSelectedModel.getProperty('/F4HelpList');
                    if (aDataList) {
                        var oData = aDataList[oSelectedIndex];
                        if (oData) {
                            this.oSelectedModel.setProperty('/value', oData.glAccount);
                            this.oSelectedModel.setProperty('/desc', oData.shortText);
                        }
                    }
                }
                this.oView.getModel("GLAccountModel").setProperty("/error", "None");
            } else if (this.sModelName === "paymentMethodListModel") {
                if (!sValue && !sDesc) {
                    var aDataList = this.oSelectedModel.getProperty('/F4HelpList');
                    if (aDataList) {
                        var oData = aDataList[oSelectedIndex];
                        if (oData) {
                            this.oSelectedModel.setProperty('/value', oData.paymentMethod);
                            this.oSelectedModel.setProperty('/desc', oData.description);
                        }
                    }
                }
                this.oView.getModel("paymentMethodListModel").setProperty("/error", "None");
            } else if (this.sModelName === "plantModel") {
                if (!sValue && !sDesc) {
                    var aDataList = this.oSelectedModel.getProperty('/F4HelpList');
                    if (aDataList) {
                        var oData = aDataList[oSelectedIndex];
                        if (oData) {
                            this.oSelectedModel.setProperty('/value', oData.plant);
                            this.oSelectedModel.setProperty('/desc', oData.plant);
                        }
                    }
                }
                this.oView.getModel("plantModel").setProperty("/error", "None");
            } else if (this.sModelName === "paymentTermListModel") {
                if (!sValue && !sDesc) {
                    var aDataList = this.oSelectedModel.getProperty('/F4HelpList');
                    if (aDataList) {
                        var oData = aDataList[oSelectedIndex];
                        if (oData) {
                            this.oSelectedModel.setProperty('/value', oData.paymentTerm);
                            this.oSelectedModel.setProperty('/desc', oData.description);
                        }
                    }
                }
                // Get Days and Discount values based on paymentTerm selected
                this.triggerBackendService({ "paymentTermKey": sValue }, this.oView, this._getCPIBaseURL() + "getPaymentkeyDuedetails");
            } else if (this.sModelName === "currencyListModel") {
                if (!sValue && !sDesc) {
                    var aDataList = this.oSelectedModel.getProperty('/F4HelpList');
                    if (aDataList) {
                        var oData = aDataList[oSelectedIndex];
                        if (oData) {
                            this.oSelectedModel.setProperty('/value', oData.currency);
                            this.oSelectedModel.setProperty('/desc', oData.country);
                            if (this.currency === oData.currency) {
                                this.oView.getModel("createModel").setProperty("/exchangeRateEnable", false);
                            } else {
                                this.oView.getModel("createModel").setProperty("/exchangeRateEnable", true);
                            }

                        }
                    }
                } else {
                    if (this.currency === sValue) {
                        this.oView.getModel("createModel").setProperty("/exchangeRateEnable", false);
                    } else {
                        this.oView.getModel("createModel").setProperty("/exchangeRateEnable", true);
                    }
                }
            } else if (this.sModelName === "requesterModel") {
                if (!sValue && !sDesc) {
                    var aDataList = this.oSelectedModel.getProperty('/F4HelpList');
                    if (aDataList) {
                        var oData = aDataList[oSelectedIndex];
                        if (oData) {
                            this.oSelectedModel.setProperty('/value', oData.userName);
                            this.oSelectedModel.setProperty('/desc', oData.fullname);
                        }
                    }
                }
                if (!sDesc) {
                    sDesc = oData.fullname;
                }
                this.oView.getModel("createModel").setProperty("/requesterName", sDesc);
            } else if (this.sModelName === "costCenterModel") {
                if (!sValue && !sDesc) {
                    var aDataList = this.oSelectedModel.getProperty('/F4HelpList');
                    if (aDataList) {
                        var oData = aDataList[oSelectedIndex];
                        if (oData) {
                            this.oSelectedModel.setProperty('/value', oData.costCenter);
                            this.oSelectedModel.setProperty('/desc', oData.description);
                        }
                    }
                }
                this.oView.getModel("costCenterModel").setProperty("/error", "None");
            } else if (this.sModelName === "profitCenterModel") {
                if (!sValue && !sDesc) {
                    var aDataList = this.oSelectedModel.getProperty('/F4HelpList');
                    if (aDataList) {
                        var oData = aDataList[oSelectedIndex];
                        if (oData) {
                            this.oSelectedModel.setProperty('/value', oData.profitCenter);
                            this.oSelectedModel.setProperty('/desc', oData.pctrName);
                        }
                    }
                }
                this.oView.getModel("profitCenterModel").setProperty("/error", "None");
            } else if (this.sModelName === "businessAreaModel") {
                if (!sValue && !sDesc) {
                    var aDataList = this.oSelectedModel.getProperty('/F4HelpList');
                    if (aDataList) {
                        var oData = aDataList[oSelectedIndex];
                        if (oData) {
                            this.oSelectedModel.setProperty('/value', oData.businessArea);
                            this.oSelectedModel.setProperty('/desc', oData.description);
                        }
                    }
                }
                this.oView.getModel("businessAreaModel").setProperty("/error", "None");
            } else if (this.sModelName === "internalOrderModel") {
                if (!sValue && !sDesc) {
                    var aDataList = this.oSelectedModel.getProperty('/F4HelpList');
                    if (aDataList) {
                        var oData = aDataList[oSelectedIndex];
                        if (oData) {
                            this.oSelectedModel.setProperty('/value', oData.internalOrder);
                            this.oSelectedModel.setProperty('/desc', oData.description);
                        }
                    }
                }
                this.oView.getModel("internalOrderModel").setProperty("/error", "None");
            } else if (this.sModelName === "taxCodeModel") {
                if (!sValue && !sDesc) {
                    var aDataList = this.oSelectedModel.getProperty('/F4HelpList');
                    if (aDataList) {
                        var oData = aDataList[oSelectedIndex];
                        if (oData) {
                            this.oSelectedModel.setProperty('/value', oData.taxCode);
                            this.oSelectedModel.setProperty('/desc', oData.description);
                        }
                    }
                }
                this.oView.getModel("taxCodeModel").setProperty("/error", "None");
            }

            if (this.oF4HelpDialog && this.oF4HelpDialog.getTable()) {

                this.oF4HelpDialog.getTable().getModel().setProperty("/F4HelpList", []);
                this.oF4HelpDialog.getTable().getModel().updateBindings(true);

            }

            this.oF4HelpDialog.close();
        },

        setItemDetailsToModel: function (oModel) {
            this.getItemDetailsModel = oModel;
        },
        // Storing Create View for referance
        storeCreateView: function (oCreateView) {
            this.createView = oCreateView;
        },
        // Storing Item View for referance
        storeAddItemView: function (oAddItemView) {
            this.addItemView = oAddItemView;
        },



        triggerCallToGetparameterData: function (oView, sName, bValidate, sValue) {

            this.bValidate = bValidate;
            this.sValue = sValue;
            this.oControllerView = oView;

            var sUrl, oData;

            if (sName === "Payment Methods") {
                sUrl = this._getCPIBaseURL() + "getCurrency"
                oData = JSON.stringify({ "companyCode": oView.getModel('companyListModel').getProperty('/value') });
                this.sName = sName;

            } else {

                sUrl = this._getCPIBaseURL() + "getTaxProcedure"
                oData = JSON.stringify({ "country": this.sCountry });
                this.sName = sName;

            }


            $.ajax({
                url: sUrl,
                method: "POST",
                async: false,
                contentType: "application/json",
                data: oData,
                success: $.proxy(function (response) {
                    if (this.sName === "Payment Methods") {
                        if (this.bValidate) {
                            this.getValueHelpDialog(this.oControllerView, this.sName, this.bValidate, this.sValue, undefined, response.country);
                        } else {
                            this.getValueHelpDialog(this.oControllerView, this.sName, undefined, undefined, undefined, response.country);
                        }
                    } else {
                        if (this.bValidate) {
                            this.getValueHelpDialog(this.oControllerView, this.sName, this.bValidate, this.sValue, undefined, response.taxProcedure.taxProcedure);
                        } else {
                            this.getValueHelpDialog(this.oControllerView, this.sName, undefined, undefined, undefined, response.taxProcedure.taxProcedure);
                        }
                    }
                }.bind(this)),
                error: function (error) {


                }.bind(this)
            });

        },
        // Trigeering Tax calculation CPI From Item page (On Add button press)
        triggerTaxCalculationICf: function (bItemView) {

            this.bItemView = bItemView;

            var aData = this.createView.getModel('ItemDetails').getProperty('/data');

            var taxCalculation = {
                "headerData": {},
                "accountGL": [],
                "currencyAmount": []
            };

            taxCalculation.headerData = {

                "userName": sap.ushell.Container.getService("UserInfo").getUser().getFullName(),

                "postingDate": this.createView.getModel('createModel').getProperty("/invoiceDate"),

                "documentDate": this.createView.getModel('createModel').getProperty("/invoiceDate"),

                "companyCode": this.createView.getModel("companyListModel").getProperty("/value"),

                "docType": "KR",

                "reference": this.createView.getModel('createModel').getProperty("/reference")

            };

            var iLen = aData && aData.length;


            for (var i = 0; i < iLen; i++) {



                taxCalculation.currencyAmount.push({

                    "itemAccountNumber": i + 2,

                    "currency": this.createView.getModel("currencyListModel").getProperty("/value"),

                    "amount": aData[i].amount

                });

                taxCalculation.accountGL.push({

                    "itemAccountNumber": i + 2,

                    "glAccountNo": aData[i].glAccount,

                    "itemText": aData[i].itemText,

                    "acctType": "S",

                    "companyCode": this.createView.getModel("companyListModel").getProperty("/value"),

                    "taxCode": aData[i].taxCode,

                    "vendorNo": this.createView.getModel("vendorListModel").getProperty("/value"),

                    "profitCenter": aData[i].profitCenter,

                    "costCenter": aData[i].costCenter,

                    "businessArea": aData[i].businessArea,

                    "plant": aData[i].plant,

                    "internalOrder": aData[i].internalOrder

                });


            }

            var oData = JSON.stringify(taxCalculation);

            jQuery.ajax({
                url: this._getCPIBaseURL() + "fetchTaxcalculation",
                type: "POST",
                data: oData,
                contentType: "application/json",
                success: this.handleTaxData.bind(this),
                error: this.handleICFCallbackError.bind(this)
            });

        },
        // Adding Tax calcuation and header amount and setting it to Total Amount Field
        handleTaxData: function (sJson) {

            if (sJson !== "") {

                if (sJson.currencyAmount && !sJson.currencyAmount.length) {
                    if (parseFloat(sJson.currencyAmount.baseAmount) > 0) {
                        this.createView.getModel('createModel').setProperty("/taxAmount", parseFloat(sJson.currencyAmount.amount));
                    }

                } else if (sJson.currencyAmount.length) {

                    var iAmount = 0;
                    for (var i = 0; i < sJson.currencyAmount.length; i++) {

                        if (parseFloat(sJson.currencyAmount[i].baseAmount) > 0) {

                            iAmount = parseFloat(sJson.currencyAmount[i].amount) + iAmount;
                        }
                    }

                    if (iAmount) {
                        this.createView.getModel('createModel').setProperty("/taxAmount", iAmount);
                    }
                }
            }

            var iTaxAmount = this.createView.getModel('createModel').getProperty("/taxAmount"), iTotalAmount;

            if (iTaxAmount) {
                iTotalAmount = parseFloat(iTaxAmount) + parseFloat(this.createView.getModel('createModel').getProperty("/amount"));
            }

            var iFinalValue;

            if (parseFloat(iTotalAmount) % 1) {
                iFinalValue = parseFloat(iTotalAmount).toFixed(2);
            } else {
                iFinalValue = iTotalAmount;
            }
            this.createView.getModel('createModel').setProperty("/invoiceTotalAmount", iFinalValue);
            if (this.bItemView) {
                this.addItemView.oController.getOwnerComponent().getTargets().display("TargetCreate", {
                    fromTarget: "AddItem"
                });
            }

        },

        handleICFCallbackError: function () {
            if (this.bItemView) {
                this.addItemView.oController.getOwnerComponent().getTargets().display("TargetCreate", {
                    fromTarget: "AddItem"
                });
            }

        }

    };
});