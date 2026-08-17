# Packages the production build for hosts that cannot run `next build` themselves.
# The deployment target (CloudLinux 8, glibc 2.28) cannot load the next-swc
# binary, so the build happens here and only the output is shipped. Server-side
# node_modules stay untouched, which keeps native deps (sharp, Prisma) native.
#
# Uses bsdtar (bundled with Windows since 10/1803) rather than Compress-Archive:
# Compress-Archive writes backslash path separators and no Unix permission bits,
# which makes Linux unzip produce read-only directories that cannot be replaced.

$ErrorActionPreference = "Stop"

$repo = Split-Path -Parent $PSScriptRoot
Set-Location $repo

if (-not (Test-Path ".next\BUILD_ID")) {
    throw "No production build found. Run 'npm run build' first."
}

$stage = Join-Path $env:TEMP "halo-stage"
$archive = Join-Path $repo "next-build.tar.gz"

Remove-Item -Recurse -Force $stage -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Path (Join-Path $stage "next-build") | Out-Null

# /XD cache dev: build cache and dev-server artifacts are never needed to serve.
robocopy ".next" (Join-Path $stage "next-build") /E /XD cache dev /NFL /NDL /NJH /NJS /NP | Out-Null
if ($LASTEXITCODE -ge 8) { throw "robocopy failed with exit code $LASTEXITCODE" }
$global:LASTEXITCODE = 0

Remove-Item $archive -ErrorAction SilentlyContinue
tar -czf $archive -C $stage next-build
if ($LASTEXITCODE -ne 0) { throw "tar failed with exit code $LASTEXITCODE" }

Remove-Item -Recurse -Force $stage -ErrorAction SilentlyContinue
Remove-Item (Join-Path $repo "next-build.zip") -ErrorAction SilentlyContinue

$mb = "{0:N1}" -f ((Get-Item $archive).Length / 1MB)
Write-Host "Created next-build.tar.gz ($mb MB)"
Write-Host "Upload it to ~/halo, then run: bash scripts/deploy-build.sh"
