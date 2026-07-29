#!/usr/bin/env python3
"""
Dad Coach Asset Generator
Generates production-quality illustrations using Gemini Image API.
Uses Master Style Guide as visual reference when available.

Usage:
    python3 scripts/generate-asset.py <asset_number>
    python3 scripts/generate-asset.py all
    python3 scripts/generate-asset.py 7-14  (range)
"""

import json
import sys
import base64
import os
import time
import urllib.request
import urllib.error

API_KEY = os.environ.get("GEMINI_API_KEY", "")
MODEL = "gemini-2.5-flash-image"
BASE_URL = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent?key={API_KEY}"

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Master style context prompt prefix
STYLE_PREFIX = """You are generating a production asset for "Dad Coach" - a premium fatherhood coaching application.

VISUAL STYLE RULES (from Master Style Guide):
- Premium quality, NOT childish, NOT cartoonish
- Similar quality to Apple + Headspace + Duolingo
- Dark navy/indigo backgrounds (#0F172A, #1E293B, #2C2C6E)
- Warm accents: Gold (#B88B1E), Emerald (#13A881), Success green (#20CC8E)
- 3D rendered character style with soft lighting and warm gradients
- Characters: realistic proportions, friendly expressions, diverse
- Lighting: warm, golden hour feeling, soft glows
- Mood: warm, trustworthy, modern, hopeful, motivating
- NO text in illustrations
- NO UI elements
- Clean composition with single focal point
- Suitable for mobile app (will be displayed at various sizes)

GENERATE THIS ASSET:
"""

