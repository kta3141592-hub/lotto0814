import http.server
import socketserver
import urllib.request
import urllib.parse
import json
import ssl
import re
import time
from concurrent.futures import ThreadPoolExecutor

PORT = 5000

# SSL Context for dhlottery request
ssl_ctx = ssl.create_default_context()
ssl_ctx.check_hostname = False
ssl_ctx.verify_mode = ssl.CERT_NONE

# In-Memory Cache
draw_cache = {}
cached_latest_round = None
last_latest_check = 0

def fetch_round_data(drw_no):
    if drw_no in draw_cache:
        return draw_cache[drw_no]

    url = f'https://www.dhlottery.co.kr/lt645/selectPstLt645InfoNew.do?srchDir=center&srchLtEpsd={drw_no}'
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Referer': 'https://www.dhlottery.co.kr/lt645/result'
    }

    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, context=ssl_ctx, timeout=5) as res:
            raw = res.read().decode('utf-8')
            resp_json = json.loads(raw)
            data_list = resp_json.get('data', {}).get('list', [])
            if data_list and len(data_list) > 0:
                item = data_list[0]
                numbers = [
                    int(item.get('tm1WnNo')),
                    int(item.get('tm2WnNo')),
                    int(item.get('tm3WnNo')),
                    int(item.get('tm4WnNo')),
                    int(item.get('tm5WnNo')),
                    int(item.get('tm6WnNo'))
                ]
                numbers.sort()
                
                parsed = {
                    'drwNo': int(item.get('ltEpsd')),
                    'drwNoDate': item.get('drwDate', ''),
                    'numbers': numbers,
                    'bonusNo': int(item.get('bnsWnNo')),
                    'firstWinamnt': item.get('firstWinamnt', 0),
                    'firstPrzwnerCo': item.get('firstPrzwnerCo', 0),
                }
                draw_cache[drw_no] = parsed
                return parsed
    except Exception as e:
        print(f"Error fetching round {drw_no}:", e)
    return None

def find_latest_round():
    global cached_latest_round, last_latest_check
    now = time.time()
    if cached_latest_round and (now - last_latest_check < 600):
        return cached_latest_round

    # Estimate based on date or fetch latest result page
    url = 'https://www.dhlottery.co.kr/lt645/result'
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }

    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, context=ssl_ctx, timeout=5) as res:
            html = res.read().decode('utf-8', errors='replace')
            rounds = re.findall(r'data-value="(\d+)"', html)
            if rounds:
                rounds_int = [int(r) for r in rounds]
                max_round = max(rounds_int)
                cached_latest_round = max_round
                last_latest_check = now
                return max_round
    except Exception as e:
        print("Error finding latest round from page:", e)

    return 1236 # Fallback current round

class LottoHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        parsed_url = urllib.parse.urlparse(self.path)
        path = parsed_url.path
        query = urllib.parse.parse_qs(parsed_url.query)

        if path == '/api/lotto/latest':
            latest_num = find_latest_round()
            data = fetch_round_data(latest_num)
            if data:
                self.send_json({'success': True, 'data': data})
            else:
                self.send_json({'success': False, 'message': 'Latest round not found'}, status=404)
            return

        elif path == '/api/lotto/stats':
            count = 30
            if 'count' in query:
                try:
                    count = int(query['count'][0])
                except:
                    pass
            count = max(5, min(100, count))

            latest_num = find_latest_round()
            start_num = max(1, latest_num - count + 1)
            rounds_to_fetch = list(range(latest_num, start_num - 1, -1))

            # Fetch rounds concurrently
            with ThreadPoolExecutor(max_workers=10) as executor:
                results = list(executor.map(fetch_round_data, rounds_to_fetch))

            fetched_rounds = [r for r in results if r is not None]

            # Aggregate stats 1..45
            frequencies = {i: 0 for i in range(1, 46)}
            bonus_frequencies = {i: 0 for i in range(1, 46)}

            for r in fetched_rounds:
                for num in r['numbers']:
                    frequencies[num] += 1
                bonus_frequencies[r['bonusNo']] += 1

            sorted_by_freq = sorted(
                [{'num': k, 'count': v} for k, v in frequencies.items()],
                key=lambda x: (-x['count'], x['num'])
            )

            hot_numbers = sorted_by_freq[:5]
            cold_numbers = sorted_by_freq[::-1][:5]

            res_payload = {
                'success': True,
                'data': {
                    'latestRound': latest_num,
                    'totalRoundsAnalyzed': len(fetched_rounds),
                    'startRound': start_num,
                    'endRound': latest_num,
                    'frequencies': frequencies,
                    'bonusFrequencies': bonus_frequencies,
                    'hotNumbers': hot_numbers,
                    'coldNumbers': cold_numbers,
                    'drawHistory': fetched_rounds
                }
            }
            self.send_json(res_payload)
            return

        elif path == '/api/lotto/mock-stats':
            # Mock fallback if needed
            frequencies = {i: (i * 3 + 2) % 8 + 1 for i in range(1, 46)}
            res_payload = {
                'success': True,
                'data': {
                    'latestRound': 1236,
                    'totalRoundsAnalyzed': 30,
                    'startRound': 1207,
                    'endRound': 1236,
                    'frequencies': frequencies,
                    'hotNumbers': [{'num': 12, 'count': 8}, {'num': 18, 'count': 7}],
                    'coldNumbers': [{'num': 7, 'count': 1}],
                    'drawHistory': []
                }
            }
            self.send_json(res_payload)
            return

        # Default: serve static files from current directory
        return super().do_GET()

    def send_json(self, data, status=200):
        body = json.dumps(data).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

if __name__ == '__main__':
    print(f"Lotto Python Proxy Server starting on http://localhost:{PORT}")
    with socketserver.TCPServer(("", PORT), LottoHandler) as httpd:
        httpd.serve_forever()
