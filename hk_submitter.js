
// browser control
// controls a headless browser -> browser that is by default not visible 
// npm i puppeteer
const puppeteer = require("puppeteer");
// nearly every function of puppeteer returns a promise
const credObj = require("./cred");
const fs = require("fs");

// let inputArr=process.argv.slice(2);
// let topic=inputArr[0];
// let qName=inputArr[1];
// let codeFileName=inputArr[2];


(async ()=> {
    // ***************************************Login********************************************
    const browserRepresentativeObj = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ["--start-maximized", "--start-in-incognito"],
        slowMo:20
    });
    //new  tab open  
    const tab = await browserRepresentativeObj.newPage();
    // // Login to Hackerank system usign our credential 
    await loginToHK(tab);
    //    promises compose 
    // choose the topic from the given user topic input 
    await waitAndClickTopic("Java", tab);

    // select question from the pool of question according to user input
    await waitAndClickQuestion("Java Stdin and Stdout I", tab)
    // write the code ->  -> code read type 
    // code -> input 
    // read -> pupptee pass
    let code = await fs.promises.readFile("code.java", "utf-8");
    // console.log(code);
    await copyPasteQuestion(code, tab);
    // // submit the code 
    await submitCode(tab);

})();
// keyboard ,mouse ,scroll

async function loginToHK(tab){
    await tab.goto(credObj.url);
    await tab.type("input[type='text']",credObj.mail, { delay: 20 });
    await tab.type("input[type='password']",credObj.password, { delay: 20 });
    await tab.keyboard.press("Enter");
}

async function waitAndClickTopic(name, tab) {
    await tab.waitForSelector(".topics-list", { visible: true });
    // let elems = await tab.$$(".topics-list .topic-card a"); -> document.querySelectorAll
    // let elems = await tab.$(".topics-list .topic-card a"); 
    // console.log(elems.length);
    await tab.evaluate(findAndClick, name);
    // console.log(idx);
    function findAndClick(name) {
        let alltopics = document.querySelectorAll(".topics-list .topic-card a");
        // return idx
        let idx;
        for (idx = 0; idx < alltopics.length; idx++) {
            let cTopic = alltopics[idx].textContent.trim();
            console.log(cTopic);
            if (cTopic == name) {
                break;
            }
        }
        //document  -> elem 
        alltopics[idx].click();
        // return idx;
    }


}

async function waitAndClickQuestion(name, tab) {
    await tab.waitForSelector(".challenges-list", { visible: true });
    // let elems = await tab.$$(".topics-list .topic-card a"); -> document.querySelectorAll
    // text get match and click
    // let elems = await tab.$(".topics-list .topic-card a"); 
    // console.log(elems.length);
    let questions = await tab.evaluate(findAndClick, name);
    console.log(questions);
    // console.log(idx);
    function findAndClick(name) {
        let allQuestions = document.querySelectorAll(".challenges-list .challengecard-title");
        // return idx
        let idx;
        let textContent = []
        for (idx = 0; idx < allQuestions.length; idx++) {
            let cTopic = allQuestions[idx].textContent.trim();
            textContent.push(cTopic);
            // console.log(cTopic);
            if (cTopic.includes(name.trim())) {
                break;
            }
        }
        //document  -> elem 
        // alltopics[idx].click();
        // return textContent;
        allQuestions[idx].click();
    }
}

async function copyPasteQuestion(code,tab){
    await tab.waitForSelector(".label-wrap",{visible:true});
    await tab.goBack();
    await tab.click("input[type='checkbox']");
    await tab.waitForSelector("textarea[id='input-1']",{visible:true});

    // ************** type your code in the text area ********************
    await tab.keyboard.type(code);
    await tab.keyboard.down('ControlLeft')
    await tab.keyboard.press('KeyA')
    await tab.keyboard.press('KeyX');
    await tab.keyboard.up('ControlLeft')
    await tab.click(".monaco-editor.no-user-select.vs");
    await tab.keyboard.down('ControlLeft')
    await tab.keyboard.press('KeyA')
    await tab.keyboard.press('KeyV');
    await tab.keyboard.up('ControlLeft')
}

async function submitCode(tab){
    await tab.waitForSelector(".hr-monaco-submit");
    await tab.click(".hr-monaco-submit");
}
