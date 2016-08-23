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
    ['../../src/elements/TelemetryProxy'],
    function (TelemetryProxy) {

        describe("A fixed position telemetry proxy", function () {
            var testElement,
                testElements,
                proxy;

            beforeEach(function () {
                testElement = {
                    x: 1,
                    y: 2,
                    z: 3,
                    width: 42,
                    height: 24,
                    id: "test-id"
                };
                testElements = [{}, {}, testElement, {}];
                proxy = new TelemetryProxy(
                    testElement,
                    testElements.indexOf(testElement),
                    testElements
                );
            });

            it("exposes the element's id", function () {
                expect(proxy.id).toEqual('test-id');
            });

            it("allows title to be shown/hidden", function () {
                // Initially, only showTitle and hideTitle are available
                expect(proxy.hideTitle).toBeUndefined();
                proxy.showTitle();

                // Should have set titled state
                expect(testElement.titled).toBeTruthy();

                // Should also have changed methods available
                expect(proxy.showTitle).toBeUndefined();
                proxy.hideTitle();

                // Should have cleared titled state
                expect(testElement.titled).toBeFalsy();

                // Available methods should have changed again
                expect(proxy.hideTitle).toBeUndefined();
                proxy.showTitle();
            });

        });
    }
);
