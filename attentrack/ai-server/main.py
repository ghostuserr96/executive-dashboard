import os
import io
import json
import uuid
import re
from typing import List, Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import PyPDF2
from openai import OpenAI
from dotenv import load_dotenv

def safe_float(val):
    if val is None:
        return 0.0
    if isinstance(val, (int, float)):
        return float(val)
    if isinstance(val, str):
        # Remove any non-numeric characters except '.' and '-'
        import re
        cleaned = re.sub(r'[^\d.-]', '', val)
        try:
            return float(cleaned) if cleaned else 0.0
        except ValueError:
            return 0.0
    return 0.0

load_dotenv()
parent_env = os.path.join(os.path.dirname(os.path.dirname(__file__)), "server", ".env")
if os.path.exists(parent_env):
    load_dotenv(parent_env)

# Flexible AI Provider Configuration
groq_api_key = os.getenv("GROQ_API_KEY")
openai_api_key = os.getenv("OPENAI_API_KEY")

if groq_api_key:
    # Use Groq
    print("Using Groq API for LLM")
    client = OpenAI(api_key=groq_api_key, base_url="https://api.groq.com/openai/v1")
    LLM_MODEL = "llama-3.1-8b-instant"
elif openai_api_key:
    # Use OpenAI
    print("Using OpenAI API for LLM")
    client = OpenAI(api_key=openai_api_key)
    LLM_MODEL = "gpt-4o-mini"
else:
    # Fallback to local Ollama
    print("Using local Ollama API for LLM")
    client = OpenAI(api_key="ollama", base_url="http://localhost:11434/v1")
    LLM_MODEL = "llama3"

