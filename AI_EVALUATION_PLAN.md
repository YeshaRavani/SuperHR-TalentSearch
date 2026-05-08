# AI Evaluation & Benchmarking Plan: Talent Search

This document outlines the strategy for evaluating, benchmarking, and optimizing the AI endpoints within the Talent Search platform. We will focus on **Resume Skills Extraction** as our primary showcase for the evaluation framework.

---

## 1. Primary Showcase: Resume Skills Extraction

### 1.1 Dataset Preparation (Input & Ground Truth)
We will create a curated dataset of **20 Synthetic Resumes** representing diverse industries (Engineering, Design, Management, Healthcare).

*   **Input Data**: Raw text extracted from PDF files using the platform's `PyMuPDF` integration.
*   **Ground Truth**: A manually verified JSON list of skills for each resume, curated by human experts to ensure 100% accuracy in the "Golden Set."
    *   *Example Input*: "Senior Python Developer with 5 years experience in React and Docker..."
    *   *Example Ground Truth*: `["Python", "React", "Docker", "Software Engineering"]`

### 1.2 Evaluation Implementation (LLM-as-a-Judge)
To automate the evaluation of non-deterministic outputs, we will implement an **Evaluation Agent**.

*   **Metric 1: Exact Match F1-Score**: Calculating Precision (correct skills found) and Recall (total skills missed) based on string matching.
*   **Metric 2: Semantic Similarity (LLM-as-a-Judge)**: A separate "Judge" model (Llama-3-70B) will compare the AI's output against the Ground Truth.
    *   **Scoring Rubric (1-5)**:
        *   5: Perfectly captured all skills and nuances.
        *   3: Captured major skills but missed secondary tools.
        *   1: Irrelevant or hallucinated skills.
*   **Metric 3: Hallucination Rate**: Counting extracted skills that are not present or implied in the source text.

### 1.3 Implementation Baselines
We will compare two distinct architectural approaches:

| Baseline Type | Logic |
| :--- | :--- |
| **Single LLM Prompt** | A zero-shot prompt: "Extract all technical skills from this resume text and return a JSON list." |
| **Agentic Baseline (Reflective Agent)** | A multi-step workflow: <br>1. **Extraction**: Initial pass to find skills.<br>2. **Self-Correction**: AI reviews its own list against the text to find omissions.<br>3. **Categorization**: Grouping skills (Languages vs. Frameworks).<br>4. **Validation**: Ensuring every skill is grounded in the text. |

---

## 2. Secondary AI Endpoints Strategy

### 2.1 Post an Opportunity (Voice-to-JSON)
*   **Input**: Audio transcripts with stuttering, filler words ("um," "uh"), and non-linear info.
*   **Ground Truth**: Cleaned JSON representation of the job post (Title, Salary, Skills).
*   **Evaluation**: "Information Extraction Efficiency" — measuring how much of the original intent was captured in the final form fields.

### 2.2 Opportunity Matching (Relevance Scoring)
*   **Input**: User Profile + Job Description.
*   **Ground Truth**: Human-assigned "Suitability Score" (1-100).
*   **Evaluation**: **Mean Squared Error (MSE)** between AI match percentage and human expert suitability score.

### 2.3 Recruiter Analytics (Applicant Ranking)
*   **Input**: 50 applicant profiles for a single job post.
*   **Ground Truth**: An ordered list of top 5 candidates ranked by a hiring manager.
*   **Evaluation**: **NDCG (Normalized Discounted Cumulative Gain)** to measure the quality of the AI's ranking relative to the expert's ranking.

---

## 3. Implementation Workflow
1.  **Phase 1: Dataset Generation**: Scripting the creation of the 20-resume "Golden Set."
2.  **Phase 2: Benchmarking Script**: Developing a Python test runner that executes the "Single Prompt" vs "Agentic" workflows across the dataset.
3.  **Phase 3: Judge Implementation**: Setting up the Groq-powered evaluation agent.
4.  **Phase 4: Reporting**: Generating a `BENCHMARK_RESULTS.md` artifact with tables and performance graphs.

---

*Prepared by Antigravity AI*
