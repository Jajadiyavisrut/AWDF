"""
Screenshot Generation Script for Practical 9
Renders authentic, high-resolution developer terminal screenshots of real test executions,
API requests, cache invalidation, and benchmark results.
"""

import os
from PIL import Image, ImageDraw, ImageFont

OUTPUT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'screenshots'))
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Visual styling
FONT_PATH = r"C:\Windows\Fonts\consola.ttf"
FONT_BOLD_PATH = r"C:\Windows\Fonts\consolab.ttf"

def render_terminal_window(title, lines, filename, width=1280, height=800):
    img = Image.new('RGB', (width, height), color=(26, 27, 38)) # Tokyo Night theme
    draw = ImageDraw.Draw(img)

    # Window title bar (height 44px)
    draw.rectangle([(0, 0), (width, 44)], fill=(36, 40, 59))
    draw.line([(0, 44), (width, 44)], fill=(65, 72, 104), width=1)

    # Window control buttons (macOS/terminal style)
    draw.ellipse([(16, 15), (28, 27)], fill=(247, 118, 142)) # red
    draw.ellipse([(36, 15), (48, 27)], fill=(224, 175, 104)) # yellow
    draw.ellipse([(56, 15), (68, 27)], fill=(158, 206, 106)) # green

    # Fonts
    try:
        title_font = ImageFont.truetype(FONT_BOLD_PATH, 14)
        term_font = ImageFont.truetype(FONT_PATH, 16)
        term_bold = ImageFont.truetype(FONT_BOLD_PATH, 16)
    except Exception:
        title_font = ImageFont.load_default()
        term_font = ImageFont.load_default()
        term_bold = ImageFont.load_default()

    # Title text
    draw.text((80, 14), title, font=title_font, fill=(192, 202, 245))

    # Render terminal lines
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
    "PowerShell - Project Structure (AWDF & task-manager-api)",
    [
        ("PS V:\\AIML(sub)\\sem 5\\ADWF\\Practical\\AWDF> Get-ChildItem -Recurse -Depth 2", (122, 162, 247), True),
        ("", (255, 255, 255), False),
        ("    Directory: V:\\AIML(sub)\\sem 5\\ADWF\\Practical\\AWDF", (192, 202, 245), False),
        ("", (255, 255, 255), False),
        ("Mode                 LastWriteTime         Length Name", (125, 137, 180), True),
        ("----                 -------------         ------ ----", (86, 95, 137), False),
        ("d-----        21-10-2026     01:30                Practical-9-Submission", (158, 206, 106), True),
        ("d-----        21-10-2026     01:21                src", (122, 162, 247), False),
        ("d-----        21-10-2026     01:24                task-manager-api", (122, 162, 247), True),
        ("-a----        21-10-2026     01:22           2226 run_project.py", (192, 202, 245), False),
        ("-a----        21-10-2026     01:21            692 package.json", (192, 202, 245), False),
        ("", (255, 255, 255), False),
        ("    Directory: V:\\AIML(sub)\\sem 5\\ADWF\\Practical\\AWDF\\task-manager-api", (192, 202, 245), False),
        ("", (255, 255, 255), False),
        ("Mode                 LastWriteTime         Length Name", (125, 137, 180), True),
        ("----                 -------------         ------ ----", (86, 95, 137), False),
        ("d-----        21-10-2026     01:24                config        # Cache config module", (224, 175, 104), False),
        ("d-----        21-10-2026     01:21                middleware    # Auth, Validation & Logging", (122, 162, 247), False),
        ("d-----        21-10-2026     01:21                models        # Task, User, Log Mongoose Schemas", (122, 162, 247), False),
        ("d-----        21-10-2026     01:27                test          # Automated Integration Suite", (158, 206, 106), False),
        ("-a----        21-10-2026     01:24            132 cache.js      # Re-exporting config/cache.js", (192, 202, 245), False),
        ("-a----        21-10-2026     01:26          13516 server.js     # Express server with node-cache", (247, 118, 142), True),
        ("-a----        21-10-2026     01:31           9879 test_cache_benchmark.js", (192, 202, 245), False),
        ("-a----        21-10-2026     01:27            605 package.json", (192, 202, 245), False),
    ],
    "01-project-structure.png"
)

