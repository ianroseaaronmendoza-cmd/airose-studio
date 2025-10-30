# ==============================================
# Airose Studio Import Path Auto-Fixer
# Corrects misplaced import references project-wide
# Created by ChatGPT Supervisor – for Aaron Mendoza
# ==============================================

Write-Host "`n🚀 Starting Airose import path correction..."
Set-Location (Split-Path $MyInvocation.MyCommand.Path -Parent) | Out-Null
Set-Location ".."

# ✅ Collect all TS/TSX files (including [slug]/ etc.)
$files = Get-ChildItem -Path ".\app" -Recurse -File | Where-Object { $_.Extension -match 'ts$|tsx$' }

foreach ($file in $files) {
    $content = Get-Content -Raw -LiteralPath $file.FullName
    $original = $content

    # Fix BackButton import (since it's under /components, not /app/components)
    $content = $content -replace "@\/app\/components\/BackButton", "@\/components\/BackButton"
    $content = $content -replace "@\/components\/app\/BackButton", "@\/components\/BackButton"
    $content = $content -replace "@\/app\/app\/components\/BackButton", "@\/components\/BackButton"

    # Fix EditorContext import (since it's under /app/context/)
    $content = $content -replace "@\/context\/EditorContext", "@\/app\/context\/EditorContext"
    $content = $content -replace "@\/app\/app\/context\/EditorContext", "@\/app\/context\/EditorContext"

    # Save if changes were made
    if ($content -ne $original) {
        Set-Content -LiteralPath $file.FullName -Value $content -Force -NoNewline
        Write-Host "✅ Fixed imports in: $($file.FullName)"
    }
}

Write-Host "`n🎉 All import paths successfully corrected!"
Write-Host "You may now run: npm run build"
