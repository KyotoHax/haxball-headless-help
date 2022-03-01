/**
 * @author aazin#8560
 * @title Sistema de loja v3
 * @description  Sistema de loja + itens fáceis de editar + comando !pay quantidade playerName.
 * @version 3.0
 * @date 01/03/2022
 * @match https://www.haxball.com/headless
 * 
 * @contatos
 * 		Discord: https://discord.gg/UWYuxwEKfn
 * 		Site: https://haxballheadlesshelp.ueuo.com/
 * 		Github: https://github.com/hbenormous/haxball-headless-help
 * 
 * @links
 * 		Haxball Headless Host: https://www.haxball.com/headless
 * 
 * @comandos
 * 		!inv
 * 		Observação: Mostra os itens disponíveis + preços.
 * 
 * 		!shop
 * 		Observação: Mostra os itens disponíveis + preços.
 * 
 * 		!pay quantidade playerName
 * 		Observação: Você pode transferir dinheiro para outros jogadores.
 * 		Exemplo: !pay 5 aazin
 * 
 * 		!buy itemName
 * 		Observação: Com este comando você faz uma compra na loja.
 * 		Exemplo: !buy god
 * 
 * 		!god
 * 		Observação: Torna o seu personagem grande.
 * 
 * 		!ant
 * 		Observação: Ele torna seu personagem pequeno.
 */

// Definindo função HBInit
var room = HBInit({
	roomName: 'Haxball Headless Help',
	maxPlayers: 10,
	public: true,
	noPlayer: true
});

/**
 * @add_1: Para adicionar um item você precisa editar o "itensEstrutura" por exemplo: const itensEstrutura = {god: 0, ant: 0, exemplo: 0, money: 0};
 * @add_2: Depois disso, basta criar seu comando igual à linha 91.
 */

// Config itens.
const playerItens = new Map();
const moneyPorGol = 1; // Quantidade de money que o jogador receberá após marcar um gol.
const moneyPorGolContra = 1; // Quantidade de money que o jogador receberá após marcar um gol contra.

// Player que realizou o gol (importante)
var playerGol;

// Alias (opcional)
const aliasInv = ["!i", "!inv", "!inventario", "!itens", "!equipamentos", "!bolsa", "!equips"];
const aliasShop = ["!shop", "!loja", "!armazem", "!sh", "!mercado", "!s"];
const aliasPay = ["!pay", "!trans", "!transferir", "!doar", "!enviar"];

// Emojis (opcional)
const emoji = ["\uD83D\uDCB5", "\u26A0", "\u2714", "\uD83E\uDDF0"];

// Cores (opcional)
const cores = {
	amarelo: 0xFFFF00,
	verde: 0x00FF00
};

// Config money.
let converterDinheiroEmReais = numero => numero.toLocaleString("pt-BR", { minimumFractionDigits: 2 , style: 'currency', currency: 'BRL' });

/*
* ESTRUTURA DO SISTEMA DE ITENS
*/
class Itens extends Array{
	comando(comando){return this.find(x=>x.comando===comando);}
	nome(nome){return this.find(x=>x.nome===nome);}
	addItem(...x){this.push(...x);if(x.length===1)return x[0];else return x;}
}
class Item{
	constructor(item){this.comando=item.comando||null;this.nome=item.nome||null;this.valor=item.valor||null;this.oqueEleFaz=item.oqueEleFaz||function(player,message){};}
	executar(player,message){try{this.oqueEleFaz(player,message);}catch(erro){console.error(erro);}}
}
let item = new Itens();
/*
_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-
*/

/*
* ITENS
*/
// ant
item.addItem(new Item({
	comando:"!ant", // Comando para executar a ação.
	nome:"ant", // Nome de identificação do item (MUITO IMPORTANTE!).
	valor:5, // Preço para comprar o item (MUITO IMPORTANTE!).
	oqueEleFaz:(player, message)=>{ // A ação que seu comando fará.
		room.setPlayerDiscProperties(player.id, {radius: 10}); // Diminui o tamanho do player.
	}
}));

// god
item.addItem(new Item({
	comando:"!god",
	nome:"god",
	valor:2,
	oqueEleFaz:(player, message)=>{
		room.setPlayerDiscProperties(player.id, {radius: 20});
	}
}));
/*
_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-
*/

function compararItem(message) {
	if (item.nome(message)) return item.nome(message).nome;
}

function compararMoney(message) {
	if (item.nome(message)) return item.nome(message).valor;
}

function adicionar_item_ao_inventario(player, message) {
	if (item.nome(message)) {
		playerItens.get(player.name)[message] += 1;
		playerItens.get(player.name).money -= item.nome(message).valor;
	}
}

function loja(player, message) {
	if (compararItem(message)) {
		if (playerItens.get(player.name).money >= compararMoney(message)) {
			adicionar_item_ao_inventario(player, message);
			room.sendAnnouncement(`${emoji[2]} O item ${compararItem(message)} foi comprado por ${converterDinheiroEmReais(compararMoney(message))} money.`, player.id, cores.verde, "bold");
		}
		else {
			room.sendAnnouncement(`${emoji[1]} Você não tem money suficiente.`, player.id, cores.amarelo, "bold");
			room.sendAnnouncement(`${emoji[0]} ${converterDinheiroEmReais(playerItens.get(player.name).money)}`, player.id, cores.verde, "bold");
		}
	}
}

