"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
console.clear();
var logo = require("asciiart-logo");
var printLogo = function () {
    console.log(logo({
        name: "Pignuuu",
        font: "Chunky",
        lineChars: 10,
        padding: 2,
        margin: 3
    })
        .emptyLine()
        .right("V1.2.2")
        .emptyLine()
        .center('Twitch recording software. Developed by Pignuuu. "--help" for options')
        .render());
};
printLogo();
var commander_1 = require("commander");
var timer_node_1 = require("timer-node");
var program = new commander_1.Command();
var randomstring = require("randomstring");
var nrc = require("node-run-cmd");
var _a = require("puppeteer-stream"), launch = _a.launch, getStream = _a.getStream;
var fs = require("fs");
// Add options for command
var noUserSpecified = function () {
    console.log("Missing argument -u or --user");
    process.exit();
};
var noOsSpecified = function () {
    console.log("Missing argument -w or --windows");
    process.exit();
};
program.option("-u, --user <username>", "Twitch user to record [Required]");
program.option("-w, --windows <boolean>", "Using windows true or false [Required]");
program.option("-f, --frames <num>", "How many fps to export to [Optinal]");
program.option("-t, --threads <num>", "How many threads to use when encoding [Optinal]");
program.option("-r, --rerun <boolean>", "Record reruns [Optinal]");
program.option("-d, --delete <boolean>", "Delete temp file [Optinal]");
program.parse(process.argv);
var options = program.opts();
var windows = undefined;
var fps = undefined;
var threads = undefined;
var rerunStream = undefined;
var rerunEnable = undefined;
var tempDelete = undefined;
var getTime = function () {
    var date_ob = new Date();
    var date = ("0" + date_ob.getDate()).slice(-2);
    // current month
    var month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    // current year
    var year = date_ob.getFullYear();
    // current hours
    var hours = date_ob.getHours();
    // current minutes
    var minutes = date_ob.getMinutes();
    // current seconds
    var seconds = date_ob.getSeconds();
    console.log(year +
        "-" +
        month +
        "-" +
        date +
        " " +
        hours +
        ":" +
        minutes +
        ":" +
        seconds);
};
var checkConfiguration = function () {
    if (options.user) {
        if (options.windows == "true" || options.windows == "false") {
            if (options.windows == "true") {
                windows = true;
            }
            else {
                windows = false;
            }
            if (options.rerun == "false") {
                rerunEnable = false;
            }
            else {
                rerunEnable = true;
            }
            if (options["delete"] == "false") {
                tempDelete = false;
            }
            else {
                tempDelete = true;
            }
            if (options.frames) {
                fps = options.frames;
            }
            else {
                fps = 24;
            }
            if (options.threads) {
                threads = options.threads;
            }
            else {
                threads = 1;
            }
        }
        else
            noOsSpecified();
    }
    else
        noUserSpecified();
};
checkConfiguration();
var filename = randomstring.generate({
    length: 10,
    charset: "hex"
});
function startRecording() {
    return __awaiter(this, void 0, void 0, function () {
        var timer, recording_timer, browser, page, originalUrl, checkIfLive, checkIfRerun, checkContinueWithRerun, _a, _b, _c, err_1, file, stream;
        var _this = this;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    timer = new timer_node_1.Timer({ label: "main-timer" });
                    recording_timer = new timer_node_1.Timer({ label: "recording-timer" });
                    timer.start();
                    browser = undefined;
                    if (!(windows == true)) return [3 /*break*/, 2];
                    return [4 /*yield*/, launch({
                            executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe ",
                            defaultViewport: {
                                width: 1920,
                                height: 1080
                            }
                        })];
                case 1:
                    browser = _d.sent();
                    return [3 /*break*/, 4];
                case 2: return [4 /*yield*/, launch({
                        executablePath: "/usr/bin/google-chrome-stable",
                        defaultViewport: {
                            width: 1024,
                            height: 768
                        }
                    })];
                case 3:
                    browser = _d.sent();
                    _d.label = 4;
                case 4:
                    console.log("Opening browser.");
                    return [4 /*yield*/, browser.newPage()];
                case 5:
                    page = _d.sent();
                    console.log("Opening twitch stream");
                    return [4 /*yield*/, page.goto("https://www.twitch.tv/" + options.user)];
                case 6:
                    _d.sent();
                    originalUrl = page.url();
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 2000); })];
                case 7:
                    _d.sent();
                    checkIfLive = function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, page.$("#root > div > div.Layout-sc-nxg1ff-0.ldZtqr > div.Layout-sc-nxg1ff-0.iLYUfX > main > div.root-scrollable.scrollable-area.scrollable-area--suppress-scroll-x > div.simplebar-scroll-content > div > div > div.channel-root.channel-root--watch-chat.channel-root--live.channel-root--watch.channel-root--unanimated > div.Layout-sc-nxg1ff-0.bDMqsP.channel-root__main--with-chat > div.channel-root__info.channel-root__info--with-chat > div > div.Layout-sc-nxg1ff-0.jLilpG > div > div > div > div.Layout-sc-nxg1ff-0.iMHulU > div > div > div > a > div.Layout-sc-nxg1ff-0.ScHaloIndicator-sc-1l14b0i-1.dKzslu.tw-halo__indicator > div > div > div")];
                                case 1:
                                    if ((_a.sent()) !== null)
                                        return [2 /*return*/, true];
                                    else
                                        return [2 /*return*/, false];
                                    return [2 /*return*/];
                            }
                        });
                    }); };
                    checkIfRerun = function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, page.$("#root > div > div.Layout-sc-nxg1ff-0.ldZtqr > div.Layout-sc-nxg1ff-0.iLYUfX > main > div.root-scrollable.scrollable-area.scrollable-area--suppress-scroll-x > div.simplebar-scroll-content > div > div > div.channel-root.channel-root--watch-chat.channel-root--live.channel-root--watch.channel-root--unanimated > div.Layout-sc-nxg1ff-0.bDMqsP.channel-root__main--with-chat > div.channel-root__info.channel-root__info--with-chat > div > div.Layout-sc-nxg1ff-0.jLilpG > div > div > div > div.Layout-sc-nxg1ff-0.iMexhI > div.Layout-sc-nxg1ff-0.dglwHV > div.Layout-sc-nxg1ff-0.kBOtQI > div > div:nth-child(2) > div > div > div.Layout-sc-nxg1ff-0.ftYIWt > a > span")];
                                case 1:
                                    if ((_a.sent()) !== null)
                                        return [2 /*return*/, false];
                                    else
                                        return [2 /*return*/, true];
                                    return [2 /*return*/];
                            }
                        });
                    }); };
                    console.log("Waiting for page to load");
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 5000); })];
                case 8:
                    _d.sent();
                    console.log("Checking if streamer is live");
                    return [4 /*yield*/, checkIfLive()];
                case 9:
                    if ((_d.sent()) == false) {
                        console.log("Streamer is not live");
                    }
                    checkContinueWithRerun = function () { return __awaiter(_this, void 0, void 0, function () {
                        var _a;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    _a = rerunEnable == false;
                                    if (!_a) return [3 /*break*/, 2];
                                    return [4 /*yield*/, checkIfRerun()];
                                case 1:
                                    _a = (_b.sent()) == true;
                                    _b.label = 2;
                                case 2:
                                    if (_a) {
                                        return [2 /*return*/, false];
                                    }
                                    else {
                                        return [2 /*return*/, true];
                                    }
                                    return [2 /*return*/];
                            }
                        });
                    }); };
                    _d.label = 10;
                case 10: return [4 /*yield*/, checkIfLive()];
                case 11:
                    _a = (_d.sent()) == false;
                    if (_a) return [3 /*break*/, 13];
                    return [4 /*yield*/, checkContinueWithRerun()];
                case 12:
                    _a = (_d.sent()) == false;
                    _d.label = 13;
                case 13:
                    if (!_a) return [3 /*break*/, 16];
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 60000); })];
                case 14:
                    _d.sent();
                    return [4 /*yield*/, page.reload({ waitUntil: ["networkidle0", "domcontentloaded"] })];
                case 15:
                    _d.sent();
                    return [3 /*break*/, 10];
                case 16:
                    console.log("Checking if stream is a rerun");
                    return [4 /*yield*/, checkIfRerun()];
                case 17:
                    if ((_d.sent()) == true) {
                        console.log("This stream is a rerun");
                        rerunStream = true;
                    }
                    else {
                        rerunStream = false;
                    }
                    console.log("Reloading webpage");
                    return [4 /*yield*/, page.reload({ waitUntil: ["networkidle0", "domcontentloaded"] })];
                case 18:
                    _d.sent();
                    console.log("Fullscreening stream");
                    return [4 /*yield*/, page.keyboard.press("f")];
                case 19:
                    _d.sent();
                    console.log("Checking if stream is agerestricted");
                    _d.label = 20;
                case 20:
                    _d.trys.push([20, 23, , 24]);
                    _c = (_b = Promise).all;
                    return [4 /*yield*/, page.click("#root > div > div.Layout-sc-nxg1ff-0.ldZtqr > div.Layout-sc-nxg1ff-0.iLYUfX > main > div.root-scrollable.scrollable-area.scrollable-area--suppress-scroll-x > div.simplebar-scroll-content > div > div > div.InjectLayout-sc-588ddc-0.persistent-player > div > div.Layout-sc-nxg1ff-0.video-player > div > div > div > div > div.Layout-sc-nxg1ff-0.krOuYh.player-overlay-background.player-overlay-background--darkness-0.content-overlay-gate > div > div.Layout-sc-nxg1ff-0.bzQnIQ.content-overlay-gate__allow-pointers > button")];
                case 21: return [4 /*yield*/, _c.apply(_b, [[
                            _d.sent()
                        ]])];
                case 22:
                    _d.sent();
                    console.log('Stream is agerestricted\nClicked "Start Watching" button');
                    return [3 /*break*/, 24];
                case 23:
                    err_1 = _d.sent();
                    console.log("Stream is not agerestricted");
                    return [3 /*break*/, 24];
                case 24:
                    file = fs.createWriteStream("./videos/" + options.user + "-" + filename + ".webm");
                    return [4 /*yield*/, getStream(page, { audio: true, video: true })];
                case 25:
                    stream = _d.sent();
                    recording_timer.start();
                    console.log("Now recording");
                    getTime();
                    console.log("Recording will stop when:\nStreamer goes offline / Streamer raids different stream / Streamer starts a rerun");
                    stream.pipe(file);
                    _d.label = 26;
                case 26: return [4 /*yield*/, checkIfLive()];
                case 27:
                    if (!((_d.sent()) == true)) return [3 /*break*/, 30];
                    if (originalUrl != page.url()) {
                        console.log("Stopping recording because streamer raided someone else");
                        return [3 /*break*/, 30];
                    }
                    return [4 /*yield*/, checkIfRerun()];
                case 28:
                    if ((_d.sent()) == true && rerunStream == false) {
                        console.log("Stream is a rerun");
                        return [3 /*break*/, 30];
                    }
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 15000); })];
                case 29:
                    _d.sent();
                    return [3 /*break*/, 26];
                case 30: return [4 /*yield*/, stream.destroy()];
                case 31:
                    _d.sent();
                    stream.on("end", function () { });
                    recording_timer.stop();
                    console.log("Closing browser");
                    return [4 /*yield*/, browser.close()];
                case 32:
                    _d.sent();
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 2500); })];
                case 33:
                    _d.sent();
                    console.log("FFmpeg encoding starting now.\nFps set to " + fps + "\nEncoding using " + threads + " threads\n");
                    if (!(windows == true)) return [3 /*break*/, 35];
                    return [4 /*yield*/, nrc.run("ffmpeg.exe -i videos/" + options.user + "-" + filename + ".webm -threads " + threads + " -r " + fps + " -c:v libx264 -crf 20 -preset fast videos/" + options.user + "-" + filename + ".mp4")];
                case 34:
                    _d.sent();
                    return [3 /*break*/, 37];
                case 35: return [4 /*yield*/, nrc.run("ffmpeg -i videos/" + options.user + "-" + filename + ".webm -threads " + threads + " -r " + fps + " -c:v libx264 -crf 20 -preset fast videos/" + options.user + "-" + filename + ".mp4")];
                case 36:
                    _d.sent();
                    _d.label = 37;
                case 37:
                    if (!(tempDelete == true)) return [3 /*break*/, 39];
                    console.log("Encoding has finished.\nDeleting temporary stream file.");
                    return [4 /*yield*/, fs.unlinkSync("./videos/" + options.user + "-" + filename + ".webm")];
                case 38:
                    _d.sent();
                    _d.label = 39;
                case 39: return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 2500); })];
                case 40:
                    _d.sent();
                    console.clear();
                    return [4 /*yield*/, printLogo()];
                case 41:
                    _d.sent();
                    console.log("\n\nYour file is ready. File:" + options.user + "-" + filename + ".mp4\n ");
                    timer.stop();
                    console.log(timer.format("Entire process took D:%d H:%h M:%m S:%s"));
                    console.log(recording_timer.format("Recorded for D:%d H:%h M:%m S:%s"));
                    process.exit();
                    return [2 /*return*/];
            }
        });
    });
}
startRecording();
