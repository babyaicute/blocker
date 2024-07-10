chrome.runtime.onInstalled.addListener(async () => {

    // when the extension is installed, default of activation state is false
    await chrome.storage.local.set({ "isActivated": false });

    // delete everything that exists
    const data = await chrome.declarativeNetRequest.getDynamicRules(); // array
    const ids = Array.from(data, x => x.id);
    await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: ids,
        addRules: [{
            "id": 1,
            "priority": 2,
            "action": { "type": "allow" },
            "condition": {
                "urlFilter": "*",
                "resourceTypes": ["main_frame"]
            }
        }]
    });

});

// just use updateSessionRules?

// changes icon