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
    ['../../src/controllers/TimelineController'],
    function (TimelineController) {

        var DOMAIN_OBJECT_METHODS = [
            'getModel',
            'getId',
            'useCapability',
            'hasCapability',
            'getCapability'
        ];

        describe("The timeline controller", function () {
            var mockScope,
                mockQ,
                mockLoader,
                mockDomainObject,
                mockSpan,
                testModels,
                testConfiguration,
                controller;

            function asPromise(v) {
                return (v || {}).then ? v : {
                    then: function (callback) {
                        return asPromise(callback(v));
                    },
                    testValue: v
                };
            }

            function allPromises(promises) {
                return asPromise(promises.map(function (p) {
                    return (p || {}).then ? p.testValue : p;
                }));
            }

            function subgraph(domainObject, objects) {
                function lookupSubgraph(id) {
                    return subgraph(objects[id], objects);
                }
                return {
                    domainObject: domainObject,
                    composition: (domainObject.getModel().composition || [])
                        .map(lookupSubgraph)
                };
            }

            function fireWatch(expr, value) {
                mockScope.$watch.calls.forEach(function (call) {
                    if (call.args[0] === expr) {
                        call.args[1](value);
                    }
                });
            }


            beforeEach(function () {
                var mockA, mockB, mockUtilization, mockPromise, mockGraph, testCapabilities;

                function getCapability(c) {
                    return testCapabilities[c];
                }

                function useCapability(c) {
                    return c === 'timespan' ? asPromise(mockSpan) :
                            c === 'graph' ? asPromise({ abc: mockGraph, xyz: mockGraph }) :
                                    undefined;
                }

                testModels = {
                    a: { modified: 40, composition: ['b'] },
                    b: { modified: 2 }
                };

                testConfiguration = {};

                mockQ = jasmine.createSpyObj('$q', ['when', 'all']);
                mockA = jasmine.createSpyObj('a', DOMAIN_OBJECT_METHODS);
                mockB = jasmine.createSpyObj('b', DOMAIN_OBJECT_METHODS);
                mockSpan = jasmine.createSpyObj('span', ['getStart', 'getEnd']);
                mockUtilization = jasmine.createSpyObj('utilization', ['resources', 'utilization']);
                mockGraph = jasmine.createSpyObj('graph', ['getPointCount']);
                mockPromise = jasmine.createSpyObj('promise', ['then']);

                mockScope = jasmine.createSpyObj(
                    "$scope",
                    ['$watch', '$on']
                );
                mockLoader = jasmine.createSpyObj('objectLoader', ['load']);
                mockDomainObject = mockA;

                mockScope.domainObject = mockDomainObject;
                mockScope.configuration = testConfiguration;
                mockQ.when.andCallFake(asPromise);
                mockQ.all.andCallFake(allPromises);
                mockA.getId.andReturn('a');
                mockA.getModel.andReturn(testModels.a);
                mockB.getId.andReturn('b');
                mockB.getModel.andReturn(testModels.b);
                mockA.useCapability.andCallFake(useCapability);
                mockB.useCapability.andCallFake(useCapability);
                mockA.hasCapability.andReturn(true);
                mockB.hasCapability.andReturn(true);
                mockA.getCapability.andCallFake(getCapability);
                mockB.getCapability.andCallFake(getCapability);
                mockSpan.getStart.andReturn(42);
                mockSpan.getEnd.andReturn(12321);
                mockUtilization.resources.andReturn(['abc', 'xyz']);
                mockUtilization.utilization.andReturn(mockPromise);
                mockLoader.load.andCallFake(function () {
                    return asPromise(subgraph(mockA, {
                        a: mockA,
                        b: mockB
                    }));
                });

                testCapabilities = {
                    "utilization": mockUtilization
                };

                controller = new TimelineController(mockScope, mockQ, mockLoader, 0);
            });

            it("exposes scroll state tracker in scope", function () {
                expect(mockScope.scroll.x).toEqual(0);
                expect(mockScope.scroll.y).toEqual(0);
            });

            it("watches for a configuration object", function () {
                expect(mockScope.$watch).toHaveBeenCalledWith(
                    "configuration",
                    jasmine.any(Function)
                );
            });

            it("repopulates when modifications are made", function () {
                var fnWatchCall;

                // Find the $watch that was given a function
                mockScope.$watch.calls.forEach(function (call) {
                    if (typeof call.args[0] === 'function') {
                        // white-box: we know the first call is
                        // the one we're looking for
                        fnWatchCall = fnWatchCall || call;
                    }
                });

                // Make sure string watch was for domainObject
                fireWatch('domainObject', mockDomainObject);
                // There should be to swimlanes
                expect(controller.swimlanes().length).toEqual(2);

                // Watch should be for sum of modified flags...
                expect(fnWatchCall.args[0]()).toEqual(42);

                // Remove the child, then fire the watch
                testModels.a.composition = [];
                fnWatchCall.args[1]();

                // Swimlanes should have updated
                expect(controller.swimlanes().length).toEqual(1);
            });

            it("repopulates graphs when graph choices change", function () {
                var tmp;

                // Note that this test is brittle; it relies upon the
                // order of $watch calls in TimelineController.

                // Initially populate
                fireWatch('domainObject', mockDomainObject);

                // Verify precondition - no graphs
                expect(controller.graphs().length).toEqual(0);

                // Execute the watch function for graph state
                tmp = mockScope.$watch.calls[3].args[0]();

                // Change graph state
                testConfiguration.graph = { a: true, b: true };

                // Verify that this would have triggered a watch
                expect(mockScope.$watch.calls[3].args[0]())
                    .not.toEqual(tmp);

                // Run the function the watch would have triggered
                mockScope.$watch.calls[3].args[1]();

                // Should have some graphs now
                expect(controller.graphs().length).toEqual(2);

            });

            it("provides drag handles", function () {
                // TimelineDragPopulator et al are tested for these,
                // so just verify that handles are indeed exposed.
                expect(controller.handles()).toEqual(jasmine.any(Array));
            });

            it("refreshes graphs on request", function () {
                var mockGraph = jasmine.createSpyObj('graph', ['refresh']);

                // Sneak a mock graph into the graph populator...
                // This is whiteboxy and will have to change if
                // GraphPopulator changes
                controller.graphs().push(mockGraph);

                // Refresh
                controller.refresh();

                // Should have refreshed the graph
                expect(mockGraph.refresh).toHaveBeenCalled();
            });
        });

    }
);
