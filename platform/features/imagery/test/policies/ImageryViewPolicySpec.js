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
    ["../../src/policies/ImageryViewPolicy"],
    function (ImageryViewPolicy) {

        describe("Imagery view policy", function () {
            var testView,
                mockDomainObject,
                mockTelemetry,
                testMetadata,
                policy;

            beforeEach(function () {
                testView = { key: "imagery" };
                testMetadata = {};
                mockDomainObject = jasmine.createSpyObj(
                    'domainObject',
                    ['getId', 'getModel', 'getCapability']
                );
                mockTelemetry = jasmine.createSpyObj(
                    'telemetry',
                    ['getMetadata']
                );
                mockDomainObject.getCapability.andCallFake(function (c) {
                    return c === 'telemetry' ? mockTelemetry : undefined;
                });
                mockTelemetry.getMetadata.andReturn(testMetadata);

                policy = new ImageryViewPolicy();
            });

            it("allows the imagery view for domain objects with image telemetry", function () {
                testMetadata.ranges = [{ key: "foo", format: "imageUrl" }];
                expect(policy.allow(testView, mockDomainObject)).toBeTruthy();
            });

            it("disallows the imagery view for domain objects without image telemetry", function () {
                testMetadata.ranges = [{ key: "foo", format: "somethingElse" }];
                expect(policy.allow(testView, mockDomainObject)).toBeFalsy();
            });

            it("disallows the imagery view for domain objects without telemetry", function () {
                testMetadata.ranges = [{ key: "foo", format: "imageUrl" }];
                mockDomainObject.getCapability.andReturn(undefined);
                expect(policy.allow(testView, mockDomainObject)).toBeFalsy();
            });

            it("allows other views", function () {
                testView.key = "somethingElse";
                testMetadata.ranges = [{ key: "foo", format: "somethingElse" }];
                expect(policy.allow(testView, mockDomainObject)).toBeTruthy();
            });

        });
    }
);

