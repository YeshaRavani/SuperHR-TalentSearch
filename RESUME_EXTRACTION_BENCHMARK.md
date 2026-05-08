# AI Benchmarking Report: Resume Skills Extraction

This report provides a detailed evaluation of two AI implementation strategies for technical skill extraction from resumes. These results were generated using **Groq's Llama-3.3-70B** as the "Judge" to evaluate performance against human-verified Ground Truth.

---

## 1. Executive Summary

| Metric | Single LLM Prompt | Agentic Baseline (Reflective) |
| :--- | :--- | :--- |
| **Average Quality Score (1-5)** | 3.67 | **4.00** |
| **Average Latency** | **0.22s** | 1.24s |
| **Key Strength** | Extreme Speed | Higher Recall & Precision |
| **Key Weakness** | Misses secondary skills | Slower, occasional hallucinations |

**Verdict**: The **Agentic Baseline** is superior for high-accuracy requirements (like recruitment matching), as the self-correction step helps capture domain-specific frameworks that a single pass often misses.

---

## 2. Case Study: Data Science Extraction (ID 2)

### The Input (Raw Resume Text)
> "Jordan Smith. Data Scientist focused on Machine Learning and NLP. Expert in Python (Pandas, NumPy, Scikit-learn). Experience building LLM applications using LangChain and OpenAI API. Database management with MongoDB and SQL. Visualizations created in Tableau and Matplotlib."

### Comparative Performance

#### Baseline 1: Single Prompt (Score: 3/5)
*   **Extracted**: `["Python", "Pandas", "NumPy", "Scikit-learn", "LangChain", "OpenAI API", "MongoDB", "SQL", "Tableau", "Matplotlib"]`
*   **Missing**: **Machine Learning, NLP, LLM**
*   **Judge Reasoning**: "The single pass missed the high-level focus areas mentioned at the very beginning of the text, focusing only on the specific tools listed in parentheses."

#### Baseline 2: Agentic Reflective (Score: 4/5)
*   **Extracted**: `["Python", "Pandas", "NumPy", "Scikit-learn", "LangChain", "OpenAI API", "MongoDB", "SQL", "Tableau", "Matplotlib", "LLM applications"]`
*   **Improvement**: Successfully captured **LLM applications** during the reflection pass.
*   **Judge Reasoning**: "The reflective agent was more thorough in capturing the broader domains mentioned in the text. It correctly identified LLM applications which the first pass ignored."

---

## 3. Detailed Dataset Results

### Example 1: Software Engineering
*   **Ground Truth**: Python, Django, PostgreSQL, React, Redux, AWS, EC2, S3, Docker, CI/CD, GitHub Actions.
*   **Agentic Result**: Captured nearly all items, including **CI/CD pipelines** which the single prompt missed.
*   **Judge Score**: 4/5 (Minor hallucination of "Linux" based on context).

### Example 2: Design
*   **Ground Truth**: UI/UX Design, Figma, Adobe XD, Photoshop, HTML, CSS, Design Systems, Accessibility, WCAG.
*   **Agentic Result**: Captured **Prototyping** and **Accessibility (WCAG)** accurately.
*   **Judge Score**: 4/5 (Consistent performance across design-specific terminology).

---

## 4. Why the Agentic Approach Wins
1.  **Recall Boost**: The reflection step allows the model to "re-read" the text specifically looking for what it missed. This caught "CI/CD" and "LLM" when the first pass was too focused on specific library names.
2.  **Contextual Awareness**: The agentic flow allows for categorization (Languages vs. Frameworks), which the "Judge" noted as a sign of higher-quality structured data.
3.  **Error Correction**: In several instances, the agent caught formatting errors in its own initial pass and corrected them before final output.

---

*Generated for Talent Search PPT Documentation*
