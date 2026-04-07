export async function generateTheologicalInsight(passage, theme, styleMode, lens = 'Generic') {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;

  if (!apiKey) {
    console.info("Anthropic API key not found. Returning structural mock data.");
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2500));

    return `# ${styleMode}: The Theology of ${theme || 'The Passage'}

## Exegetical Overview of ${passage}
The text presents a profound shift in theological understanding. In examining the Greek morphology, we see...

## Primary Themes
- **Divine Intervention**: The mechanism by which grace operates.
- **Human Response**: The faithful reception.
- **Eschatological Hope**: The ultimate restoration of all things.

## Obsidian Formatting Tags
#theology #exegesis #sermon-prep
`;
  }

  // Define strict system rules for orthodox theology and formatting
  const systemPrompt = `You are an expert orthodox theological assistant, homiletician, and biblical scholar. 
Your purpose is to assist pastors in rigorous sermon preparation by generating deep, historical, and dogmatic insights.
Always produce output that is deeply rooted in robust, historical Christian orthodoxy. Never provide superficial or cliché answers.
Focus on rigorous exegesis, historical context, and profound pastoral theology.
YOU MUST follow these strict formatting rules:
1. Always begin your response with YAML frontmatter.
2. Employ structured hierarchical Markdown (H1, H2, H3).
3. Every primary insight should be substantiated with deep theological rationale or biblical cross-references.
4. Provide the exact raw markdown meant to be saved as an Obsidian .md file, without any conversational preamble or postscript.`;

  const safeTitle = passage ? passage.replace(/"/g, "'") : "Passage";
  const safeDate = new Date().toISOString().split('T')[0];
  const formattedStyle = styleMode ? styleMode.toLowerCase() : "theology";

  const prompt = `
Please synthesize a deep, scholarly analysis based on the following parameters:
- **Biblical Passage / Concept**: ${passage}
- **Constraints & Focus Theme**: ${theme}
- **Processing Style**: ${styleMode}
- **Theological Framework/Lens**: Strict analysis through the historical and dogmatic lens of **${lens}**.

Output perfectly structured Markdown ready for my Obsidian Vault. Ensure you include standard YAML frontmatter at the absolute top of your response containing:
---
title: "${safeTitle} - ${styleMode}"
tags: [theology, ${formattedStyle}, sermonForge]
date: "${safeDate}"
---
  `;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerously-allow-browser': 'true' // For MVP client-side demo only
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20240620",
        max_tokens: 2500,
        system: systemPrompt,
        messages: [{ role: "user", content: prompt }]
      })
    });

    const data = await response.json();
    return data.content[0].text;

  } catch (error) {
    console.error("Error generating insight:", error);
    return "Error: Could not reach the AI provider.";
  }
}

export async function architectSermonSeries(book, duration, theme, lens = 'Generic') {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;

  if (!apiKey) {
    // Generate mock series structure
    return {
      title: `${book} Series - Unpacking ${theme}`,
      weeks: Array.from({ length: duration }, (_, i) => ({
        week: i + 1,
        passage: `${book} Ch ${i + 1}`,
        subtheme: `Sub-theme for context ${i + 1}`
      }))
    };
  }

  const systemPrompt = `You are a master homiletician and series architect. Your sole job is to take a book of the Bible, a timeframe, and an overarching theme, and break it down into a highly coherent, theological multi-week sermon series. Analyze it strictly through the theological lens of: ${lens}. 
You must return your output ONLY as raw, valid JSON matching this exact structure, with no markdown formatting around it:
{
  "title": "String title of the series",
  "weeks": [
    {
      "week": 1,
      "passage": "Book Chapter:Verse-Verse",
      "subtheme": "One sentence describing the focus of this specific week"
    }
  ]
}`;

  const prompt = `Map out a ${duration}-week sermon series through the book of ${book}. The overarching theme we want to tie every week back to is: "${theme}". Please architect the exegetical arc cleanly.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerously-allow-browser': 'true'
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20240620",
        max_tokens: 1500,
        system: systemPrompt,
        messages: [{ role: "user", content: prompt }]
      })
    });

    const data = await response.json();
    try {
      // Claude might wrap JSON in markdown block, extract if necessary
      let rawResponse = data.content[0].text;
      if (rawResponse.includes('\`\`\`json')) {
        rawResponse = rawResponse.split('\`\`\`json')[1].split('\`\`\`')[0].trim();
      } else if (rawResponse.includes('\`\`\`')) {
        rawResponse = rawResponse.split('\`\`\`')[1].split('\`\`\`')[0].trim();
      }
      return JSON.parse(rawResponse);
    } catch(e) {
      console.error("Failed to parse JSON series:", e);
      return { title: "Error parsing series", weeks: [] };
    }

  } catch (error) {
    console.error("Error architecting series:", error);
    return { title: "Error connecting to AI API", weeks: [] };
  }
}
