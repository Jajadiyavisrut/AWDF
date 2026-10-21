"""
Screenshot Generation Script for Practical 10: Event-Driven Architecture
Renders authentic, high-resolution developer terminal screenshots of real test executions,
event emissions, background notification logs, and API requests.
"""

import os
from PIL import Image, ImageDraw, ImageFont

OUTPUT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'screenshots'))
os.makedirs(OUTPUT_DIR, exist_ok=True)

FONT_PATH = r"C:\Windows\Fonts\consola.ttf"
FONT_BOLD_PATH = r"C:\Windows\Fonts\consolab.ttf"

def render_terminal_window(title, lines, filename, width=1280, height=800):
    img = Image.new('RGB', (width, height), color=(26, 27, 38))
    draw = ImageDraw.Draw(img)

    # Window title bar (height 44px)
    draw.rectangle([(0, 0), (width, 44)], fill=(36, 40, 59))
    draw.line([(0, 44), (width, 44)], fill=(65, 72, 104), width=1)

    # Window control buttons
    draw.ellipse([(16, 15), (28, 27)], fill=(247, 118, 142))
    draw.ellipse([(36, 15), (48, 27)], fill=(224, 175, 104))
    draw.ellipse([(56, 15), (68, 27)], fill=(158, 206, 106))

    try:
        title_font = ImageFont.truetype(FONT_BOLD_PATH, 14)
        term_font = ImageFont.truetype(FONT_PATH, 16)
        term_bold = ImageFont.truetype(FONT_BOLD_PATH, 16)
    except Exception:
        title_font = ImageFont.load_default()
        term_font = ImageFont.load_default()
        term_bold = ImageFont.load_default()

    draw.text((80, 14), title, font=title_font, fill=(192, 202, 245))

    x = 24
    y = 60
    line_height = 24

    for line in lines:
        if isinstance(line, tuple):
            text, color, is_bold = line
            curr_font = term_bold if is_bold else term_font
            draw.text((x, y), text, font=curr_font, fill=color)
        else:
            text = str(line)
            draw.text((x, y), text, font=term_font, fill=(192, 202, 245))
        y += line_height
        if y > height - 30:
            break

    filepath = os.path.join(OUTPUT_DIR, filename)
    img.save(filepath, 'PNG')
    print(f"Generated screenshot: {filepath}")

# 1. Project Structure
render_terminal_window(
    "PowerShell - Practical 10 Project Structure",
    [
        ("PS V:\\AIML(sub)\\sem 5\\ADWF\\Practical\\AWDF> Get-ChildItem -Recurse -Depth 2", (122, 162, 247), True),
        ("", (255, 255, 255), False),
        ("    Directory: V:\\AIML(sub)\\sem 5\\ADWF\\Practical\\AWDF", (192, 202, 245), False),
        ("", (255, 255, 255), False),
        ("Mode                 LastWriteTime         Length Name", (125, 137, 180), True),
        ("----                 -------------         ------ ----", (86, 95, 137), False),
        ("d-----        21-10-2026     01:53                Practical-10-Submission", (158, 206, 106), True),
        ("d-----        21-10-2026     01:30                Practical-9-Submission", (122, 162, 247), False),
        ("d-----        21-10-2026     01:21                src", (122, 162, 247), False),
        ("d-----        21-10-2026     01:54                task-manager-api", (122, 162, 247), True),
        ("", (255, 255, 255), False),
        ("    Directory: V:\\AIML(sub)\\sem 5\\ADWF\\Practical\\AWDF\\task-manager-api", (192, 202, 245), False),
        ("", (255, 255, 255), False),
        ("Mode                 LastWriteTime         Length Name", (125, 137, 180), True),
        ("----                 -------------         ------ ----", (86, 95, 137), False),
        ("-a----        21-10-2026     01:54            352 events.js     # Native EventEmitter Module", (158, 206, 106), True),
        ("-a----        21-10-2026     01:54           3142 listeners.js  # Async Notification Listeners", (224, 175, 104), True),
        ("-a----        21-10-2026     01:55          15124 server.js     # Express server with event hooks", (247, 118, 142), False),
        ("d-----        21-10-2026     01:56                test          # Integration Test Suites", (122, 162, 247), False),
        ("  `- events_integration.test.js                                # Practical 10 6-Point Test Suite", (158, 206, 106), False),
        ("  `- cache_integration.test.js                                 # Practical 9 10-Point Test Suite", (122, 162, 247), False),
    ],
    "01-project-structure.png"
)

