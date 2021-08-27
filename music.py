import discord
import asyncio
import youtube_dl
from discord.ext import commands
from asyncio.queues import Queue
from typing import Union
from utils import validate_youtube_url

ytdl_opts = {
    "format": "bestaudio/best",
    "outtmpl": "%(extractor)s-%(id)s-%(title)s.%(ext)s",
    "restrictfilenames": True,
    "noplaylist": True,
    "nocheckcertificate": True,
    "ignoreerrors": False,
    "logtostderr": False,
    "quiet": True,
    "no_warnings": True,
    "default_search": "auto",
    "source_address": "0.0.0.0",  # bind to ipv4 since ipv6 addresses cause issues sometimes
    "reconnect": 1,
    "reconnect_streamed": 1,
    "reconnect_delay_max": 5
}

ffmpeg_opts = {"options": "-vn"}

ytdl = youtube_dl.YoutubeDL(ytdl_opts)


class YTDLSource(discord.PCMVolumeTransformer):
    def __init__(self, source, *, data, volume=0.5):
        super().__init__(source, volume)
        self.data = data
        self.title = data.get("title")
        self.url = data.get("url")

    @classmethod
    async def from_url(cls, url, *, loop=None, stream=False):
        loop = loop or asyncio.get_event_loop()

        data = await loop.run_in_executor(
            None, lambda: ytdl.extract_info(url, download=not stream)
        )

        if "entries" in data:
            data = data["entries"][0]

        filename = data["url"] if stream else ytdl.prepare_filename(data)
        return cls(discord.FFmpegPCMAudio(filename, **ffmpeg_opts), data=data)


class MusicCog(commands.Cog):
    def __init__(self, bot):
        self.bot = bot
        self.music_queue: Queue[YTDLSource] = Queue(maxsize=50)
        self.ctx: Union[None, commands.Context] = None
        self.bot.loop.set_debug(True)
        self.bot.loop.create_task(self.play_music_from_queue())
        self.play_next_player = asyncio.Event()

    @staticmethod
    def _create_music_queue_resp(player, initial="queued ") -> str:
        resp: str = initial
        resp += f"{player.title}"
        if "artist" in player.data:
            resp += f" by {player.data['artist']}"
        if "album" in player.data:
            resp += f" from {player.data['album']}"
        if "release_year" in player.data:
            resp += f", released {player.data['release_year']}"
        return resp

    def _voice_client_after_handler(self, error):
        if error:
            print(f"player error {error}")
            return
        self.music_queue.task_done()
        self.bot.loop.call_soon_threadsafe(self.play_next_player.set)

    async def play_music_from_queue(self):
        while True:
            player = await self.music_queue.get()
            await self.join_channel()
            resp = self._create_music_queue_resp(player, initial="now playing ")
            await self.ctx.send(resp)
            self.play_next_player.clear()
            self.ctx.voice_client.play(player, after=self._voice_client_after_handler)
            await self.play_next_player.wait()

    async def join_channel(self):
        channel = self.ctx.author.voice.channel  # type: ignore
        if self.ctx.voice_client is not None:
            return await self.ctx.voice_client.move_to(channel)
        await channel.connect()

    @commands.command(aliases=["p"])
    async def play(self, ctx: commands.Context, url: str):
        if self.music_queue.full():
            return await ctx.send(
                "i cant hold anymore tracks right now, let a few play and then give me some more"
            )
        if not validate_youtube_url(url):
            return await ctx.send("not sure how to play that one...")
        self.ctx = ctx
        resp: str
        async with ctx.typing():
            player = await YTDLSource.from_url(url, loop=self.bot.loop, stream=True)
            resp = self._create_music_queue_resp(player)
            await self.music_queue.put(player)
        await ctx.send(resp)

    @commands.command()
    async def skip(self, ctx: commands.Context):
        if self.music_queue.empty() and not ctx.voice_client.is_playing():
            return await ctx.send("nothing to skip")
        ctx.voice_client.stop()
        self.play_next_player.set()

    @commands.command()
    async def pause(self, ctx: commands.Context):
        if ctx.voice_client.is_playing():
            ctx.voice_client.pause()

    @commands.command()
    async def resume(self, ctx: commands.Context):
        if not ctx.voice_client.is_playing():
            ctx.voice_client.resume()
