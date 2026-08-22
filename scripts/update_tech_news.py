import json
import os
import re
import sys
from datetime import datetime, timezone
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup

OUT_PATH = 'data/tech-news.json'
SOURCES = {
    'IEEE Spectrum': {
        'url': 'https://spectrum.ieee.org/',
        'host': 'spectrum.ieee.org',
        'icon': 'radio-tower',
    },
    'CNN Tech': {
        'url': 'https://edition.cnn.com/business/tech',
        'host': 'edition.cnn.com',
        'icon': 'cpu',
    },
}
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (compatible; HuynhCongPhucTechNews/1.0; +https://huynhcongphuc.github.io/news.html)',
    'Accept-Language': 'en-US,en;q=0.9',
}
TIMEOUT = 20


def clean_text(value):
    return re.sub(r'\s+', ' ', (value or '')).strip()


def absolute(base, href):
    if not href:
        return ''
    return urljoin(base, href.split('#', 1)[0])


def valid_candidate(source, url):
    try:
        p = urlparse(url)
    except Exception:
        return False
    if p.netloc != source['host']:
        return False
    path = p.path.rstrip('/')
    if not path or path in ('/business/tech',):
        return False
    low = path.lower()
    blocked = ('/about', '/contact', '/privacy', '/terms', '/newsletter', '/search', '/author/', '/topic/', '/tag/', '/type/', '/video')
    if any(x in low for x in blocked):
        return False
    if source['host'] == 'spectrum.ieee.org':
        # Spectrum article URLs are commonly top-level slugs; exclude magazine/category landing pages.
        if low.startswith('/magazine/') or low.startswith('/special-reports/'):
            return False
        return path.count('/') <= 2 and len(path) > 8
    # CNN article URLs generally include dated/content paths. Exclude obvious navigation pages.
    return len(path) > 14 and any(token in low for token in ('/tech/', '/business/', '/2026/', '/2025/'))


def discover_urls(name, source, limit=30):
    response = requests.get(source['url'], headers=HEADERS, timeout=TIMEOUT)
    response.raise_for_status()
    soup = BeautifulSoup(response.text, 'html.parser')
    urls = []
    seen = set()
    for a in soup.find_all('a', href=True):
        url = absolute(source['url'], a.get('href'))
        if not valid_candidate(source, url) or url in seen:
            continue
        text = clean_text(a.get_text(' ', strip=True))
        if len(text) < 12:
            continue
        seen.add(url)
        urls.append(url)
        if len(urls) >= limit:
            break
    return urls


def meta(soup, *names):
    for name in names:
        node = soup.find('meta', attrs={'property': name}) or soup.find('meta', attrs={'name': name})
        if node and node.get('content'):
            return clean_text(node['content'])
    return ''


def parse_date(value):
    if not value:
        return None
    value = value.strip()
    # ISO-8601 is used by both publishers in article metadata.
    try:
        return datetime.fromisoformat(value.replace('Z', '+00:00'))
    except Exception:
        pass
    m = re.search(r'(20\d{2})[-/](\d{1,2})[-/](\d{1,2})', value)
    if m:
        try:
            return datetime(int(m.group(1)), int(m.group(2)), int(m.group(3)), tzinfo=timezone.utc)
        except Exception:
            return None
    return None


def infer_tags(title, description):
    text = f'{title} {description}'.lower()
    tags = []
    if any(x in text for x in (' ai ', 'artificial intelligence', 'machine learning', 'chatgpt', 'model', 'robot')):
        tags.append('ai')
    if any(x in text for x in ('energy', 'battery', 'grid', 'power', 'electric', 'solar', 'wind', 'nuclear', 'fusion')):
        tags.append('energy')
    if any(x in text for x in ('cyber', 'security', 'chip', 'semiconductor', 'software', 'network', 'quantum', 'engineering', 'technology', 'tech')):
        tags.append('engineering')
    return tags or ['engineering']


