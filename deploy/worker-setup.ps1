# YTPocket home worker (Windows): a SOCKS proxy that only the YTPocket
# server may use, over Tailscale. YouTube traffic from the server goes out
# through this PC's home connection (see YTDLP_PROXY_YOUTUBE in .env.example).
#
# Run in PowerShell as Administrator:
#   irm https://raw.githubusercontent.com/fadikodaz/youtube_api/main/deploy/worker-setup.ps1 | iex
# Server address other than the default: set $ServerIp first, e.g.
#   $ServerIp = '100.x.y.z'; irm <url> | iex
$ErrorActionPreference = 'Stop'
if (-not $ServerIp) { $ServerIp = '100.64.218.114' }
$dir = 'C:\3proxy'
$url = 'https://github.com/3proxy/3proxy/releases/download/1.0.3/3proxy-1.0.3-x64.zip'
$sha = 'F831B550C532CD6C8DAA11EC8CDD6BCFD62A37701A5BD8367A4BFA06A0660251'

Write-Host "Setting up the YTPocket proxy for server $ServerIp ..." -ForegroundColor Cyan

# Remove an older install (re-running the script is safe).
if (Get-Service 3proxy -ErrorAction SilentlyContinue) {
  Stop-Service 3proxy -ErrorAction SilentlyContinue
  & sc.exe delete 3proxy | Out-Null
  Start-Sleep 2
}

New-Item -ItemType Directory -Force $dir | Out-Null
# Windows Defender flags every proxy tool (3proxy included) as "potentially
# unwanted" because attackers misuse them. Let it skip only this folder.
Add-MpPreference -ExclusionPath $dir
Start-Sleep 2
$zip = Join-Path $dir '3proxy.zip'
$tmp = Join-Path $dir 'download'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
Invoke-WebRequest $url -OutFile $zip -UseBasicParsing
if ((Get-FileHash $zip -Algorithm SHA256).Hash -ne $sha) { throw 'Download check failed (wrong file).' }
if (Test-Path $tmp) { Remove-Item $tmp -Recurse -Force }
Expand-Archive $zip $tmp -Force
$exe = Get-ChildItem $tmp -Recurse -Filter 3proxy.exe | Select-Object -First 1
if (-not $exe) { throw '3proxy.exe not found in the download.' }
Copy-Item (Join-Path $exe.DirectoryName '*') $dir -Recurse -Force

$cfg = @(
  'service',
  'nserver 1.1.1.1',
  'nserver 8.8.8.8',
  'nscache 65536',
  'timeouts 1 5 30 60 180 1800 15 60',
  "log $dir\3proxy.log D",
  'rotate 7',
  'auth iponly',
  "allow * $ServerIp",
  'deny *',
  'socks -p1080'
)
Set-Content -Path (Join-Path $dir '3proxy.cfg') -Value $cfg -Encoding ascii

Get-NetFirewallRule -DisplayName 'YTPocket proxy (server only)' -ErrorAction SilentlyContinue | Remove-NetFirewallRule
New-NetFirewallRule -DisplayName 'YTPocket proxy (server only)' -Direction Inbound -Protocol TCP `
  -LocalPort 1080 -RemoteAddress $ServerIp -Action Allow | Out-Null

Push-Location $dir
& (Join-Path $dir '3proxy.exe') --install
Pop-Location
Start-Sleep 3
if ((Get-Service 3proxy).Status -ne 'Running') { Start-Service 3proxy }
Set-Service 3proxy -StartupType Automatic
Remove-Item $zip, $tmp -Recurse -Force -ErrorAction SilentlyContinue

Get-Service 3proxy | Format-Table Name, Status, StartType
Write-Host 'Done. The proxy starts by itself whenever this PC turns on.' -ForegroundColor Green
