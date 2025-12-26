var cartId = null;
var currentRemoveProductId = null;

function initCart(id) {
  cartId = id;
}

function showAlert(message, type) {
  if (!type) type = "success";
  var icon = type === "success" ? "check-circle" : "exclamation-circle";
  var html =
    '<div class="alert alert-' +
    type +
    ' alert-dismissible fade show" role="alert">';
  html += '<i class="fas fa-' + icon + ' me-2"></i>' + message;
  html +=
    '<button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>';
  document.getElementById("alertContainer").innerHTML = html;
  setTimeout(function () {
    var el = document.querySelector("#alertContainer .alert");
    if (el) el.remove();
  }, 5000);
}

function updateQuantity(productId, currentQty, change) {
  var newQty = currentQty + change;
  if (newQty < 1) {
    removeFromCart(productId, "");
    return;
  }
  var url = "/api/carts/" + cartId + "/products/" + productId;
  fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ quantity: newQty }),
  })
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      if (data.status === "success") {
        window.location.reload();
      } else {
        showAlert(data.message || "Error al actualizar cantidad", "danger");
      }
    })
    .catch(function (err) {
      showAlert("Error de conexion: " + err.message, "danger");
    });
}

function removeFromCart(productId, productName) {
  currentRemoveProductId = productId;
  if (productName && productName.length > 0) {
    document.getElementById("removeProductName").textContent = productName;
    var modal = new bootstrap.Modal(document.getElementById("removeModal"));
    modal.show();
  } else {
    confirmRemove();
  }
}

function confirmRemove() {
  if (!currentRemoveProductId) return;
  var url = "/api/carts/" + cartId + "/products/" + currentRemoveProductId;
  fetch(url, { method: "DELETE" })
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      if (data.status === "success") {
        window.location.reload();
      } else {
        showAlert(data.message || "Error al eliminar producto", "danger");
      }
    })
    .catch(function (err) {
      showAlert("Error de conexion: " + err.message, "danger");
    });
}

function clearCart() {
  if (!confirm("Estas seguro de que deseas vaciar el carrito?")) return;
  fetch("/api/carts/" + cartId, { method: "DELETE" })
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      if (data.status === "success") {
        showAlert("Carrito vaciado correctamente");
        setTimeout(function () {
          window.location.reload();
        }, 1000);
      } else {
        showAlert(data.message || "Error al vaciar el carrito", "danger");
      }
    })
    .catch(function (err) {
      showAlert("Error de conexion: " + err.message, "danger");
    });
}

function finalizePurchase() {
  var btn = document.getElementById("purchaseBtn");
  btn.disabled = true;
  btn.innerHTML =
    '<span class="spinner-border spinner-border-sm me-2"></span>Procesando...';

  fetch("/api/carts/" + cartId + "/purchase", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  })
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      if (data.status === "success") {
        var ticket = data.ticket;
        var details = "<strong>Ticket #" + ticket.code + "</strong><br>";
        details +=
          "<small>Total: $" + Number(ticket.amount).toFixed(2) + "</small><br>";
        details +=
          "<small>Fecha: " +
          new Date(ticket.purchase_datetime).toLocaleString() +
          "</small>";
        document.getElementById("ticketDetails").innerHTML = details;

        if (data.productsNotProcessed && data.productsNotProcessed.length > 0) {
          document
            .getElementById("notProcessedWarning")
            .classList.remove("d-none");
          document.getElementById("notProcessedText").textContent =
            "Algunos productos no pudieron procesarse por falta de stock.";
        }

        var modal = new bootstrap.Modal(
          document.getElementById("purchaseModal")
        );
        modal.show();
        document
          .getElementById("purchaseModal")
          .addEventListener("hidden.bs.modal", function () {
            window.location.reload();
          });
      } else {
        showAlert(data.message || "Error al procesar la compra", "danger");
        btn.disabled = false;
        btn.innerHTML =
          '<i class="fas fa-credit-card me-2"></i>Finalizar Compra';
      }
    })
    .catch(function (err) {
      showAlert("Error de conexion: " + err.message, "danger");
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-credit-card me-2"></i>Finalizar Compra';
    });
}

document.addEventListener("DOMContentLoaded", function () {
  var confirmBtn = document.getElementById("confirmRemoveBtn");
  if (confirmBtn) {
    confirmBtn.addEventListener("click", function () {
      bootstrap.Modal.getInstance(
        document.getElementById("removeModal")
      ).hide();
      confirmRemove();
    });
  }
});
