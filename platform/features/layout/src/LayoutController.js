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
 * This bundle implements object types and associated views for
 * display-building.
 * @namespace platform/features/layout
 */
define(
    ['./LayoutDrag'],
    function (LayoutDrag) {

        var DEFAULT_DIMENSIONS = [12, 8],
            DEFAULT_GRID_SIZE = [32, 32],
            MINIMUM_FRAME_SIZE = [320, 180];

        /**
         * The LayoutController is responsible for supporting the
         * Layout view. It arranges frames according to saved configuration
         * and provides methods for updating these based on mouse
         * movement.
         * @memberof platform/features/layout
         * @constructor
         * @param {Scope} $scope the controller's Angular scope
         */
        function LayoutController($scope) {
            var self = this,
                callbackCount = 0;

            // Update grid size when it changed
            function updateGridSize(layoutGrid) {
                var oldSize = self.gridSize;

                self.gridSize = layoutGrid || DEFAULT_GRID_SIZE;

                // Only update panel positions if this actually changed things
                if (self.gridSize[0] !== oldSize[0] ||
                        self.gridSize[1] !== oldSize[1]) {
                    self.layoutPanels(Object.keys(self.positions));
                }
            }

            // Position a panel after a drop event
            function handleDrop(e, id, position) {
                if (e.defaultPrevented) {
                    return;
                }

                // Ensure that configuration field is populated
                $scope.configuration = $scope.configuration || {};
                // Make sure there is a "panels" field in the
                // view configuration.
                $scope.configuration.panels =
                    $scope.configuration.panels || {};
                // Store the position of this panel.
                $scope.configuration.panels[id] = {
                    position: [
                        Math.floor(position.x / self.gridSize[0]),
                        Math.floor(position.y / self.gridSize[1])
                    ],
                    dimensions: self.defaultDimensions()
                };
                // Mark change as persistable
                if ($scope.commit) {
                    $scope.commit("Dropped a frame.");
                }
                // Populate template-facing position for this id
                self.rawPositions[id] =
                    $scope.configuration.panels[id];
                self.populatePosition(id);
                // Layout may contain embedded views which will
                // listen for drops, so call preventDefault() so
                // that they can recognize that this event is handled.
                e.preventDefault();
            }

            //Will fetch fully contextualized composed objects, and populate
            // scope with them.
            function refreshComposition() {
                //Keep a track of how many composition callbacks have been made
                var thisCount = ++callbackCount;

                $scope.domainObject.useCapability('composition').then(function (composition) {
                    var ids;

                    //Is this callback for the most recent composition
                    // request? If not, discard it. Prevents race condition
                    if (thisCount === callbackCount) {
                        ids = composition.map(function (object) {
                                return object.getId();
                            }) || [];

                        $scope.composition = composition;
                        self.layoutPanels(ids);
                    }
                });
            }

            // End drag; we don't want to put $scope into this
            // because it triggers "cpws" (copy window or scope)
            // errors in Angular.
            this.endDragInScope = function () {
                // Write to configuration; this is watched and
                // saved by the EditRepresenter.
                $scope.configuration =
                    $scope.configuration || {};
                // Make sure there is a "panels" field in the
                // view configuration.
                $scope.configuration.panels =
                    $scope.configuration.panels || {};
                // Store the position of this panel.
                $scope.configuration.panels[self.activeDragId] =
                    self.rawPositions[self.activeDragId];
                // Mark this object as dirty to encourage persistence
                if ($scope.commit) {
                    $scope.commit("Moved frame.");
                }
            };

            this.positions = {};
            this.rawPositions = {};
            this.gridSize = DEFAULT_GRID_SIZE;
            this.$scope = $scope;

            // Watch for changes to the grid size in the model
            $scope.$watch("model.layoutGrid", updateGridSize);

            // Update composed objects on screen, and position panes
            $scope.$watchCollection("model.composition", refreshComposition);

            // Position panes where they are dropped
            $scope.$on("mctDrop", handleDrop);
        }

        // Convert from { positions: ..., dimensions: ... } to an
        // apropriate ng-style argument, to position frames.
        LayoutController.prototype.convertPosition = function (raw) {
            var gridSize = this.gridSize;
            // Multiply position/dimensions by grid size
            return {
                left: (gridSize[0] * raw.position[0]) + 'px',
                top: (gridSize[1] * raw.position[1]) + 'px',
                width: (gridSize[0] * raw.dimensions[0]) + 'px',
                height: (gridSize[1] * raw.dimensions[1]) + 'px'
            };
        };

        // Generate default positions for a new panel
        LayoutController.prototype.defaultDimensions = function () {
            var gridSize = this.gridSize;
            return MINIMUM_FRAME_SIZE.map(function (min, i) {
                return Math.max(
                    Math.ceil(min / gridSize[i]),
                    DEFAULT_DIMENSIONS[i]
                );
            });
        };

        // Generate a default position (in its raw format) for a frame.
        // Use an index to ensure that default positions are unique.
        LayoutController.prototype.defaultPosition = function (index) {
            return {
                position: [index, index],
                dimensions: this.defaultDimensions()
            };
        };

        // Store a computed position for a contained frame by its
        // domain object id. Called in a forEach loop, so arguments
        // are as expected there.
        LayoutController.prototype.populatePosition = function (id, index) {
            this.rawPositions[id] =
                this.rawPositions[id] || this.defaultPosition(index || 0);
            this.positions[id] =
                this.convertPosition(this.rawPositions[id]);
        };

        /**
         * Get a style object for a frame with the specified domain
         * object identifier, suitable for use in an `ng-style`
         * directive to position a frame as configured for this layout.
         * @param {string} id the object identifier
         * @returns {Object.<string, string>} an object with
         *          appropriate left, width, etc fields for positioning
         */
        LayoutController.prototype.getFrameStyle = function (id) {
            // Called in a loop, so just look up; the "positions"
            // object is kept up to date by a watch.
            return this.positions[id];
        };

        /**
         * Start a drag gesture to move/resize a frame.
         *
         * The provided position and dimensions factors will determine
         * whether this is a move or a resize, and what type it
         * will be. For instance, a position factor of [1, 1]
         * will move a frame along with the mouse as the drag
         * proceeds, while a dimension factor of [0, 0] will leave
         * dimensions unchanged. Combining these in different
         * ways results in different handles; a position factor of
         * [1, 0] and a dimensions factor of [-1, 0] will implement
         * a left-edge resize, as the horizontal position will move
         * with the mouse while the horizontal dimensions shrink in
         * kind (and vertical properties remain unmodified.)
         *
         * @param {string} id the identifier of the domain object
         *        in the frame being manipulated
         * @param {number[]} posFactor the position factor
         * @param {number[]} dimFactor the dimensions factor
         */
        LayoutController.prototype.startDrag = function (id, posFactor, dimFactor) {
            this.activeDragId = id;
            this.activeDrag = new LayoutDrag(
                this.rawPositions[id],
                posFactor,
                dimFactor,
                this.gridSize
            );
        };
        /**
         * Continue an active drag gesture.
         * @param {number[]} delta the offset, in pixels,
         *        of the current pointer position, relative
         *        to its position when the drag started
         */
        LayoutController.prototype.continueDrag = function (delta) {
            if (this.activeDrag) {
                this.rawPositions[this.activeDragId] =
                    this.activeDrag.getAdjustedPosition(delta);
                this.populatePosition(this.activeDragId);
            }
        };

        // Utility function to copy raw positions from configuration,
        // without writing directly to configuration (to avoid triggering
        // persistence from watchers during drags).
        function shallowCopy(obj, keys) {
            var copy = {};
            keys.forEach(function (k) {
                copy[k] = obj[k];
            });
            return copy;
        }

        /**
         * Compute panel positions based on the layout's object model.
         * Defined as member function to facilitate testing.
         * @private
         */
        LayoutController.prototype.layoutPanels = function (ids) {
            var configuration = this.$scope.configuration || {},
                self = this;

            // Pull panel positions from configuration
            this.rawPositions =
                shallowCopy(configuration.panels || {}, ids);

            // Clear prior computed positions
            this.positions = {};

            // Update width/height that we are tracking
            this.gridSize =
                (this.$scope.model || {}).layoutGrid || DEFAULT_GRID_SIZE;

            // Compute positions and add defaults where needed
            ids.forEach(function (id, index) {
                self.populatePosition(id, index);
            });
        };

        /**
         * End the active drag gesture. This will update the
         * view configuration.
         */
        LayoutController.prototype.endDrag = function () {
            this.endDragInScope();
        };

        return LayoutController;
    }
);

