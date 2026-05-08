import json

with open("BENCHMARK_OPP_RESULTS.json", "r") as f:
    results = json.load(f)

# Calculate Averages
single_scores = [r["single"]["score"] for r in results]
agentic_scores = [r["agentic"]["score"] for r in results]

avg_single = sum(single_scores) / len(single_scores)
avg_agentic = sum(agentic_scores) / len(agentic_scores)

# Prepare Text Report
output = "AI BENCHMARK EVALUATION REPORT: 20-OPPORTUNITY COMPREHENSIVE AUDIT\n"
output += "="*80 + "\n\n"

# Table Header
header = f"{'ID':<3} | {'Industry':<18} | {'Single Score':<12} | {'Agentic Score':<13}\n"
output += header
output += "-" * len(header) + "\n"

for r in results:
    output += f"{r['id']:<3} | {r['industry']:<18} | {r['single']['score']:<12} | {r['agentic']['score']:<13}\n"

output += "-" * len(header) + "\n"
output += f"{'AVG':<3} | {'':<18} | {avg_single:<12.2f} | {avg_agentic:<13.2f}\n\n"

output += "FINAL PLATFORM BENCHMARK SCORE: " + str(round(avg_agentic, 2)) + "/5.0\n"
output += "="*80 + "\n\n"

output += "DETAILED EVALUATION LOGS (ALL 20 CASES)\n"
output += "-"*80 + "\n\n"

for r in results:
    output += f"CASE ID: {r['id']} ({r['industry']})\n"
    output += f"INPUT TEXT: {r['input']}\n"
    output += f"SINGLE PROMPT JUDGE: {r['single']['score']}/5 - {r['single']['reasoning']}\n"
    output += f"AGENTIC BASELINE JUDGE: {r['agentic']['score']}/5 - {r['agentic']['reasoning']}\n"
    output += "."*80 + "\n\n"

with open("AI_BENCHMARK_FINAL_OPP_20.txt", "w") as f:
    f.write(output)

print("AI_BENCHMARK_FINAL_OPP_20.txt generated.")
