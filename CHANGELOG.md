# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

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

