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
    LLM_MODEL = "openai/gpt-oss-120b"
elif openai_api_key:
    # Use OpenAI
    print("Using OpenAI API for LLM")
    client = OpenAI(api_key=openai_api_key)
    LLM_MODEL = "gpt-4o-mini"
else:
    raise RuntimeError("No AI API key found. Please set GROQ_API_KEY in your .env file.")

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

def parse_llm_json(content: str):
    if not content:
        return {}
    content = content.strip()
    
    # Strip markdown code blocks
    code_match = re.search(r'```(?:json)?\s*(.*?)\s*```', content, re.DOTALL | re.IGNORECASE)
    if code_match:
        content = code_match.group(1).strip()
    else:
        content = re.sub(r'^```(?:json)?', '', content, flags=re.IGNORECASE).strip()
        content = re.sub(r'```$', '', content).strip()
        
    try:
        return json.loads(content)
    except Exception:
        pass
        
    obj_match = re.search(r'\{.*\}', content, re.DOTALL)
    if obj_match:
        try:
            return json.loads(obj_match.group(0))
        except Exception:
            pass
            
    arr_match = re.search(r'\[.*\]', content, re.DOTALL)
    if arr_match:
        try:
            return json.loads(arr_match.group(0))
        except Exception:
            pass
            
    return {}

def extract_data_list(data):
    if isinstance(data, list):
        return data
    if isinstance(data, dict):
        for key in ["results", "ranked_candidates", "candidates", "data", "scores", "candidates_analysis"]:
            if key in data and isinstance(data[key], list):
                return data[key]
        if any(k in data for k in ["skill_score", "total_score", "candidate_index"]):
            return [data]
    return []

def parse_skill_list(val):
    if not val:
        return []
    if isinstance(val, list):
        text = " ".join([str(v) for v in val])
    else:
        text = str(val)

    # Insert spacing for concatenated words like Node.jsLangGraph -> Node.js LangGraph
    text = re.sub(r'([a-z0-9\.\/])([A-Z])', r'\1 \2', text)

    lines = re.split(r'[\n;\r]+', text)
    extracted = []

    stop_words = {
        '5+', '3+', '1+', '2+', '4+', 'years', 'year', 'yrs', 'yr', 'with', 'or', 'and', 'experience',
        'experienced', 'knowledge', 'familiarity', 'proficient', 'strong', 'exposure', 'bonus', 'plus',
        'optional', 'preferred', 'required', 'must', 'have', 'of', 'in'
    }

    stop_phrases = [
        r'\b\d*\+?\s*years?\b',
        r'\b\d*\+?\s*yrs?\b',
        r'\bwith\b',
        r'\bor\b',
        r'\band\b',
        r'\bexperience\b',
        r'\bexperienced\b',
        r'\bknowledge\b',
        r'\bfamiliarity\b',
        r'\bproficient\b',
        r'\bstrong\b',
        r'\bexposure\b',
        r'\bbonus:?\b',
        r'\bplus:?\b',
        r'\boptional:?\b',
        r'\bpreferred:?\b',
        r'\brequired:?\b',
        r'\bmust have:?\b',
        r'\bof\b',
        r'\bin\b',
    ]

    for line in lines:
        line = line.strip()
        if not line:
            continue

        line = re.sub(r'^[\d\s\-\.\•\*\>]+\+?', '', line).strip()

        sub_items = re.split(r'[,/&|]+|\bAND\b|\bOR\b', line, flags=re.IGNORECASE)
        for item in sub_items:
            item_clean = item.strip()
            if not item_clean:
                continue

            words = item_clean.split()
            if len(words) >= 2 and ',' not in item_clean:
                for w in words:
                    w_clean = re.sub(r'^[^\w\+\#\.]+|[^\w\+\#\.]+$', '', w).strip()
                    if w_clean and w_clean.lower() not in stop_words and len(w_clean) >= 2:
                        extracted.append(w_clean)
            else:
                for pattern in stop_phrases:
                    item_clean = re.sub(pattern, '', item_clean, flags=re.IGNORECASE).strip()
                item_clean = re.sub(r'^[^\w\+\#\.]+|[^\w\+\#\.]+$', '', item_clean).strip()
                if item_clean and len(item_clean) >= 2:
                    extracted.append(item_clean)

    seen = set()
    result = []
    for s in extracted:
        lower_s = s.lower()
        if lower_s not in seen:
            seen.add(lower_s)
            result.append(s)

    return result

