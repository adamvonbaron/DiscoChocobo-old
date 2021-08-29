const { SlashCommandBuilder } = require("@discordjs/builders");
const { client } = require("../client.ts");
const { player } = require("../player.ts");


module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("play audiooooooo")
    .addStringOption(option => option.setName("url").setDescription("url of da audio").setRequired(true)),
  async execute(interaction) {
    const url = interaction.options.getString("url");
    if (!interaction.member.voice.channelId) return await interaction.reply({ content: "You are not in a voice channel!", ephemeral: true });
    if (interaction.guild.me.voice.channelId && interaction.member.voice.channelId !== interaction.guild.me.voice.channelId) return await interaction.reply({ content: "You are not in my voice channel!", ephemeral: true });
    const queue = player.createQueue(interaction.guild, {
      metadata: {
        channel: interaction.channel
      }
    });

    // verify vc connection
    try {
      if (!queue.connection) await queue.connect(interaction.member.voice.channel);
    } catch {
      queue.destroy();
      return await interaction.reply({ content: "Could not join your voice channel!", ephemeral: true });
    }

    await interaction.deferReply();
    const track = await player.search(url, {
      requestedBy: interaction.user
    }).then(x => x.tracks[0]);
    if (!track) return await interaction.followUp({ content: `❌ | Track **${query}** not found!` });

    queue.play(track);

    return await interaction.followUp({ content: `⏱️ | Loading track **${track.title}**!` });
  }
}
