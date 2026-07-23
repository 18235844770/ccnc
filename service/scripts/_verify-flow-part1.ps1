# CCNC verification - commission settlement full path
$ErrorActionPreference = 'Stop'
$base = 'http://localhost:3000/api/v1'
$results = [ordered]@{}

function Ok($name, $detail) {
  $results[$name] = "PASS: $detail"
  Write-Host "[PASS] $name - $detail" -ForegroundColor Green
}
function Fail($name, $detail) {
  $results[$name] = "FAIL: $detail"
  Write-Host "[FAIL] $name - $detail" -ForegroundColor Red
}
function Info($msg) { Write-Host "[INFO] $msg" -ForegroundColor Cyan }

function Get-Balance($headers) {
  $w = Invoke-RestMethod -Uri "$base/wallets" -Headers $headers
  $bal = $w.data | Where-Object { $_.type -eq 'BALANCE' -or $_.wallet_type -eq 'BALANCE' } | Select-Object -First 1
  if (-not $bal) { $bal = $w.data | Select-Object -First 1 }
  return [decimal]($bal.balance_available)
}

# Admin login
$adminLogin = Invoke-RestMethod -Uri "$base/admin/auth/login" -Method POST -ContentType 'application/json' -Body '{"username":"admin","password":"123456"}'
$adminToken = $adminLogin.token
$adminHeaders = @{ Authorization = "Bearer $adminToken"; 'Content-Type' = 'application/json' }
Ok '0.5' 'admin login ok'

# Register new downline
$suffix = Get-Random -Minimum 100000 -Maximum 999999
$newUser = "vfy$suffix"
Invoke-RestMethod -Uri "$base/auth/register" -Method POST -ContentType 'application/json' -Body (@{ username=$newUser; password='123456'; invite_code='PROMO001' } | ConvertTo-Json) | Out-Null
$userLogin = Invoke-RestMethod -Uri "$base/auth/login" -Method POST -ContentType 'application/json' -Body (@{ username=$newUser; password='123456' } | ConvertTo-Json)
$userHeaders = @{ Authorization = "Bearer $($userLogin.token)"; 'Content-Type' = 'application/json' }
$me = Invoke-RestMethod -Uri "$base/users/me" -Headers $userHeaders
$userId = $me.data.id
Ok '1.2.1' "registered $newUser id=$userId with PROMO001"

# Realname
$rn = Invoke-RestMethod -Uri "$base/users/me/realname-auth" -Method POST -Headers $userHeaders -Body '{"real_name":"验证用户","id_card":"110101199001011234"}'
Ok '3.1.2' "realname=$($rn.data.auth_status)"

# Promoter balance before
$promoterLogin = Invoke-RestMethod -Uri "$base/auth/login" -Method POST -ContentType 'application/json' -Body '{"username":"promoter","password":"123456"}'
$promoterHeaders = @{ Authorization = "Bearer $($promoterLogin.token)" }
$promoBalBefore = Get-Balance $promoterHeaders
Info "promoter balance before=$promoBalBefore"

# Topup
Invoke-RestMethod -Uri "$base/admin/wallets/adjustment" -Method POST -Headers $adminHeaders -Body (@{ user_id=$userId; amount=5000; description='verify topup' } | ConvertTo-Json) | Out-Null
$userBal = Get-Balance $userHeaders
Ok '1.2.2' "user balance=$userBal after topup"

# Create + pay
$orderCreate = Invoke-RestMethod -Uri "$base/orders" -Method POST -Headers $userHeaders -Body '{"product_id":1,"amount":1000}'
$orderId = $orderCreate.data.order_id
$pay = Invoke-RestMethod -Uri "$base/orders/$orderId/pay" -Method POST -Headers $userHeaders -Body '{"payment_method":"BALANCE","payment_amount":1000}'
Start-Sleep -Seconds 2
$orderDetail = Invoke-RestMethod -Uri "$base/orders/$orderId" -Headers $userHeaders
if ($orderDetail.data.status -in @('ACTIVE','PAID')) { Ok '1.2.3' "order $orderId status=$($orderDetail.data.status)" } else { Fail '1.2.3' "status=$($orderDetail.data.status)" }

# Check commissions via admin API
$comms = Invoke-RestMethod -Uri "$base/admin/commissions?page=1&page_size=50" -Headers $adminHeaders
$related = @($comms.data.list | Where-Object {
  ("$($_.source_order_id)" -eq "$orderId") -or ("$($_.biz_id)" -eq "$orderId")
})
Info ("related commissions: " + ($related | ConvertTo-Json -Compress -Depth 5))
$pending = @($related | Where-Object { $_.status -eq 'PENDING' })
if ($pending.Count -gt 0) {
  Ok '1.2.4' "PENDING commissions count=$($pending.Count) amounts=$($pending.amount -join ',')"
} else {
  Fail '1.2.4' "no PENDING commission for order $orderId (related=$($related.Count))"
}

$promoBalAfterPay = Get-Balance $promoterHeaders
if ($promoBalAfterPay -eq $promoBalBefore) { Ok '1.2.5' "promoter not credited on pay ($promoBalAfterPay)" } else { Fail '1.2.5' "$promoBalBefore -> $promoBalAfterPay" }

# Save context
@{
  newUser=$newUser; userId=$userId; orderId=$orderId
  promoBalBefore=[double]$promoBalBefore; promoBalAfterPay=[double]$promoBalAfterPay
  pendingIds=@($pending | ForEach-Object { $_.id })
  pendingAmounts=@($pending | ForEach-Object { [double]$_.amount })
  adminToken=$adminToken
  userToken=$userLogin.token
  promoterToken=$promoterLogin.token
} | ConvertTo-Json | Set-Content 'f:\newWork\CCNC\service\scripts\_verify-ctx.json' -Encoding utf8

Write-Host "`n=== PART1 RESULTS ===" -ForegroundColor Yellow
$results.GetEnumerator() | ForEach-Object { "$($_.Key): $($_.Value)" }
Write-Host "ORDER_ID=$orderId USER_ID=$userId"
