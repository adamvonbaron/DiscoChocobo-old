const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("skip")
    .setDescription("skip current track in queue")
    .addStringOption(option => option.setName("number").setDescription("number of tracks to skip by").setRequired(false))
};