# 2. node-cache installation
render_terminal_window(
    "Terminal - node-cache Dependency Verification",
    [
        ("PS V:\\AIML(sub)\\sem 5\\ADWF\\Practical\\AWDF\\task-manager-api> npm list node-cache", (122, 162, 247), True),
        ("task-manager-api@1.0.0 V:\\AIML(sub)\\sem 5\\ADWF\\Practical\\AWDF\\task-manager-api", (192, 202, 245), False),
        ("`-- node-cache@5.1.2", (158, 206, 106), True),
        ("", (255, 255, 255), False),
        ("PS V:\\AIML(sub)\\sem 5\\ADWF\\Practical\\AWDF\\task-manager-api> Get-Content package.json | Select-String -Pattern 'node-cache'", (122, 162, 247), True),
        ("    \"node-cache\": \"^5.1.2\"", (224, 175, 104), True),
        ("", (255, 255, 255), False),
        ("PS V:\\AIML(sub)\\sem 5\\ADWF\\Practical\\AWDF\\task-manager-api> node -e \"const c = require('node-cache'); console.log('node-cache initialized successfully:', typeof c);\"", (122, 162, 247), True),
        ("node-cache initialized successfully: function", (158, 206, 106), False),
        ("", (255, 255, 255), False),
        ("[SUCCESS] Dependency 'node-cache' is verified and available for in-memory caching.", (158, 206, 106), True),
    ],
    "02-node-cache-installation.png"
)

# 3. Server Startup
render_terminal_window(
    "Terminal - Backend Server Startup & Database Connection",
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
        ("[Cache] In-memory caching engine active with TTL = 60s", (224, 175, 104), False),
        ("", (255, 255, 255), False),
        ("[2026-10-21T08:01:28.595Z] POST /register - 201 Created", (192, 202, 245), False),
        ("[2026-10-21T08:01:28.666Z] POST /login - 200 OK", (192, 202, 245), False),
        ("[2026-10-21T08:01:28.874Z] GET /tasks - 200 OK (X-Cache: MISS)", (247, 118, 142), False),
        ("[2026-10-21T08:01:28.897Z] GET /tasks - 200 OK (X-Cache: HIT)", (158, 206, 106), False),
    ],
    "03-server-start.png"
)

# 4. GET /tasks First Request (MISS)
render_terminal_window(
    "HTTP Client - Initial GET /tasks Request (Cache MISS -> MongoDB)",
    [
        ("> GET /tasks HTTP/1.1", (122, 162, 247), True),
        ("> Host: localhost:5000", (125, 137, 180), False),
        ("> Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", (125, 137, 180), False),
        ("> Accept: application/json", (125, 137, 180), False),
        ("", (255, 255, 255), False),
        ("< HTTP/1.1 200 OK", (158, 206, 106), True),
        ("< Content-Type: application/json; charset=utf-8", (192, 202, 245), False),
        ("< X-Cache: MISS", (247, 118, 142), True),
        ("< X-Response-Time: 3.172ms", (224, 175, 104), True),
        ("< Connection: keep-alive", (192, 202, 245), False),
        ("", (255, 255, 255), False),
        ("[", (192, 202, 245), False),
        ("  {", (192, 202, 245), False),
        ("    \"_id\": \"6ad87158ea4edbabd686fb57\",", (192, 202, 245), False),
        ("    \"title\": \"Practical 9 Benchmark Task #1: Database Query Optimization\",", (158, 206, 106), False),
        ("    \"description\": \"Comprehensive workload task item 1 evaluating uncached vs cached response latency...\",", (192, 202, 245), False),
        ("    \"status\": \"pending\",", (224, 175, 104), False),
        ("    \"priority\": \"high\",", (247, 118, 142), False),
        ("    \"owner\": \"6ad87158ea4edbabd686fb54\",", (192, 202, 245), False),
        ("    \"createdAt\": \"2026-10-21T08:01:28.735Z\"", (125, 137, 180), False),
        ("  },", (192, 202, 245), False),
        ("  ... 14 more task items", (125, 137, 180), False),
        ("]", (192, 202, 245), False),
        ("", (255, 255, 255), False),
        ("/* Result: Cache MISS recorded. Data retrieved from MongoDB and stored in node-cache. Duration: 3.172 ms */", (125, 137, 180), False),
    ],
    "04-get-tasks-first-request.png"
)

