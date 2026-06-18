#!/usr/bin/env python3
import sys
import json
import urllib.request

api_token = sys.argv[1]
task_id = sys.argv[2]
parent_id = sys.argv[3]

url = f"https://api.clickup.com/api/v2/task/{task_id}"
payload = {"parent": parent_id}
data = json.dumps(payload).encode('utf-8')

req = urllib.request.Request(url, data=data, method="PUT")
req.add_header('Authorization', api_token)
req.add_header('Content-Type', 'application/json')

try:
    with urllib.request.urlopen(req) as response:
        print(response.status)
except Exception as e:
    print(e)
