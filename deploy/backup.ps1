param(
    [string]$ComposeFile = "deploy/docker-compose.yml"
)

Set-StrictMode -Version Latest
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root\..

function Load-DotEnv {
    $envFile = Join-Path $root ".env"
    if (Test-Path $envFile) {
        Get-Content $envFile | ForEach-Object {
            if ($_ -match '^[^#][^=]+=') {
                $parts = $_ -split '=', 2
                if ($parts.Count -eq 2) {
                    $name = $parts[0].Trim()
                    $value = $parts[1].Trim()
                    if ($name -and $value) { Set-Item -Path Env:$name -Value $value }
                }
            }
        }
    }
}

Load-DotEnv

$backupDir = Join-Path $root "backups"
New-Item -ItemType Directory -Force -Path $backupDir | Out-Null
$timestamp = (Get-Date).ToString('yyyyMMdd-HHmmss')
Write-Host "Creating backup $backupDir\backup-$timestamp"

$mysqlContainer = docker compose -f $ComposeFile ps -q db-mysql
if (-not $mysqlContainer) {
    Write-Error "db-mysql service is not running. Start the stack before backup."
    exit 1
}

$mysqlUser = $env:WORDPRESS_DB_USER; if (-not $mysqlUser) { $mysqlUser = 'hrl_mysql_user' }
$mysqlPassword = $env:WORDPRESS_DB_PASSWORD; if (-not $mysqlPassword) { $mysqlPassword = 'hrl_db_strong_password_901' }
$mysqlDb = $env:WORDPRESS_DB_NAME; if (-not $mysqlDb) { $mysqlDb = 'hrl_commerce_db' }

$dumpFile = Join-Path $backupDir "mysql-$timestamp.sql"
Write-Host "Dumping MySQL database to $dumpFile"
docker compose -f $ComposeFile exec -T db-mysql sh -c "exec mysqldump --single-transaction --quick --user=\"$mysqlUser\" --password=\"$mysqlPassword\" \"$mysqlDb\"" > $dumpFile

$archiveFile = Join-Path $backupDir "wp-data-$timestamp.tar.gz"
Write-Host "Archiving WordPress files to $archiveFile"
& tar czf $archiveFile -C $root wp-app wp-content
Write-Host "Backup complete: $backupDir"
