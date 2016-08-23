/*****************************************************************************
 * Open MCT, Copyright (c) 2009-2016, United States Government
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

define([], function () {

    /**
     * A column showing relationships to activity modes.
     * @constructor
     * @param {number} index the zero-based index of the composition
     *        element associated with this column
     * @param idMap an object containing key value pairs, where keys
     *        are domain object identifiers and values are whatever
     *        should appear in CSV output in their place
     * @implements {platform/features/timeline.TimelineCSVColumn}
     */
    function ModeColumn(index, idMap) {
        this.index = index;
        this.idMap = idMap;
    }

    ModeColumn.prototype.name = function () {
        return "Activity Mode " + (this.index + 1);
    };

    ModeColumn.prototype.value = function (domainObject) {
        var model = domainObject.getModel(),
            modes = (model.relationships || {}).modes || [];
        return modes.length > this.index ?
            this.idMap[modes[this.index]] : "";
    };

    return ModeColumn;
});
