(function(){"use strict";const f={professional:`
Write a professional, insightful comment. Focus on adding value, sharing business perspective, or highlighting a key takeaway from the post. Maintain a respectful, industry-standard tone.
`,friendly:`
Write a warm, friendly, and encouraging comment. Sound personable and approachable, using positive language. Focus on building a connection.
`,straight:`
Write a direct, straightforward comment. No fluff, no generic pleasantries. Get straight to the point with a clear and concise observation or opinion.
`,technical:`
Write a technically-minded comment. Reference engineering principles, architectural concepts, technical tradeoffs, or data-driven reasoning. Sound like an experienced developer or engineer.
`,"thought-leader":`
Write a thought-provoking, forward-looking comment. Offer a strategic, high-level perspective on the industry trend, challenge the status quo, or paint a picture of the future.
`,curious:`
Write a comment that shows curiosity. End with a thoughtful, open-ended question that invites the author or community to elaborate on a specific point from the post.
`,supportive:`
Write a highly supportive, validating comment. Congratulate them on their achievement, validate their struggle, or express strong agreement with their message.
`,founder:`
Write a comment from a founder's perspective. Focus on execution, agility, market dynamics, product-market fit, startup challenges, or scaling lessons.
`,recruiter:`
Write a comment from a recruiter/talent leader's perspective. Emphasize career growth, company culture, talent acquisition, professional development, or employee branding.
`,student:`
Write a comment from the perspective of an eager learner or student. Show humility, thank the author for the lesson, and ask a polite question seeking advice or mentorship.
`,contrarian:`
Write a comment offering a respectful, alternative viewpoint. Gently challenge a common assumption made in the post, present a different angle, and back it up with logical reasoning. Keep it friendly and professional, never combative.
`,inspirational:`
Write an inspiring and motivational comment. Highlight themes of resilience, hard work, personal growth, vision, or leadership. Use positive and empowering language.
`},y={short:"Keep the comment extremely concise (1 to 2 sentences max). Under 40 words.",medium:"Write a standard comment (3 to 4 sentences). Around 60 to 90 words.",long:"Write a detailed comment (2 to 3 short paragraphs). Around 120 to 180 words, analyzing the topic in depth."};function w(t,e,o,n){const i=`You are a professional LinkedIn Comment Assistant. Your sole job is to help users write high-quality, engaging, and authentic LinkedIn comments based on posts they read.
  
CRITICAL RULE:
- NEVER output placeholders, template variables, or instructions like "[Insert Name]" or "[Your Company]". 
- The generated comment must be immediately ready to be posted without editing, though the user can edit if they wish.
- Do NOT output hashtags unless the user explicitly requested them in the custom instructions.
- Ensure the comment sounds written by a human. Avoid overly clinical, robotic, or AI-sounding words like "delve", "testament", "moreover", "furthermore", "beacon", "catalyst".

Formatting:
- Do not use markdown (like bolding with ** or headings) because LinkedIn comment input does not render markdown. Use clean plain text with standard spacing and paragraphs.`;let a=`Here is the LinkedIn post information:
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

Generate a comment with the following specifications:
1. Tone: ${f[e].trim()}
2. Length: ${y[o]}
`;return n&&n.trim().length>0&&(a+=`
3. Additional Custom Instructions:
- ${n.trim()}
`),a+=`
Generate ONLY the comment text. Do not wrap it in quotes, and do not add any meta-text, introductions, or explanations.`,{systemPrompt:i,userPrompt:a}}async function v(t,e,o){if(!e)return!1;try{if(t==="gemini"){const n=`https://generativelanguage.googleapis.com/v1beta/models/${o}?key=${e}`;return(await fetch(n)).ok}else{if(t==="openai")return(await fetch("https://api.openai.com/v1/models",{headers:{Authorization:`Bearer ${e}`}})).ok;if(t==="groq")return(await fetch("https://api.groq.com/openai/v1/models",{headers:{Authorization:`Bearer ${e}`}})).ok;if(t==="openrouter")return(await fetch("https://openrouter.ai/api/v1/auth/key",{headers:{Authorization:`Bearer ${e}`}})).ok}return!1}catch(n){return console.error("Connection test failed:",n),!1}}async function k(t,e){const{systemPrompt:o,userPrompt:n}=w(e.postData,e.tone,e.length,e.customInstruction);switch(t){case"gemini":return T(e.apiKey,e.model,o,n,e.temperature,e.maxTokens);case"openai":return x(e.apiKey,e.model,o,n,e.temperature,e.maxTokens);case"groq":return A(e.apiKey,e.model,o,n,e.temperature,e.maxTokens);case"openrouter":return b(e.apiKey,e.model,o,n,e.temperature,e.maxTokens);default:throw new Error(`Unsupported provider: ${t}`)}}async function T(t,e,o,n,i,a){var c,u,h,l,p,g;const r=`https://generativelanguage.googleapis.com/v1beta/models/${e}:generateContent?key=${t}`,d=await fetch(r,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts:[{text:n}]}],systemInstruction:{parts:[{text:o}]},generationConfig:{temperature:i,maxOutputTokens:a}})});if(!d.ok){const P=await d.json().catch(()=>({}));throw new Error(((c=P.error)==null?void 0:c.message)||`Gemini API error: ${d.statusText}`)}const s=(g=(p=(l=(h=(u=(await d.json()).candidates)==null?void 0:u[0])==null?void 0:h.content)==null?void 0:l.parts)==null?void 0:p[0])==null?void 0:g.text;if(!s)throw new Error("Gemini API returned an empty response.");return s.trim()}async function x(t,e,o,n,i,a){var s,c,u,h;const r=await fetch("https://api.openai.com/v1/chat/completions",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${t}`},body:JSON.stringify({model:e,messages:[{role:"system",content:o},{role:"user",content:n}],temperature:i,max_tokens:a})});if(!r.ok){const l=await r.json().catch(()=>({}));throw new Error(((s=l.error)==null?void 0:s.message)||`OpenAI API error: ${r.statusText}`)}const m=(h=(u=(c=(await r.json()).choices)==null?void 0:c[0])==null?void 0:u.message)==null?void 0:h.content;if(!m)throw new Error("OpenAI API returned an empty response.");return m.trim()}async function A(t,e,o,n,i,a){var s,c,u,h;const r=await fetch("https://api.groq.com/openapi/v1/chat/completions",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${t}`},body:JSON.stringify({model:e,messages:[{role:"system",content:o},{role:"user",content:n}],temperature:i,max_tokens:a})});if(!r.ok){const l=await r.json().catch(()=>({}));throw new Error(((s=l.error)==null?void 0:s.message)||`Groq API error: ${r.statusText}`)}const m=(h=(u=(c=(await r.json()).choices)==null?void 0:c[0])==null?void 0:u.message)==null?void 0:h.content;if(!m)throw new Error("Groq API returned an empty response.");return m.trim()}async function b(t,e,o,n,i,a){var s,c,u,h;const r=await fetch("https://openrouter.ai/api/v1/chat/completions",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${t}`,"HTTP-Referer":"https://github.com/google-deepmind/antigravity","X-Title":"LinkedIn AI Comment Assistant"},body:JSON.stringify({model:e,messages:[{role:"system",content:o},{role:"user",content:n}],temperature:i,max_tokens:a})});if(!r.ok){const l=await r.json().catch(()=>({}));throw new Error(((s=l.error)==null?void 0:s.message)||`OpenRouter API error: ${r.statusText}`)}const m=(h=(u=(c=(await r.json()).choices)==null?void 0:c[0])==null?void 0:u.message)==null?void 0:h.content;if(!m)throw new Error("OpenRouter API returned an empty response.");return m.trim()}chrome.runtime.onMessage.addListener((t,e,o)=>{if(t.type==="generate-comment"){const{provider:n,params:i}=t.payload;return(async()=>{try{const a=await k(n,i);o({success:!0,comment:a})}catch(a){console.error("API Generation Error:",a),o({success:!1,error:a.message||"Unknown error"})}})(),!0}if(t.type==="test-connection"){const{provider:n,apiKey:i,model:a}=t.payload;return(async()=>{try{const r=await v(n,i,a);o({success:!0,status:r})}catch(r){o({success:!1,error:r.message||"Connection test failed"})}})(),!0}})})();
