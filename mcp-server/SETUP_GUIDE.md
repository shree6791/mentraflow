# MentraFlow MCP Server Setup Guide

## 🚀 For Perplexity (Standard I/O)

### Step 1: Download the MCP Server Script

**Option A: Node.js (Recommended)**
1. Save this file to your computer: `mentraflow-mcp-server.js`
2. Location suggestion: `~/mentraflow/mentraflow-mcp-server.js`

**Option B: Python**
1. Save this file to your computer: `mentraflow-mcp-server.py`
2. Location suggestion: `~/mentraflow/mentraflow-mcp-server.py`

### Step 2: Install Dependencies

**For Node.js:**
```bash
# Node.js is built-in on most systems, no extra dependencies needed!
node --version  # Check if installed
```

**For Python:**
```bash
pip install requests
```

### Step 3: Configure in Perplexity

Click "Add Connector" in Perplexity and fill in:

**Using Node.js:**
```
Server Name: MentraFlow
Command: node
Arguments: /absolute/path/to/mentraflow-mcp-server.js
```

**Using Python:**
```
Server Name: MentraFlow
Command: python3
Arguments: /absolute/path/to/mentraflow-mcp-server.py
```

**Important:** Use the FULL absolute path to the script file!

Example paths:
- macOS/Linux: `/Users/yourname/mentraflow/mentraflow-mcp-server.js`
- Windows: `C:\Users\yourname\mentraflow\mentraflow-mcp-server.js`

### Step 4: Test Connection

1. Click "Save" in Perplexity
2. Look for "MentraFlow" in your connectors list
3. It should show as "Connected" with a green indicator

### Step 5: Export Conversations

1. Have a conversation in Perplexity
2. Click the export/share button
3. Select "Export to MentraFlow"
4. Your conversation will be sent to MentraFlow!
5. Check your MentraFlow dashboard for new concepts and quizzes

---

## 🎯 For Claude Desktop

### Step 1: Edit Configuration File

Click "Edit Config" in Claude Desktop settings

### Step 2: Add MentraFlow Server

Add this to your `claude_desktop_config.json`:

**Using Node.js:**
```json
{
  "mcpServers": {
    "mentraflow": {
      "command": "node",
      "args": ["/absolute/path/to/mentraflow-mcp-server.js"]
    }
  }
}
```

**Using Python:**
```json
{
  "mcpServers": {
    "mentraflow": {
      "command": "python3",
      "args": ["/absolute/path/to/mentraflow-mcp-server.py"]
    }
  }
}
```

### Step 3: Restart Claude Desktop

Close and reopen Claude Desktop for changes to take effect.

### Step 4: Verify

Look for "mentraflow" in your MCP servers list with a green indicator.

---

## 📝 Environment Variables (Optional)

You can customize the MentraFlow API endpoint:

**Perplexity:**
```
Environment Variables:
Key: MENTRAFLOW_API
Value: https://resume-session-13.preview.emergentagent.com/api/mcp/receive-export
```

**Claude Desktop:**
Add to config:
```json
{
  "mcpServers": {
    "mentraflow": {
      "command": "node",
      "args": ["/path/to/mentraflow-mcp-server.js"],
      "env": {
        "MENTRAFLOW_API": "https://resume-session-13.preview.emergentagent.com/api/mcp/receive-export"
      }
    }
  }
}
```

---

## 🔧 Troubleshooting

### "Command not found" error
- **Node.js**: Install from nodejs.org
- **Python**: Install from python.org

### "File not found" error
- Make sure you use the FULL absolute path
- Check file permissions: `chmod +x mentraflow-mcp-server.js`

### Connection fails
- Check your internet connection
- Verify the MentraFlow API endpoint is accessible
- Look at stderr logs for error messages

### No data appearing in MentraFlow
- Check your MentraFlow user_id in the export
- Visit https://resume-session-13.preview.emergentagent.com/mcp-connect to verify endpoint
- Check MCP import history on the MentraFlow dashboard

---

## 📊 How It Works

1. **Perplexity/Claude** → Sends conversation via stdio
2. **MCP Server Script** → Receives via JSON-RPC protocol
3. **Converts** → Transforms to MentraFlow API format
4. **Sends** → Posts to MentraFlow REST API
5. **Processing** → MentraFlow extracts concepts & generates quizzes
6. **Result** → Updates your knowledge graph

---

## 🎉 Success!

Once configured, you can:
- ✅ Export any Perplexity search session to MentraFlow
- ✅ Export Claude conversations
- ✅ Auto-generate quizzes from your chats
- ✅ Build your knowledge graph from AI conversations
- ✅ Schedule spaced recall for permanent retention

---

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Verify file paths are absolute and correct
3. Check that Node.js or Python is installed
4. Visit https://resume-session-13.preview.emergentagent.com/mcp-connect for endpoint status

Happy learning! 🚀
