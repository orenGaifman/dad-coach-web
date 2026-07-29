#!/bin/bash
# Dad Coach Asset Generator
# Uses Gemini Image Generation API with Master Style Guide reference
# Usage: ./scripts/generate-assets.sh [asset-number]
# Example: ./scripts/generate-assets.sh 7  (generates onboarding-language-selection)

API_KEY="${GEMINI_API_KEY}"
MODEL="gemini-2.5-flash-image"
BASE_URL="https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}"
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MASTER_STYLE_B64=""

# Encode master style guide if exists
MASTER_STYLE_PATH="${PROJECT_ROOT}/docs/master-style-guide.png"
if [ -f "$MASTER_STYLE_PATH" ]; then
    MASTER_STYLE_B64=$(base64 -i "$MASTER_STYLE_PATH")
    echo "✓ Master Style Guide loaded"
else
    echo "⚠ No master style guide found at $MASTER_STYLE_PATH"
    echo "  Place your style guide image there for best results"
fi

generate_image() {
    local prompt="$1"
    local output_path="$2"
    local filename=$(basename "$output_path")
    
    echo "🎨 Generating: $filename"
    echo "   Prompt: ${prompt:0:80}..."
    echo "   Output: $output_path"
    
    # Build request JSON
    if [ -n "$MASTER_STYLE_B64" ]; then
        REQUEST_JSON=$(cat <<EOF
{
    "contents": [
        {
            "parts": [
                {
                    "inlineData": {
                        "mimeType": "image/png",
                        "data": "${MASTER_STYLE_B64}"
                    }
                },
                {
                    "text": "${prompt}"
                }
            ]
        }
    ],
    "generationConfig": {
        "responseModalities": ["IMAGE", "TEXT"]
    }
}
EOF
)
    else
        REQUEST_JSON=$(cat <<EOF
{
    "contents": [
        {
            "parts": [
                {
                    "text": "${prompt}"
                }
            ]
        }
    ],
    "generationConfig": {
        "responseModalities": ["IMAGE", "TEXT"]
    }
}
EOF
)
    fi
    
    # Make API call
    RESPONSE=$(curl -s "$BASE_URL" \
        -H 'Content-Type: application/json' \
        -X POST \
        -d "$REQUEST_JSON")
    
    # Extract and save image
    echo "$RESPONSE" | python3 -c "
import json, sys, base64, os
data = json.load(sys.stdin)
if 'candidates' in data:
    for part in data['candidates'][0]['content']['parts']:
        if 'inlineData' in part:
            img_data = part['inlineData']['data']
            os.makedirs(os.path.dirname('${output_path}'), exist_ok=True)
            with open('${output_path}', 'wb') as f:
                f.write(base64.b64decode(img_data))
            print(f'   ✅ Saved ({len(img_data)//1024}KB base64)')
            sys.exit(0)
        elif 'text' in part:
            print(f'   ℹ️  {part[\"text\"][:100]}')
    print('   ❌ No image in response')
    sys.exit(1)
elif 'error' in data:
    print(f'   ❌ Error: {data[\"error\"][\"message\"][:200]}')
    sys.exit(1)
else:
    print(f'   ❌ Unexpected response')
    print(json.dumps(data, indent=2)[:500])
    sys.exit(1)
"
    return $?
}

echo "═══════════════════════════════════════════"
echo "  Dad Coach Asset Generator"
echo "  Project: ${PROJECT_ROOT}"
echo "═══════════════════════════════════════════"
echo ""
