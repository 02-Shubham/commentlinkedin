# LinkedIn AI Comment Assistant 🚀

A premium, privacy-focused Chrome Extension designed to elevate your LinkedIn engagement using state-of-the-art AI models. This extension helps you draft thoughtful, highly relevant, and engaging comments on LinkedIn posts, keeping your workflows fast while ensuring full control over what you post.

---

## 🌟 Why This Extension is Better Than Others

Most LinkedIn AI tools are built as centralized SaaS products. Here is how this assistant stands out:

### 1. 🔒 Privacy-First & Direct APIs (Bring Your Own Key)
* **No Middleman Servers:** Your API keys and drafted comments are stored safely in your browser's local storage (`chrome.storage.local`). They are never uploaded to a third-party server.
* **Direct Connections:** All API requests go directly from your machine to the respective AI providers (Google, OpenAI, Groq, or OpenRouter).

### 2. 🛡️ Account Safety & Zero Automation Risks
* **No Autoposting or Scraping Bots:** LinkedIn actively monitors and bans accounts using automation scripts or headless browsers. This extension **never** auto-clicks the "Comment" or "Post" buttons.
* **Human-in-the-Loop:** It acts as a draft assistant. It extracts the post text, drafts a response in a sleek floating panel, and lets you review, edit, and manually insert/post it. Your account remains 100% compliant with LinkedIn's terms of service.

### 3. 🧠 Multi-Provider Flexibility
Why lock yourself into a single model? Swap between different providers on the fly based on speed, cost, or quality:
* **Google Gemini** (Gemini 1.5 Flash & Pro)
* **OpenAI** (GPT-4o & GPT-4o mini)
* **Groq** (Ultra-fast Llama 3.3 70B & Mixtral)
* **OpenRouter** (For access to hundreds of open-source and proprietary models)

### 4. ✨ Exquisite UX/UI
* **Glassmorphic Floating Panel:** A gorgeous, modern overlay that blends beautifully with LinkedIn's layout.
* **Custom Instructions:** Add custom rules (e.g., *"Make it sound professional but witty," "disagree politely,"* or *"respond in Spanish"*).
* **Length Adjustments:** Choose between Short, Medium, or Long comments.
* **History Log:** View and reuse your previously generated comments locally.

---

## 🛠️ How to Set Up & Build the Project (For Developers)

### Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed.

### 1. Clone & Install Dependencies
```bash
# Install package dependencies
npm install
```

### 2. Build the Extension
Build the extension locally. The build script uses Vite to bundle the popup, options page, background service worker, and inject Tailwind CSS styles into the content script:
```bash
npm run build
```
This generates a production-ready extension directory inside the `/dist` folder.

### 3. Load the Extension into Chrome
1. Open Google Chrome and navigate to `chrome://extensions/`.
2. Enable **Developer mode** using the toggle switch in the top-right corner.
3. Click **Load unpacked** in the top-left corner.
4. Select the **`dist`** folder from this project directory.

---

## 📖 How to Use the Extension

### Step 1: Configure Your AI Provider
1. Click the **LinkedIn AI Comment Assistant** icon in your Chrome toolbar to open the popup.
2. Select your preferred provider (e.g., Google Gemini).
3. Paste your API Key and select your preferred model.
4. Save the configuration.

### Step 2: Generate Comments on LinkedIn
1. Open [LinkedIn](https://www.linkedin.com) and find any post.
2. A sleek AI Comment icon will appear near the comment box of the post.
3. Click the icon to open the **Floating Assistant Panel**.
4. Customize your length, add any optional instructions, and click **Generate**.
5. Once generated, you can review the text, click **Insert** to put it in LinkedIn's comment input field, make final edits, and hit post!
