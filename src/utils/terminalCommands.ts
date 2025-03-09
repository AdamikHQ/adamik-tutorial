
import React from 'react';

interface CommandResult {
  success: boolean;
  output: React.ReactNode;
  type?: 'success' | 'error' | 'info';
}

interface Command {
  name: string;
  description: string;
  execute: (args: string[]) => CommandResult | Promise<CommandResult>;
}

// Available commands
const commands: Record<string, Command> = {
  help: {
    name: 'help',
    description: 'Shows a list of available commands',
    execute: () => ({
      success: true,
      output: (
        <div>
          <p className="mb-2">Available commands:</p>
          <ul className="list-disc ml-4">
            {Object.values(commands).map((cmd) => (
              <li key={cmd.name} className="mb-1">
                <span className="text-terminal-accent">{cmd.name}</span>: {cmd.description}
              </li>
            ))}
          </ul>
          <p className="mt-2">Type a command to begin.</p>
        </div>
      ),
      type: 'info'
    }),
  },

  clear: {
    name: 'clear',
    description: 'Clears the terminal',
    execute: () => {
      // Special handling for clear in the Terminal component
      return {
        success: true,
        output: 'Terminal cleared',
        type: 'info'
      };
    },
  },

  intro: {
    name: 'intro',
    description: 'Shows an introduction to the API',
    execute: () => ({
      success: true,
      output: `Welcome to our API Terminal!

This interactive guide will help you understand how our API works.
The API follows RESTful principles and uses JSON for data exchange.

To get started, try the following commands:

- 'tutorial' - Start a guided tutorial
- 'endpoints' - View available API endpoints
- 'example' - See code examples

Let me know how I can help you explore our API capabilities.`,
      type: 'info'
    }),
  },

  tutorial: {
    name: 'tutorial',
    description: 'Starts an interactive API tutorial',
    execute: () => ({
      success: true,
      output: (
        <div>
          <p className="mb-2">Welcome to the Interactive API Tutorial</p>
          <p className="mb-2">This tutorial will guide you through the basics of using our API.</p>
          <ol className="list-decimal ml-4 space-y-1">
            <li>Understanding authentication (type 'auth')</li>
            <li>Making your first request (type 'request')</li>
            <li>Handling responses (type 'response')</li>
            <li>Error handling (type 'errors')</li>
            <li>Advanced features (type 'advanced')</li>
          </ol>
          <p className="mt-2">Type 'auth' to begin with authentication.</p>
        </div>
      ),
      type: 'info'
    }),
  },

  auth: {
    name: 'auth',
    description: 'Learn about API authentication',
    execute: () => ({
      success: true,
      output: `Authentication Guide:

Our API uses JWT (JSON Web Tokens) for authentication.

1. Register for an API key in your dashboard
2. Include the API key in the Authorization header:
   
   Authorization: Bearer YOUR_API_KEY

For enhanced security, tokens expire after 24 hours.
Use the refresh token to generate a new access token.

Type 'request' to learn how to make API requests.`,
      type: 'info'
    }),
  },

  request: {
    name: 'request',
    description: 'Learn how to make API requests',
    execute: () => ({
      success: true,
      output: (
        <div>
          <p className="mb-2">Making API Requests:</p>
          <p className="mb-2">Our API accepts GET, POST, PUT, and DELETE requests.</p>
          <p className="mb-2">Example GET request:</p>
          <pre className="bg-gray-800 p-2 rounded text-sm mb-3 overflow-x-auto">
            {`fetch('https://api.example.com/v1/resources', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));`}
          </pre>
          <p>Type 'response' to learn about API responses.</p>
        </div>
      ),
      type: 'info'
    }),
  },

  response: {
    name: 'response',
    description: 'Learn about API responses',
    execute: () => ({
      success: true,
      output: (
        <div>
          <p className="mb-2">API Responses:</p>
          <p className="mb-2">Our API returns JSON responses with consistent structures:</p>
          <pre className="bg-gray-800 p-2 rounded text-sm mb-3 overflow-x-auto">
            {`// Success response
{
  "success": true,
  "data": { ... },  // The requested data
  "meta": {         // Metadata about the response
    "total": 100,
    "page": 1,
    "limit": 10
  }
}

// Error response
{
  "success": false,
  "error": {
    "code": "INVALID_PARAMETER",
    "message": "Invalid parameter: id",
    "details": { ... }  // Additional error context
  }
}`}
          </pre>
          <p>Type 'errors' to learn about error handling.</p>
        </div>
      ),
      type: 'info'
    }),
  },

  errors: {
    name: 'errors',
    description: 'Learn about API error handling',
    execute: () => ({
      success: true,
      output: (
        <div>
          <p className="mb-2">Error Handling:</p>
          <p className="mb-2">Common HTTP status codes:</p>
          <ul className="list-disc ml-4 mb-3">
            <li>200 - OK: Request succeeded</li>
            <li>201 - Created: Resource created successfully</li>
            <li>400 - Bad Request: Invalid parameters</li>
            <li>401 - Unauthorized: Authentication required</li>
            <li>403 - Forbidden: Insufficient permissions</li>
            <li>404 - Not Found: Resource doesn't exist</li>
            <li>429 - Too Many Requests: Rate limit exceeded</li>
            <li>500 - Server Error: Something went wrong on our end</li>
          </ul>
          <p className="mb-2">Best practices for handling errors:</p>
          <ul className="list-disc ml-4">
            <li>Always check the response status code</li>
            <li>Implement retry logic with exponential backoff for 429 and 5xx errors</li>
            <li>Log complete error objects for debugging</li>
          </ul>
          <p className="mt-2">Type 'advanced' to continue to advanced features.</p>
        </div>
      ),
      type: 'info'
    }),
  },

  advanced: {
    name: 'advanced',
    description: 'Learn about advanced API features',
    execute: () => ({
      success: true,
      output: (
        <div>
          <p className="mb-2">Advanced API Features:</p>
          <ol className="list-decimal ml-4 space-y-1 mb-3">
            <li>
              <span className="font-bold">Pagination</span>: Control the number of results with 
              <code className="mx-1 bg-gray-800 px-1 rounded">?page=1&limit=10</code> parameters
            </li>
            <li>
              <span className="font-bold">Filtering</span>: Filter results with 
              <code className="mx-1 bg-gray-800 px-1 rounded">?filter[field]=value</code>
            </li>
            <li>
              <span className="font-bold">Sorting</span>: Sort results with
              <code className="mx-1 bg-gray-800 px-1 rounded">?sort=field</code> or 
              <code className="mx-1 bg-gray-800 px-1 rounded">?sort=-field</code> (descending)
            </li>
            <li>
              <span className="font-bold">Field selection</span>: Request specific fields with
              <code className="mx-1 bg-gray-800 px-1 rounded">?fields=id,name,email</code>
            </li>
            <li>
              <span className="font-bold">Webhooks</span>: Subscribe to real-time events
            </li>
          </ol>
          <p className="mb-2">Congratulations! You've completed the API tutorial.</p>
          <p>Type 'endpoints' to see the available API endpoints or 'example' for more code examples.</p>
        </div>
      ),
      type: 'info'
    }),
  },

  endpoints: {
    name: 'endpoints',
    description: 'View available API endpoints',
    execute: () => ({
      success: true,
      output: (
        <div>
          <p className="mb-2">Available API Endpoints:</p>
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                <th className="text-left py-1 px-2 text-terminal-accent">Method</th>
                <th className="text-left py-1 px-2 text-terminal-accent">Endpoint</th>
                <th className="text-left py-1 px-2 text-terminal-accent">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-1 px-2">GET</td>
                <td className="py-1 px-2">/v1/users</td>
                <td className="py-1 px-2">List all users</td>
              </tr>
              <tr>
                <td className="py-1 px-2">GET</td>
                <td className="py-1 px-2">/v1/users/:id</td>
                <td className="py-1 px-2">Get a single user</td>
              </tr>
              <tr>
                <td className="py-1 px-2">POST</td>
                <td className="py-1 px-2">/v1/users</td>
                <td className="py-1 px-2">Create a new user</td>
              </tr>
              <tr>
                <td className="py-1 px-2">PUT</td>
                <td className="py-1 px-2">/v1/users/:id</td>
                <td className="py-1 px-2">Update a user</td>
              </tr>
              <tr>
                <td className="py-1 px-2">DELETE</td>
                <td className="py-1 px-2">/v1/users/:id</td>
                <td className="py-1 px-2">Delete a user</td>
              </tr>
              <tr>
                <td className="py-1 px-2">GET</td>
                <td className="py-1 px-2">/v1/products</td>
                <td className="py-1 px-2">List all products</td>
              </tr>
              <tr>
                <td className="py-1 px-2">POST</td>
                <td className="py-1 px-2">/v1/auth/login</td>
                <td className="py-1 px-2">Authenticate a user</td>
              </tr>
              <tr>
                <td className="py-1 px-2">POST</td>
                <td className="py-1 px-2">/v1/auth/refresh</td>
                <td className="py-1 px-2">Refresh authentication token</td>
              </tr>
            </tbody>
          </table>
          <p className="mt-2">For more details, type 'example' to see code examples.</p>
        </div>
      ),
      type: 'info'
    }),
  },

  example: {
    name: 'example',
    description: 'Shows code examples',
    execute: () => ({
      success: true,
      output: (
        <div>
          <p className="mb-2">Code Examples:</p>
          
          <p className="mt-3 mb-1 text-terminal-accent">JavaScript/Node.js Example:</p>
          <pre className="bg-gray-800 p-2 rounded text-sm mb-3 overflow-x-auto">
{`// Using async/await with fetch
async function getUsers() {
  try {
    const response = await fetch('https://api.example.com/v1/users', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer YOUR_API_KEY',
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }
    
    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error('Error fetching users:', error);
  }
}`}
          </pre>
          
          <p className="mt-3 mb-1 text-terminal-accent">Python Example:</p>
          <pre className="bg-gray-800 p-2 rounded text-sm mb-3 overflow-x-auto">
{`# Using requests library
import requests

def get_users():
    url = "https://api.example.com/v1/users"
    headers = {
        "Authorization": "Bearer YOUR_API_KEY",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()  # Raise exception for 4XX/5XX responses
        return response.json()
    except requests.exceptions.HTTPError as err:
        print(f"HTTP Error: {err}")
    except requests.exceptions.RequestException as err:
        print(f"Request Error: {err}")
        
# Call the function
users = get_users()
print(users)`}
          </pre>

          <p className="mt-2">Type 'help' to see all available commands.</p>
        </div>
      ),
      type: 'info'
    }),
  },
};

// Handle command execution
export const executeCommand = async (input: string): Promise<CommandResult> => {
  const trimmedInput = input.trim();
  if (!trimmedInput) {
    return {
      success: false,
      output: 'Please enter a command.',
      type: 'error'
    };
  }

  const parts = trimmedInput.split(' ');
  const commandName = parts[0].toLowerCase();
  const args = parts.slice(1);

  const command = commands[commandName];
  
  if (!command) {
    return {
      success: false,
      output: `Command not found: ${commandName}. Type 'help' to see available commands.`,
      type: 'error'
    };
  }

  try {
    return await command.execute(args);
  } catch (error) {
    console.error('Command execution error:', error);
    return {
      success: false,
      output: `An error occurred while executing '${commandName}'.`,
      type: 'error'
    };
  }
};
