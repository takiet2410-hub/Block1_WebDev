param(
    [ValidateRange(1024, 65535)]
    [int]$Port = 8080,
    [switch]$SetupOnly,
    [switch]$NoBrowser
)

$ErrorActionPreference = 'Stop'
$repoRoot = $PSScriptRoot
$caddyVersion = '2.11.7'
$toolRoot = Join-Path $repoRoot '.local\caddy'
$caddyExe = Join-Path $toolRoot 'caddy.exe'
$previousPort = $env:LOCAL_WEB_PORT
$previousDataHome = $env:XDG_DATA_HOME
$previousConfigHome = $env:XDG_CONFIG_HOME
$requestedPort = $PSBoundParameters.ContainsKey('Port')

function Test-FreePort([int]$Candidate) {
    $listener = New-Object System.Net.Sockets.TcpListener([System.Net.IPAddress]::Loopback, $Candidate)
    try { $listener.Start(); return $true }
    catch [System.Net.Sockets.SocketException] { return $false }
    finally { $listener.Stop() }
}

Push-Location -LiteralPath $repoRoot
try {
    if (-not (Test-Path -LiteralPath $caddyExe)) {
        $cpu = $env:PROCESSOR_ARCHITEW6432
        if (-not $cpu) { $cpu = $env:PROCESSOR_ARCHITECTURE }
        $arch = switch ($cpu) {
            'AMD64' { 'amd64' }
            'ARM64' { 'arm64' }
            default { throw "Unsupported Windows CPU: $cpu. Use Windows x64 or ARM64." }
        }
        $assetName = "caddy_${caddyVersion}_windows_${arch}.zip"
        $releaseUrl = "https://github.com/caddyserver/caddy/releases/download/v$caddyVersion"
        New-Item -ItemType Directory -Force -Path $toolRoot | Out-Null
        $downloadRoot = Join-Path $toolRoot ('download-' + [guid]::NewGuid().ToString('N'))
        New-Item -ItemType Directory -Path $downloadRoot | Out-Null
        $zipPath = Join-Path $downloadRoot $assetName
        $checksumPath = Join-Path $downloadRoot 'checksums.txt'
        [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
        Write-Host "Downloading official Caddy $caddyVersion ($arch)..."
        Invoke-WebRequest "$releaseUrl/$assetName" -OutFile $zipPath -UseBasicParsing
        Invoke-WebRequest "$releaseUrl/caddy_${caddyVersion}_checksums.txt" -OutFile $checksumPath -UseBasicParsing
        $expectedHash = $null
        foreach ($line in (Get-Content -LiteralPath $checksumPath)) {
            $parts = $line.Trim() -split '\s+'
            if ($parts.Count -eq 2 -and $parts[1].TrimStart('*') -eq $assetName) {
                $expectedHash = $parts[0]
                break
            }
        }
        if (-not $expectedHash -or $expectedHash -notmatch '^[a-fA-F0-9]{128}$') {
            throw 'Official SHA512 checksum is missing or invalid.'
        }
        if ((Get-FileHash -LiteralPath $zipPath -Algorithm SHA512).Hash -ne $expectedHash) {
            throw 'Caddy checksum mismatch. Installation stopped; retry setup.'
        }
        Expand-Archive -LiteralPath $zipPath -DestinationPath $downloadRoot
        $extractedExe = Join-Path $downloadRoot 'caddy.exe'
        if (-not (Test-Path -LiteralPath $extractedExe)) { throw 'caddy.exe is missing from archive.' }
        Move-Item -LiteralPath $extractedExe -Destination $caddyExe
        Remove-Item -LiteralPath $zipPath, $checksumPath
        Write-Host 'Caddy installed and checksum verified.'
    }

    $env:XDG_DATA_HOME = Join-Path $toolRoot 'runtime-data'
    $env:XDG_CONFIG_HOME = Join-Path $toolRoot 'runtime-config'
    & $caddyExe version
    if ($LASTEXITCODE -ne 0) { throw 'Caddy cannot run. Delete .local/caddy/caddy.exe and retry setup.' }
    if (-not $SetupOnly) {
        if ($requestedPort) {
            if (-not (Test-FreePort $Port)) { throw "Port $Port is in use. Retry with -Port 8081 (or another free port)." }
        } else {
            while (-not (Test-FreePort $Port)) {
                $Port++
                if ($Port -gt 8100) { throw 'Ports 8080-8100 are busy. Pass -Port with a free port.' }
            }
        }
    }
    $env:LOCAL_WEB_PORT = [string]$Port
    & $caddyExe validate --config (Join-Path $repoRoot 'Caddyfile')
    if ($LASTEXITCODE -ne 0) { throw 'Invalid Caddyfile.' }
    if ($SetupOnly) {
        Write-Host 'Setup complete. Run start-local.cmd to start the website.'
    } else {
        $url = "http://localhost:$Port"
        Write-Host "Website: $url"
        Write-Host 'Keep this window open. Press Ctrl+C to stop. Refresh the browser after editing files.'
        if (-not $NoBrowser) { Start-Process $url }
        & $caddyExe run --config (Join-Path $repoRoot 'Caddyfile')
        if ($LASTEXITCODE -ne 0) { throw 'Caddy failed to start. Check the error above.' }
    }
} catch {
    Write-Host "Setup/start failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host 'First setup needs internet access to github.com. Retry start-local.cmd after fixing the error.'
    exit 1
} finally {
    $env:LOCAL_WEB_PORT = $previousPort
    $env:XDG_DATA_HOME = $previousDataHome
    $env:XDG_CONFIG_HOME = $previousConfigHome
    Pop-Location
}
