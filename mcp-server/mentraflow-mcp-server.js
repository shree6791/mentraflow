#!/usr/bin/env node

/**
 * MentraFlow MCP Server
 * Bridges Perplexity/Claude to MentraFlow API
 * Protocol: JSON-RPC over stdio
 */

const https = require('https');

// MentraFlow API endpoint (from environment or default)
const MENTRAFLOW_API = process.env.MENTRAFLOW_ENDPOINT || 'https://resume-session-13.preview.emergentagent.com/api/mcp/receive-export';
const DEFAULT_USER_ID = process.env.MENTRAFLOW_USER_ID || null;

// JSON-RPC response helper
function sendResponse(id, result) {
  const response = {
    jsonrpc: '2.0',
    id: id,
    result: result
  };
  console.log(JSON.stringify(response));
}

function sendError(id, code, message) {
  const response = {
    jsonrpc: '2.0',
    id: id,
    error: {
      code: code,
      message: message
    }
  };
  console.log(JSON.stringify(response));
}

// Send data to MentraFlow
function exportToMentraFlow(userId, conversations) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      user_id: userId,
      conversations: conversations,
      export_timestamp: new Date().toISOString()
    });

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = https.request(MENTRAFLOW_API, options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(body));
        } else {
          reject(new Error(`API returned ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.write(data);
    req.end();
  });
}

// Handle MCP protocol messages
function handleMessage(message) {
  try {
    const request = JSON.parse(message);
    
    // Handle different MCP methods
    switch (request.method) {
      case 'initialize':
        sendResponse(request.id, {
          protocolVersion: '2024-11-05',
          serverInfo: {
            name: 'mentraflow',
            version: '1.0.0'
          },
          capabilities: {
            tools: {}
          }
        });
        break;

      case 'tools/list':
        sendResponse(request.id, {
          tools: [
            {
              name: 'export_to_mentraflow',
              description: 'Export conversations to MentraFlow for knowledge retention and quiz generation',
              inputSchema: {
                type: 'object',
                properties: {
                  user_id: {
                    type: 'string',
                    description: 'MentraFlow user ID'
                  },
                  conversations: {
                    type: 'array',
                    description: 'Array of conversations to export',
                    items: {
                      type: 'object',
                      properties: {
                        conversation_id: { type: 'string' },
                        platform: { type: 'string' },
                        title: { type: 'string' },
                        messages: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              role: { type: 'string' },
                              content: { type: 'string' }
                            }
                          }
                        }
                      }
                    }
                  }
                },
                required: ['user_id', 'conversations']
              }
            }
          ]
        });
        break;

      case 'tools/call':
        if (request.params.name === 'export_to_mentraflow') {
          const { user_id, conversations } = request.params.arguments;
          
          exportToMentraFlow(user_id, conversations)
            .then((result) => {
              sendResponse(request.id, {
                content: [
                  {
                    type: 'text',
                    text: `✅ Successfully exported ${conversations.length} conversation(s) to MentraFlow!\n\n` +
                          `📊 Processing Summary:\n` +
                          `- Concepts extracted: ${result.concepts_extracted || 'Processing...'}\n` +
                          `- Quizzes generated: ${result.quizzes_generated || 'Processing...'}\n` +
                          `- Import ID: ${result.import_id}\n\n` +
                          `Your knowledge graph is being updated. Check MentraFlow dashboard for new concepts and quizzes!`
                  }
                ]
              });
            })
            .catch((error) => {
              sendError(request.id, -32603, `Failed to export: ${error.message}`);
            });
        } else {
          sendError(request.id, -32601, 'Method not found');
        }
        break;

      default:
        sendError(request.id, -32601, 'Method not found');
    }
  } catch (error) {
    console.error('Error handling message:', error);
    sendError(null, -32700, 'Parse error');
  }
}

// Main: Read from stdin, write to stdout
let buffer = '';

process.stdin.on('data', (chunk) => {
  buffer += chunk.toString();
  
  // Process complete messages (newline-delimited JSON)
  const lines = buffer.split('\n');
  buffer = lines.pop() || ''; // Keep incomplete line in buffer
  
  lines.forEach((line) => {
    if (line.trim()) {
      handleMessage(line);
    }
  });
});

process.stdin.on('end', () => {
  process.exit(0);
});

// Log startup to stderr (doesn't interfere with JSON-RPC on stdout)
console.error('MentraFlow MCP Server started');
console.error(`API Endpoint: ${MENTRAFLOW_API}`);
