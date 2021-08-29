import PlayCommand from "./commands/play";
import SkipCommand from "./commands/skip";
import { RawApplicationCommandData } from "discord.js/typings/rawDataTypes";
import { DiscoChocoboCommand } from "./command";
import client from "./client";

export const DISCO_CHOCOBO_COMMANDS: Array<DiscoChocoboCommand> = [
  new PlayCommand(client, {} as RawApplicationCommandData),
  new SkipCommand(client, {} as RawApplicationCommandData)
]

