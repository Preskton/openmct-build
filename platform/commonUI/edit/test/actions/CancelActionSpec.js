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
    ["../../src/actions/CancelAction"],
    function (CancelAction) {

        describe("The Cancel action", function () {
            var mockDomainObject,
                mockParentObject,
                capabilities = {},
                parentCapabilities = {},
                actionContext,
                action;

            function mockPromise(value) {
                return {
                    then: function (callback) {
                        return mockPromise(callback(value));
                    }
                };
            }

            beforeEach(function () {
                mockDomainObject = jasmine.createSpyObj(
                    "domainObject",
                    [
                        "getCapability",
                        "hasCapability",
                        "getModel"
                    ]
                );
                mockDomainObject.getModel.andReturn({});

                mockParentObject = jasmine.createSpyObj(
                    "parentObject",
                    [
                        "getCapability"
                    ]
                );
                mockParentObject.getCapability.andCallFake(function (name) {
                    return parentCapabilities[name];
                });

                capabilities.editor = jasmine.createSpyObj(
                    "editor",
                    ["save", "cancel", "isEditContextRoot"]
                );
                capabilities.action = jasmine.createSpyObj(
                    "actionCapability",
                    [
                        "perform"
                    ]
                );
                capabilities.location = jasmine.createSpyObj(
                    "locationCapability",
                    [
                        "getOriginal"
                    ]
                );
                capabilities.location.getOriginal.andReturn(mockPromise(mockDomainObject));
                capabilities.context = jasmine.createSpyObj(
                    "contextCapability",
                    [
                        "getParent"
                    ]
                );
                capabilities.context.getParent.andReturn(mockParentObject);

                parentCapabilities.action = jasmine.createSpyObj(
                    "actionCapability",
                    [
                        "perform"
                    ]
                );

                actionContext = {
                    domainObject: mockDomainObject
                };

                mockDomainObject.getCapability.andCallFake(function (name) {
                    return capabilities[name];
                });

                mockDomainObject.hasCapability.andCallFake(function (name) {
                    return !!capabilities[name];
                });

                capabilities.editor.cancel.andReturn(mockPromise(true));

                action = new CancelAction(actionContext);

            });

            it("only applies to domain object that is being edited", function () {
                capabilities.editor.isEditContextRoot.andReturn(true);
                expect(CancelAction.appliesTo(actionContext)).toBeTruthy();
                expect(mockDomainObject.hasCapability).toHaveBeenCalledWith("editor");

                capabilities.editor.isEditContextRoot.andReturn(false);
                expect(CancelAction.appliesTo(actionContext)).toBeFalsy();

                mockDomainObject.hasCapability.andReturn(false);
                expect(CancelAction.appliesTo(actionContext)).toBeFalsy();
            });

            it("invokes the editor capability's cancel functionality when" +
                " performed", function () {
                mockDomainObject.getModel.andReturn({persisted: 1});
                //Return true from navigate action
                capabilities.action.perform.andReturn(mockPromise(true));
                action.perform();

                // Should have called cancel
                expect(capabilities.editor.cancel).toHaveBeenCalled();

                // Definitely shouldn't call save!
                expect(capabilities.editor.save).not.toHaveBeenCalled();
            });

            it("navigates to object if existing using navigate action", function () {
                mockDomainObject.getModel.andReturn({persisted: 1});
                //Return true from navigate action
                capabilities.action.perform.andReturn(mockPromise(true));
                action.perform();
                expect(capabilities.action.perform).toHaveBeenCalledWith("navigate");
            });

            it("navigates to parent if new using navigate action", function () {
                mockDomainObject.getModel.andReturn({persisted: undefined});
                action.perform();
                expect(parentCapabilities.action.perform).toHaveBeenCalledWith("navigate");
            });
        });
    }
);
