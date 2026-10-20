"""Start the AWDF frontend and backend development servers together."""

from pathlib import Path
import shutil
import signal
import subprocess
import sys


PROJECT_DIR = Path(__file__).resolve().parent
API_DIR = PROJECT_DIR / "task-manager-api"


def start_process(npm_command, working_directory, label):
    print(f"Starting {label}...", flush=True)
    return subprocess.Popen(
        [npm_command, "run", "dev"],
        cwd=working_directory,
        creationflags=subprocess.CREATE_NEW_PROCESS_GROUP if sys.platform == "win32" else 0,
    )


def stop_process(process):
    if process.poll() is None:
        if sys.platform == "win32":
            process.send_signal(signal.CTRL_BREAK_EVENT)
        else:
            process.terminate()


if __name__ == "__main__":
    npm_command = shutil.which("npm.cmd") or shutil.which("npm")
    if not npm_command:
        raise SystemExit("npm was not found. Install Node.js and npm first.")

    if not API_DIR.is_dir():
        raise SystemExit(f"Backend directory not found: {API_DIR}")

    backend = None
    frontend = None
    try:
        backend = start_process(npm_command, API_DIR, "backend API")
        frontend = start_process(npm_command, PROJECT_DIR, "frontend")
        print("\nProject is running:")
        print("  Frontend: http://localhost:5173/ (or the next available Vite port)")
        print("  Backend:  http://localhost:5000")
        print("\nPress Ctrl+C to stop both servers.")

        while True:
            if backend.poll() is not None:
                raise SystemExit("Backend server stopped unexpectedly.")
            if frontend.poll() is not None:
                raise SystemExit("Frontend server stopped unexpectedly.")
            signal.pause() if hasattr(signal, "pause") else subprocess.run(
                ["cmd", "/c", "timeout", "/t", "1", ">nul"],
                check=False,
            )
    except KeyboardInterrupt:
        print("\nStopping project servers...")
    finally:
        stop_process(frontend)
        stop_process(backend)
        if frontend:
            frontend.wait(timeout=5)
        if backend:
            backend.wait(timeout=5)
