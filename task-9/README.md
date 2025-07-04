# Service Analysis Report Generator

A lightweight console application that generates comprehensive, markdown-formatted reports about services or products from multiple viewpoints—including business, technical, and user-focused perspectives.

## Features

- Accepts either a known service name (e.g., "Spotify", "Notion") or a raw service description
- Generates a detailed markdown report with the following sections:
  - Brief History
  - Target Audience
  - Core Features
  - Unique Selling Points
  - Business Model
  - Tech Stack Insights
  - Perceived Strengths
  - Perceived Weaknesses
- Option to save the report to a markdown file

## Prerequisites

- Node.js (v12 or higher)
- npm (Node Package Manager)
- OpenAI API Key

## Installation

1. Clone the repository or navigate to the project directory
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file in the project root with your OpenAI API key:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

## Usage

Run the application using:

```
node index.js
```

Follow the interactive prompts:

1. Choose between analyzing a service name or providing a service description
2. Enter the service name or description as requested
3. Wait for the report to be generated
4. View the report in the console
5. Optionally save the report to a markdown file

### Example Usage

```
=== Service Analysis Report Generator ===
This tool generates comprehensive reports about services or products.

Do you want to analyze a known service name or provide a description? (Enter 1 or 2)
1. Service Name (e.g., "Spotify", "Notion")
2. Service Description
Your choice: 1
Enter the service name: Spotify

Generating report, please wait...

=== GENERATED REPORT ===

[Report content will appear here]

Do you want to save this report to a file? (y/n): y

Report saved to spotify_report.md
```

## Sample Outputs

See the `sample_outputs.md` file for example reports generated by this application.

## How It Works

The application uses the OpenAI API to generate comprehensive reports based on the provided input. The system:

1. Takes user input (service name or description)
2. Constructs a detailed prompt for the AI
3. Sends the request to OpenAI's API
4. Formats and displays the response
5. Offers to save the report to a file

## License

ISC