def article_info(source_name, source, url):
    r = requests.get(url, headers=HEADERS, timeout=TIMEOUT)
    r.raise_for_status()
    soup = BeautifulSoup(r.text, 'html.parser')
    title = meta(soup, 'og:title', 'twitter:title')
    if not title and soup.title:
        title = clean_text(soup.title.get_text(' ', strip=True))
    description = meta(soup, 'og:description', 'description', 'twitter:description')
    image = meta(soup, 'og:image', 'twitter:image')
    published_raw = meta(soup, 'article:published_time', 'date', 'datePublished', 'pubdate')
    if not published_raw:
        time_node = soup.find('time')
        if time_node:
            published_raw = time_node.get('datetime') or clean_text(time_node.get_text(' ', strip=True))
    published_dt = parse_date(published_raw)
    if not title or len(title) < 10:
        return None
    # Avoid landing/index pages masquerading as articles.
    if title.lower() in ('cnn', 'ieee spectrum', 'technology news'):
        return None
    return {
        'title': title[:220],
        'summary': description[:420],
        'url': url,
        'image': image,
        'source': source_name,
        'source_url': source['url'],
        'published': published_dt.isoformat() if published_dt else '',
        'published_label': published_dt.strftime('%d/%m/%Y') if published_dt else '',
        'tags': infer_tags(title, description),
        'icon': source['icon'],
    }


def fetch_source(name, source, max_items=10):
    items = []
    seen_titles = set()
    try:
        urls = discover_urls(name, source, limit=35)
        for url in urls:
            try:
                item = article_info(name, source, url)
            except Exception as exc:
                print(f'[{name}] article failed: {url} :: {type(exc).__name__}: {exc}', file=sys.stderr)
                continue
            if not item:
                continue
            key = item['title'].lower()
            if key in seen_titles:
                continue
            seen_titles.add(key)
            items.append(item)
            if len(items) >= max_items:
                break
        # Prefer newest dated items, but preserve discovery order for undated articles.
        dated = [x for x in items if x['published']]
        undated = [x for x in items if not x['published']]
        dated.sort(key=lambda x: x['published'], reverse=True)
        items = dated + undated
        print(f'[{name}] collected {len(items)} articles')
        return items, len(items) >= 1
    except Exception as exc:
        print(f'[{name}] source failed: {type(exc).__name__}: {exc}', file=sys.stderr)
        return [], False


def load_previous():
    if not os.path.exists(OUT_PATH):
        return None
    try:
        with open(OUT_PATH, encoding='utf-8') as f:
            return json.load(f)
    except Exception:
        return None


def choose_items(spectrum, spectrum_ok, cnn, cnn_ok):
    # Normal state: exactly 5 from each publisher.
    if spectrum_ok and cnn_ok and len(spectrum) >= 5 and len(cnn) >= 5:
        return spectrum[:5] + cnn[:5], '5+5'
    # One publisher is unavailable: use up to 10 from the other one.
    if spectrum_ok and not cnn_ok:
        return spectrum[:10], '10 IEEE Spectrum (CNN unavailable)'
    if cnn_ok and not spectrum_ok:
        return cnn[:10], '10 CNN Tech (IEEE Spectrum unavailable)'
    # If both respond but one parser yields fewer than 5, fill the shortfall from the healthier source.
    if spectrum_ok and cnn_ok:
        left = spectrum[:5]
        right = cnn[:5]
        chosen = left + right
        if len(chosen) < 10:
            used = {x['url'] for x in chosen}
            extras = [x for x in spectrum[5:] + cnn[5:] if x['url'] not in used]
            chosen += extras[:10-len(chosen)]
        return chosen[:10], 'balanced with fallback fill'
    return [], 'both unavailable'


def main():
    spectrum, spectrum_ok = fetch_source('IEEE Spectrum', SOURCES['IEEE Spectrum'], 10)
    cnn, cnn_ok = fetch_source('CNN Tech', SOURCES['CNN Tech'], 10)
    items, mode = choose_items(spectrum, spectrum_ok, cnn, cnn_ok)
    previous = load_previous()
    if not items:
        if previous and previous.get('items'):
            print('Both sources unavailable; preserving previous data.')
            return
        raise RuntimeError('No technology news could be collected and no previous data exists.')
    # De-duplicate URLs globally while preserving publisher allocation/order.
    unique = []
    seen = set()
    for item in items:
        if item['url'] in seen:
            continue
        seen.add(item['url'])
        unique.append(item)
    payload = {
        'updated_at': datetime.now(timezone.utc).isoformat(),
        'mode': mode,
        'source_status': {
            'IEEE Spectrum': {'ok': spectrum_ok, 'available': len(spectrum), 'url': SOURCES['IEEE Spectrum']['url']},
            'CNN Tech': {'ok': cnn_ok, 'available': len(cnn), 'url': SOURCES['CNN Tech']['url']},
        },
        'items': unique[:10],
    }
    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
    with open(OUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)
    print(f'Published {len(payload["items"])} items; mode={mode}')


if __name__ == '__main__':
    main()
