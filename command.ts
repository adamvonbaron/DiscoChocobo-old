import { ApplicationCommand, Message, CommandInteraction } from "discord.js";
import { APIMessage } from "discord-api-types/v9";


export type CommandExecutor = (interaction: CommandInteraction) => Promise<Message | APIMessage | void>;

export abstract class DiscoChocoboCommand extends ApplicationCommand {
  abstract execute: CommandExecutor;

  toJSON() {
    return {
      name: this.name,
      description: this.description,
      options: this.options,
      default_permission: true
    }
  }
}

