import os
import google.generativeai as genai
from django.conf import settings

# Initialize the Gemini API client
genai.configure(api_key=os.environ.get("GEMINI_API_KEY", ""))

def generate_ai_character(project):
    """Generates a character based on the project's genre and synopsis."""
    model = genai.GenerativeModel('gemini-1.5-flash')
    prompt = f"""
    You are a professional character creator for a novelist. 
    The book's genre is: {project.genre}
    The book's synopsis is: {project.synopsis}
    
    Create a highly compelling, original character that perfectly fits this world. 
    Respond ONLY in JSON format with no markdown wrappers or backticks, matching this exact schema:
    {{
        "name": "Full Name",
        "role": "Protagonist, Antagonist, Supporting, or Minor",
        "age": "Age as a string",
        "physical_description": "2-3 sentences describing appearance",
        "backstory": "2-3 sentences of backstory",
        "internal_desire": "What do they secretly want most?",
        "flaw": "Their fatal flaw",
        "avatar_url": "Leave this as empty string"
    }}
    """
    
    try:
        response = model.generate_content(prompt)
        text = response.text.strip()
        # Clean up markdown if the AI includes it despite instructions
        if text.startswith('```json'):
            text = text[7:]
        if text.startswith('```'):
            text = text[3:]
        if text.endswith('```'):
            text = text[:-3]
        return text.strip()
    except Exception as e:
        return str(e)

def ask_muse(project, prompt_text):
    """Consults the AI Muse for plot advice."""
    model = genai.GenerativeModel('gemini-1.5-flash')
    
    # Gather project context
    characters = ", ".join([c.name for c in project.characters.all()])
    chapters = ", ".join([c.title for c in project.chapters.all()])
    
    prompt = f"""
    You are 'The Muse', an expert literary consultant.
    
    Context about the author's book:
    Title: {project.title}
    Genre: {project.genre}
    Synopsis: {project.synopsis}
    Key Characters: {characters}
    Current Chapters: {chapters}
    
    The author asks: "{prompt_text}"
    
    Provide constructive, creative, and highly specific advice based on their world. Keep your response under 3 paragraphs. Use markdown for formatting.
    """
    
    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return str(e)

def critique_chapter(chapter):
    """Provides a literary critique of a specific chapter."""
    model = genai.GenerativeModel('gemini-1.5-flash')
    
    prompt = f"""
    You are an expert developmental editor. 
    Please critique the following chapter from a novel. 
    Provide feedback on:
    1. Pacing and flow
    2. 'Show, Don't Tell' improvements
    3. Dialogue (if any)
    4. Overall emotional impact
    
    Chapter Title: {chapter.title}
    
    Content:
    {chapter.content}
    
    Keep your critique constructive and professional. Use markdown for formatting.
    """
    
    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return str(e)
