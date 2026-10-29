# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [0.0.11] - 2026.10.29
### Changed
- Peer dependencies now require three.js r185 and three-mesh-bvh v0.9.17 or higher.
- ProjectionGenerator: Use the WebGPU utilities from three-mesh-bvh, improving projection performance.

## [0.0.10] - 2026.06.11
### Fixed
- Fix unnecessarily slow processing for edge generation.

## [0.0.9] - 2026.04.18
### Added
- Use of "ReadbackBuffer" from three.js r184 to improve performance, memory management.

## [0.0.8] - 2026.04.03
### Added
- Support for projection matrix transformations.

### Changed
- Increased time spent per frame on edge generation.


## [0.0.7] - 2026.03.31
### Fixed
- ProjectionGenerator: Fixed intersection edges not being generated correctly.

## [0.0.6] - 2026.03.31
### Fixed
- MeshVisibilityCuller: fix case where the id buffer could be corrupted with separate renders.
- MeshVisibilityCuller: fix incorrect tiling resulting in incorrect results.

### Changed
- ProjectionGenerator: Adjust the "onProgress" option callback to always take the "progress" number as the first argument.

### Added
- Add a "three-edge-projection/webgpu" export including a WebGPURenderer-compatible MeshVsibilityCuller, ProjectionGenerator.

## [0.0.5] - 2025.01.29
### Fixed
- Accidental variable conflict.
- Add support for passing arrays of objects to MeshVisibilityCuller & ProjectionGenerator.

## [0.0.4] - 2025.01.29
### Changed
- ProjectionGenerator now returns an object with functions for extracting edges.

### Added
- Ability to extract hidden edges in addition to visible edges.
- Optimizations to increase generation speed.
- Remove requirement to merge geometry ahead of time.
- A "MeshVisibilityCuller" class that can be run to help reduce the number of meshes that need to be processed.

### Removed
- ProjectionGeneratorWorker

## [0.0.3] - 2025.04.04
### Added
- PlanarIntersectionGenerator for generating model cross sections.

## [0.0.2] - 2023.09.30
### Added
- SilhouetteGenerator: performance improvements by skipping unnecessary triangles that are determined to already be in the shape.
- SilhouetteGenerator: Perform simplification of edges.
- SilhouetteGenerator: Add ability to see outline and mesh edges.
- ProjectionGenerator: `includeIntersectionEdges` option defaults to true.

## [0.0.1] - 2023.09.18
### Fixed
- Some missing edges in projection

### Changed
- Largely simplified code
- Migrated logic from three-mesh-bvh

### Added
- ProjectionGenerator class for generating flattened, projected edges
- SilhouetteGenerator class for generating flattened, projected silhouette geometry (slow and sometimes unstable)
- Ability to generate intersection edges for projection with `ProjectionGenerator.includeIntersectionEdges`

