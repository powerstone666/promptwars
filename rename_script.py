import os
import glob

def process_file(filepath):
    try:
        with open(filepath, 'r') as f:
            content = f.read()

        new_content = content.replace("triage_signal_logo.png", "rakshak_ai_logo.png")
        new_content = new_content.replace("Triage Signal", "Rakshak AI")
        new_content = new_content.replace("triage signal", "Rakshak AI")

        if content != new_content:
            with open(filepath, 'w') as f:
                f.write(new_content)
            print(f"Updated: {filepath}")
    except Exception as e:
        print(f"Error processing {filepath}: {e}")

# Include agents.md files, README, layout and all tsx files
files_to_process = glob.glob("**/*.tsx", recursive=True) + glob.glob("**/*.ts", recursive=True) + glob.glob("**/*.md", recursive=True)
files_to_process.append("../agents.md")

# don't process node_modules or google-cloud-sdk
for fp in files_to_process:
    if "node_modules" not in fp and "google-cloud-sdk" not in fp:
        process_file(fp)

print("Done")
