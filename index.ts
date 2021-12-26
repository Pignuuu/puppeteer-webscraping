console.clear();
try {
  require("asciiart-logo");
  require("bug-killer");
  require("commander");
  require("console-clear");
  require("m3u8stream");
  require("puppeteer");
  require("randomstring");
  require("timer-node");
  require("fs");
  require("twitch-m3u8");
  require("axios");
} catch (error) {
  console.log(
    "\x1b[31m%s",
    "\n\nPlease install the required dependencies by running npm install. Exiting...\n\n"
  );

  process.exit(1);
}
const fs = require("fs");
const puppeteer = require("puppeteer");
const m3u8stream = require("m3u8stream");
const randomstring = require("randomstring");
const logo = require("asciiart-logo");
const Logger = require("bug-killer");
const m3u8Info = require("twitch-m3u8");
const axios = require("axios");
const clear = require("console-clear");

// Set configuration for Logger(bug-killer) node module
Logger.config = {
  // The error type
  error: {
    color: [192, 57, 43],
    text: "error",
    level: 1,
  },
  // The warning type
  warn: {
    color: [241, 196, 15],
    text: "warn ",
    level: 2,
  },
  // The info type
  info: {
    color: [52, 152, 219],
    text: "info ",
    level: 3,
  },
  action: {
    color: [88, 232, 95],
    text: "action ",
    level: 3,
  },
  // Display date
  date: false,
  // Log level
  level: 4,
  // Output stream
  stream: process.stdout,
  // The options passed to `util.inspect`
  inspectOptions: { colors: true },
};

// Generate a random string for the file name
const filename = randomstring.generate({
  length: 10,
  charset: "hex",
});
import { Command } from "commander";
import { Timer } from "timer-node";
const program = new Command();

let user;
let rerunEnable;
let category;
let maxSize;
let link;
let loopProgram;

const timer = new Timer({ label: "main-timer" });
const recording_timer = new Timer({ label: "recording-timer" });
timer.start();

const printLogo = () => {
  console.log(
    logo({
      name: "TwitchRec",
      font: "Chunky",
      lineChars: 10,
      padding: 2,
      margin: 3,
    })
      .emptyLine()
      .right("V2.3.6")
      .emptyLine()
      .center(
        'Twitch recording software. Developed by Pignuuu. "--help" for options'
      )
      .center("https://stianwiu.me")
      .render()
  );
};

printLogo();
program.requiredOption("-u, --user <string>", "Twitch username");
program.option("-r, --rerun <boolean>", "Record reruns [Optional]");
program.option(
  "-c, --category <string>",
  "Only record certain category [Optional]"
);
program.option("-m, --max <num>", "How many GB file can become [Optional]");
program.option(
  "-l, --loop <boolean>",
  "Weather program should infinately loop when stream is over [Optional]"
);

program.parse(process.argv);
const options = program.opts();

