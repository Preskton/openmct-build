/*****************************************************************************
 * Open MCT, Copyright (c) 2014-2016, United States Government
 * as represented by the Administrator of the National Aeronautics and Space
 * Administration. All rights reserved.
 *
 * Open MCT is licensed under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 *
 * Open MCT includes source code licensed under additional open source
 * licenses. See the Open Source Licenses file (LICENSES.md) included with
 * this source code distribution or the Licensing information page available
 * at runtime from the About dialog for additional information.
 *****************************************************************************/

define(
    ["../../src/capabilities/EditorCapability"],
    function (EditorCapability) {

        describe("The editor capability", function () {
            var mockDomainObject,
                capabilities,
                mockParentObject,
                mockTransactionService,
                mockStatusCapability,
                mockParentStatus,
                mockContextCapability,
                capability;

            function fastPromise(val) {
                return {
                    then: function (callback) {
                        return callback(val);
                    }
                };
            }

            beforeEach(function () {
                mockDomainObject = jasmine.createSpyObj(
                    "domainObject",
                    ["getId", "getModel", "hasCapability", "getCapability", "useCapability"]
                );
                mockParentObject = jasmine.createSpyObj(
                    "domainObject",
                    ["getId", "getModel", "hasCapability", "getCapability", "useCapability"]
                );
                mockTransactionService = jasmine.createSpyObj(
                    "transactionService",
                    [
                        "startTransaction",
                        "size",
                        "commit",
                        "cancel"
                    ]
                );
                mockTransactionService.commit.andReturn(fastPromise());
                mockTransactionService.cancel.andReturn(fastPromise());

                mockStatusCapability = jasmine.createSpyObj(
                    "statusCapability",
                    ["get", "set"]
                );
                mockParentStatus = jasmine.createSpyObj(
                    "statusCapability",
                    ["get", "set"]
                );
                mockContextCapability = jasmine.createSpyObj(
                    "contextCapability",
                    ["getParent"]
                );
                mockContextCapability.getParent.andReturn(mockParentObject);

                capabilities = {
                    context: mockContextCapability,
                    status: mockStatusCapability
                };

                mockDomainObject.hasCapability.andCallFake(function (name) {
                    return capabilities[name] !== undefined;
                });

                mockDomainObject.getCapability.andCallFake(function (name) {
                    return capabilities[name];
                });

                mockParentObject.getCapability.andReturn(mockParentStatus);
                mockParentObject.hasCapability.andReturn(false);

                capability = new EditorCapability(
                    mockTransactionService,
                    mockDomainObject
                );
            });

            it("starts a transaction when edit is invoked", function () {
                capability.edit();
                expect(mockTransactionService.startTransaction).toHaveBeenCalled();
            });

            it("sets editing status on object", function () {
                capability.edit();
                expect(mockStatusCapability.set).toHaveBeenCalledWith("editing", true);
            });

            it("uses editing status to determine editing context root", function () {
                capability.edit();
                mockStatusCapability.get.andReturn(false);
                expect(capability.isEditContextRoot()).toBe(false);
                mockStatusCapability.get.andReturn(true);
                expect(capability.isEditContextRoot()).toBe(true);
            });

            it("inEditingContext returns true if parent object is being" +
                " edited", function () {
                mockStatusCapability.get.andReturn(false);
                mockParentStatus.get.andReturn(false);
                expect(capability.inEditContext()).toBe(false);
                mockParentStatus.get.andReturn(true);
                expect(capability.inEditContext()).toBe(true);
            });

            describe("save", function () {
                beforeEach(function () {
                    capability.edit();
                    capability.save();
                });
                it("commits the transaction", function () {
                    expect(mockTransactionService.commit).toHaveBeenCalled();
                });
                it("resets the edit state", function () {
                    expect(mockStatusCapability.set).toHaveBeenCalledWith('editing', false);
                });
            });

            describe("cancel", function () {
                beforeEach(function () {
                    capability.edit();
                    capability.cancel();
                });
                it("cancels the transaction", function () {
                    expect(mockTransactionService.cancel).toHaveBeenCalled();
                });
                it("resets the edit state", function () {
                    expect(mockStatusCapability.set).toHaveBeenCalledWith('editing', false);
                });
            });

            describe("dirty", function () {
                var model = {};

                beforeEach(function () {
                    mockDomainObject.getModel.andReturn(model);
                    capability.edit();
                    capability.cancel();
                });
                it("returns true if the object has been modified since it" +
                    " was last persisted", function () {
                    mockTransactionService.size.andReturn(0);
                    expect(capability.dirty()).toBe(false);
                    mockTransactionService.size.andReturn(1);
                    expect(capability.dirty()).toBe(true);
                });
            });
        });
    }
);
