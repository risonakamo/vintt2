import fs from "fs-extra";
import psList from "ps-list";
import _ from "lodash";
import NanoTimer from "nanotimer";
import log from "log-update";
import stripIndent from "strip-indent";
import keypress from "keypress";
import chalk from "chalk";

const _configPath=`${__dirname}/../config/vintt-config.json`;
const _programTimesPath=`${__dirname}/../config/times.json`;

keypress(process.stdin);

async function main()
{
    setQuitKeys();
    var foundProgram:FoundProgramResult=await watchPrograms(getConfiguration());
    timeProgram(foundProgram);
}

// retrieve vintt configuration
function getConfiguration():VinttConfiguration
{
    var config:VinttConfiguration=fs.readJsonSync(_configPath,{throws:false});

    if (!config)
    {
        console.log("failed to load configuration");
        return {};
    }

    return config;
}

// get the saved program times
function getProgramTimes():ProgramTimes
{
    var programtimes:ProgramTimes|undefined=fs.readJsonSync(
        _programTimesPath,{throws:false});

    if (!programtimes)
    {
        console.log("unable to read program times");
        return {};
    }

    return programtimes;
}

// watches for a program. returns when it found something.
async function watchPrograms(config:VinttConfiguration):Promise<FoundProgramResult>
{
    return new Promise((resolve)=>{
        log("watching...");
        var exeNames:Set<string>=new Set(Object.keys(config));
        var interval=setInterval(async ()=>{
            var foundProgram:ProcessDescriptor|undefined=_.find(await psList(),
            (x:ProcessDescriptor)=>{
                return exeNames.has(x.name);
            });

            if (foundProgram)
            {
                resolve({
                    exe:foundProgram.name,
                    name:config[foundProgram.name]
                });

                clearInterval(interval);
            }
        },1000);
    });
}

// begin timing a program. displays on screen various timing information and about
// the currently running program. writes to file on the program.
async function timeProgram(program:FoundProgramResult):Promise<void>
{
    var timer:NanoTimer=new NanoTimer();
    var currentMinutes:number=0;
    var totalMinutes:number=await writeProgramTimes(program.name,0);

    log.clear();

    printProgramStatus(program.name,currentMinutes,totalMinutes);

    timer.setInterval(async ()=>{
        currentMinutes+=1;
        totalMinutes=await writeProgramTimes(program.name,1);
        printProgramStatus(program.name,currentMinutes,totalMinutes);
    },"","60s");
}

// given a number of minutes, convert into a duration string with the
// word "minutes" or "hours" if it is over 60 minutes
function durationConvert(minutes:number):string
{
    if (minutes<=60)
    {
        return `${chalk.yellow(minutes)} minutes`;
    }

    return `${chalk.yellow(parseFloat((minutes/60).toFixed(1)))} hours`;
}

// given the name of a program and a number of minute, add that number of
// minutes to the saved program time file, writing to disk in the process.
// returns the new total number of minutes of that targetted program.
async function writeProgramTimes(name:string,minutes:number):Promise<number>
{
    var programtimes:ProgramTimes=await getProgramTimes();

    if (!programtimes[name])
    {
        programtimes[name]=0;
    }

    programtimes[name]+=minutes;

    fs.writeJson(_programTimesPath,programtimes);

    return programtimes[name];
}

// set enter button keycontrol to quit program
function setQuitKeys():void
{
    process.stdin.on("keypress",(ch,key)=>{
        if (key.name=="return" || key.name=="enter" ||
            key.name=="q" || key.name=="c")
        {
            process.exit();
        }
    });

    process.stdin.setRawMode(true);
    process.stdin.resume();
}

// print out the running program, current and total time
function printProgramStatus(program:string,currentMinutes:number,
    totalMinutes:number):void
{
    log(stripIndent(`
        ${chalk.yellowBright(program)}
        Current Session: ${durationConvert(currentMinutes)}
        Total Time: ${durationConvert(totalMinutes)}
    `).trim());
}

main();