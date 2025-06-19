/**
 * Product Search Tool
 * 
 * A console-based application that uses OpenAI's function calling to filter products
 * based on natural language user queries. The application loads a product dataset,
 * sends the user query to OpenAI, and displays the filtered results.
 * 
 * Each search is automatically saved to sample_outputs.md for reference.
 */

import { config } from 'dotenv';
import { readFileSync, writeFileSync, appendFileSync, existsSync } from 'fs';
import OpenAI from 'openai';
import readlineSync from 'readline-sync';

// Load environment variables
config();

// Check if API key is available
if (!process.env.OPENAI_API_KEY) {
  console.error('Error: OPENAI_API_KEY is not set in the .env file');
  console.log('Please create a .env file with your OpenAI API key (see .env.example)');
  process.exit(1);
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Loads the product dataset from the JSON file
 * @returns {Array} Array of product objects
 */
const loadProducts = () => {
  try {
    const data = readFileSync('./products.json', 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading products data:', error.message);
    process.exit(1);
  }
};

// Define function schema for OpenAI function calling
const filterProductsFunction = {
  name: 'filter_products',
  description: 'Filter products based on user preferences including category, price range, minimum rating, and stock availability',
  parameters: {
    type: 'object',
    properties: {
      filtered_products: {
        type: 'array',
        description: 'List of products that STRICTLY match ALL the user preferences',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Name of the product' },
            price: { type: 'number', description: 'Price of the product' },
            rating: { type: 'number', description: 'Rating of the product (0-5)' },
            in_stock: { type: 'boolean', description: 'Whether the product is in stock. IMPORTANT: If user asks for in-stock items, only return products with in_stock=true' }
          },
          required: ['name', 'price', 'rating', 'in_stock']
        }
      }
    },
    required: ['filtered_products']
  }
};

/**
 * Formats and displays the filtered products in the console
 * @param {Array} products - Array of product objects to display
 * @returns {Array} Array of formatted product strings for saving to file
 */
const displayFilteredProducts = (products) => {
  if (!products || products.length === 0) {
    console.log('No products match your criteria.');
    return [];
  }

  console.log('Filtered Products:');
  const formattedProducts = [];
  products.forEach((product, index) => {
    const stockStatus = product.in_stock ? 'In Stock' : 'Out of Stock';
    const formattedProduct = `${index + 1}. ${product.name} - $${product.price.toFixed(2)}, Rating: ${product.rating}, ${stockStatus}`;
    console.log(formattedProduct);
    formattedProducts.push(formattedProduct);
  });
  
  return formattedProducts;
};

/**
 * Saves search results to sample_outputs.md
 * Creates the file if it doesn't exist, otherwise appends to it
 * @param {string} query - The user's search query
 * @param {Array} formattedProducts - Array of formatted product strings
 * @param {string|null} error - Error message if any occurred
 */
const saveToSampleOutputs = (query, formattedProducts, error = null) => {
  try {
    const timestamp = new Date().toISOString();
    let content = '';
    
    // Initialize the file if it doesn't exist
    if (!existsSync('./sample_outputs.md')) {
      content = '# Sample Outputs\n\nThis document contains sample runs of the Product Search Tool with different user queries.\n\n';
      writeFileSync('./sample_outputs.md', content);
    }
    
    // Append the new search results
    content = `\n## Search Run - ${timestamp}\n\n### User Query\n\`\`\`\n${query}\n\`\`\`\n\n`;
    
    if (error) {
      content += `### Error\n\`\`\`\n${error}\n\`\`\`\n`;
    } else if (formattedProducts.length === 0) {
      content += `### Output\n\`\`\`\nNo products match your criteria.\n\`\`\`\n`;
    } else {
      content += `### Output\n\`\`\`\nFiltered Products:\n${formattedProducts.join('\n')}\n\`\`\`\n`;
    }
    
    appendFileSync('./sample_outputs.md', content);
    console.log('\nResults saved to sample_outputs.md');
  } catch (err) {
    console.error('Error saving to sample_outputs.md:', err.message);
  }
};

/**
 * Main function to search products based on user input
 * Handles the entire search flow from input to display
 */
async function searchProducts() {
  try {
    const products = loadProducts();
    
    console.log('Welcome to the Product Search Tool!');
    console.log('Describe what you\'re looking for (e.g., "I need a smartphone under $800 with a great camera")');
    
    const userQuery = readlineSync.question('> ');
    
    if (!userQuery.trim()) {
      console.error('Error: Please enter a valid search query');
      return;
    }
    
    console.log('Searching for products...');
    
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4.1-mini',
        messages: [
          {
            role: 'system',
            content: `You are a product search assistant. Your task is to filter products based on user preferences.
            IMPORTANT RULES:
            1. ONLY return products that STRICTLY match ALL of the user's criteria
            2. If the user mentions "in stock" or similar, ONLY return products where in_stock=true
            3. If the user mentions "out of stock" or similar, ONLY return products where in_stock=false
            4. Pay careful attention to price ranges, minimum/maximum ratings, and categories
            5. Return an empty array if no products match ALL criteria`
          },
          {
            role: 'user',
            content: `
              User query: "${userQuery}"
              
              Available products: ${JSON.stringify(products)}
              
              Filter the products based on the user's preferences. Consider criteria like category, price range, minimum rating, and stock availability.
              Remember to STRICTLY follow the filtering rules, especially for in-stock status.
            `
          }
        ],
        functions: [filterProductsFunction],
        function_call: { name: 'filter_products' }
      });

      // Extract the function call arguments
      const functionCall = response.choices[0].message.function_call;
      
      if (functionCall && functionCall.name === 'filter_products') {
        try {
          const args = JSON.parse(functionCall.arguments);
          if (!args.filtered_products || !Array.isArray(args.filtered_products)) {
            console.log('No products found matching your criteria.');
            saveToSampleOutputs(userQuery, [], 'No products found matching the criteria');
            return;
          }
          const formattedProducts = displayFilteredProducts(args.filtered_products);
          saveToSampleOutputs(userQuery, formattedProducts);
        } catch (parseError) {
          console.error('Error parsing OpenAI response:', parseError.message);
          console.log('Please try again with a more specific query.');
          saveToSampleOutputs(userQuery, [], `Error parsing OpenAI response: ${parseError.message}`);
        }
      } else {
        console.log('No products found matching your criteria.');
        saveToSampleOutputs(userQuery, [], 'No products found matching the criteria');
      }
    } catch (apiError) {
      let errorMessage = '';
      if (apiError.status === 429) {
        errorMessage = 'Error: Rate limit exceeded. Please try again later.';
        console.error(errorMessage);
      } else if (apiError.status === 401) {
        errorMessage = 'Error: Invalid API key. Please check your OPENAI_API_KEY in the .env file.';
        console.error(errorMessage);
      } else {
        errorMessage = `OpenAI API Error (${apiError.status || 'unknown'}): ${apiError.message}`;
        console.error(errorMessage);
      }
      console.log('Please try again or check your API configuration.');
      saveToSampleOutputs(userQuery, [], errorMessage);
    }
  } catch (error) {
    console.error('Unexpected error:', error.message);
    process.exit(1);
  }
}

// Start the application
searchProducts();
