document.getElementById("summarize").addEventListener("click", async () => {
  const resultDiv = document.getElementById("result");
  resultDiv.innerHTML = '<div class="loading"><div class="loader"></div></div>';

  const summaryType = document.getElementById("summary-type").value;

  // Get API key from storage
  chrome.storage.sync.get(["geminiApiKey"], async (result) => {
    if (!result.geminiApiKey) {
      resultDiv.innerHTML =
        "API key not found. Please set your API key in the extension options.";
      return;
    }

    chrome.tabs.query({ active: true, currentWindow: true }, async ([tab]) => {
      if (chrome.runtime.lastError || !tab) {
        resultDiv.innerText = "Error: Could not access the current tab.";
        return;
      }

      // Helper function to inject script and send message
      const injectAndSendMessage = async () => {
        try {
          // First try to inject the script (safe to do even if already injected)
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ["content.js"],
          });
          
          // Small delay to ensure script is initialized
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Now send the message
          chrome.tabs.sendMessage(
            tab.id,
            { type: "GET_ARTICLE_TEXT" },
            async (res) => {
              if (chrome.runtime.lastError) {
                resultDiv.innerText =
                  "Error: Could not communicate with content script. This may happen on special pages (like chrome:// or extension pages). Please try on a regular webpage.";
                return;
              }
              handleResponse(res);
            }
          );
        } catch (error) {
          // If injection fails, try sending message anyway (script might already be injected)
          chrome.tabs.sendMessage(
            tab.id,
            { type: "GET_ARTICLE_TEXT" },
            async (res) => {
              if (chrome.runtime.lastError) {
                resultDiv.innerText =
                  "Error: Could not inject or communicate with content script. This page may not support script injection. Please try on a regular webpage.";
                return;
              }
              handleResponse(res);
            }
          );
        }
      };

      // Helper function to handle the response from content script
      const handleResponse = async (res) => {
        if (!res || !res.text || res.text.trim() === "") {
          resultDiv.innerText =
            "Could not extract article text from this page. Make sure the page has loaded completely.";
          return;
        }

        try {
          const summary = await getGeminiSummary(
            res.text,
            summaryType,
            result.geminiApiKey
          );
          resultDiv.innerText = summary;
        } catch (error) {
          resultDiv.innerText = `Error: ${
            error.message || "Failed to generate summary."
          }`;
        }
      };

      // Inject script and send message
      injectAndSendMessage();
    });
  });
});

document.getElementById("copy-btn").addEventListener("click", () => {
  const summaryText = document.getElementById("result").innerText;

  if (summaryText && summaryText.trim() !== "") {
    navigator.clipboard
      .writeText(summaryText)
      .then(() => {
        const copyBtn = document.getElementById("copy-btn");
        const originalText = copyBtn.innerText;

        copyBtn.innerText = "Copied!";
        setTimeout(() => {
          copyBtn.innerText = originalText;
        }, 2000);
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
      });
  }
});

async function getGeminiSummary(text, summaryType, apiKey) {
  // Truncate very long texts to avoid API limits (typically around 30K tokens)
  const maxLength = 20000;
  const truncatedText =
    text.length > maxLength ? text.substring(0, maxLength) + "..." : text;

  let prompt;
  switch (summaryType) {
    case "brief":
      prompt = `Provide a brief summary of the following article in 2-3 sentences:\n\n${truncatedText}`;
      break;
    case "detailed":
      prompt = `Provide a detailed summary of the following article, covering all main points and key details:\n\n${truncatedText}`;
      break;
    case "bullets":
      prompt = `Summarize the following article in 5-7 key points. Format each point as a line starting with "- " (dash followed by a space). Do not use asterisks or other bullet symbols:\n\n${truncatedText}`;
      break;
    default:
      prompt = `Summarize the following article:\n\n${truncatedText}`;
  }

  try {
    // First, try to get list of available models
    let availableModels = [];
    
    try {
      // Try v1beta first
      const listRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
      );
      if (listRes.ok) {
        const listData = await listRes.json();
        availableModels = (listData.models || [])
          .filter(m => m.name && m.supportedGenerationMethods?.includes('generateContent'))
          .map(m => ({ 
            version: "v1beta", 
            model: m.name.replace('models/', ''),
            fullName: m.name 
          }));
      }
    } catch (e) {
      console.log("Could not list models from v1beta, trying v1...");
    }
    
    // If no models found, try v1
    if (availableModels.length === 0) {
      try {
        const listRes = await fetch(
          `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`
        );
        if (listRes.ok) {
          const listData = await listRes.json();
          availableModels = (listData.models || [])
            .filter(m => m.name && m.supportedGenerationMethods?.includes('generateContent'))
            .map(m => ({ 
              version: "v1", 
              model: m.name.replace('models/', ''),
              fullName: m.name 
            }));
        }
      } catch (e) {
        console.log("Could not list models from v1");
      }
    }
    
    // Fallback to common model names if listing fails
    if (availableModels.length === 0) {
      availableModels = [
        { version: "v1beta", model: "gemini-1.5-flash-latest" },
        { version: "v1beta", model: "gemini-1.5-flash" },
        { version: "v1beta", model: "gemini-1.5-pro-latest" },
        { version: "v1beta", model: "gemini-1.5-pro" },
        { version: "v1beta", model: "gemini-pro" },
        { version: "v1", model: "gemini-pro" },
      ];
    }
    
    console.log(`Trying ${availableModels.length} models:`, availableModels.map(m => `${m.model} (${m.version})`));

    let lastError = null;
    
    for (const { version, model } of availableModels) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/${version}/models/${model}:generateContent?key=${apiKey}`;
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: prompt }],
              },
            ],
            generationConfig: {
              temperature: 0.2,
            },
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const summary = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (summary) {
            console.log(`Successfully used model: ${model} (${version})`);
            return summary;
          }
        } else {
          let errorData;
          try {
            errorData = await res.json();
          } catch (e) {
            errorData = { error: { message: `HTTP ${res.status}: ${res.statusText}` } };
          }
          lastError = errorData.error?.message || `HTTP ${res.status}: ${res.statusText}`;
          console.log(`Model ${model} (${version}) failed:`, lastError);
          // Continue to next model
          continue;
        }
      } catch (error) {
        lastError = error.message;
        console.log(`Model ${model} (${version}) error:`, lastError);
        // Continue to next model
        continue;
      }
    }

    // If all models failed, provide helpful error message
    const errorMsg = lastError || "All model attempts failed.";
    throw new Error(`${errorMsg} Please verify:\n1. Your API key is valid\n2. Gemini API is enabled in Google Cloud Console\n3. Your API key has proper permissions`);
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw error.message ? error : new Error("Failed to generate summary. Please verify your API key is valid and has access to Gemini API.");
  }
}
