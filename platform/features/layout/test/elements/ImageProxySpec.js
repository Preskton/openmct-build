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
    ['../../src/elements/ImageProxy'],
    function (ImageProxy) {

        describe("A fixed position image proxy", function () {
            var testElement,
                testElements,
                proxy;

            beforeEach(function () {
                testElement = {
                    x: 1,
                    y: 2,
                    width: 42,
                    height: 24,
                    url: "http://www.nasa.gov"
                };
                testElements = [{}, {}, testElement, {}];
                proxy = new ImageProxy(
                    testElement,
                    testElements.indexOf(testElement),
                    testElements
                );
            });

            it("provides getter/setter for image URL", function () {
                expect(proxy.url()).toEqual("http://www.nasa.gov");
                expect(proxy.url("http://www.nasa.gov/some.jpg"))
                    .toEqual("http://www.nasa.gov/some.jpg");
                expect(proxy.url()).toEqual("http://www.nasa.gov/some.jpg");
            });
        });
    }
);