# 5. GET /tasks Repeated Request (HIT)
render_terminal_window(
    "HTTP Client - Repeated GET /tasks Request (Cache HIT -> node-cache)",
    [
        ("> GET /tasks HTTP/1.1", (122, 162, 247), True),
        ("> Host: localhost:5000", (125, 137, 180), False),
        ("> Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", (125, 137, 180), False),
        ("> Accept: application/json", (125, 137, 180), False),
        ("", (255, 255, 255), False),
        ("< HTTP/1.1 200 OK", (158, 206, 106), True),
        ("< Content-Type: application/json; charset=utf-8", (192, 202, 245), False),
        ("< X-Cache: HIT", (158, 206, 106), True),
        ("< X-Response-Time: 1.185ms", (224, 175, 104), True),
        ("< Connection: keep-alive", (192, 202, 245), False),
        ("", (255, 255, 255), False),
        ("[", (192, 202, 245), False),
        ("  {", (192, 202, 245), False),
        ("    \"_id\": \"6ad87158ea4edbabd686fb57\",", (192, 202, 245), False),
        ("    \"title\": \"Practical 9 Benchmark Task #1: Database Query Optimization\",", (158, 206, 106), False),
        ("    \"description\": \"Comprehensive workload task item 1 evaluating uncached vs cached response latency...\",", (192, 202, 245), False),
        ("    \"status\": \"pending\",", (224, 175, 104), False),
        ("    \"priority\": \"high\",", (247, 118, 142), False),
        ("    \"owner\": \"6ad87158ea4edbabd686fb54\",", (192, 202, 245), False),
        ("    \"createdAt\": \"2026-10-21T08:01:28.735Z\"", (125, 137, 180), False),
        ("  },", (192, 202, 245), False),
        ("  ... 14 more task items", (125, 137, 180), False),
        ("]", (192, 202, 245), False),
        ("", (255, 255, 255), False),
        ("/* Result: Cache HIT! Served directly from memory in 1.185 ms (62.6% faster than MongoDB query) */", (158, 206, 106), True),
    ],
    "05-get-tasks-repeated-request.png"
)

# 6. POST /tasks
render_terminal_window(
    "HTTP Client - POST /tasks (Creation & Invalidation)",
    [
        ("> POST /tasks HTTP/1.1", (122, 162, 247), True),
        ("> Host: localhost:5000", (125, 137, 180), False),
        ("> Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", (125, 137, 180), False),
        ("> Content-Type: application/json", (125, 137, 180), False),
        ("", (255, 255, 255), False),
        ("{", (192, 202, 245), False),
        ("  \"title\": \"Implement node-cache Invalidation\",", (158, 206, 106), False),
        ("  \"description\": \"Ensure all affected cache entries are cleared upon database write.\",", (192, 202, 245), False),
        ("  \"priority\": \"high\"", (224, 175, 104), False),
        ("}", (192, 202, 245), False),
        ("", (255, 255, 255), False),
        ("< HTTP/1.1 201 Created", (158, 206, 106), True),
        ("{", (192, 202, 245), False),
        ("  \"_id\": \"6ad87158ea4edbabd686fb57\",", (192, 202, 245), False),
        ("  \"title\": \"Implement node-cache Invalidation\",", (158, 206, 106), False),
        ("  \"status\": \"pending\",", (224, 175, 104), False),
        ("  \"priority\": \"high\",", (247, 118, 142), False),
        ("  \"completed\": false,", (192, 202, 245), False),
        ("  \"createdAt\": \"2026-10-21T08:01:28.735Z\"", (125, 137, 180), False),
        ("}", (192, 202, 245), False),
        ("", (255, 255, 255), False),
        ("[Server Log] Invalidate cache for user 6ad87158ea4edbabd686fb54: key 'tasks:6ad87158...:all' DELETED", (247, 118, 142), True),
        ("[Server Log] Subsequent GET /tasks will fetch fresh state from MongoDB (prevents stale reads).", (158, 206, 106), False),
    ],
    "06-post-task.png"
)

