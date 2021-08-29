import {
  CommandInteraction,
  GuildMember,
  Guild,
  Message,
  Constants
} from "discord.js";
import { APIMessage, Snowflake } from "discord-api-types/v9";
import { player } from "../client";
import { DiscoChocoboCommand } from "../command";


export default class extends DiscoChocoboCommand {
  name = "skip";
  description = "skip tracks in queue";
  options = [
    {
      name: "number",
      description: "skip by number of tracks",
      required: false,
      type: Constants.ApplicationCommandOptionTypes.NUMBER
    } as any
  ];

  execute = async (interaction: CommandInteraction): Promise<Message | APIMessage | void> => {
    const number = interaction.options.getNumber("number");
    const member = interaction.member as GuildMember;
    const guild = interaction.guild as Guild;

    const queue = player.getQueue(guild);

    try {
      if (!queue.connection)
        await queue.connect(member.voice.channelId as Snowflake);
    } catch {
      queue.destroy();
      return await interaction.reply({ content: "error accessing queu", ephemeral: true });
    }

    await interaction.deferReply();

    queue.skip();
    return await interaction.followUp({ content: "skipped current track", ephemeral: true });
  }
}
