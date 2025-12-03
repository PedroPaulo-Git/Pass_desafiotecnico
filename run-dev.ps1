<#
run-dev.ps1
Automatiza setup e inicia backend, frontend e schemas em modo desenvolvimento (local, sem Docker).

Funcionalidades:
- Instala dependências (npm install) em todas as pastas se necessário
- Builda pass_schemas (TypeScript -> dist/)
- Configura .env files (se não existirem)
- Roda Prisma generate e migrate (backend)
- Inicia backend e frontend em janelas separadas com hot reload

Usage: 
  .\run-dev.ps1              # Abre backend e frontend em janelas separadas
  .\run-dev.ps1 -NoNewWindow # Roda tudo na janela atual (sequential)
  .\run-dev.ps1 -SkipSetup   # Pula verificações e setup, apenas inicia dev servers
#>

param(
    [switch]$NoNewWindow,
    [switch]$SkipSetup
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Definition
$schemas = Join-Path $root 'pass_schemas'
$backend = Join-Path $root 'pass_backend'
$frontend = Join-Path $root 'pass_frontend'

Write-Host "Pass - Local Development Setup" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# ============================================
# Helper Functions
# ============================================

function Test-Command {
    param([string]$Command)
    try {
        Get-Command $Command -ErrorAction Stop | Out-Null
        return $true
    } catch {
        return $false
    }
}

function Install-DepsIfNeeded {
    param([string]$Dir, [string]$Label)
    
    if (-not (Test-Path (Join-Path $Dir 'node_modules'))) {
        Write-Host "[*] Installing $Label dependencies..." -ForegroundColor Yellow
        Push-Location $Dir
        npm install
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Failed to install $Label dependencies"
        }
        Pop-Location
        Write-Host "[OK] $Label dependencies installed" -ForegroundColor Green
    } else {
        Write-Host "[OK] $Label dependencies already installed" -ForegroundColor Gray
    }
}

function Copy-EnvIfNeeded {
    param([string]$Dir, [string]$Example, [string]$Target)
    
    $examplePath = Join-Path $Dir $Example
    $targetPath = Join-Path $Dir $Target
    
    if (-not (Test-Path $targetPath)) {
        if (Test-Path $examplePath) {
            Write-Host "[*] Creating $Target from $Example..." -ForegroundColor Yellow
            Copy-Item $examplePath $targetPath
            Write-Host "[OK] $Target created (review and update if needed)" -ForegroundColor Green
        } else {
            Write-Warning "$Example not found in $Dir"
        }
    } else {
        Write-Host "[OK] $Target already exists" -ForegroundColor Gray
    }
}

# ============================================
# Pre-flight Checks
# ============================================

if (-not (Test-Command "node")) {
    Write-Error "Node.js not found. Please install Node.js 20+ and try again."
}

if (-not (Test-Command "npm")) {
    Write-Error "npm not found. Please install Node.js (includes npm) and try again."
}

Write-Host "[OK] Node.js $(node --version) found" -ForegroundColor Gray
Write-Host "[OK] npm $(npm --version) found" -ForegroundColor Gray
Write-Host ""

# ============================================
# Setup Phase (Skip with -SkipSetup)
# ============================================

