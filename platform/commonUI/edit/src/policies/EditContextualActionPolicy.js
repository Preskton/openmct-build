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
    [],
    function () {

        /**
         * Policy controlling whether the context menu is visible when
         * objects are being edited
         * @param navigationService
         * @param editModeBlacklist A blacklist of actions disallowed from
         * context menu when navigated object is being edited
         * @param nonEditContextBlacklist A blacklist of actions disallowed
         * from context menu of non-editable objects, when navigated object
         * is being edited
         * @constructor
         * @param editModeBlacklist A blacklist of actions disallowed from
         * context menu when navigated object is being edited
         * @param nonEditContextBlacklist A blacklist of actions disallowed
         * from context menu of non-editable objects, when navigated object
         * @implements {Policy.<Action, ActionContext>}
         */
        function EditContextualActionPolicy(navigationService, editModeBlacklist, nonEditContextBlacklist) {
            this.navigationService = navigationService;

            //The list of objects disallowed on target object when in edit mode
            this.editModeBlacklist = editModeBlacklist;
            //The list of objects disallowed on target object that is not in
            // edit mode (ie. the context menu in the tree on the LHS).
            this.nonEditContextBlacklist = nonEditContextBlacklist;
        }

        EditContextualActionPolicy.prototype.allow = function (action, context) {
            var selectedObject = context.domainObject,
                navigatedObject = this.navigationService.getNavigation(),
                actionMetadata = action.getMetadata ? action.getMetadata() : {};

            if (navigatedObject.hasCapability("editor") && navigatedObject.getCapability("editor").isEditContextRoot()) {
                if (selectedObject.hasCapability("editor") && selectedObject.getCapability("editor").inEditContext()) {
                    return this.editModeBlacklist.indexOf(actionMetadata.key) === -1;
                } else {
                    //Target is in the context menu
                    return this.nonEditContextBlacklist.indexOf(actionMetadata.key) === -1;
                }
            } else {
                return true;
            }
        };

        return EditContextualActionPolicy;
    }
);