# Asset definitions: (id, filename, folder, prompt)
ASSETS = {
    # LOGOS
    1: ("dad-coach-logo-full.webp", "public/logos/", 
        "A premium app logo for 'Dad Coach'. A circular emblem featuring a stylized torii gate with a father figure silhouette, surrounded by a subtle golden glow. The style is minimal, modern, premium. Dark navy background (#0F172A). The logo should feel like a premium lifestyle brand. No text. Clean vector-like quality. 512x512 pixels."),
    
    2: ("dad-coach-logo-icon.webp", "public/logos/",
        "A minimal circular app icon for 'Dad Coach'. Features a simplified torii gate with a subtle father silhouette integrated. Deep indigo/navy gradient background. Golden accent glow. Premium, clean, modern. Suitable for favicon and app icon. Square format. No text."),
    
    3: ("dad-coach-logo-light.webp", "public/logos/",
        "Same Dad Coach logo icon (torii gate + father silhouette) but designed for light backgrounds. Deep indigo/navy colored icon on transparent/white background. Premium, minimal. No text."),

    # BRAND
    4: ("og-image.webp", "public/brand/",
        "A social media preview card (landscape 1200x630 ratio) for Dad Coach app. Shows a father and child walking together on a starlit path toward a glowing torii gate. Dark navy sky with warm golden light ahead. Premium, cinematic quality. Warm and inviting. No text. The composition should leave room for text overlay on the left third."),
    
    5: ("favicon.png", "public/brand/",
        "A tiny 32x32 favicon for Dad Coach. Simple torii gate silhouette in gold/emerald on dark navy circle. Extremely simple, recognizable at small sizes. No text."),

    # ONBOARDING ILLUSTRATIONS
    7: ("onboarding-language-selection.webp", "public/illustrations/",
        "A welcoming illustration for a language selection screen. A friendly father figure standing at a crossroads with two illuminated paths. Warm golden lighting. The scene represents choice and beginning. Premium 3D rendered style with soft gradients. Dark navy environment with warm light sources. No text, no flags, no UI elements. The father looks welcoming and confident. Vertical composition suitable for mobile screen top half."),
    
    8: ("onboarding-welcome.webp", "public/illustrations/",
        "A heartwarming welcome illustration. A father and young child walking hand-in-hand toward a glowing torii gate on a starlit path. The path ahead is illuminated with warm golden light. Night sky with stars. Premium 3D rendered characters with realistic proportions. The mood is hopeful, the journey is beginning. No text. Vertical mobile composition."),
    
    9: ("onboarding-register.webp", "public/illustrations/",
        "An illustration for a registration/sign-up screen. A father figure holding a glowing smartphone, with warm light emanating from the screen illuminating his face. Subtle connection lines/particles flowing from the phone. Dark navy environment. Premium 3D style. The mood is modern, connected, trustworthy. No text. Vertical mobile composition."),
    
    10: ("onboarding-father-info.webp", "public/illustrations/",
        "An illustration representing personal profile creation. A father figure with a subtle golden aura/outline being formed around him, as if his identity is being recognized. Warm lighting, dark navy background. Stars and gentle particles. Premium 3D rendered. The mood is personal, meaningful, recognized. No text. Vertical mobile composition."),
    
    11: ("onboarding-children.webp", "public/illustrations/",
        "An illustration for adding children information. A proud father with 2-3 children of different ages around him, all looking happy and connected. Warm golden lighting from above. Dark navy starlit background. Premium 3D characters with friendly expressions. The mood is family, love, togetherness. No text. Vertical mobile composition."),
    
    12: ("onboarding-goals.webp", "public/illustrations/",
        "An illustration for a goals selection screen. A father figure standing at the base of a gentle mountain path with multiple glowing waypoints/milestones visible ahead. Each waypoint has a subtle different colored glow (emerald, gold, blue). Dark navy sky with stars. Premium 3D style. The mood is aspiration, growth, possibility. No text. Vertical mobile composition."),
    
    13: ("onboarding-activation.webp", "public/illustrations/",
        "An illustration for WhatsApp activation. A father figure with a phone, and a friendly AI coach avatar appearing from the phone as a warm holographic projection. Green WhatsApp-colored accent light. Dark navy background. Premium 3D style. The mood is connection, technology meeting warmth, a coach arriving. No text. Vertical mobile composition."),
    
    14: ("onboarding-success.webp", "public/illustrations/",
        "A celebration illustration for onboarding completion. A father with arms raised in a victorious pose, golden light bursting around him, subtle confetti particles. A path behind him shows the journey completed. Stars and warm glow. Dark navy background. Premium 3D style. The mood is achievement, joy, new beginning. No text. Vertical mobile composition."),

    # DASHBOARD
    15: ("dashboard-empty.webp", "public/dashboard/",
        "An empty state illustration for a dashboard with no data yet. A serene path stretching forward into warm light, with the first step illuminated invitingly. Minimal, no characters. Dark navy environment with golden light ahead. Premium quality. The mood is invitation, potential, first step. No text. Square composition."),
    
    16: ("dashboard-hero.webp", "public/dashboard/",
        "A dashboard header illustration. A father silhouette walking confidently on a path at golden hour. Morning light breaking through. Birds in the distance. Premium 3D rendered. Dark navy to warm gradient sky. The mood is motivation, a new day, progress. No text. Wide landscape composition (3:1 ratio)."),
    
    17: ("mission-quality-time.webp", "public/dashboard/",
        "A mission illustration: Quality Time. A father and child sitting together, fully present, building something together (like blocks or a puzzle). Warm golden light surrounds them. Premium 3D rendered. Dark navy background. Intimate, focused moment. No text. Square composition."),
    
    18: ("mission-listening.webp", "public/dashboard/",
        "A mission illustration: Active Listening. A father kneeling to child's eye level, giving full attention. Warm light between them suggesting connection. Premium 3D rendered. Dark navy background. The mood is presence, attention, understanding. No text. Square composition."),
    
    19: ("mission-play.webp", "public/dashboard/",
        "A mission illustration: Outdoor Play. A father and child playing together outdoors - perhaps throwing a ball or running together. Warm sunset lighting. Green grass, open space. Premium 3D rendered. The mood is joy, energy, fun together. No text. Square composition."),
    
    20: ("mission-conversation.webp", "public/dashboard/",
        "A mission illustration: Meaningful Conversation. A father and older child (teenager) walking side by side on a path, in conversation. Warm evening light. Premium 3D rendered. Dark navy/sunset background. The mood is connection, openness, trust. No text. Square composition."),
    
    21: ("mission-routine.webp", "public/dashboard/",
        "A mission illustration: Daily Routine. A father helping a child with morning routine - perhaps making breakfast together. Warm morning light through a window. Premium 3D rendered. Cozy kitchen environment. The mood is care, consistency, love in small things. No text. Square composition."),
    
    22: ("coach-avatar.webp", "public/dashboard/",
        "An AI coach avatar for Dad Coach app. A friendly, wise, warm male figure (not too old, not too young) with a gentle smile. Slightly stylized/3D rendered. Warm golden glow around him. Dark navy background. He should feel trustworthy, knowledgeable, supportive - like a wise older brother. Circular portrait composition. No text."),
    
    23: ("coach-welcome.webp", "public/dashboard/",
        "The AI coach character welcoming the father. The coach figure with an open, welcoming gesture (open palms). Warm light emanating from him. Premium 3D rendered. Dark navy background with subtle stars. The mood is welcoming, supportive, ready to help. No text. Vertical composition."),
    
    24: ("insights-empty.webp", "public/dashboard/",
        "An empty state for insights/analytics section. A beautiful telescope or compass pointing toward stars, with subtle constellation lines forming. Dark navy background with gold/emerald accent glows. Premium, minimal. The mood is discovery ahead, potential. No text. Square composition."),
    
    25: ("growth-empty.webp", "public/dashboard/",
        "An empty state for growth tracking. A single seed/sprout just emerging from soil, with a tiny golden glow around it. Dark navy background, subtle starlight. Premium 3D rendered. The mood is beginning, potential, growth about to happen. No text. Square composition."),

    # LANDING PAGE
    26: ("landing-hero.webp", "public/landing/",
        "A cinematic hero illustration for a landing page. A father and child walking together on a starlit path toward a glowing torii gate in the distance. Mountains on sides, night sky full of stars. Golden warm light from the gate ahead. Premium 3D rendered, cinematic quality. Wide landscape composition. The mood is epic journey, hope, fatherhood as a noble path. No text."),
    
    27: ("landing-feature-relationships.webp", "public/landing/",
        "A feature illustration: Build Stronger Relationships. Two hands (father and child) reaching toward each other with a warm golden connection/light between them. Dark navy background. Premium 3D rendered. Simple, iconic. No text. Square composition."),
    
    28: ("landing-feature-guidance.webp", "public/landing/",
        "A feature illustration: Grow with Guidance. A compass with a golden needle pointing forward, surrounded by subtle growth elements (leaves, light). Dark navy background. Premium 3D rendered. The mood is direction, growth, wisdom. No text. Square composition."),
    
    29: ("landing-feature-achievements.webp", "public/landing/",
        "A feature illustration: Unlock Achievements. A glowing trophy/medal floating with golden particles around it, subtle belt progression in background. Dark navy background. Premium 3D rendered. The mood is accomplishment, reward, pride. No text. Square composition."),
    
    30: ("landing-feature-memories.webp", "public/landing/",
        "A feature illustration: Create Lasting Memories. A glowing photograph/polaroid floating, showing a father-child silhouette inside. Warm light, particles of memory floating. Dark navy background. Premium 3D rendered. The mood is nostalgia, treasured moments. No text. Square composition."),

    # BELTS
    31: ("white-belt.webp", "public/belts/",
        "A martial arts belt badge for a progression system. WHITE BELT - Beginner level. A clean white belt tied in a knot, displayed as a badge/emblem. Subtle silver shine. Dark navy background. Premium 3D rendered with soft lighting. Circular badge format. No text."),
    
    32: ("yellow-belt.webp", "public/belts/",
        "A martial arts belt badge for a progression system. YELLOW BELT - Learner level. A warm yellow belt tied in a knot, displayed as a badge/emblem. Subtle golden glow. Dark navy background. Premium 3D rendered with soft lighting. Circular badge format. No text."),
    
    33: ("orange-belt.webp", "public/belts/",
        "A martial arts belt badge for a progression system. ORANGE BELT - Improving level. An orange belt tied in a knot, displayed as a badge/emblem. Warm energetic glow. Dark navy background. Premium 3D rendered with soft lighting. Circular badge format. No text."),
    
    34: ("green-belt.webp", "public/belts/",
        "A martial arts belt badge for a progression system. GREEN BELT - Committed level. An emerald green belt tied in a knot, displayed as a badge/emblem. Growth-colored glow (#13A881). Dark navy background. Premium 3D rendered with soft lighting. Circular badge format. No text."),
    
    35: ("blue-belt.webp", "public/belts/",
        "A martial arts belt badge for a progression system. BLUE BELT - Advanced level. A deep blue belt tied in a knot, displayed as a badge/emblem. Trustworthy blue glow. Dark navy background. Premium 3D rendered with soft lighting. Circular badge format. No text."),
    
    36: ("purple-belt.webp", "public/belts/",
        "A martial arts belt badge for a progression system. PURPLE BELT - Expert level. A rich purple belt tied in a knot, displayed as a badge/emblem. Wise purple glow. Dark navy background. Premium 3D rendered with soft lighting. Circular badge format. No text."),
    
    37: ("brown-belt.webp", "public/belts/",
        "A martial arts belt badge for a progression system. BROWN BELT - Master level. A deep brown belt tied in a knot, displayed as a badge/emblem. Grounded, earthy glow. Dark navy background. Premium 3D rendered with soft lighting. Circular badge format. No text."),
    
    38: ("black-belt.webp", "public/belts/",
        "A martial arts belt badge for a progression system. BLACK BELT - Dad Sensei level (highest). A sleek black belt tied in a knot, displayed as a badge/emblem. Golden/platinum edge highlights suggesting mastery. Dark navy background. Premium 3D rendered with soft lighting. Circular badge format. No text."),

    # ACHIEVEMENTS
    39: ("great-listener.webp", "public/achievements/",
        "An achievement badge: Great Listener. A stylized ear icon with golden sound waves/circles emanating inward. Set in a circular medal/badge frame with emerald and gold accents. Dark navy background. Premium 3D rendered. No text."),
    
    40: ("quality-time-champion.webp", "public/achievements/",
        "An achievement badge: Quality Time Champion. A heart combined with a clock, glowing warmly. Set in a circular medal/badge frame with gold accents. Dark navy background. Premium 3D rendered. No text."),
    
    41: ("first-mission.webp", "public/achievements/",
        "An achievement badge: First Mission Complete. A shining star with a subtle rocket trail. Set in a circular medal/badge frame with gold and emerald accents. Dark navy background. Premium 3D rendered. No text."),
    
    42: ("streak-7-days.webp", "public/achievements/",
        "An achievement badge: 7-Day Streak. A flame/fire icon with the number 7 subtly integrated into the design. Set in a circular medal/badge frame with orange and gold accents. Dark navy background. Premium 3D rendered. No text other than the number 7."),
    
    43: ("streak-30-days.webp", "public/achievements/",
        "An achievement badge: 30-Day Streak. A blazing fire icon larger and more intense than 7-day, with 30 subtly integrated. Set in a circular medal/badge frame with red-orange and gold accents. Dark navy background. Premium 3D rendered. No text other than 30."),
    
    44: ("deep-conversation.webp", "public/achievements/",
        "An achievement badge: Deep Conversation. Two speech bubbles overlapping with a depth/layer effect, glowing with warm connection. Set in a circular medal/badge frame with blue and gold accents. Dark navy background. Premium 3D rendered. No text."),
    
    45: ("patience-master.webp", "public/achievements/",
        "An achievement badge: Patience Master. A zen circle (enso) with a gentle lotus or water drop inside. Set in a circular medal/badge frame with calm blue and silver accents. Dark navy background. Premium 3D rendered. No text."),
    
    46: ("playful-dad.webp", "public/achievements/",
        "An achievement badge: Playful Dad. A bouncing ball with motion lines and joy sparks. Set in a circular medal/badge frame with bright emerald and gold accents. Dark navy background. Premium 3D rendered. No text."),
    
    47: ("bedtime-hero.webp", "public/achievements/",
        "An achievement badge: Bedtime Hero. A crescent moon cradling a small star. Set in a circular medal/badge frame with deep blue and silver accents. Dark navy background. Premium 3D rendered. No text."),
    
    48: ("growth-milestone.webp", "public/achievements/",
        "An achievement badge: Growth Milestone. A small tree growing from an acorn, showing progression. Set in a circular medal/badge frame with emerald green and gold accents. Dark navy background. Premium 3D rendered. No text."),

    # CELEBRATION/STATE ILLUSTRATIONS
    64: ("celebration-confetti.webp", "public/illustrations/",
        "A celebration illustration with golden confetti particles, emerald sparkles, and warm light bursts against a dark navy background. No characters. Abstract celebration moment. Premium quality. The mood is pure joy and achievement. No text. Square composition."),
    
    65: ("loading-journey.webp", "public/illustrations/",
        "A minimal loading state illustration. A glowing path with subtle moving particles of light traveling along it. Dark navy background. Minimal, abstract, suggests movement and progress. Premium quality. No text. Square composition."),
    
    66: ("error-state.webp", "public/illustrations/",
        "A gentle error state illustration. A paper airplane that has gone slightly off course, with a dotted line showing the intended path. Warm colors, not alarming. Dark navy background with soft lighting. Premium quality. The mood is 'small hiccup, easily fixed'. No text. Square composition."),
    
    67: ("offline-state.webp", "public/illustrations/",
        "An offline state illustration. A glowing lantern in fog/clouds, still lit but surrounded by mist. Dark navy background. The mood is 'temporarily disconnected but safe'. Premium quality. Calm and reassuring. No text. Square composition."),
    
    68: ("session-expired.webp", "public/illustrations/",
        "A session expired illustration. An hourglass with the last golden sand grains falling, in a gentle, non-alarming way. Warm golden light from the sand. Dark navy background. Premium quality. The mood is 'time has passed, let's start fresh'. No text. Square composition."),
}


