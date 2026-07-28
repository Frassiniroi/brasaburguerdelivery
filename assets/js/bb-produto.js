/* ============================================================
   BRASA BURGUER — scripts da página de produto
   Seleção de extras com limite por grupo, cálculo do total,
   contador de observação e fluxo de finalização (SweetAlert2).
   ============================================================ */

(function () {
	"use strict";

	var bbFormatoBRL = function (v) {
		return v.toLocaleString("pt-br", { style: "currency", currency: "BRL" });
	};

	/* ---------- Total do produto ---------- */

	function bbCalcularTotal() {
		var base = parseFloat(document.getElementById("bbPrecoBase").dataset.bbPreco) || 0;
		var extras = 0;

		document.querySelectorAll(".bb-opcao").forEach(function (opcao) {
			var qtde = parseInt(opcao.querySelector(".bb-qtde input").value, 10) || 0;
			var preco = parseFloat(opcao.dataset.bbPreco) || 0;
			extras += qtde * preco;
		});

		var total = base + extras;
		document.getElementById("bbTotal").textContent = bbFormatoBRL(total);
	}

	/* ---------- Contadores e limites por grupo ---------- */

	function bbAtualizarGrupo(grupo) {
		var maximo = parseInt(grupo.dataset.bbMax, 10) || 99;
		var contador = 0;

		grupo.querySelectorAll(".bb-qtde input").forEach(function (input) {
			contador += parseInt(input.value, 10) || 0;
		});

		grupo.querySelector(".bb-grupo-contador").textContent = contador;
		grupo.classList.toggle("bb-completo", contador > 0);

		var lotado = contador >= maximo;
		grupo.querySelectorAll(".bb-btn-mais").forEach(function (btn) {
			btn.disabled = lotado;
		});
	}

	document.querySelectorAll(".bb-grupo").forEach(function (grupo) {
		grupo.addEventListener("click", function (e) {
			var mais = e.target.closest(".bb-btn-mais");
			var menos = e.target.closest(".bb-btn-menos");
			if (!mais && !menos) return;

			var input = e.target.closest(".bb-qtde").querySelector("input");
			var valor = parseInt(input.value, 10) || 0;

			if (mais) {
				var maximo = parseInt(grupo.dataset.bbMax, 10) || 99;
				var total = 0;
				grupo.querySelectorAll(".bb-qtde input").forEach(function (i) {
					total += parseInt(i.value, 10) || 0;
				});
				if (total >= maximo) return;
				input.value = valor + 1;
			} else if (menos && valor > 0) {
				input.value = valor - 1;
			}

			bbAtualizarGrupo(grupo);
			bbCalcularTotal();
		});

		bbAtualizarGrupo(grupo);
	});

	bbCalcularTotal();

	/* ---------- Contador da observação ---------- */

	var bbObs = document.getElementById("bbObservacao");
	if (bbObs) {
		var bbObsContador = document.getElementById("bbObsContador");
		bbObs.addEventListener("input", function () {
			bbObsContador.textContent = bbObs.value.length;
		});
	}

	/* ---------- Finalização do pedido ---------- */

	window.bbFinalizar = function () {
		var destino = document.getElementById("bbCheckout").getAttribute("href");

		Swal.fire({
			title: "Deseja que entregamos agora?",
			showDenyButton: true,
			showCancelButton: false,
			allowOutsideClick: false,
			icon: "question",
			confirmButtonText: "Sim, por favor!",
			confirmButtonColor: "#1E8449",
			denyButtonText: "Não, quero agendar a entrega!",
			focusConfirm: true
		}).then(function (resultado) {
			if (resultado.isConfirmed) {
				location.href = destino;
			} else if (resultado.isDenied) {
				Swal.fire({
					title: "Selecione o dia e a hora, por gentileza!",
					text: "Deixe seu pedido agendado e receba na hora combinada.",
					confirmButtonText: "Agendar pedido!",
					confirmButtonColor: "#1E8449",
					showCancelButton: false,
					allowOutsideClick: false,
					input: "datetime-local"
				}).then(function () {
					location.href = destino;
				});
			}
		});
	};
})();
