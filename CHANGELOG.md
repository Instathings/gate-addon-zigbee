# Changelog
All notable changes to this project will be documented in this file.


The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.4] - 2020-03-19
### Added
- License and Readme information
### Changed
- Bumped async

## [1.1.3] - 2020-03-04
### Fixed
- Reading knownDevices from protocolId

## [1.1.2] - 2020-03-03
### Fixed
- ip address mosquitto server

## [1.1.1] - 2020-03-03
### Added
- add method to remove device from network

## [1.1.0] - 2020-03-02
### Added
- `type` as second parameter in the constructor 
- instance emits `status` event
### Changed
- subscribing to `zigbee2mqtt/:friendlyName` only if device type is sensor
- `control` method handles `get` action

## [1.0.3] - 2020-02-25
### Changed
- `timeoutDiscovering` event is emitted after pairing timeout
- pairing only with devices that contains `modelId` key

## [1.0.2] - 2020-02-25
### Changed
- A new device is paired only if `modelId` is defined

## [1.0.1] - 2020-02-25
### Added
- `setKnownDevices` method
- `control` method

## [1.0.0] - 2020-02-17
### Changed
- first public version
- replaced `console.log` with `debug`

## [0.0.5] - 2020-02-07
### Changed
- changed package name

## [0.0.4] - 2020-02-07
### Added
- url mqtt server as container name
