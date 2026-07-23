# Part2: order settle + commission settlement
$ErrorActionPreference = 'Stop'
$base = 'http://localhost:3000/api/v1'
$ctx = Get-Content 'f:\newWork\CCNC\service\scripts\_verify-ctx.json' -Raw | ConvertFrom-Json
$orderId = $ctx.orderId
$adminHeaders = @{ Authorization = "Bearer $($ctx.adminToken)"; 'Content-Type' = 'application/json' }
$userHeaders = @{ Authorization = "Bearer $($ctx.userToken)"; 'Content-Type' = 'application/json' }
$promoterHeaders = @{ Authorization = "Bearer $($ctx.promoterToken)" }

function Ok($n,$d){ Write-Host "[PASS] $n - $d" -ForegroundColor Green }
function Fail($n,$d){ Write-Host "[FAIL] $n - $d" -ForegroundColor Red }
function Info($m){ Write-Host "[INFO] $m" -ForegroundColor Cyan }

function Get-Balance($headers) {
  $w = Invoke-RestMethod -Uri "$base/wallets" -Headers $headers
  $bal = $w.data | Select-Object -First 1
  return [decimal]$bal.balance_available
}

# 1.3.1 expire order via prisma script
Info "expiring order $orderId ..."
Push-Location f:\newWork\CCNC\service
node scripts/_verify-expire-order.mjs
Pop-Location
Ok '1.3.1' "end_date set to past for order $orderId"

# buyer balance before order settle
$buyerBalBefore = Get-Balance $userHeaders
Info "buyer balance before order settle=$buyerBalBefore"

# 1.3.2 wait for cron (every 1 min)
$deadline = (Get-Date).AddSeconds(90)
$settled = $false
while ((Get-Date) -lt $deadline) {
  $od = Invoke-RestMethod -Uri "$base/orders/$orderId" -Headers $userHeaders
  Info "poll order status=$($od.data.status)"
  if ($od.data.status -eq 'SETTLED') { $settled = $true; break }
  Start-Sleep -Seconds 10
}

if ($settled) { Ok '1.3.2' "order $orderId SETTLED" } else { Fail '1.3.2' "order not SETTLED within 90s" }

$buyerBalAfter = Get-Balance $userHeaders
Info "buyer balance after settle=$buyerBalAfter (delta=$([double]$buyerBalAfter - [double]$buyerBalBefore))"
if ($buyerBalAfter -gt $buyerBalBefore) { Ok '1.3.2-wallet' "buyer credited principal+profit" } else { Fail '1.3.2-wallet' "buyer balance not increased" }

# 1.3.3 commission still PENDING
$comms = Invoke-RestMethod -Uri "$base/admin/commissions?page=1&page_size=50" -Headers $adminHeaders
$related = @($comms.data.list | Where-Object { "$($_.source_order_id)" -eq "$orderId" })
Info ("commissions after order settle: " + ($related | ConvertTo-Json -Compress))
$stillPending = @($related | Where-Object { $_.status -eq 'PENDING' })
$alreadyPaid = @($related | Where-Object { $_.status -eq 'PAID' })
if ($stillPending.Count -gt 0 -and $alreadyPaid.Count -eq 0) {
  Ok '1.3.3' "commissions still PENDING after order SETTLED"
} else {
  Fail '1.3.3' "expected PENDING only; got $($related | ConvertTo-Json -Compress)"
}

$promoBeforePayout = Get-Balance $promoterHeaders
Info "promoter before payout=$promoBeforePayout"

# 1.4.1 run settlement
$run1 = Invoke-RestMethod -Uri "$base/admin/commissions/run-settlement" -Method POST -Headers $adminHeaders
Info ("run-settlement #1: " + ($run1 | ConvertTo-Json -Compress -Depth 5))
if ($run1.status -eq 'success') {
  Ok '1.4.1' "settled=$($run1.data.settled) paid=$($run1.data.paid)"
} else {
  Fail '1.4.1' ($run1 | ConvertTo-Json -Compress)
}

# 1.4.2 status flow
$comms2 = Invoke-RestMethod -Uri "$base/admin/commissions?page=1&page_size=50" -Headers $adminHeaders
$related2 = @($comms2.data.list | Where-Object { "$($_.source_order_id)" -eq "$orderId" })
Info ("commissions after payout: " + ($related2 | ConvertTo-Json -Compress -Depth 5))
$paid = @($related2 | Where-Object { $_.status -eq 'PAID' })
if ($paid.Count -eq $related2.Count -and $paid.Count -gt 0) {
  Ok '1.4.2' "all related commissions PAID count=$($paid.Count)"
} else {
  Fail '1.4.2' ($related2 | ConvertTo-Json -Compress)
}