const checkConfiguration = () => {
  user = options.user.toLowerCase();
  if (options.rerun == "false") {
    rerunEnable = false;
  } else {
    rerunEnable = true;
  }
  if (options.category) {
    category = options.category.toLowerCase();
  } else {
    category = undefined;
  }
  if (options.max) {
    maxSize = Number(options.max);
  } else {
    maxSize = undefined;
  }
  if (options.loop == "true") {
    loopProgram = true;
  } else {
    loopProgram = false;
  }
};
checkConfiguration();
const startProcess = async () => {
  Logger.log("Loading please wait...", "info");
  const browser = await puppeteer.launch({
    // headless: false,
    args: ["--no-sandbox"],
    defaultViewport: {
      width: 1920,
      height: 1080,
    },
  });
  const page = await browser.newPage();
  await page.goto(`https://www.twitch.tv/${user}`);
  // Use puppeteer to check if user exists
  const checkIfUserExists = async () => {
    try {
      await page.waitForSelector(
        "#root > div > div.Layout-sc-nxg1ff-0.ldZtqr > div.Layout-sc-nxg1ff-0.iLYUfX > main > div.root-scrollable.scrollable-area > div.simplebar-scroll-content > div > div > div > div > div.Layout-sc-nxg1ff-0.bDMqsP.core-error__message-container > p",
        { timeout: 3000 }
      );
      return false;
    } catch (error) {
      return true;
    }
  };
  // Use puppeteer to check if specified user is streaming
  const checkIfUserIsLive = async () => {
    try {
      await page.waitForSelector(
        "#root > div > div.Layout-sc-nxg1ff-0.ldZtqr > div.Layout-sc-nxg1ff-0.iLYUfX > main > div.root-scrollable.scrollable-area.scrollable-area--suppress-scroll-x > div.simplebar-scroll-content > div > div > div.channel-root.channel-root--watch-chat.channel-root--live.channel-root--watch.channel-root--unanimated > div.Layout-sc-nxg1ff-0.bDMqsP.channel-root__main--with-chat > div.channel-root__info.channel-root__info--with-chat > div > div.Layout-sc-nxg1ff-0.jLilpG > div > div > div > div.Layout-sc-nxg1ff-0.iMHulU > div > div > div > a > div.Layout-sc-nxg1ff-0.ScHaloIndicator-sc-1l14b0i-1.dKzslu.tw-halo__indicator > div > div > div",
        { timeout: 3000 }
      );
      return true;
    } catch (error) {
      return false;
    }
  };

  // Use puppeteer to check if specified user is streaming a rerun
  const checkIfStreamIsRerun = async () => {
    try {
      await page.waitForSelector(
        "#root > div > div.Layout-sc-nxg1ff-0.ldZtqr > div.Layout-sc-nxg1ff-0.iLYUfX > main > div.root-scrollable.scrollable-area.scrollable-area--suppress-scroll-x > div.simplebar-scroll-content > div > div > div.channel-root.channel-root--watch-chat.channel-root--live.channel-root--watch.channel-root--unanimated > div.Layout-sc-nxg1ff-0.bDMqsP.channel-root__main--with-chat > div.channel-root__info.channel-root__info--with-chat > div > div.Layout-sc-nxg1ff-0.jLilpG > div > div.Layout-sc-nxg1ff-0.hMFNaU.metadata-layout__split-top > div.Layout-sc-nxg1ff-0 > div > div > div > div > div > a > span",
        { timeout: 3000 }
      );
      return true;
    } catch (error) {
      return false;
    }
  };

  // Check if program is supposed to record a rerun, if not program will wait until stream is truly live
  const checkIfRecordRerun = async () => {
    if (rerunEnable == false && (await checkIfStreamIsRerun()) == true) {
      return false;
    } else {
      return true;
    }
  };
  // Use puppeteer to click "Chat" button to open actual stream in case streamear is offline. If this doesn't happen program won't work.
  const clickChatButton = async () => {
    try {
      await page.waitForSelector(
        "#root > div > div.Layout-sc-nxg1ff-0.ldZtqr > div.Layout-sc-nxg1ff-0.iLYUfX > main > div.root-scrollable.scrollable-area > div.simplebar-scroll-content > div > div > div.channel-root.channel-root--home.channel-root--unanimated > div.Layout-sc-nxg1ff-0.bDMqsP > div.channel-root__info.channel-root__info--offline.channel-root__info--home > div > div.Layout-sc-nxg1ff-0.bPMozh.home-header-sticky > div.Layout-sc-nxg1ff-0.Bza-dv > div > div > ul > li:nth-child(5) > a > div > div.ScTextWrapper-sc-18v7095-1.eFGtCR > div",
        { timeout: 3000 }
      );
      await page.click(
        "#root > div > div.Layout-sc-nxg1ff-0.ldZtqr > div.Layout-sc-nxg1ff-0.iLYUfX > main > div.root-scrollable.scrollable-area > div.simplebar-scroll-content > div > div > div.channel-root.channel-root--home.channel-root--unanimated > div.Layout-sc-nxg1ff-0.bDMqsP > div.channel-root__info.channel-root__info--offline.channel-root__info--home > div > div.Layout-sc-nxg1ff-0.bPMozh.home-header-sticky > div.Layout-sc-nxg1ff-0.Bza-dv > div > div > ul > li:nth-child(5) > a > div > div.ScTextWrapper-sc-18v7095-1.eFGtCR > div"
      );
      Logger.log("Clicked 'Chat' button", "action");
    } catch (err) {}
  };
  await clickChatButton();

  // Get current recording's file size in gigabytes
  const getFileSizeGb = async () => {
    var stats = fs.statSync(`videos/${user}/${user}-${filename}.mp4`);
    var fileSizeInBytes = stats.size;
    var fileSizeInMegabytes = fileSizeInBytes / (1024 * 1024);
    var fileSizeInGigabytes = fileSizeInMegabytes * 0.001;
    return fileSizeInGigabytes.toString().substring(0, 6);
  };

  // Check if category is same as specified by user
  const checkCategory = async () => {
    if (category == undefined) {
      return true;
    }
    let value1;
    let value2;
    try {
      let element1 = await page.$(
        "#root > div > div.Layout-sc-nxg1ff-0.ldZtqr > div.Layout-sc-nxg1ff-0.iLYUfX > main > div.root-scrollable.scrollable-area.scrollable-area--suppress-scroll-x > div.simplebar-scroll-content > div > div > div.channel-root.channel-root--watch-chat.channel-root--live.channel-root--watch.channel-root--unanimated > div.Layout-sc-nxg1ff-0.bDMqsP.channel-root__main--with-chat > div.channel-root__info.channel-root__info--with-chat > div > div.Layout-sc-nxg1ff-0.jLilpG > div > div > div > div.Layout-sc-nxg1ff-0.iMexhI > div.Layout-sc-nxg1ff-0.dglwHV > div.Layout-sc-nxg1ff-0.kBOtQI > div > div:nth-child(2) > div > div > div.Layout-sc-nxg1ff-0.ftYIWt > a > span"
      );
      value1 = await page.evaluate((el) => el.textContent, element1);
      value1 = value1.toLowerCase();
    } catch (err) {}
    if (value1 == category) {
      return true;
    }
    try {
      let element2 = await page.$(
        "#root > div > div.Layout-sc-nxg1ff-0.ldZtqr > div.Layout-sc-nxg1ff-0.iLYUfX > main > div.root-scrollable.scrollable-area.scrollable-area--suppress-scroll-x > div.simplebar-scroll-content > div > div > div.channel-root.channel-root--watch-chat.channel-root--live.channel-root--watch.channel-root--unanimated > div.Layout-sc-nxg1ff-0.bDMqsP.channel-root__main--with-chat > div.channel-root__info.channel-root__info--with-chat > div > div.Layout-sc-nxg1ff-0.jLilpG > div > div.Layout-sc-nxg1ff-0.hMFNaU.metadata-layout__split-top > div.Layout-sc-nxg1ff-0 > div > div > div > div > div > a > span"
      );
      value2 = await page.evaluate((el) => el.textContent, element2);
      value2 = value2.toLowerCase();
    } catch (err) {}
    if (value2 == category) {
      return true;
    } else {
      return false;
    }
  };

  // Check if stream is live
  async function checkM3u8StreamUrl(url) {
    try {
      await axios.head(url);
      return true;
    } catch (err) {
      return false;
    }
  }

  //Print recording progress to console.
  const recordingProgress = async () => {
    console.log(
      logo({
        name: "TwitchRec",
        font: "Chunky",
        lineChars: 10,
        padding: 2,
        margin: 3,
      })
        .emptyLine()
        .left(`User: ${user}`)
        .emptyLine()
        .left(`Filesize: ${await getFileSizeGb()} GB`)
        .left(`Running for: ${timer.format("D:%d H:%h M:%m S:%s")}`)
        .left(`Recording: ${recording_timer.format("D:%d H:%h M:%m S:%s")}`)
        .left(`Rerun: ${await checkIfStreamIsRerun()}`)
        .emptyLine(`${clear()}`)
        .center("Twitch recording software. Developed by Pignuuu.")
        .center("https://stianwiu.me")
        .render()
    );
  };

  const startRecording = async () => {
    // Make sure ./videos folder exists. If not, create it.
    if (!(await fs.existsSync(`./videos`))) {
      await fs.mkdirSync(`./videos`);
    }

    Logger.log("Getting raw stream url", "info");
    await m3u8Info
      .getStream(user)
      .then((data) => {
        link = data[0].url;
      })
      .catch((err) => console.error(err));

    Logger.log("Recording started", "action");
    recording_timer.start();
    if (!(await fs.existsSync(`./videos/${user}`))) {
      await fs.mkdirSync(`./videos/${user}`);
    }
    const stream = await m3u8stream(link).pipe(
      fs.createWriteStream(`videos/${user}/${user}-${filename}.mp4`)
    );
    await new Promise((resolve) => setTimeout(resolve, 5000));
    await recordingProgress();
    let finishedRecording = false;
    while (
      (await checkM3u8StreamUrl(link)) == true &&
      finishedRecording == false
    ) {
      await recordingProgress();
      if ((await checkCategory()) == false) {
        stream.end();
        finishedRecording = true;
        Logger.log("Stream has chagned category", "info");
      }
      if ((await getFileSizeGb()) > maxSize && maxSize != undefined) {
        stream.end();
        finishedRecording = true;
        Logger.log("Max file size reached", "info");
      }
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  };

  (async () => {
    if (await checkIfUserExists()) {
      Logger.log("User exists", "info");
      Logger.log(
        "Recording will start when user goes live or starts a rerun",
        "info"
      );
      while (loopProgram == true) {
        while (
          (await checkIfUserIsLive()) == false ||
          (await checkIfRecordRerun()) == false ||
          (await checkCategory()) == false
        ) {
          await new Promise((resolve) => setTimeout(resolve, 5000));
        }
        await startRecording();
        await printLogo();
        Logger.log(
          `Your file is ready. File: ./${user}/${user}-${filename}.mp4`,
          "info"
        );
        timer.stop();
        Logger.log(`Final file size: ${await getFileSizeGb()} GB`, "info");
        Logger.log(
          timer.format("Entire process took D:%d H:%h M:%m S:%s"),
          "info"
        );
        Logger.log(
          recording_timer.format("Recorded for D:%d H:%h M:%m S:%s\n"),
          "info"
        );
        Logger.log("Waiting for stream to start again", "info");
        await page.reload({ waitUntil: ["networkidle0", "domcontentloaded"] });
        await clickChatButton();
      }
      if (loopProgram == false) {
        while (
          (await checkIfUserIsLive()) == false ||
          (await checkIfRecordRerun()) == false ||
          (await checkCategory()) == false
        ) {
          await new Promise((resolve) => setTimeout(resolve, 5000));
        }
        await startRecording();
        await printLogo();
        Logger.log(
          `Your file is ready. File: ./${user}/${user}-${filename}.mp4`,
          "info"
        );
        timer.stop();
        Logger.log(`Final file size: ${await getFileSizeGb()} GB`, "info");
        Logger.log(
          timer.format("Entire process took D:%d H:%h M:%m S:%s"),
          "info"
        );
        Logger.log(
          recording_timer.format("Recorded for D:%d H:%h M:%m S:%s"),
          "info"
        );
      }
      process.exit();
    } else {
      Logger.log("User does not exist", "action");
      process.exit();
    }
  })();
};

startProcess();
