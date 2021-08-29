import client from "./client";
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";

const rest = new REST({ version: "9" }).setToken(process.env.DISCORD_API_TOKEN as string);


// PUT commands to all guilds subscribed to bot
(async () => {
  try {
    await rest.put(
      Routes.applicationCommands(
        process.env.CLIENT_ID as string
      ),
      { body: client.commands.map(command => command.toJSON()) },
    );

  } catch (error) {
    console.error(error);
  }
})();


