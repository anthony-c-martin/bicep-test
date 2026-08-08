# Contributing to bicep-test

## Repository layout

Each language implementation owns its build, dependencies, tests, and packaging under `packages/`:

```text
packages/
├── node/
│   ├── src/
│   ├── test/
│   ├── package.json
│   ├── jest.config.ts
│   └── tsconfig.json
├── dotnet/
│   ├── BicepTest.slnx
│   ├── src/BicepTest/
│   └── test/BicepTest.Tests/
└── go/
    ├── rpcclient/
    ├── biceptest.go
    ├── snapshot.go
    └── go.mod
```

The Node package defines the reference snapshot behavior. The C# and Go conformance tests exercise the same Bicep fixture and assertions.

## Node

Prerequisites:

- Node.js 24
- npm

Build and test from the repository root:

```sh
cd packages/node
npm ci --legacy-peer-deps
npm run build
npm test
```

The legacy peer resolver is currently required because TypeScript 7 is outside the version range declared by the installed `@typescript-eslint` packages.

## C#

Prerequisite: .NET 8 SDK or later.

Build and verify packaging from the repository root:

```sh
dotnet test packages/dotnet/BicepTest.slnx
dotnet pack packages/dotnet/src/BicepTest/BicepTest.csproj --configuration Release
```

Project conventions:

- Target framework: `net8.0`
- Root namespace and package ID: `BicepTest`
- Nullable reference types and implicit global usings are enabled.
- Add library code under `packages/dotnet/src/BicepTest`.
- Add tests under `packages/dotnet/test/BicepTest.Tests` and include the project in `BicepTest.slnx`.

## Go

Prerequisite: Go 1.24 or later.

Test from the repository root:

```sh
cd packages/go
go test ./...
```

Format and analyze Go changes before submitting them:

```sh
cd packages/go
gofmt -w .
go vet ./...
```

Project conventions:

- Module path: `github.com/anthony-c-martin/bicep-test/packages/go`
- Package name: `biceptest`
- Keep exported names idiomatic to Go rather than reproducing the Node API naming exactly.
- Keep the public snapshot API in the module root.
- Keep Bicep installation, process, pipe, and JSON-RPC behavior in the separate `rpcclient` package.
- Preserve both Windows named-pipe and Unix-domain-socket support when changing the transport.

## Pull requests

- Keep changes scoped to one behavior or package where practical.
- Add or update tests for behavior changes.
- Run the relevant language build and test commands before opening a pull request.
- Update user documentation when public APIs or supported behavior change.