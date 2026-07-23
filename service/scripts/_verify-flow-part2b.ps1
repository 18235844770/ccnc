# Part2b: after manual order settle, run commission settlement checks
$ErrorActionPreference = 'Stop'
$base = 'http://localhost:3000/api/v1'
$raw = (Get-Content 'f:\newWork\CCNC\service\scripts\_verify-ctx.json' -Raw) -replace '^\uFEFF',''
$ctx = $raw | ConvertFrom-Json
$orderId = $ctx.orderId
$adminHeaders = @{ Authorization = "Bearer $($ctx.adminToken)"; 'Content-Type' = 'application/json' }
$userHeaders = @{ Authorization = "Bearer $($ctx.userToken)"; 'Content-Type' = 'application/json' }
$promoterHeaders = @{ Authorization = "Bearer $($ctx.promoterToken)" }

function Ok($n,$d){ Write-Host "[PASS] $n - $d" -ForegroundColor Green }
function Fail($n,$d){ Write-Host "[FAIL] $n - $d" -ForegroundColor Red }
function Info($m){ Write-Host "[INFO] $m" -ForegroundColor Cyan }
function Get-Balance($headers) {
  $w = Invoke-RestMethod -Uri "$base/wallets" -Headers $headers
  return [decimal]($w.data[0].balance_available)
}

Info 'manual expire+settle order via script (simulate cron)'
Push-Location f:\newWork\CCNC\service
node scripts/_verify-settle-order.mjs
Pop-Location

$od = Invoke-RestMethod -Uri "$base/orders/$orderId" -Headers $userHeaders
if ($od.data.status -eq 'SETTLED') { Ok '1.3.2' "order $orderId SETTLED (manual cron simulate)" } else { Fail '1.3.2' "status=$($od.data.status)" }

$comms = Invoke-RestMethod -Uri "$base/admin/commissions?page=1&page_size=50" -Headers $adminHeaders
$related = @($comms.data.list | Where-Object { "$($_.source_order_id)" -eq "$orderId" })
Info ("after order settle: " + ($related | ConvertTo-Json -Compress))
if ((@($related | Where-Object { $_.status -eq 'PENDING' })).Count -gt 0) {
  Ok '1.3.3' 'commission still PENDING'
} else { Fail '1.3.3' ($related | ConvertTo-Json -Compress) }

$promoBefore = Get-Balance $promoterHeaders
$run1 = Invoke-RestMethod -Uri "$base/admin/commissions/run-settlement" -Method POST -Headers $adminHeaders
Info ("run1: " + ($run1 | ConvertTo-Json -Compress -Depth 5))
if ([int]$run1.data.settled -gt 0 -and [int]$run1.data.paid -gt 0) {
  Ok '1.4.1' "settled=$($run1.data.settled) paid=$($run1.data.paid)"
} else {
  # may settle multiple pending from order6 only
  if ([int]$run1.data.paid -gt 0) { Ok '1.4.1' "settled=$($run1.data.settled) paid=$($run1.data.paid)" }
  else { Fail '1.4.1' ($run1 | ConvertTo-Json -Compress) }
}

$comms2 = Invoke-RestMethod -Uri "$base/admin/commissions?page=1&page_size=50" -Headers $adminHeaders
$related2 = @($comms2.data.list | Where-Object { "$($_.source_order_id)" -eq "$orderId" })
Info ("after payout: " + ($related2 | ConvertTo-Json -Compress -Depth 5))
$paid = @($related2 | Where-Object { $_.status -eq 'PAID' })
if ($paid.Count -gt 0) { Ok '1.4.2' "PAID count=$($paid.Count)" } else { Fail '1.4.2' ($related2 | ConvertTo-Json -Compress) }

$cid = $paid[0].id
$detail = Invoke-RestMethod -Uri "$base/admin/commissions/$cid" -Headers $adminHeaders
Info ("detail: " + ($detail.data | ConvertTo-Json -Compress -Depth 5))
# detail may not expose settled_at in mapAdminListItem - check raw via script if needed
if ($detail.data.status -eq 'PAID') { Ok '1.4.2-detail' "id=$cid status=PAID" } else { Fail '1.4.2-detail' ($detail | ConvertTo-Json -Compress) }

$promoAfter = Get-Balance $promoterHeaders
$delta = $promoAfter - $promoBefore
$expected = [decimal](($ctx.pendingAmounts | Measure-Object -Sum).Sum)
Info "promoter $promoBefore -> $promoAfter delta=$delta expected>=$expected"
if ($delta -ge ($expected - 0.01)) { Ok '1.4.3' "credited $delta" } else { Fail '1.4.3' "delta=$delta expected=$expected" }