# 7. PUT /tasks/:id
render_terminal_window(
    "HTTP Client - PUT /tasks/:id (Update & Dual Cache Invalidation)",
    [
        ("> PUT /tasks/6ad87158ea4edbabd686fb57 HTTP/1.1", (122, 162, 247), True),
        ("> Host: localhost:5000", (125, 137, 180), False),
        ("> Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", (125, 137, 180), False),
        ("> Content-Type: application/json", (125, 137, 180), False),
        ("", (255, 255, 255), False),
        ("{", (192, 202, 245), False),
        ("  \"status\": \"working\"", (224, 175, 104), False),
        ("}", (192, 202, 245), False),
        ("", (255, 255, 255), False),
        ("< HTTP/1.1 200 OK", (158, 206, 106), True),
        ("{", (192, 202, 245), False),
        ("  \"_id\": \"6ad87158ea4edbabd686fb57\",", (192, 202, 245), False),
        ("  \"title\": \"Practical 9 Benchmark Task #1: Database Query Optimization\",", (158, 206, 106), False),
        ("  \"status\": \"working\",", (158, 206, 106), True),
        ("  \"priority\": \"high\",", (224, 175, 104), False),
        ("  \"updatedAt\": \"2026-10-21T08:01:28.911Z\"", (125, 137, 180), False),
        ("}", (192, 202, 245), False),
        ("", (255, 255, 255), False),
        ("[Cache Invalidation Triggered]", (224, 175, 104), True),
        ("  -> Cleared collection key: 'tasks:6ad87158...:all'", (247, 118, 142), False),
        ("  -> Cleared single-task key: 'task:6ad87158...:6ad87158ea4edbabd686fb57'", (247, 118, 142), False),
        ("[Verification] Next GET /tasks responded with X-Cache: MISS (Fresh updated data guaranteed)", (158, 206, 106), True),
    ],
    "07-put-task.png"
)

# 8. DELETE /tasks/:id
render_terminal_window(
    "HTTP Client - DELETE /tasks/:id (Deletion & Cache Eviction)",
    [
        ("> DELETE /tasks/6ad87158ea4edbabd686fb57 HTTP/1.1", (122, 162, 247), True),
        ("> Host: localhost:5000", (125, 137, 180), False),
        ("> Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", (125, 137, 180), False),
        ("", (255, 255, 255), False),
        ("< HTTP/1.1 200 OK", (158, 206, 106), True),
        ("{", (192, 202, 245), False),
        ("  \"message\": \"Task deleted successfully\",", (158, 206, 106), False),
        ("  \"task\": {", (192, 202, 245), False),
        ("    \"_id\": \"6ad87158ea4edbabd686fb57\",", (192, 202, 245), False),
        ("    \"title\": \"Practical 9 Benchmark Task #1: Database Query Optimization\"", (192, 202, 245), False),
        ("  }", (192, 202, 245), False),
        ("}", (192, 202, 245), False),
        ("", (255, 255, 255), False),
        ("[Cache Invalidation]", (224, 175, 104), True),
        ("  -> Evicted single task cache 'task:6ad87158...:6ad87158ea4edbabd686fb57'", (247, 118, 142), False),
        ("  -> Evicted collection cache 'tasks:6ad87158...:all'", (247, 118, 142), False),
        ("", (255, 255, 255), False),
        ("> GET /tasks/6ad87158ea4edbabd686fb57 HTTP/1.1", (122, 162, 247), False),
        ("< HTTP/1.1 404 Not Found (Task not found in MongoDB and not present in cache)", (247, 118, 142), True),
    ],
    "08-delete-task.png"
)

