class FilterForm extends HTMLElement {
    constructor(){
        super();

        this.FILTER_DELAY_MS = 250;
        this.lastTypeEvent = undefined;

        const shadow = this.attachShadow({mode: "open"});

        const text = document.createElement("input");
        text.type = "search";
        shadow.appendChild(text);
        this.text = text;

        const and = document.createElement("label");
        and.innerHTML = `
        <input type="radio" name="searchType" value="AND" checked="">
        AND
        `;
        shadow.appendChild(and);
        this.andInput = and.querySelector("input");

        const or = document.createElement("label");
        or.innerHTML = `
        <input type="radio" name="searchType" value="OR">
        OR
        `;
        shadow.appendChild(or);
        this.orInput = or.querySelector("input");

        const count = document.createElement("input")
        count.type = "number";
        count.min = 0;
        count.value = 0;
        this.count = count;
        shadow.appendChild(count);

        const shadowStyle = document.createElement("style");
        shadowStyle.textContent = `
            span {
                text-transform: lowercase;
                margin: 2px;
            }
        `;
        shadow.appendChild(shadowStyle);
    }

    get filterTerms(){
        let searchText = this.text.value;
        searchText = searchText.split(" ");
        searchText = searchText.map(term => term.trim());
        searchText = searchText.filter(term => term !== "");
        return searchText;
    }

    get filterCount(){
        return this.count.value;
    }

    set filterCount(newcount){
        this.count.value = newcount;
    }

    get filterText(){
        return this.text.value;
    }

    set filterText(newtext){
        this.text.value = newtext;
    }

    get matchAll(){
        return this.andInput.checked;
    }

    set matchAll(newmatchall){
        this.andInput.checked = newmatchall;
        this.orInput.checked = !newmatchall;
    }

    filterUpdated() {
        this.dispatchEvent(new CustomEvent("FilterUpdated", {bubbles: true}));
    }

    filterTextChanged() {
        this.lastTypeEvent = new Date();
        setTimeout(() => {
            const diff = new Date() - this.lastTypeEvent;
            if(diff >= this.FILTER_DELAY_MS){
                this.filterUpdated();
            }
        }, this.FILTER_DELAY_MS);
    }

    connectedCallback() {
        this.andInput.addEventListener("input", this.filterUpdated.bind(this));
        this.orInput.addEventListener("input", this.filterUpdated.bind(this));
        this.text.addEventListener("input", this.filterTextChanged.bind(this));
        this.count.addEventListener("input", this.filterTextChanged.bind(this));
    }

    disconnectedCallback() {
        this.andInput.removeEventListener("input", this.filterUpdated);
        this.orInput.removeEventListener("input", this.filterUpdated);
        this.text.removeEventListener("input", this.filterTextChanged);
        this.count.removeEventListener("input", this.filterTextChanged);
    }
}
customElements.define("filter-form", FilterForm);

class FilterableElement extends HTMLElement {
    constructor(filterText, count) {
        super();
        this.filterText = filterText;
        this.count = count;
        this.visible = true;
    }

    match(term){
        let cleanedTerm = term.trim().toLowerCase();
        cleanedTerm = cleanedTerm.substr(cleanedTerm.length-1)==="s" ? cleanedTerm.substr(0, cleanedTerm.length-1) : cleanedTerm;
        return this.filterText.toLowerCase().indexOf(cleanedTerm) > -1;
    }

    matches(terms, matchAll){
        let x = terms.map(term => this.match(term));
        x = x.reduce((prev, current) => matchAll ? (prev && current) : (prev || current), matchAll);
        return x;
    }

    get visible(){
        return !this.hasAttribute("hidden");
    }

    set visible(newvisible){
        newvisible ? this.removeAttribute("hidden") : this.setAttribute("hidden", true);
    }
}

