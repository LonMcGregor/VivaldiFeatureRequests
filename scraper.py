import functools, re, requests, time

def cat(category_id, pageno=None):
    if pageno is None:
        url = "https://forum.vivaldi.net/api/category/%d" % category_id
    else:
        url = "https://forum.vivaldi.net/api/category/%d?page=%d" % (category_id, pageno)
    headers = {'User-Agent': 'LonMs Feature Request Cataloguer v2.0'}
    result = requests.get(url, headers=headers)
    if result.status_code == 200:
        return result.json()
    else:
        print("Error! Response code %d" % result.status_code)
        raise "Failed to query server: %d" % result.status_code

categories = [185, 194, 136, 131, 186]

def do_a_category(category):
    print("Start getting category %s" % str(category))
    all_frs = []
    pagemax = cat(category)['pagination']['pageCount']
    for pageno in range(pagemax):
        time.sleep(1)
        print("┣╸Get page %d/%d for category %d" % (pageno, pagemax-1, category))
        all_frs.extend(cat(category, pageno)['topics'])
    print("┣╸Sort category %d" % category)
    all_frs = sorted(all_frs, key=lambda a: -a['upvotes'])
    print("┗╸Write category %d to file" % category)
    with open(str(category)+".csv", "w", encoding="utf-8") as csvfile:
        csvfile.write("ID,Title,Author,Date,Votes,Tags,Posts,Views\n")
        for request in all_frs:
            tagText = functools.reduce(lambda a, b: a + b['valueEscaped'] + ":", request['tags'], "").strip(":").upper()
            csvfile.write("%s,%s,%s,%s,%s,%s,%s,%s\n" % (
                request['tid'],
                request['titleRaw'].replace(",", " "),
                request['user']['username'],
                request['timestampISO'],
                request['upvotes'],
                tagText,
                request['postcount'],
                request['viewcount']
            ))

def scrape_all_frs():
    print("Scraping Feature requests")
    for category in categories:
        try:
            do_a_category(category)
        except:
            print("Failed to complete category %d. Backing off and trying once more" % category)
            time.sleep(20)
            try:
                do_a_category(category)
            except:
                print("Failed to complete category %d. Giving up.")


scrape_all_frs()

def update_index():
    print("Updating index timestamp")
    with open("index.html", "r") as indexfile:
        all = indexfile.read()

    with open("index.html", "w") as indexfile:
        now = time.asctime()
        all = re.sub("<time>.+</time>", "<time>%s</time>" % now, all)
        indexfile.write(all)

print("Converting into JS-accessible data")
import beautifier

update_index()
