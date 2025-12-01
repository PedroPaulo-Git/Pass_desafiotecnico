<#
run-dev.ps1
Starts backend and frontend dev servers in separate PowerShell windows.
Usage: from repo root (PowerShell): .\run-dev.ps1
#>

param(
    [switch]$NoNewWindow
)

$root = Split-Path -Parent $MyInvocation.MyCommand.Definition
$backend = Join-Path $root 'pass_backend'
$frontend = Join-Path $root 'pass_frontend'

function Start-DevInWindow {
    param(
        [string]$Dir,
        [string]$Label
    )

    if (-not (Test-Path $Dir)) {
        Write-Error "Directory '$Dir' not found."
        return
    }

    $cmd = "Set-Location -LiteralPath '$Dir'; Write-Host 'Starting $Label (npm run dev)...'; npm run dev"

    if ($NoNewWindow) {
        Write-Host ("Starting {0} in current window: {1}" -f $Label, $Dir)
        Invoke-Expression $cmd
    } else {
        Write-Host ("Opening new window for {0}: {1}" -f $Label, $Dir)
        Start-Process powershell -ArgumentList '-NoExit', '-Command', $cmd -WorkingDirectory $Dir
    }
}

# Start backend and frontend
Start-DevInWindow -Dir $backend -Label 'backend'
Start-DevInWindow -Dir $frontend -Label 'frontend'

Write-Host "Launched backend and frontend. Check their windows for logs."