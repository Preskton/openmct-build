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
    ['../../src/actions/IdColumn'],
    function (IdColumn) {
        describe("IdColumn", function () {
            var testIdMap,
                column;

            beforeEach(function () {
                testIdMap = { "foo": "bar" };
                column = new IdColumn(testIdMap);
            });

            it("has a name", function () {
                expect(column.name()).toEqual(jasmine.any(String));
            });

            describe("value", function () {
                var mockDomainObject,
                    testId;

                beforeEach(function () {
                    testId = "foo";
                    mockDomainObject = jasmine.createSpyObj(
                        'domainObject',
                        ['getId', 'getModel', 'getCapability']
                    );
                    mockDomainObject.getId.andReturn(testId);
                });

                it("provides a value mapped from domain object's identifier", function () {
                    expect(column.value(mockDomainObject))
                        .toEqual(testIdMap[testId]);
                });
            });

        });
    }
);
