with open("sekator.html", "r") as f:
    text = f.read()

# Define blocks based on HTML comments
import re

# Find description block
desc_match = re.search(r'(    <!-- Блок \'Про цей товар\' -->\n.*?)(?=    <!-- Блок Відеоогляд \(Одиночне відео\) -->)', text, re.DOTALL)
if not desc_match:
    print("description block not found")
    exit(1)
desc_block = desc_match.group(1)

# Find video block
video_match = re.search(r'(    <!-- Блок Відеоогляд \(Одиночне відео\) -->\n.*?)(?=    <!-- С этим товаром часто покупают \(Апселл\) -->)', text, re.DOTALL)
if not video_match:
    print("video block not found")
    exit(1)
video_block = video_match.group(1)

# Replace the two blocks combined with the reversed order
combined = desc_block + video_block
reversed_combined = video_block + desc_block

if combined in text:
    new_text = text.replace(combined, reversed_combined)
    with open("sekator.html", "w") as f:
        f.write(new_text)
    print("Successfully reversed blocks")
else:
    print("Could not find combined blocks text")

