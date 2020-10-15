
# read from file
# strip the first line
# remove any "quotes"
# change , into ","
# write to file

ALL_DATA = []
TAGS = {}
DATA_FILES = [
    ["category_185_desktop.csv", ["DESKTOP"]],
    ["category_127_address-bar.csv", ["DESKTOP", "ADDRESS BAR"]],
    ["category_128_bookmarks.csv", ["DESKTOP", "BOOKMARKS"]],
    ["category_129_panels.csv", ["DESKTOP", "PANELS"]],
    ["category_130_settings.csv", ["DESKTOP", "SETTINGS"]],
    ["category_131_tabs.csv", ["DESKTOP", "TABS"]],
    ["category_132_themes.csv", ["DESKTOP", "THEMES"]],
    ["category_136_mobile.csv", ["MOBILE"]]
]

def readAFile(filename, base_tags):
    with open(filename, "r", encoding="utf-8") as datafile:
        datafile.readline() # ditch the first line
        line = ""
        for line in datafile:
            csv = line.strip()
            csv = csv.replace("\"", "'")
            items = csv.split(",")
            title = items[1]
            author = items[2]
            date = items[3]
            votes = items[4]
            postcount = items[6]
            viewcount = items[7]
            topicId = items[0]
            tags = items[5].split(":")
            try:
                tags.remove("")
            except ValueError:
                pass # we don't care if the tag wasn't present
            for base_tag in base_tags:
                if base_tag != "" and base_tag not in tags:
                    tags.append(base_tag)
            for tag in tags:
                if tag in TAGS:
                    TAGS[tag] += 1
                else:
                    TAGS[tag] = 1
            tagsList = '","'.join(tags)
            topic = '[%s,"%s","%s","%s",%s,%s,%s,%s]' % (topicId, title, author, date, votes, tags, postcount, viewcount)
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
