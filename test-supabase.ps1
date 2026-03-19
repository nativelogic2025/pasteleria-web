$headers = @{
    "apikey" = "sb_publishable_jTuZRwRohap9wJcfeJovlg_nzM2u-z-"
    "Authorization" = "Bearer sb_publishable_jTuZRwRohap9wJcfeJovlg_nzM2u-z-"
    "Accept" = "application/json"
}

Write-Output "=== LATEST ORDER ==="
$orders = Invoke-RestMethod -Uri "https://wvogrcteltoljtjvneyv.supabase.co/rest/v1/pedidos_online?order=created_at.desc&limit=1" -Headers $headers -Method Get
$orders | ConvertTo-Json -Compress
$order = $orders[0]

Write-Output "=== CLIENTE ==="
if ($null -ne $order.id_cliente) {
    try {
        $cliente = Invoke-RestMethod -Uri "https://wvogrcteltoljtjvneyv.supabase.co/rest/v1/clientes?select=*&id_cliente=eq.$($order.id_cliente)&limit=1" -Headers $headers -Method Get
        $cliente | ConvertTo-Json -Compress
    } catch {
        Write-Output "Error in cliente fetch: $_"
    }
}

Write-Output "=== DETALLES (NO JOIN) ==="
try {
    $details1 = Invoke-RestMethod -Uri "https://wvogrcteltoljtjvneyv.supabase.co/rest/v1/detalle_pedido_online?id_pedido=eq.$($order.id_pedido)&select=*" -Headers $headers -Method Get
    $details1 | ConvertTo-Json -Compress
} catch {
    Write-Output "Error in details no join: $_"
}

Write-Output "=== DETALLES (WITH JOIN) ==="
try {
    $details2 = Invoke-RestMethod -Uri "https://wvogrcteltoljtjvneyv.supabase.co/rest/v1/detalle_pedido_online?id_pedido=eq.$($order.id_pedido)&select=*,productos(*),producto_variantes(*)" -Headers $headers -Method Get
    $details2 | ConvertTo-Json -Compress
} catch {
    Write-Output "Error in details with join: $_"
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $reader.ReadToEnd()
    }
}
