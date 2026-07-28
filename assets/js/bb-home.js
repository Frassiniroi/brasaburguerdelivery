/* ============================================================
   BRASA BURGUER — scripts da página inicial
   Prova social (toasts) e seletor de localização (localStorage).
   ============================================================ */

(function () {
	"use strict";

	/* ---------- Prova social (toasts) ---------- */

	var bbFrases = [
		"🎉 <b>Lucas</b> acabou de pedir o 2X Combo Crispy Bacon com entrega grátis!",
		"🚀 <b>Ana</b> garantiu o Combo Família 5 Lanches com refrigerante!",
		"🍔 <b>Rafaela</b> finalizou o pedido do Rodízio em Casa agora mesmo!",
		"🔥 <b>Fernando</b> aproveitou o combo com -50% e já está aguardando a entrega!",
		"😋 <b>Isabela</b> pediu o Combo Trio Smash e levou Coca-Cola 2L grátis!",
		"⏳ <b>Bruno</b> aproveitou a promoção do Combo Solteiro agora!",
		"📦 <b>João</b> pediu o Classic Smash Burguer com fritas e Coca-Cola!",
		"🏆 <b>Mirella</b> garantiu o Combo Família antes que acabasse!",
		"🚨 <b>Atenção</b>! Mais de <b>15 pedidos</b> nos últimos 10 minutos!",
		"🔥 Nas últimas 2 horas, 37 pessoas aproveitaram os combos com desconto!",
		"⚡ Acabamos de bater 100 pedidos de hambúrguer só hoje!",
		"⏳ Apenas 4 unidades do Combo Crispy Bacon restantes! Corra!",
		"🚀 +20 pedidos feitos nos últimos 30 minutos! Aproveite!",
		"🍔 Os combos estão esgotando rápido! Garanta o seu agora!",
		"🎯 Mais de 250 clientes satisfeitos nos últimos 7 dias!",
		"❤️ Obrigado! Mais de 500 pedidos já saíram esse mês!",
		"🚀 Só hoje, 73 clientes garantiram seu combo com desconto!",
		"⏳ O estoque da promoção está quase esgotando! Últimas unidades!",
		"🎉 Promoção de hambúrguer está fazendo sucesso! +40 pedidos só hoje!"
	];

	function bbMostrarNotificacao() {
		if (typeof Swal === "undefined" || Swal.isVisible()) return;
		var frase = bbFrases[Math.floor(Math.random() * bbFrases.length)];
		Swal.mixin({
			toast: true,
			position: "bottom-end",
			showConfirmButton: false,
			timer: 6500,
			timerProgressBar: true
		}).fire({ icon: "success", title: frase });
	}

	setTimeout(function () {
		bbMostrarNotificacao();
		setInterval(bbMostrarNotificacao, 25000);
	}, 8000);

	/* ---------- Localização (localStorage primário + cookie reserva) ---------- */

	function bbSalvar(nome, valor) {
		try { localStorage.setItem(nome, valor); } catch (e) { }
		try {
			var validade = new Date(Date.now() + 365 * 864e5).toUTCString();
			document.cookie = nome + "=" + encodeURIComponent(valor) + "; expires=" + validade + "; path=/";
		} catch (e) { }
	}

	function bbLer(nome) {
		try {
			var v = localStorage.getItem(nome);
			if (v) return v;
		} catch (e) { }
		try {
			var achado = "";
			document.cookie.split("; ").forEach(function (c) {
				var partes = c.split("=");
				if (partes[0] === nome) achado = decodeURIComponent(partes.slice(1).join("="));
			});
			return achado;
		} catch (e) { return ""; }
	}

	function bbAtualizarLocal() {
		var cidade = bbLer("bbCidade");
		var uf = bbLer("bbEstado");
		if (cidade) {
			document.querySelectorAll(".bb-local-cidade").forEach(function (el) { el.textContent = cidade; });
		}
		if (uf) {
			document.querySelectorAll(".bb-local-uf").forEach(function (el) { el.textContent = uf; });
		}
	}

	var BB_ESTADOS = {
		"Rondônia": "RO", "Acre": "AC", "Amazonas": "AM", "Roraima": "RR", "Pará": "PA",
		"Amapá": "AP", "Tocantins": "TO", "Maranhão": "MA", "Piauí": "PI", "Ceará": "CE",
		"Rio Grande do Norte": "RN", "Paraíba": "PB", "Pernambuco": "PE", "Alagoas": "AL", "Sergipe": "SE",
		"Bahia": "BA", "Minas Gerais": "MG", "Espírito Santo": "ES", "Rio de Janeiro": "RJ", "São Paulo": "SP",
		"Paraná": "PR", "Santa Catarina": "SC", "Rio Grande do Sul": "RS", "Mato Grosso do Sul": "MS",
		"Mato Grosso": "MT", "Goiás": "GO", "Distrito Federal": "DF"
	};

	var BB_UF_NOMES = {};
	Object.keys(BB_ESTADOS).forEach(function (nome) { BB_UF_NOMES[BB_ESTADOS[nome]] = nome; });

	function bbBuscarIP() {
		return fetch("https://get.geojs.io/v1/ip/geo.json")
			.then(function (r) { return r.json(); })
			.then(function (d) {
				return { cidade: d.city || "", regiao: d.region || "" };
			})
			.catch(function () {
				return { cidade: "", regiao: "" };
			});
	}

	async function bbEscolherLocal() {
		bbAtualizarLocal();

		if (bbLer("bbCidade") && bbLer("bbEstado")) return;
		if (typeof Swal === "undefined") return;

		var geo = await bbBuscarIP();
		var ufSugerida = BB_ESTADOS[geo.regiao] || "";

		var estadoEscolhido = (await Swal.fire({
			title: "Procure a loja mais próxima de você!",
			text: "Escolha seu estado:",
			input: "select",
			inputOptions: BB_UF_NOMES,
			inputPlaceholder: "Escolha seu estado",
			inputValue: ufSugerida,
			confirmButtonText: "Próximo",
			confirmButtonColor: "#000000",
			allowOutsideClick: false,
			allowEscapeKey: false,
			inputValidator: function (v) { return v ? undefined : "Por favor, escolha seu estado."; }
		})).value;

		bbSalvar("bbEstado", estadoEscolhido);

		var cidadesUF = [];
		if (typeof BB_CIDADES !== "undefined") {
			BB_CIDADES.forEach(function (item) {
				if (item[0] === estadoEscolhido) cidadesUF.push(item[1]);
			});
		}

		var indiceCidade = (await Swal.fire({
			title: "Estamos quase lá...",
			text: "Agora, selecione sua cidade:",
			input: "select",
			inputOptions: cidadesUF,
			inputValue: cidadesUF.indexOf(geo.cidade),
			confirmButtonText: "Procurar loja mais próxima!",
			confirmButtonColor: "#000000",
			allowOutsideClick: false,
			allowEscapeKey: false,
			inputValidator: function (v) { return v ? undefined : "Por favor, escolha sua cidade."; }
		})).value;

		var cidadeEscolhida = cidadesUF[indiceCidade];
		bbSalvar("bbCidade", cidadeEscolhida);

		Swal.fire({
			title: "Procurando a loja mais próxima...",
			html: "Procurando a loja mais próxima de você em <b>" + cidadeEscolhida + "</b>...",
			timer: 5000,
			timerProgressBar: true,
			allowOutsideClick: false,
			didOpen: function () { Swal.showLoading(); }
		}).then(function () {
			Swal.fire({
				html: "A loja mais próxima fica a <b>1,6km</b> de você! Seu pedido chegará entre 30 a 50 minutos.",
				icon: "success",
				confirmButtonText: "Olhar cardápio de ofertas!",
				confirmButtonColor: "#000000",
				allowOutsideClick: false
			}).then(bbAtualizarLocal);
		});
	}

	bbEscolherLocal();
})();
