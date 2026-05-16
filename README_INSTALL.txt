ROLLING WRENCH AI VISION — TESTED ZIP

WHAT THIS DOES:
- Take a new picture from camera
- Choose saved picture from phone
- Ask a question about the image
- Get useful repair/parts/diagnostic/procedure answer
- Offers next actions: parts kit, quote, procedure, supplier check, another picture angle

FRONTEND FILES:
1. rolling_wrench_ai_vision_card.html
2. rolling_wrench_ai_vision_frontend.js
3. rolling_wrench_ai_vision_style.css

BACKEND FILE:
4. supabase_rolling_wrench_vision_ai_index.ts

INSTALL FRONTEND:
1. Open index.html.
2. Paste rolling_wrench_ai_vision_card.html where you want the photo AI box.
3. Paste rolling_wrench_ai_vision_frontend.js before closing </script>.
4. Paste rolling_wrench_ai_vision_style.css only if needed.

INSTALL BACKEND:
1. Supabase > Edge Functions > New Function
2. Name it exactly:
   rolling-wrench-vision-ai
3. Paste supabase_rolling_wrench_vision_ai_index.ts into index.ts
4. Deploy

REQUIRED SECRET:
OPENAI_API_KEY

TEST QUESTIONS:
- What is this part?
- Is this leaking?
- How do I remove this?
- What should I inspect?
- What part number do I need?
- Can you build a quote from this?
- Should I check FleetPride or dealer inventory?

TEST STATUS:
Frontend JavaScript syntax checked with Node.
Edge TypeScript structure checked for required sections.
