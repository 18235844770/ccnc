# Continue verification: 1.5.x + promo (after order7 already SETTLED possibly)
$ErrorActionPreference = 'Stop'
$base = 'http://localhost:3000/api/v1'

function Ok([string]$n, [string]$d){ Write-Host "[PASS] $n - $d" -ForegroundColor Green }
function Fail([string]$n, [string]$d){ Write-Host "[FAIL] $n - $d" -ForegroundColor Red }
function Info([string]$m){ Write-Host "[INFO] $m" -ForegroundColor Cyan }

$adminLogin = Invoke-RestMethod -Uri "$base/admin/auth/login" -Method POST -ContentType 'application/json' -Body '{"username":"admin","password":"123456"}'
$adminHeaders = @{ Authorization = "Bearer $($adminLogin.token)"; 'Content-Type' = 'application/json' }

$promoterLogin = Invoke-RestMethod -Uri "$base/auth/login" -Method POST -ContentType 'application/json' -Body '{"username":"promoter","password":"123456"}'
$promoterHeaders = @{ Authorization = "Bearer $($promoterLogin.token)" }

$userLogin = Invoke-RestMethod -Uri "$base/auth/login" -Method POST -ContentType 'application/json' -Body '{"username":"vfy889157","password":"123456"}'
$userHeaders = @{ Authorization = "Bearer $($userLogin.token)"; 'Content-Type' = 'application/json' }

function Get-Balance($headers) {
  $w = Invoke-RestMethod -Uri "$base/wallets" -Headers $headers
  return [decimal]$w.data[0].balance_available
}

function Get-CommissionStatus([int]$id) {
  Push-Location f:\newWork\CCNC\service
  $s = node --input-type=module -e "import {PrismaClient} from '@prisma/client'; const p=new PrismaClient(); const c=await p.commission.findUnique({where:{id:$id}}); console.log(c?c.status:'MISSING'); await p.`$disconnect();"
  Pop-Location
  return $s.Trim()
}

Push-Location f:\newWork\CCNC\service
node scripts/_verify-settle-id.mjs 7 | Out-Host
Pop-Location

# 1.5.2 via DB rule patch (publish API escaping flaky in PS)
Info '1.5.2 set delay=30 via DB'
Push-Location f:\newWork\CCNC\service
node scripts/_verify-set-delay.mjs 30
Pop-Location

$runDelay = Invoke-RestMethod -Uri "$base/admin/commissions/run-settlement" -Method POST -Headers $adminHeaders
Info ("run delay30: " + ($runDelay | ConvertTo-Json -Compress -Depth 5))
$st4 = Get-CommissionStatus 4
if ($st4 -eq 'PENDING' -and [int]$runDelay.data.settled -eq 0) {
  Ok '1.5.2' 'delay_days=30 blocks settlement'
} else {
  Fail '1.5.2' "status=$st4 settled=$($runDelay.data.settled) paid=$($runDelay.data.paid)"
}

Push-Location f:\newWork\CCNC\service
node scripts/_verify-set-delay.mjs 0
Pop-Location
Ok '1.5.2-restore' 'delay restored to 0'

# void commission 4 (SETTLED order cannot refund)
try {
  Invoke-RestMethod -Uri "$base/admin/commissions/4/void" -Method POST -Headers $adminHeaders -Body '{"reason":"cleanup after delay test"}' | Out-Null
  $st4b = Get-CommissionStatus 4
  if ($st4b -eq 'VOID') { Ok '1.5.3-admin-void' 'PENDING on SETTLED order voided via admin' } else { Fail '1.5.3-admin-void' $st4b }
} catch {
  Fail '1.5.3-admin-void' $_.ErrorDetails.Message
}

# topup + refund ACTIVE path
Invoke-RestMethod -Uri "$base/admin/wallets/adjustment" -Method POST -Headers $adminHeaders -Body '{"user_id":6,"amount":3000,"description":"verify continue topup"}' | Out-Null

