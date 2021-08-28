from elixir:1.12.2

arg discord_api_token
arg mix_env

env MIX_ENV=$mix_env
env DISCORD_API_TOKEN=$discord_api_token

# need to have ffmpeg and youtube-dl to stream vids and stuff
run apt update && apt install -y ffmpeg curl

run curl -L https://yt-dl.org/downloads/latest/youtube-dl -o /usr/local/bin/youtube-dl

run chmod a+rx /usr/local/bin/youtube-dl

run mkdir /app
copy . /app
workdir /app

run mix local.hex --force
run mix local.rebar --force
run mix deps.get && mix deps.compile
run mix release

# cmd ["./_build/${MIX_ENV}/rel/discochocobo/bin/discochocobo", "start"]
