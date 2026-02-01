"""
Embedding service for generating text embeddings using OpenRouter API
"""
import os
import requests
from typing import List, Optional

OPENROUTER_API_KEY = os.environ.get('OPENROUTER_API_KEY')
OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1'

def generate_embedding(text: str) -> Optional[List[float]]:
    """
    Generate an embedding vector for the given text using OpenRouter.
    
    Args:
        text: The text to generate an embedding for
        
    Returns:
        A list of floats representing the embedding vector, or None if failed
    """
    if not OPENROUTER_API_KEY:
        print("Warning: OPENROUTER_API_KEY not set")
        return None
    
    if not text or not text.strip():
        return None
    
    try:
        # Use text-embedding-3-small model (1536 dimensions)
        # OpenRouter routes to OpenAI's embedding models
        response = requests.post(
            f'{OPENROUTER_BASE_URL}/embeddings',
            headers={
                'Authorization': f'Bearer {OPENROUTER_API_KEY}',
                'Content-Type': 'application/json',
                'HTTP-Referer': os.environ.get('APP_URL', 'http://localhost:3000'),
                'X-Title': 'HackViolet Profile Search'
            },
            json={
                'model': 'openai/text-embedding-3-small',
                'input': text.strip()
            },
            timeout=10
        )
        
        response.raise_for_status()
        data = response.json()
        
        if 'data' in data and len(data['data']) > 0:
            return data['data'][0]['embedding']
        
        return None
        
    except requests.exceptions.RequestException as e:
        print(f"Error generating embedding: {str(e)}")
        return None
    except Exception as e:
        print(f"Unexpected error generating embedding: {str(e)}")
        return None


def generate_profile_text(profile: dict) -> str:
    """
    Generate a text representation of a profile for embedding generation.
    Important fields (location, industry, school, career status) are repeated 
    multiple times to give them more weight in semantic matching.
    
    Args:
        profile: Profile dictionary with user information
        
    Returns:
        A concatenated string representation of the profile
    """
    parts = []
    
    # Add full name
    if profile.get('full_name'):
        parts.append(f"Name: {profile['full_name']}")
    
    # Add location multiple times for better matching (HIGH WEIGHT)
    if profile.get('location'):
        location = profile['location']
        parts.append(f"Location: {location}")
        parts.append(f"Based in {location}")
        parts.append(f"From {location}")
        parts.append(f"Lives in {location}")
        parts.append(f"{location} resident")
    
    # Add industry multiple times (HIGH WEIGHT)
    industry = profile.get('custom_industry') or profile.get('industry')
    if industry:
        parts.append(f"Industry: {industry}")
        parts.append(f"Works in {industry}")
        parts.append(f"{industry} professional")
        parts.append(f"Career in {industry}")
        parts.append(f"Job: {industry}")
    
    # Add school multiple times (HIGH WEIGHT)
    if profile.get('current_school'):
        school = profile['current_school']
        parts.append(f"School: {school}")
        parts.append(f"Studies at {school}")
        parts.append(f"Attends {school}")
        parts.append(f"{school} student")
        parts.append(f"College: {school}")
    
    # Add career status multiple times (HIGH WEIGHT)
    if profile.get('career_status'):
        status_map = {
            'in_industry': 'Currently in Industry',
            'seeking_opportunities': 'Seeking Opportunities',
            'student': 'Student',
            'career_break': 'Career Break'
        }
        status_text = status_map.get(profile['career_status'], profile['career_status'])
        parts.append(f"Career Status: {status_text}")
        parts.append(f"Status: {status_text}")
        
        # Add contextual variations
        if profile['career_status'] == 'in_industry':
            parts.append("Currently employed in industry")
            parts.append("Working professional")
        elif profile['career_status'] == 'seeking_opportunities':
            parts.append("Looking for job opportunities")
            parts.append("Open to new opportunities")
        elif profile['career_status'] == 'student':
            parts.append("Currently studying")
            parts.append("Full-time student")
        elif profile['career_status'] == 'career_break':
            parts.append("On career break")
            parts.append("Taking time off")
    
    # Add bio (single mention, lower weight)
    if profile.get('bio'):
        parts.append(f"Bio: {profile['bio']}")
    
    # Add skills (single mention, lower weight)
    if profile.get('skills') and isinstance(profile['skills'], list):
        skills_text = ', '.join(profile['skills'])
        parts.append(f"Skills: {skills_text}")
    
    return '. '.join(parts)


def generate_profile_embedding(profile: dict) -> Optional[List[float]]:
    """
    Generate an embedding for a profile.
    
    Args:
        profile: Profile dictionary
        
    Returns:
        Embedding vector or None if failed
    """
    profile_text = generate_profile_text(profile)
    if not profile_text:
        return None
    
    return generate_embedding(profile_text)
