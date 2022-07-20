const pup = require("puppeteer");
const username = "puppeteerproject";
const pass = "java@pep";

async function login(tab)
{
    await tab.waitForSelector("._2hvTZ.pexuQ.zyHYP", {visible: true});
    let inputs = await tab.$$("._2hvTZ.pexuQ.zyHYP");
    await inputs[0].type(username);
    await inputs[1].type(pass);
    await tab.click(".sqdOP.L3NKy.y3zKF");

    await tab.waitForNavigation({waitUntil : "networkidle2"});  // Skipped the Notification
    await tab.click(".sqdOP.yWX7d.y3zKF");                      //         ||
    await tab.waitForNavigation({waitUntil : "networkidle2"});  // Skipped the Notification
    await tab.click(".aOOlW.HoLwm");                            //         ||
}

async function gotoProfile(tab)
{
    await tab.waitForSelector(".Fifk5 ._2dbep.qNELH", {visible: true});
    await tab.click(".Fifk5 ._2dbep.qNELH");
    let options = await tab.$$(".-qQT3");
    await options[0].click();
}

async function getFollowers(tab)
{    
    await tab.waitForSelector(".-nal3", {visible: true});
    let buttons = await tab.$$(".-nal3");
    let followersButton = buttons[1];
    
    console.log("Followers");
    await followersButton.click();
    await tab.waitForSelector(".PZuss .FPmhX.notranslate._0imsa", {visible: true});
    let followers = await tab.$$eval(".PZuss .FPmhX.notranslate._0imsa",
        (elements)=> elements.map((foll)=>{
            let personObject = {};
            personObject["userName"] = foll.textContent;
            personObject["userUrl"] = foll["href"];
            return personObject;
        }));
    console.log(followers);
    return followers;
}

async function clickonCrossButton(tab)
{
    let crossButton = await tab.$(".wpO6b");
    await crossButton.click().catch("Not Clicked!");
}

async function getFollowings(tab)
{
    await tab.waitForSelector(".-nal3", {visible: true});
    buttons = await tab.$$(".-nal3");
    let followingsButton = buttons[2];

    console.log("Followings");
    await followingsButton.click();
    await tab.waitForSelector(".PZuss .FPmhX.notranslate._0imsa", {visible: true});
    let followings = await tab.$$eval(".PZuss .FPmhX.notranslate._0imsa",
        (elements)=> elements.map((foll)=>{
            let personObject = {};
            personObject["userName"] = foll.textContent;
            personObject["userUrl"] = foll["href"];
            return personObject;
        }));
    console.log(followings);
    return followings;
}

async function getUnfollowers(followings, followers)
{
    console.log("unFollowers");
    let unFollowers = [];
    for(let i in followings)
    {
        let person = followings[i].userName;
        let personlink = followings[i].userUrl;
        if(find(person, followers) == -1)
        {
            unFollowers.push(personlink);
        }
    }
    console.log(unFollowers);
    return unFollowers;
}

async function getGhostfollowers(followings, followers)
{
    console.log("Ghost_Followers");
    let Ghost_Followers = [];
    for(let i in followers)
    {
        let person = followers[i].userName;
        let personlink = followers[i].userUrl;
        if(find(person, followings) == -1)
        {
            Ghost_Followers.push(personlink);
        }
    }
    console.log(Ghost_Followers);
    return Ghost_Followers;
}

async function Unfollow(url, tab)
{
    await tab.goto(url);
    await tab.waitForSelector("._5f5mN.-fzfL._6VtSN.yZn4P", {visible: true});
    await tab.click("._5f5mN.-fzfL._6VtSN.yZn4P");
    await tab.waitForSelector(".aOOlW.-Cab_", {visible: true});
    await tab.click(".aOOlW.-Cab_");
}

async function Follow(url, tab)
{
    await tab.goto(url);
    await tab.waitForSelector("._5f5mN.jIbKX._6VtSN.yZn4P", {visible: true});
    await tab.click("._5f5mN.jIbKX._6VtSN.yZn4P");
}

find = (name, ar)=>{
    for(let i = 0; i < ar.length; i++)
    {
        if(ar[i].userName === name)
            return i;
    }
    return -1;
}

async function main(){
    let browser = await pup.launch({
        headless : false,
        defaultViewport : false,
        // args : ["--start-maximized"]
    });
    let pages = await browser.pages();
    let tab = pages[0];

    await tab.goto("https://www.instagram.com");

    await login(tab);
    
    await gotoProfile(tab);

    let followers = await getFollowers(tab);
    await clickonCrossButton(tab);
    let followings = await getFollowings(tab);

    let unFollowers = await getUnfollowers(followings, followers);
    let Ghost_Followers = await getGhostfollowers(followings, followers);
    
    console.log("Unfollowing Unfollowers");
    for(let url of unFollowers)
    {
        await Unfollow(url, await browser.newPage());
    }

    console.log("Following Ghost-Followers");
    for(let url of Ghost_Followers)
    {
        await Follow(url, await browser.newPage());
    }
}

main();