# Packages the production build for hosts that cannot run `next build` themselves.
# The deployment target (CloudLinux 8, glibc 2.28) cannot load the next-swc
# binary, so the build happens here and only the output is shipped. Server-side
# node_modules stay untouched, which keeps native deps (sharp, Prisma) native.

$ErrorActionPreference = "Stop"

$repo = Split-Path -Parent $PSScriptRoot
Set-Location $repo

if (-not (Test-Path ".next\BUILD_ID")) {
    throw "No production build found. Run 'npm run build' first."
}

$stage = Join-Path $env:TEMP "halo-stage"
$zip = Join-Path $repo "next-build.zip"

Remove-Item -Recurse -Force $stage -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Path (Join-Path $stage "next-build") | Out-Null

# /XD cache dev: build cache and dev-server artifacts are never needed to serve.
robocopy ".next" (Join-Path $stage "next-build") /E /XD cache dev /NFL /NDL /NJH /NJS /NP | Out-Null
if ($LASTEXITCODE -ge 8) { throw "robocopy failed with exit code $LASTEXITCODE" }

Remove-Item $zip -ErrorAction SilentlyContinue
Compress-Archive -Path (Join-Path $stage "next-build") -DestinationPath $zip -CompressionLevel Optimal
Remove-Item -Recurse -Force $stage -ErrorAction SilentlyContinue

$mb = "{0:N1}" -f ((Get-Item $zip).Length / 1MB)
Write-Host "Created next-build.zip ($mb MB)"
Write-Host "Upload it to ~/halo on the server, then run: ./scripts/deploy-build.sh"
