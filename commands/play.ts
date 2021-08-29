import {
  CommandInteraction,
  GuildMember,
  Guild,
  Message,
  Constants
} from "discord.js";
import { APIMessage } from "discord-api-types/v9";
import { player } from "../client";
import { DiscoChocoboCommand } from "../command";


export default class extends DiscoChocoboCommand {
  name = "play";
  description = "play audio";
  options = [
    {
      name: "url_or_search",
      description: "url or search string to audio",
      required: true,
      type: Constants.ApplicationCommandOptionTypes.STRING
    } as any
  ];

  execute = async (interaction: CommandInteraction): Promise<Message | APIMessage | void> => {
    const audioParam = interaction.options.getString("url_or_search") as string;
    const member = interaction.member as GuildMember;
    const guild = interaction.guild as Guild;

    if (!member.voice.channelId)
      return await interaction.reply({ content: "you need to be in a voice channel", ephemeral: true });

    if ((guild.me as GuildMember).voice.channelId &&
      member.voice.channelId !== (guild.me as GuildMember).voice.channelId)
      return await interaction.reply({ content: "i am in a different channel right now", ephemeral: true });

    const queue = player.createQueue(guild, {
      metadata: {
        channel: interaction.channel
      }
    });

    try {
      if (!queue.connection)
        await queue.connect(member.voice.channelId);
    } catch {
      queue.destroy();
      return await interaction.reply({ content: "error joining voice channel", ephemeral: true });
    }

    await interaction.deferReply();

    const track = await player.search(audioParam, {
      requestedBy: interaction.user
    }).then(x => x.tracks[0]);

    if (!track)
      return await interaction.followUp({ content: `track **${audioParam}** not found` });
    queue.play(track);
    return await interaction.followUp({ content: `loading track **${track.title}**...` });
  }
}
