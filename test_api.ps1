$ErrorActionPreference = 'Stop'

function Test-Endpoint {
    param([string]$Name, [string]$Method, [string]$Url, [hashtable]$Headers, [hashtable]$Body)
    
    Write-Host "Testing $Name... " -NoNewline
    
    try {
        if ($Method -eq 'GET') {
            $response = Invoke-RestMethod -Uri $Url -Method GET -Headers $Headers -TimeoutSec 10
        } else {
            $response = Invoke-RestMethod -Uri $Url -Method POST -Headers $Headers -Body $Body -TimeoutSec 10
        }
        Write-Host "OK (200)" -ForegroundColor Green
    } catch {
        Write-Host "FAILED!" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
        if ($_.ErrorDetails) {
            Write-Host $_.ErrorDetails.Message -ForegroundColor Red
        }
    }
}

$headers = @{ "Investigator" = "OFFICER-771" }

Test-Endpoint -Name "1. Get Cases" -Method "GET" -Url "http://localhost:8000/api/v1/cases" -Headers $headers
Test-Endpoint -Name "2. Get Specific Case (Seeding)" -Method "GET" -Url "http://localhost:8000/api/v1/cases/CASE-2026-001" -Headers $headers
Test-Endpoint -Name "3. Get Graph Data" -Method "GET" -Url "http://localhost:8000/api/v1/graph/case/CASE-2026-001/sih_graph" -Headers $headers

$queryBody = @{ "query" = "Who connects Rahul and Amit?" }
Test-Endpoint -Name "4. Query Engine" -Method "POST" -Url "http://localhost:8000/api/v1/query/execute" -Headers $headers -Body $queryBody

$exportBody = @{ "format" = "json" }
Test-Endpoint -Name "5. Export JSON" -Method "GET" -Url "http://localhost:8000/api/v1/export/json" -Headers $headers

$resolveBody = @{ "candidate_id" = "RES-001"; "entity_a_id" = "ENT-PER-01"; "entity_b_id" = "ENT-PER-02"; "action" = "APPROVED" }
Test-Endpoint -Name "6. Entity Resolution" -Method "POST" -Url "http://localhost:8000/api/v1/graph/resolution/action" -Headers $headers -Body $resolveBody
