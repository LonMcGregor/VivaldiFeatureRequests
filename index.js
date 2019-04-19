// load all of the elements
// get all of the tags
// make a cloud of tags
// show all requests
// when a tag is selected filter just those requests, and "gray out" any tags that no longer occur

class TagToggledEvent extends Event {

}

class TagItem extends HTMLElement {
    constructor(tagText) {
        super();

        const shadow = this.attachShadow({mode: 'open'});

        const span = document.createElement("span");
        span.innerText = tagText;

        shadow.appendChild(span);
    }

    toggleSelection(){
        this.toggleAttribute("selected");
        new TagToggledEvent();
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

        const shadow = this.attachShadow({mode: 'open'});

        const span = document.createElement("span");
        span.innerText = title;

        shadow.appendChild(span);
    }
}

customElements.define('tag-item', TagItem);
customElements.define('feature-request', FeatureRequest);


// maybe a new tag should be created automatically when a feature request that contains one is created
TAGS.forEach(tag => document.querySelector("nav").appendChild(new TagItem(tag)));

DATA.forEach(item => document.querySelector("main").appendChild(new FeatureRequest(item[0], item[1], item[2], item[3], item[4])));
