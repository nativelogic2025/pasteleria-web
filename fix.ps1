$dir = "c:\Users\Alan\Documents\Pasteleria la Estrella\Pasteleria_la_Estrella_WEB"
Get-ChildItem -Path $dir -Filter "*.html" | ForEach-Object {
    $wrongText = [System.IO.File]::ReadAllText($_.FullName, [System.Text.Encoding]::UTF8)
    $originalBytes = [System.Text.Encoding]::GetEncoding(1252).GetBytes($wrongText)
    [System.IO.File]::WriteAllBytes($_.FullName, $originalBytes)
    Write-Host "Fixed encoding for $($_.Name)"
}