if (-not $SkipSetup) {
    Write-Host "[SETUP] Running setup checks..." -ForegroundColor Cyan
    Write-Host ""

    # --- pass_schemas: Install & Build ---
    Write-Host "[1/3] pass_schemas (shared schemas)" -ForegroundColor Cyan
    Install-DepsIfNeeded -Dir $schemas -Label "pass_schemas"
    
    Write-Host "[BUILD] Building pass_schemas (TypeScript -> dist/)..." -ForegroundColor Yellow
    Push-Location $schemas
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to build pass_schemas"
    }
    Pop-Location
    Write-Host "[OK] pass_schemas built successfully" -ForegroundColor Green
    Write-Host ""

    # --- pass_backend: Install, .env, Prisma ---
    Write-Host "[2/3] pass_backend (API)" -ForegroundColor Cyan
    Install-DepsIfNeeded -Dir $backend -Label "pass_backend"
    Copy-EnvIfNeeded -Dir $backend -Example ".env.example" -Target ".env"
    
    Write-Host "[PRISMA] Running Prisma setup..." -ForegroundColor Yellow
    Push-Location $backend
    
    # Generate Prisma Client
    Write-Host "  → npx prisma generate" -ForegroundColor Gray
    npx prisma generate
    if ($LASTEXITCODE -ne 0) {
        Write-Warning "Prisma generate failed (may need manual fix)"
    }
    
    # Run migrations (dev)
    Write-Host "  → npx prisma migrate dev" -ForegroundColor Gray
    npx prisma migrate dev --skip-seed
    if ($LASTEXITCODE -ne 0) {
        Write-Warning "Prisma migrate failed (check DATABASE_URL in .env)"
    }
    
    Pop-Location
    Write-Host "[OK] pass_backend setup complete" -ForegroundColor Green
    Write-Host ""

    # --- pass_frontend: Install & .env ---
    Write-Host "[3/3] pass_frontend (UI)" -ForegroundColor Cyan
    Install-DepsIfNeeded -Dir $frontend -Label "pass_frontend"
    Copy-EnvIfNeeded -Dir $frontend -Example ".env.local.example" -Target ".env.local"
    Write-Host "[OK] pass_frontend setup complete" -ForegroundColor Green
    Write-Host ""

    Write-Host "[OK] Setup complete! Starting dev servers..." -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "[SKIP] Skipping setup (-SkipSetup flag)" -ForegroundColor Yellow
    Write-Host ""
}

# ============================================
# Start Dev Servers
# ============================================

Write-Host "[START] Starting development servers..." -ForegroundColor Cyan
Write-Host ""

function Start-DevServer {
    param(
        [string]$Dir,
        [string]$Label,
        [string]$Port
    )

    if (-not (Test-Path $Dir)) {
        Write-Error "Directory '$Dir' not found."
        return
    }

    $cmd = @"
Set-Location -LiteralPath '$Dir'
Write-Host ''
Write-Host '========================================' -ForegroundColor Cyan
Write-Host '  $Label Dev Server' -ForegroundColor Cyan
Write-Host '========================================' -ForegroundColor Cyan
Write-Host ''
Write-Host '[INFO] Running at: http://localhost:$Port' -ForegroundColor Green
Write-Host '[INFO] Hot reload enabled' -ForegroundColor Gray
Write-Host ''
npm run dev
"@

    if ($NoNewWindow) {
        Write-Host "[RUN] Starting $Label in current window..." -ForegroundColor Yellow
        Invoke-Expression $cmd
    } else {
        Write-Host "[RUN] Opening new window for $Label (http://localhost:$Port)" -ForegroundColor Yellow
        Start-Process powershell -ArgumentList '-NoExit', '-Command', $cmd -WorkingDirectory $Dir
    }
}

# Start backend (port 3333)
Start-DevServer -Dir $backend -Label "Backend API" -Port "3333"
Start-Sleep -Seconds 2

# Start frontend (port 3000)
Start-DevServer -Dir $frontend -Label "Frontend" -Port "3000"

Write-Host ""
Write-Host "[OK] Dev servers launched!" -ForegroundColor Green
Write-Host ""
Write-Host "[ACCESS] Access points:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "   Backend:  http://localhost:3333" -ForegroundColor White
Write-Host ""
Write-Host "[TIPS] Useful info:" -ForegroundColor Cyan
Write-Host "   - Check each window for logs" -ForegroundColor Gray
Write-Host "   - Use Ctrl+C in each window to stop" -ForegroundColor Gray
Write-Host "   - Re-run with -SkipSetup to skip setup checks" -ForegroundColor Gray
Write-Host ""