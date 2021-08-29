const { Player } = require("discord-player");
const { client } = require("./client.ts");

const player = new Player(client);

module.exports = { player };
