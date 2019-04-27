// load all of the elements
// get all of the tags
// make a cloud of tags
// show all requests
// when a tag is selected filter just those requests, and "gray out" any tags that no longer occur

class TagItem extends HTMLElement {
    constructor(name, count) {
        super();

        this.name = name;
        this.count = count;

        const shadow = this.attachShadow({mode: 'open'});

        const span = document.createElement("span");
        span.innerText = name;

        const cpsan = document.createElement("span");
        cpsan.innerText = count;

        this.selected = true;

        this.style.order = this.count;

        shadow.appendChild(span);
        shadow.appendChild(cpsan);
    }

    setSelected(bool){
        bool ? this.removeAttribute("unselected") : this.setAttribute("unselected", true);
        this.selected = !this.hasAttribute("unselected");
    }

    toggleSelection(){
        this.setSelected(!this.selected);
        this.dispatchEvent(new CustomEvent('TagToggled', {bubbles: true}));
    }

    connectedCallback() {
        this.addEventListener('click', this.toggleSelection);
    }

    disconnectedCallback() {
        this.removeEventListener('click', this.toggleSelection);
    }
}

class FeatureRequest extends HTMLElement {
    constructor(id, title, author, date, score, tags) {
        super();

        this.id = id;
        this.title = title;
        this.author = author;
        this.date = date;
        this.score = score;
        this.tags = tags;

        const shadow = this.attachShadow({mode: 'open'});

        const titletag = document.createElement("a");
        titletag.innerText = title;
        titletag.href = "https://forum.vivaldi.net/topic/" + this.id;
        const scoretag = document.createElement("span");
        scoretag.innerText = score;
        const taglist = document.createElement("div");
        this.tags.forEach(tag => {
            const tagspan = document.createElement("span");
            tagspan.innerText = tag;
            taglist.appendChild(tagspan);
        });

        this.visible = true;

        this.style.order = this.score;

        shadow.appendChild(scoretag);
        shadow.appendChild(titletag);
        shadow.appendChild(taglist);
    }

    titleMatch(term){
        let cleanedTerm = term.trim().toLowerCase();
        cleanedTerm = cleanedTerm.substr(cleanedTerm.length-1)==="s" ? cleanedTerm.substr(0, cleanedTerm.length-1) : cleanedTerm;
        return this.title.toLowerCase().indexOf(cleanedTerm) > -1;
    }

    titleMatches(terms, matchAll){
        let x = terms.map(term => this.titleMatch(term));
        x = x.reduce((prev, current) => matchAll ? (prev && current) : (prev || current), matchAll)
        return x;
    }

    hasTag(name){
        return this.tags.indexOf(name) > -1;
    }

    hasTags(names){
        let x = names.map(tag => this.hasTag(tag));
        x = x.reduce((prev, current) => prev && current, true)
        return x;
    }

    hide(){
        this.setAttribute("hidden", true);
        this.visible = false;
    }

    show(){
        this.removeAttribute("hidden");
        this.visible = true;
    }

}

customElements.define('tag-item', TagItem);
customElements.define('feature-request', FeatureRequest);


// maybe a new tag should be created automatically when a feature request that contains one is created
// then again, maybe that's not how this is supposed to work
TAGS.forEach(tag => {
    const tagtag = new TagItem(tag[0], tag[1]);
    tagtag.setSelected(false);
    document.querySelector("nav").appendChild(tagtag);
});

DATA.forEach(item => {
    const fr = new FeatureRequest(item[0], item[1], item[2], item[3], item[4], item[5]);
    fr.hide();
    document.querySelector("main").appendChild(fr);
});

function filter(){
    let enabledTags = Array.from(document.querySelectorAll("tag-item"));
    enabledTags = enabledTags.filter(tag => tag.selected);
    enabledTags = enabledTags.map(tag => tag.name);

    let searchText = document.querySelector("input[type='text']").value;
    searchText = searchText.split(" ");
    searchText = searchText.map(term => term.trim());
    searchText = searchText.filter(term => term !== "");

    const and = document.querySelector("input[value='AND']").checked;
    const searchAllTerms = and;

    Array.from(document.querySelectorAll("feature-request")).forEach(request => {
        let matched = searchText.length > 0
            ? request.hasTags(enabledTags) && request.titleMatches(searchText, searchAllTerms)
            : request.hasTags(enabledTags);
        matched ? request.show() : request.hide();
    });
}

document.addEventListener("TagToggled", filter);
document.querySelector("input[type='text']").addEventListener("input", filter);
document.querySelector("input[value='AND']").addEventListener("input", filter);
document.querySelector("input[value='OR']").addEventListener("input", filter);

filter();

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
