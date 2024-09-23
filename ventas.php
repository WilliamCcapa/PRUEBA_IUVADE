<?php
$host = "localhost";
$dbname = "Prueba_IUVADE";
$user = "postgres";
$password = "1234";

try {
    $db = new PDO("pgsql:host=$host;dbname=$dbname", $user, $password);

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        if (isset($_GET['action']) && $_GET['action'] === 'getVentaDetalle') {
            $ven_ide = $_GET['ven_ide'] ?? null;
            if ($ven_ide) {
                $stmt = $db->prepare("SELECT * FROM prueba.venta_detalle WHERE ven_ide = ? AND est_ado = 1");
                $stmt->execute([$ven_ide]);
                $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode(['success' => true, 'data' => $data]);
            } else {
                echo json_encode(['success' => false, 'message' => 'ID de la venta no proporcionado.']);
            }
        } else {
            $stmt = $db->query("SELECT * FROM prueba.venta WHERE 1 = 1");
            $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(['success' => true, 'data' => $data]);
        }
    } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
        if (isset($_POST['action']) && $_POST['action'] === 'delete') {
            $ven_ide = $_POST['ven_ide'] ?? null;
            if ($ven_ide) {
                $stmt = $db->prepare("UPDATE prueba.venta_detalle SET est_ado = 0 WHERE ven_ide = ?");
                $stmt->execute([$ven_ide]);
                echo json_encode(['success' => true, 'message' => 'Venta eliminada correctamente.']);
            } else {
                echo json_encode(['success' => false, 'message' => 'ID de la venta no proporcionado.']);
            }
        } else {
            // Crear o actualizar la venta (cabecera y detalles)
            $venta = json_decode($_POST['venta'], true);  // Decodificar cabecera de la venta
            $detalles = json_decode($_POST['detalles'], true);  // Decodificar detalles de la venta
    
            // Cabecera de venta
            $ven_ide = $venta['ven_ide'] ?? null;
            $ven_ser = $venta['ven_ser'] ?? null;
            $ven_num = $venta['ven_num'] ?? null;
            $ven_cli = $venta['ven_cli'] ?? null;
            $ven_mon = $venta['ven_mon'] ?? null;
    
            if ($ven_ide) {
                // Actualizar venta
                $stmt = $db->prepare("UPDATE prueba.venta SET ven_ser = ?, ven_num = ?, ven_cli = ?, ven_mon = ? WHERE ven_ide = ?");
                $stmt->execute([$ven_ser, $ven_num, $ven_cli, $ven_mon, $ven_ide]);
    
                // Actualizar o insertar los detalles
                foreach ($detalles as $detalle) {
                    $v_d_ide = $detalle['v_d_ide'] ?? null;
                    $v_d_pro = $detalle['v_d_pro'] ?? null;
                    $v_d_uni = $detalle['v_d_uni'] ?? null;
                    $v_d_can = $detalle['v_d_can'] ?? null;
                    $v_d_tot = $v_d_can * $v_d_uni; // Calcular total
    
                    if ($v_d_ide) {
                        // Actualizar detalle existente
                        $stmt = $db->prepare("UPDATE prueba.venta_detalle SET v_d_pro = ?, v_d_uni = ?, v_d_can = ?, v_d_tot = ? WHERE v_d_ide = ?");
                        $stmt->execute([$v_d_pro, $v_d_uni, $v_d_can, $v_d_tot, $v_d_ide]);
                    } else {
                        // Insertar nuevo detalle
                        $stmt = $db->prepare("INSERT INTO prueba.venta_detalle (ven_ide, v_d_pro, v_d_uni, v_d_can, v_d_tot) VALUES (?, ?, ?, ?, ?)");
                        $stmt->execute([$ven_ide, $v_d_pro, $v_d_uni, $v_d_can, $v_d_tot]);
                    }
                }
    
                echo json_encode(['success' => true, 'message' => 'Venta actualizada correctamente.']);
            } else {
                // Insertar nueva venta
                $stmt = $db->prepare("INSERT INTO prueba.venta (ven_ser, ven_num, ven_cli, ven_mon) VALUES (?, ?, ?, ?)");
                $stmt->execute([$ven_ser, $ven_num, $ven_cli, $ven_mon]);
                $ven_ide = $db->lastInsertId();  // Obtener el ID de la nueva venta
    
                // Insertar los detalles de la nueva venta
                foreach ($detalles as $detalle) {
                    $v_d_pro = $detalle['v_d_pro'] ?? null;
                    $v_d_uni = $detalle['v_d_uni'] ?? null;
                    $v_d_can = $detalle['v_d_can'] ?? null;
                    $v_d_tot = $v_d_can * $v_d_uni; // Calcular total
    
                    $stmt = $db->prepare("INSERT INTO prueba.venta_detalle (ven_ide, v_d_pro, v_d_uni, v_d_can, v_d_tot) VALUES (?, ?, ?, ?, ?)");
                    $stmt->execute([$ven_ide, $v_d_pro, $v_d_uni, $v_d_can, $v_d_tot]);
                }
    
                echo json_encode(['success' => true, 'message' => 'Venta insertada correctamente.']);
            }
        }
    }
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
