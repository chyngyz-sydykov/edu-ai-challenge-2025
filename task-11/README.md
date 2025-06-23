# Audio Transcription & Analysis Tool

A Node.js console application that transcribes spoken audio files using OpenAI's Whisper API, summarizes the content using GPT, and provides analytics about the speech.

## Features

- Transcribes audio files using OpenAI's Whisper API
- Generates a concise summary of the transcript using GPT
- Extracts analytics including:
  - Total word count
  - Speaking speed (words per minute)
  - Frequently mentioned topics with mention counts
- Saves each transcription to a separate timestamped file
- Displays summary and analytics in the console

## Prerequisites

- Node.js (v14 or higher recommended)
- OpenAI API key

## Setup

1. Clone or download this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file in the project root with your OpenAI API key:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

## Usage

Run the application with an audio file path as an argument:

```bash
node index.js path/to/audio/file.mp3
```

Example:
```bash
node index.js CAR0004.mp3
```

## Output

The application will:
1. Display progress in the console
2. Save the full transcript to a file in the `transcripts/` directory
3. Display a summary of the content
4. Display analytics in JSON format:
   ```json
   {
     "word_count": 1280,
     "speaking_speed_wpm": 132,
     "frequently_mentioned_topics": [
       { "topic": "Customer Onboarding", "mentions": 6 },
       { "topic": "Q4 Roadmap", "mentions": 4 },
       { "topic": "AI Integration", "mentions": 3 }
     ]
   }
   ```

## Dependencies

- openai - For accessing OpenAI's Whisper and GPT APIs
- dotenv - For loading environment variables
- commander - For parsing command-line arguments
- chalk - For colorful console output