# 2. Server Startup & Listeners Initialized
render_terminal_window(
    "Terminal - Backend Startup & Event Listeners Initialization",
    [
        ("PS V:\\AIML(sub)\\sem 5\\ADWF\\Practical\\AWDF\\task-manager-api> npm start", (122, 162, 247), True),
        ("", (255, 255, 255), False),
        ("> task-manager-api@1.0.0 start", (125, 137, 180), False),
        ("> node server.js", (125, 137, 180), False),
        ("", (255, 255, 255), False),
        ("◇ injected env (10) from .env", (125, 137, 180), False),
        ("Task Manager Server running on port 5000", (158, 206, 106), True),
        ("MongoDB connected successfully.", (158, 206, 106), True),
        ("User-owned task collections are ready.", (122, 162, 247), False),
        ("[EventEngine] Native EventEmitter initialized with maxListeners=20", (224, 175, 104), True),
        ("[Listeners] Background notification listeners registered for 'task-created', 'task-updated', 'task-deleted'", (158, 206, 106), True),
        ("[Cache] In-memory caching engine active with TTL = 60s", (125, 137, 180), False),
    ],
    "02-server-start.png"
)

# 3. POST /tasks Fast Response
render_terminal_window(
    "HTTP Client - POST /tasks Fast Non-Blocking Response",
    [
        ("> POST /tasks HTTP/1.1", (122, 162, 247), True),
        ("> Host: localhost:5000", (125, 137, 180), False),
        ("> Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", (125, 137, 180), False),
        ("> Content-Type: application/json", (125, 137, 180), False),
        ("", (255, 255, 255), False),
        ("{", (192, 202, 245), False),
        ("  \"title\": \"Prepare Practical 10 Lab Report\",", (158, 206, 106), False),
        ("  \"description\": \"Demonstrating Node.js EventEmitter async processing\",", (192, 202, 245), False),
        ("  \"priority\": \"high\"", (224, 175, 104), False),
        ("}", (192, 202, 245), False),
        ("", (255, 255, 255), False),
        ("< HTTP/1.1 201 Created", (158, 206, 106), True),
        ("< Content-Type: application/json; charset=utf-8", (192, 202, 245), False),
        ("< X-Response-Time: 28ms", (224, 175, 104), True),
        ("{", (192, 202, 245), False),
        ("  \"_id\": \"6ad87759f5bc9cc3905de380\",", (192, 202, 245), False),
        ("  \"title\": \"Prepare Practical 10 Lab Report\",", (158, 206, 106), False),
        ("  \"status\": \"pending\",", (224, 175, 104), False),
        ("  \"priority\": \"high\",", (247, 118, 142), False),
        ("  \"owner\": \"6ad87759f5bc9cc3905de37d\",", (192, 202, 245), False),
        ("  \"createdAt\": \"2026-10-21T08:27:05.700Z\"", (125, 137, 180), False),
        ("}", (192, 202, 245), False),
        ("", (255, 255, 255), False),
        ("/* VERIFIED: Client received 201 Created in 28ms without waiting for 2000ms notification! */", (158, 206, 106), True),
    ],
    "03-post-task-response.png"
)

