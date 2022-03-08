sap.ui.define([
    "com/sap/cp/dpa/invwpo/taskUI/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/core/format/DateFormat",
    "sap/m/BusyDialog"
], function (BaseController, JSONModel, MessageBox, MessageToast, DateFormat, BusyDialog) {
    "use strict";
    var workflowId;
    return BaseController.extend("com.sap.cp.dpa.invwpo.taskUI.controller.Approve", {

        onInit: function () {
            this.configureView();

            // document service interaction
            this.oAttachmentsModel = new JSONModel();
            this.setModel(this.oAttachmentsModel, "attachmentsModel");
            this.getAttachments();
        },
        configureView: function () {

            var startupParameters = this.getComponentData().startupParameters;
            var approveText = this.getMessage("Approve");
            var declineText = this.getMessage("Decline");
            var reworkText = this.getMessage("Not Responsible");

            var oThisController = this;

            /**
             * APPROVE BUTTON
             */
            // Implementation for the approve action
            var oApproveAction = {
                sBtnTxt: approveText,
                onBtnPressed: function () {
                    var model = oThisController.getModel();
                    model.refresh(true);
                    var processContext = model.getData();

                    // Call a local method to perform further action
                    oThisController._triggerComplete(
                        processContext,
                        startupParameters.taskModel.getData().InstanceID,
                        "approve"
                    );
                }
            };

            // Add 'Approve' action to the task
            startupParameters.inboxAPI.addAction({
                // confirm is a positive action
                action: oApproveAction.sBtnTxt,
                label: oApproveAction.sBtnTxt,
                type: "Accept"
            },
                // Set the onClick function
                oApproveAction.onBtnPressed);

            /**
            * Decline BUTTON
            */
            // Implementation for the decline action
            var oDeclineAction = {
                sBtnTxt: declineText,
                onBtnPressed: function () {
                    var model = oThisController.getModel();
                    model.refresh(true);
                    var processContext = model.getData();

                    // Call a local method to perform further action
                    oThisController._triggerComplete(
                        processContext,
                        startupParameters.taskModel.getData().InstanceID,
                        "decline"
                    );
                }
            };

            // Add 'decline' action to the task
            startupParameters.inboxAPI.addAction({
                // confirm is a positive action
                action: oDeclineAction.sBtnTxt,
                label: oDeclineAction.sBtnTxt,
                type: "Reject"
            },
                // Set the onClick function
                oDeclineAction.onBtnPressed);

            /**
            * REWORK BUTTON
            */
            // Implementation for the rework action
            var oReworkAction = {
                sBtnTxt: reworkText,
                onBtnPressed: function () {
                    var model = oThisController.getModel();
                    model.refresh(true);
                    var processContext = model.getData();

                    // Call a local method to perform further action
                    oThisController._triggerComplete(
                        processContext,
                        startupParameters.taskModel.getData().InstanceID,
                        "rework"
                    );
                }
            };

            // Add 'Rework' action to the task
            startupParameters.inboxAPI.addAction({
                // confirm is a positive action
                action: oReworkAction.sBtnTxt,
                label: oReworkAction.sBtnTxt
            },
                // Set the onClick function
                oReworkAction.onBtnPressed);
        },

        _triggerComplete: function (processContext, taskId, approvalStatus) {

            var oThisController = this;

            this.openBusyDialog();

            $.ajax({
                // Call workflow API to get the xsrf token
                url: this._getWorkflowRuntimeBaseURL() + "/xsrf-token",
                method: "GET",
                headers: {
                    "X-CSRF-Token": "Fetch"
                },
                success: function (result, xhr, data) {

                    // After retrieving the xsrf token successfully
                    var token = data.getResponseHeader("X-CSRF-Token");

                    // form the context that will be updated
                    var oBasicData = {
                        context: {
                            internal: {
                                "comments": processContext.comments,
                                "approvalStatus": approvalStatus
                            }
                        },
                        "status": "COMPLETED"
                    };

                    $.ajax({
                        // Call workflow API to complete the task
                        url: oThisController._getWorkflowRuntimeBaseURL() + "/task-instances/" + taskId,
                        method: "PATCH",
                        contentType: "application/json",
                        // pass the updated context to the API
                        data: JSON.stringify(oBasicData),
                        headers: {
                            // pass the xsrf token retrieved earlier
                            "X-CSRF-Token": token
                        },
                        // refreshTask needs to be called on successful completion
                        success: function (result, xhr, data) {
                            oThisController._refreshTask();
                            oThisController.closeBusyDialog();
                        }

                    });
                }
            });

        },


        _getDocumentServiceBaseURL: function () {
            var componentName = this.getOwnerComponent().getManifestEntry("/sap.app/id").replaceAll(".", "/");
            var componentPath = jQuery.sap.getModulePath(componentName);
            return componentPath + "/docservice/";
        },

        _getWorkflowRuntimeBaseURL: function () {
            var componentName = this.getOwnerComponent().getManifestEntry("/sap.app/id").replaceAll(".", "/");
            var componentPath= jQuery.sap.getModulePath(componentName);
            return componentPath + "/workflowruntime/v1";
        },

        // Request Inbox to refresh the control once the task is completed
        _refreshTask: function () {
            var taskId = this.getComponentData().startupParameters.taskModel.getData().InstanceID;
            this.getComponentData().startupParameters.inboxAPI.updateTask("NA", taskId);
            console.log("task is refreshed");
        },

        /**
         * DOCUMENT SERVICE INTEGRATION
         */
        getAttachments: function () {
            // get workflow ID
            var oModel = this.getView().getModel();
            workflowId = oModel.getData().headerInstanceId;

            var sUrl = this._getDocumentServiceBaseURL() + "workflowmanagement/NonPOVendorInvoiceDocuments/" + workflowId + "?succinct=true";

            var oSettings = {
                "url": sUrl,
                "method": "GET",
                // "async": false
            };
            var oThisController = this;

            $.ajax(oSettings)
                .done(function (results) {
                    oThisController._mapAttachmentsModel(results);
                })
                .fail(function (err) {
                    if (err !== undefined) {
                        var oErrorResponse = $.parseJSON(err.responseText);
                    } else {
                        MessageToast.show("Unknown error!");
                    }
                });
        },

        // assign data to attachments model
        _mapAttachmentsModel: function (data) {
            this.oAttachmentsModel.setData(data);
            this.oAttachmentsModel.refresh();
            console.log(this.oAttachmentsModel);
        },

        // formatting functions
        formatTimestampToDate: function (timestamp) {
            var oFormat = DateFormat.getDateTimeInstance();
            return oFormat.format(new Date(timestamp));
        },
        // File length  
        formatFileLength: function (fileSizeInBytes) {
            var i = -1;
            var byteUnits = [' kB', ' MB', ' GB', ' TB', 'PB', 'EB', 'ZB', 'YB'];
            do {
                fileSizeInBytes = fileSizeInBytes / 1024;
                i++;
            } while (fileSizeInBytes > 1024);

            return Math.max(fileSizeInBytes, 0.1).toFixed(1) + byteUnits[i];
        },
        // Function to download the attachment
        formatDownloadUrl: function (objectId) {
            return this._getDocumentServiceBaseURL() + "workflowmanagement/NonPOVendorInvoiceDocuments/"
                + workflowId + "?objectId=" + objectId + "&cmisselector=content";
        },
        // Function to convert the date format
        formatDate: function (date) {
            const dateFormat = sap.ui.core.format.DateFormat.getDateInstance({ pattern: "MMMM dd YYYY" });
            var formattedDate = dateFormat.parse(date);
            formattedDate = dateFormat.format(formattedDate);
            return formattedDate;
        }
    });
});