# Bicep Test Framework

A set of libraries for writing tests against [Bicep](https://github.com/Azure/bicep) files.

## Overview

`bicep-test` provides language-native testing workflows for Bicep infrastructure code. Each library invokes the Bicep CLI locally and captures a **snapshot** of what a deployment _would_ produce — the predicted resources, outputs, and diagnostics — so you can write fast, offline assertions against your templates.

## Goals
* Create a very thin unopinionated library that can easily be supported in multiple languages.
* Use Node as an example language, to determine viability and community interest.
* Allow simple assertions about predicted goal state (e.g. "all storage accounts must be zone-redundant").

## Language support

- [Node](docs/node.md): available through npm
- [C#](docs/csharp.md): implemented, not yet available through NuGet
- [Go](docs/go.md): implemented, not yet released as a versioned Go module
- [PowerShell](docs/powershell.md): implemented, not yet available through the PowerShell Gallery

## Samples

Runnable test suites under [`samples/`](samples/) demonstrate the same infrastructure assertions with Jest, MSTest, Go's `testing` package, and Pester. They share one Bicep fixture and are compiled and executed in CI.

See [CONTRIBUTING.md](CONTRIBUTING.md) for repository setup, build commands, tests, and project conventions.