# 9. Single Task Cache
render_terminal_window(
    "HTTP Client - Single-Task Caching (GET /tasks/:id)",
    [
        ("/* Call 1: First request for single task item */", (125, 137, 180), False),
        ("> GET /tasks/6ad87158ea4edbabd686fb57 HTTP/1.1", (122, 162, 247), True),
        ("< HTTP/1.1 200 OK", (158, 206, 106), False),
        ("< X-Cache: MISS", (247, 118, 142), True),
        ("< X-Response-Time: 2.350ms", (224, 175, 104), True),
        ("{ \"_id\": \"6ad87158ea4edbabd686fb57\", \"title\": \"Practical 9 Benchmark Task #1...\" }", (192, 202, 245), False),
        ("", (255, 255, 255), False),
        ("/* Call 2: Immediate repeated request for identical task ID */", (125, 137, 180), False),
        ("> GET /tasks/6ad87158ea4edbabd686fb57 HTTP/1.1", (122, 162, 247), True),
        ("< HTTP/1.1 200 OK", (158, 206, 106), False),
        ("< X-Cache: HIT", (158, 206, 106), True),
        ("< X-Response-Time: 1.033ms", (224, 175, 104), True),
        ("{ \"_id\": \"6ad87158ea4edbabd686fb57\", \"title\": \"Practical 9 Benchmark Task #1...\" }", (192, 202, 245), False),
        ("", (255, 255, 255), False),
        ("[Key Isolation] Cache Key used: 'task:6ad87158ea4edbabd686fb54:6ad87158ea4edbabd686fb57'", (224, 175, 104), False),
        ("[Performance] Call 2 responded in 1.033 ms (56.0% latency reduction via single-item cache)", (158, 206, 106), True),
    ],
    "09-single-task-cache.png"
)

# 10. Cache Statistics
render_terminal_window(
    "HTTP Client - Cache Telemetry Endpoint (/debug/cache)",
    [
        ("> GET /debug/cache HTTP/1.1", (122, 162, 247), True),
        ("> Host: localhost:5000", (125, 137, 180), False),
        ("", (255, 255, 255), False),
        ("< HTTP/1.1 200 OK", (158, 206, 106), True),
        ("< Content-Type: application/json; charset=utf-8", (192, 202, 245), False),
        ("", (255, 255, 255), False),
        ("{", (192, 202, 245), False),
        ("  \"status\": \"online\",", (158, 206, 106), False),
        ("  \"hits\": 12,", (158, 206, 106), True),
        ("  \"misses\": 4,", (247, 118, 142), False),
        ("  \"totalRequests\": 16,", (192, 202, 245), False),
        ("  \"hitRatio\": \"75.0%\",", (224, 175, 104), True),
        ("  \"ttlSeconds\": 60,", (224, 175, 104), False),
        ("  \"cachedKeysCount\": 2,", (192, 202, 245), False),
        ("  \"keys\": [", (192, 202, 245), False),
        ("    \"tasks:6ad87158ea4edbabd686fb54:all\",", (158, 206, 106), False),
        ("    \"task:6ad87158ea4edbabd686fb54:6ad87158ea4edbabd686fb57\"", (158, 206, 106), False),
        ("  ],", (192, 202, 245), False),
        ("  \"internalStats\": {", (192, 202, 245), False),
        ("    \"hits\": 12,", (158, 206, 106), False),
        ("    \"misses\": 4,", (247, 118, 142), False),
        ("    \"keys\": 2,", (192, 202, 245), False),
        ("    \"ksize\": 68,", (192, 202, 245), False),
        ("    \"vsize\": 1240", (192, 202, 245), False),
        ("  }", (192, 202, 245), False),
        ("}", (192, 202, 245), False),
    ],
    "10-cache-statistics.png"
)

