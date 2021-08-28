defmodule AudioPlayerConsumer do
  use Nostrum.Consumer

  alias Nostrum.Api
  alias Nostrum.Cache.GuildCache
  alias Nostrum.Voice

  require Logger

  def start_link() do
    Consumer.start_link(__MODULE__)
  end

  def get_voice_channel_of_msg(msg) do
    msg.guild_id
    |> GuildCache.get!
    |> Map.get(:voice_states)
    |> Enum.find(%{}, fn v -> v.user_id == msg.author.id end)
    |> Map.get(:channel_id)
  end

  def do_not_ready_msg(msg) do
    Api.create_message(msg.channel_id, "i need to be in a voice channel dude")
  end

  def handle_event({:MESSAGE_CREATE, msg, _ws_state}) do
    case msg.content do
      # The bot will search through the GuildCache's voice states to find
      # the voice channel that the message author is in to join
      "!summon" ->
        case get_voice_channel_of_msg(msg) do
          nil -> Api.create_message(msg.channel_id, "you must be in a voice channel to summon me")
          voice_channel_id -> Voice.join_channel(msg.guild_id, voice_channel_id)
        end
      "!leave" -> Voice.leave_channel(msg.guild_id)
      "!play " <> url ->
        if Voice.ready?(msg.guild_id) do
          Voice.play(msg.guild_id, url, :ytdl)
        else
          do_not_ready_msg(msg)
        end
      "!pause" -> Voice.pause(msg.guild_id)
      "!resume" -> Voice.resume(msg.guild_id)
      "!stop" -> Voice.stop(msg.guild_id)
      _ -> :noop
    end
  end

  def handle_event({:VOICE_SPEAKING_UPDATE, payload, _ws_state}) do
    Logger.debug("VOICE_SPEAKING_UPDATE: #{inspect(payload)}")
  end

  # default handler (catches the rest of all possible message tuples)
  def handle_event(_event) do
    :noop
  end
end