function pay(player, quantidade, paraQuem) {
	matchNumeros = quantidade.match(quantidade.replace(/[^0-9]/g));
	checkParaQuem = [];

	// Condições.
	conditionCheckMoney = playerItens.get(player.name).money <= quantidade && matchNumeros;
	conditionCheckParaQuemNaoInserido = matchNumeros && paraQuem == undefined;
	conditionCheckParaQuemExiste = matchNumeros && paraQuem != undefined;

	// Check parametro {quantidade}.
	// Verifica se o player digitou somente números no parametro quantidade.
	if (!matchNumeros) room.sendAnnouncement("Você só pode digitar números.", player.id, cores.amarelo, "bold");
	// Verifica se o player tem a quantidade de money escolhida para dar.
	if (conditionCheckMoney) room.sendAnnouncement("Você não tem esse dinheiro todo.", player.id, cores.amarelo, "bold");

	// Check parametro {paraQuem}
	// Verifica se o player digitou a quantidade de dinheiro em números.
	if (conditionCheckParaQuemNaoInserido) room.sendAnnouncement("Você não falou para quem é o dinheiro. Ex.: !pay 5 aazin", player.id, cores.amarelo, "bold");
	// Se o player para quem ele quer dar money nunca tiver entrado na sala.
	else if (conditionCheckParaQuemExiste) {
		if (playerItens.get(paraQuem) == undefined) room.sendAnnouncement(`${paraQuem} nunca entrou na sala.`, player.id, cores.amarelo, "bold");
		else checkParaQuem.push(paraQuem);
	}

	if (playerItens.get(player.name).money >= quantidade && checkParaQuem.length > 0) {
		if (player.name == paraQuem) room.sendAnnouncement("Você não pode dar dinheiro para si mesmo.", player.id, cores.amarelo, "bold");
		else {
			playerItens.get(paraQuem).money += Number(quantidade);
			playerItens.get(player.name).money -= Number(quantidade);
			room.sendAnnouncement(`Você deu ${emoji[0] + converterDinheiroEmReais(Number(quantidade))}, para o player ${paraQuem}`, player.id, cores.amarelo, "bold");
			room.sendAnnouncement(`Seu money: ${emoji[0] + converterDinheiroEmReais(playerItens.get(player.name).money)}`, player.id, cores.verde, "bold")
		}
	}
}

room.onPlayerChat = (player, message) => {
	espaco = message.split(" "); // filtra o espaço nas mensagem

	// Execute o comando de item armazenado.
	if(item.comando(message.toLowerCase())){
		if (playerItens.get(player.name)[message.slice(1)] >= 1) { // Se o item que está sendo chamado tiver uma quantidade maior ou igual a "1" ele executa o comando if.

			item.nome(message.slice(1)).executar(player, message.slice(1));

			playerItens.get(player.name)[message.slice(1)] -= 1; // Remova 1 item do player após o uso.
		}
		else { // Caso o player não tenha o item envie a mensagem abaixo.
			room.sendAnnouncement(`${emoji[1]} Você não possui esse item.`, player.id, cores.amarelo, "bold");
		}
		return false;
	}

	// !pay | Transfere seu dinheiro para o nick inserido.
	if (aliasPay.includes(espaco[0].toLowerCase())) {
		if (espaco[1] || espaco[2]) {
			pay(player, espaco[1], espaco[2]);
		}
		else {
			room.sendAnnouncement(`${aliasPay[0]} quantidade playerName\nEx.: ${aliasPay[0]} 4 aazin`, player.id, cores.amarelo, "bold");
		}
		return false;
	}

	// !shop | Mostra os itens disponíveis na loja junto com seus preços.
	if (aliasShop.includes(message.toLowerCase())) {
		for (const [chave, valor] of Object.entries(item)) {
			room.sendAnnouncement(`${emoji[3]}${valor["nome"]} => ${emoji[0]}${converterDinheiroEmReais(valor["valor"])}`, player.id, cores.amarelo, "bold");
		}
		return false;
	}

	// !buy itemName | Faça uma compra na loja com o item inserido.
	if (message.toLowerCase().substr(0, 5) == "!buy ") {
		loja(player, message.substr(5));
		return false;
	}

	// !inv | Mostra o inventário do player.
	if (aliasInv.includes(message.toLowerCase())) {
		for(const [chave, valor] of Object.entries(item)) {
			room.sendAnnouncement(`${emoji[3]}${valor["nome"]}: ${JSON.stringify(playerItens.get(player.name)[valor["nome"]])}`, player.id, cores.amarelo, "bold");
		}
		room.sendAnnouncement(`${emoji[0]}: ${converterDinheiroEmReais(playerItens.get(player.name).money)}`, player.id, cores.verde, "bold");
		return false;
	}
}

room.onPlayerBallKick = (player) => {
	playerGol = player;
}

room.onTeamGoal = (team) => {
	// Adicione dinheiro para cada gol marcado.
	if (team==playerGol.team) playerItens.get(playerGol.name).money+=moneyPorGol;
	// Gol contra = - <valor> money
	if (team!=playerGol.team) playerItens.get(playerGol.name).money-=moneyPorGolContra;
}

room.onPlayerJoin = (player) => {
	playerItens.get(player.name) ?
	false /* Se o player já tiver entrado na sala com aquele nick ele não faz nada. */
	:
	playerItens.set(player.name, {god: 0, ant: 0, money: 0}); /* Add os atributos abaixo se o nick dele não constar na constante itens. */
}