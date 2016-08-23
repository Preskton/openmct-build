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

define(
    [],
    function () {

        /**
         * Describes the time span of an activity object.
         * @param model the activity's object model
         */
        function ActivityTimespan(model, mutation) {
            // Get the start time for this timeline
            function getStart() {
                return model.start.timestamp;
            }

            // Get the end time for this timeline
            function getEnd() {
                return model.start.timestamp + model.duration.timestamp;
            }

            // Get the duration of this timeline
            function getDuration() {
                return model.duration.timestamp;
            }

            // Get the epoch used by this timeline
            function getEpoch() {
                return model.start.epoch; // Surface elapsed time
            }

            // Set the start time associated with this object
            function setStart(value) {
                var end = getEnd();
                mutation.mutate(function (m) {
                    m.start.timestamp = Math.max(value, 0);
                    // Update duration to keep end time
                    m.duration.timestamp = Math.max(end - value, 0);
                }, model.modified);
            }

            // Set the duration associated with this object
            function setDuration(value) {
                mutation.mutate(function (m) {
                    m.duration.timestamp = Math.max(value, 0);
                }, model.modified);
            }

            // Set the end time associated with this object
            function setEnd(value) {
                var start = getStart();
                mutation.mutate(function (m) {
                    m.duration.timestamp = Math.max(value - start, 0);
                }, model.modified);
            }

            return {
                /**
                 * Get the start time, in milliseconds relative to the epoch.
                 * @returns {number} the start time
                 */
                getStart: getStart,
                /**
                 * Get the duration, in milliseconds.
                 * @returns {number} the duration
                 */
                getDuration: getDuration,
                /**
                 * Get the end time, in milliseconds relative to the epoch.
                 * @returns {number} the end time
                 */
                getEnd: getEnd,
                /**
                 * Set the start time, in milliseconds relative to the epoch.
                 * @param {number} the new value
                 */
                setStart: setStart,
                /**
                 * Set the duration, in milliseconds.
                 * @param {number} the new value
                 */
                setDuration: setDuration,
                /**
                 * Set the end time, in milliseconds relative to the epoch.
                 * @param {number} the new value
                 */
                setEnd: setEnd,
                /**
                 * Get a string identifying the reference epoch used for
                 * start and end times.
                 * @returns {string} the epoch
                 */
                getEpoch: getEpoch
            };
        }

        return ActivityTimespan;
    }
);
