#!/usr/bin/env python3
"""
MentraFlow MCP Server (Python)
Bridges Perplexity/Claude to MentraFlow API
Protocol: JSON-RPC over stdio
"""

import json
import sys
import requests
from datetime import datetime

MENTRAFLOW_API = 'https://resume-session-13.preview.emergentagent.com/api/mcp/receive-export'

def send_response(request_id, result):
    """Send JSON-RPC success response"""
    response = {
        'jsonrpc': '2.0',
        'id': request_id,
        'result': result
    }
    print(json.dumps(response), flush=True)

def send_error(request_id, code, message):
    """Send JSON-RPC error response"""
    response = {
        'jsonrpc': '2.0',
        'id': request_id,
        'error': {
            'code': code,
            'message': message
        }
    }
    print(json.dumps(response), flush=True)

def export_to_mentraflow(user_id, conversations):
    """Send data to MentraFlow API"""
    try:
        payload = {
            'user_id': user_id,
            'conversations': conversations,
            'export_timestamp': datetime.utcnow().isoformat()
        }
        
        response = requests.post(
            MENTRAFLOW_API,
            json=payload,
            headers={'Content-Type': 'application/json'},
            timeout=30
        )
        
        response.raise_for_status()
        return response.json()
    except Exception as e:
        raise Exception(f"Failed to export: {str(e)}")

def handle_message(message):
    """Handle incoming MCP protocol message"""
    try:
        request = json.loads(message)
        request_id = request.get('id')
        method = request.get('method')
        
        if method == 'initialize':
            send_response(request_id, {
                'protocolVersion': '2024-11-05',
                'serverInfo': {
                    'name': 'mentraflow',
                    'version': '1.0.0'
                },
                'capabilities': {
                    'tools': {}
                }
            })
        
        elif method == 'tools/list':
            send_response(request_id, {
                'tools': [
                    {
                        'name': 'export_to_mentraflow',
                        'description': 'Export conversations to MentraFlow for knowledge retention and quiz generation',
                        'inputSchema': {
                            'type': 'object',
                            'properties': {
                                'user_id': {
                                    'type': 'string',
                                    'description': 'MentraFlow user ID'
                                },
                                'conversations': {
                                    'type': 'array',
                                    'description': 'Array of conversations to export'
                                }
                            },
                            'required': ['user_id', 'conversations']
                        }
                    }
                ]
            })
        
        elif method == 'tools/call':
            params = request.get('params', {})
            if params.get('name') == 'export_to_mentraflow':
                args = params.get('arguments', {})
                user_id = args.get('user_id')
                conversations = args.get('conversations', [])
                
                result = export_to_mentraflow(user_id, conversations)
                
                send_response(request_id, {
                    'content': [
                        {
                            'type': 'text',
                            'text': f"✅ Successfully exported {len(conversations)} conversation(s) to MentraFlow!\n\n"
                                   f"📊 Processing Summary:\n"
                                   f"- Import ID: {result.get('import_id', 'N/A')}\n"
                                   f"- Status: {result.get('message', 'Processing...')}\n\n"
                                   f"Your knowledge graph is being updated. Check MentraFlow dashboard!"
                        }
                    ]
                })
            else:
                send_error(request_id, -32601, 'Method not found')
        
        else:
            send_error(request_id, -32601, 'Method not found')
    
    except json.JSONDecodeError:
        send_error(None, -32700, 'Parse error')
    except Exception as e:
        send_error(request_id if 'request' in locals() else None, -32603, str(e))

def main():
    """Main loop: read from stdin, write to stdout"""
    print('MentraFlow MCP Server started', file=sys.stderr)
    print(f'API Endpoint: {MENTRAFLOW_API}', file=sys.stderr)
    
    for line in sys.stdin:
        line = line.strip()
        if line:
            handle_message(line)

if __name__ == '__main__':
    main()