app = FastAPI(title="Attentrack AI Resume Screening API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CandidateInput(BaseModel):
    id: Optional[str] = None
    name: str
    years_experience: float
    resume_text: str

class AnalyzeRequest(BaseModel):
    job_title: str
    role_family: str
    job_description: str
    must_have_skills: List[str]
    nice_to_have_skills: List[str]
    target_keywords: List[str] = []
    candidates: List[CandidateInput]

from ml_attrition import predict_attrition
from typing import Dict, Any

@app.post("/predict-attrition")
async def predict_attrition_endpoint(employee: Dict[str, Any]):
    # The frontend will send the employee dict straight from MongoDB
    try:
        # We must title-case some fields to match IBM format just in case, but let's assume it matches.
        # Ensure Age exists
        if 'age' not in employee:
            return {"error": "Employee missing Age field"}

        # Map camelCase JS fields to PascalCase IBM Dataset Fields
        mapping = {
            'age': 'Age',
            'businessTravel': 'BusinessTravel',
            'dailyRate': 'DailyRate',
            'department': 'Department',
            'distanceFromHome': 'DistanceFromHome',
            'education': 'Education',
            'educationField': 'EducationField',
            'environmentSatisfaction': 'EnvironmentSatisfaction',
            'gender': 'Gender',
            'hourlyRate': 'HourlyRate',
            'jobInvolvement': 'JobInvolvement',
            'jobLevel': 'JobLevel',
            'jobRole': 'JobRole',
            'jobSatisfaction': 'JobSatisfaction',
            'maritalStatus': 'MaritalStatus',
            'monthlyIncome': 'MonthlyIncome',
            'monthlyRate': 'MonthlyRate',
            'numCompaniesWorked': 'NumCompaniesWorked',
            'overTime': 'OverTime',
            'percentSalaryHike': 'PercentSalaryHike',
            'performanceRating': 'PerformanceRating',
            'relationshipSatisfaction': 'RelationshipSatisfaction',
            'stockOptionLevel': 'StockOptionLevel',
            'totalWorkingYears': 'TotalWorkingYears',
            'trainingTimesLastYear': 'TrainingTimesLastYear',
            'workLifeBalance': 'WorkLifeBalance',
            'yearsAtCompany': 'YearsAtCompany',
            'yearsInCurrentRole': 'YearsInCurrentRole',
            'yearsSinceLastPromotion': 'YearsSinceLastPromotion',
            'yearsWithCurrManager': 'YearsWithCurrManager'
        }

        ibm_input = {}
        for js_key, ibm_key in mapping.items():
            val = employee.get(js_key)
            # Default fallback just in case some are missing
            if val is None:
                if 'Satisfaction' in js_key or js_key in ['workLifeBalance', 'jobInvolvement', 'performanceRating', 'education']:
                    val = 3
                elif isinstance(val, (int, float)):
                    val = 0
                else:
                    if js_key == 'gender': val = 'Male'
                    elif js_key == 'maritalStatus': val = 'Married'
                    elif js_key == 'overTime': val = 'No'
                    elif js_key == 'department': val = 'Sales'
                    elif js_key == 'jobRole': val = 'Sales Executive'
                    elif js_key == 'businessTravel': val = 'Travel_Rarely'
                    elif js_key == 'educationField': val = 'Life Sciences'
                    else: val = 0

            ibm_input[ibm_key] = val

        risk_probability = predict_attrition(ibm_input)
        return {"risk_score": risk_probability}
    
    except Exception as e:
        print(f"Error predicting attrition: {e}")
        raise HTTPException(status_code=500, detail=str(e))


def extract_text_from_pdf(file_bytes: bytes) -> str:
    try:
        reader = PyPDF2.PdfReader(io.BytesIO(file_bytes))
        text = ""
        for page in reader.pages:
            extracted = page.extract_text()
            if extracted:
                text += extracted + "\n"
        return text
    except Exception as e:
        print(f"Error reading PDF: {e}")
        return ""

def parse_llm_json(content: str) -> dict:
    content = content.strip()
    # Strip markdown code blocks if present
    if content.startswith("```"):
        lines = content.split("\n")
        if len(lines) > 1:
            # Remove the first line (e.g. ```json)
            lines = lines[1:]
            # Remove the last line if it's just ```
            if lines[-1].strip() == "```":
                lines = lines[:-1]
            content = "\n".join(lines).strip()
    
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        # Fallback regex to find JSON object
        match = re.search(r'\{.*\}', content, re.DOTALL)
        if match:
            try:
                return json.loads(match.group(0))
            except:
                pass
        return {}

def safe_float(val):
    if val is None:
        return 0.0
    if isinstance(val, (int, float)):
        return float(val)
    if isinstance(val, str):
        match = re.search(r"[-+]?\d*\.?\d+", val)
        if match:
            return float(match.group())
    return 0.0

@app.get("/health")
async def health_check():
    return {"status": "ok"}

@app.post("/preview-files")
async def preview_files(resumes: List[UploadFile] = File(...)):
    results = []
    all_texts = []
    
    max_len_per_resume = max(10000 // max(len(resumes), 1), 800)
    
    for idx, file in enumerate(resumes):
        content = await file.read()
        text = extract_text_from_pdf(content)
        all_texts.append(f"--- RESUME {idx} ({file.filename}) ---\n{text[:max_len_per_resume]}")
    
    combined_text = "\n\n".join(all_texts)
    
    prompt = f"""
You are an expert technical recruiter. Analyze the following batch of resumes.
For each resume, extract the candidate's name, total years of professional experience, and key technical skills.

Return ONLY a valid JSON object in this exact format. Do not include markdown blocks or any other text:
{{
  "results": [
    {{
      "file_index": 0,
      "candidate_name": "Full Name",
      "years_experience": 5,
      "detected_skills": ["skill1", "skill2"]
    }}
  ]
}}

Resumes:
{combined_text}
"""
    try:
        response = client.chat.completions.create(
            model=LLM_MODEL,
            messages=[{"role": "user", "content": prompt}]
        )
        content = response.choices[0].message.content
        data = parse_llm_json(content)
        data_list = data.get("results", [])
        
        for idx, file in enumerate(resumes):
            cand_data = next((item for item in data_list if item.get("file_index") == idx), {})
            results.append({
                "filename": file.filename,
                "status": "success",
                "candidate_name": cand_data.get("candidate_name", "Unknown"),
                "years_experience": safe_float(cand_data.get("years_experience")),
                "detected_skills": cand_data.get("detected_skills", []),
                "raw_text": "" 
            })
    except Exception as e:
        for file in resumes:
            results.append({
                "filename": file.filename,
                "status": "error",
                "error": str(e)
            })
            
    return {"results": results}

@app.post("/analyze")
async def analyze(req: AnalyzeRequest):
    ranked_candidates = []
    
    combined_candidates_text = ""
    max_len_per_resume = max(10000 // max(len(req.candidates), 1), 800)
    for idx, candidate in enumerate(req.candidates):
        combined_candidates_text += f"--- CANDIDATE {idx} (Name: {candidate.name}, Exp: {candidate.years_experience} years) ---\n"
        combined_candidates_text += f"{candidate.resume_text[:max_len_per_resume]}\n\n"

    prompt = f"""
You are an expert technical recruiter and AI screening system.
Analyze the following batch of candidates against the job requirements.

Job Title: {req.job_title}
Role Family: {req.role_family}
Job Description: {req.job_description}
Must Have Skills: {', '.join(req.must_have_skills)}
Nice to Have Skills: {', '.join(req.nice_to_have_skills)}
Target Keywords (Elite Institutions, Certifications, etc.): {', '.join(req.target_keywords) if req.target_keywords else 'None'}

Calculate scores on a scale of 0 to 100 for each candidate.
Return ONLY a valid JSON object in this exact format (order must match candidate index). Do not include markdown blocks or any other text:
{{
  "results": [
    {{
      "candidate_index": 0,
      "skill_score": 85.5,
      "total_score": 88.0,
      "must_have_match_rate": 90.0,
      "nice_to_have_match_rate": 50.0,
      "experience_score": 100.0,
      "target_keyword_match_rate": 80.0,
      "hard_constraint_passed": true,
      "matched_skills": ["skill1", "skill2"],
      "missing_skills": ["missing1"],
      "matched_target_keywords": ["keyword1"],
      "evidence": {{
        "strengths": ["strength1", "strength2"],
        "concerns": ["concern1"]
      }}
    }}
  ]
}}

Candidates:
{combined_candidates_text}
"""
    try:
        response = client.chat.completions.create(
            model=LLM_MODEL,
            messages=[{"role": "user", "content": prompt}]
        )
        content = response.choices[0].message.content
        data = parse_llm_json(content)
        data_list = data.get("results", [])
        
        for idx, candidate in enumerate(req.candidates):
            data_item = next((item for item in data_list if item.get("candidate_index") == idx), {})
            if not data_item:
                continue
                
            ranked_candidates.append({
                "id": candidate.id or str(uuid.uuid4()),
                "name": candidate.name,
                "years_experience": candidate.years_experience,
                "skill_score": data_item.get("skill_score", 0),
                "total_score": data_item.get("total_score", 0),
                "must_have_match_rate": data_item.get("must_have_match_rate", 0),
                "nice_to_have_match_rate": data_item.get("nice_to_have_match_rate", 0),
                "experience_score": data_item.get("experience_score", 0),
                "target_keyword_match_rate": data_item.get("target_keyword_match_rate", 0),
                "hard_constraint_passed": data_item.get("hard_constraint_passed", False),
                "matched_skills": data_item.get("matched_skills", []),
                "missing_skills": data_item.get("missing_skills", []),
                "matched_target_keywords": data_item.get("matched_target_keywords", []),
                "evidence": data_item.get("evidence", {"strengths": [], "concerns": []})
            })
    except Exception as e:
        print(f"Failed to analyze: {e}")
        
    ranked_candidates.sort(key=lambda x: x["total_score"], reverse=True)
    return {
        "job_title": req.job_title,
        "role_family": req.role_family,
        "ranked_candidates": ranked_candidates
    }

@app.post("/analyze-files")
async def analyze_files(
    resumes: List[UploadFile] = File(...),
    job_title: str = Form(""),
    job_description: str = Form(""),
    role_family: str = Form(""),
    must_have_skills: str = Form(""),
    nice_to_have_skills: str = Form(""),
    target_keywords: str = Form("")
):
    must_have_skills_list = [s.strip() for s in must_have_skills.split(',')] if must_have_skills else []
    nice_to_have_skills_list = [s.strip() for s in nice_to_have_skills.split(',')] if nice_to_have_skills else []
    target_keywords_list = [s.strip() for s in target_keywords.split(',')] if target_keywords else []
    
    candidates = []
    all_texts = []
    max_len_per_resume = max(10000 // max(len(resumes), 1), 800)
    for idx, file in enumerate(resumes):
        content = await file.read()
        text = extract_text_from_pdf(content)
        all_texts.append(f"--- RESUME {idx} ({file.filename}) ---\n{text[:max_len_per_resume]}")
        candidates.append({
            "id": file.filename,
            "filename": file.filename,
            "text": text
        })
        
    combined_text = "\n\n".join(all_texts)
    
    meta_prompt = f"""
Extract candidate names and years of experience for each resume in the batch.
Return ONLY a valid JSON object in this exact format. Do not include markdown blocks or any other text:
{{
  "results": [
    {{
      "index": 0,
      "name": "John",
      "years_experience": 5
    }}
  ]
}}

Resumes:
{combined_text}
"""
    try:
        response = client.chat.completions.create(
            model=LLM_MODEL,
            messages=[{"role": "user", "content": meta_prompt}]
        )
        content = response.choices[0].message.content
        data = parse_llm_json(content)
        meta_list = data.get("results", [])
    except Exception as e:
        print(f"Meta extraction failed: {e}")
        meta_list = []
        
    candidate_inputs = []
    for idx, c in enumerate(candidates):
        meta = next((item for item in meta_list if item.get("index") == idx), {})
        
        # Handle cases where LLM returns explicitly null/None
        exp = meta.get("years_experience")
        if exp is None:
            exp = 0
            
        name = meta.get("name")
        if not name:
            name = c["filename"]
            
        candidate_inputs.append(CandidateInput(
            id=c["id"],
            name=name,
            years_experience=safe_float(exp),
            resume_text=c["text"]
        ))
        
    req = AnalyzeRequest(
        job_title=job_title,
        role_family=role_family,
        job_description=job_description,
        must_have_skills=must_have_skills_list,
        nice_to_have_skills=nice_to_have_skills_list,
        target_keywords=target_keywords_list,
        candidates=candidate_inputs
    )
    
    return await analyze(req)
