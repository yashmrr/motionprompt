export default async function handler(req, res) {

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { video } = req.body;

        if (!video) {
            return res.status(400).json({ error: 'No video provided' });
        }

        const GEMINI_KEY = process.env.GEMINI_API_KEY;

        const systemPrompt = `
  You are a Senior Motion Design Architect.
  Your goal is to write a strictly technical "Implementation Spec" for an AI Coding Agent (like Lovable or Cursor).
  
  Analyze the uploaded video strictly for its interaction design, physics, and timing.
  
  Output a single, dense paragraph starting with "IMPLEMENTATION_SPEC:". 
  Follow this strict structure:
  
  1. **Component Structure**: Describe the layout logic (e.g., "A grid of 3 cards with absolute positioned badges").
  2. **Trigger Logic**: define exactly what starts the motion (e.g., "On hover, the parent scales up while the child image slightly rotates").
  3. **The Physics (CRITICAL)**: specific Framer Motion values. 
     - Do not say "smooth". Say "spring with stiffness: 400, damping: 30".
     - Do not say "bouncy". Say "type: 'spring', bounce: 0.6".
  4. **Orchestration**: Describe staggering and delays (e.g., "staggerChildren: 0.1s").
  5. **Keywords**: List the exact Framer Motion props needed (e.g., "layoutId", "AnimatePresence", "whileHover", "exit").
  
  Example Output Format:
  "IMPLEMENTATION_SPEC: Create a card component where the background image zooms (scale: 1.1) on hover. The text overlay must slide up (y: -10px) with a staggered delay of 0.05s. Use a spring transition (stiffness: 300, damping: 20). Wrap the list in AnimatePresence for a slide-out exit animation (x: -20, opacity: 0). Use 'layoutId' for the shared image transition between the card and the modal."
  
  Do not explain *why*. Only describe *how* to build it.
`;

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [
                            { text: systemPrompt },
                            {
                                inline_data: {
                                    mime_type: "video/mp4",
                                    data: video
                                }
                            }
                        ]
                    }]
                })
            }
        );

        const data = await response.json();

        if (data.error) {
            return res.status(500).json({ error: data.error.message });
        }

        const promptText =
            data.candidates?.[0]?.content?.parts?.[0]?.text ||
            "No response generated.";

        return res.status(200).json({ prompt: promptText });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Server error' });
    }
}
