# ---------------------------------------------
# Scholar Timeline - Google Scholar Profile Page to JSON
# Copyright (c) 2025 Xovee Xu
# Author: Xovee Xu (xovee.xu@gmail.com)
# License: MIT
# ---------------------------------------------

from bs4 import BeautifulSoup
import json
import argparse


def extract_scholar_to_json(html_path, output_json_path):
    with open(html_path, "r", encoding="utf-8") as f:
        soup = BeautifulSoup(f.read(), "html.parser")

    papers = []

    # Each paper entry on Google Scholar is in a table row with class "gsc_a_tr"
    rows = soup.select(".gsc_a_tr")

    for row in rows:
        title_tag = row.select_one(".gsc_a_at")
        title = title_tag.text.strip() if title_tag else ""

        meta_tags = row.select(".gs_gray")
        authors = meta_tags[0].text.split(", ") if len(meta_tags) > 0 else []

        venue = ""
        year = ""
        if len(meta_tags) > 1:
            venue_year = meta_tags[1].text
            if "," in venue_year:
                venue, year = venue_year.rsplit(",", 1)
                venue = venue.strip()
                year = year.strip()
            else:
                venue = venue_year.strip()

        citation_tag = row.select_one(".gsc_a_c")
        citation = citation_tag.text.strip() if citation_tag else "0"
        if citation == "":
            citation = "0"

        if year.isdigit():
            date_value = f"{year}-01-01"
        else:
            date_value = ""

        papers.append({
            "title": title,
            "authors": authors,
            "venue": venue,
            "year": year,
            "citation": citation,
            "note": "",
            "date": date_value
        })

    with open(output_json_path, "w", encoding="utf-8") as f:
        json.dump(papers, f, indent=4, ensure_ascii=False)

    print(f"Saved {len(papers)} papers to: {output_json_path}")


def main():
    parser = argparse.ArgumentParser(description="Extract Google Scholar profile page to JSON format.")

    parser.add_argument("--html", type=str, default="data/google_scholar_profile_page.html", help="Path to the Google Scholar HTML file")
    parser.add_argument("--json", type=str, default="data/timeline_data.json", help="Path to the output JSON file")

    args = parser.parse_args()
    extract_scholar_to_json(args.html, args.json)


if __name__ == "__main__":
    main()
