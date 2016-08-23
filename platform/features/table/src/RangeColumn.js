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

/**
 * Module defining DomainColumn. Created by vwoeltje on 11/18/14.
 */
define(
    [],
    function () {

        /**
         * A column which will report telemetry range values
         * (typically, measurements.) Used by the ScrollingListController.
         *
         * @memberof platform/features/table
         * @constructor
         * @param rangeMetadata an object with the machine- and human-
         *        readable names for this range (in `key` and `name`
         *        fields, respectively.)
         * @param {TelemetryFormatter} telemetryFormatter the telemetry
         *        formatting service, for making values human-readable.
         */
        function RangeColumn(rangeMetadata, telemetryFormatter) {
            this.rangeMetadata = rangeMetadata;
            this.telemetryFormatter = telemetryFormatter;
        }

        RangeColumn.prototype.getTitle = function () {
            return this.rangeMetadata.name;
        };

        RangeColumn.prototype.getValue = function (domainObject, datum) {
            var range = this.rangeMetadata.key,
                limit = domainObject.getCapability('limit'),
                value = isNaN(datum[range]) ? datum[range] : parseFloat(datum[range]),
                alarm = limit && limit.evaluate(datum, range);

            return {
                cssClass: alarm && alarm.cssClass,
                text: typeof (value) === 'undefined' ? undefined : this.telemetryFormatter.formatRangeValue(value)
            };
        };

        return RangeColumn;
    }
);
