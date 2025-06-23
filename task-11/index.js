#!/usr/bin/env node

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { program } = require('commander');
const { OpenAI } = require('openai');
const chalk = require('chalk');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Create transcripts directory if it doesn't exist
const TRANSCRIPTS_DIR = path.join(__dirname, 'transcripts');
if (!fs.existsSync(TRANSCRIPTS_DIR)) {
  fs.mkdirSync(TRANSCRIPTS_DIR, { recursive: true });
}

// Helper function to calculate word count
function countWords(text) {
  return text.trim().split(/\s+/).length;
}

// Helper function to extract frequently mentioned topics using GPT
async function extractTopics(transcript) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that analyzes transcripts and identifies frequently mentioned topics."
        },
        {
          role: "user",
          content: `Analyze this transcript and identify the top 5 most frequently mentioned topics along with the number of mentions for each. Return only a JSON array in this format: [{"topic": "Topic Name", "mentions": count}]. Do not include any explanations or other text.\n\nTranscript: ${transcript}`
        }
      ],
      temperature: 0.3,
      max_tokens: 500,
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error(chalk.red('Error extracting topics:'), error);
    return [];
  }
}

// Helper function to generate a summary using GPT
async function generateSummary(transcript) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that summarizes transcripts concisely."
        },
        {
          role: "user",
          content: `Summarize this transcript in 3-5 sentences:\n\n${transcript}`
        }
      ],
      temperature: 0.5,
      max_tokens: 300,
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error(chalk.red('Error generating summary:'), error);
    return "Failed to generate summary.";
  }
}

// Main function to process audio file
async function processAudioFile(audioFilePath) {
  try {
    console.log(chalk.blue('Processing audio file:', path.basename(audioFilePath)));
    
    // Check if file exists
    if (!fs.existsSync(audioFilePath)) {
      throw new Error(`Audio file not found: ${audioFilePath}`);
    }

    // Get audio duration using OpenAI's Whisper API response
    console.log(chalk.yellow('Transcribing audio...'));
    const transcriptionStart = Date.now();
    
    // Transcribe audio using Whisper API
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(audioFilePath),
      model: "whisper-1",
      response_format: "verbose_json",
    });

    const transcriptionTime = (Date.now() - transcriptionStart) / 1000;
    console.log(chalk.green(`Transcription completed in ${transcriptionTime.toFixed(2)} seconds`));

    // Extract transcript text and duration
    const transcript = transcription.text;
    const audioDurationSeconds = transcription.duration;
    
    // Calculate word count and speaking speed
    const wordCount = countWords(transcript);
    const speakingSpeedWpm = Math.round((wordCount / audioDurationSeconds) * 60);

    // Generate summary
    console.log(chalk.yellow('Generating summary...'));
    const summary = await generateSummary(transcript);

    // Extract topics
    console.log(chalk.yellow('Extracting topics...'));
    const topics = await extractTopics(transcript);

    // Create analytics object
    const analytics = {
      word_count: wordCount,
      speaking_speed_wpm: speakingSpeedWpm,
      frequently_mentioned_topics: topics
    };

    // Save transcript to file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const transcriptFilename = `transcript-${timestamp}.txt`;
    const transcriptPath = path.join(TRANSCRIPTS_DIR, transcriptFilename);
    
    fs.writeFileSync(transcriptPath, transcript);
    console.log(chalk.green(`Transcript saved to: ${transcriptPath}`));

    // Return results
    return {
      summary,
      analytics,
      transcriptPath
    };
  } catch (error) {
    console.error(chalk.red('Error processing audio file:'), error);
    process.exit(1);
  }
}

// Set up CLI
program
  .name('audio-transcriber')
  .description('Transcribe audio files and generate analytics')
  .version('1.0.0')
  .argument('<audioFile>', 'Path to the audio file to transcribe')
  .action(async (audioFile) => {
    try {
      // Resolve relative path if needed
      const audioFilePath = path.resolve(process.cwd(), audioFile);
      
      // Process audio file
      const result = await processAudioFile(audioFilePath);
      
      // Display results
      console.log('\n' + chalk.bold.blue('=== Summary ==='));
      console.log(result.summary);
      
      console.log('\n' + chalk.bold.blue('=== Analytics ==='));
      console.log(JSON.stringify(result.analytics, null, 2));
      
    } catch (error) {
      console.error(chalk.red('Error:'), error.message);
      process.exit(1);
    }
  });

program.parse();