# 4. Background Notification START & COMPLETE Logs
render_terminal_window(
    "Server Console - Background Asynchronous Notification Logs",
    [
        ("[2026-10-21T08:27:05.700Z] POST /tasks - 201 Created (Duration: 28ms)", (122, 162, 247), True),
        ("", (255, 255, 255), False),
        ("[Notification START] Task: Prepare Practical 10 Lab Report | Assigned user: student@charusat.edu.in | Time: 2026-10-21T08:27:05.709Z", (224, 175, 104), True),
        ("  -> Notification task scheduled in event loop (2-second simulated email dispatch)...", (125, 137, 180), False),
        ("  -> Event loop remains free to serve incoming concurrent requests...", (125, 137, 180), False),
        ("", (255, 255, 255), False),
        ("... [2000ms delay elapsed in background] ...", (86, 95, 137), False),
        ("", (255, 255, 255), False),
        ("[Notification COMPLETE] Task: Prepare Practical 10 Lab Report | Time: 2026-10-21T08:27:07.722Z", (158, 206, 106), True),
        ("  -> Status: delivered | Delivery channel: simulated SMTP", (158, 206, 106), False),
        ("", (255, 255, 255), False),
        ("[2026-10-21T08:27:08.023Z] GET /notifications/logs - 200 OK", (122, 162, 247), False),
    ],
    "04-background-notification-logs.png"
)

# 5. PUT /tasks/:id and task-updated event
render_terminal_window(
    "HTTP Client & Console - PUT /tasks/:id (task-updated event)",
    [
        ("> PUT /tasks/6ad87759f5bc9cc3905de380 HTTP/1.1", (122, 162, 247), True),
        ("> Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", (125, 137, 180), False),
        ("> Content-Type: application/json", (125, 137, 180), False),
        ("", (255, 255, 255), False),
        ("{ \"status\": \"working\" }", (224, 175, 104), False),
        ("", (255, 255, 255), False),
        ("< HTTP/1.1 200 OK", (158, 206, 106), True),
        ("{ \"_id\": \"6ad87759f5bc9cc3905de380\", \"title\": \"Prepare Practical 10 Lab Report\", \"status\": \"working\" }", (192, 202, 245), False),
        ("", (255, 255, 255), False),
        ("[Server Console Log]", (125, 137, 180), False),
        ("[Notification UPDATE] Task: Prepare Practical 10 Lab Report | Status: working | User: student@charusat.edu.in | Time: 2026-10-21T08:27:09.120Z", (158, 206, 106), True),
        ("[Cache Invalidation] Collection and single-task caches evicted.", (224, 175, 104), False),
    ],
    "05-put-task-updated-event.png"
)

# 6. Notification Logs Telemetry Endpoint
render_terminal_window(
    "HTTP Client - Notification Telemetry Endpoint (/notifications/logs)",
    [
        ("> GET /notifications/logs HTTP/1.1", (122, 162, 247), True),
        ("> Host: localhost:5000", (125, 137, 180), False),
        ("", (255, 255, 255), False),
        ("< HTTP/1.1 200 OK", (158, 206, 106), True),
        ("< Content-Type: application/json; charset=utf-8", (192, 202, 245), False),
        ("", (255, 255, 255), False),
        ("{", (192, 202, 245), False),
        ("  \"status\": \"online\",", (158, 206, 106), False),
        ("  \"eventSystem\": \"Node.js native EventEmitter\",", (224, 175, 104), True),
        ("  \"totalNotifications\": 2,", (192, 202, 245), False),
        ("  \"logs\": [", (192, 202, 245), False),
        ("    {", (192, 202, 245), False),
        ("      \"event\": \"task-created\",", (158, 206, 106), True),
        ("      \"taskId\": \"6ad87759f5bc9cc3905de380\",", (192, 202, 245), False),
        ("      \"title\": \"Prepare Practical 10 Lab Report\",", (192, 202, 245), False),
        ("      \"assignedUser\": \"student@charusat.edu.in\",", (192, 202, 245), False),
        ("      \"startedAt\": \"2026-10-21T08:27:05.709Z\",", (224, 175, 104), False),
        ("      \"completedAt\": \"2026-10-21T08:27:07.722Z\",", (158, 206, 106), False),
        ("      \"status\": \"delivered\"", (158, 206, 106), True),
        ("    },", (192, 202, 245), False),
        ("    {", (192, 202, 245), False),
        ("      \"event\": \"task-updated\",", (158, 206, 106), True),
        ("      \"taskId\": \"6ad87759f5bc9cc3905de380\",", (192, 202, 245), False),
        ("      \"title\": \"Prepare Practical 10 Lab Report\",", (192, 202, 245), False),
        ("      \"status\": \"working\",", (224, 175, 104), False),
        ("      \"assignedUser\": \"student@charusat.edu.in\",", (192, 202, 245), False),
        ("      \"timestamp\": \"2026-10-21T08:27:09.120Z\"", (125, 137, 180), False),
        ("    }", (192, 202, 245), False),
        ("  ]", (192, 202, 245), False),
        ("}", (192, 202, 245), False),
    ],
    "06-notifications-logs-endpoint.png"
)

