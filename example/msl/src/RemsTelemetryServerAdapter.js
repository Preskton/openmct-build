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
/*global define*/
/*jslint es5: true */

define(
    [
        "./MSLDataDictionary",
        "module"
    ],
    function (MSLDataDictionary, module) {
        "use strict";

        var TERRESTRIAL_DATE = "terrestrial_date",
            LOCAL_DATA = "../data/rems.json";

        /**
         * Fetches historical data from the REMS instrument on the Curiosity
         * Rover.
         * @memberOf example/msl
         * @param $q
         * @param $http
         * @param REMS_WS_URL The location of the REMS telemetry data.
         * @constructor
         */
        function RemsTelemetryServerAdapter($q, $http, $log, REMS_WS_URL) {
            this.localDataURI = module.uri.substring(0, module.uri.lastIndexOf('/') + 1) + LOCAL_DATA;
            this.deferreds = {};
            this.REMS_WS_URL = REMS_WS_URL;
            this.$q = $q;
            this.$http = $http;
            this.$log = $log;
            this.cache = undefined;
        }

        /**
         * The data dictionary for this data source.
         * @type {MSLDataDictionary}
         */
        RemsTelemetryServerAdapter.prototype.dictionary = MSLDataDictionary;

        /**
         * Fetches historical data from source, and associates it with the
         * given request ID.
         * @private
         */
        RemsTelemetryServerAdapter.prototype.requestHistory = function(request) {
            var self = this,
                id = request.key,
                deferred = this.$q.defer();

            function processResponse(response){
                var data = [];
                /*
                 * Currently all data is returned for entire history of the mission. Cache response to avoid unnecessary re-queries.
                 */
                self.cache = response;
                /*
                 * History data is organised by Sol. Iterate over sols...
                 */
                response.data.soles.forEach(function(solData){
                    /*
                     * Check that valid data exists
                     */
                    if (!isNaN(solData[id])) {
                        /*
                         * Append each data point to the array of values
                         * for this data point property (min. temp, etc).
                         */
                        data.unshift({
                            date: Date.parse(solData[TERRESTRIAL_DATE]),
                            value: solData[id]
                        });
                    }
                });
                return data;
            }

            function fallbackToLocal() {
                self.$log.warn("Loading REMS data failed, probably due to" +
                    " cross origin policy. Falling back to local data");
                return self.$http.get(self.localDataURI);
            }

            //Filter results to match request parameters
            function filterResults(results) {
                return results.filter(function(result){
                    return result.date >= (request.start || Number.MIN_VALUE) &&
                        result.date <= (request.end || Number.MAX_VALUE);
                });
            }

            function packageAndResolve(results){
                deferred.resolve({id: id, values: results});
            }


            this.$q.when(this.cache || this.$http.get(this.REMS_WS_URL))
                .catch(fallbackToLocal)
                .then(processResponse)
                .then(filterResults)
                .then(packageAndResolve);

            return deferred.promise;
        };

        /**
         * Requests historical telemetry for the named data attribute. In
         * the case of REMS, this data source exposes multiple different
         * data variables from the REMS instrument, including temperature
         * and others
         * @param id The telemetry data point key to be queried.
         * @returns {Promise | Array<RemsTelemetryValue>} that resolves with an Array of {@link RemsTelemetryValue} objects for the request data key.
         */
        RemsTelemetryServerAdapter.prototype.history = function(request) {
            var id = request.key;
            return this.requestHistory(request);
        };

        return RemsTelemetryServerAdapter;
    }
);