# detail for settled_at/paid_at
$detail = Invoke-RestMethod -Uri "$base/admin/commissions/$($paid[0].id)" -Headers $adminHeaders
Info ("commission detail: " + ($detail.data | ConvertTo-Json -Compress -Depth 5))
if ($detail.data.settled_at -and $detail.data.paid_at) {
  Ok '1.4.2-timestamps' "settled_at=$($detail.data.settled_at) paid_at=$($detail.data.paid_at)"
} else {
  Fail '1.4.2-timestamps' "missing settled_at/paid_at"
}

# 1.4.3 wallet credit
$promoAfterPayout = Get-Balance $promoterHeaders
$expected = [decimal](($ctx.pendingAmounts | Measure-Object -Sum).Sum)
$delta = $promoAfterPayout - $promoBeforePayout
Info "promoter delta=$delta expected=$expected"
if ([math]::Abs([double]$delta - [double]$expected) -lt 0.02) {
  Ok '1.4.3' "promoter +$delta matches commission"
} else {
  Fail '1.4.3' "delta=$delta expected=$expected"
}

# wallet logs COMMISSION
$ledger = Invoke-RestMethod -Uri "$base/wallets/ledger?page=1&page_size=20" -Headers $promoterHeaders
$clog = @($ledger.data.list | Where-Object { $_.reference_type -eq 'COMMISSION' -or $_.type -eq 'COMMISSION' })
Info ("recent commission logs: " + (($clog | Select-Object -First 3 | ConvertTo-Json -Compress)))
if ($clog.Count -gt 0) { Ok '1.4.3-log' "found COMMISSION wallet_log" } else { Fail '1.4.3-log' 'no COMMISSION log' }

# 1.4.4 idempotent
$run2 = Invoke-RestMethod -Uri "$base/admin/commissions/run-settlement" -Method POST -Headers $adminHeaders
Info ("run-settlement #2: " + ($run2 | ConvertTo-Json -Compress -Depth 5))
if ([int]$run2.data.settled -eq 0 -and [int]$run2.data.paid -eq 0) {
  Ok '1.4.4' 'idempotent settled=0 paid=0'
} else {
  Fail '1.4.4' ($run2 | ConvertTo-Json -Compress)
}

$promoAfter2 = Get-Balance $promoterHeaders
if ($promoAfter2 -eq $promoAfterPayout) { Ok '1.4.4-wallet' 'no double credit' } else { Fail '1.4.4-wallet' "$promoAfterPayout -> $promoAfter2" }

# 1.5.1 ACTIVE order PENDING should not settle - create another order without expiring
# (quick check: run settlement with only ACTIVE order commissions - create one)
Info 'creating ACTIVE order commission for 1.5.1...'
# use existing testuser who already has relation - or new already invested user 6 still has balance
$o2 = Invoke-RestMethod -Uri "$base/orders" -Method POST -Headers $userHeaders -Body '{"product_id":1,"amount":1000}'
$oid2 = $o2.data.order_id
Invoke-RestMethod -Uri "$base/orders/$oid2/pay" -Method POST -Headers $userHeaders -Body '{"payment_method":"BALANCE","payment_amount":1000}' | Out-Null
Start-Sleep -Seconds 2
$run3 = Invoke-RestMethod -Uri "$base/admin/commissions/run-settlement" -Method POST -Headers $adminHeaders
Info ("run-settlement with ACTIVE pending: " + ($run3 | ConvertTo-Json -Compress -Depth 5))
$comms3 = Invoke-RestMethod -Uri "$base/admin/commissions?page=1&page_size=50" -Headers $adminHeaders
$rel3 = @($comms3.data.list | Where-Object { "$($_.source_order_id)" -eq "$oid2" })
Info ("ACTIVE order commissions: " + ($rel3 | ConvertTo-Json -Compress))
$bad = @($rel3 | Where-Object { $_.status -in @('SETTLED','PAID') })
if ($rel3.Count -gt 0 -and $bad.Count -eq 0) {
  Ok '1.5.1' "ACTIVE order commissions stay PENDING; run settled=$($run3.data.settled) paid=$($run3.data.paid)"
} elseif ($rel3.Count -eq 0) {
  # second invest may have unlock but still should create commission with current unlock
  Fail '1.5.1' "no commission created for ACTIVE order $oid2"
} else {
  Fail '1.5.1' "ACTIVE order commission advanced early: $($rel3 | ConvertTo-Json -Compress)"
}

# H5 commission summary
$summary = Invoke-RestMethod -Uri "$base/commissions/summary" -Headers $promoterHeaders
Info ("promoter commission summary: " + ($summary | ConvertTo-Json -Compress -Depth 5))
Ok '1.6.1-api' "summary returned"

Write-Host "`nDONE part2 orderId=$orderId activeOrder=$oid2" -ForegroundColor Yellow
