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

define([
    "./src/RemsTelemetryServerAdapter",
    "./src/RemsTelemetryInitializer",
    "./src/RemsTelemetryModelProvider",
    "./src/RemsTelemetryProvider",
    'legacyRegistry',
    "module"
], function (
    RemsTelemetryServerAdapter,
    RemsTelemetryInitializer,
    RemsTelemetryModelProvider,
    RemsTelemetryProvider,
    legacyRegistry
) {
    "use strict";
    legacyRegistry.register("example/notifications", {
        "name" : "Mars Science Laboratory Data Adapter",
        "extensions" : {
        "types": [
            {
                "name":"Mars Science Laboratory",
                "key": "msl.curiosity",
                "cssclass": "icon-object"
            },
            {
                "name": "Instrument",
                "key": "msl.instrument",
                "cssclass": "icon-object",
                "model": {"composition": []}
            },
            {
                "name": "Measurement",
                "key": "msl.measurement",
                "cssclass": "icon-telemetry",
                "model": {"telemetry": {}},
                "telemetry": {
                    "source": "rems.source",
                    "domains": [
                        {
                            "name": "Time",
                            "key": "timestamp",
                            "format": "utc"
                        }
                    ]
                }
            }
        ],
        "constants": [
            {
                "key": "REMS_WS_URL",
                "value": "/proxyUrl?url=http://cab.inta-csic.es/rems/wp-content/plugins/marsweather-widget/api.php"
            }
        ],
        "roots": [
            {
                "id": "msl:curiosity",
                "priority" : "preferred",
                "model": {
                    "type": "msl.curiosity",
                    "name": "Mars Science Laboratory",
                    "composition": []
                }
            }
        ],
        "services": [
            {
                "key":"rems.adapter",
                "implementation": RemsTelemetryServerAdapter,
                "depends": ["$q", "$http", "$log", "REMS_WS_URL"]
            }
        ],
        "runs": [
            {
                "implementation": RemsTelemetryInitializer,
                "depends": ["rems.adapter", "objectService"]
            }
        ],
        "components": [
            {
                "provides": "modelService",
                "type": "provider",
                "implementation": RemsTelemetryModelProvider,
                "depends": ["rems.adapter"]
            },
            {
                "provides": "telemetryService",
                "type": "provider",
                "implementation": RemsTelemetryProvider,
                "depends": ["rems.adapter", "$q"]
            }
        ]
    }
    });
});

