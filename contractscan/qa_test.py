#!/usr/bin/env python3
"""QA Test Script for ContractScan API - Tests 5 demo contracts."""

import json
import sys
import time
import urllib.request
import urllib.error

API_URL = "http://localhost:3000/api/analyze"
CONTRACTS_DIR = "/mnt/c/Users/sanme/desktop/Hackathons/AI AGENTS HACKATHON/contractscan/public/demo-contracts"

CONTRACTS = [
    "lease-agreement.txt",
    "employment-offer.txt",
    "nda-agreement.txt",
    "freelance-contract.txt",
    "saas-tos.txt",
]

results = []

for fname in CONTRACTS:
    fpath = f"{CONTRACTS_DIR}/{fname}"
    print(f"\n{'='*70}")
    print(f"TESTING: {fname}")
    print(f"{'='*70}")
    
    # Read contract text
    with open(fpath, "r") as f:
        text = f.read()
    print(f"  File size: {len(text)} chars")
    
    # POST to API
    payload = json.dumps({"text": text}).encode("utf-8")
    req = urllib.request.Request(
        API_URL,
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    
    start = time.time()
    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            body = resp.read().decode("utf-8")
            status = resp.status
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8")
        status = e.code
    except Exception as e:
        body = str(e)
        status = -1
    elapsed = time.time() - start
    
    print(f"  HTTP Status: {status}")
    print(f"  Response time: {elapsed:.1f}s")
    
    # Parse response
    try:
        data = json.loads(body)
    except json.JSONDecodeError:
        print(f"  ERROR: Could not parse JSON response")
        print(f"  Raw: {body[:500]}")
        results.append({
            "file": fname,
            "status": status,
            "pass": False,
            "error": "Invalid JSON",
            "elapsed": elapsed,
        })
        continue
    
    # Check for API error
    if "error" in data:
        print(f"  API ERROR: {data['error']}")
        results.append({
            "file": fname,
            "status": status,
            "pass": False,
            "error": data["error"],
            "elapsed": elapsed,
        })
        continue
    
    # Validate required fields
    has_doc_type = "documentType" in data
    has_overall_risk = "overallRisk" in data
    has_clauses = "clauses" in data and isinstance(data["clauses"], list)
    has_gaps = "gapAnalysis" in data and isinstance(data["gapAnalysis"], list)
    
    doc_type = data.get("documentType", "MISSING")
    overall_risk = data.get("overallRisk", "MISSING")
    clauses = data.get("clauses", [])
    gaps = data.get("gapAnalysis", [])
    
    red_count = sum(1 for c in clauses if c.get("riskLevel") == "red")
    amber_count = sum(1 for c in clauses if c.get("riskLevel") == "amber")
    green_count = sum(1 for c in clauses if c.get("riskLevel") == "green")
    
    structure_ok = has_doc_type and has_overall_risk and has_clauses and has_gaps
    has_red = red_count >= 1
    
    passed = structure_ok and has_red
    
    print(f"  documentType: {doc_type}")
    print(f"  overallRisk: {overall_risk}")
    print(f"  Clauses found: {len(clauses)} (R:{red_count} A:{amber_count} G:{green_count})")
    print(f"  Gaps found: {len(gaps)}")
    print(f"  Has red clauses: {'YES' if has_red else 'NO'}")
    print(f"  Structure valid: {'YES' if structure_ok else 'NO'}")
    print(f"  RESULT: {'PASS' if passed else 'FAIL'}")
    
    results.append({
        "file": fname,
        "status": status,
        "doc_type": doc_type,
        "overall_risk": overall_risk,
        "clauses_total": len(clauses),
        "red": red_count,
        "amber": amber_count,
        "green": green_count,
        "gaps": len(gaps),
        "pass": passed,
        "elapsed": elapsed,
        "errors": [],
    })

# Print summary table
print(f"\n\n{'='*110}")
print(f"QA TEST SUMMARY")
print(f"{'='*110}")
header = f"{'File':<25} {'DocType':<28} {'Risk':<7} {'Cls':>4} {'R':>3} {'A':>3} {'G':>3} {'Gaps':>5} {'Time':>6}  {'Result':>6}"
print(header)
print("-" * 110)

total_pass = 0
for r in results:
    if r["pass"]:
        total_pass += 1
        result_str = "PASS"
    else:
        result_str = "FAIL"
    
    doc_type = r.get("doc_type", "N/A")
    overall_risk = r.get("overall_risk", "N/A")
    line = f"{r['file']:<25} {doc_type:<28} {overall_risk:<7} {r.get('clauses_total',0):>4} {r.get('red',0):>3} {r.get('amber',0):>3} {r.get('green',0):>3} {r.get('gaps',0):>5} {r.get('elapsed',0):>5.1f}s  {result_str:>6}"
    
    if "error" in r and not r["pass"]:
        line = f"{r['file']:<25} {'ERROR':<28} {'-':<7} {'-':>4} {'-':>3} {'-':>3} {'-':>3} {'-':>5} {r.get('elapsed',0):>5.1f}s  {'FAIL':>6}"
    
    print(line)

print("-" * 110)
print(f"TOTAL: {total_pass}/{len(results)} PASSED")
print(f"{'='*110}")

sys.exit(0 if total_pass == len(results) else 1)
