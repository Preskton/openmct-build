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
    ["../../src/capabilities/InstantiationCapability"],
    function (InstantiationCapability) {

        describe("The 'instantiation' capability", function () {
            var mockInjector,
                mockIdentifierService,
                mockInstantiate,
                mockIdentifier,
                mockNow,
                mockDomainObject,
                instantiation;

            beforeEach(function () {
                mockInjector = jasmine.createSpyObj("$injector", ["get"]);
                mockInstantiate = jasmine.createSpy("instantiate");
                mockIdentifierService = jasmine.createSpyObj(
                    'identifierService',
                    ['parse', 'generate']
                );
                mockIdentifier = jasmine.createSpyObj(
                    'identifier',
                    ['getSpace', 'getKey', 'getDefinedSpace']
                );
                mockDomainObject = jasmine.createSpyObj(
                    'domainObject',
                    ['getId', 'getCapability', 'getModel']
                );

                mockInjector.get.andCallFake(function (key) {
                    return key === 'instantiate' ?
                            mockInstantiate : undefined;
                });
                mockIdentifierService.parse.andReturn(mockIdentifier);
                mockIdentifierService.generate.andReturn("some-id");

                mockNow = jasmine.createSpy();
                mockNow.andReturn(1234321);

                instantiation = new InstantiationCapability(
                    mockInjector,
                    mockIdentifierService,
                    mockNow,
                    mockDomainObject
                );
            });


            it("aliases 'instantiate' as 'invoke'", function () {
                expect(instantiation.invoke).toBe(instantiation.instantiate);
            });

            it("uses the instantiate service to create domain objects", function () {
                var mockDomainObj = jasmine.createSpyObj('domainObject', [
                    'getId',
                    'getModel',
                    'getCapability',
                    'useCapability',
                    'hasCapability'
                ]), testModel = { someKey: "some value" };
                mockInstantiate.andReturn(mockDomainObj);
                expect(instantiation.instantiate(testModel))
                    .toBe(mockDomainObj);
                expect(mockInstantiate)
                    .toHaveBeenCalledWith({
                        someKey: "some value",
                        modified: mockNow()
                    }, jasmine.any(String));
            });

        });
    }
);
