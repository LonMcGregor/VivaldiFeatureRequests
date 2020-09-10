javascript:(function csv(){
    "use strict";
    const data = ["ID,Title,Author,Date,Votes,Tags,Posts,Views"];
    function csvOnePage(){
        const topics = document.querySelectorAll(".topic-list li:not(.deleted):not(.locked)");
        Array.from(topics).forEach(topic => {
            const title = topic.querySelector(".title a").innerText.replace(/,/g, " ");
            const tags = Array.from(topic.querySelectorAll(".tag"));
            const author = topic.querySelector(".avatar .avatar").getAttribute("data-original-title");
            const date = topic.querySelector(".timeago").getAttribute("datetime");
            const votes = topic.querySelector(".stats-votes > span").title;
            const postcount = topic.querySelector(".stats-postcount > span").title;
            const viewcount = topic.querySelector(".stats-viewcount > span").title;
            const topicId = topic.getAttribute("data-tid");
            const tagText = tags.reduce((prev, curr, index, arr) => prev + curr.innerText + ((index + 1 === arr.length) ? "" : ":"), "");
            const topicCsv = `${topicId},${title},${author},${date},${votes},${tagText},${postcount},${viewcount}`;
            data.push(topicCsv);
        });
    }

    function doAllPages(){
        csvOnePage();
        if(!document.querySelector(".next").classList.contains("disabled")){
            document.querySelector(".next a").click();
            setTimeout(doAllPages, 3000);
        } else {
            /* http://stackoverflow.com/questions/31048215/ddg#31048350 */
            /* http://stackoverflow.com/questions/19327749/ddg#19328891 */
            const datafile = new Blob([data.join("\n")+"\n"], {type: "text/plain"});
            const datafileurl = window.URL.createObjectURL(datafile);
            const a = document.createElement("a");
            document.body.appendChild(a);
            a.style = "display: none";
            a.href = datafileurl;
            let filename = window.location.pathname.replace("/", "_")+".csv";
            filename = filename.substr(1);
            a.download = filename;
            a.click();
        }
    }

    doAllPages();

})();
