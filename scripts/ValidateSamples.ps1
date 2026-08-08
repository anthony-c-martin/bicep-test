#!/usr/bin/env pwsh

$ErrorActionPreference = 'Stop'
$repositoryRoot = Split-Path $PSScriptRoot -Parent

function Invoke-NativeCommand {
    param(
        [Parameter(Mandatory)]
        [scriptblock] $Command,

        [Parameter(Mandatory)]
        [string] $Description
    )

    & $Command
    if ($LASTEXITCODE -ne 0) {
        throw "$Description failed with exit code $LASTEXITCODE."
    }
}

Push-Location $repositoryRoot
try {
    Write-Host 'Building the Node library and sample...'
    Invoke-NativeCommand { npm ci --prefix packages/node --legacy-peer-deps } 'Node dependency restore'
    Invoke-NativeCommand { npm run build --prefix packages/node } 'Node library build'
    Invoke-NativeCommand { npm install --prefix samples/node --ignore-scripts } 'Node sample dependency restore'
    Invoke-NativeCommand { npm test --prefix samples/node } 'Node sample tests'

    Write-Host 'Building and running the C# sample tests...'
    Invoke-NativeCommand { dotnet test samples/dotnet/BicepTest.Sample.csproj --configuration Release } 'C# sample tests'

    Write-Host 'Building and running the Go sample tests...'
    Push-Location samples/go
    try {
        Invoke-NativeCommand { go test . } 'Go sample tests'
    }
    finally {
        Pop-Location
    }

    Write-Host 'Building and running the PowerShell sample tests...'
    Invoke-NativeCommand { pwsh -NoProfile -File packages/powershell/build.ps1 } 'PowerShell module build'
    Invoke-NativeCommand {
        pwsh -NoProfile -Command '$configuration = New-PesterConfiguration; $configuration.Run.Path = "./samples/powershell"; $configuration.Run.Exit = $true; Invoke-Pester -Configuration $configuration'
    } 'PowerShell sample tests'

    Write-Host 'Installing and running the Python sample tests...'
    Push-Location samples/python
    try {
        Invoke-NativeCommand { python -m pip install -r requirements.txt } 'Python sample dependency restore'
        Invoke-NativeCommand { python -m pytest -q } 'Python sample tests'
    }
    finally {
        Pop-Location
    }

    Write-Host 'Building and running the Java sample tests...'
    Invoke-NativeCommand { mvn --file packages/java/pom.xml --batch-mode --no-transfer-progress install } 'Java library build'
    Invoke-NativeCommand { mvn --file samples/java/pom.xml --batch-mode --no-transfer-progress test } 'Java sample tests'
}
finally {
    Pop-Location
}

Write-Host 'All language samples completed successfully.'