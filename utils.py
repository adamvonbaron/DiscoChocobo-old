from urllib import parse

VALID_YOUTUBE_URLS = [
        "youtube.com/watch",
        "youtu.be"
]

def validate_youtube_url(url: str):
    parse_result = parse.urlparse(url)
    for url in VALID_YOUTUBE_URLS:
        if url in parse_result.geturl():
            return True
    return False
