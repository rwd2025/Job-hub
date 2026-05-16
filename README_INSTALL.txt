PHASE 19 — ASK CECIL PROCEDURE GENIUS

INSTALL:
1. Open index.html.
2. Paste phase19_ask_cecil_card.html where you want the Ask Cecil box.
3. Paste phase19_ask_cecil_procedure_genius.js near your other JavaScript functions before </script>.
4. Paste phase19_ask_cecil_style.css into your CSS only if your app needs the styling.

IMPORTANT:
This uses your existing AI call if your app has one named:
- callAI(prompt, context, notes)
- askAI(prompt)
- callOracleAI(prompt)

If your app uses a different AI function name, change this section in the JS:
if(typeof callAI === "function"){...}

TEST QUESTIONS:
- How do I remove an MX13 water pump?
- How do I disassemble a DD15 EGR cooler?
- What causes SPN 2791 FMI 11?
- What parts do I need for a 2017 X15 front main seal?
- How many labor hours for a Bendix foot valve?
- What specs do I need before assembling this?

WHAT IT DOES:
- Takes any repair question.
- Classifies intent.
- Searches verified_fixes.
- Searches repair_procedures.
- Searches repair_kits.
- Searches known_failures.
- Builds a shop-foreman style AI answer.
- Warns when exact torque/specs/part numbers need VIN/ESN/manual verification.
