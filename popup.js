import { getTextOnOff, getTextOnOffColor, changeIcon } from "./utils.js";

// display flash message
async function genFlashMessage() {
    const message = document.getElementById("flashMessage");
    const isMessage = (await chrome.storage.local.get("isMessage"))?.isMessage;
    if (isMessage === true) {
        message.textContent = "     Success";
        message.style.color = "green";
    } else if (isMessage === false) {
        message.textContent = "     Error";
        message.style.color = "red";
    }
    await chrome.storage.local.remove("isMessage");
}
genFlashMessage();

// create <table> element and insert into DOM
async function genTable() {
    const table = document.getElementsByTagName("tbody")[0];

    // remove all rows of the table
    for (elem of Array.from(document.getElementsByClassName("blacklist"))) {
        elem.remove();
    }

    const data = await chrome.declarativeNetRequest.getDynamicRules(); // array
    for (let i = 0; i < data.length; i++) {

        // do not show the hidden rule that allows all URLs
        if (data[i].action.type === "allow" && data[i].condition.urlFilter === "*" && data[i].priority === 2) {
            continue;
        }

        // create delete "button" element
        const deleteButton = document.createElement("a");
        deleteButton.textContent = "Delete";
        deleteButton.href = "";
        deleteButton.onclick = () => { removeRow(data[i].id) };

        // create left td element
        const leftCell = document.createElement("td");
        leftCell.classList = "leftCol";
        leftCell.appendChild(deleteButton);

        // create right td element
        const rightCell = document.createElement("td");
        rightCell.classList = "rightCol";
        rightCell.textContent = data[i].condition.urlFilter;

        // create tr row element
        const row = document.createElement("tr");
        row.id = data[i].id;
        row.classList = "blacklist";
        row.appendChild(leftCell);
        row.appendChild(rightCell);

        table.appendChild(row);
    }
}
genTable();

// generate states of texts
async function genText() {
    const isActivated = (await chrome.storage.local.get("isActivated")).isActivated;

    const nextOnOffButton = document.getElementById("nextOnOff");
    nextOnOffButton.textContent = getTextOnOff(!isActivated);
    
    const currentOnOffText = document.getElementById("textOnOff");
    currentOnOffText.textContent = getTextOnOff(isActivated);
    currentOnOffText.style.color = getTextOnOffColor(isActivated);
}
genText();

// re-generate the "id"s in dynamic rules
async function reassignIndices() {
    // calculate the indices of Dynamic Rules
    const data = await chrome.declarativeNetRequest.getDynamicRules(); // array
    const ids = Array.from(data, x => x.id);
    for (let i = 0; i < data.length; i++) {
        data[i].id = i + 1
    }
    await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: ids,
        addRules: data
    });
}
reassignIndices();

// remove the whole row
async function removeRow(id) {
    const elem = document.getElementById(id);
    elem.remove();
    await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: [id]
    });
    location.reload();
}

// activate or deactivate the extension
const OnOffButton = document.getElementById("nextOnOff");
OnOffButton.addEventListener("click", async () => {
    const currentOnOff = (await chrome.storage.local.get("isActivated")).isActivated;
    const data = await chrome.declarativeNetRequest.getDynamicRules(); // array

    if (currentOnOff) {
        await chrome.declarativeNetRequest.updateDynamicRules({
            addRules: [{
                "id": data.length + 1,
                "priority": 2,
                "action": { "type": "allow" },
                "condition": {
                    "urlFilter": "*",
                    "resourceTypes": ["main_frame"]
                }
            }]
        });
    } else {
        const ids = Array.from(data.filter(x => x.priority === 2), x => x.id);
        await chrome.declarativeNetRequest.updateDynamicRules({
            removeRuleIds: ids
        });
    }
    await chrome.storage.local.set({ "isActivated": !currentOnOff });
    await changeIcon(!currentOnOff);
    location.reload();
});

// clicking the "block" button
const blockButton = document.getElementById("blockButton");
blockButton.addEventListener("click", async () => {
    const urlInput = document.getElementById("urlInput").value;

    const data = await chrome.declarativeNetRequest.getDynamicRules(); // array
    const blacklist = Array.from(data, x => x.condition.urlFilter);
    if (urlInput && !blacklist.includes(urlInput)) {
        await chrome.declarativeNetRequest.updateDynamicRules({
            removeRuleIds: [blacklist.length + 1],
            addRules: [{
                "id": blacklist.length + 1,
                "priority": 1,
                "action": { "type": "block" },
                "condition": {
                    "urlFilter": urlInput,
                    "resourceTypes": ["main_frame"]
                }
            }]
        });
        await chrome.storage.local.set({ "isMessage": true });
    } else {
        await chrome.storage.local.set({ "isMessage": false });
    }
    location.reload();
});