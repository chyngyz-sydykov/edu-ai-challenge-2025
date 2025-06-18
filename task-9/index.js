#!/usr/bin/env node

// Import required packages
require('dotenv').config();
const { OpenAI } = require('openai');
const fs = require('fs');
const readline = require('readline');

// Get API key from environment variables
const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.error('Error: OPENAI_API_KEY is not set in the .env file');
  process.exit(1);
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: apiKey
});

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * Generate a comprehensive service report using OpenAI
 * @param {string} input - Service name or description
 * @param {boolean} isServiceName - Whether the input is a service name or description
 * @returns {Promise<string>} - Markdown formatted report
 */
async function generateServiceReport(input, isServiceName) {
  try {
    const prompt = createPrompt(input, isServiceName);
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        { 
          role: "system", 
          content: "You are an expert business and technology analyst who creates comprehensive reports about services and products."
        },
        { role: "user", content: prompt }
      ],
      max_tokens: 2000
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    
    if (error.error && error.error.code === 'model_not_found') {
      console.log('\nTry modifying the model in the code to one that your API key has access to.');
    } else if (error.status === 401) {
      console.log('\nAuthentication error: Please check if your OPENAI_API_KEY is valid.');
    } else {
      console.log('\nPlease check your .env file and ensure OPENAI_API_KEY is set correctly.');
    }
    
    return null;
  }
}

/**
 * Create a prompt for the AI based on input type
 * @param {string} input - Service name or description
 * @param {boolean} isServiceName - Whether the input is a service name or description
 * @returns {string} - Formatted prompt
 */
function createPrompt(input, isServiceName) {
  const basePrompt = `Generate a comprehensive, markdown-formatted report about ${isServiceName ? `the service/product named "${input}"` : 'the following service/product'}.

The report must include these sections with markdown headings:
1. Brief History: Founding year, milestones, etc.
2. Target Audience: Primary user segments
3. Core Features: Top 2–4 key functionalities
4. Unique Selling Points: Key differentiators
5. Business Model: How the service makes money
6. Tech Stack Insights: Any hints about technologies used
7. Perceived Strengths: Mentioned positives or standout features
8. Perceived Weaknesses: Cited drawbacks or limitations

Ensure the report is well-structured with proper markdown formatting including headers, bullet points, and emphasis where appropriate.`;

  if (!isServiceName) {
    return `${basePrompt}\n\nHere is the service description:\n"${input}"`;
  }
  
  return basePrompt;
}

/**
 * Save report to a file
 * @param {string} report - Markdown formatted report
 * @param {string} serviceName - Name of the service
 */
function saveReportToFile(report, serviceName) {
  const filename = `${serviceName.toLowerCase().replace(/\s+/g, '_')}_report.md`;
  
  fs.writeFile(filename, report, (err) => {
    if (err) {
      console.error(`Error saving report to file: ${err.message}`);
      return;
    }
    console.log(`\nReport saved to ${filename}`);
  });
}

/**
 * Main function to run the application
 */
async function main() {
  console.log('=== Service Analysis Report Generator ===');
  console.log('This tool generates comprehensive reports about services or products.');
  
  rl.question('\nDo you want to analyze a known service name or provide a description? (Enter 1 or 2)\n1. Service Name (e.g., "Spotify", "Notion")\n2. Service Description\nYour choice: ', async (choice) => {
    if (choice !== '1' && choice !== '2') {
      console.log('Invalid choice. Please restart the application and enter 1 or 2.');
      rl.close();
      return;
    }
    
    const isServiceName = choice === '1';
    const promptText = isServiceName 
      ? 'Enter the service name: '
      : 'Enter the service description (press Enter twice when done):\n';
    
    if (isServiceName) {
      rl.question(promptText, async (input) => {
        console.log('\nGenerating report, please wait...');
        const report = await generateServiceReport(input, true);
        
        if (report) {
          console.log('\n=== GENERATED REPORT ===\n');
          console.log(report);
          
          rl.question('\nDo you want to save this report to a file? (y/n): ', (answer) => {
            if (answer.toLowerCase() === 'y') {
              saveReportToFile(report, input);
            }
            rl.close();
          });
        } else {
          rl.close();
        }
      });
    } else {
      // For description input, collect multiple lines
      console.log(promptText);
      let description = '';
      let lastLine = '';
      
      rl.on('line', async (line) => {
        if (line === '' && lastLine === '') {
          // Two consecutive empty lines means input is complete
          console.log('\nGenerating report, please wait...');
          const report = await generateServiceReport(description.trim(), false);
          
          if (report) {
            console.log('\n=== GENERATED REPORT ===\n');
            console.log(report);
            
            rl.question('\nDo you want to save this report to a file? (y/n): ', (answer) => {
              if (answer.toLowerCase() === 'y') {
                rl.question('Enter a name for the service/product: ', (serviceName) => {
                  saveReportToFile(report, serviceName);
                  rl.close();
                });
              } else {
                rl.close();
              }
            });
          } else {
            rl.close();
          }
        } else {
          description += line + '\n';
          lastLine = line;
        }
      });
    }
  });
}

// Run the application
main();