class TagItem extends FilterableElement {
    constructor(name, count) {
        super(name, count);

        this.name = name;

        const shadow = this.attachShadow({mode: "open"});

        const span = document.createElement("span");
        span.innerText = name;

        const cpsan = document.createElement("span");
        cpsan.innerText = count;

        this.selected = true;

        this.style.order = "-" + this.count;

        shadow.appendChild(span);
        shadow.appendChild(cpsan);

        const shadowStyle = document.createElement("style");
        shadowStyle.textContent = `
            span {
                text-transform: lowercase;
                margin: 2px;
            }
        `;
        shadow.appendChild(shadowStyle);
    }

    setSelected(bool){
        bool ? this.removeAttribute("unselected") : this.setAttribute("unselected", true);
        this.selected = !this.hasAttribute("unselected");
    }

    toggleSelection(){
        this.setSelected(!this.selected);
        this.dispatchEvent(new CustomEvent("TagToggled", {bubbles: true}));
    }

    connectedCallback() {
        this.addEventListener("click", this.toggleSelection);
    }

    disconnectedCallback() {
        this.removeEventListener("click", this.toggleSelection);
    }

    static getEnabledTags(){
        let enabledTags = Array.from(document.querySelectorAll("tag-item"));
        enabledTags = enabledTags.filter(tag => tag.selected);
        return enabledTags.map(tag => tag.name);
    }
}
customElements.define("tag-item", TagItem);

class FeatureRequest extends FilterableElement {
    constructor(id, title, author, date, score, tags, posts, views) {
        super(title, score);

        this.id = id;
        this.titleText = title;
        this.author = author;
        this.date = date;
        this.score = score;
        this.tags = tags;
        this.posts = posts;
        this.views = views;

        const shadow = this.attachShadow({mode: "open"});

        const titletag = document.createElement("a");
        titletag.innerText = title;
        titletag.target = "_blank";
        titletag.href = "https://forum.vivaldi.net/topic/" + this.id;
        titletag.rel = "noreferrer";
        const scoretag = document.createElement("strong");
        scoretag.innerText = score;
        scoretag.title = score + " votes";
        const viewcount = document.createElement("i");
        viewcount.innerText = views + "v";
        viewcount.title = views + " views";
        const postcount = document.createElement("i");
        postcount.innerText = posts + "r";
        postcount.title = posts + " replies";
        const taglist = document.createElement("div");
        this.tags.forEach(tag => {
            const tagspan = document.createElement("span");
            tagspan.innerText = tag;
            taglist.appendChild(tagspan);
        });

        this.style.order = "-" + this.score;

        const shadowStyle = document.createElement("style");
        shadowStyle.textContent = `
            a {
                font-size: large;
                margin: 4px;
            }

            div {
                padding: 4px;
                margin: 2px;
            }
            i {
                display: inline-block;
                margin-left: 4px;
            }
            div > span {
                text-transform: lowercase;
                border: 1px solid #eeeeee;
                border-radius: 3px;
                margin: 4px;
                padding: 2px;
            }

            @media (prefers-color-scheme: dark) {
                a, a:link {
                    color: lightskyblue;
                }
                a:visited {
                    color: plum;
                }
                div > span {
                    border: 1px solid #222222;
                }
            }
        `;

        shadow.appendChild(scoretag);
        shadow.appendChild(titletag);
        shadow.appendChild(viewcount);
        shadow.appendChild(postcount);
        shadow.appendChild(taglist);
        shadow.appendChild(shadowStyle);
    }

    hasTag(name){
        return this.tags.indexOf(name) > -1;
    }

    hasTags(names){
        let x = names.map(tag => this.hasTag(tag));
        x = x.reduce((prev, current) => prev && current, true);
        return x;
    }
}
customElements.define("feature-request", FeatureRequest);

