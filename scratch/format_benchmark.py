import json

with open("BENCHMARK_RESULTS.json", "r") as f:
    results = json.load(f)

# Calculate Averages
single_scores = [r["baselines"]["single_prompt"]["eval"]["score"] for r in results]
agentic_scores = [r["baselines"]["agentic"]["eval"]["score"] for r in results]

avg_single = sum(single_scores) / len(single_scores)
avg_agentic = sum(agentic_scores) / len(agentic_scores)

# Prepare Text Report
output = "AI BENCHMARK EVALUATION REPORT: RESUME SKILLS EXTRACTION\n"
output += "="*80 + "\n\n"

# Table Header
header = f"{'ID':<3} | {'Industry':<20} | {'Single Score':<12} | {'Agentic Score':<13}\n"
output += header
output += "-" * len(header) + "\n"

for r in results:
    output += f"{r['id']:<3} | {r['industry']:<20} | {r['baselines']['single_prompt']['eval']['score']:<12} | {r['baselines']['agentic']['eval']['score']:<13}\n"

output += "-" * len(header) + "\n"
output += f"{'AVG':<3} | {'':<20} | {avg_single:<12.2f} | {avg_agentic:<13.2f}\n\n"

output += "FINAL BENCHMARK SCORE: " + str(round(avg_agentic, 1)) + "/5.0\n"
output += "="*80 + "\n\n"

output += "DETAILED DATASET (INPUT & GROUND TRUTH)\n"
output += "-"*40 + "\n\n"

for r in results:
    output += f"CASE ID: {r['id']} ({r['industry']})\n"
    output += f"INPUT TEXT:\n{r['input'].strip()}\n\n"
    output += f"GROUND TRUTH SKILLS:\n{', '.join(r['ground_truth'])}\n\n"
    
    output += "EVALUATION FEEDBACK (SINGLE PROMPT):\n"
    output += f"Score: {r['baselines']['single_prompt']['eval']['score']}/5\n"
    output += f"Judge Reasoning: {r['baselines']['single_prompt']['eval']['reasoning']}\n\n"
    
    output += "EVALUATION FEEDBACK (AGENTIC BASELINE):\n"
    output += f"Score: {r['baselines']['agentic']['eval']['score']}/5\n"
    output += f"Judge Reasoning: {r['baselines']['agentic']['eval']['reasoning']}\n\n"
    output += "."*80 + "\n\n"

with open("AI_BENCHMARK_FINAL.txt", "w") as f:
    f.write(output)

print("AI_BENCHMARK_FINAL.txt generated.")
