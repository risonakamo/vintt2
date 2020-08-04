import fs from "fs-extra";
import psList from "ps-list";
import _ from "lodash";
import NanoTimer from "nanotimer";
import log from "log-update";
import stripIndent from "strip-indent";

async function main()
{
    var foundProgram:FoundProgramResult=await watchPrograms(getConfiguration());
    timeProgram(foundProgram);
}

// retrieve vintt configuration
function getConfiguration():VinttConfiguration
{
    var config:VinttConfiguration=fs.readJsonSync(
        "config/vintt-config.json",{throws:false});

    if (!config)
    {
        console.log("failed to load configuration");
        return {};
    }

    return config;
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
        },1500);
    });
}

// begin timing a program. displays on screen various timing information and about
// the currently running program. writes to file on the program.
function timeProgram(program:FoundProgramResult):void
{
    var timer:NanoTimer=new NanoTimer();
    var currentMinutes:number=0;

    log(stripIndent(`
        ${program.name}
        Current Session: ${durationConvert(currentMinutes)}
        Total Time: 2.1 hours
    `));

    timer.setInterval(()=>{
        currentMinutes+=1;

        log(stripIndent(`
            ${program.name}
            Current Session: ${durationConvert(currentMinutes)}
            Total Time: 2.1 hours
        `));
    },"","1s");
}

// given a number of minutes, convert into a duration string with the
// word "minutes" or "hours" if it is over 60 minutes
function durationConvert(minutes:number):string
{
    if (minutes<=60)
    {
        return `${minutes} minutes`;
    }

    return `${parseFloat((minutes/60).toFixed(2))} hours`;
}

main();