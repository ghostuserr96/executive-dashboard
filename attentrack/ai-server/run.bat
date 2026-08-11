@echo off
echo ====================================================
echo Starting Attentrack AI Server
echo ====================================================

if not exist ".venv\" (
    echo Creating virtual environment...
    py -m venv .venv
)

echo Activating virtual environment...
call .venv\Scripts\activate.bat

echo Installing dependencies...
python -m pip install -r requirements.txt

echo.
echo Starting FastAPI server...
python -m uvicorn main:app --host 127.0.0.1 --port 8001 --reload
