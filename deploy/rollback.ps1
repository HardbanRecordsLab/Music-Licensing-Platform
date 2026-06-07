param(
    [string]$ComposeFile = "deploy/docker-compose.yml",
    [string]$BackupFile = ""
)

Set-StrictMode -Version Latest
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root\..

if (-not $BackupFile) {
    $files = Get-ChildItem -Path (Join-Path $root "backups") -Filter "mysql-*.sql" | Sort-Object LastWriteTime -Descending
    if (-not $files) {
        Write-Error "No backups found in deploy/backups."
        exit 1
    }
    $BackupFile = $files[0].FullName
}

if (-not (Test-Path $BackupFile)) {
    Write-Error "Backup file not found: $BackupFile"
    exit 1
}

$base = [System.IO.Path]::GetFileNameWithoutExtension($BackupFile)
$timestamp = $base -replace '^mysql-',''
$archiveFile = Join-Path $root "backups" "wp-data-$timestamp.tar.gz"
if (-not (Test-Path $archiveFile)) {
    Write-Error "Archive not found for $BackupFile: $archiveFile"
    exit 1
}

Write-Host "Restoring WordPress files from $archiveFile"
& tar xzf $archiveFile -C $root\deploy

$mysqlContainer = docker compose -f $ComposeFile ps -q db-mysql
if (-not $mysqlContainer) {
    Write-Error "db-mysql service is not running. Start the stack before rollback."
    exit 1
}

$mysqlUser = $env:WORDPRESS_DB_USER; if (-not $mysqlUser) { $mysqlUser = 'hrl_mysql_user' }
$mysqlPassword = $env:WORDPRESS_DB_PASSWORD; if (-not $mysqlPassword) { $mysqlPassword = 'hrl_db_strong_password_901' }
$mysqlDb = $env:WORDPRESS_DB_NAME; if (-not $mysqlDb) { $mysqlDb = 'hrl_commerce_db' }

Write-Host "Restoring database from $BackupFile"
Get-Content $BackupFile -Raw | docker compose -f $ComposeFile exec -T db-mysql sh -c "exec mysql --user=\"$mysqlUser\" --password=\"$mysqlPassword\" \"$mysqlDb\""
Write-Host "Rollback completed."
