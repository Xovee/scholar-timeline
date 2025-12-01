# ---------------------------------------------
# Scholar Timeline - Update Article Citations
# Copyright (c) 2025 Xovee Xu
# Author: Xovee Xu (xovee.xu@gmail.com)
# License: MIT
# ---------------------------------------------
from bs4 import BeautifulSoup
import pandas as pd
import unicodedata, re, json
from pathlib import Path
import argparse


def _norm_title(s: str) -> str:
    """Normalize titles for robust exact matching (no fuzzy): casefold, NFKC, collapse spaces."""
    s = unicodedata.normalize("NFKC", s).casefold()
    s = re.sub(r"\s+", " ", s).strip()
    return s


def html_to_csv(page_file):
    with open(page_file, 'r', encoding='utf-8') as f:
        html = f.read()

    soup = BeautifulSoup(html, 'html.parser')

    rows = []

    for tr in soup.select('tr.gsc_a_tr'):
        title_tag = tr.select_one('a.gsc_a_at')
        title = title_tag.get_text(strip=True) if title_tag else None

        cit_tag = tr.select_one('td.gsc_a_c a')
        if not cit_tag:
            cit_text = tr.select_one('td.gsc_a_c').get_text(strip=True) if tr.select_one('td.gsc_a_c') else ''
        else:
            cit_text = cit_tag.get_text(strip=True)

        if cit_text in ("—", "-", "") or cit_text is None:
            citations = 0
        else:
            try:
                citations = int(cit_text.replace(",", ""))
            except Exception:
                citations = 0

        if title:
            rows.append({'title': title, 'citations': citations})

        citations = pd.DataFrame(rows)

    return citations


def update_json_citations(json_path: str | Path, df: pd.DataFrame) -> list[str]:
    json_path = Path(json_path)

    work = df.copy()
    work = work[work['title'].astype(str).str.strip().ne("")]
    work['citations'] = pd.to_numeric(work['citations'], errors='coerce').fillna(0).astype(int)

    lookup = {}
    for _, row in work.iterrows():
        key = _norm_title(row['title'])
        c = int(row['citations'])
        if key in lookup:
            lookup[key] = max(lookup[key], c)
        else:
            lookup[key] = c

    data = json.loads(json_path.read_text(encoding='utf-8'))
    missing = []
    changes: list[tuple[str, str, str]] = []

    for entry in data:
        t = entry.get('title', '')
        old = str(entry.get('citation', '0'))
        key = _norm_title(t)

        if key in lookup:
            new = str(lookup[key])
            entry['citation'] = new
        else:
            new = old
            missing.append(t)

        if new != old:
            changes.append((t, old, new))

    json_path.write_text(json.dumps(data, ensure_ascii=False, indent=4), encoding='utf-8')

    i = 1
    if missing:
        print("Titles present in JSON but missing from Google Scholar:")
        for m in missing:
            print(f" {i}.", m)
            i += 1
    else:
        print("All JSON titles were matched and updated.")

    if changes:
        print("\nCitation changes:")

        sortable: list[tuple[int, int, int, str]] = []

        for title, old, new in changes:
            try:
                old_i = int(old)
                new_i = int(new)
                diff = new_i - old_i
            except ValueError:
                old_i, new_i, diff = 0, 0, 0
            sortable.append((diff, old_i, new_i, title))

        sortable.sort(key=lambda x: x[0], reverse=True)

        for diff, old_i, new_i, title in sortable:
            print(f"[{diff}, {old_i} -> {new_i}] {title}")
    else:
        print("\nNo citation changes.")

    return missing



def main(json_path="./data/timeline_data.json",
         page_path="./data/google_scholar_profile_page.html"):
    
    df = html_to_csv(page_path)
    missing = update_json_citations(json_path, df)

    return missing


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Update JSON citation counts from Google Scholar HTML page.")

    parser.add_argument("--html", type=str, default="./data/google_scholar_profile_page.html", help="Path to the Google Scholar HTML file.")
    parser.add_argument("--json", type=str, default="./data/timeline_data.json", help="Path to the JSON file to update.")

    args = parser.parse_args()
    main(json_path=args.json, page_path=args.html)
