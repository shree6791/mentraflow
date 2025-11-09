"""
YouTube Utilities
Helper functions for YouTube video processing
"""

import re
from typing import Optional, Dict


def extract_video_id(url: str) -> Optional[str]:
    """
    Extract YouTube video ID from URL
    
    Supports formats:
    - https://www.youtube.com/watch?v=VIDEO_ID
    - https://youtu.be/VIDEO_ID
    - https://www.youtube.com/embed/VIDEO_ID
    """
    patterns = [
        r'(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})',
        r'youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})'
    ]
    
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    
    return None


def validate_youtube_url(url: str) -> bool:
    """Validate if URL is a valid YouTube URL"""
    if not url:
        return False
    
    return bool(
        "youtube.com" in url or 
        "youtu.be" in url
    ) and extract_video_id(url) is not None


async def get_youtube_transcript(video_id: str) -> Dict:
    """
    Get transcript from YouTube video
    
    Mock implementation - returns simulated transcript
    
    In production, use youtube-transcript-api:
    
    from youtube_transcript_api import YouTubeTranscriptApi
    
    transcript = YouTubeTranscriptApi.get_transcript(video_id)
    full_text = ' '.join([entry['text'] for entry in transcript])
    duration = transcript[-1]['start'] + transcript[-1]['duration']
    
    return {
        'text': full_text,
        'duration_seconds': duration,
        'language': 'en'
    }
    """
    # Mock response
    return {
        'text': (
            f"This is a simulated transcript from YouTube video ID: {video_id}. "
            f"In production, this would contain the actual video transcript extracted "
            f"using the youtube-transcript-api library. The transcript includes all "
            f"spoken content, properly formatted with timestamps. This enables users "
            f"to generate comprehensive study materials from educational videos."
        ),
        'duration_seconds': 600,  # Mock: 10 minutes
        'language': 'en',
        'mock': True
    }


async def get_video_duration(video_id: str) -> int:
    """
    Get video duration in seconds
    
    Mock implementation - returns 10 minutes
    
    In production, use YouTube Data API:
    
    from googleapiclient.discovery import build
    
    youtube = build('youtube', 'v3', developerKey=API_KEY)
    response = youtube.videos().list(
        part='contentDetails',
        id=video_id
    ).execute()
    
    duration_str = response['items'][0]['contentDetails']['duration']
    # Parse ISO 8601 duration (PT1H2M10S) to seconds
    """
    # Mock: Return 10 minutes (600 seconds)
    return 600
