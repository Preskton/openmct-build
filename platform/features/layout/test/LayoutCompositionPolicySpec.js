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
    ["../src/LayoutCompositionPolicy"],
    function (LayoutCompositionPolicy) {
        describe("Layout's composition policy", function () {
            var mockCandidate,
                mockContext,
                candidateType,
                contextType,
                policy;

            beforeEach(function () {
                mockCandidate =
                    jasmine.createSpyObj('candidateType', ['instanceOf']);
                mockContext =
                    jasmine.createSpyObj('contextType', ['instanceOf']);

                mockCandidate.instanceOf.andCallFake(function (t) {
                    return t === candidateType;
                });
                mockContext.instanceOf.andCallFake(function (t) {
                    return t === contextType;
                });

                policy = new LayoutCompositionPolicy();
            });

            it("disallows folders in layouts", function () {
                candidateType = 'layout';
                contextType = 'folder';
                expect(policy.allow(mockCandidate, mockContext)).toBe(false);
            });

            it("does not disallow folders elsewhere", function () {
                candidateType = 'nonlayout';
                contextType = 'folder';
                expect(policy.allow(mockCandidate, mockContext)).toBe(true);
            });

            it("allows things other than folders in layouts", function () {
                candidateType = 'layout';
                contextType = 'nonfolder';
                expect(policy.allow(mockCandidate, mockContext)).toBe(true);
            });

        });
    }
);
