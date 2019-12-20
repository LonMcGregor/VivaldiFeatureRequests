// load all of the elements
// get all of the tags
// make a cloud of tags
// show all requests
// when a tag is selected filter just those requests, and "gray out" any tags that no longer occur

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
    }

    disconnectedCallback() {
        this.andInput.removeEventListener("input", this.filterUpdated);
        this.orInput.removeEventListener("input", this.filterUpdated);
        this.text.removeEventListener("input", this.filterTextChanged);
    }
}

class FilterableElement extends HTMLElement {
    constructor(filterText) {
        super();
        this.filterText = filterText;
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
        super(name);

        this.name = name;
        this.count = count;

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
}

class FeatureRequest extends FilterableElement {
    constructor(id, title, author, date, score, tags, posts, views) {
        super(title);

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

customElements.define("tag-item", TagItem);
customElements.define("feature-request", FeatureRequest);
customElements.define("filter-form", FilterForm);


function setURLParams(){
    const tagText = encodeURIComponent(document.querySelector("#tagFilter").filterText);
    const reqText = encodeURIComponent(document.querySelector("#requestFilter").filterText);
    const activeTags = getEnabledTags().join("+");
    window.location = `#tag=${tagText}&req=${reqText}&tagsEnabled=${activeTags}`;
}

const initialTagMatch = window.location.hash.match(/tag=([^&]+)/);
const initialTagFilter = initialTagMatch ? decodeURIComponent(initialTagMatch[1]) : undefined;
const initialRequestMatch = window.location.hash.match(/req=([^&]+)/);
const initialRequestFilter = initialRequestMatch ? decodeURIComponent(initialRequestMatch[1]) : undefined;
const initialTagsEnabledMatch = window.location.hash.match(/tagsEnabled=([^&]+)/);
const initialTagsEnabled = initialTagsEnabledMatch ? initialTagsEnabledMatch[1].split("+") : [];

// maybe a new tag should be created automatically when a feature request that contains one is created
// then again, maybe that's not how this is supposed to work
TAGS.forEach(tag => {
    const tagtag = new TagItem(tag[0], tag[1]);
    tagtag.setSelected(initialTagsEnabled.indexOf(tag[0]) >= 0);
    document.querySelector("nav").appendChild(tagtag);
});

DATA.forEach(item => {
    const fr = new FeatureRequest(item[0], item[1], item[2], item[3], item[4], item[5], item[6], item[7]);
    document.querySelector("main").appendChild(fr);
});

document.querySelector("#reqCount").innerText = DATA.length;
document.querySelector("#tagCount").innerText = TAGS.length;

function getEnabledTags(){
    let enabledTags = Array.from(document.querySelectorAll("tag-item"));
    enabledTags = enabledTags.filter(tag => tag.selected);
    return enabledTags.map(tag => tag.name);
}

function onTagToggled(){
    setURLParams();
    onRequestFilterUpdate({target:document.querySelector("#requestFilter")});
}

function onRequestFilterUpdate(filterEvent){
    let total = 0;
    const enabledTags = getEnabledTags();
    const searchText = filterEvent.target.filterTerms;
    const searchAllTerms = filterEvent.target.matchAll;
    Array.from(document.querySelectorAll("feature-request")).forEach(request => {
        request.visible = searchText.length > 0
            ? request.hasTags(enabledTags) && request.matches(searchText, searchAllTerms)
            : request.hasTags(enabledTags);
        total += request.visible ? 1 : 0;
    });
    document.querySelector("#reqCount").innerText = total;
    setURLParams();
}

function filterTags(filterEvent){
    let total = 0;
    const searchText = filterEvent.target.filterTerms;
    const searchAllTerms = filterEvent.target.matchAll;
    const tags = Array.from(document.querySelectorAll("tag-item"));
    tags.forEach(tag => {
        tag.visible = searchText.length > 0 ? tag.matches(searchText, searchAllTerms) : true;
        total += tag.visible ? 1 : 0;
    });
    document.querySelector("#tagCount").innerText = total;
    setURLParams();
}

document.addEventListener("TagToggled", onTagToggled);
document.querySelector("#requestFilter").addEventListener("FilterUpdated", onRequestFilterUpdate);
document.querySelector("#tagFilter").addEventListener("FilterUpdated", filterTags);

if(initialTagFilter){
    document.querySelector("#tagFilter").filterText = initialTagFilter;
    document.querySelector("#tagFilter").filterUpdated();
}
if(initialRequestFilter){
    document.querySelector("#requestFilter").filterText = initialRequestFilter;
    document.querySelector("#requestFilter").filterUpdated();
}

/**
 * add the tags - all disabled by default
 * populate the topics - all hidden by default
 *
 * have "(de-)select all tags" buttons which show or hide all tags
 *
 * when activating a single tag
 *  for all of the topics
 *      if they have that tag, show it
 * when deactivating a tag
 *  for all the topics
 *      if they have that tag, hide it
 *
 *
 *
 * filter text in title
 *  on text type
 *      for each topic
 *          show if match title and match tags else hide
 *
 * sort by date, votes
 */


/** if we don't care about efficiency
 *
 * add the tags - all disabled by default
 * populate the topics - all hidden by default
 *
 * on tag toggle or filter text change
 *     for each topic
 *         check enabled tags match (OR, so as long as one matches)
 *         check filter text match in tags or title
 *         show if all match else hide
 *
 * on sort change
 *     for each topic
 *         use either title, date or score as order style
 */

/**
 * what are tags for?
 *    you search for things that have ALL of the tags, or SOME of the tags
 *    anything else is excluded
 *
 */
