import requests
import re

def test_conversion():
    # I'll import the fallback parser to verify the regex logic at least.
    from backend.routers.ai import fallback_opportunity_parse
    
    test_cases = [
        ("Need help for 1 hour per day.", "5-10 hours / week"), # 1*5 = 5
        ("Requires 2 hours daily.", "5-10 hours / week"),     # 2*5 = 10
        ("Just 30 mins a day.", "1-2 hours / week"),          # 0.5*5 = 2.5 -> actually 30 mins isn't \d+
        ("Requires 3 hours a day.", "5-10 hours / week"),     # 3*5 = 15
    ]
    
    print("Starting AI Time Conversion Tests...")
    for desc, expected in test_cases:
        result = fallback_opportunity_parse(desc)
        got = result['time_commitment']
        if got == expected:
            print(f"✅ PASS: '{desc}' -> {got}")
        else:
            print(f"❌ FAIL: '{desc}' -> Got: {got}, Expected: {expected}")

if __name__ == "__main__":
    test_conversion()
