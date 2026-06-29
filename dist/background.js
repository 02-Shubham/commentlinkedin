(function(){"use strict";const f={short:"Keep the comment extremely concise (1 to 2 sentences max). Under 40 words.",medium:"Write a standard comment (3 to 4 sentences). Around 60 to 90 words.",long:"Write a detailed comment (2 to 3 short paragraphs). Around 120 to 180 words, analyzing the topic in depth."};function y(t,e,o){const n=`You are a professional LinkedIn Comment Assistant. Your sole job is to help users write high-quality, engaging, and authentic LinkedIn comments based on posts they read.
  
CRITICAL INSTRUCTIONS FOR TONE:
- Analyze the style, topic, and sentiment of the LinkedIn post. 
- Write the comment in a tone that is most natural and contextually appropriate for this specific post (e.g. professional and encouraging for achievements, analytical and technical for engineering/data posts, strategic and high-level for industry updates).
- Sound like a real human. Never use generic, robotic, or overly enthusiastic phrases. Avoid standard AI buzzwords like "delve", "testament", "moreover", "furthermore", "beacon", "catalyst".

CRITICAL RULE:
- NEVER output placeholders, template variables, or instructions like "[Insert Name]" or "[Your Company]". 
- The generated comment must be immediately ready to be posted without editing.
- Do NOT output hashtags unless the user explicitly requested them in the custom instructions.

Formatting:
- Do not use markdown (like bolding with ** or headings) because LinkedIn comments do not render markdown. Use clean plain text with standard spacing and paragraphs.`;let s=`Here is the LinkedIn post information:
${t.author?`Post Author: ${t.author}
`:""}
Post Content:
"""
${t.postText}
"""
${t.mediaDescription?`Visual Media Description: ${t.mediaDescription}
`:""}
${t.hashtags.length>0?`Post Hashtags: ${t.hashtags.join(", ")}
`:""}
${t.hasImages?`Post contains ${t.imageCount} image(s).
`:""}

Generate a comment with the following specifications:
1. Length: ${f[e]}
`;return(!t.postText||t.postText.trim().length<20)&&(s+=`
CRITICAL INSTRUCTION FOR SPARSE/NO TEXT POSTS:
- The post has very little or no commentary/text. 
- If a "Visual Media Description" is provided above, comment constructively on the shared visual content or theme.
- If there is no visual description, write a friendly, professional, and positive comment appropriate for a LinkedIn post (e.g. praising their share, expressing positive interest, or congratulating them if the author/context suggests an achievement or update).
- Under no circumstances should you say "No content to comment on." or state that you cannot generate a comment. Write a real, encouraging, and engaging comment.
`),o&&o.trim().length>0&&(s+=`
2. Additional Custom Instructions (override tone or topic if requested here):
- ${o.trim()}
`),s+=`
Generate ONLY the comment text. Do not wrap it in quotes, and do not add any meta-text, introductions, or explanations.`,{systemPrompt:n,userPrompt:s}}async function w(t,e,o){if(!e)return!1;try{if(t==="gemini"){const n=`https://generativelanguage.googleapis.com/v1beta/models/${o}?key=${e}`;return(await fetch(n)).ok}else{if(t==="openai")return(await fetch("https://api.openai.com/v1/models",{headers:{Authorization:`Bearer ${e}`}})).ok;if(t==="groq")return(await fetch("https://api.groq.com/openai/v1/models",{headers:{Authorization:`Bearer ${e}`}})).ok;if(t==="openrouter")return(await fetch("https://openrouter.ai/api/v1/auth/key",{headers:{Authorization:`Bearer ${e}`}})).ok}return!1}catch(n){return console.error("Connection test failed:",n),!1}}async function T(t,e){const{systemPrompt:o,userPrompt:n}=y(e.postData,e.length,e.customInstruction);switch(t){case"gemini":return I(e.apiKey,e.model,o,n,e.temperature,e.maxTokens);case"openai":return k(e.apiKey,e.model,o,n,e.temperature,e.maxTokens);case"groq":return x(e.apiKey,e.model,o,n,e.temperature,e.maxTokens);case"openrouter":return A(e.apiKey,e.model,o,n,e.temperature,e.maxTokens);default:throw new Error(`Unsupported provider: ${t}`)}}async function I(t,e,o,n,s,a){var c,u,m,d,p,g;const r=`https://generativelanguage.googleapis.com/v1beta/models/${e}:generateContent?key=${t}`,l=await fetch(r,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts:[{text:n}]}],systemInstruction:{parts:[{text:o}]},generationConfig:{temperature:s,maxOutputTokens:a}})});if(!l.ok){const v=await l.json().catch(()=>({}));throw new Error(((c=v.error)==null?void 0:c.message)||`Gemini API error: ${l.statusText}`)}const i=(g=(p=(d=(m=(u=(await l.json()).candidates)==null?void 0:u[0])==null?void 0:m.content)==null?void 0:d.parts)==null?void 0:p[0])==null?void 0:g.text;if(!i)throw new Error("Gemini API returned an empty response.");return i.trim()}async function k(t,e,o,n,s,a){var i,c,u,m;const r=await fetch("https://api.openai.com/v1/chat/completions",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${t}`},body:JSON.stringify({model:e,messages:[{role:"system",content:o},{role:"user",content:n}],temperature:s,max_tokens:a})});if(!r.ok){const d=await r.json().catch(()=>({}));throw new Error(((i=d.error)==null?void 0:i.message)||`OpenAI API error: ${r.statusText}`)}const h=(m=(u=(c=(await r.json()).choices)==null?void 0:c[0])==null?void 0:u.message)==null?void 0:m.content;if(!h)throw new Error("OpenAI API returned an empty response.");return h.trim()}async function x(t,e,o,n,s,a){var i,c,u,m;const r=await fetch("https://api.groq.com/openai/v1/chat/completions",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${t}`},body:JSON.stringify({model:e,messages:[{role:"system",content:o},{role:"user",content:n}],temperature:s,max_tokens:a})});if(!r.ok){const d=await r.json().catch(()=>({}));throw new Error(((i=d.error)==null?void 0:i.message)||`Groq API error: ${r.statusText}`)}const h=(m=(u=(c=(await r.json()).choices)==null?void 0:c[0])==null?void 0:u.message)==null?void 0:m.content;if(!h)throw new Error("Groq API returned an empty response.");return h.trim()}async function A(t,e,o,n,s,a){var i,c,u,m;const r=await fetch("https://openrouter.ai/api/v1/chat/completions",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${t}`,"HTTP-Referer":"https://github.com/google-deepmind/antigravity","X-Title":"LinkedIn AI Comment Assistant"},body:JSON.stringify({model:e,messages:[{role:"system",content:o},{role:"user",content:n}],temperature:s,max_tokens:a})});if(!r.ok){const d=await r.json().catch(()=>({}));throw new Error(((i=d.error)==null?void 0:i.message)||`OpenRouter API error: ${r.statusText}`)}const h=(m=(u=(c=(await r.json()).choices)==null?void 0:c[0])==null?void 0:u.message)==null?void 0:m.content;if(!h)throw new Error("OpenRouter API returned an empty response.");return h.trim()}chrome.runtime.onMessage.addListener((t,e,o)=>{if(t.type==="generate-comment"){const{provider:n,params:s}=t.payload;return(async()=>{try{const a=await T(n,s);o({success:!0,comment:a})}catch(a){console.error("API Generation Error:",a),o({success:!1,error:a.message||"Unknown error"})}})(),!0}if(t.type==="test-connection"){const{provider:n,apiKey:s,model:a}=t.payload;return(async()=>{try{const r=await w(n,s,a);o({success:!0,status:r})}catch(r){o({success:!1,error:r.message||"Connection test failed"})}})(),!0}})})();
