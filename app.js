Ext.onReady(function () {
  var trabajadorStore = Ext.create("Ext.data.Store", {
    fields: ["tra_ide", "tra_cod", "tra_nom", "tra_pat", "tra_mat", "est_ado"],
    proxy: {
      type: "ajax",
      url: "trabajadores.php",
      reader: { type: "json", root: "data" },
    },
    autoLoad: true,
  });

  var formTrabajador = Ext.create("Ext.form.Panel", {
    title: "Datos del Trabajador",
    bodyPadding: 20,
    defaultType: "textfield",
    style: { borderColor: "#000000" },
    items: [
      { fieldLabel: "Código", name: "tra_cod" },
      { fieldLabel: "Nombre", name: "tra_nom" },
      { fieldLabel: "Apellido Paterno", name: "tra_pat" },
      { fieldLabel: "Apellido Materno", name: "tra_mat" },
      { xtype: "hidden", name: "tra_ide" },
    ],
    buttons: [
      {
        text: "Guardar",
        cls: 'boton-personalizado',  
        handler: function () {
          var formData = formTrabajador.getForm().getValues();
          console.log(formData);
          Ext.Ajax.request({
            url: "trabajadores.php",
            method: "POST",
            params: formData,
            success: function (response) {
              var jsonResponse = Ext.decode(response.responseText);
              if (jsonResponse.success) {
                trabajadorStore.load(); 
                Ext.Msg.alert("Éxito", "Datos guardados correctamente.");
              } else {
                Ext.Msg.alert(
                  "Error",
                  jsonResponse.message || "Error al guardar."
                );
              }
            },
            failure: function () {
              Ext.Msg.alert(
                "Error",
                "Hubo un problema al comunicarse con el servidor."
              );
            },
          });
        },
      },
    ],
  });

  var gridTrabajador = Ext.create("Ext.grid.Panel", {
    title: "Trabajadores",
    store: trabajadorStore,
    columns: [
      { text: "ID", dataIndex: "tra_ide", width: 50 },
      { text: "Código", dataIndex: "tra_cod", width: 100 },
      { text: "Nombre", dataIndex: "tra_nom", width: 150 },
      { text: "Apellido Paterno", dataIndex: "tra_pat", width: 150 },
      { text: "Apellido Materno", dataIndex: "tra_mat", width: 150 },
      { text: "Estado", dataIndex: "est_ado", width: 50 },
    ],
    height: 300,
    width: 650,
    viewConfig: {
      emptyText: "No hay trabajadores disponibles.",
      deferEmptyText: false,
    },
    tbar: [
      {
        text: "Nuevo",
        handler: function () {
          formTrabajador.getForm().reset();
        },
      },
      {
        text: "Modificar",
        handler: function () {
          var selected = gridTrabajador.getSelectionModel().getSelection();
          if (selected.length > 0) {
            formTrabajador.getForm().setValues(selected[0].data);
          } else {
            Ext.Msg.alert(
              "Advertencia",
              "Por favor, selecciona un trabajador para modificar."
            );
          }
        },
      },
      {
        text: "Eliminar",
        handler: function () {
          var selected = gridTrabajador.getSelectionModel().getSelection()[0];
          if (selected) {
            Ext.Ajax.request({
              url: "trabajadores.php",
              method: "POST",
              params: { tra_ide: selected.get("tra_ide"), action: "delete" },
              success: function (response) {
                var jsonResponse = Ext.decode(response.responseText);
                if (jsonResponse.success) {
                  trabajadorStore.load();
                  Ext.Msg.alert("Éxito", "Trabajador eliminado correctamente.");
                } else {
                  Ext.Msg.alert(
                    "Error",
                    jsonResponse.message || "Error al eliminar."
                  );
                }
              },
              failure: function () {
                Ext.Msg.alert(
                  "Error",
                  "Hubo un problema al comunicarse con el servidor."
                );
              },
            });
          }
        },
      },
    ],
  });
//Modulo de ventas
  var ventaStore = Ext.create("Ext.data.Store", {
    fields: ["ven_ide", "ven_ser", "ven_num", "ven_cli", "ven_mon"],
    proxy: {
      type: "ajax",
      url: "ventas.php", 
      reader: { type: "json", root: "data" },
    },
    autoLoad: true,
  });

  var detalleContainer = Ext.create("Ext.form.FieldSet", {
    title: "Detalles de Ventas",
    itemId: "detalleContainer", 
    layout: "anchor",
    defaults: {
      anchor: "100%",
    },
    items: [], 
  });

  var formVenta = Ext.create("Ext.form.Panel", {
    title: "Datos de la Venta",
    bodyPadding: 10,
    defaultType: "textfield",
    items: [
      { fieldLabel: "Serie", name: "ven_ser", allowBlank: false },
      { fieldLabel: "Número", name: "ven_num", allowBlank: false },
      { fieldLabel: "Cliente", name: "ven_cli", allowBlank: false },
      {
        xtype: "numberfield",
        fieldLabel: "Monto",
        name: "ven_mon",
        minValue: 0,
        allowBlank: false,
      },
      { xtype: "hidden", name: "ven_ide" }, 

      detalleContainer,
    ],
    buttons: [
      {
        text: "Agregar Detalle",
        handler: function () {
          var detalleExistente = detalleContainer.items.findBy(function (item) {
            return item.title === "Detalle de Venta";
          });

          if (detalleExistente) {
            Ext.Msg.alert("Advertencia", "Ya hay un detalle abierto.");
            return; 
          }
          var nuevoDetalle = {
            xtype: "fieldset",
            title: "Detalle de Venta",
            layout: "anchor", 
            height: 150,
            width: 650,
            items: [
              {
                fieldLabel: "Producto",
                name: "v_d_pro",
                xtype: "textfield",
                anchor: "100%", 
              },
              {
                fieldLabel: "Cantidad",
                name: "v_d_can",
                xtype: "numberfield",
                minValue: 0,
                anchor: "100%",
              },
              {
                fieldLabel: "Unidad",
                name: "v_d_uni",
                xtype: "numberfield",
                minValue: 0,
                anchor: "100%",
              },
              {
                fieldLabel: "Total",
                name: "v_d_tot",
                xtype: "displayfield",
                anchor: "100%",
              },
            ],
          };

          // Añadir el nuevo conjunto de campos al contenedor de detalles
          detalleContainer.add(nuevoDetalle);
        },
      },

      {
        text: "Guardar Venta",
        handler: function () {
          var formData = formVenta.getForm().getValues();
          var detallesData = [];

          // Recopilar los detalles dinámicos del formulario
          detalleContainer.items.each(function (fieldset) {
            var detalle = {
              v_d_pro: fieldset.down("[name=v_d_pro]").getValue(),
              v_d_can: fieldset.down("[name=v_d_can]").getValue(),
              v_d_uni: fieldset.down("[name=v_d_uni]").getValue(),
              v_d_tot: fieldset.down("[name=v_d_tot]").getValue(),
            };
            detallesData.push(detalle);
          });

          if (detallesData.length === 0) {
            Ext.Msg.alert(
              "Error",
              "Debe agregar al menos un detalle a la venta."
            );
            return;
          }

          Ext.Ajax.request({
            url: "ventas.php",
            method: "POST",
            params: {
              venta: Ext.encode(formData), 
              detalles: Ext.encode(detallesData), 
            },
            success: function (response) {
              var jsonResponse = Ext.decode(response.responseText);
              if (jsonResponse.success) {
                ventaStore.load(); 
                Ext.Msg.alert(
                  "Éxito",
                  jsonResponse.message || "Venta guardada correctamente."
                );
              } else {
                Ext.Msg.alert(
                  "Error",
                  jsonResponse.message || "Error al guardar la venta."
                );
              }
            },
            failure: function () {
              Ext.Msg.alert(
                "Error",
                "Hubo un problema al comunicarse con el servidor."
              );
            },
          });
        },
      },
    ],
  });

  var gridVenta = Ext.create("Ext.grid.Panel", {
    title: "Ventas",
    store: ventaStore,
    columns: [
      { text: "ID", dataIndex: "ven_ide", width: 50 },
      { text: "Serie", dataIndex: "ven_ser", width: 100 },
      { text: "Número", dataIndex: "ven_num", width: 150 },
      { text: "Cliente", dataIndex: "ven_cli", width: 150 },
      { text: "Monto", dataIndex: "ven_mon", width: 100 },
    ],
    height: 300,
    width: 600,
    viewConfig: {
      emptyText: "No hay ventas disponibles.",
      deferEmptyText: false,
    },
    listeners: {
      itemclick: function (view, record) {
        formVenta.getForm().setValues(record.data);
        detalleContainer.removeAll();
        Ext.Ajax.request({
          url: "ventas.php",
          method: "GET",
          params: { action: "getVentaDetalle", ven_ide: record.get("ven_ide") },
          success: function (response) {
            var detalles = Ext.decode(response.responseText).data;
            Ext.Array.each(detalles, function (detalle) {
              var nuevoDetalle = {
                xtype: "fieldset",
                title: "Detalles de Ventas",
                height: 150,
                width: 650,
                items: [
                  {
                    fieldLabel: "Producto",
                    name: "v_d_pro",
                    xtype: "textfield",
                    value: detalle.v_d_pro,
                    anchor: "100%",
                  },
                  {
                    fieldLabel: "Cantidad",
                    name: "v_d_can",
                    xtype: "numberfield",
                    value: detalle.v_d_can,
                    anchor: "100%",
                  },
                  {
                    fieldLabel: "Unidad",
                    name: "v_d_uni",
                    xtype: "numberfield",
                    value: detalle.v_d_uni,
                    anchor: "100%",
                  },
                  {
                    fieldLabel: "Total",
                    name: "v_d_tot",
                    xtype: "displayfield",
                    value: detalle.v_d_tot,
                    anchor: "100%",
                  },
                ],
              };
              detalleContainer.add(nuevoDetalle); 
            });
          },
        });
      },
    },
    tbar: [
      {
        text: "Nuevo",
        handler: function () {
          formVenta.getForm().reset();
          detalleContainer.removeAll(); 
        },
      },
      {
        text: "Modificar",
        handler: function () {
          var selected = gridVenta.getSelectionModel().getSelection();
          if (selected.length > 0) {
            formVenta.getForm().setValues(selected[0].data);
            detalleContainer.removeAll(); 
            Ext.Ajax.request({
              url: "ventas.php",
              method: "GET",
              params: {
                action: "getVentaDetalle",
                ven_ide: selected[0].get("ven_ide"),
              },
              success: function (response) {
                var detalles = Ext.decode(response.responseText).data;
                Ext.Array.each(detalles, function (detalle) {
                  var nuevoDetalle = {
                    xtype: "fieldset",
                    title: "Detalle de Venta",
                    layout: "hbox",
                    items: [
                      {
                        fieldLabel: "Producto",
                        name: "v_d_pro",
                        xtype: "textfield",
                        value: detalle.v_d_pro,
                      },
                      {
                        fieldLabel: "Cantidad",
                        name: "v_d_can",
                        xtype: "numberfield",
                        value: detalle.v_d_can,
                      },
                      {
                        fieldLabel: "Unidad",
                        name: "v_d_uni",
                        xtype: "numberfield",
                        value: detalle.v_d_uni,
                      },
                      {
                        fieldLabel: "Total",
                        name: "v_d_tot",
                        xtype: "displayfield",
                        value: detalle.v_d_tot,
                        fex: 1,
                      },
                    ],
                  };
                  detalleContainer.add(nuevoDetalle); 
                });
              },
            });
          } else {
            Ext.Msg.alert(
              "Advertencia",
              "Por favor, selecciona una venta para modificar."
            );
          }
        },
      },
      {
        text: "Eliminar",
        handler: function () {
          var selected = gridVenta.getSelectionModel().getSelection()[0];
          if (selected) {
            Ext.Ajax.request({
              url: "ventas.php",
              method: "POST",
              params: { ven_ide: selected.get("ven_ide"), action: "delete" },
              success: function (response) {
                var jsonResponse = Ext.decode(response.responseText);
                if (jsonResponse.success) {
                  ventaStore.load();
                  detalleContainer.removeAll(); 
                  Ext.Msg.alert(
                    "Éxito",
                    jsonResponse.message || "Venta eliminada correctamente."
                  );
                } else {
                  Ext.Msg.alert(
                    "Error",
                    jsonResponse.message || "Error al eliminar la venta."
                  );
                }
              },
              failure: function () {
                Ext.Msg.alert(
                  "Error",
                  "Hubo un problema al comunicarse con el servidor."
                );
              },
            });
          }
        },
      },
    ],
  });

  Ext.create("Ext.container.Viewport", {
    layout: "fit",
    items: [
      {
        xtype: "tabpanel",
        items: [
          {
            title: "Trabajadores",
            layout: {
              type: "vbox",
              align: "center",
            },
            items: [formTrabajador, gridTrabajador],
            autoScroll: true,
          },
          {
            title: "Ventas",
            layout: {
              type: "vbox",
              align: "center",
            },
            items: [formVenta, gridVenta],
          },
        ],
      },
    ],
  });
});
