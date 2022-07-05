import textdistance as td
from multiprocessing import Pool

data = []
with open("127.csv", "r", encoding="utf8") as csv:
    for line in csv:
        ID,Title,Author,Date,Votes,Tags,Posts,Views = line.split(",")
        data.append(Title)


def do_a_check(title):
    result = []
    for other in data:
        result.append((other, td.damerau_levenshtein.similarity(title, other)))
    return title, sorted(result, key=lambda a: -a[1])

def main():
    pool = Pool()
    matches = pool.map(do_a_check, data)
    pool.close()
    pool.join()

    for match in matches:
        foundmatch = False
        for j in range(5):
            if match[1][j][1] > 20:
                foundmatch = True
                try:
                    print("  " + str(match[1][j][1])[0:5] + ": " + match[1][j][0])
                except UnicodeEncodeError:
                    pass
        if foundmatch:
            try:
                print(match[0]+"\n\n")
            except UnicodeEncodeError:
                pass

if __name__ == '__main__':
    main()
