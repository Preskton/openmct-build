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
    ["../../src/controllers/ContextMenuController"],
    function (ContextMenuController) {

        describe("The context menu controller", function () {
            var mockScope,
                mockActions,
                controller;

            beforeEach(function () {
                mockActions = jasmine.createSpyObj("action", ["getActions"]);
                mockScope = jasmine.createSpyObj("$scope", ["$watch"]);
                controller = new ContextMenuController(mockScope);
            });

            it("watches scope that may change applicable actions", function () {
                // The action capability
                expect(mockScope.$watch).toHaveBeenCalledWith(
                    "action",
                    jasmine.any(Function)
                );
            });

            it("populates the scope with grouped and ungrouped actions", function () {
                mockScope.action = mockActions;
                mockScope.parameters = { category: "test" };

                mockActions.getActions.andReturn(["a", "b", "c"]);

                // Call the watch
                mockScope.$watch.mostRecentCall.args[1]();

                // Should have grouped and ungrouped actions in scope now
                expect(mockScope.menuActions.length).toEqual(3);
            });
        });
    }
);
