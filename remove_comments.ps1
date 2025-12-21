# remove_comments.ps1
$extensions = @('*.js','*.jsx','*.ts','*.tsx','*.css','*.html')
$excludePattern = "node_modules|build|dist|\.git|\.next|package-lock\.json|artifacts"

Write-Host "Starting comment removal..."
Get-ChildItem -Path . -Recurse -File -Include $extensions -ErrorAction SilentlyContinue | Where-Object { 
    $_.FullName -notmatch $excludePattern 
} | ForEach-Object {
    $filePath = $_.FullName
    try {
        # Using [System.IO.File] for better handling
        $content = [System.IO.File]::ReadAllText($filePath)
        $originalContent = $content

        # Remove single-line comments that occupy the entire line
        $content = $content -replace '(?m)^[ \t]*//.*(?:\r?\n|$)', ''
        
        # Remove block comments /* ... */
        $content = $content -replace '(?s)/\*.*?\*/', ''
        
        # Remove HTML comments <!-- ... -->
        $content = $content -replace '(?s)<!--.*?-->', ''

        if ($content -ne $originalContent) {
            [System.IO.File]::WriteAllText($filePath, $content)
            Write-Host "Cleaned: $($_.Name)"
        }
    } catch {
        Write-Host "Error processing $filePath : $($_.Exception.Message)"
    }
}
Write-Host "Finished comment removal."
