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
 * MergeModelsSpec. Created by vwoeltje on 11/6/14.
 */
define(
    ["../src/RangeColumn"],
    function (RangeColumn) {

        var TEST_RANGE_VALUE = "some formatted range value";

        describe("A range column", function () {
            var testDatum,
                testMetadata,
                mockFormatter,
                mockDomainObject,
                column;

            beforeEach(function () {
                testDatum = { testKey: 123, otherKey: 456 };
                mockFormatter = jasmine.createSpyObj(
                    "formatter",
                    ["formatDomainValue", "formatRangeValue"]
                );
                testMetadata = {
                    key: "testKey",
                    name: "Test Name"
                };
                mockDomainObject = jasmine.createSpyObj(
                    "domainObject",
                    ["getModel", "getCapability"]
                );
                mockFormatter.formatRangeValue.andReturn(TEST_RANGE_VALUE);

                column = new RangeColumn(testMetadata, mockFormatter);
            });

            it("reports a column header from range metadata", function () {
                expect(column.getTitle()).toEqual("Test Name");
            });

            it("formats range values as numbers", function () {
                expect(column.getValue(mockDomainObject, testDatum).text)
                    .toEqual(TEST_RANGE_VALUE);

                // Make sure that service interactions were as expected
                expect(mockFormatter.formatRangeValue)
                    .toHaveBeenCalledWith(testDatum.testKey);
                expect(mockFormatter.formatDomainValue)
                    .not.toHaveBeenCalled();
            });
        });
    }
);
