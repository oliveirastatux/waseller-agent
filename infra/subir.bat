@echo off
echo.
echo  ==========================================
echo   GO.IA — Subindo infraestrutura Docker
echo  ==========================================
echo.

REM Verifica se o .env existe
if not exist .env (
  echo  [ERRO] Arquivo .env nao encontrado!
  echo  Copie o .env.example para .env e preencha os valores.
  echo.
  pause
  exit /b 1
)

echo  [1/3] Baixando imagens...
docker compose pull

echo.
echo  [2/3] Criando e subindo containers...
docker compose up -d

echo.
echo  [3/3] Verificando status...
docker compose ps

echo.
echo  ==========================================
echo   Servicos disponiveis:
echo   Evolution API  -> http://localhost:8080
echo   N8N            -> http://localhost:5678
echo   Supabase Studio-> http://localhost:3000
echo   PostgreSQL     -> localhost:5432
echo   Redis          -> localhost:6379
echo  ==========================================
echo.
pause
