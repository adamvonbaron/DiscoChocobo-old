import {
  Client, Intents, Collection, ClientOptions, Interaction
} from "discord.js";
import { Player } from "discord-player";

import { DiscoChocoboCommand } from "./command";
import { DISCO_CHOCOBO_COMMANDS } from "./commands";

export class DiscoChocobo extends Client {
  public commands: Collection<string, DiscoChocoboCommand> = new Collection();

  public constructor(options: ClientOptions) {
    super(options);

    this.login(process.env.DISCORD_API_TOKEN as string);

    this.initializeHandlers();
    this.initializeCommands();
  }

  private initializeCommands() {
    for (const command of DISCO_CHOCOBO_COMMANDS) {
      this.commands.set(command.name, command);
    }
  }

  private initializeHandlers() {
    this.on("interactionCreate", async (interaction: Interaction) => {
      if (!interaction.isCommand()) return;

      const command = client.commands.get(interaction.commandName);

      if (!command) return;

      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(error);
        return interaction.reply({ content: "error while executing command.", ephemeral: true });
      }
    });
  }
}

const client = new DiscoChocobo({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_VOICE_STATES
  ]
} as any);

const player = new Player(client);

export default client;
export { player };
