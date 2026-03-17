from pathlib import Path
from typing import List

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from starlette.responses import FileResponse, PlainTextResponse


app = FastAPI(title="Device API")

# 允许前端开发地址访问
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 可以按需收紧为 ["http://localhost:5173"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class CsvRequest(BaseModel):
  id: str
  csvPath: str


def resolve_csv_path(csv_path: str) -> Path:
  """
  将前端传入的 csvPath（如 /data/robot_1.csv）映射到磁盘上的真实路径。
  这里假设 CSV 文件仍然放在前端项目的 public 目录下。
  """
  # backend 根目录: device-monitor-backend
  backend_root = Path(__file__).resolve().parent
  # 前端项目根目录: device-monitor
  frontend_root = backend_root.parent / "device-monitor"
  public_dir = frontend_root / "public"

  # 安全处理，防止 .. 等路径遍历
  relative = csv_path.lstrip("/").replace("\\", "/")
  full_path = (public_dir / relative).resolve()

  if not full_path.is_file() or public_dir not in full_path.parents:
    raise HTTPException(status_code=404, detail="CSV 文件不存在")

  return full_path


@app.post("/api/device-csv", response_class=PlainTextResponse)
async def get_device_csv(req: CsvRequest) -> PlainTextResponse:
  """
  根据设备 id 和 csvPath 读取 CSV 内容并原样返回。
  前端继续使用原有的 parseDeviceCSV 进行解析。
  """
  path = resolve_csv_path(req.csvPath)
  try:
    text = path.read_text(encoding="utf-8")
  except Exception as exc:  # noqa: BLE001
    raise HTTPException(status_code=500, detail=f"读取 CSV 失败: {exc}") from exc

  # 返回 text/csv 内容
  return PlainTextResponse(content=text, media_type="text/csv; charset=utf-8")


@app.get("/health")
async def health():
  return {"status": "ok"}


# ---------- 文件浏览 / 下载 ----------

backend_root = Path(__file__).resolve().parent
# 文件浏览根目录，可按需修改为实际业务路径
FS_ROOT = (backend_root / "files").resolve()
FS_ROOT.mkdir(parents=True, exist_ok=True)


class FsListResponseItem(BaseModel):
  name: str
  is_dir: bool
  size: int
  modified: float
  created: float


class FsListResponse(BaseModel):
  path: str
  entries: List[FsListResponseItem]


def resolve_fs_path(path: str) -> Path:
  # 空路径或 "/" 表示根目录
  relative = path.strip().lstrip("/").replace("\\", "/")
  full = (FS_ROOT / relative).resolve()
  if FS_ROOT not in full.parents and full != FS_ROOT:
    raise HTTPException(status_code=400, detail="非法路径")
  return full


@app.get("/api/fs/list", response_model=FsListResponse)
async def list_directory(path: str = Query("", description="相对于文件根目录的路径")):
  """
  列出 path 目录下的**直接子文件和文件夹**（不递归）。
  """
  base = resolve_fs_path(path)
  if not base.exists():
    raise HTTPException(status_code=404, detail="目录不存在")
  if not base.is_dir():
    raise HTTPException(status_code=400, detail="目标不是目录")

  items: List[FsListResponseItem] = []
  for entry in sorted(base.iterdir(), key=lambda p: (not p.is_dir(), p.name.lower())):
    stat = entry.stat()
    items.append(
      FsListResponseItem(
        name=entry.name,
        is_dir=entry.is_dir(),
        size=0 if entry.is_dir() else stat.st_size,
        modified=stat.st_mtime,
        created=stat.st_ctime,
      )
    )

  rel = "" if base == FS_ROOT else str(base.relative_to(FS_ROOT)).replace("\\", "/")
  return FsListResponse(path=rel, entries=items)


@app.get("/api/fs/download")
async def download_file(path: str = Query(..., description="相对于文件根目录的文件路径")):
  """
  下载指定文件。
  """
  file_path = resolve_fs_path(path)
  if not file_path.is_file():
    raise HTTPException(status_code=404, detail="文件不存在")

  return FileResponse(file_path, filename=file_path.name, media_type="application/octet-stream")

