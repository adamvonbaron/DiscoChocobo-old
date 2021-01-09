from os import getenv
from discord.ext import commands
from music import MusicCog

DISCORD_API_TOKEN = getenv("DISCORD_AUTH_TOKEN")
if DISCORD_API_TOKEN is None:
    raise Exception("no DISCORD_API_TOKEN set")

bot = commands.Bot(command_prefix=commands.when_mentioned_or("-"))

bot.add_cog(MusicCog(bot))
bot.run(DISCORD_API_TOKEN)
