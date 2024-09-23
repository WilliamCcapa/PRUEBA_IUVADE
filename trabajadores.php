<?php
$host = "localhost";
$dbname = "Prueba_IUVADE";
$user = "postgres";
$password = "1234";

try {
    $db = new PDO("pgsql:host=$host;dbname=$dbname", $user, $password);

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // Obtener lista de trabajadores activos
        $stmt = $db->query("SELECT * FROM prueba.trabajador WHERE est_ado = 1");
        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if ($data) {
            echo json_encode(['success' => true, 'data' => $data]);
        } else {
            echo json_encode(['success' => false, 'message' => 'No se encontraron trabajadores.']);
        }

    } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
        if (isset($_POST['action']) && $_POST['action'] === 'delete') {
            // Acción de eliminación - solo cambiar el estado
            $tra_ide = $_POST['tra_ide'] ?? null;
            if ($tra_ide) {
                $stmt = $db->prepare("UPDATE prueba.trabajador SET est_ado = 0 WHERE tra_ide = ?");
                $stmt->execute([$tra_ide]);
                echo json_encode(['success' => true, 'message' => 'Trabajador marcado como inactivo.']);
            } else {
                echo json_encode(['success' => false, 'message' => 'ID del trabajador no proporcionado.']);
            }
        } else {
            // Acción de creación o actualización
            $tra_ide = $_POST['tra_ide'] ?? null;
            $tra_cod = $_POST['tra_cod'] ?? null;
            $tra_nom = $_POST['tra_nom'] ?? null;
            $tra_pat = $_POST['tra_pat'] ?? null;
            $tra_mat = $_POST['tra_mat'] ?? null;

            if ($tra_ide) {
                // Actualizar trabajador
                $stmt = $db->prepare("UPDATE prueba.trabajador SET tra_cod = ?, tra_nom = ?, tra_pat = ?, tra_mat = ? WHERE tra_ide = ?");
                $stmt->execute([$tra_cod, $tra_nom, $tra_pat, $tra_mat, $tra_ide]);
                echo json_encode(['success' => true, 'message' => 'Trabajador actualizado correctamente.']);
            } else {
                // Insertar nuevo trabajador
                $stmt = $db->prepare("INSERT INTO prueba.trabajador (tra_cod, tra_nom, tra_pat, tra_mat) VALUES (?, ?, ?, ?)");
                $stmt->execute([$tra_cod, $tra_nom, $tra_pat, $tra_mat]);
                echo json_encode(['success' => true, 'message' => 'Trabajador insertado correctamente.']);
            }
        }
    }
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}