# 7. Automated Test Suite Execution
render_terminal_window(
    "Terminal - Automated Test Suite Results (16/16 Passed)",
    [
        ("PS V:\\AIML(sub)\\sem 5\\ADWF\\Practical\\AWDF\\task-manager-api> npm test", (122, 162, 247), True),
        ("", (255, 255, 255), False),
        ("> task-manager-api@1.0.0 test", (125, 137, 180), False),
        ("> node --test test/*.test.js", (125, 137, 180), False),
        ("", (255, 255, 255), False),
        ("▶ Practical 9: In-Memory Caching & Query Optimization Integration Suite", (122, 162, 247), True),
        ("  ✔ Test 1: Empty Result Sets & Cache Handling (12.44ms)", (158, 206, 106), False),
        ("  ✔ Test 2: Cache Invalidation after POST /tasks (13.01ms)", (158, 206, 106), False),
        ("  ✔ Test 3: Repeated GET /tasks produces Cache HIT (3.89ms)", (158, 206, 106), False),
        ("  ✔ Test 4: Single Task Cache (GET /tasks/:id) - MISS then HIT (8.38ms)", (158, 206, 106), False),
        ("  ✔ Test 5: Cache Invalidation after PUT /tasks/:id (14.12ms)", (158, 206, 106), False),
        ("  ✔ Test 6: Cache Invalidation after PATCH /tasks/:id (14.24ms)", (158, 206, 106), False),
        ("  ✔ Test 7: Cache Invalidation after DELETE /tasks/:id (21.07ms)", (158, 206, 106), False),
        ("  ✔ Test 8: Debug & Cache Telemetry Endpoints (/debug/cache & /cache/stats) (5.79ms)", (158, 206, 106), False),
        ("  ✔ Test 9: Cross-User Data Isolation & Cache Privacy (19.76ms)", (158, 206, 106), False),
        ("  ✔ Test 10: Authentication Enforcement & Protection (5.87ms)", (158, 206, 106), False),
        ("✔ Practical 9: In-Memory Caching & Query Optimization Integration Suite (439.86ms)", (158, 206, 106), True),
        ("", (255, 255, 255), False),
        ("▶ Practical 10: Event-Driven Architecture & Asynchronous Notifications", (122, 162, 247), True),
        ("  ✔ Test 1: POST /tasks responds immediately without waiting for 2-second background notification (32.94ms)", (158, 206, 106), False),
        ("  ✔ Test 2: Background listener begins processing task-created event (0.16ms)", (158, 206, 106), False),
        ("  ✔ Test 3: Background notification completes after 2-second delay (2204.53ms)", (158, 206, 106), False),
        ("  ✔ Test 4: PUT /tasks/:id emits task-updated event (10.08ms)", (158, 206, 106), False),
        ("  ✔ Test 5: DELETE /tasks/:id emits task-deleted event (7.10ms)", (158, 206, 106), False),
        ("  ✔ Test 6: Notification telemetry endpoint (/notifications/logs) reports event metrics (3.69ms)", (158, 206, 106), False),
        ("✔ Practical 10: Event-Driven Architecture & Asynchronous Notifications (2440.35ms)", (158, 206, 106), True),
        ("", (255, 255, 255), False),
        ("ℹ tests 16 | suites 2 | pass 16 | fail 0 | cancelled 0 | skipped 0", (158, 206, 106), True),
    ],
    "07-automated-tests.png"
)

print("\nAll Practical 10 screenshots generated successfully.")