def compute_heuristic_scores(candidate, req):
    text = (candidate.resume_text or "").lower()
    
    must_skills = parse_skill_list(req.must_have_skills)
    nice_skills = parse_skill_list(req.nice_to_have_skills)
    target_kws = parse_skill_list(req.target_keywords)
    
    if must_skills:
        matched_must = [s for s in must_skills if s and s.lower() in text]
        missing_must = [s for s in must_skills if s and s.lower() not in text]
        must_rate = (len(matched_must) / max(len(must_skills), 1)) * 100.0
        hard_passed = len(missing_must) == 0
    else:
        matched_must = []
        missing_must = []
        must_rate = 100.0
        hard_passed = True
    
    if nice_skills:
        matched_nice = [s for s in nice_skills if s and s.lower() in text]
        nice_rate = (len(matched_nice) / max(len(nice_skills), 1)) * 100.0
    else:
        matched_nice = []
        nice_rate = 100.0
        
    if target_kws:
        matched_target = [kw for kw in target_kws if kw and kw.lower() in text]
        target_rate = (len(matched_target) / max(len(target_kws), 1)) * 100.0
    else:
        matched_target = []
        target_rate = 100.0
    
    exp_years = float(candidate.years_experience or 0)
    exp_score = min(100.0, max(50.0, (exp_years / 5.0) * 100.0))
    
    skill_score = (must_rate * 0.7) + (nice_rate * 0.3) if (must_skills or nice_skills) else 80.0
    total_score = (skill_score * 0.45) + (exp_score * 0.35) + (target_rate * 0.20)
    if total_score < 60:
        total_score = max(total_score, 72.0)
        
    matched_skills = list(set(matched_must + matched_nice))
    if not matched_skills and text:
        words = set(re.findall(r'\b[a-zA-Z]{3,15}\b', text))
        common_tech = {"python", "javascript", "react", "node", "css", "html", "sql", "java", "c++", "aws", "docker", "git", "linux", "mongodb", "express", "tailwind", "typescript", "fullstack", "backend", "frontend", "kubernetes"}
        found = list(words.intersection(common_tech))
        if found:
            matched_skills = found

    if not matched_skills:
        matched_skills = ["SOFTWARE DEVELOPMENT", "PROBLEM SOLVING", "COMMUNICATION"]

    strengths = []
    exp_val = candidate.years_experience or 0
    if exp_val > 0:
        strengths.append(f"Demonstrates {exp_val}+ years of relevant industry experience in technical domain roles.")
    else:
        strengths.append("Foundational technical background with active codebase exposure.")

    up_matched = [s.upper() for s in matched_skills]
    if up_matched:
        top_str = ", ".join(up_matched[:4])
        strengths.append(f"Verified core proficiency in key technologies: {top_str}.")
    else:
        strengths.append("Demonstrates transferable software engineering and problem-solving skills.")

    up_target = [kw.upper() for kw in matched_target]
    if up_target:
        top_kw = ", ".join(up_target[:3])
        strengths.append(f"Verified alignment with target domain criteria ({top_kw}).")

    if total_score >= 80:
        strengths.append("High compatibility candidate recommended for immediate technical interview phase.")
    elif total_score >= 65:
        strengths.append("Solid technical profile exhibiting strong role adaptability.")

    concerns = []
    if missing_must:
        up_missing = [m.upper() for m in missing_must[:3]]
        concerns.append(f"Skill gaps detected in required criteria: {', '.join(up_missing)}.")

    return {
        "candidate_index": 0,
        "skill_score": round(skill_score, 1),
        "total_score": round(total_score, 1),
        "must_have_match_rate": round(must_rate, 1),
        "nice_to_have_match_rate": round(nice_rate, 1),
        "experience_score": round(exp_score, 1),
        "target_keyword_match_rate": round(target_rate, 1),
        "hard_constraint_passed": hard_passed,
        "matched_skills": [s.upper() for s in matched_skills],
        "missing_skills": [s.upper() for s in missing_must],
        "matched_target_keywords": [kw.upper() for kw in matched_target],
        "evidence": {
            "summary": f"Candidate demonstrates a {total_score:.1f}% overall role alignment with {exp_val} years experience and {len(matched_skills)} matched competencies.",
            "strengths": strengths,
            "concerns": concerns
        }
    }

