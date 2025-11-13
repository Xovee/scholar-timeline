# Scholar Timeline

Scholar Timeline provides an intuitive, time-based view of a researcher’s publications, revealing citation trends and research impact through a clean chronological visualization.

## Demo

Scholar Timeline is interactive!

- **[Live Demo](https://xovee.github.io/scholar-timeline/)**
- **[Xovee's Scholar Timeline](https://www.xoveexu.com/stats#scholar-timeline)**


## Screenshot

![Scholar Timeline example screenshot](/asset/screenshot_xovee.png)

## Quick Start

1. Open your Google Scholar profile and save the complete page (with all papers displayed) as `data/google_scholar_profile_page.html`.
2. Run the Python script to convert the HTML to JSON:
   ```shell
   python ./scripts/scholar_page_to_json.py --html data/google_scholar_profile_page.html --json data/timeline_data.json
   ```
3. Copy `timeline.js` and `timeline_data.json` to your own website.
4. Add the HTML snippet shown in [Render the Scholar Timeline](https://github.com/Xovee/scholar-timeline?tab=readme-ov-file#render-the-scholar-timeline) to display your timeline.

## Requirements

Install python packages (bs4 and pandas):
```shell
pip install -r requirements.txt
```
Scholar Timeline uses [ECharts](https://echarts.apache.org/en/index.html) for visualization on the frond end.

## Usage

### Get Your Google Scholar Profile Page

Open your Google Scholar profile page, if you have more than 20 articles, scroll to the bottom and click "SHOW MORE", until all your articles are displayed on the page.

Save the page as `data/google_scholar_profile_page.html` (File -> Save As... -> "Web Page, Complete").

This repository only uses the locally saved HTML file; nothing is uploaded anywhere.

### Get Your Article Data (JSON)

Run `scripts/scholar_page_to_json.py`, obtain `data/timeline_data.json`.

```shell
python ./scripts/scholar_page_to_json.py --html data/google_scholar_profile_page.html --json data/timeline_data.json
```

#### Data format

```json
[
    {
        "title": "Scholar Timeline: An Approach to Visualize Your Publications",
        "authors": [
            "X Xu",
        ],
        "venue": "arXiv",
        "year": "2022",
        "citation": "66",
        "note": "",
        "date": "2022-02-22"
    },
    ...
]
```

>  Feel free to edit article details (especially the `date` field since in default they are all year-01-01) or add/delete articles here. Note: article titles should be identical between Google Scholar papers and json papers. But be cautious to run this code when you already have the `timeline_data.json` since it will override the existing.  

### Citation Update (Optional)

When you want to update the paper citations, you could run 
```shell
python ./scripts/update_citation.py --html data/google_scholar_profile_page.html --json data/timeline_data.json
```
>  Note: This code will only change the `citation` field for each paper in the JSON file. It would not add new papers or delete existing papers. 

### Render the Scholar Timeline

1. Copy `timeline.js` to your website
2. Copy your generated JSON `timeline_data.json` to your website
3. Add a container in your HTML where the chart should appear
```html
<div id="scholar-timeline-container" style="width: 100%; height: 600px;"></div>
```
4. Add the following scripts at the bottom of your HTML (before `<body>`)


```html
<script src="echarts.min.js"></script>
<!-- or you use CDN, e.g., https://cdn.jsdelivr.net/npm/echarts/dist/echarts.min.js -->

<script src="timeline.js"></script>

<script>
    fetch('/timeline_data.json')
    .then(function (r) {
        if (!r.ok) {
        throw new Error('Failed to load paper.json (' + r.status + ')');
        }
        return r.json();
    })
    .then(function (papers) {
        renderScholarTimeline('scholar-timeline-container', papers, {
        xMin: "2017-01-01",
        xMax: '2028-12-31',
        backgroundColor: '#eff6ee',
        markAreaData: [
            [
            {
                name: 'PhD Student',
                xAxis: '2021-09-01',
                itemStyle: { color: '#bbbbbb20' },
                label: {
                color: 'black',
                fontSize: 14
                },
                tooltip: {
                formatter: function () {
                    return '<b>PhD, Computer Science</b><br>UESTC, Chengdu, China<br>Sept 2021 - Dec 2025';
                }
                }
            },
            { xAxis: '2025-12-30' }
            ],
            [
            {
                name: 'Master',
                xAxis: '2018-09-01',
                itemStyle: { color: '#bbbbbb20' },
                label: {
                color: 'black',
                fontSize: 14
                },
                tooltip: {
                formatter: function () {
                    return '<b>Master, Software Engineering</b><br>UESTC, Chengdu, China<br>Sept 2018 - June 2021';
                }
                }
            },
            { xAxis: '2021-08-30' }
            ]
        ]
        });
    })
    .catch(function (err) {
        console.error('Scholar Timeline error:', err);
    });
</script>
```

> You can customize the chart by editing the options passed to `renderScholarTimeline` here or inside `timeline.js`. `markArea` is a convenient way to annotate career stages or time ranges (e.g., PhD, postdoc, industry). 


## LICENSE

MIT


## Contact

`xovee.xu at gmail.com`
