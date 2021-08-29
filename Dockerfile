from node:16.8.0

arg discord_api_token

env DISCORD_API_TOKEN=$discord_api_token

# need to have ffmpeg opus and youtube-dl to stream vids and stuff
run apt update && apt install -y ffmpeg curl libopus0

run curl -L https://yt-dl.org/downloads/latest/youtube-dl -o /usr/local/bin/youtube-dl

run chmod a+rx /usr/local/bin/youtube-dl

run mkdir /app
copy . /app
workdir /app

run yarn

expose 443

cmd ["yarn", "run", "bot"]