class FilterableSet extends HTMLElement{
    constructor(dataset, title, defaultopen, elementGeneratorFn){
        super();
        this.dataArray = dataset;
        this.dataObjectArray = [];
        this.counterElement = document.createElement("span");
        this.counterElement.innerText = this.dataArray.length;

        const details = document.createElement("details");
        details.open = defaultopen;
        const summary = document.createElement("summary");
        const titleEl = document.createElement("h2");
        titleEl.appendChild(document.createTextNode(title + ": ("));
        titleEl.appendChild(this.counterElement);
        titleEl.appendChild(document.createTextNode(")"));
        summary.appendChild(titleEl);
        details.appendChild(summary);

        this.filterForm = document.createElement("filter-form");
        this.filterForm.addEventListener("FilterUpdated", this.filter.bind(this));
        details.appendChild(this.filterForm);

        const div = document.createElement("div");
        this.dataArray.forEach(element => {
            const newel = elementGeneratorFn(element);
            div.appendChild(newel);
            this.dataObjectArray.push(newel);
        });
        details.appendChild(div);

        this.appendChild(details);
    }

    filter(filterEvent){
        if(!filterEvent){
            filterEvent = {target:this.filterForm};
        }
        let total = 0;
        const count = filterEvent.target.filterCount;
        const enabledTags = TagItem.getEnabledTags();
        const searchText = filterEvent.target.filterTerms;
        const searchAllTerms = filterEvent.target.matchAll;
        this.dataObjectArray.forEach(element => {
            let filtered = element.count >= count
              && ((element.hasTags && element.hasTags(enabledTags)) || !element.hasTags)
              && ((searchText.length > 0 && element.matches(searchText, searchAllTerms)) || searchText.length === 0);
            element.visible = filtered;
            total += filtered ? 1 : 0;
        });
        this.counterElement.innerText = total;
        setURLParams();
    }
}
customElements.define("filterable-set", FilterableSet);

function setURLParams(){
    const tagText = encodeURIComponent(TAGSET.filterForm.filterText);
    const reqText = encodeURIComponent(FRQSET.filterForm.filterText);
    const activeTags = TagItem.getEnabledTags().join("+");
    const minScore = FRQSET.filterForm.filterCount;
    window.location = `#tag=${tagText}&req=${reqText}&minscore=${minScore}&tagsEnabled=${activeTags}`;
}

const initialTagMatch = window.location.hash.match(/tag=([^&]+)/);
const initialTagFilter = initialTagMatch ? decodeURIComponent(initialTagMatch[1]) : undefined;
const initialRequestMatch = window.location.hash.match(/req=([^&]+)/);
const initialRequestFilter = initialRequestMatch ? decodeURIComponent(initialRequestMatch[1]) : undefined;
const initialTagsEnabledMatch = window.location.hash.match(/tagsEnabled=([^&]+)/);
const initialTagsEnabled = initialTagsEnabledMatch ? initialTagsEnabledMatch[1].split("+") : [];
const initialCountMatch = window.location.hash.match(/minscore=(\d+)/);
const initialCountFilter = initialCountMatch ? initialCountMatch[1] : 0;

TAGSET = new FilterableSet(TAGS, "Tags", false, tag => {
    const tagtag = new TagItem(tag[0], tag[1]);
    tagtag.setSelected(initialTagsEnabled.indexOf(tag[0]) >= 0);
    return tagtag;
});
TAGSET.id = "tags";
FRQSET = new FilterableSet(DATA, "Feature Requests", true, item => {
    return new FeatureRequest(item[0], item[1], item[2], item[3], item[4], item[5], item[6], item[7]);
})
FRQSET.id = "reqs";
document.body.insertAdjacentElement("afterbegin", FRQSET);
document.body.insertAdjacentElement("afterbegin", TAGSET);

document.addEventListener("TagToggled", () => {
    setURLParams();
    FRQSET.filter();
});

if(initialTagFilter){
    TAGSET.filterForm.filterText = initialTagFilter;
}
if(initialRequestFilter){
    FRQSET.filterForm.filterText = initialRequestFilter;
}
FRQSET.filterForm.filterCount = initialCountFilter;
FRQSET.filter();