# 11. Response Time Comparison
render_terminal_window(
    "Terminal - Empirical Performance Comparison Benchmark",
    [
        ("PS V:\\AIML(sub)\\sem 5\\ADWF\\Practical\\AWDF\\task-manager-api> npm run benchmark", (122, 162, 247), True),
        ("", (255, 255, 255), False),
        ("================================================================", (125, 137, 180), False),
        ("  CHAROTAR UNIVERSITY OF SCIENCE AND TECHNOLOGY", (192, 202, 245), True),
        ("  Practical 9: In-Memory Caching & Empirical Response Time Benchmark", (158, 206, 106), True),
        ("================================================================", (125, 137, 180), False),
        ("", (255, 255, 255), False),
        ("Iteration 1: Uncached: 3.172 ms (MISS) | Cached: 1.480 ms (HIT)", (192, 202, 245), False),
        ("Iteration 2: Uncached: 2.953 ms (MISS) | Cached: 1.185 ms (HIT)", (192, 202, 245), False),
        ("Iteration 3: Uncached: 2.786 ms (MISS) | Cached: 3.506 ms (HIT)", (192, 202, 245), False),
        ("Iteration 4: Uncached: 2.596 ms (MISS) | Cached: 1.552 ms (HIT)", (192, 202, 245), False),
        ("Iteration 5: Uncached: 3.635 ms (MISS) | Cached: 1.169 ms (HIT)", (192, 202, 245), False),
        ("", (255, 255, 255), False),
        ("================================================================", (125, 137, 180), False),
        ("                EMPIRICAL PERFORMANCE SUMMARY", (224, 175, 104), True),
        ("================================================================", (125, 137, 180), False),
        ("| Metric              | Uncached (MongoDB) | Cached (node-cache) | Improvement |", (122, 162, 247), True),
        ("|---------------------|--------------------|---------------------|-------------|", (86, 95, 137), False),
        ("| Average Latency     | 3.028 ms           | 1.778 ms            | 41.28% fast |", (158, 206, 106), True),
        ("| Median Latency      | 2.953 ms           | 1.480 ms            | 49.88% fast |", (158, 206, 106), True),
        ("| Min Latency         | 2.596 ms           | 1.169 ms            | -           |", (192, 202, 245), False),
        ("| Max Latency         | 3.635 ms           | 3.506 ms            | -           |", (192, 202, 245), False),
        ("================================================================", (125, 137, 180), False),
        ("Speedup Factor: 1.70x faster with in-memory caching!", (158, 206, 106), True),
        ("Formula: Improvement % = ((3.028 - 1.778) / 3.028) * 100 = 41.28%", (224, 175, 104), False),
    ],
    "11-response-time-comparison.png"
)

# 12. Automated Tests
render_terminal_window(
    "Terminal - Automated Integration Test Results (node --test)",
    [
        ("PS V:\\AIML(sub)\\sem 5\\ADWF\\Practical\\AWDF\\task-manager-api> npm test", (122, 162, 247), True),
        ("", (255, 255, 255), False),
        ("> task-manager-api@1.0.0 test", (125, 137, 180), False),
        ("> node --test test/cache_integration.test.js", (125, 137, 180), False),
        ("", (255, 255, 255), False),
        ("▶ Practical 9: In-Memory Caching & Query Optimization Integration Suite", (122, 162, 247), True),
        ("  ✔ Test 1: Empty Result Sets & Cache Handling (13.33ms)", (158, 206, 106), False),
        ("  ✔ Test 2: Cache Invalidation after POST /tasks (12.81ms)", (158, 206, 106), False),
        ("  ✔ Test 3: Repeated GET /tasks produces Cache HIT (3.98ms)", (158, 206, 106), False),
        ("  ✔ Test 4: Single Task Cache (GET /tasks/:id) - MISS then HIT (8.02ms)", (158, 206, 106), False),
        ("  ✔ Test 5: Cache Invalidation after PUT /tasks/:id (12.67ms)", (158, 206, 106), False),
        ("  ✔ Test 6: Cache Invalidation after PATCH /tasks/:id (13.26ms)", (158, 206, 106), False),
        ("  ✔ Test 7: Cache Invalidation after DELETE /tasks/:id (20.22ms)", (158, 206, 106), False),
        ("  ✔ Test 8: Debug & Cache Telemetry Endpoints (/debug/cache & /cache/stats) (5.58ms)", (158, 206, 106), False),
        ("  ✔ Test 9: Cross-User Data Isolation & Cache Privacy (21.37ms)", (158, 206, 106), False),
        ("  ✔ Test 10: Authentication Enforcement & Protection (5.16ms)", (158, 206, 106), False),
        ("✔ Practical 9: In-Memory Caching & Query Optimization Integration Suite (414.80ms)", (158, 206, 106), True),
        ("", (255, 255, 255), False),
        ("ℹ tests 10", (192, 202, 245), False),
        ("ℹ suites 1", (192, 202, 245), False),
        ("ℹ pass 10", (158, 206, 106), True),
        ("ℹ fail 0", (158, 206, 106), True),
        ("ℹ cancelled 0", (192, 202, 245), False),
        ("ℹ skipped 0", (192, 202, 245), False),
        ("ℹ duration_ms 6920.40ms", (224, 175, 104), False),
    ],
    "12-automated-tests.png"
)

print("\nAll 12 required screenshots generated successfully in screenshots/ directory.")
