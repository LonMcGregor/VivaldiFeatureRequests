
# read from file
# strip the first line
# remove any "quotes"
# change , into ","
# write to file

ALL_DATA = []
TAGS = {
    "": 0
}
DATA_FILES = [
    ["category_113_feature-requests.csv", ""],
    ["category_127_address-bar.csv", "ADDRESS BAR"],
    ["category_128_bookmarks.csv", "BOOKMARKS"],
    ["category_129_panels.csv", "PANELS"],
    ["category_130_settings.csv", "SETTINGS"],
    ["category_131_tabs.csv", "TABS"],
    ["category_132_themes.csv", "THEMES"],
    ["category_136_mobile.csv", "MOBILE"]
]

def readAFile(filename, base_tag):
    with open(filename, "r", encoding="utf-8") as datafile:
        datafile.readline() # ditch the first line
        line = ""
        for line in datafile:
            csv = line.strip()
            csv = csv.replace("\"", "'")
            items = csv.split(",")
            tags = items[5].split(":")
            for tag in tags:
                if tag in TAGS:
                    TAGS[tag] += 1
                else:
                    TAGS[tag] = 1
            if base_tag != "" and base_tag not in tags:
                tags.append(base_tag)
            topic = '["' + '","'.join(items[0:5]) + '",' + '["' + '","'.join(tags) + '"]]'
            ALL_DATA.append(topic)

for file in DATA_FILES:
    readAFile(file[0], file[1])

with open("data.js", "w", encoding="utf-8") as datafile:
    datafile.write("const DATA = [\n")
    for item in ALL_DATA:
        datafile.write(item + ",\n")
    datafile.write("];\n")
    datafile.write('const TAGS = [')
    for tag, count in TAGS.items():
        datafile.write('["' + tag + '", ' + str(count) + '],\n')
    datafile.write('];\n')