def generate_single_asset(asset_num):
    """Generate a single asset by its number."""
    if asset_num not in ASSETS:
        print(f"❌ Asset #{asset_num} not found in manifest")
        return False
    
    filename, folder, prompt = ASSETS[asset_num]
    output_dir = os.path.join(PROJECT_ROOT, folder)
    output_path = os.path.join(output_dir, filename)
    
    # Skip if already exists
    if os.path.exists(output_path):
        print(f"⏭  #{asset_num} already exists: {filename}")
        return True
    
    os.makedirs(output_dir, exist_ok=True)
    
    full_prompt = STYLE_PREFIX + prompt
    
    print(f"\n🎨 Generating #{asset_num}: {filename}")
    print(f"   → {folder}{filename}")
    
    # Build request
    request_data = {
        "contents": [
            {
                "parts": [
                    {"text": full_prompt}
                ]
            }
        ],
        "generationConfig": {
            "responseModalities": ["IMAGE", "TEXT"]
        }
    }
    
    req = urllib.request.Request(
        BASE_URL,
        data=json.dumps(request_data).encode('utf-8'),
        headers={'Content-Type': 'application/json'},
        method='POST'
    )
    
    try:
        with urllib.request.urlopen(req, timeout=120) as response:
            data = json.loads(response.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        error_body = e.read().decode('utf-8')
        print(f"   ❌ HTTP {e.code}: {error_body[:200]}")
        return False
    except Exception as e:
        print(f"   ❌ Request failed: {e}")
        return False
    
    # Extract image
    if 'candidates' in data:
        for part in data['candidates'][0]['content']['parts']:
            if 'inlineData' in part:
                img_data = base64.b64decode(part['inlineData']['data'])
                with open(output_path, 'wb') as f:
                    f.write(img_data)
                size_kb = len(img_data) // 1024
                print(f"   ✅ Saved ({size_kb}KB)")
                return True
            elif 'text' in part:
                print(f"   ℹ️  {part['text'][:100]}")
        
        print("   ❌ No image in response")
        return False
    elif 'error' in data:
        print(f"   ❌ API Error: {data['error']['message'][:200]}")
        return False
    else:
        print(f"   ❌ Unexpected response")
        return False


def main():
    print("═" * 50)
    print("  Dad Coach Asset Generator")
    print("═" * 50)
    
    if len(sys.argv) < 2:
        print("\nUsage:")
        print("  python3 scripts/generate-asset.py <number>")
        print("  python3 scripts/generate-asset.py 7-14  (range)")
        print("  python3 scripts/generate-asset.py all")
        print(f"\nAvailable assets: {sorted(ASSETS.keys())}")
        return
    
    arg = sys.argv[1]
    
    if arg == "all":
        assets_to_generate = sorted(ASSETS.keys())
    elif "-" in arg:
        start, end = arg.split("-")
        assets_to_generate = [n for n in sorted(ASSETS.keys()) if int(start) <= n <= int(end)]
    else:
        assets_to_generate = [int(arg)]
    
    total = len(assets_to_generate)
    success = 0
    failed = 0
    
    for i, asset_num in enumerate(assets_to_generate, 1):
        print(f"\n[{i}/{total}]", end="")
        if generate_single_asset(asset_num):
            success += 1
        else:
            failed += 1
        
        # Rate limiting - wait between requests
        if i < total:
            print("   ⏳ Waiting 5s (rate limit)...")
            time.sleep(5)
    
    print(f"\n{'═' * 50}")
    print(f"  Done! ✅ {success} generated, ❌ {failed} failed")
    print(f"{'═' * 50}")


if __name__ == "__main__":
    main()
