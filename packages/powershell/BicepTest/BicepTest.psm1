Set-StrictMode -Version Latest
$script:BicepTesterType = $null

function Import-BicepTestAssembly {
    if ($script:BicepTesterType) {
        return
    }

    $loadedAssembly = [AppDomain]::CurrentDomain.GetAssemblies() |
        Where-Object { $_.GetName().Name -eq 'BicepTest' } |
        Select-Object -First 1
    if ($loadedAssembly) {
        $script:BicepTesterType = $loadedAssembly.GetType('BicepTest.BicepTester', $true)
        return
    }

    $libraryPath = Join-Path $PSScriptRoot 'lib/net8.0'
    $assemblyPath = Join-Path $libraryPath 'BicepTest.dll'
    if (-not (Test-Path -LiteralPath $assemblyPath)) {
        throw "The BicepTest runtime has not been built. Run packages/powershell/build.ps1."
    }

    Get-ChildItem -LiteralPath $libraryPath -Filter '*.dll' |
        Where-Object Name -ne 'BicepTest.dll' |
        ForEach-Object {
            try {
                [System.Runtime.Loader.AssemblyLoadContext]::Default.LoadFromAssemblyPath($_.FullName) | Out-Null
            }
            catch [System.IO.FileLoadException] {
                # The PowerShell host may already provide the same framework assembly.
            }
        }
    $assembly = [System.Runtime.Loader.AssemblyLoadContext]::Default.LoadFromAssemblyPath($assemblyPath)
    $script:BicepTesterType = $assembly.GetType('BicepTest.BicepTester', $true)
}

function New-BicepTester {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory, Position = 0)]
        [ValidateNotNullOrEmpty()]
        [string] $BicepVersion
    )

    Import-BicepTestAssembly
    $method = $script:BicepTesterType.GetMethod('CreateAsync')
    $task = $method.Invoke($null, @($BicepVersion, [Threading.CancellationToken]::None))
    $task.GetAwaiter().GetResult()
}

function Get-BicepSnapshot {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory, Position = 0, ValueFromPipeline)]
        [ValidateNotNull()]
        [object] $Tester,

        [Parameter(Mandatory, Position = 1)]
        [ValidateNotNullOrEmpty()]
        [string] $Path,

        [string] $TenantId,

        [string] $SubscriptionId,

        [string] $ResourceGroup,

        [string] $Location,

        [string] $DeploymentName
    )

    process {
        $resolvedPath = $ExecutionContext.SessionState.Path.GetUnresolvedProviderPathFromPSPath($Path)
        $task = $Tester.SnapshotAsync(
            $resolvedPath,
            $TenantId,
            $SubscriptionId,
            $ResourceGroup,
            $Location,
            $DeploymentName,
            [Threading.CancellationToken]::None)
        $task.GetAwaiter().GetResult()
    }
}

function Remove-BicepTester {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory, Position = 0, ValueFromPipeline)]
        [ValidateNotNull()]
        [object] $Tester
    )

    process {
        $Tester.Dispose()
    }
}

Export-ModuleMember -Function Get-BicepSnapshot, New-BicepTester, Remove-BicepTester