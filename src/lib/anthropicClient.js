export async function generateTheologicalInsight(passage, theme, styleMode) {
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

  // Real API Logic (Ready for when API key is provided)
  const prompt = `
    You are a theological assistant. 
    Analyze the biblical passage: ${passage}. 
    Focus on the theme: ${theme}. 
    Produce a ${styleMode} output structured perfectly in Markdown using H1, H2, and bullet points.
    Ensure exegesis is accurate and rooted in orthodox theology.
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
        max_tokens: 1500,
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