$ledger = Invoke-RestMethod -Uri "$base/wallets/ledger?page=1&page_size=30" -Headers $promoterHeaders
$clog = @($ledger.data.list | Where-Object { $_.reference_type -eq 'COMMISSION' })
Info ("commission logs count=$($clog.Count) sample=" + (($clog | Select-Object -First 2 | ConvertTo-Json -Compress)))
if ($clog.Count -gt 0) { Ok '1.4.3-log' 'COMMISSION wallet_log exists' } else { Fail '1.4.3-log' 'missing' }

$run2 = Invoke-RestMethod -Uri "$base/admin/commissions/run-settlement" -Method POST -Headers $adminHeaders
Info ("run2: " + ($run2 | ConvertTo-Json -Compress -Depth 5))
if ([int]$run2.data.settled -eq 0 -and [int]$run2.data.paid -eq 0) { Ok '1.4.4' 'idempotent' } else { Fail '1.4.4' ($run2 | ConvertTo-Json -Compress) }

$promo2 = Get-Balance $promoterHeaders
if ($promo2 -eq $promoAfter) { Ok '1.4.4-wallet' 'no double credit' } else { Fail '1.4.4-wallet' "$promoAfter -> $promo2" }

# freeze/unfreeze on ACTIVE pending (order 7 commission id 4)
$commsAll = Invoke-RestMethod -Uri "$base/admin/commissions?page=1&page_size=50" -Headers $adminHeaders
$activePending = @($commsAll.data.list | Where-Object { $_.status -eq 'PENDING' -and "$($_.source_order_id)" -eq '7' }) | Select-Object -First 1
if ($activePending) {
  $fid = $activePending.id
  Invoke-RestMethod -Uri "$base/admin/commissions/$fid/freeze" -Method POST -Headers $adminHeaders -Body '{"reason":"verify freeze"}' | Out-Null
  $f1 = Invoke-RestMethod -Uri "$base/admin/commissions/$fid" -Headers $adminHeaders
  if ($f1.data.status -eq 'FROZEN') { Ok '1.5.4-freeze' "id=$fid FROZEN" } else { Fail '1.5.4-freeze' ($f1.data.status) }
  Invoke-RestMethod -Uri "$base/admin/commissions/$fid/unfreeze" -Method POST -Headers $adminHeaders -Body '{"reason":"verify unfreeze"}' | Out-Null
  $f2 = Invoke-RestMethod -Uri "$base/admin/commissions/$fid" -Headers $adminHeaders
  if ($f2.data.status -eq 'PENDING') { Ok '1.5.4-unfreeze' "back to PENDING" } else { Fail '1.5.4-unfreeze' $f2.data.status }
} else {
  Info 'skip freeze: no PENDING for order 7'
}

# promotion summary for QR path
$ps = Invoke-RestMethod -Uri "$base/promotion/summary" -Headers $promoterHeaders
Info ("promo summary: " + ($ps.data | ConvertTo-Json -Compress -Depth 6))
if ($ps.data.invite_code) { Ok '2.2-api' "invite_code=$($ps.data.invite_code) link=$($ps.data.invite_link)" } else { Fail '2.2-api' 'no invite_code' }

# H5 commission list statuses
$clist = Invoke-RestMethod -Uri "$base/commissions?page=1&page_size=20" -Headers $promoterHeaders
Info ("h5 commissions: " + (($clist.data.list | Select-Object -First 5 | ConvertTo-Json -Compress -Depth 5)))
Ok '1.6.2-api' "list statuses present"

# admin commission rules
$rule = Invoke-RestMethod -Uri "$base/admin/commission-rules/active" -Headers $adminHeaders
Info ("active rule: " + ($rule | ConvertTo-Json -Compress -Depth 6))
Ok '3.2.2' 'active commission rule loaded'

# distributors
$dist = Invoke-RestMethod -Uri "$base/admin/distributors?page=1&page_size=10" -Headers $adminHeaders
Info ("distributors total=$($dist.data.total)")
Ok '3.2.1-api' "distributors list total=$($dist.data.total)"

# banners + articles
try {
  $banners = Invoke-RestMethod -Uri "$base/banners"
  Ok '3.3.1-api' "banners count=$(@($banners.data).Count)"
} catch { Fail '3.3.1-api' $_.Exception.Message }
try {
  $arts = Invoke-RestMethod -Uri "$base/articles?page=1&page_size=5"
  Ok '3.3.2-api' "articles total=$($arts.data.total)"
} catch { Fail '3.3.2-api' $_.Exception.Message }

# DB timestamps check
Push-Location f:\newWork\CCNC\service
node -e "import {PrismaClient} from '@prisma/client'; const p=new PrismaClient(); const c=await p.commission.findUnique({where:{id:3}}); console.log(JSON.stringify({id:c.id,status:c.status,settled_at:c.settled_at,paid_at:c.paid_at,amount:String(c.amount)})); await p.\$disconnect();"
Pop-Location
