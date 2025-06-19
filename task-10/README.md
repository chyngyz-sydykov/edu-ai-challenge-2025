# Product Search Tool

A console-based product search tool that uses OpenAI's function calling to filter products based on natural language user queries.

## Features

- Accepts natural language queries for product search
- Uses OpenAI's function calling to filter products
- Searches through a provided JSON dataset
- Returns filtered products in a structured format

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- OpenAI API key

## Setup

1. Clone the repository or navigate to the project folder
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file in the root directory with your OpenAI API key:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

## Usage

Run the application with:

```
npm start
```

When prompted, enter your search query in natural language. For example:
- "I need electronics under $100 with at least 4.3 rating"
- "Show me in-stock fitness equipment under $50"
- "Find me kitchen appliances with rating above 4.5"

The application will display the filtered products that match your criteria.

## How It Works

1. The application loads the product dataset from `products.json`
2. It captures your natural language query
3. The query and product data are sent to OpenAI's API
4. OpenAI uses function calling to filter the products based on your criteria
5. The filtered products are displayed in a structured format

## Example

Input:
```
I need electronics under $100 with at least 4.3 rating
```

Output:
```
Filtered Products:
1. Wireless Headphones - $99.99, Rating: 4.5, In Stock
2. Bluetooth Speaker - $49.99, Rating: 4.4, In Stock
```
