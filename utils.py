from urllib import parse


def validate_youtube_url(url: str):
    parse_result = parse.urlparse(url)
    return "youtube.com/watch" in parse_result.path