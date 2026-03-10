$dir = "c:\Users\Alan\Documents\Pasteleria la Estrella\Pasteleria_la_Estrella_WEB"
Get-ChildItem -Path $dir -Filter "*.html" | ForEach-Object {
    $content = Get-Content $_.FullName -Raw

    # Replace Header
    $content = [regex]::Replace($content, "(?si)<!-- Header / Navbar -->\s*<header.*?</header>", "<header-component></header-component>")
    $content = [regex]::Replace($content, "(?si)<header[^>]*>.*?</header>", "<header-component></header-component>")

    # Replace Footer
    $content = [regex]::Replace($content, "(?si)<!-- Footer -->\s*<footer.*?</footer>", "<footer-component></footer-component>")
    $content = [regex]::Replace($content, "(?si)<footer[^>]*>.*?</footer>", "<footer-component></footer-component>")
    
    # Add script tag
    if (-not ($content -match '<script src="js/components.js"></script>')) {
        $content = $content -replace '<script src="js/main.js"></script>', "<script src=`"js/components.js`"></script>`n    <script src=`"js/main.js`"></script>"
    }

    Set-Content -Path $_.FullName -Value $content -Encoding UTF8
    Write-Host "Updated $($_.Name)"
}