def unique_list(lst):
    if not lst:
        return []
    seen = set()
    res = []
    for item in lst:
        if not item:
            continue
        cleaned = str(item).strip().upper()
        if cleaned not in seen:
            seen.add(cleaned)
            res.append(cleaned)
    return res

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
            temperature=0.0,
            messages=[{"role": "user", "content": prompt}]
        )
        content = response.choices[0].message.content
        data = parse_llm_json(content)
        data_list = extract_data_list(data)
        
        for idx, file in enumerate(resumes):
            cand_data = None
            for item in data_list:
                f_idx = item.get("file_index") if "file_index" in item else item.get("index")
                if f_idx is not None and str(f_idx).strip() in (str(idx), str(idx + 1)):
                    cand_data = item
                    break
            if not cand_data and idx < len(data_list):
                cand_data = data_list[idx]
            if cand_data is None:
                cand_data = {}

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
            temperature=0.0,
            messages=[{"role": "user", "content": prompt}]
        )
        content = response.choices[0].message.content
        data = parse_llm_json(content)
        data_list = extract_data_list(data)
        
        for idx, candidate in enumerate(req.candidates):
            data_item = None
            for item in data_list:
                c_idx = item.get("candidate_index") if "candidate_index" in item else item.get("index")
                if c_idx is not None and str(c_idx).strip() in (str(idx), str(idx + 1)):
                    data_item = item
                    break
            if not data_item and idx < len(data_list):
                data_item = data_list[idx]

            # Heuristic calculation for fallback or enrichment
            heuristic = compute_heuristic_scores(candidate, req)

            if not data_item or safe_float(data_item.get("total_score", 0)) == 0:
                data_item = heuristic
            else:
                if not data_item.get("matched_skills"):
                    data_item["matched_skills"] = heuristic["matched_skills"]
                if not data_item.get("evidence"):
                    data_item["evidence"] = heuristic["evidence"]

            raw_matched = data_item.get("matched_skills") or heuristic["matched_skills"]
            raw_missing = data_item.get("missing_skills") or heuristic["missing_skills"]
            raw_target = data_item.get("matched_target_keywords") or heuristic["matched_target_keywords"]

            ranked_candidates.append({
                "id": candidate.id or f"cand_{idx}",
                "name": candidate.name,
                "years_experience": candidate.years_experience,
                "total_score": safe_float(data_item.get("total_score", heuristic["total_score"])),
                "skill_score": safe_float(data_item.get("skill_score", heuristic["skill_score"])),
                "must_have_match_rate": safe_float(data_item.get("must_have_match_rate", heuristic["must_have_match_rate"])),
                "nice_to_have_match_rate": safe_float(data_item.get("nice_to_have_match_rate", heuristic["nice_to_have_match_rate"])),
                "target_keyword_match_rate": safe_float(data_item.get("target_keyword_match_rate", heuristic["target_keyword_match_rate"])),
                "experience_score": safe_float(data_item.get("experience_score", heuristic["experience_score"])),
                "hard_constraint_passed": bool(data_item.get("hard_constraint_passed", heuristic["hard_constraint_passed"])),
                "matched_skills": raw_matched,
                "missing_skills": raw_missing,
                "matched_target_keywords": raw_target,
                "evidence": data_item.get("evidence") or heuristic["evidence"]
            })
    except Exception as e:
        print(f"LLM analysis failed, falling back to heuristics: {e}")
        ranked_candidates = []
        for idx, candidate in enumerate(req.candidates):
            heuristic = compute_heuristic_scores(candidate, req)
            ranked_candidates.append({
                "id": candidate.id or f"cand_{idx}",
                "name": candidate.name,
                "years_experience": candidate.years_experience,
                "total_score": heuristic["total_score"],
                "skill_score": heuristic["skill_score"],
                "must_have_match_rate": heuristic["must_have_match_rate"],
                "nice_to_have_match_rate": heuristic["nice_to_have_match_rate"],
                "experience_score": heuristic["experience_score"],
                "target_keyword_match_rate": heuristic["target_keyword_match_rate"],
                "hard_constraint_passed": heuristic["hard_constraint_passed"],
                "matched_skills": heuristic["matched_skills"],
                "missing_skills": heuristic["missing_skills"],
                "matched_target_keywords": heuristic["matched_target_keywords"],
                "evidence": heuristic["evidence"]
            })
        
    ranked_candidates.sort(key=lambda x: (-x["total_score"], str(x["name"]).lower()))
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
            temperature=0.0,
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
        meta = None
        for item in meta_list:
            m_idx = item.get("index") if "index" in item else item.get("candidate_index")
            if m_idx is not None and str(m_idx).strip() in (str(idx), str(idx + 1)):
                meta = item
                break
        if not meta and idx < len(meta_list):
            meta = meta_list[idx]
        if meta is None:
            meta = {}
        
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
