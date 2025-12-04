<#
run-dev.ps1
Setup e inicia backend e frontend em desenvolvimento.

Usage: 
  .\run-dev.ps1              # Setup completo + inicia servidores
  .\run-dev.ps1 -SkipSetup   # Apenas inicia servidores
  .\run-dev.ps1 -NoNewWindow # Roda na janela atual
#>

param(
    [switch]$NoNewWindow,
    [switch]$SkipSetup
)

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
$schemas = Join-Path $root 'pass_schemas'
$backend = Join-Path $root 'pass_backend'
$frontend = Join-Path $root 'pass_frontend'

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  Pass Development Environment" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

if (-not $SkipSetup) {
    Write-Host "[SETUP] Instalando dependências..." -ForegroundColor Yellow
    Write-Host ""

    # SCHEMAS
    Write-Host "[*] pass_schemas" -ForegroundColor Cyan
    Set-Location $schemas
    npm install --no-workspaces
    npm run build
    Write-Host "[OK] Schemas pronto" -ForegroundColor Green
    Write-Host ""

    # BACKEND
    Write-Host "[*] pass_backend" -ForegroundColor Cyan
    Set-Location $backend
    npm install --no-workspaces
    npx prisma generate
    npx prisma migrate dev
    Write-Host "[OK] Backend pronto" -ForegroundColor Green
    Write-Host ""

    # FRONTEND
    Write-Host "[*] pass_frontend" -ForegroundColor Cyan
    Set-Location $frontend
    npm install --no-workspaces
    npm run build
    Write-Host "[OK] Frontend pronto" -ForegroundColor Green
    Write-Host ""

    Write-Host "[OK] Setup completo!" -ForegroundColor Green
    Write-Host ""
}

# START SERVERS
Write-Host "[START] Iniciando servidores..." -ForegroundColor Yellow
Write-Host ""

Set-Location $root

if ($NoNewWindow) {
    Write-Host "[*] Backend..." -ForegroundColor Cyan
    Set-Location $backend
    npm run start
} else {
    Write-Host "[*] Backend em nova janela..." -ForegroundColor Cyan
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backend'; npm run start"
    Start-Sleep -Seconds 2

    Write-Host "[*] Frontend em nova janela..." -ForegroundColor Cyan
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontend'; npm run start"
}

Write-Host ""
Write-Host "[OK] Servidores iniciados!" -ForegroundColor Green
Write-Host ""
Write-Host "Frontend:  http://localhost:3000" -ForegroundColor Cyan
Write-Host "Backend:   http://localhost:3333" -ForegroundColor Cyan
Write-Host ""