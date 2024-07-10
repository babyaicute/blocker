export function getTextOnOff(b) {
    if (b) {
        return "ON";
    } else {
        return "OFF";
    }
}

export function getTextOnOffColor(b) {
    if (b) {
        return "green";
    } else {
        return "red";
    }
}

export async function changeIcon(currentOnOff) {
    if (currentOnOff) {
        await chrome.action.setIcon({
            "path": {
                "16": "./images/icon-active-16.png",
                "32": "./images/icon-active-32.png",
                "48": "./images/icon-active-48.png",
                "128": "./images/icon-active-128.png"
            }
        });
    } else {
        await chrome.action.setIcon({
            "path": {
                "16": "images/icon-16.png",
                "32": "images/icon-32.png",
                "48": "images/icon-48.png",
                "128": "images/icon-128.png"
            }
        });
    }
}