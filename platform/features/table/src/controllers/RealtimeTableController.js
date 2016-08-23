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
    [
        './TelemetryTableController'
    ],
    function (TableController) {

        /**
         * Extends TelemetryTableController and adds real-time streaming
         * support.
         * @memberof platform/features/table
         * @param $scope
         * @param telemetryHandler
         * @param telemetryFormatter
         * @constructor
         */
        function RealtimeTableController($scope, telemetryHandler, telemetryFormatter) {
            TableController.call(this, $scope, telemetryHandler, telemetryFormatter);

            this.maxRows = 100000;
        }

        RealtimeTableController.prototype = Object.create(TableController.prototype);

        /**
         * Overrides method on TelemetryTableController providing handling
         * for realtime data.
         */
        RealtimeTableController.prototype.addRealtimeData = function () {
            var self = this,
                datum,
                row;
            this.handle.getTelemetryObjects().forEach(function (telemetryObject) {
                datum = self.handle.getDatum(telemetryObject);
                if (datum) {
                    //Populate row values from telemetry datum
                    row = self.table.getRowValues(telemetryObject, datum);
                    self.$scope.rows.push(row);

                    //Inform table that a new row has been added
                    if (self.$scope.rows.length > self.maxRows) {
                        self.$scope.$broadcast('remove:row', 0);
                        self.$scope.rows.shift();
                    }

                    self.$scope.$broadcast('add:row',
                        self.$scope.rows.length - 1);
                }
            });
            this.$scope.loading = false;
        };

        return RealtimeTableController;
    }
);