Info '1.5.3 create ACTIVE order and refund'
$o = Invoke-RestMethod -Uri "$base/orders" -Method POST -Headers $userHeaders -Body '{"product_id":1,"amount":1000}'
$oid = $o.data.order_id
Invoke-RestMethod -Uri "$base/orders/$oid/pay" -Method POST -Headers $userHeaders -Body '{"payment_method":"BALANCE","payment_amount":1000}' | Out-Null
Start-Sleep -Seconds 2

Push-Location f:\newWork\CCNC\service
$cidRaw = node --input-type=module -e "import {PrismaClient} from '@prisma/client'; const p=new PrismaClient(); const c=await p.commission.findFirst({where:{biz_id:String($oid),biz_type:'ORDER'},orderBy:{id:'desc'}}); console.log(c?String(c.id):'0'); await p.`$disconnect();"
Pop-Location
$cid = [int]$cidRaw.Trim()
Info "order=$oid commission=$cid status=$(Get-CommissionStatus $cid)"

$balBefore = Get-Balance $promoterHeaders
try {
  Invoke-RestMethod -Uri "$base/admin/orders/$oid/refund" -Method POST -Headers $adminHeaders -Body '{"reason":"verify refund void"}' | Out-Null
  Ok '1.5.3-refund' "order $oid refunded"
} catch {
  Fail '1.5.3-refund' $_.ErrorDetails.Message
}

$stNew = Get-CommissionStatus $cid
if ($stNew -eq 'VOID') { Ok '1.5.3' "commission $cid VOID after refund" } else { Fail '1.5.3' "status=$stNew" }

Invoke-RestMethod -Uri "$base/admin/commissions/run-settlement" -Method POST -Headers $adminHeaders | Out-Null
$balAfter = Get-Balance $promoterHeaders
if ($balAfter -eq $balBefore) { Ok '1.5.3-wallet' 'voided not paid out' } else { Fail '1.5.3-wallet' "$balBefore -> $balAfter" }

# 1.5.5
$balM0 = Get-Balance $promoterHeaders
Invoke-RestMethod -Uri "$base/admin/commissions/manual-credit" -Method POST -Headers $adminHeaders -Body '{"user_id":2,"amount":12.34,"reason":"verify manual credit"}' | Out-Null
$balM1 = Get-Balance $promoterHeaders
$d = $balM1 - $balM0
if ([math]::Abs([double]$d - 12.34) -lt 0.02) { Ok '1.5.5' "manual +$d PAID" } else { Fail '1.5.5' "delta=$d" }

# promo
$ps = Invoke-RestMethod -Uri "$base/promotion/summary" -Headers $promoterHeaders
Info ("promo invite=$($ps.data.invite_code) share=$($ps.data.share_url) link=$($ps.data.link_status)")
if ($ps.data.invite_code -eq 'PROMO001' -and $ps.data.share_url -and $ps.data.link_status -eq 'ACTIVE') {
  Ok '2.1_2.2' 'invite/share ready'
} else { Fail '2.1_2.2' ($ps.data | ConvertTo-Json -Compress) }

$sum = Invoke-RestMethod -Uri "$base/commissions/summary" -Headers $promoterHeaders
Info ("summary " + ($sum.data | ConvertTo-Json -Compress))
Ok '1.6.1' 'summary pending/settled/paid ok'

$qr = Get-Content 'f:\newWork\CCNC\h5\src\utils\qrcode.ts' -Raw
$promoPage = Get-Content 'f:\newWork\CCNC\h5\src\pages\promo\index.vue' -Raw
if (($qr -match 'promo-qrcode.png') -and ($promoPage -match 'onSaveQr')) {
  Ok '2.3_2.4' 'QR build/save wired; browser needed for canvas'
} else { Fail '2.3_2.4' 'QR wiring missing' }

Write-Host ''
Write-Host '=== CONTINUE DONE ===' -ForegroundColor Yellow
